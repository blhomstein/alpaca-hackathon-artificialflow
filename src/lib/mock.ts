import type {
  BaselinePoint,
  CapitalFlowEdge,
  CapitalFlowEvent,
  EvalRun,
  FunnelStage,
  HealthCheck,
  McpCall,
  OptionLeg,
  Position,
  RejectionReason,
  RiskSnapshot,
  Symbol_,
  TradeDossier,
} from "./types";

/**
 * Fixture layer. Every value here stands in for something the runtime would
 * persist; the shapes are the spec's shapes so swapping in the real
 * dashboard-api is a data-source change, not a UI rewrite.
 */

export const NOW = "2026-09-01T18:42:00Z";

export const HUBS: Symbol_[] = ["MSFT", "META", "ORCL"];
export const COMPUTE: Symbol_[] = ["NVDA", "AMD", "AVGO"];
export const INFRA: Symbol_[] = ["ANET", "VRT"];
export const BENCHMARKS = ["SMH", "QQQ"] as const;

export const SYMBOL_NAMES: Record<string, string> = {
  MSFT: "Microsoft",
  META: "Meta Platforms",
  ORCL: "Oracle",
  NVDA: "NVIDIA",
  AMD: "Advanced Micro Devices",
  AVGO: "Broadcom",
  ANET: "Arista Networks",
  VRT: "Vertiv Holdings",
  SMH: "VanEck Semiconductor ETF",
  QQQ: "Invesco QQQ Trust",
};

export const SYMBOL_ROLE: Record<string, "hub" | "compute" | "infra" | "benchmark"> = {
  MSFT: "hub",
  META: "hub",
  ORCL: "hub",
  NVDA: "compute",
  AMD: "compute",
  AVGO: "compute",
  ANET: "infra",
  VRT: "infra",
  SMH: "benchmark",
  QQQ: "benchmark",
};

/* ------------------------------------------------------------------ */
/* Verified graph — 14 human-verified directed edges (§7.2)            */
/* ------------------------------------------------------------------ */

export const EDGES: CapitalFlowEdge[] = [
  {
    edgeId: "E-01",
    fromSymbol: "MSFT",
    toSymbol: "NVDA",
    relationshipType: "compute",
    categories: ["gpu_accelerators", "ai_training"],
    sourceUrl: "https://www.microsoft.com/investor/reports/ar25/",
    sourceLabel: "MSFT FY25 annual report",
    verifiedAt: "2026-08-29",
  },
  {
    edgeId: "E-02",
    fromSymbol: "MSFT",
    toSymbol: "AMD",
    relationshipType: "compute",
    categories: ["gpu_accelerators", "inference"],
    sourceUrl: "https://ir.amd.com/news-events/press-releases",
    sourceLabel: "AMD MI300 Azure press release",
    verifiedAt: "2026-08-29",
  },
  {
    edgeId: "E-03",
    fromSymbol: "MSFT",
    toSymbol: "ANET",
    relationshipType: "networking",
    categories: ["datacenter_networking", "ethernet_fabric"],
    sourceUrl: "https://investors.arista.com/",
    sourceLabel: "ANET 10-K customer concentration",
    verifiedAt: "2026-08-30",
  },
  {
    edgeId: "E-04",
    fromSymbol: "MSFT",
    toSymbol: "VRT",
    relationshipType: "data_center",
    categories: ["power", "thermal_management"],
    sourceUrl: "https://investors.vertiv.com/",
    sourceLabel: "VRT hyperscaler backlog disclosure",
    verifiedAt: "2026-08-30",
  },
  {
    edgeId: "E-05",
    fromSymbol: "META",
    toSymbol: "NVDA",
    relationshipType: "compute",
    categories: ["gpu_accelerators", "ai_training"],
    sourceUrl: "https://investor.atmeta.com/",
    sourceLabel: "META capex commentary Q2 FY26",
    verifiedAt: "2026-08-29",
  },
  {
    edgeId: "E-06",
    fromSymbol: "META",
    toSymbol: "ANET",
    relationshipType: "networking",
    categories: ["datacenter_networking"],
    sourceUrl: "https://investors.arista.com/",
    sourceLabel: "ANET 10-K customer concentration",
    verifiedAt: "2026-08-30",
  },
  {
    edgeId: "E-07",
    fromSymbol: "META",
    toSymbol: "VRT",
    relationshipType: "data_center",
    categories: ["power", "cooling"],
    sourceUrl: "https://investors.vertiv.com/",
    sourceLabel: "VRT investor day deck",
    verifiedAt: "2026-08-30",
  },
  {
    edgeId: "E-08",
    fromSymbol: "ORCL",
    toSymbol: "NVDA",
    relationshipType: "compute",
    categories: ["gpu_accelerators", "oci_supercluster"],
    sourceUrl: "https://investor.oracle.com/",
    sourceLabel: "ORCL OCI Supercluster release",
    verifiedAt: "2026-08-29",
  },
  {
    edgeId: "E-09",
    fromSymbol: "ORCL",
    toSymbol: "AMD",
    relationshipType: "compute",
    categories: ["gpu_accelerators"],
    sourceUrl: "https://investor.oracle.com/",
    sourceLabel: "ORCL / AMD MI355X announcement",
    verifiedAt: "2026-08-29",
  },
  {
    edgeId: "E-10",
    fromSymbol: "ORCL",
    toSymbol: "VRT",
    relationshipType: "data_center",
    categories: ["power", "thermal_management"],
    sourceUrl: "https://investors.vertiv.com/",
    sourceLabel: "VRT Q2 FY26 earnings call",
    verifiedAt: "2026-08-30",
  },
  {
    edgeId: "E-11",
    fromSymbol: "NVDA",
    toSymbol: "AVGO",
    relationshipType: "supplier",
    categories: ["custom_silicon", "serdes", "optics"],
    sourceUrl: "https://investors.broadcom.com/",
    sourceLabel: "AVGO AI networking segment disclosure",
    verifiedAt: "2026-08-30",
  },
  {
    edgeId: "E-12",
    fromSymbol: "META",
    toSymbol: "AVGO",
    relationshipType: "supplier",
    categories: ["custom_silicon", "mtia"],
    sourceUrl: "https://investors.broadcom.com/",
    sourceLabel: "AVGO custom accelerator customer disclosure",
    verifiedAt: "2026-08-30",
  },
  {
    edgeId: "E-13",
    fromSymbol: "ANET",
    toSymbol: "AVGO",
    relationshipType: "supplier",
    categories: ["switch_silicon", "tomahawk"],
    sourceUrl: "https://investors.arista.com/",
    sourceLabel: "ANET 10-K supplier dependency",
    verifiedAt: "2026-08-30",
  },
  {
    edgeId: "E-14",
    fromSymbol: "MSFT",
    toSymbol: "AVGO",
    relationshipType: "supplier",
    categories: ["custom_silicon", "optics"],
    sourceUrl: "https://investors.broadcom.com/",
    sourceLabel: "AVGO hyperscaler ASIC commentary",
    verifiedAt: "2026-08-30",
  },
];

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

