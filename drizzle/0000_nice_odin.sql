CREATE TABLE IF NOT EXISTS "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"author" text,
	"site_name" text,
	"content" text NOT NULL,
	"excerpt" text,
	"summary" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"word_count" text,
	"read" boolean DEFAULT false NOT NULL,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL
);
