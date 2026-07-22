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
  "Mozilla/5.0 (compatible; DistillBot/1.0; +https://github.com/olaniyiakanji/distill)";

export async function extractArticle(url: string): Promise<ExtractedArticle> {
  const parsed = new URL(url);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are supported.");
  }

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*" },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch article (${res.status} ${res.statusText}).`);
  }

  const html = await res.text();
  const dom = new JSDOM(html, { url });
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