const ORCL_BODY =
  "Oracle said Monday it will spend an additional $9.4 billion through fiscal 2027 to expand OCI Supercluster capacity across three new US regions, with the buildout weighted toward liquid-cooled GPU racks and high-radix ethernet fabric. The company described the program as announced and fully funded from operating cash flow.";

export const EVENTS: CapitalFlowEvent[] = [
  {
    eventId: "EV-2026-0901-003",
    actor: "ORCL",
    eventType: "ai_capex_change",
    direction: "positive",
    amountUsd: 9_400_000_000,
    directRecipient: null,
    spendingCategories: ["gpu_accelerators", "datacenter_networking", "power"],
    status: "announced",
    headline: "Oracle lifts OCI capacity spend by $9.4B for FY27 Supercluster buildout",
    source: "Benzinga via Alpaca News",
    sourceUrl: "https://www.benzinga.com/news/oracle-oci-capacity-expansion",
    sourceTs: "2026-09-01T13:31:00Z",
    detectedTs: "2026-09-01T13:31:42Z",
    evidenceSpans: [
      { field: "amountUsd", start: 41, end: 60, text: "$9.4 billion through" },
      { field: "actor", start: 0, end: 6, text: "Oracle" },
      { field: "eventType", start: 61, end: 108, text: "fiscal 2027 to expand OCI Supercluster capacity" },
      { field: "status", start: 246, end: 255, text: "announced" },
      { field: "spendingCategories", start: 175, end: 232, text: "liquid-cooled GPU racks and high-radix ethernet fabric" },
    ],
    rawPayloadHash: "sha256:4f1c…a907",
    activeUntil: "2026-09-03T20:00:00Z",
    state: "active",
    bodyExcerpt: ORCL_BODY,
  },
  {
    eventId: "EV-2026-0901-002",
    actor: "META",
    eventType: "infrastructure_cloud_contract",
    direction: "positive",
    amountUsd: null,
    directRecipient: "AVGO",
    spendingCategories: ["custom_silicon"],
    status: "announced",
    headline: "Meta expands custom accelerator program with Broadcom for next MTIA generation",
    source: "Reuters via Alpaca News",
    sourceUrl: "https://www.reuters.com/technology/meta-broadcom-mtia",
    sourceTs: "2026-09-01T11:04:00Z",
    detectedTs: "2026-09-01T11:04:19Z",
    evidenceSpans: [
      { field: "actor", start: 0, end: 4, text: "Meta" },
      { field: "directRecipient", start: 41, end: 49, text: "Broadcom" },
      { field: "status", start: 88, end: 97, text: "announced" },
    ],
    rawPayloadHash: "sha256:9b20…31de",
    activeUntil: "2026-09-03T20:00:00Z",
    state: "active",
    bodyExcerpt:
      "Meta and Broadcom announced an expanded multi-year collaboration covering the next generation of Meta's MTIA custom accelerator. Neither company disclosed the contract value.",
  },
  {
    eventId: "EV-2026-0901-001",
    actor: "MSFT",
    eventType: "supply_capacity",
    direction: "positive",
    amountUsd: null,
    directRecipient: null,
    spendingCategories: ["power", "thermal_management"],
    status: "planned",
    headline: "Microsoft outlines Fairwater datacenter power procurement for 2027 capacity",
    source: "Bloomberg via Alpaca News",
    sourceUrl: "https://www.bloomberg.com/news/microsoft-fairwater-power",
    sourceTs: "2026-09-01T09:12:00Z",
    detectedTs: "2026-09-01T09:12:33Z",
    evidenceSpans: [
      { field: "actor", start: 0, end: 9, text: "Microsoft" },
      { field: "status", start: 63, end: 70, text: "planned" },
    ],
    rawPayloadHash: "sha256:1ea7…77c3",
    activeUntil: "2026-09-03T20:00:00Z",
    state: "active",
    bodyExcerpt:
      "Microsoft detailed planned power procurement for its Fairwater datacenter campuses, covering capacity it expects to energize in 2027. No spend figure was disclosed.",
  },
  {
    eventId: "EV-2026-0831-004",
    actor: "META",
    eventType: "ai_capex_change",
    direction: "positive",
    amountUsd: 6_100_000_000,
    directRecipient: null,
    spendingCategories: ["gpu_accelerators", "datacenter_networking"],
    status: "announced",
    headline: "Meta raises FY26 capex floor by $6.1B citing AI training demand",
    source: "Dow Jones via Alpaca News",
    sourceUrl: "https://www.wsj.com/tech/meta-capex-raise",
    sourceTs: "2026-08-31T14:02:00Z",
    detectedTs: "2026-08-31T14:02:11Z",
    evidenceSpans: [
      { field: "actor", start: 0, end: 4, text: "Meta" },
      { field: "amountUsd", start: 33, end: 45, text: "$6.1 billion" },
      { field: "status", start: 120, end: 129, text: "announced" },
    ],
    rawPayloadHash: "sha256:c410…ba58",
    activeUntil: "2026-09-02T20:00:00Z",
    state: "active",
    bodyExcerpt:
      "Meta raised the floor of its fiscal 2026 capital expenditure guidance by $6.1 billion, an increase the company announced alongside commentary on AI training capacity constraints.",
  },
  {
    eventId: "EV-2026-0831-002",
    actor: "ORCL",
    eventType: "cancellation_reduction",
    direction: "negative",
    amountUsd: null,
    directRecipient: null,
    spendingCategories: ["data_center_leases"],
    status: "cancelled",
    headline: "Oracle walks away from two European colocation leases",
    source: "Benzinga via Alpaca News",
    sourceUrl: "https://www.benzinga.com/news/oracle-colocation-leases",
    sourceTs: "2026-08-31T10:47:00Z",
    detectedTs: "2026-08-31T10:47:26Z",
    evidenceSpans: [
      { field: "actor", start: 0, end: 6, text: "Oracle" },
      { field: "status", start: 7, end: 22, text: "walks away from" },
    ],
    rawPayloadHash: "sha256:77af…0d12",
    activeUntil: "2026-09-02T20:00:00Z",
    state: "expired",
    bodyExcerpt:
      "Oracle has cancelled two European colocation leases signed in 2024, according to people familiar with the matter. Oracle declined to comment on the financial impact.",
  },
  {
    eventId: "EV-2026-0831-001",
    actor: "MSFT",
    eventType: "ai_capex_change",
    direction: "mixed",
    amountUsd: null,
    directRecipient: null,
    spendingCategories: [],
    status: null,
    headline: "Analyst note speculates Microsoft may 'digest' AI capex into 2027",
    source: "Benzinga via Alpaca News",
    sourceUrl: "https://www.benzinga.com/analyst-ratings/microsoft-capex-digestion",
    sourceTs: "2026-08-31T08:20:00Z",
    detectedTs: "2026-08-31T08:20:04Z",
    evidenceSpans: [],
    rawPayloadHash: "sha256:2bd9…4411",
    activeUntil: "2026-08-31T08:20:04Z",
    state: "rejected",
    bodyExcerpt:
      "A sell-side note argues Microsoft could enter a digestion phase for AI capital spending in calendar 2027. The note contains no company statement and no figures.",
  },
];

