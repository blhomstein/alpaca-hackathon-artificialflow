# FlowGraph AI System Backlog

This directory translates `FlowGraph_AI_AGENT_BUILD_SPEC.md` into an implementation and operating model. It covers the runtime behind the existing read-only frontend; it does not propose a frontend rebuild.

## The system in plain language

FlowGraph is a conservative event-driven pipeline, not a free-roaming trading bot. News may create a time-limited event. A fixed, human-verified graph maps that event to possible suppliers. Every 30 minutes, deterministic market checks ask whether the spending hub moved, the supplier still lags, and the supplier has begun moving with abnormal volume. Only then is an option spread proposed. A critic may veto it, but only deterministic admission and risk code may authorize it. The broker adapter submits it idempotently. A state machine owns every exit. Every accepted and rejected decision becomes a dossier for the dashboard and evaluation.

```text
Alpaca News -> Ingest -> Extract -> Validate -> Graph map -> Active event
                                                        |
                                                every 30 minutes
                                                        v
Dashboard <- Dossier <- Admit/Risk <- Critic <- Spread <- Market features
                              |
                              v
                    Order adapter -> Position monitor -> P&L
```

## Operating lifecycle

1. **Start safely:** reconcile account, orders, positions, activities, market clock, options level, and feed. New orders remain disabled until this passes.
2. **Create an event:** ingest and deduplicate news, extract only supported facts with exact evidence spans, then reject malformed or unsupported output.
3. **Map capital flow:** traverse immutable, sourced graph edges for at most two hops, filtered by event spending categories.
4. **Keep it active:** store the event for two trading sessions and schedule a reevaluation of each mapped target every 30 minutes.
5. **Confirm catch-up:** calculate benchmark-adjusted hub and target returns, direction confirmation, and completed-interval RVOL from timestamped data.
6. **Build a defined-risk spread:** select a same-expiration 7-21 DTE bull call or bear put debit spread using fresh, tradable, two-sided quotes.
7. **Try to reject it:** the critic reviews the completed evidence dossier. Timeout, invalid output, or an evidence-backed hard veto rejects the candidate.
8. **Admit and size:** all deterministic invariants and portfolio risk limits must pass. Any failure becomes a reason-coded rejection.
9. **Execute once:** reconcile broker truth, generate a stable idempotency key, submit one DAY multi-leg limit order, and persist its broker ID before retry behavior.
10. **Own the position:** monitor exit triggers and enforce the one-live-close-order rule through `OPEN`, `CLOSING`, `CANCEL_PENDING`, and `CLOSED`.
11. **Explain the result:** store decisions, quotes, fills, conservative marks, P&L, health, and evaluation results for the dashboard.

## Backlog map and suggested dependency order

| Order | Component file | Produces / unlocks |
|---:|---|---|
| 1 | `01-news-ingestor.md` | normalized, deduplicated news |
| 2 | `02-event-extractor.md` | evidence-grounded extraction |
| 3 | `03-event-validator.md` | accepted/rejected capital-flow events |
| 4 | `04-graph-service.md` | verified target paths |
| 5 | `05-active-event-scheduler.md` | two-session reevaluation jobs |
| 6 | `06-market-feature-engine.md` | reproducible catch-up features |
| 7 | `07-option-spread-builder.md` | executable defined-risk proposal |
| 8 | `08-trade-critic.md` | veto-only review |
| 9 | `09-admission-engine.md` | complete invariant verdict |
| 10 | `10-risk-engine.md` | contracts and portfolio authorization |
| 11 | `11-alpaca-order-adapter.md` | idempotent broker execution |
| 12 | `12-position-monitor.md` | controlled close lifecycle |
| 13 | `13-pnl-service.md` | conservative performance projections |
| 14 | `14-replay-runner.md` | repeatable extraction/decision evaluation |
| 15 | `15-baseline-runner.md` | credential-free comparison |
| 16 | `16-dashboard-api.md` | real data behind the existing frontend |

## Global safety rules

- Paper trading only. No component except risk/execution code can reach order mutation APIs.
- Missing, stale, contradictory, or unverified data means `REJECT`, never a guess.
- Broker state is truth for orders, fills, and positions; local state is a recoverable projection.
- Store timestamps, source provenance, config checksum, and reason codes at every stage.
- Never log credentials. Environment keys should be read only by the integration boundary that needs them.
- The baseline must be structurally unable to import credentials or the order adapter.

## MVP critical path

First prove one vertical slice: replayed article -> validated event -> verified path -> market snapshot -> proposal or rejection -> mocked execution lifecycle -> dossier visible through the API. Then replace each mocked boundary with Alpaca paper/data integrations. Do not start live entry automation until restart reconciliation, idempotency, risk caps, and the one-close-order invariant all pass.

## Definition of system-ready

- All acceptance criteria `AC-01` through `AC-16` in the build spec have automated or evidenced checks.
- A complete trade and a complete rejection can be explained from their stored dossiers.
- Process restart cannot duplicate an entry or create two live close orders.
- All positions can be flattened and reconciled by the competition deadline.
- Health explicitly shows news freshness, quote freshness, feed type, MCP/CLI path, market clock, and reconciliation state.
