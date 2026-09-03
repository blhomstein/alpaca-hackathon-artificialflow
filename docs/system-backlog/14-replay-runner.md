# Component Backlog: Replay Runner

## Purpose

Evaluate extraction and decision behavior on timestamped historical events without contaminating time, leaking holdout data, or inventing option fills.

## Contract

- **Input:** versioned event corpus, point-in-time market data, graph/config/prompt checksums, mocked execution scenarios.
- **Output:** immutable development/holdout eval run, per-event dossiers, metrics, and artifacts.

## Backlog

- [ ] `RR-01 P0` Define a manifest for 20-25 timestamped events with source snapshots and dev/holdout partition.
- [ ] `RR-02 P0` Include the required 12 positive and 5 negative extraction articles and labels.
- [ ] `RR-03 P0` Inject a replay clock so all freshness/session/expiry logic uses event time, never wall time.
- [ ] `RR-04 P0` Reuse production extractor, validator, graph, feature, admission, and risk logic through non-trading interfaces.
- [ ] `RR-05 P0` Ensure requested bars are available only at or before the simulated evaluation timestamp.
- [ ] `RR-06 P0` Tune thresholds on development only, then freeze and checksum configuration.
- [ ] `RR-07 P0` Technically guard holdout execution so the frozen holdout runs once and produces an immutable artifact.
- [ ] `RR-08 P0` Evaluate extraction inventions/validity, funnel decisions, reasons, and reproducibility—not fabricated option returns.
- [ ] `RR-09 P0` Exercise mocked full, partial, reject, expire/no-fill, cancel, retry, and restart order paths.
- [ ] `RR-10 P1` Publish dev and holdout metrics separately with small-sample caveats.

## Failure behavior

Missing point-in-time data marks an example unevaluable for that metric. It is never backfilled with future data. A checksum mismatch invalidates comparison rather than silently mixing versions.

## Verification / done

- Two runs with identical inputs/checksums produce identical dossiers and metrics.
- Holdout cannot be invoked in tuning mode.
- All required risk/execution tests in spec section 16 pass at 100%.