export const eventById = (id: string) => EVENTS.find((e) => e.eventId === id);

/* ------------------------------------------------------------------ */
/* Option legs                                                         */
/* ------------------------------------------------------------------ */

const leg = (o: Partial<OptionLeg> & Pick<OptionLeg, "side" | "optionType" | "symbol" | "strike" | "expiry" | "bid" | "ask" | "delta">): OptionLeg => ({
  mid: Number(((o.bid + o.ask) / 2).toFixed(2)),
  iv: 0.42,
  openInterest: 1840,
  volume: 316,
  quoteTs: "2026-09-01T18:41:52Z",
  tradable: true,
  ...o,
});

const VRT_LEGS: [OptionLeg, OptionLeg] = [
  leg({ side: "buy", optionType: "call", symbol: "VRT260918C00142000", strike: 142, expiry: "2026-09-18", bid: 4.15, ask: 4.45, delta: 0.42, iv: 0.51, openInterest: 2410, volume: 588 }),
  leg({ side: "sell", optionType: "call", symbol: "VRT260918C00152000", strike: 152, expiry: "2026-09-18", bid: 1.28, ask: 1.46, delta: 0.24, iv: 0.49, openInterest: 1633, volume: 402 }),
];

const AVGO_LEGS: [OptionLeg, OptionLeg] = [
  leg({ side: "buy", optionType: "call", symbol: "AVGO260911C00385000", strike: 385, expiry: "2026-09-11", bid: 9.10, ask: 9.65, delta: 0.44, iv: 0.38, openInterest: 3120, volume: 941 }),
  leg({ side: "sell", optionType: "call", symbol: "AVGO260911C00400000", strike: 400, expiry: "2026-09-11", bid: 3.35, ask: 3.70, delta: 0.27, iv: 0.37, openInterest: 2205, volume: 720 }),
];

