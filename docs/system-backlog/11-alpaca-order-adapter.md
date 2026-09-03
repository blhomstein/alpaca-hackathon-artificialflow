# Component Backlog: Alpaca Order Adapter

## Purpose

Translate one risk-authorized intent into an idempotent Alpaca paper multi-leg order and maintain an auditable local projection of broker events.

## Contract

- **Input:** immutable authorized order intent and stable idempotency key.
- **Output:** normalized submission/order/fill events; never a fabricated broker state.
- **Authority:** only this boundary holds trading credentials and calls mutation endpoints.

## Backlog

- [ ] `OA-01 P0` Implement account/options/feed preflight and record non-secret capability evidence.
- [ ] `OA-02 P0` Derive stable client/idempotency key from dossier, target, direction, expiration, strikes, and sides.
- [ ] `OA-03 P0` Before submission, reconcile orders/positions by client ID and spread intent.
- [ ] `OA-04 P0` Reject when an existing broker order or position already satisfies the intent.
- [ ] `OA-05 P0` Submit one DAY `mleg` limit order with exact authorized legs, quantity, and price.
- [ ] `OA-06 P0` Persist request state and Alpaca order ID atomically before retry decisions.
- [ ] `OA-07 P0` Normalize accepted, partial, filled, rejected, canceled, and expired updates with provider timestamps.
- [ ] `OA-08 P0` Treat network timeout after submission as `UNKNOWN`; query by client ID before any retry.
- [ ] `OA-09 P0` Never silently roll an expired DAY entry into another session.
- [ ] `OA-10 P0` On startup reconcile account, clock, positions, open orders, and recent activities before enabling entry.
- [ ] `OA-11 P1` Exercise Alpaca MCP/CLI in account preflight, chain inspection, verification, or emergency review and store tool/purpose/result telemetry.
- [ ] `OA-12 P1` Redact auth headers, keys, and sensitive payload fields from logs/errors.

## Failure behavior

Ambiguous submission state disables resubmission until broker lookup resolves it. Reconciliation failure keeps new entries disabled. Broker rejection is terminal and reason-coded; adapter code never modifies risk parameters to make an order pass.

## Verification / done

- Timeout-before/after-acceptance simulations create at most one broker order.
- Partial fill, reject, expire, restart, and duplicate request paths reconcile correctly.
- A real paper-account multi-leg submit/cancel path is evidenced before automation is enabled.
