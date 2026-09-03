# Component Backlog: Admission Engine

## Purpose

Assemble the candidate dossier and evaluate all non-sizing trade-admission invariants in a deterministic, explainable pass.

## Contract

- **Input:** validated event, graph path, market and option snapshots, critic result, freshness/config/system state.
- **Output:** ordered `InvariantResult[]`, `TRADE` eligibility or `REJECT`, and exhaustive rejection reasons.
- **Downstream:** risk engine only for eligible candidates; dashboard for all candidates.

## Backlog

- [ ] `AE-01 P0` Assign stable IDs and reason codes to all 14 admission invariants from the spec.
- [ ] `AE-02 P0` Validate event provenance, graph length/direction, age, dedupe state, and frozen checksums.
- [ ] `AE-03 P0` Validate contract tradability, quote freshness/two-sidedness/bids/sizes, and width.
- [ ] `AE-04 P0` Consume explicit risk, daily-stop, kill-switch, and critic-veto results without reimplementing them.
- [ ] `AE-05 P0` Evaluate every gate to produce a complete explanation, even after the first failure.
- [ ] `AE-06 P0` Persist the dossier and rejection atomically before any execution request is possible.
- [ ] `AE-07 P0` Ensure dossier/event/target/evaluation-slot uniqueness prevents duplicate candidates.
- [ ] `AE-08 P1` Version the ruleset and stamp it plus config/graph checksums into the dossier.

## Failure behavior

Missing component output, unknown invariant status, database error, or critic system failure is a rejection. There are no warning-based exceptions or manual override tiers.

## Verification / done

- One test independently fails each invariant and observes the expected reason code.
- Multiple simultaneous failures are all visible in one dossier.
- A rejected dossier has no execution-capable payload or idempotency key.
