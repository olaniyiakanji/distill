import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "distill",
  description: "Save any article. Get an AI-generated TL;DR and auto-tags.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-3xl px-5 py-8">
          <header className="mb-10 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              distill
            </Link>
            <nav className="text-sm text-neutral-500">
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                library
              </Link>
            </nav>
          </header>
          <main>{children}</main>
          <footer className="mt-16 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
            Powered by{" "}
            <a
              href="https://ai.google.dev/gemini-api"
              className="underline hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Gemini
            </a>
            . Source on{" "}
            <a
              href="https://github.com/olaniyiakanji/distill"
              className="underline hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              GitHub
            </a>
            .
          </footer>
        </div>
      </body>
    </html>
  );
}
