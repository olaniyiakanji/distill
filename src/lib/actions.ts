"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { articles } from "./schema";
import { extractArticle } from "./extract";
import { distill } from "./ai";

export type SaveResult = { ok: true; id: string } | { ok: false; error: string };

export async function saveArticle(formData: FormData): Promise<SaveResult> {
  const url = String(formData.get("url") ?? "").trim();
  if (!url) return { ok: false, error: "Please enter a URL." };

  let normalized: string;
  try {
    normalized = new URL(url).toString();
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }

  try {
    const extracted = await extractArticle(normalized);

    let summary: string | null = null;
    let tags: string[] = [];
    try {
      const ai = await distill(extracted.title, extracted.textContent);
      summary = ai.summary;
      tags = ai.tags;
    } catch (err) {
      console.error("[distill] AI step failed:", err);
    }

    const [row] = await db
      .insert(articles)
      .values({
        url: normalized,
        title: extracted.title,
        author: extracted.author,
        siteName: extracted.siteName,
        content: extracted.content,
        excerpt: extracted.excerpt,
        summary,
        tags,
        wordCount: String(extracted.wordCount),
      })
      .returning({ id: articles.id });

    revalidatePath("/");
    return { ok: true, id: row.id };
  } catch (err) {
    console.error("[distill] save failed:", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { ok: false, error: message };
  }
}

export async function toggleRead(id: string, read: boolean) {
  await db.update(articles).set({ read }).where(eq(articles.id, id));
  revalidatePath("/");
  revalidatePath(`/read/${id}`);
}

export async function deleteArticle(id: string) {
  await db.delete(articles).where(eq(articles.id, id));
  revalidatePath("/");
  redirect("/");
}
