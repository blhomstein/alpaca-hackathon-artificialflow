/**
 * Data contracts mirrored from FlowGraph_AI_AGENT_BUILD_SPEC.md §7.
 * The UI is read-only: it renders what the runtime persisted, and never
 * invents a field the spec says must be evidence-backed.
 */

export type Symbol_ =
  | "MSFT"
  | "META"
  | "ORCL"
  | "NVDA"
  | "AMD"
  | "AVGO"
  | "ANET"
  | "VRT";

export type Benchmark = "SMH" | "QQQ";

export type EventType =
  | "ai_capex_change"
  | "infrastructure_cloud_contract"
  | "investment_financing"
  | "supply_capacity"
  | "cancellation_reduction";

export type Direction = "positive" | "negative" | "mixed";

export type EvidenceSpan = {
  field: string;
  start: number;
  end: number;
  text: string;
};

export type CapitalFlowEvent = {
  eventId: string;
  actor: Symbol_;
  eventType: EventType;
  direction: Direction;
  amountUsd: number | null;
  directRecipient: Symbol_ | null;
  spendingCategories: string[];
  status: "announced" | "planned" | "completed" | "cancelled" | null;
  headline: string;
  source: string;
  sourceUrl: string;
  sourceTs: string;
  detectedTs: string;
  evidenceSpans: EvidenceSpan[];
  rawPayloadHash: string;
  /** Two trading sessions of life, per §8. */
  activeUntil: string;
  state: "active" | "expired" | "rejected";
  bodyExcerpt: string;
};

export type RelationshipType =
  | "supplier"
  | "customer"
  | "cloud"
  | "compute"
  | "networking"
  | "data_center";

export type CapitalFlowEdge = {
  edgeId: string;
  fromSymbol: Symbol_;
  toSymbol: Symbol_;
  relationshipType: RelationshipType;
  categories: string[];
  sourceUrl: string;
  sourceLabel: string;
  verifiedAt: string;
};

export type MarketSnapshot = {
  target: Symbol_;
  asOf: string;
  hubRelativeReturn: number;
  targetRelativeReturn: number;
  benchmarkReturn: number;
  lastBarDirection: "up" | "down" | "flat";
  rvol: number;
  lastPrice: number;
  barInterval: "15m";
  barCompletedAt: string;
};

export type OptionLeg = {
  side: "buy" | "sell";
  optionType: "call" | "put";
  symbol: string;
  strike: number;
  expiry: string;
  bid: number;
  ask: number;
  mid: number;
  delta: number;
  iv: number;
  openInterest: number;
  volume: number;
  quoteTs: string;
  tradable: boolean;
};

export type OptionSnapshot = {
  structure: "bull_call_debit" | "bear_put_debit";
  dte: number;
  legs: [OptionLeg, OptionLeg];
  strikeWidth: number;
  conservativeEntry: number;
  monitoringMark: number;
  liquidationValue: number;
  contracts: number;
  maxLoss: number;
  maxProfit: number;
  rewardRisk: number;
};

export type CriticObjectionCode =
  | "UNSUPPORTED_RELATIONSHIP"
  | "CONTRADICTORY_EVENT"
  | "STALE_INFORMATION"
  | "ALREADY_PRICED"
  | "DIRECTION_UNCLEAR"
  | "DATA_INCONSISTENCY";

export type CriticResult = {
  verdict: "NO_OBJECTION" | "SOFT_WARNING" | "HARD_VETO";
  latencyMs: number;
  objections: Array<{
    code: CriticObjectionCode;
    explanation: string;
    evidenceRefs: string[];
  }>;
};

export type InvariantResult = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

export type ExecutionEvent = {
  ts: string;
  kind: "submitted" | "accepted" | "partial_fill" | "filled" | "cancel_requested" | "canceled" | "expired" | "replaced" | "note";
  message: string;
  orderId?: string;
};

export type TradeDossier = {
  dossierId: string;
  createdTs: string;
  target: Symbol_;
  event: CapitalFlowEvent;
  graphPath: CapitalFlowEdge[];
  marketSnapshot: MarketSnapshot;
  optionSnapshot: OptionSnapshot | null;
  critic: CriticResult;
  invariants: InvariantResult[];
  decision: "TRADE" | "REJECT";
  rejectionReasons: string[];
  riskBefore: RiskSnapshot;
  riskAfter: RiskSnapshot | null;
  idempotencyKey: string | null;
  executionEvents: ExecutionEvent[];
  positionId: string | null;
};

export type RiskSnapshot = {
  openTheoreticalLoss: number;
  openPositions: number;
  sameDirectionPositions: number;
  markedPnlToday: number;
  equity: number;
  drawdownPct: number;
};

export type PositionState =
  | { type: "OPEN" }
  | { type: "CLOSING"; orderId: string; retry: number }
  | { type: "CANCEL_PENDING"; orderId: string; retry: number }
  | { type: "CLOSED"; closedAt: string };

export type Position = {
  positionId: string;
  dossierId: string;
  target: Symbol_;
  structure: OptionSnapshot["structure"];
  contracts: number;
  entryDebit: number;
  monitoringMark: number;
  liquidationValue: number;
  maxLoss: number;
  maxProfit: number;
  openedTs: string;
  expiry: string;
  dte: number;
  state: PositionState;
  exitTrigger:
    | "profit_target"
    | "pnl_stop"
    | "invalidation"
    | "time_stop"
    | "competition_flatten"
    | null;
  realizedPnl: number | null;
  fillVsMid: number;
  orderId: string;
  legs: [OptionLeg, OptionLeg];
};

export type FunnelStage = {
  key: string;
  label: string;
  count: number;
  note: string;
};

export type RejectionReason = {
  code: string;
  label: string;
  count: number;
};

export type HealthCheck = {
  key: string;
  label: string;
  status: "ok" | "degraded" | "down";
  value: string;
  detail: string;
  checkedTs: string;
};

export type McpCall = {
  ts: string;
  tool: string;
  purpose: string;
  ok: boolean;
  latencyMs: number;
};

export type EvalRun = {
  id: string;
  set: "development" | "holdout";
  ranAt: string;
  events: number;
  configChecksum: string;
  metrics: Array<{ label: string; value: string; target?: string; pass: boolean }>;
};

export type BaselinePoint = {
  session: string;
  agent: number;
  baseline: number;
  smh: number;
  qqq: number;
};
