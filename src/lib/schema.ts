import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  author: text("author"),
  siteName: text("site_name"),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  summary: text("summary"),
  tags: text("tags").array().notNull().default([]),
  wordCount: text("word_count"),
  read: boolean("read").notNull().default(false),
  savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
