# Component Backlog: Position Monitor

## Purpose

Own every open spread from fill through confirmed closure, applying operational exits and ensuring one position can never have two live close orders.

## Contract

- **Input:** reconciled positions/fills, fresh option quotes, market features, clock/calendar, exit config.
- **Output:** state transitions, close intents, alerts, and terminal position results.
- **State:** `OPEN -> CLOSING -> CANCEL_PENDING -> CLOSING... -> CLOSED`.

## Backlog

- [ ] `PM-01 P0` Create a position only from reconciled filled quantities; handle partial entry fills explicitly.
- [ ] `PM-02 P0` Calculate monitoring mark and conservative liquidation value from fresh two-leg quotes.
- [ ] `PM-03 P0` Implement profit target, P&L stop, invalidation, next-session time stop, and competition flatten triggers.
- [ ] `PM-04 P0` Persist one winning exit reason when concurrent triggers occur, using a frozen priority rule.
- [ ] `PM-05 P0` Use a database uniqueness/lock invariant for at most one live close intent per position.
- [ ] `PM-06 P0` Submit close at monitoring mid, store order ID, then enter `CLOSING`.
- [ ] `PM-07 P0` After timeout request cancel, enter `CANCEL_PENDING`, and wait for terminal broker confirmation.
- [ ] `PM-08 P0` Only after confirmed cancellation fetch fresh quotes and step price toward market within retry/slippage caps.
- [ ] `PM-09 P0` Reconcile partial close fills and resize remaining close quantity without over-closing.
- [ ] `PM-10 P0` Alert for manual paper-account review after bounded attempts are exhausted.
- [ ] `PM-11 P0` On restart rebuild state from broker truth and resume monitoring before entries are enabled.
- [ ] `PM-12 P0` Schedule and verify competition flatten by 09:45 ET September 4.

## Failure behavior

Stale quotes block repricing but do not erase the close intent. Unknown cancel status stays `CANCEL_PENDING`. A process crash at every lifecycle boundary must recover without a second live close.

## Verification / done

- Full/partial/no fill, cancel race, restart-at-each-state, slippage cap, and exhausted retry tests pass.
- Broker positions and local closed quantities reconcile exactly.
- The one-live-close-order property is enforced by storage as well as application code.
