# Component Backlog: Event Extractor

## Purpose

Use an LLM to convert normalized news into a candidate `CapitalFlowEvent`, with exact source evidence for every factual non-null field. The extractor has no graph, market, risk, or trading authority.

## Contract

- **Input:** normalized headline/body and immutable source metadata.
- **Output:** `NO_EVENT` or a candidate event plus evidence spans, model/prompt version, latency, and telemetry confidence.
- **Downstream:** event validator only.

## Backlog

- [ ] `EE-01 P0` Create a strict structured-output schema for exactly the five accepted event types.
- [ ] `EE-02 P0` Encode the eight-symbol universe, allowed directions/statuses, and null-not-guess rules in the prompt.
- [ ] `EE-03 P0` Require character-offset evidence spans for actor, type, direction, amount, recipient, categories, and status when non-null.
- [ ] `EE-04 P0` Preserve source URL/timestamps/hash from ingestion; do not let the model rewrite them.
- [ ] `EE-05 P0` Return `NO_EVENT` for unsupported, ambiguous, opinion-only, or unrelated content.
- [ ] `EE-06 P0` Set deterministic generation parameters and bounded timeout/retry behavior.
- [ ] `EE-07 P0` Treat timeout, refusal, invalid JSON, or schema mismatch as extraction failure, never approval.
- [ ] `EE-08 P1` Record model, prompt checksum, token usage, latency, and raw response reference without secrets.
- [ ] `EE-09 P1` Build the required 12 positive / 5 negative labeled extraction corpus.

## Failure behavior

Any model or parsing failure becomes a reason-coded rejection available to evaluations. Retrying uses the same immutable input and cannot create multiple accepted event IDs.

## Verification / done

- 100% of accepted outputs parse into the declared schema.
- Invented amounts, recipients, and statuses are zero on the labeled corpus.
- Unsupported examples consistently return `NO_EVENT`.
- Confidence is stored only as telemetry and is not consumed by admission.
