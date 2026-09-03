# Component Backlog: Option Spread Builder

## Purpose

Convert a confirmed directional target into one executable, defined-risk debit-spread proposal. It proposes structure and pricing; it cannot authorize or submit.

## Contract

- **Input:** target, direction, account/options capabilities, current chain/quotes/Greeks, frozen selection config.
- **Output:** ranked proposal or rejection, including both legs and conservative pricing fields.

## Backlog

- [ ] `OS-01 P0` Query expirations 7-21 calendar days out and verify both contracts are tradable.
- [ ] `OS-02 P0` For positive signals build bull call debits; for negative signals build bear put debits.
- [ ] `OS-03 P0` Enforce same expiration and option type, correct strike ordering, and no uncovered short leg.
- [ ] `OS-04 P0` Reject missing, stale, crossed, one-sided, or zero-bid quotes on either leg.
- [ ] `OS-05 P0` Select the long leg near the frozen delta target; record Greeks availability and timestamps.
- [ ] `OS-06 P0` Enumerate widths within configured limits and compute entry, mark, liquidation value, max loss/profit, and reward/risk.
- [ ] `OS-07 P0` Rank acceptable candidates by hard validity first, then open interest/recent volume and configured economics.
- [ ] `OS-08 P0` Store all bids, asks, mids, sizes, quote timestamps, feed identity, and selection reasons.
- [ ] `OS-09 P0` Return one deterministic best proposal for the same snapshot/config.
- [ ] `OS-10 P1` Add preflight inspection across all eight names to document actual chain/feed behavior.

## Pricing invariants

`entry = ask(long) - bid(short)`; `mark = mid(long) - mid(short)`; `liquidation = bid(long) - ask(short)`. Contract sizing is not performed here.

## Verification / done

- Malformed leg ordering, DTE, tradability, stale quote, zero bid, width, and negative-economics tests reject.
- Positive/negative fixtures create the correct structure.
- Re-running identical input returns the same chosen spread.
