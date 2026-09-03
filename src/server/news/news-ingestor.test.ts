import assert from "node:assert/strict";
import test from "node:test";
import type { LiveConnection, NewsSource } from "./alpaca-source";
import { canonicalizeJson } from "./canonical-json";
import { NewsIngestor } from "./ingestor";
import { MemoryNewsRepository } from "./memory-repository";
import { normalizeAlpacaNews } from "./normalize";
import type { AlpacaNewsPayload, HistoricalNewsPage } from "./types";

const item = (id: number, createdAt: string): AlpacaNewsPayload => ({
  T: "n",
  id,
  headline: `Article ${id}`,
  summary: "Summary",
  author: "Reporter",
  created_at: createdAt,
  updated_at: createdAt,
  content: "<p>News body</p>",
  url: `https://example.com/${id}`,
  symbols: ["nvda", "OUTSIDE"],
  source: "benzinga",
});

class HistoricalSource implements NewsSource {
  constructor(private readonly payloads: AlpacaNewsPayload[]) {}
  async fetchHistorical(): Promise<HistoricalNewsPage> {
    return { items: this.payloads, nextPageToken: null };
  }
  async connectLive(): Promise<LiveConnection> {
    throw new Error("not used");
  }
}

test("canonical JSON is independent of object property order", () => {
  assert.equal(canonicalizeJson({ b: 2, a: 1 }), canonicalizeJson({ a: 1, b: 2 }));
});

test("normalization preserves source symbols and filters candidates", () => {
  const record = normalizeAlpacaNews(
    item(1, "2026-09-02T10:00:00Z"),
    new Date("2026-09-02T10:00:01Z"),
    new Set(["NVDA"]),
  );
  assert.deepEqual(record.sourceSymbols, ["NVDA", "OUTSIDE"]);
  assert.deepEqual(record.candidateSymbols, ["NVDA"]);
  assert.equal(record.contentType, "text/html");
  assert.equal(record.rawPayloadRef, `news-raw://${record.id}`);
});

test("repeated delivery creates one record and one extraction job", async () => {
  const repository = new MemoryNewsRepository();
  const ingestor = new NewsIngestor(new HistoricalSource([]), repository, {
    lockedUniverse: new Set(["NVDA"]),
    historicalStart: new Date("2026-09-01T00:00:00Z"),
  });
  const payload = item(1, "2026-09-02T10:00:00Z");
  assert.equal((await ingestor.ingest(payload)).outcome, "inserted");
  assert.equal((await ingestor.ingest(payload)).outcome, "duplicate");
  assert.equal(repository.records.size, 1);
  assert.equal(repository.jobs.size, 1);
});

test("restart resumes inclusively from the cursor without duplicating a job", async () => {
  const repository = new MemoryNewsRepository();
  const source = new HistoricalSource([item(1, "2026-09-02T10:00:00Z")]);
  const options = {
    lockedUniverse: new Set(["NVDA"]),
    historicalStart: new Date("2026-09-01T00:00:00Z"),
  };
  await new NewsIngestor(source, repository, options).catchUp(new Date("2026-09-02T11:00:00Z"));
  await new NewsIngestor(source, repository, options).catchUp(new Date("2026-09-02T11:00:00Z"));
  assert.equal(repository.records.size, 1);
  assert.equal(repository.jobs.size, 1);
  assert.equal((await repository.getHealth(new Date("2026-09-02T11:00:00Z"), 10)).duplicateCount, 1);
});

test("historical/live handoff overlaps and deduplicates the buffered live item", async () => {
  const first = item(1, "2026-09-02T10:00:00Z");
  const crossing = item(2, "2026-09-02T10:01:00Z");
  const abort = new AbortController();
  let historicalCalls = 0;
  const source: NewsSource = {
    async fetchHistorical() {
      historicalCalls += 1;
      if (historicalCalls === 1) return { items: [first], nextPageToken: null };
      abort.abort();
      return { items: [crossing], nextPageToken: null };
    },
    async connectLive(onPayload) {
      onPayload(crossing, new Date("2026-09-02T10:01:01Z"));
      return {
        connectedAt: new Date("2026-09-02T10:01:01Z"),
        closed: Promise.resolve(),
        close() {},
      };
    },
  };
  const repository = new MemoryNewsRepository();
  const ingestor = new NewsIngestor(source, repository, {
    lockedUniverse: new Set(["NVDA"]),
    historicalStart: new Date("2026-09-01T00:00:00Z"),
    now: () => new Date("2026-09-02T10:02:00Z"),
  });
  await ingestor.run(abort.signal);
  assert.equal(repository.records.size, 2);
  assert.equal(repository.jobs.size, 2);
  assert.equal((await repository.getHealth(new Date("2026-09-02T10:02:00Z"), 120_000)).duplicateCount, 1);
});

test("malformed articles enter the dead-letter store", async () => {
  const repository = new MemoryNewsRepository();
  const ingestor = new NewsIngestor(new HistoricalSource([]), repository, {
    lockedUniverse: new Set(),
    historicalStart: new Date("2026-09-01T00:00:00Z"),
  });
  assert.equal((await ingestor.ingest({ headline: "Missing timestamp", symbols: [] })).outcome, "dead-letter");
  assert.equal(repository.deadLetters.length, 1);
  assert.match(repository.deadLetters[0]!.reason, /created_at/);
});

