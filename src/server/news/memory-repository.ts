import type { NewsRepository, PersistNewsResult } from "./repository";
import type { IngestionCursor, JsonValue, NewsIngestorHealth, NormalizedNewsRecord } from "./types";

export class MemoryNewsRepository implements NewsRepository {
  readonly records = new Map<string, { record: NormalizedNewsRecord; rawPayload: JsonValue }>();
  readonly jobs = new Map<string, { normalizedNewsId: string; createdAt: string }>();
  readonly deadLetters: Array<{ rawPayload: JsonValue; reason: string; receivedAt: string }> = [];
  readonly cursors = new Map<string, IngestionCursor>();
  private providerIds = new Map<string, string>();
  private hashes = new Map<string, string>();
  private connected = false;
  private recovering = false;
  private reconnectCount = 0;
  private duplicateCount = 0;
  private lastSuccessAt: string | null = null;
  private lastSourceAt: string | null = null;

  async persistNews(input: {
    record: NormalizedNewsRecord;
    rawPayload: JsonValue;
    cursor?: IngestionCursor;
  }): Promise<PersistNewsResult> {
    const providerKey = input.record.providerArticleId
      ? `${input.record.provider}:${input.record.providerArticleId}`
      : null;
    const existingId =
      (providerKey ? this.providerIds.get(providerKey) : undefined) ??
      this.hashes.get(input.record.rawPayloadHash);

    if (input.cursor) this.cursors.set(input.cursor.stream, input.cursor);
    this.lastSuccessAt = input.record.receivedAt;
    this.lastSourceAt = input.record.sourceCreatedAt;

    if (existingId) {
      this.duplicateCount += 1;
      return { outcome: "duplicate", recordId: existingId };
    }

    this.records.set(input.record.id, { record: input.record, rawPayload: input.rawPayload });
    this.jobs.set(input.record.id, {
      normalizedNewsId: input.record.id,
      createdAt: input.record.receivedAt,
    });
    if (providerKey) this.providerIds.set(providerKey, input.record.id);
    this.hashes.set(input.record.rawPayloadHash, input.record.id);
    return { outcome: "inserted", recordId: input.record.id };
  }

  async persistDeadLetter(input: {
    rawPayload: JsonValue;
    reason: string;
    receivedAt: string;
  }): Promise<void> {
    this.deadLetters.push(input);
  }

  async getCursor(stream: string): Promise<IngestionCursor | null> {
    return this.cursors.get(stream) ?? null;
  }

  async updateConnection(input: { connected: boolean; recovering: boolean }): Promise<void> {
    this.connected = input.connected;
    this.recovering = input.recovering;
  }

  async incrementReconnect(): Promise<void> {
    this.reconnectCount += 1;
  }

  async getHealth(now: Date, staleAfterMs: number): Promise<NewsIngestorHealth> {
    const lagMs = this.lastSourceAt ? Math.max(0, now.getTime() - Date.parse(this.lastSourceAt)) : null;
    const status = this.recovering
      ? "recovering"
      : !this.connected
        ? "disconnected"
        : lagMs === null || lagMs > staleAfterMs
          ? "degraded"
          : "fresh";
    return {
      status,
      connected: this.connected,
      recovering: this.recovering,
      lastSuccessAt: this.lastSuccessAt,
      lastSourceAt: this.lastSourceAt,
      lagMs,
      reconnectCount: this.reconnectCount,
      duplicateCount: this.duplicateCount,
      malformedCount: this.deadLetters.length,
    };
  }

  async redactExpiredRawPayloads(): Promise<number> {
    return 0;
  }
}
