# Component Backlog: Market Feature Engine

## Purpose

Produce a reproducible, timestamped `MarketSnapshot` and the four deterministic catch-up gates for each active event/target pair.

## Contract

- **Input:** event timestamp/direction, actor, target, `SMH`, evaluation timestamp, frozen config.
- **Output:** returns, relative returns, last completed 15-minute direction, same-slot 10-session RVOL, pass/fail details, raw-data references.
- **Data:** Alpaca stock bars/quotes and market calendar; no option data.

## Backlog

- [ ] `MF-01 P0` Fetch and persist actor, target, and SMH bars with provider timestamps and adjustment policy.
- [ ] `MF-02 P0` Define event-price anchoring when news arrives inside/outside a bar or outside market hours.
- [ ] `MF-03 P0` Calculate hub and target returns over identical `eventTs -> now` windows.
- [ ] `MF-04 P0` Subtract SMH return to obtain benchmark-adjusted relative returns.
- [ ] `MF-05 P0` Implement direction-aware positive and negative event comparisons explicitly.
- [ ] `MF-06 P0` Select only the last completed 15-minute target bar; never inspect a partial bar.
- [ ] `MF-07 P0` Calculate RVOL against the same interval in the prior 10 complete sessions.
- [ ] `MF-08 P0` Require all expected sessions and define rejection for missing/stale bars.
- [ ] `MF-09 P0` Apply frozen hub-reprice, target-not-fully-repriced, direction, and `RVOL >= 1.5` gates.
- [ ] `MF-10 P0` Stamp config checksum and source bar IDs/timestamps into the snapshot.
- [ ] `MF-11 P1` Cache immutable historical bars while forcing freshness checks on current data.

## Failure behavior

Missing benchmark, incomplete intervals, timestamp mismatch, insufficient RVOL history, or stale data yields a reason-coded rejection. It never estimates a missing bar.

## Verification / done

- Hand-calculated positive and negative fixtures reproduce exactly.
- Partial-bar, split/session-boundary, missing-history, and stale-data tests reject safely.
- A stored snapshot can be recalculated bit-for-bit from its referenced bars and config.
