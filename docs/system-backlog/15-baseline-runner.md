# Component Backlog: Baseline Runner

## Purpose

Provide a simple offline price/volume-only comparison that demonstrates what the graph and evidence agent add, without credentials, LLM, graph, or broker access.

## Contract

- **Input:** the same event timestamps plus permitted historical price/volume data and a frozen baseline config.
- **Output:** clearly labeled `SIMULATED` decisions/returns and comparison series.

## Backlog

- [ ] `BR-01 P0` Place the baseline in a dependency boundary that cannot import the order adapter, credential loader, LLM, or graph service.
- [ ] `BR-02 P0` Use exactly the same event timestamps and replay clock as the agent evaluation.
- [ ] `BR-03 P0` Define the minimal price/volume confirmation rule before running the holdout.
- [ ] `BR-04 P0` Use conservative simulated entry/exit assumptions and record all assumptions.
- [ ] `BR-05 P0` Compare underlying returns when point-in-time option quotes are unavailable.
- [ ] `BR-06 P0` Stamp every record, chart series, API response, and dashboard label `SIMULATED`.
- [ ] `BR-07 P0` Report agent/baseline/SMH/QQQ over matching timestamps and horizons.
- [ ] `BR-08 P1` Add a build/test rule that fails if forbidden trading or credential dependencies enter the baseline graph.

## Failure behavior

Missing historical data produces an explicit gap. The baseline never calls live APIs as a fallback and never pretends underlying results are option fills.

## Verification / done

- Static dependency test proves no credential or order-adapter path.
- Matching event window and benchmark calculations are reproducible.
- All baseline outputs are visually and structurally distinguishable from paper trading.
