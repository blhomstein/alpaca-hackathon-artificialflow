# Component Backlog: Dashboard API

## Purpose

Replace the existing frontend fixture layer with read-only projections of real persisted runtime state. The API explains behavior; it has no trading mutation endpoints.

## Contract

- **Input:** persisted events, graph paths, dossiers, orders, positions, P&L, evals, and health projections.
- **Output:** stable JSON/view models matching the concepts already represented in `src/lib/types.ts`.
- **Consumers:** existing overview, graph, events, dossiers, positions, risk, performance, evals, config, and health pages.

## Backlog

- [ ] `DA-01 P0` Inventory each existing page's fixture fields and map every field to an authoritative backend owner.
- [ ] `DA-02 P0` Version read-only endpoints for overview, active events, graph, dossiers, positions, risk, performance, evals, config, and health.
- [ ] `DA-03 P0` Provide list pagination/filtering and stable detail lookup by event/dossier/position ID.
- [ ] `DA-04 P0` Return exact evidence spans, ordered graph path, snapshot timestamps, invariant results, and rejection reasons.
- [ ] `DA-05 P0` Return order lifecycle and position state without synthesizing missing broker events.
- [ ] `DA-06 P0` Expose conservative liquidation value separately from monitoring mark and realized P&L.
- [ ] `DA-07 P0` Expose risk caps/utilization, daily stop, kill switch, config checksum, and reconciliation state.
- [ ] `DA-08 P0` Expose health for news, quotes, options feed, MCP/CLI, market clock, database/queue, and broker reconciliation.
- [ ] `DA-09 P0` Keep secrets, raw auth errors, and environment values out of responses and logs.
- [ ] `DA-10 P1` Add event-driven refresh or polling metadata (`asOf`, freshness, recommended interval) for live screens.
- [ ] `DA-11 P1` Add contract tests using the current frontend types, then swap mock data per page incrementally.
- [ ] `DA-12 P1` Preserve `SIMULATED`, paper-trading, indicative-feed, and stale-data labels in API models.

## Failure behavior

Unavailable or stale upstream data is returned with explicit status/timestamp; the API never fills gaps with fixture values. Partial endpoint failure must not imply the trading runtime is healthy.

## Verification / done

- One real rejection and one paper trade render end-to-end from persisted data.
- API contract tests prevent accidental mismatch with the existing frontend.
- No dashboard route can submit/cancel orders or alter graph/config/risk state.
