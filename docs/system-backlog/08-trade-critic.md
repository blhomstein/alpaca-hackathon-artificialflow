# Component Backlog: Trade Critic

## Purpose

Attempt to falsify a completed candidate using only evidence already present in its dossier. The critic may block; it may never approve risk or modify the proposal.

## Contract

- **Input:** event evidence, graph path/sources, market snapshot, option snapshot, and evidence references.
- **Output:** strict `CriticResult` with `NO_OBJECTION`, `SOFT_WARNING`, or evidence-backed `HARD_VETO`.

## Backlog

- [ ] `TC-01 P0` Build a minimal critic payload with stable evidence-reference IDs and no outside facts.
- [ ] `TC-02 P0` Enforce the six allowed objection codes and strict structured output.
- [ ] `TC-03 P0` Require one or more valid dossier evidence references for every hard veto.
- [ ] `TC-04 P0` Reject a hard veto whose reference is absent or does not support the objection.
- [ ] `TC-05 P0` Use bounded timeout and deterministic settings; timeout/failure becomes safe rejection.
- [ ] `TC-06 P0` Prevent output from altering contracts, prices, size, thresholds, or order fields.
- [ ] `TC-07 P1` Store model/prompt checksum, latency, objections, and validation result.
- [ ] `TC-08 P1` Create fixtures for contradictory event, stale info, already priced, unclear direction, and data inconsistency.

## Failure behavior

Unavailable model, invalid JSON, unsupported code, fabricated reference, or timeout rejects the candidate with a critic-system reason. A soft warning is preserved but does not bypass any gate.

## Verification / done

- Prompt-injected news text cannot grant authority or change order data.
- Unsupported hard veto references are rejected as invalid critic output.
- Critic omission never converts a deterministic failure into a pass.
