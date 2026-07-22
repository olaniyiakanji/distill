import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (!url) {
  console.log("[migrate] No DATABASE_URL set — skipping (safe for build previews without DB).");
  process.exit(0);
}

const sql = neon(url);
const db = drizzle(sql);

console.log("[migrate] Applying pending migrations…");
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("[migrate] Done.");
