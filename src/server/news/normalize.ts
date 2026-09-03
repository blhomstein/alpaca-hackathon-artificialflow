import { randomUUID } from "node:crypto";
import { sha256CanonicalJson } from "./canonical-json";
import {
  NORMALIZED_NEWS_SCHEMA_VERSION,
  type AlpacaNewsPayload,
  type JsonValue,
  type NormalizedNewsRecord,
} from "./types";

export class MalformedNewsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MalformedNewsError";
  }
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function requiredTimestamp(value: unknown, field: string): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new MalformedNewsError(`${field} must be an RFC-3339 timestamp`);
  }
  return new Date(value).toISOString();
}

function optionalTimestamp(value: unknown, field: string): string | null {
  if (value == null || value === "") return null;
  return requiredTimestamp(value, field);
}

function isProbablyHtml(content: string | null): boolean {
  return content !== null && /<\/?[a-z][\s\S]*>/i.test(content);
}

export function normalizeAlpacaNews(
  payload: AlpacaNewsPayload,
  receivedAt: Date,
  lockedUniverse: ReadonlySet<string>,
): NormalizedNewsRecord {
  if (typeof payload.headline !== "string" || payload.headline.trim().length === 0) {
    throw new MalformedNewsError("headline is required");
  }
  if (!Array.isArray(payload.symbols) || !payload.symbols.every((symbol) => typeof symbol === "string")) {
    throw new MalformedNewsError("symbols must be an array of strings");
  }

  const content = optionalString(payload.content);
  const sourceSymbols = [...new Set(payload.symbols.map((symbol) => symbol.toUpperCase()))];

  const id = randomUUID();
  return {
    schemaVersion: NORMALIZED_NEWS_SCHEMA_VERSION,
    id,
    provider: "alpaca",
    source: optionalString(payload.source),
    providerArticleId:
      typeof payload.id === "number" || typeof payload.id === "string" ? String(payload.id) : null,
    headline: payload.headline,
    summary: optionalString(payload.summary),
    content,
    contentType: content === null ? null : isProbablyHtml(content) ? "text/html" : "text/plain",
    author: optionalString(payload.author),
    url: optionalString(payload.url),
    sourceSymbols,
    candidateSymbols: sourceSymbols.filter((symbol) => lockedUniverse.has(symbol)),
    sourceCreatedAt: requiredTimestamp(payload.created_at, "created_at"),
    sourceUpdatedAt: optionalTimestamp(payload.updated_at, "updated_at"),
    receivedAt: receivedAt.toISOString(),
    rawPayloadHash: sha256CanonicalJson(payload as { [key: string]: JsonValue }),
    rawCanonicalization: "jcs-v1",
    rawPayloadRef: `news-raw://${id}`,
  };
}
