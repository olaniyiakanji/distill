# distill

A minimal, self-hosted "read-it-later" app. Save any URL and get an AI-generated TL;DR, auto-tags, and a clean reader view — stored in your own Postgres, deployed on your own Vercel. Runs on **free tiers only**.

- **Reader-first UI** — serif prose, dark mode, no ads, no chrome
- **AI summaries** — a 2–4 sentence TL;DR pinned above every article
- **Auto-tagging** — 2–5 specific tags per article, chosen by the model
- **Yours** — your database, your key, your deploy
- **Free to run** — Vercel Hobby + Neon free tier + Gemini free tier = $0/mo for personal use

## Stack

- Next.js 15 (App Router, Server Actions)
- TypeScript, Tailwind CSS
- Postgres via [Neon serverless driver](https://neon.tech/docs/serverless/serverless-driver) (Vercel-native)
- Drizzle ORM + Drizzle Kit for migrations
- [`@mozilla/readability`](https://github.com/mozilla/readability) + JSDOM for article extraction
- Google Generative AI SDK, `gemini-2.0-flash` (free tier) for summaries and tags

## Deploy

1. **Fork this repo** (or use it as a template).
2. **Import into Vercel** — [vercel.com/new](https://vercel.com/new), point it at your fork.
3. **Attach a Neon Postgres store** in the Vercel dashboard → Storage tab. Vercel injects `DATABASE_URL` (and legacy `POSTGRES_URL`) automatically.
4. **Add your Gemini key** as `GEMINI_API_KEY` in Environment Variables. Grab one for free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
5. **Run the migration once**: from your local checkout with the same `DATABASE_URL`, run `npm run db:push`.
6. Done. Every deploy after that is automatic on push.

## Local development

```bash
git clone https://github.com/olaniyiakanji/distill
cd distill
npm install
cp .env.example .env.local     # fill in GEMINI_API_KEY and DATABASE_URL
npm run db:push                # create tables
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste a URL, and watch it distill.

## Project layout

```
src/
├── app/
│   ├── layout.tsx              header, footer, dark mode
│   ├── page.tsx                library — list of saved articles
│   ├── read/[id]/page.tsx      reader view with TL;DR
│   └── globals.css
├── lib/
│   ├── schema.ts               drizzle table definitions
│   ├── db.ts                   drizzle client
│   ├── extract.ts              fetch + Readability parser
│   ├── ai.ts                   Gemini summary + tag generation
│   └── actions.ts              server actions (save, read, delete)
└── components/
    ├── add-url-form.tsx
    ├── article-card.tsx
    └── tag-badge.tsx
```

## Roadmap

- [ ] Browser extension for one-click save
- [ ] Import from Pocket / Instapaper
- [ ] Highlights and margin notes
- [ ] Full-text search
- [ ] Semantic search via embeddings
- [ ] Weekly digest email
- [ ] RSS feed ingestion

## License

MIT
