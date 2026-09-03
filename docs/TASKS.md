# Hackathon Execution Board

## Submission Goal

The minimum successful submission demonstrates one explainable, paper-only vertical slice:

Alpaca news or replayed event
→ structured AI extraction
→ market confirmation
→ option debit-spread selection
→ deterministic risk checks
→ paper order
→ position monitoring
→ decision trace and P&L in the UI

It must show one successful paper spread, one deterministic rejection, and one clearly labelled replay without implying proven profitability.

## Shared Technical Contract

Freeze these interfaces before either developer builds an integration boundary. Put the implementation in `src/lib/trading-contracts.ts`; API and stored JSON use the same names.

```ts
type ISO8601 = string; // UTC RFC 3339 instant
type DataMode = "LIVE_PAPER" | "REPLAY" | "SIMULATED";
type Direction = "BULLISH" | "BEARISH";

type RejectionReason =
  | "NO_EVENT"
  | "MALFORMED_LLM_OUTPUT"
  | "UNSUPPORTED_EVIDENCE"
  | "DUPLICATE_EVENT"
  | "STALE_EVENT"
  | "NO_VERIFIED_SUPPLIER"
  | "MARKET_DATA_MISSING"
  | "MARKET_CONFIRMATION_FAILED"
  | "OPTION_CHAIN_UNAVAILABLE"
  | "OPTION_QUOTE_INVALID"
  | "NO_VALID_SPREAD"
  | "RISK_LIMIT_EXCEEDED"
  | "DAILY_STOP_ACTIVE"
  | "KILL_SWITCH_ACTIVE"
  | "BROKER_NOT_READY"
  | "DUPLICATE_ORDER_INTENT"
  | "BROKER_REJECTED"
  | "SYSTEM_ERROR";

interface ExtractedEvent {
  eventId: string;
  actorSymbol: string;
  eventType: "AI_CAPEX_CHANGE" | "INFRASTRUCTURE_CLOUD_CONTRACT" | "INVESTMENT_FINANCING" | "SUPPLY_CAPACITY" | "CANCELLATION_REDUCTION";
  direction: "POSITIVE" | "NEGATIVE" | "MIXED";
  amountUsd: number | null;
  directRecipientSymbol: string | null;
  spendingCategories: string[];
  status: "ANNOUNCED" | "PLANNED" | "COMPLETED" | "CANCELLED" | null;
  sourceUrl: string | null;
  sourcePublishedAt: ISO8601;
  detectedAt: ISO8601;
  evidenceSpans: Array<{ field: string; start: number; end: number; text: string }>;
  rawPayloadHash: string;
  mode: DataMode;
}

interface TradeCandidate {
  candidateId: string;
  event: ExtractedEvent;
  targetSymbol: string;
  direction: Direction;
  graphPath: Array<{ fromSymbol: string; toSymbol: string; relationshipType: string; sourceUrl: string; verifiedAt: ISO8601 }>;
  evaluatedAt: ISO8601;
  hubRelativeReturnPct: number;
  targetRelativeReturnPct: number;
  relativeVolume: number;
  marketConfirmed: boolean;
  mode: DataMode;
}

interface OptionLeg {
  contractSymbol: string;
  optionType: "CALL" | "PUT";
  strikeUsd: number;
  bidUsd: number;
  askUsd: number;
  quoteAt: ISO8601;
}

interface OptionSpread {
  strategy: "BULL_CALL_DEBIT" | "BEAR_PUT_DEBIT";
  underlyingSymbol: string;
  expirationDate: string;
  longLeg: OptionLeg;
  shortLeg: OptionLeg;
  quantity: number;
  limitDebitUsd: number;
  maxLossUsd: number;
  maxProfitUsd: number;
  liquidationValueUsd: number;
  feed: string | null;
}

interface TradeDecision {
  decisionId: string;
  candidateId: string;
  decision: "APPROVE" | "REJECT";
  decidedAt: ISO8601;
  spread: OptionSpread | null;
  rejectionReasons: RejectionReason[];
  riskChecks: Array<{
    code: string;
    passed: boolean;
    actual: number | boolean | null;
    limit: number | boolean | null;
    unit: "USD" | "PERCENT" | "COUNT" | "BOOLEAN" | null;
  }>;
  explanation: string;
  mode: DataMode;
}

interface OrderResult {
  decisionId: string;
  clientOrderId: string;
  alpacaOrderId: string | null;
  status: "NOT_SUBMITTED" | "ACCEPTED" | "PARTIALLY_FILLED" | "FILLED" | "REJECTED" | "CANCELED" | "EXPIRED" | "UNKNOWN";
  submittedAt: ISO8601 | null;
  updatedAt: ISO8601;
  filledQuantity: number;
  averageFillDebitUsd: number | null;
  rejectionReason: RejectionReason | null;
  mode: "LIVE_PAPER";
}
```

