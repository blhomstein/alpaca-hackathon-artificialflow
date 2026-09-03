# Component Backlog: Active Event Scheduler

## Purpose

Own the two-trading-session life of accepted events and trigger deterministic reevaluation of mapped suppliers every 30 minutes.

## Contract

- **Input:** accepted event, mapped targets, Alpaca market calendar/clock.
- **Output:** uniquely keyed evaluation jobs and explicit expiry transitions.
- **State:** active event/target records, next evaluation time, attempt status, lease.

## Backlog

- [ ] `AS-01 P0` Model active-event states: `ACTIVE`, `EXPIRED`, `CANCELLED`, with timestamps and reasons.
- [ ] `AS-02 P0` Compute session-aware expiry across weekends, holidays, and early closes.
- [ ] `AS-03 P0` Schedule only within valid evaluation windows and use completed 30-minute boundaries.
- [ ] `AS-04 P0` Create a unique job key from event, target, and evaluation timestamp.
- [ ] `AS-05 P0` Use leases/transactions so multiple workers cannot evaluate the same slot twice.
- [ ] `AS-06 P0` Recheck active state immediately before dispatch and reject late/stale work.
- [ ] `AS-07 P0` On restart, recover missed eligible slots without creating an order from an expired event.
- [ ] `AS-08 P1` Expose next run, last run, lag, failure count, and active-event totals.

## Failure behavior

Calendar or clock uncertainty pauses dispatch. Failed evaluations are reason-coded and may retry only inside the same eligible event life; job uniqueness prevents duplicate downstream intent.

## Verification / done

- Weekend, holiday, early-close, restart, double-worker, and expiry-race tests pass.
- No job is emitted after event expiry.
- The dashboard can show why an event is active, when it runs next, and when it expires.
