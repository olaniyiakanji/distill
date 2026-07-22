import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles } from "@/lib/schema";
import { AddUrlForm } from "@/components/add-url-form";
import { ArticleCard } from "@/components/article-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rows = await db.select().from(articles).orderBy(desc(articles.savedAt)).limit(100);

  return (
    <div>
      <AddUrlForm />

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center text-sm text-neutral-500">
          Your library is empty. Paste a URL above to save your first article.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
