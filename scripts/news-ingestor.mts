import "dotenv/config";
import { AlpacaNewsSource } from "../src/server/news/alpaca-source";
import { NewsIngestor } from "../src/server/news/ingestor";
import { PostgresNewsRepository } from "../src/server/news/postgres-repository";
import { getPostgresPool } from "../src/server/db";

const apiKey = process.env.APCA_API_KEY_ID;
const apiSecret = process.env.APCA_API_SECRET_KEY;
if (!apiKey || !apiSecret) throw new Error("APCA_API_KEY_ID and APCA_API_SECRET_KEY are required");

const universe = new Set(
  (process.env.NEWS_SYMBOL_UNIVERSE ?? "MSFT,META,ORCL,NVDA,AMD,AVGO,ANET,VRT")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean),
);
const historicalStart = new Date(process.env.NEWS_HISTORICAL_START ?? Date.now() - 24 * 60 * 60 * 1_000);
if (Number.isNaN(historicalStart.getTime())) throw new Error("NEWS_HISTORICAL_START must be a valid timestamp");

const abortController = new AbortController();
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => abortController.abort(new Error(signal)));
}

const pool = getPostgresPool();
const source = new AlpacaNewsSource({ apiKey, apiSecret });
const repository = new PostgresNewsRepository(
  pool,
  Number(process.env.NEWS_RAW_RETENTION_DAYS ?? 30),
);
const ingestor = new NewsIngestor(source, repository, { lockedUniverse: universe, historicalStart });

try {
  await repository.redactExpiredRawPayloads(new Date());
  await ingestor.run(abortController.signal);
} finally {
  await pool.end();
}

