"use client";

import { useTransition } from "react";
import { toggleRead, deleteArticle } from "@/lib/actions";

export function ReaderActions({ id, read }: { id: string; read: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-6 flex gap-4 text-sm">
      <button
        onClick={() => startTransition(() => toggleRead(id, !read))}
        disabled={isPending}
        className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-50"
      >
        {read ? "Mark unread" : "Mark read"}
      </button>
      <button
        onClick={() => {
          if (confirm("Delete this article?")) {
            startTransition(() => deleteArticle(id));
          }
        }}
        disabled={isPending}
        className="text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