const ANET_LEGS: [OptionLeg, OptionLeg] = [
  leg({ side: "buy", optionType: "call", symbol: "ANET260911C00148000", strike: 148, expiry: "2026-09-11", bid: 3.55, ask: 3.85, delta: 0.41, iv: 0.44, openInterest: 1490, volume: 261 }),
  leg({ side: "sell", optionType: "call", symbol: "ANET260911C00156000", strike: 156, expiry: "2026-09-11", bid: 1.20, ask: 1.40, delta: 0.25, iv: 0.43, openInterest: 980, volume: 188 }),
];

/* ------------------------------------------------------------------ */
/* Risk snapshots                                                      */
/* ------------------------------------------------------------------ */

export const RISK_LIMITS = {
  maxLossPerTrade: 1200,
  maxOpenLoss: 5000,
  maxPositions: 3,
  maxSameDirection: 2,
  dailyStop: -3000,
  killSwitchDrawdownPct: 8,
  dteMin: 7,
  dteMax: 21,
  hubRepriceThreshold: 0.012,
  targetFullyRepricedThreshold: 0.008,
  rvolThreshold: 1.5,
  deltaTarget: 0.42,
  maxSpreadWidth: 15,
  configChecksum: "cfg-sha256:8d31c7…f042",
  frozenAt: "2026-08-31T21:15:00Z",
};

/**
 * The arithmetic that ties the whole dashboard together:
 *   realized (closed)      −90   = +462 (POS-0018) − 552 (POS-0022)
 *   unrealized conservative +361 = (3.44−3.15)×300 + (6.95−5.58)×200
 *   marked cumulative       +271 → equity 100,271
 *   open theoretical risk  2,061 = 945 (POS-0043) + 1,116 (POS-0031)
 */
export const RISK_NOW: RiskSnapshot = {
  openTheoreticalLoss: 2_061,
  openPositions: 2,
  sameDirectionPositions: 2,
  markedPnlToday: 181,
  equity: 100_271,
  drawdownPct: 0.34,
};

const riskBefore: RiskSnapshot = {
  openTheoreticalLoss: 1_116,
  openPositions: 1,
  sameDirectionPositions: 1,
  markedPnlToday: 62,
  equity: 100_152,
  drawdownPct: 0.46,
};

/* ------------------------------------------------------------------ */
/* Dossiers                                                            */
/* ------------------------------------------------------------------ */

const INVARIANTS = (overrides: Record<string, { passed: boolean; detail: string }> = {}) =>
  [
    ["IV-01", "Event schema valid", "All required fields present and typed"],
    ["IV-02", "No invented fields", "5 of 5 non-null fields carry evidence spans"],
    ["IV-03", "Documented graph path", "ORCL → VRT via E-10"],
    ["IV-04", "Path ≤ 2 hops", "1 hop"],
    ["IV-05", "Event fresh & unique", "Age 5h 11m · hash unseen"],
    ["IV-06", "Both legs tradable", "Alpaca contract status: active"],
    ["IV-07", "Fresh two-sided quotes", "Quote age 8s / 8s"],
    ["IV-08", "Nonzero bids", "4.15 / 1.28"],
    ["IV-09", "Quoted sizes acceptable", "12 × 18 contracts at NBBO"],
    ["IV-10", "Spread width within limit", "10.00 ≤ 15.00"],
    ["IV-11", "Position & portfolio risk", "Max loss 951 ≤ 1,200"],
    ["IV-12", "Daily stop inactive", "Marked P&L +181.00"],
    ["IV-13", "Kill switch inactive", "Drawdown 0.34% < 8%"],
    ["IV-14", "No critic hard veto", "Verdict NO_OBJECTION"],
  ].map(([id, label, detail]) => ({
    id,
    label,
    detail: overrides[id]?.detail ?? detail,
    passed: overrides[id]?.passed ?? true,
  }));

