import { Pool, type PoolClient } from "pg";
import type { NewsRepository, PersistNewsResult } from "./repository";
import type { IngestionCursor, JsonValue, NewsIngestorHealth, NormalizedNewsRecord } from "./types";

type CountRow = { count: string };

export class PostgresNewsRepository implements NewsRepository {
  constructor(
    private readonly pool: Pool,
    private readonly rawRetentionDays = 30,
  ) {}

  private async transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async persistNews(input: {
    record: NormalizedNewsRecord;
    rawPayload: JsonValue;
    cursor?: IngestionCursor;
  }): Promise<PersistNewsResult> {
    return this.transaction(async (client) => {
      const record = input.record;
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO normalized_news (
          id, schema_version, provider, source, provider_article_id, headline, summary,
          content, content_type, author, url, source_symbols, candidate_symbols,
          source_created_at, source_updated_at, received_at, raw_payload_hash,
          raw_canonicalization, raw_payload_ref
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19
        ) ON CONFLICT DO NOTHING RETURNING id`,
        [
          record.id,
          record.schemaVersion,
          record.provider,
          record.source,
          record.providerArticleId,
          record.headline,
          record.summary,
          record.content,
          record.contentType,
          record.author,
          record.url,
          record.sourceSymbols,
          record.candidateSymbols,
          record.sourceCreatedAt,
          record.sourceUpdatedAt,
          record.receivedAt,
          record.rawPayloadHash,
          record.rawCanonicalization,
          record.rawPayloadRef,
        ],
      );

      let result: PersistNewsResult;
      if (inserted.rowCount === 1) {
        await client.query(
          `INSERT INTO news_raw_payloads (normalized_news_id, payload, expires_at)
           VALUES ($1, $2, $3::timestamptz + ($4 * interval '1 day'))`,
          [record.id, JSON.stringify(input.rawPayload), record.receivedAt, this.rawRetentionDays],
        );
        await client.query(
          `INSERT INTO extraction_jobs (normalized_news_id, created_at)
           VALUES ($1, $2) ON CONFLICT (normalized_news_id) DO NOTHING`,
          [record.id, record.receivedAt],
        );
        result = { outcome: "inserted", recordId: record.id };
      } else {
        const existing = await client.query<{ id: string }>(
          `SELECT id FROM normalized_news
           WHERE raw_payload_hash = $1
              OR (provider = $2 AND provider_article_id = $3 AND $3 IS NOT NULL)
           ORDER BY received_at ASC LIMIT 1`,
          [record.rawPayloadHash, record.provider, record.providerArticleId],
        );
        if (!existing.rows[0]) throw new Error("News conflict occurred but the existing row was not found");
        await client.query(
          `UPDATE news_ingestor_health
           SET duplicate_count = duplicate_count + 1, last_success_at = $1,
               last_source_at = GREATEST(last_source_at, $2), updated_at = $1
           WHERE singleton = true`,
          [record.receivedAt, record.sourceCreatedAt],
        );
        result = { outcome: "duplicate", recordId: existing.rows[0].id };
      }

      if (inserted.rowCount === 1) {
        await client.query(
          `UPDATE news_ingestor_health
           SET last_success_at = $1, last_source_at = GREATEST(last_source_at, $2), updated_at = $1
           WHERE singleton = true`,
          [record.receivedAt, record.sourceCreatedAt],
        );
      }

      if (input.cursor) {
        await client.query(
          `INSERT INTO news_ingestion_cursors (stream, cursor_value, updated_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (stream) DO UPDATE
           SET cursor_value = EXCLUDED.cursor_value, updated_at = EXCLUDED.updated_at`,
          [input.cursor.stream, input.cursor.value, input.cursor.updatedAt],
        );
      }
      return result;
    });
  }

  async persistDeadLetter(input: {
    provider: "alpaca";
    rawPayload: JsonValue;
    reason: string;
    receivedAt: string;
  }): Promise<void> {
    await this.transaction(async (client) => {
      await client.query(
        `INSERT INTO news_dead_letters (provider, payload, reason, received_at)
         VALUES ($1, $2, $3, $4)`,
        [input.provider, JSON.stringify(input.rawPayload), input.reason.slice(0, 1_000), input.receivedAt],
      );
      await client.query(
        `UPDATE news_ingestor_health
         SET malformed_count = malformed_count + 1, updated_at = $1 WHERE singleton = true`,
        [input.receivedAt],
      );
    });
  }

  async getCursor(stream: string): Promise<IngestionCursor | null> {
    const result = await this.pool.query<{ stream: string; cursor_value: string; updated_at: Date }>(
      `SELECT stream, cursor_value, updated_at FROM news_ingestion_cursors WHERE stream = $1`,
      [stream],
    );
    const row = result.rows[0];
    return row ? { stream: row.stream, value: row.cursor_value, updatedAt: row.updated_at.toISOString() } : null;
  }

  async updateConnection(input: { connected: boolean; recovering: boolean; at: string }): Promise<void> {
    await this.pool.query(
      `UPDATE news_ingestor_health
       SET connected = $1, recovering = $2, updated_at = $3 WHERE singleton = true`,
      [input.connected, input.recovering, input.at],
    );
  }

  async incrementReconnect(at: string): Promise<void> {
    await this.pool.query(
      `UPDATE news_ingestor_health
       SET reconnect_count = reconnect_count + 1, recovering = true, connected = false, updated_at = $1
       WHERE singleton = true`,
      [at],
    );
  }

  async getHealth(now: Date, staleAfterMs: number): Promise<NewsIngestorHealth> {
    const result = await this.pool.query<{
      connected: boolean;
      recovering: boolean;
      last_success_at: Date | null;
      last_source_at: Date | null;
      reconnect_count: number;
      duplicate_count: number;
      malformed_count: number;
    }>(`SELECT * FROM news_ingestor_health WHERE singleton = true`);
    const row = result.rows[0];
    if (!row) throw new Error("news_ingestor_health is not initialized; run migrations");
    const lagMs = row.last_source_at ? Math.max(0, now.getTime() - row.last_source_at.getTime()) : null;
    return {
      status: row.recovering
        ? "recovering"
        : !row.connected
          ? "disconnected"
          : lagMs === null || lagMs > staleAfterMs
            ? "degraded"
            : "fresh",
      connected: row.connected,
      recovering: row.recovering,
      lastSuccessAt: row.last_success_at?.toISOString() ?? null,
      lastSourceAt: row.last_source_at?.toISOString() ?? null,
      lagMs,
      reconnectCount: row.reconnect_count,
      duplicateCount: row.duplicate_count,
      malformedCount: row.malformed_count,
    };
  }

  async redactExpiredRawPayloads(now: Date): Promise<number> {
    const result = await this.pool.query<CountRow>(
      `WITH redacted AS (
         UPDATE news_raw_payloads SET payload = NULL, redacted_at = $1
         WHERE expires_at <= $1 AND payload IS NOT NULL RETURNING 1
       ) SELECT count(*)::text AS count FROM redacted`,
      [now.toISOString()],
    );
    return Number(result.rows[0]?.count ?? 0);
  }
}

