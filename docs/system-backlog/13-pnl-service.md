# Component Backlog: P&L Service

## Purpose

Build conservative, reproducible account, position, and strategy performance projections from broker fills and current liquidation values.

## Contract

- **Input:** fills/activities, open positions, both-leg quotes, account equity/history, capital-at-risk snapshots.
- **Output:** realized, unrealized, marked P&L; risk utilization; fill quality; performance series and aggregates.

## Backlog

- [ ] `PN-01 P0` Normalize entry/exit leg fills, fees if supplied, quantities, multipliers, and timestamps.
- [ ] `PN-02 P0` Calculate realized P&L only from confirmed broker fills.
- [ ] `PN-03 P0` Mark open spreads with `bid(long) - ask(short)` and label stale/unavailable values.
- [ ] `PN-04 P0` Calculate monitoring mark separately and never present it as conservative liquidation P&L.
- [ ] `PN-05 P0` Compute marked daily P&L consumed by the risk engine.
- [ ] `PN-06 P0` Record submission mid and calculate fill-versus-mid for entries and exits.
- [ ] `PN-07 P0` Produce account return, return on capital at risk, win rate, average win/loss, and maximum drawdown.
- [ ] `PN-08 P0` Reconcile aggregates to Alpaca portfolio history/account activities and flag differences.
- [ ] `PN-09 P1` Provide time series for agent, baseline, SMH, and QQQ with explicit simulation/real labels.
- [ ] `PN-10 P1` Store feed and optimistic-paper-fill limitations alongside reported metrics.

## Failure behavior

Missing/stale quotes make conservative unrealized P&L unavailable or degraded—not silently zero. Broker/local mismatch sets health degraded and blocks any risk calculation that depends on the uncertain value.

## Verification / done

- Full/partial multi-leg fills, open/closed positions, stale marks, and session rollover fixtures reconcile.
- Displayed totals trace to underlying fills and quote timestamps.
- No metric implies historical option P&L when point-in-time option quotes do not exist.
