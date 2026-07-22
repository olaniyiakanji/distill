import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { articles } from "@/lib/schema";
import { TagBadge } from "@/components/tag-badge";
import { ReaderActions } from "./reader-actions";

export const dynamic = "force-dynamic";

export default async function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!article) notFound();

  const minutes = article.wordCount ? Math.max(1, Math.round(Number(article.wordCount) / 225)) : null;

  return (
    <article>
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← library
        </Link>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight leading-tight">{article.title}</h1>
        <div className="mt-3 text-sm text-neutral-500">
          <a href={article.url} target="_blank" rel="noreferrer" className="hover:underline">
            {article.siteName ?? new URL(article.url).hostname}
          </a>
          {article.author && ` · ${article.author}`}
          {minutes && ` · ${minutes} min read`}
        </div>

        {article.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        <ReaderActions id={article.id} read={article.read} />
      </header>

      {article.summary && (
        <aside className="mb-10 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-5">
          <div className="mb-2 text-xs uppercase tracking-wide text-neutral-500">TL;DR</div>
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {article.summary}
          </p>
        </aside>
      )}

      <div
        className="prose-reader"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}
