export const NORMALIZED_NEWS_SCHEMA_VERSION = 1 as const;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type AlpacaNewsPayload = {
  T?: string;
  id?: number | string;
  headline?: string;
  summary?: string;
  author?: string;
  created_at?: string;
  updated_at?: string;
  content?: string;
  url?: string;
  symbols?: string[];
  source?: string;
  images?: JsonValue[];
  [key: string]: JsonValue | undefined;
};

export type NormalizedNewsRecord = {
  schemaVersion: typeof NORMALIZED_NEWS_SCHEMA_VERSION;
  id: string;
  provider: "alpaca";
  source: string | null;
  providerArticleId: string | null;
  headline: string;
  summary: string | null;
  content: string | null;
  contentType: "text/html" | "text/plain" | null;
  author: string | null;
  url: string | null;
  sourceSymbols: string[];
  candidateSymbols: string[];
  sourceCreatedAt: string;
  sourceUpdatedAt: string | null;
  receivedAt: string;
  rawPayloadHash: string;
  rawCanonicalization: "jcs-v1";
  rawPayloadRef: string;
};

export type IngestionCursor = {
  stream: string;
  value: string;
  updatedAt: string;
};

export type NewsHealthStatus = "fresh" | "degraded" | "disconnected" | "recovering";

export type NewsIngestorHealth = {
  status: NewsHealthStatus;
  connected: boolean;
  recovering: boolean;
  lastSuccessAt: string | null;
  lastSourceAt: string | null;
  lagMs: number | null;
  reconnectCount: number;
  duplicateCount: number;
  malformedCount: number;
};

export type HistoricalNewsPage = {
  items: AlpacaNewsPayload[];
  nextPageToken: string | null;
};
