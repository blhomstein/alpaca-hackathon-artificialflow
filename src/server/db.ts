import { Pool } from "pg";

declare global {
  var flowGraphPostgresPool: Pool | undefined;
}

export function getPostgresPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  if (!globalThis.flowGraphPostgresPool) {
    globalThis.flowGraphPostgresPool = new Pool({ connectionString, max: 10 });
  }
  return globalThis.flowGraphPostgresPool;
}

