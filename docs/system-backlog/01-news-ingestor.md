# Component Backlog: News Ingestor

## Purpose

Turn Alpaca historical/live news into a durable, normalized, exactly-once input stream. It detects news; it never decides whether to trade.

## Contract

- **Input:** Alpaca news payload plus receipt timestamp.
- **Output:** normalized news record containing source ID, headline/body, symbols, URL, source timestamp, detected timestamp, raw payload hash, and raw payload reference.
- **State:** ingestion cursor, seen source IDs/hashes, connection health, last-success timestamp.
- **Downstream:** event extractor.

## Backlog

- [x] `NI-01 P0` Define a versioned normalized-news schema without inventing missing source fields.
- [x] `NI-02 P0` Implement historical catch-up followed by live subscription without a gap between them.
- [x] `NI-03 P0` Canonicalize payload serialization and compute a stable SHA-256 payload hash.
- [x] `NI-04 P0` Enforce uniqueness on provider ID when present and raw payload hash always.
- [x] `NI-05 P0` Persist the record before acknowledging or advancing the cursor.
- [x] `NI-06 P0` Restrict candidate symbols to the locked universe while retaining the unmodified source payload.
- [x] `NI-07 P0` Add reconnect with bounded exponential backoff and cursor-based recovery.
- [x] `NI-08 P0` Publish a durable extraction job using the normalized record ID, not the full payload.
- [x] `NI-09 P1` Expose freshness, lag, reconnect count, duplicate count, and last source timestamp.
- [x] `NI-10 P1` Add retention/redaction rules that never expose environment secrets.

## Implementation

- Runtime: `src/server/news/`; executable worker: `scripts/news-ingestor.mts`.
- Storage migration: `db/migrations/0001_news_ingestor.sql`.
- Health endpoint: `GET /api/health/news` (read-only and uncached).
- Delivery is at-least-once with effectively-once extraction: database uniqueness plus the transactional extraction outbox prevent duplicate jobs.
- The historical/live handoff uses an inclusive REST overlap after WebSocket subscription; buffered live articles are then drained through the same dedupe path.

## Failure behavior

Connection loss pauses new-event creation but does not alter active events. Malformed payloads enter a dead-letter record with a reason. Replayed payloads are acknowledged as duplicates and do not trigger extraction again.

## Verification / done

- The same payload delivered repeatedly produces one extraction job.
- Restart from a saved cursor loses no item and creates no duplicate job.
- Historical/live handoff is covered by an integration test.
- Dashboard health can distinguish fresh, degraded, disconnected, and recovering states.
