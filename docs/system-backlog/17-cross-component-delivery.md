# Cross-Component Delivery and Operations Backlog

This file contains work that belongs to the system as a whole rather than one runtime component.

## Shared foundation

- [ ] `XF-01 P0` Choose durable storage and define migrations for normalized news, events, validations, graph versions, active jobs, snapshots, dossiers, risk decisions, orders, fills, positions, P&L, evals, and health.
- [ ] `XF-02 P0` Define a single timestamp policy (UTC storage, ET session logic) and attach `createdAt`, `asOf`, and source timestamps appropriately.
- [ ] `XF-03 P0` Create durable job delivery with unique keys, retry classes, dead-letter reasons, and trace IDs.
- [ ] `XF-04 P0` Enforce service identities/permissions so research, graph, dashboard, replay, and baseline cannot mutate broker orders.
- [ ] `XF-05 P0` Validate required environment variables at startup by component; never print their values.
- [ ] `XF-06 P0` Version schemas, prompts, graph, rules, and configuration; persist checksums in each decision.

## Startup and shutdown runbooks

- [ ] `OP-01 P0` Startup sequence: database/migrations -> config checksum -> Alpaca connectivity/capabilities -> feed -> clock/calendar -> broker reconciliation -> monitors -> ingestion -> scheduler -> entry enablement.
- [ ] `OP-02 P0` Degraded sequence: pause new entries on stale/unknown news, bars, quotes, account state, reconciliation, queue, or database state while continuing safe position supervision where possible.
- [ ] `OP-03 P0` Kill-switch runbook: latch halt, stop new mutations, surface alert, reconcile broker truth, and require explicit reviewed recovery.
- [ ] `OP-04 P0` Competition flatten runbook with early warning, automatic close attempts, bounded repricing, reconciliation, and manual paper-account escalation.
- [ ] `OP-05 P0` Graceful shutdown stops new work, releases scheduler leases, persists cursors, and leaves order/position states recoverable.

## Observability and security

- [ ] `OB-01 P0` Correlate one news item through event, target, evaluation, dossier, order, position, and result with non-secret IDs.
- [ ] `OB-02 P0` Alert on stale feeds, reconciliation failure, unknown order state, exhausted close retry, risk halt, queue lag, and position mismatch.
- [ ] `OB-03 P0` Create an append-only audit trail for decision and broker mutation events.
- [ ] `OB-04 P0` Redact keys/tokens/auth headers and scan logs/test fixtures for accidental secrets.
- [ ] `OB-05 P1` Record Alpaca MCP/CLI tool name, purpose, time, outcome, and latency without request credentials.

## Vertical slices / milestones

- [ ] `MS-01` Replayed article -> extraction -> validation -> graph path -> stored dossier/rejection -> existing dashboard.
- [ ] `MS-02` Active event -> real bars -> catch-up gates -> real chain -> spread proposal -> mocked risk/execution.
- [ ] `MS-03` Authorized 1-lot paper spread -> submit/cancel/fill telemetry -> restart reconciliation.
- [ ] `MS-04` Filled spread -> all close states -> realized P&L -> dashboard and health.
- [ ] `MS-05` Frozen replay/holdout -> baseline -> comparison report -> limitations.

## Go-live gate for automated paper entries

Do not enable automated paper entries until option level/feed are verified; configurations are frozen; all hard risk tests pass; idempotent entry and restart recovery pass; one-close-order/cancel-confirmation tests pass; health and kill switch are visible; and an operator has rehearsed emergency review and flattening.
