# Component Backlog: Event Validator

## Purpose

Deterministically prove that extracted facts are supported by the source, normalize the accepted event, and enforce semantic deduplication.

## Contract

- **Input:** candidate extraction plus normalized source record.
- **Output:** accepted `CapitalFlowEvent` or immutable rejection with reason codes and failed fields.
- **State:** accepted-event uniqueness index and validation audit.

## Backlog

- [ ] `EV-01 P0` Validate schema enums, symbol universe, timestamps, numeric ranges, and required metadata.
- [ ] `EV-02 P0` Verify each evidence offset is in bounds and its text exactly matches the source substring.
- [ ] `EV-03 P0` Require at least one valid supporting span for every factual non-null field.
- [ ] `EV-04 P0` Reject unsupported non-null fields as a whole event; never silently null them.
- [ ] `EV-05 P0` Validate event direction/type combinations and represent ambiguity as `mixed` or rejection.
- [ ] `EV-06 P0` Enforce 24-hour semantic dedupe on `actor + eventType + amountUsd` atomically.
- [ ] `EV-07 P0` Generate a stable event ID only after validation succeeds.
- [ ] `EV-08 P0` Calculate expiry as two actual trading sessions using the Alpaca calendar.
- [ ] `EV-09 P1` Emit explicit counters for `NO_EVENT`, malformed, unsupported evidence, duplicate, and accepted.

## Failure behavior

If source text is unavailable, evidence cannot be proven, or calendar lookup fails, the event is not activated. A database race must yield one accepted event and one duplicate outcome.

## Verification / done

- Offset mutation, invented value, out-of-universe symbol, and stale duplicate tests reject.
- Concurrent validation of the same semantic event creates one active record.
- Every accepted event can be reconstructed from its source record and validation audit.
