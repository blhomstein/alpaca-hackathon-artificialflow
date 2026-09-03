# Component Backlog: Risk Engine

## Purpose

Be the sole deterministic authority that sizes an admitted spread and decides whether portfolio/account risk permits a new order.

## Contract

- **Input:** spread economics, direction, fresh broker-reconciled account/positions/orders, realized and conservative unrealized P&L.
- **Output:** authorized `ProposedSpreadOrder` with contracts plus before/after risk snapshots, or rejection.

## Backlog

- [ ] `RE-01 P0` Compute theoretical max loss from conservative entry, width, multiplier, and contracts.
- [ ] `RE-02 P0` Size whole contracts so per-trade max loss is at most `$1,200` and `1.2%` of equity (use the tighter cap).
- [ ] `RE-03 P0` Enforce total open theoretical loss `<= $5,000` and `<= 5%` of equity.
- [ ] `RE-04 P0` Enforce at most three concurrent positions and two same-direction positions.
- [ ] `RE-05 P0` Calculate marked daily P&L as realized plus conservative liquidation P&L; block entries at `<= -$3,000`.
- [ ] `RE-06 P0` Calculate equity drawdown from the declared high-water mark; halt automation at `-8%`.
- [ ] `RE-07 P0` Include live entry orders and uncertain broker intents conservatively in exposure.
- [ ] `RE-08 P0` Revalidate account options level, buying power, market state, kill switch, and risk immediately before submit.
- [ ] `RE-09 P0` Persist immutable risk-before/after snapshots and the frozen config checksum.
- [ ] `RE-10 P1` Define explicit operator reset/recovery policy for daily stop and kill switch without silently re-enabling automation.

## Failure behavior

Stale account state, unresolved reconciliation, uncertain exposure, nonpositive debit, or zero affordable contracts rejects. Kill switch stops all automated mutations, including new entry behavior; flatten/recovery follows an explicit safe procedure.

## Verification / done

- Boundary tests cover exactly-at and one-cent-over every dollar/percentage limit.
- Concurrent authorization cannot oversubscribe caps (transaction/lock test).
- No output can represent a naked or undefined-risk option position.
