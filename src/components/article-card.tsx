import Link from "next/link";
import type { Article } from "@/lib/schema";
import { TagBadge } from "./tag-badge";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function ArticleCard({ article }: { article: Article }) {
  const minutes = article.wordCount ? Math.max(1, Math.round(Number(article.wordCount) / 225)) : null;

  return (
    <Link
      href={`/read/${article.id}`}
      className="block rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-medium text-neutral-900 dark:text-neutral-100 leading-snug">
          {article.title}
        </h2>
        {article.read && (
          <span className="shrink-0 text-xs text-neutral-400">read</span>
        )}
      </div>
      <div className="mt-1 text-xs text-neutral-500">
        {article.siteName ?? new URL(article.url).hostname}
        {minutes && ` · ${minutes} min`}
        {" · "}
        {timeAgo(new Date(article.savedAt))}
      </div>
      {article.summary && (
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
          {article.summary}
        </p>
      )}
      {article.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </Link>
  );
}