Contract rules:

- IDs are opaque strings. Symbols are uppercase. Enum values use `SCREAMING_SNAKE_CASE`; object fields use `camelCase`.
- Instants are UTC RFC 3339 strings; exchange-session calculations use America/New_York. `expirationDate` is `YYYY-MM-DD`.
- `amountUsd` is absolute dollars. Option bids, asks, and debit are USD per share; totals include quantity and the 100 multiplier.
- Returns ending in `Pct` are percentage points (`1.25` means 1.25%). `relativeVolume` is a unitless ratio (`1.5` means 150%).
- Evidence offsets are zero-based, start-inclusive/end-exclusive UTF-16 offsets into normalized source text.
- Unknown but permitted values use `null`; missing required values are invalid. Do not use `undefined` or empty strings across boundaries.
- `spread` is null on rejection; `rejectionReasons` is non-empty on rejection and empty on approval.
- `LIVE_PAPER`, `REPLAY`, and `SIMULATED` values never share a P&L total. Only `LIVE_PAPER` reaches the order adapter; replay/simulation never creates `OrderResult`.

## Dev A — Intelligence and Product

Dev A owns Alpaca news ingestion, structured LLM event extraction, strict schema/evidence validation, simplified supplier mapping if feasible, `TradeCandidate` generation, replay/demo data, the decision timeline and rejection funnel UI, README/submission copy, and the demo video. Existing ingestion lives in `src/server/news/`, `scripts/news-ingestor.mts`, `db/migrations/0001_news_ingestor.sql`, and `/api/health/news`.

## Dev B — Trading and Execution

Dev B owns Alpaca paper-account authentication, bars/snapshots/RVOL, option contracts/chains/quotes, bullish call and bearish put debit spreads, deterministic risk, multi-leg paper submission, order/position monitoring, exit handling, conservative P&L, and the kill switch.

## Shared Integration

Integration covers the `TradeCandidate` handoff, one successful end-to-end paper spread, one rejected-trade demonstration, one replay demonstration, final UI wiring, meaningful Alpaca MCP or CLI use with non-secret evidence, a backup recording, and submission verification. Each integration row below still has one primary owner.

## Execution Order

### P0 — Submission blocking

Finish only the demonstrable vertical slice. Reliability work is limited to safeguards necessary to prevent unintended or duplicate paper orders.

### P1 — Demo quality

Improve evidence presentation, replay clarity, system health, MCP/CLI proof, submission copy, and recording quality after the slice works.

### P2 — Cut unless P0 is complete

Cut supplier-graph expansion, advanced quantitative models, multiple agent personas, global expansion, extensive backtesting, a full baseline framework, critic animation, complex graph interaction, confidence calibration, and additional strategies. Preserve the historical backlog documents.

## Status Board