export const DOSSIERS: TradeDossier[] = [
  {
    dossierId: "DS-0901-0043",
    createdTs: "2026-09-01T18:42:00Z",
    target: "VRT",
    event: EVENTS[0],
    graphPath: [EDGES[9]],
    marketSnapshot: {
      target: "VRT",
      asOf: "2026-09-01T18:42:00Z",
      hubRelativeReturn: 0.0231,
      targetRelativeReturn: 0.0044,
      benchmarkReturn: 0.0037,
      lastBarDirection: "up",
      rvol: 2.14,
      lastPrice: 141.62,
      barInterval: "15m",
      barCompletedAt: "2026-09-01T18:30:00Z",
    },
    optionSnapshot: {
      structure: "bull_call_debit",
      dte: 17,
      legs: VRT_LEGS,
      strikeWidth: 10,
      conservativeEntry: 3.17,
      monitoringMark: 2.93,
      liquidationValue: 2.69,
      contracts: 3,
      maxLoss: 951,
      maxProfit: 2049,
      rewardRisk: 2.15,
    },
    critic: {
      verdict: "NO_OBJECTION",
      latencyMs: 2140,
      objections: [],
    },
    invariants: INVARIANTS(),
    decision: "TRADE",
    rejectionReasons: [],
    riskBefore,
    riskAfter: RISK_NOW,
    idempotencyKey: "fg:DS-0901-0043:VRT:bull_call:142/152:260918",
    executionEvents: [
      { ts: "2026-09-01T18:42:03Z", kind: "submitted", message: "mleg DAY limit 3.17 debit · 3 contracts", orderId: "a4f1-90c2" },
      { ts: "2026-09-01T18:42:04Z", kind: "accepted", message: "Alpaca accepted order", orderId: "a4f1-90c2" },
      { ts: "2026-09-01T18:42:31Z", kind: "partial_fill", message: "1 of 3 filled at 3.14", orderId: "a4f1-90c2" },
      { ts: "2026-09-01T18:43:12Z", kind: "filled", message: "3 of 3 filled · avg 3.15 · fill vs mid −0.02", orderId: "a4f1-90c2" },
    ],
    positionId: "POS-0043",
  },
  {
    dossierId: "DS-0901-0042",
    createdTs: "2026-09-01T15:10:00Z",
    target: "AVGO",
    event: EVENTS[1],
    graphPath: [EDGES[11]],
    marketSnapshot: {
      target: "AVGO",
      asOf: "2026-09-01T15:10:00Z",
      hubRelativeReturn: 0.0187,
      targetRelativeReturn: 0.0051,
      benchmarkReturn: 0.0022,
      lastBarDirection: "up",
      rvol: 1.87,
      lastPrice: 383.4,
      barInterval: "15m",
      barCompletedAt: "2026-09-01T15:00:00Z",
    },
    optionSnapshot: {
      structure: "bull_call_debit",
      dte: 10,
      legs: AVGO_LEGS,
      strikeWidth: 15,
      conservativeEntry: 6.3,
      monitoringMark: 5.85,
      liquidationValue: 5.4,
      contracts: 2,
      maxLoss: 1260,
      maxProfit: 1740,
      rewardRisk: 1.38,
    },
    critic: { verdict: "SOFT_WARNING", latencyMs: 1980, objections: [{ code: "ALREADY_PRICED", explanation: "AVGO has already recovered 62% of the hub's relative move in the two bars since the headline; remaining convergence may be thin.", evidenceRefs: ["marketSnapshot.targetRelativeReturn", "EV-2026-0901-002"] }] },
    invariants: INVARIANTS({
      "IV-03": { passed: true, detail: "META → AVGO via E-12" },
      "IV-11": { passed: false, detail: "Max loss 1,260 exceeds per-trade cap of 1,200" },
    }),
    decision: "REJECT",
    rejectionReasons: ["MAX_LOSS_EXCEEDED"],
    riskBefore,
    riskAfter: null,
    idempotencyKey: null,
    executionEvents: [{ ts: "2026-09-01T15:10:02Z", kind: "note", message: "No order submitted — deterministic invariant IV-11 failed" }],
    positionId: null,
  },
  {
    dossierId: "DS-0901-0041",
    createdTs: "2026-09-01T14:25:00Z",
    target: "ANET",
    event: EVENTS[3],
    graphPath: [EDGES[5]],
    marketSnapshot: {
      target: "ANET",
      asOf: "2026-09-01T14:25:00Z",
      hubRelativeReturn: 0.0164,
      targetRelativeReturn: 0.0021,
      benchmarkReturn: 0.0009,
      lastBarDirection: "up",
      rvol: 1.12,
      lastPrice: 146.9,
      barInterval: "15m",
      barCompletedAt: "2026-09-01T14:15:00Z",
    },
    optionSnapshot: {
      structure: "bull_call_debit",
      dte: 10,
      legs: ANET_LEGS,
      strikeWidth: 8,
      conservativeEntry: 2.65,
      monitoringMark: 2.4,
      liquidationValue: 2.15,
      contracts: 4,
      maxLoss: 1060,
      maxProfit: 2140,
      rewardRisk: 2.02,
    },
    critic: { verdict: "NO_OBJECTION", latencyMs: 1755, objections: [] },
    invariants: INVARIANTS({
      "IV-03": { passed: true, detail: "META → ANET via E-06" },
    }).concat([]),
    decision: "REJECT",
    rejectionReasons: ["RVOL_BELOW_THRESHOLD"],
    riskBefore,
    riskAfter: null,
    idempotencyKey: null,
    executionEvents: [{ ts: "2026-09-01T14:25:01Z", kind: "note", message: "No order submitted — RVOL 1.12 < 1.50 setup gate" }],
    positionId: null,
  },
  {
    dossierId: "DS-0901-0039",
    createdTs: "2026-09-01T13:40:00Z",
    target: "NVDA",
    event: EVENTS[0],
    graphPath: [EDGES[7]],
    marketSnapshot: {
      target: "NVDA",
      asOf: "2026-09-01T13:40:00Z",
      hubRelativeReturn: 0.0198,
      targetRelativeReturn: 0.0142,
      benchmarkReturn: 0.0031,
      lastBarDirection: "up",
      rvol: 1.94,
      lastPrice: 218.35,
      barInterval: "15m",
      barCompletedAt: "2026-09-01T13:30:00Z",
    },
    optionSnapshot: null,
    critic: {
      verdict: "HARD_VETO",
      latencyMs: 2310,
      objections: [
        {
          code: "ALREADY_PRICED",
          explanation:
            "NVDA's benchmark-adjusted return of +1.42% already exceeds the fully-repriced threshold of 0.80%. The convergence the setup depends on has occurred.",
          evidenceRefs: ["marketSnapshot.targetRelativeReturn", "config.targetFullyRepricedThreshold"],
        },
      ],
    },
    invariants: INVARIANTS({
      "IV-03": { passed: true, detail: "ORCL → NVDA via E-08" },
      "IV-14": { passed: false, detail: "Critic returned HARD_VETO (ALREADY_PRICED)" },
    }),
    decision: "REJECT",
    rejectionReasons: ["TARGET_ALREADY_REPRICED", "CRITIC_HARD_VETO"],
    riskBefore,
    riskAfter: null,
    idempotencyKey: null,
    executionEvents: [{ ts: "2026-09-01T13:40:03Z", kind: "note", message: "No order submitted — abstained before spread construction" }],
    positionId: null,
  },
  {
    dossierId: "DS-0831-0031",
    createdTs: "2026-08-31T17:05:00Z",
    target: "AVGO",
    event: EVENTS[3],
    graphPath: [EDGES[11]],
    marketSnapshot: {
      target: "AVGO",
      asOf: "2026-08-31T17:05:00Z",
      hubRelativeReturn: 0.0221,
      targetRelativeReturn: 0.0033,
      benchmarkReturn: 0.0014,
      lastBarDirection: "up",
      rvol: 1.71,
      lastPrice: 376.2,
      barInterval: "15m",
      barCompletedAt: "2026-08-31T17:00:00Z",
    },
    optionSnapshot: {
      structure: "bull_call_debit",
      dte: 11,
      legs: AVGO_LEGS,
      strikeWidth: 15,
      conservativeEntry: 5.6,
      monitoringMark: 5.3,
      liquidationValue: 5.05,
      contracts: 2,
      maxLoss: 1120,
      maxProfit: 1880,
      rewardRisk: 1.68,
    },
    critic: { verdict: "NO_OBJECTION", latencyMs: 1890, objections: [] },
    invariants: INVARIANTS({ "IV-03": { passed: true, detail: "META → AVGO via E-12" } }),
    decision: "TRADE",
    rejectionReasons: [],
    riskBefore: { ...riskBefore, openPositions: 0, openTheoreticalLoss: 0 },
    riskAfter: { ...riskBefore, openPositions: 1, openTheoreticalLoss: 1120 },
    idempotencyKey: "fg:DS-0831-0031:AVGO:bull_call:385/400:260911",
    executionEvents: [
      { ts: "2026-08-31T17:05:04Z", kind: "submitted", message: "mleg DAY limit 5.60 debit · 2 contracts", orderId: "77bd-1a4e" },
      { ts: "2026-08-31T17:05:05Z", kind: "accepted", message: "Alpaca accepted order", orderId: "77bd-1a4e" },
      { ts: "2026-08-31T17:06:48Z", kind: "filled", message: "2 of 2 filled · avg 5.58 · fill vs mid −0.03", orderId: "77bd-1a4e" },
    ],
    positionId: "POS-0031",
  },
  {
    dossierId: "DS-0831-0028",
    createdTs: "2026-08-31T11:12:00Z",
    target: "VRT",
    event: EVENTS[4],
    graphPath: [EDGES[9]],
    marketSnapshot: {
      target: "VRT",
      asOf: "2026-08-31T11:12:00Z",
      hubRelativeReturn: -0.0143,
      targetRelativeReturn: -0.0019,
      benchmarkReturn: 0.0008,
      lastBarDirection: "down",
      rvol: 1.44,
      lastPrice: 137.05,
      barInterval: "15m",
      barCompletedAt: "2026-08-31T11:00:00Z",
    },
    optionSnapshot: null,
    critic: { verdict: "NO_OBJECTION", latencyMs: 1640, objections: [] },
    invariants: INVARIANTS({
      "IV-03": { passed: true, detail: "ORCL → VRT via E-10" },
      "IV-07": { passed: false, detail: "Put leg quote age 41s exceeds 15s freshness bound" },
    }),
    decision: "REJECT",
    rejectionReasons: ["STALE_QUOTE", "RVOL_BELOW_THRESHOLD"],
    riskBefore,
    riskAfter: null,
    idempotencyKey: null,
    executionEvents: [{ ts: "2026-08-31T11:12:02Z", kind: "note", message: "No order submitted — abstained on stale quote" }],
    positionId: null,
  },
];

