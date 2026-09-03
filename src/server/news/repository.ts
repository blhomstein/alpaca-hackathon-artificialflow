import type {
  IngestionCursor,
  JsonValue,
  NewsIngestorHealth,
  NormalizedNewsRecord,
} from "./types";

export type PersistNewsResult =
  | { outcome: "inserted"; recordId: string }
  | { outcome: "duplicate"; recordId: string };

export interface NewsRepository {
  persistNews(input: {
    record: NormalizedNewsRecord;
    rawPayload: JsonValue;
    cursor?: IngestionCursor;
  }): Promise<PersistNewsResult>;
  persistDeadLetter(input: {
    provider: "alpaca";
    rawPayload: JsonValue;
    reason: string;
    receivedAt: string;
  }): Promise<void>;
  getCursor(stream: string): Promise<IngestionCursor | null>;
  updateConnection(input: { connected: boolean; recovering: boolean; at: string }): Promise<void>;
  incrementReconnect(at: string): Promise<void>;
  getHealth(now: Date, staleAfterMs: number): Promise<NewsIngestorHealth>;
  redactExpiredRawPayloads(now: Date): Promise<number>;
}