| ID | Priority | Owner | Task | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|---|
| A-01 | P0 | Dev A | Freeze contracts in `src/lib/trading-contracts.ts` | None | Exports match this document; typecheck passes; Dev B confirms import | TODO |
| B-01 | P0 | Dev B | Verify paper auth, options level, feed, clock, and kill-switch default | A-01 | Read-only preflight records paper endpoint, capabilities, feed, and timestamp without secrets; entries stay disabled on failure | TODO |
| A-02 | P0 | Dev A | Implement structured extraction plus schema/evidence rejection | A-01; `src/server/news/` | Supported fixture yields `ExtractedEvent`; malformed, unsupported, or invented-field fixtures yield reason-coded rejection | TODO |
| B-02 | P0 | Dev B | Fetch completed stock bars/snapshots and calculate market confirmation/RVOL | A-01; B-01 | Actor/target/SMH timestamps are stored; completed 15-minute bar and same-slot history produce reproducible gates; missing data rejects | TODO |
| A-03 | P0 | Dev A | Generate candidate from simplified verified mapping and replay fixture | A-02 | One replay produces a `TradeCandidate` with sourced path and `REPLAY` label; no path gives `NO_VERIFIED_SUPPLIER` | TODO |
| B-03 | P0 | Dev B | Select valid bull-call or bear-put debit spread from Alpaca chain/quotes | B-01; A-01 | Same-expiry 7–21 DTE legs have two-sided quotes, correct strikes, conservative debit, max loss/profit, and feed label | TODO |
| B-04 | P0 | Dev B | Implement deterministic risk decision and kill switch | B-03 | Tests prove trade/open-risk/position/direction/daily-stop/8% drawdown limits; failures have stable reasons | TODO |
| B-05 | P0 | Dev B | Submit one idempotent DAY multi-leg order to Alpaca paper | B-04; B-01 | Reconcile first; stable client ID creates at most one paper order; broker state persists; live endpoint is unreachable | TODO |
| A-04 | P0 | Dev A | Connect candidate/decision/rejection timeline and funnel to UI | A-03; B-04 | UI shows evidence, market gates, spread/risk, and one reason-coded rejection; every card shows data mode | TODO |
| B-06 | P0 | Dev B | Monitor order/position and report exits plus conservative P&L | B-05 | Projection shows broker status, fills, position, liquidation and realized P&L, and kill switch; simulated values remain separate | TODO |
| A-05 | P0 | Dev A | Integrate replay/candidate path into trading boundary | A-03; B-02; B-04 | Replay runs extraction → candidate → decision without order submission; trace IDs connect each step | TODO |
| B-07 | P0 | Dev B | Complete live-paper candidate-to-order integration attempt | A-03; B-02; B-03; B-04; B-05 | Approved `LIVE_PAPER` candidate reaches a paper result or exact broker blocker; rejection cannot mutate orders | TODO |
| A-06 | P1 | Dev A | Polish UI labels and decision narrative | A-04; B-06 | Paper, replay, and simulation are visually distinct; trade and rejection are clear without logs | TODO |
| B-08 | P1 | Dev B | Exercise and record meaningful Alpaca MCP or CLI usage | B-01 | Account/options/order verification records tool, purpose, timestamp, and result without credentials | TODO |
| A-07 | P1 | Dev A | Write submission description, final README, and limitations | A-06; B-07; B-08 | Setup is reproducible; caveats/results are accurate; no profitability claim | TODO |
| B-09 | P1 | Dev B | Run final lint, typecheck, tests, build, and secret scan | A-07 | Outputs are recorded; no credentials/artifacts are tracked; blockers are named | BLOCKED |
| A-08 | P1 | Dev A | Record primary and backup videos and verify submission | A-07; B-09 | Video shows replay, rejection, paper status/P&L, and MCP/CLI evidence; links open in a clean session | TODO |
| A-09 | P2 | Dev A | Expand supplier graph and agent/UX concepts | All P0 | Remains cut unless every P0 row is `DONE` | CUT |
| B-10 | P2 | Dev B | Add advanced models, global universe, extensive backtests, and strategies | All P0 | Remains cut unless every P0 row is `DONE` | CUT |

Every row is scoped to 30–120 minutes. `NI-01` through `NI-10` in `docs/system-backlog/01-news-ingestor.md` are already marked complete; validate rather than rebuild them.

Current validation baseline: lint, TypeScript typecheck, and the news-ingestor tests pass. `pnpm build` is blocked in this agent environment because Turbopack cannot bind the local port used by its CSS worker (`Operation not permitted`); rerun it in a normal local or CI environment before changing B-09 to `DONE`. No formatting script is currently defined.

## Integration Checkpoints

- **T+2 hours:** interfaces frozen and Alpaca connectivity verified.
- **T+4 hours:** news/extraction and market-data paths individually working.
- **T+6 hours:** first integrated candidate-to-order attempt.
- **T+8 hours:** monitoring, rejection handling and UI connected.
- **Final phase:** tests, video, README and submission.

If a checkpoint slips, cut P1 immediately. Never weaken evidence validation, risk checks, paper-only routing, idempotency, monitoring, or result labelling.

## Definition of Done

The project is submission-ready only when:

- It uses Alpaca Trading API.
- It meaningfully uses Alpaca MCP or CLI.
- It incorporates options.
- It makes autonomous decisions.
- It applies deterministic risk checks before execution.
- It can submit a paper multi-leg debit spread.
- It reports order status and P&L.
- It visibly explains trades and rejections.
- Replay/simulated results are clearly labelled.
- No secrets exist in committed files.
- The README contains setup and demo instructions.
