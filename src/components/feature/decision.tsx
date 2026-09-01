import Link from "next/link";
import type { CriticResult, InvariantResult, MarketSnapshot, OptionSnapshot, TradeDossier } from "@/lib/types";
import { Badge, Dot, Table, Td, Th } from "@/components/ui/primitives";
import { IconAlert, IconCheck, IconX } from "@/components/ui/icons";
import { RISK_LIMITS } from "@/lib/mock";
import { cx, dateTime, num, pct, titleCase, usd } from "@/lib/format";

/* --------------------------------------------------------- Decision chip */

export function DecisionBadge({ decision }: { decision: TradeDossier["decision"] }) {
  return decision === "TRADE" ? (
    <Badge tone="pos">
      <Dot tone="pos" />
      TRADE
    </Badge>
  ) : (
    <Badge tone="neutral">
      <Dot tone="neutral" />
      REJECT
    </Badge>
  );
}

/* ------------------------------------------------------ Catch-up gates */

export function CatchUpGates({ m }: { m: MarketSnapshot }) {
  const gates = [
    {
      label: "Hub repriced",
      formula: "return(actor) − return(SMH)",
      value: pct(m.hubRelativeReturn),
      test: `≥ ${pct(RISK_LIMITS.hubRepriceThreshold, 2, false)}`,
      pass: Math.abs(m.hubRelativeReturn) >= RISK_LIMITS.hubRepriceThreshold,
    },
    {
      label: "Target still lagging",
      formula: "abs(return(target) − return(SMH))",
      value: pct(Math.abs(m.targetRelativeReturn), 2, false),
      test: `< ${pct(RISK_LIMITS.targetFullyRepricedThreshold, 2, false)}`,
      pass: Math.abs(m.targetRelativeReturn) < RISK_LIMITS.targetFullyRepricedThreshold,
    },
    {
      label: "Direction confirms",
      formula: "last completed 15m bar",
      value: m.lastBarDirection,
      test: "matches event direction",
      pass: m.lastBarDirection !== "flat",
    },
    {
      label: "RVOL confirms",
      formula: "vol(last 15m) ÷ avg(same 15m, 10 sessions)",
      value: `${num(m.rvol, 2)}×`,
      test: `≥ ${num(RISK_LIMITS.rvolThreshold, 2)}×`,
      pass: m.rvol >= RISK_LIMITS.rvolThreshold,
    },
  ];

  return (
    <ul className="space-y-2.5">
      {gates.map((g) => (
        <li
          key={g.label}
          className="flex items-start gap-3 rounded-lg border border-line bg-surface-2/50 px-3 py-2.5"
        >
          <span className={cx("mt-0.5", g.pass ? "text-pos" : "text-neg")}>
            {g.pass ? <IconCheck size={14} /> : <IconX size={14} />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-medium text-ink">{g.label}</span>
              <span className={cx("tnum text-xs", g.pass ? "text-pos" : "text-neg")}>{g.value}</span>
            </div>
            <div className="mt-0.5 flex items-baseline justify-between gap-3">
              <span className="tnum text-[0.6875rem] text-ink-3">{g.formula}</span>
              <span className="tnum text-[0.6875rem] text-ink-3">{g.test}</span>
            </div>
          </div>
        </li>
      ))}
      <li className="text-[0.6875rem] text-ink-3">
        Bar closed {dateTime(m.barCompletedAt)} · partial live intervals are never compared
        against completed history.
      </li>
    </ul>
  );
}

/* --------------------------------------------------------- Invariants */

export function InvariantGrid({ invariants }: { invariants: InvariantResult[] }) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
      {invariants.map((iv) => (
        <li
          key={iv.id}
          className="flex items-start gap-2.5 border-b border-line py-2 last:border-0"
        >
          <span className={cx("mt-[3px]", iv.passed ? "text-pos" : "text-neg")}>
            {iv.passed ? <IconCheck size={13} /> : <IconX size={13} />}
          </span>
          <div className="min-w-0">
            <div className="text-xs text-ink">
              <span className="tnum mr-1.5 text-ink-3">{iv.id}</span>
              {iv.label}
            </div>
            <div className="mt-0.5 text-[0.6875rem] text-ink-3">{iv.detail}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------- Critic */

export function CriticCard({ critic }: { critic: CriticResult }) {
  const tone =
    critic.verdict === "HARD_VETO" ? "neg" : critic.verdict === "SOFT_WARNING" ? "warn" : "pos";

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Badge tone={tone}>
          {critic.verdict === "NO_OBJECTION" ? <IconCheck size={12} /> : <IconAlert size={12} />}
          {titleCase(critic.verdict)}
        </Badge>
        <span className="tnum text-[0.6875rem] text-ink-3">{critic.latencyMs} ms</span>
      </div>

      {critic.objections.length === 0 ? (
        <p className="mt-3 text-xs leading-5 text-ink-2">
          The critic could not falsify the proposal from the dossier. A no-objection verdict
          authorises nothing on its own — the deterministic gates still decide.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {critic.objections.map((o) => (
            <li key={o.code} className="rounded-lg border border-line bg-surface-2/60 p-3">
              <div className="tnum text-[0.6875rem] text-ink-3">{o.code}</div>
              <p className="mt-1 text-xs leading-5 text-ink-2">{o.explanation}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {o.evidenceRefs.map((r) => (
                  <span
                    key={r}
                    className="tnum rounded bg-surface-3 px-1.5 py-0.5 text-[0.625rem] text-ink-3"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[0.6875rem] leading-4 text-ink-3">
        The critic may veto. It cannot size a position, relax a threshold, or turn a failed
        invariant into a pass.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------- Spread legs */

export function SpreadLegs({ snap }: { snap: OptionSnapshot }) {
  return (
    <div>
      <Table>
        <thead>
          <tr>
            <Th>Leg</Th>
            <Th>Contract</Th>
            <Th align="right">Bid</Th>
            <Th align="right">Ask</Th>
            <Th align="right">Mid</Th>
            <Th align="right">Δ</Th>
            <Th align="right">IV</Th>
            <Th align="right">OI / Vol</Th>
          </tr>
        </thead>
        <tbody>
          {snap.legs.map((l) => (
            <tr key={l.symbol}>
              <Td>
                <Badge tone={l.side === "buy" ? "pos" : "neutral"}>
                  {l.side === "buy" ? "Long" : "Short"} {l.optionType}
                </Badge>
              </Td>
              <Td mono className="text-ink-2">
                {l.symbol}
              </Td>
              <Td align="right" mono>
                {num(l.bid)}
              </Td>
              <Td align="right" mono>
                {num(l.ask)}
              </Td>
              <Td align="right" mono>
                {num(l.mid)}
              </Td>
              <Td align="right" mono>
                {num(l.delta)}
              </Td>
              <Td align="right" mono>
                {num(l.iv * 100, 0)}%
              </Td>
              <Td align="right" mono className="text-ink-3">
                {l.openInterest.toLocaleString("en-US")} / {l.volume}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {[
          ["Conservative entry", `${num(snap.conservativeEntry)} debit`, "ask(long) − bid(short) · sizes the position"],
          ["Monitoring mark", num(snap.monitoringMark), "mid − mid · triggers exits"],
          ["Liquidation value", num(snap.liquidationValue), "bid(long) − ask(short) · marks P&L"],
          ["Reward / risk", `${num(snap.rewardRisk)}×`, `width ${num(snap.strikeWidth, 0)} · ${snap.dte} DTE`],
        ].map(([k, v, note]) => (
          <div key={k}>
            <dt className="eyebrow">{k}</dt>
            <dd className="tnum mt-1 text-sm text-ink">{v}</dd>
            <dd className="mt-0.5 text-[0.6875rem] leading-4 text-ink-3">{note}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <RiskCell label="Contracts" value={String(snap.contracts)} />
        <RiskCell
          label="Max theoretical loss"
          value={usd(snap.maxLoss, { cents: false })}
          note={`cap ${usd(RISK_LIMITS.maxLossPerTrade, { cents: false })}`}
          tone={snap.maxLoss <= RISK_LIMITS.maxLossPerTrade ? "pos" : "neg"}
        />
        <RiskCell label="Max profit" value={usd(snap.maxProfit, { cents: false })} />
      </div>
    </div>
  );
}

function RiskCell({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "pos" | "neg";
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-2/50 px-3 py-2.5">
      <div className="eyebrow">{label}</div>
      <div
        className={cx(
          "tnum mt-1 text-sm",
          tone === "pos" && "text-pos",
          tone === "neg" && "text-neg",
          !tone && "text-ink",
        )}
      >
        {value}
      </div>
      {note ? <div className="mt-0.5 text-[0.6875rem] text-ink-3">{note}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------ Execution trail */

export function ExecutionTrail({ dossier }: { dossier: TradeDossier }) {
  return (
    <div>
      {dossier.idempotencyKey ? (
        <div className="mb-4 rounded-lg border border-line bg-surface-2/60 px-3 py-2">
          <div className="eyebrow">Idempotency key</div>
          <div className="tnum mt-1 text-[0.6875rem] break-all text-ink-2">
            {dossier.idempotencyKey}
          </div>
        </div>
      ) : null}

      <ol className="relative space-y-3 border-l border-line pl-4">
        {dossier.executionEvents.map((e, i) => (
          <li key={i} className="relative">
            <span
              className={cx(
                "absolute top-1.5 -left-[21px] size-1.5 rounded-full",
                e.kind === "filled" ? "bg-pos" : e.kind === "note" ? "bg-ink-3" : "bg-clay",
              )}
            />
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs text-ink">{titleCase(e.kind)}</span>
              <span className="tnum text-[0.6875rem] text-ink-3">{dateTime(e.ts)}</span>
            </div>
            <p className="mt-0.5 text-[0.6875rem] leading-4 text-ink-2">{e.message}</p>
            {e.orderId ? (
              <p className="tnum mt-0.5 text-[0.625rem] text-ink-3">order {e.orderId}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------- Graph path row */

export function GraphPath({ dossier }: { dossier: TradeDossier }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md border border-clay/30 bg-clay-soft px-2 py-1 font-medium text-clay-ink">
          {dossier.event.actor}
        </span>
        {dossier.graphPath.map((e) => (
          <span key={e.edgeId} className="flex items-center gap-2">
            <span className="tnum text-[0.625rem] text-ink-3">{e.relationshipType}</span>
            <span className="text-ink-3">→</span>
            <span className="rounded-md border border-line bg-surface-2 px-2 py-1 text-ink">
              {e.toSymbol}
            </span>
          </span>
        ))}
        <span className="tnum ml-1 text-[0.6875rem] text-ink-3">
          {dossier.graphPath.length} hop{dossier.graphPath.length === 1 ? "" : "s"} · max 2
        </span>
      </div>
      {dossier.graphPath.map((e) => (
        <p key={e.edgeId} className="text-[0.6875rem] text-ink-3">
          <span className="tnum">{e.edgeId}</span> · {e.sourceLabel} · verified {e.verifiedAt} ·{" "}
          <Link href="/graph" className="text-clay-ink underline-offset-4 hover:underline">
            inspect edge
          </Link>
        </p>
      ))}
    </div>
  );
}