export const dossierById = (id: string) => DOSSIERS.find((d) => d.dossierId === id);
export const dossiersForEvent = (eventId: string) =>
  DOSSIERS.filter((d) => d.event.eventId === eventId);

/* ------------------------------------------------------------------ */
/* Positions                                                           */
/* ------------------------------------------------------------------ */

export const POSITIONS: Position[] = [
  {
    positionId: "POS-0043",
    dossierId: "DS-0901-0043",
    target: "VRT",
    structure: "bull_call_debit",
    contracts: 3,
    entryDebit: 3.15,
    monitoringMark: 3.62,
    liquidationValue: 3.44,
    maxLoss: 945,
    maxProfit: 2055,
    openedTs: "2026-09-01T18:43:12Z",
    expiry: "2026-09-18",
    dte: 17,
    state: { type: "OPEN" },
    exitTrigger: null,
    realizedPnl: null,
    fillVsMid: -0.02,
    orderId: "a4f1-90c2",
    legs: VRT_LEGS,
  },
  {
    positionId: "POS-0031",
    dossierId: "DS-0831-0031",
    target: "AVGO",
    structure: "bull_call_debit",
    contracts: 2,
    entryDebit: 5.58,
    monitoringMark: 7.21,
    liquidationValue: 6.95,
    maxLoss: 1116,
    maxProfit: 1884,
    openedTs: "2026-08-31T17:06:48Z",
    expiry: "2026-09-11",
    dte: 10,
    state: { type: "CLOSING", orderId: "e91c-33fa", retry: 1 },
    exitTrigger: "profit_target",
    realizedPnl: null,
    fillVsMid: -0.03,
    orderId: "77bd-1a4e",
    legs: AVGO_LEGS,
  },
  {
    positionId: "POS-0022",
    dossierId: "DS-0828-0022",
    target: "ANET",
    structure: "bull_call_debit",
    contracts: 4,
    entryDebit: 2.62,
    monitoringMark: 1.24,
    liquidationValue: 1.24,
    maxLoss: 1048,
    maxProfit: 2152,
    openedTs: "2026-08-28T15:22:00Z",
    expiry: "2026-09-11",
    dte: 10,
    state: { type: "CLOSED", closedAt: "2026-08-31T19:58:40Z" },
    exitTrigger: "pnl_stop",
    realizedPnl: -552,
    fillVsMid: -0.05,
    orderId: "12aa-77b1",
    legs: ANET_LEGS,
  },
  {
    positionId: "POS-0018",
    dossierId: "DS-0828-0018",
    target: "NVDA",
    structure: "bull_call_debit",
    contracts: 2,
    entryDebit: 4.4,
    monitoringMark: 6.7,
    liquidationValue: 6.55,
    maxLoss: 880,
    maxProfit: 1120,
    openedTs: "2026-08-28T14:03:00Z",
    expiry: "2026-09-11",
    dte: 10,
    state: { type: "CLOSED", closedAt: "2026-08-31T14:41:10Z" },
    exitTrigger: "profit_target",
    realizedPnl: 462,
    fillVsMid: -0.01,
    orderId: "3f0b-2c19",
    legs: AVGO_LEGS,
  },
];

