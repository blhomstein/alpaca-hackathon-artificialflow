import "dotenv/config";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString, max: 1 });
try {
  const sql = await readFile(new URL("../db/migrations/0001_news_ingestor.sql", import.meta.url), "utf8");
  await pool.query(sql);
  process.stdout.write("Applied 0001_news_ingestor.sql\n");
} finally {
  await pool.end();
}

