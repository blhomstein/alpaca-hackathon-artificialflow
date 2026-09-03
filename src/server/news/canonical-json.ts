import { createHash } from "node:crypto";
import type { JsonValue } from "./types";

function serialize(value: JsonValue): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Canonical JSON cannot contain non-finite numbers");
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) return `[${value.map(serialize).join(",")}]`;

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${serialize(value[key]!)}`)
    .join(",")}}`;
}

/** Deterministic JSON serialization compatible with the JCS property-ordering rules. */
export function canonicalizeJson(value: JsonValue): string {
  return serialize(value);
}

export function sha256CanonicalJson(value: JsonValue): string {
  return createHash("sha256").update(canonicalizeJson(value), "utf8").digest("hex");
}

