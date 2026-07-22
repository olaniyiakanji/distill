"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveArticle } from "@/lib/actions";

export function AddUrlForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await saveArticle(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/read/${result.id}`);
    });
  }

  return (
    <form action={onSubmit} className="mb-8">
      <div className="flex gap-2">
        <input
          type="url"
          name="url"
          required
          placeholder="Paste a URL to save…"
          disabled={isPending}
          className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Distilling…" : "Save"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
