import type { Metadata } from "next";
import {
  Badge,
  Note,
  Panel,
  PanelHead,
  PageHeader,
  Table,
  Td,
  Th,
} from "@/components/ui/primitives";
import { IconLock } from "@/components/ui/icons";
import { EDGES, RISK_LIMITS } from "@/lib/mock";
import { dateTime, num, pct, usd } from "@/lib/format";

export const metadata: Metadata = { title: "Frozen config" };

const STRATEGY = [
  {
    k: "hubRepriceThreshold",
    v: pct(RISK_LIMITS.hubRepriceThreshold, 2, false),
    note: "Benchmark-adjusted hub move required before any target is considered",
  },
  {
    k: "targetFullyRepricedThreshold",
    v: pct(RISK_LIMITS.targetFullyRepricedThreshold, 2, false),
    note: "Above this the convergence has already happened — abstain",
  },
  {
    k: "rvolThreshold",
    v: `${num(RISK_LIMITS.rvolThreshold, 2)}×`,
    note: "Last completed 15m interval against the same interval over 10 sessions",
  },
  { k: "deltaTarget", v: num(RISK_LIMITS.deltaTarget), note: "Long-leg strike selection" },
  {
    k: "maxSpreadWidth",
    v: num(RISK_LIMITS.maxSpreadWidth, 2),
    note: "Caps maximum loss and keeps reward/risk sane",
  },
  {
    k: "dteWindow",
    v: `${RISK_LIMITS.dteMin}–${RISK_LIMITS.dteMax} days`,
    note: "No 0DTE, no long-dated exposure",
  },
];

const RISK = [
  { k: "maxLossPerTrade", v: usd(RISK_LIMITS.maxLossPerTrade, { cents: false }) },
  { k: "maxOpenTheoreticalLoss", v: usd(RISK_LIMITS.maxOpenLoss, { cents: false }) },
  { k: "maxConcurrentPositions", v: String(RISK_LIMITS.maxPositions) },
  { k: "maxSameDirectionPositions", v: String(RISK_LIMITS.maxSameDirection) },
  { k: "dailyStop", v: `${usd(RISK_LIMITS.dailyStop, { cents: false })} marked P&L` },
  { k: "killSwitchDrawdown", v: `−${RISK_LIMITS.killSwitchDrawdownPct}% equity` },
  { k: "orderStyle", v: "DAY multi-leg limit" },
  { k: "eventLifetime", v: "2 trading sessions" },
  { k: "reevaluationInterval", v: "30 minutes" },
  { k: "graphMaxHops", v: "2" },
];

export default function ConfigPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuration freeze"
        title="What the agent is allowed to believe"
        lede="Thresholds were chosen on the development replay set and frozen before live trading. They are not adjusted in response to a losing trade or a quiet dashboard."
        actions={
          <Badge tone="clay">
            <IconLock size={11} />
            {RISK_LIMITS.configChecksum}
          </Badge>
        }
      />

      <Note tone="clay">
        Frozen {dateTime(RISK_LIMITS.frozenAt)}. Any change after this point invalidates the
        holdout result and must be reported as a new configuration with a new checksum.
      </Note>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHead title="Strategy thresholds" hint="Catch-up setup — §9" />
          <Table>
            <thead>
              <tr>
                <Th>Key</Th>
                <Th align="right">Value</Th>
              </tr>
            </thead>
            <tbody>
              {STRATEGY.map((r) => (
                <tr key={r.k}>
                  <Td>
                    <span className="tnum text-ink">{r.k}</span>
                    <div className="mt-0.5 text-[0.6875rem] text-ink-3">{r.note}</div>
                  </Td>
                  <Td align="right" mono>
                    {r.v}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel>
          <PanelHead title="Risk and lifecycle" hint="Locked settings — §12" />
          <Table>
            <thead>
              <tr>
                <Th>Key</Th>
                <Th align="right">Value</Th>
              </tr>
            </thead>
            <tbody>
              {RISK.map((r) => (
                <tr key={r.k}>
                  <Td mono>{r.k}</Td>
                  <Td align="right" mono>
                    {r.v}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHead title="Accepted event types" hint="Everything else resolves to NO_EVENT" />
          <ul className="space-y-2">
            {[
              ["ai_capex_change", "A change in AI capital spending"],
              ["infrastructure_cloud_contract", "An infrastructure or cloud contract"],
              ["investment_financing", "An investment or financing event"],
              ["supply_capacity", "A supply or capacity announcement"],
              ["cancellation_reduction", "A project cancellation or reduction"],
            ].map(([k, v]) => (
              <li key={k} className="flex gap-3 border-b border-line pb-2 last:border-0">
                <span className="tnum w-56 shrink-0 text-xs text-ink">{k}</span>
                <span className="text-xs text-ink-2">{v}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHead
            title="Graph checksum"
            hint={`${EDGES.length} edges, each with a source and a verification date`}
          />
          <ul className="space-y-1.5">
            {EDGES.map((e) => (
              <li key={e.edgeId} className="flex items-baseline gap-3 text-[0.6875rem]">
                <span className="tnum w-12 shrink-0 text-ink-3">{e.edgeId}</span>
                <span className="tnum w-28 shrink-0 text-ink">
                  {e.fromSymbol} → {e.toSymbol}
                </span>
                <span className="truncate text-ink-3">{e.sourceLabel}</span>
                <span className="tnum ml-auto shrink-0 text-ink-3">{e.verifiedAt}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel>
        <PanelHead title="Acceptance criteria" hint="§22 — the bar for submission" />
        <ul className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
          {[
            ["AC-01", "Supported articles produce schema-valid events with evidence for every non-null field"],
            ["AC-02", "Unsupported or ambiguous articles abstain and never order"],
            ["AC-03", "Duplicate events cannot create duplicate candidates or orders"],
            ["AC-04", "Every candidate has a verified path of no more than two hops"],
            ["AC-05", "Catch-up calculations reproduce from stored timestamps and bars"],
            ["AC-06", "Missing, stale, crossed or zero-bid quotes reject the spread"],
            ["AC-07", "No trade exceeds $1,200 maximum theoretical loss"],
            ["AC-08", "Total open theoretical loss never exceeds $5,000"],
            ["AC-09", "Daily stop and kill switch behave exactly as specified"],
            ["AC-10", "Timeouts and restarts never duplicate an entry order"],
            ["AC-11", "Cancellation is confirmed before repricing a close"],
            ["AC-12", "One position never has two live close orders"],
            ["AC-13", "Every order stores pre-trade quotes, fill, fill-versus-mid and final P&L"],
            ["AC-14", "Baseline has no credentials and cannot import the trading adapter"],
            ["AC-15", "Dashboard explains one trade and one rejection end to end"],
            ["AC-16", "All positions are flattened and reconciled before final submission"],
          ].map(([id, text]) => (
            <li key={id} className="flex gap-3 border-b border-line py-2 last:border-0">
              <span className="tnum w-12 shrink-0 text-[0.6875rem] text-ink-3">{id}</span>
              <span className="text-xs leading-5 text-ink-2">{text}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
