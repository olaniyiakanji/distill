import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export type ExtractedArticle = {
  title: string;
  author: string | null;
  siteName: string | null;
  content: string;
  excerpt: string | null;
  textContent: string;
  wordCount: number;
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent": USER_AGENT,
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
};

export async function extractArticle(url: string): Promise<ExtractedArticle> {
  const target = unwrapKnownRedirect(url);
  const parsed = new URL(target);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are supported.");
  }

  const res = await fetch(target, {
    headers: BROWSER_HEADERS,
    redirect: "follow",
  });

  if (!res.ok) {
    if (res.status === 403 || res.status === 401) {
      throw new Error(
        `The site blocked our request (${res.status}). Some publishers (paywalled or bot-shielded) can't be saved.`
      );
    }
    if (res.status === 404) {
      throw new Error("That URL wasn't found (404). Check for typos or a moved page.");
    }
    throw new Error(`Couldn't fetch the article (${res.status} ${res.statusText}).`);
  }

  const html = await res.text();
  const dom = new JSDOM(html, { url: target });
  const reader = new Readability(dom.window.document);
  const parsedDoc = reader.parse();

  if (!parsedDoc || !parsedDoc.content) {
    throw new Error("Could not extract readable content from this URL.");
  }

  const wordCount = (parsedDoc.textContent || "").trim().split(/\s+/).filter(Boolean).length;

  return {
    title: parsedDoc.title?.trim() || parsed.hostname,
    author: parsedDoc.byline?.trim() || null,
    siteName: parsedDoc.siteName?.trim() || parsed.hostname,
    content: parsedDoc.content,
    excerpt: parsedDoc.excerpt?.trim() || null,
    textContent: parsedDoc.textContent || "",
    wordCount,
  };
}

function unwrapKnownRedirect(input: string): string {
  let u: URL;
  try {
    u = new URL(input);
  } catch {
    return input;
  }

  const host = u.hostname.toLowerCase();

  // Bing search redirects: /ck/a?...&u=a1<base64url-of-target>
  if (host.endsWith("bing.com") && u.pathname.startsWith("/ck/")) {
    const raw = u.searchParams.get("u");
    if (raw) {
      const encoded = raw.startsWith("a1") ? raw.slice(2) : raw;
      const decoded = tryBase64UrlDecode(encoded);
      if (decoded && /^https?:\/\//i.test(decoded)) return decoded;
    }
  }

  // Google search redirects: /url?q=<target>
  if ((host === "www.google.com" || host === "google.com") && u.pathname === "/url") {
    const target = u.searchParams.get("q") ?? u.searchParams.get("url");
    if (target && /^https?:\/\//i.test(target)) return target;
  }

  // DuckDuckGo redirects: /l/?uddg=<encoded>
  if (host.endsWith("duckduckgo.com") && u.pathname.startsWith("/l/")) {
    const target = u.searchParams.get("uddg");
    if (target) {
      try {
        const decoded = decodeURIComponent(target);
        if (/^https?:\/\//i.test(decoded)) return decoded;
      } catch {
        /* fall through */
      }
    }
  }

  return input;
}

function tryBase64UrlDecode(s: string): string | null {
  try {
    const normalized = s.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return Buffer.from(padded, "base64").toString("utf-8");
  } catch {
    return null;
  }
}