export const positionById = (id: string) => POSITIONS.find((p) => p.positionId === id);

/* ------------------------------------------------------------------ */
/* Funnel, rejections, health, evals                                   */
/* ------------------------------------------------------------------ */

export const FUNNEL: FunnelStage[] = [
  { key: "ingested", label: "News items ingested", count: 412, note: "Alpaca News stream, 8 symbols" },
  { key: "deduped", label: "Survived dedupe", count: 268, note: "144 repeat payload hashes dropped" },
  { key: "extracted", label: "Schema-valid events", count: 34, note: "234 → NO_EVENT (unsupported type)" },
  { key: "mapped", label: "Mapped to graph path", count: 61, note: "34 events fanned to ≤2-hop targets" },
  { key: "setup", label: "Passed catch-up gates", count: 19, note: "Hub repriced · target lagging · direction · RVOL" },
  { key: "spread", label: "Spread constructible", count: 12, note: "7 dropped on quote or liquidity filters" },
  { key: "admitted", label: "Passed all invariants", count: 5, note: "7 blocked by risk, critic or staleness" },
  { key: "orders", label: "Orders submitted", count: 5, note: "All idempotency-keyed" },
  { key: "filled", label: "Filled", count: 4, note: "1 DAY entry expired unfilled" },
];

export const REJECTIONS: RejectionReason[] = [
  { code: "NO_EVENT", label: "Unsupported / no event", count: 234 },
  { code: "DUPLICATE_PAYLOAD", label: "Duplicate payload hash", count: 144 },
  { code: "NO_GRAPH_PATH", label: "No verified graph path", count: 21 },
  { code: "HUB_NOT_REPRICED", label: "Hub has not repriced", count: 17 },
  { code: "TARGET_ALREADY_REPRICED", label: "Target already repriced", count: 14 },
  { code: "RVOL_BELOW_THRESHOLD", label: "RVOL below 1.50", count: 11 },
  { code: "STALE_QUOTE", label: "Stale or one-sided quote", count: 5 },
  { code: "MAX_LOSS_EXCEEDED", label: "Per-trade risk cap", count: 3 },
  { code: "CRITIC_HARD_VETO", label: "Critic hard veto", count: 2 },
  { code: "EVENT_STALE", label: "Event past two sessions", count: 2 },
];

export const HEALTH: HealthCheck[] = [
  { key: "news", label: "News freshness", status: "ok", value: "12s", detail: "Last Alpaca News item received 12s ago", checkedTs: NOW },
  { key: "quotes", label: "Stock quotes", status: "ok", value: "IEX", detail: "Bars and quotes streaming; 15m bar closed 18:30Z", checkedTs: NOW },
  { key: "options", label: "Options feed", status: "degraded", value: "Indicative", detail: "OPRA not entitled on this account — indicative quotes only. Conservative pricing enforced.", checkedTs: NOW },
  { key: "mcp", label: "Alpaca MCP", status: "ok", value: "24 calls", detail: "Preflight, chain inspection and order verification paths", checkedTs: NOW },
  { key: "clock", label: "Market clock", status: "ok", value: "Open", detail: "Regular session, closes 20:00Z. Next close 2026-09-01", checkedTs: NOW },
  { key: "reconcile", label: "Broker reconciliation", status: "ok", value: "Clean", detail: "Local projections match 2 positions / 1 open order", checkedTs: NOW },
  { key: "killswitch", label: "Kill switch", status: "ok", value: "Armed", detail: "Halts automation at −8% equity drawdown. Current 0.34%", checkedTs: NOW },
  { key: "scheduler", label: "Active-event scheduler", status: "ok", value: "4 active", detail: "Next reevaluation in 07:12", checkedTs: NOW },
];

