import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    "No database connection string set. Expected DATABASE_URL or POSTGRES_URL in the environment."
  );
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