export const MCP_CALLS: McpCall[] = [
  { ts: "2026-09-01T18:42:02Z", tool: "alpaca.get_option_snapshot", purpose: "Verify both VRT legs quote two-sided before submit", ok: true, latencyMs: 214 },
  { ts: "2026-09-01T18:42:05Z", tool: "alpaca.get_order_by_client_id", purpose: "Idempotency reconciliation for DS-0901-0043", ok: true, latencyMs: 96 },
  { ts: "2026-09-01T18:30:11Z", tool: "alpaca.get_option_chain", purpose: "Chain + Greeks inspection for VRT 2026-09-18", ok: true, latencyMs: 508 },
  { ts: "2026-09-01T14:00:00Z", tool: "alpaca.get_account", purpose: "Options level & buying-power preflight", ok: true, latencyMs: 132 },
  { ts: "2026-09-01T13:59:58Z", tool: "alpaca.get_clock", purpose: "Session gate before scheduler tick", ok: true, latencyMs: 71 },
  { ts: "2026-08-31T20:04:00Z", tool: "alpaca.list_positions", purpose: "End-of-session emergency position review", ok: true, latencyMs: 188 },
  { ts: "2026-08-31T09:30:02Z", tool: "alpaca.get_option_snapshot", purpose: "Feed detection — OPRA vs indicative", ok: false, latencyMs: 1502 },
];

export const EVAL_RUNS: EvalRun[] = [
  {
    id: "EVAL-DEV-07",
    set: "development",
    ranAt: "2026-08-31T20:40:00Z",
    events: 17,
    configChecksum: RISK_LIMITS.configChecksum,
    metrics: [
      { label: "Invented amounts", value: "0", target: "0", pass: true },
      { label: "Invented recipients", value: "0", target: "0", pass: true },
      { label: "Invented statuses", value: "0", target: "0", pass: true },
      { label: "Valid structured output", value: "100%", target: "100%", pass: true },
      { label: "Event-type accuracy", value: "16 / 17", pass: true },
      { label: "Direction accuracy", value: "17 / 17", pass: true },
      { label: "Abstention on unsupported", value: "5 / 5", target: "5 / 5", pass: true },
    ],
  },
  {
    id: "EVAL-HOLD-01",
    set: "holdout",
    ranAt: "2026-09-01T07:10:00Z",
    events: 6,
    configChecksum: RISK_LIMITS.configChecksum,
    metrics: [
      { label: "Invented amounts", value: "0", target: "0", pass: true },
      { label: "Invented recipients", value: "0", target: "0", pass: true },
      { label: "Valid structured output", value: "100%", target: "100%", pass: true },
      { label: "Event-type accuracy", value: "6 / 6", pass: true },
      { label: "Candidates produced", value: "3", pass: true },
      { label: "Abstentions", value: "3", pass: true },
    ],
  },
];

export const EXECUTION_TESTS = [
  "Max-risk cap",
  "Total-open-risk cap",
  "No naked short options",
  "Malformed output rejection",
  "Unsupported event rejection",
  "Missing / stale quotes abstain",
  "Duplicate-event rejection",
  "Stale-event rejection",
  "Daily stop blocks entries",
  "Kill switch halts automation",
  "Idempotency prevents duplicates",
  "One-close-order rule",
  "Cancel confirmation before resubmit",
  "Retry and slippage bounds",
  "Restart reconciliation",
  "Baseline cannot reach order API",
].map((label, i) => ({ id: `T-${String(i + 1).padStart(2, "0")}`, label, passed: true }));

/** Cumulative percent return at each session close. */
export const BASELINE_SERIES: BaselinePoint[] = [
  { session: "Aug 28", agent: 0.32, baseline: 0.1, smh: 0.42, qqq: 0.18 },
  { session: "Aug 29", agent: 0.49, baseline: 0.21, smh: 0.55, qqq: 0.29 },
  { session: "Aug 31", agent: 0.09, baseline: -0.35, smh: -0.31, qqq: -0.12 },
  { session: "Sep 1", agent: 0.27, baseline: 0.02, smh: 0.28, qqq: 0.19 },
];

export const PERFORMANCE = {
  realizedPnl: -90,
  unrealizedPnl: 361,
  markedPnl: 271,
  accountReturnPct: 0.27,
  /** 271 against the 3,989 of maximum theoretical loss deployed across 4 fills. */
  returnOnCapitalAtRisk: 6.8,
  fills: 4,
  closedTrades: 2,
  openTrades: 2,
  wins: 1,
  losses: 1,
  winRate: 0.5,
  avgWin: 462,
  avgLoss: -552,
  maxDrawdownPct: 0.79,
  avgFillVsMid: -0.028,
  startingEquity: 100_000,
};

/** Peak 100,611 → trough 99,812 is the 0.79% maximum drawdown. */
export const EQUITY_CURVE = [
  { t: "Aug 28 09:30", v: 100_000 },
  { t: "Aug 28 12:00", v: 100_140 },
  { t: "Aug 28 16:00", v: 100_318 },
  { t: "Aug 29 09:30", v: 100_302 },
  { t: "Aug 29 13:00", v: 100_611 },
  { t: "Aug 29 16:00", v: 100_487 },
  { t: "Aug 31 09:30", v: 100_402 },
  { t: "Aug 31 12:30", v: 99_812 },
  { t: "Aug 31 16:00", v: 100_090 },
  { t: "Sep 1 09:30", v: 100_152 },
  { t: "Sep 1 12:00", v: 100_205 },
  { t: "Sep 1 14:42", v: 100_271 },
];

export const ACTIVE_EVENT = EVENTS[0];
export const FEATURED_DOSSIER = DOSSIERS[0];
