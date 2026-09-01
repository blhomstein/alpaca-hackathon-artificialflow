import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  KeyValue,
  Note,
  Panel,
  PanelHead,
  PageHeader,
  Stat,
  Table,
  Td,
  Th,
} from "@/components/ui/primitives";
import { PositionStateBadge } from "@/components/feature/position-state";
import { POSITIONS, RISK_LIMITS } from "@/lib/mock";
import { cx, dateTime, num, titleCase, usd } from "@/lib/format";

export const metadata: Metadata = { title: "Positions" };

const EXIT_TRIGGERS = [
  ["profit_target", "Monitoring mark reaches 50% of maximum profit"],
  ["pnl_stop", "Monitoring mark at or below 50% of the debit paid"],
  ["invalidation", "Target relative strength flips, or the hub fully retraces"],
  ["time_stop", "End of the trading session following entry"],
  ["competition_flatten", "All positions closed by 09:45 ET on September 4"],
] as const;

export default function PositionsPage() {
  const open = POSITIONS.filter((p) => p.state.type !== "CLOSED");
  const closed = POSITIONS.filter((p) => p.state.type === "CLOSED");
  const openRisk = open.reduce((s, p) => s + p.maxLoss, 0);
  const realized = closed.reduce((s, p) => s + (p.realizedPnl ?? 0), 0);
  const unrealized = open.reduce(
    (s, p) => s + (p.liquidationValue - p.entryDebit) * 100 * p.contracts,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Execution"
        title="Open spreads and close lifecycle"
        lede="Exits are application-controlled: one close order per position, cancellation confirmed before any reprice, retries and total slippage bounded."
      />

      <Panel>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-5">
          <Stat label="Open positions" value={`${open.length} / ${RISK_LIMITS.maxPositions}`} />
          <Stat
            label="Open theoretical risk"
            value={usd(openRisk, { cents: false })}
            sub={`of ${usd(RISK_LIMITS.maxOpenLoss, { cents: false })}`}
          />
          <Stat
            label="Conservative unrealized"
            value={usd(unrealized, { sign: true, cents: false })}
            sub="At liquidation value"
            tone={unrealized >= 0 ? "pos" : "neg"}
          />
          <Stat
            label="Realized"
            value={usd(realized, { sign: true, cents: false })}
            sub={`${closed.length} closed`}
            tone={realized >= 0 ? "pos" : "neg"}
          />
          <Stat label="Live close orders" value="1" sub="One-close-order invariant holds" />
        </div>
      </Panel>

      <div className="space-y-4">
        {POSITIONS.map((p) => {
          const unreal = (p.liquidationValue - p.entryDebit) * 100 * p.contracts;
          const pnl = p.realizedPnl ?? unreal;
          const markProgress =
            (p.monitoringMark - p.entryDebit) / (p.maxProfit / 100 / p.contracts || 1);
          return (
            <Panel key={p.positionId} className={cx(p.state.type === "CLOSED" && "opacity-80")}>
              <div id={p.positionId} className="scroll-mt-24" />
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-medium text-ink">{p.target}</h2>
                    <Badge tone="neutral">{titleCase(p.structure)}</Badge>
                    <PositionStateBadge state={p.state} />
                    {p.exitTrigger && (
                      <Badge tone={p.exitTrigger === "profit_target" ? "pos" : "warn"}>
                        {titleCase(p.exitTrigger)}
                      </Badge>
                    )}
                  </div>
                  <p className="tnum mt-1 text-[0.6875rem] text-ink-3">
                    {p.positionId} · order {p.orderId} · opened {dateTime(p.openedTs)} · expiry{" "}
                    {p.expiry} ({p.dte} DTE) ·{" "}
                    <Link
                      href={`/dossiers/${p.dossierId}`}
                      className="text-clay-ink underline-offset-4 hover:underline"
                    >
                      {p.dossierId}
                    </Link>
                  </p>
                </div>
                <div className="text-right">
                  <div className="eyebrow">{p.realizedPnl !== null ? "Realized" : "Conservative unrealized"}</div>
                  <div
                    className={cx("tnum text-lg", pnl >= 0 ? "text-pos" : "text-neg")}
                  >
                    {usd(pnl, { sign: true, cents: false })}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-x-8 gap-y-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                <KeyValue
                  items={[
                    { k: "Contracts", v: String(p.contracts) },
                    { k: "Entry debit (filled)", v: num(p.entryDebit) },
                    { k: "Monitoring mark", v: num(p.monitoringMark) },
                    { k: "Liquidation value", v: num(p.liquidationValue) },
                    { k: "Max loss", v: usd(p.maxLoss, { cents: false }) },
                    { k: "Max profit", v: usd(p.maxProfit, { cents: false }) },
                    { k: "Fill vs mid", v: num(p.fillVsMid) },
                    {
                      k: "Close order",
                      v:
                        p.state.type === "CLOSING" || p.state.type === "CANCEL_PENDING"
                          ? p.state.orderId
                          : "—",
                    },
                  ]}
                />

                <div>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Leg</Th>
                        <Th>Contract</Th>
                        <Th align="right">Strike</Th>
                        <Th align="right">Mid</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.legs.map((l) => (
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
                            {num(l.strike, 0)}
                          </Td>
                          <Td align="right" mono>
                            {num(l.mid)}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <div className="mt-3">
                    <div className="mb-1.5 flex justify-between text-[0.6875rem] text-ink-3">
                      <span>Debit paid</span>
                      <span>Max profit</span>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-surface-3">
                      <div
                        className={cx(
                          "absolute inset-y-0 left-0 rounded-full",
                          markProgress >= 0 ? "bg-pos" : "bg-neg",
                        )}
                        style={{
                          width: `${Math.min(100, Math.max(2, Math.abs(markProgress) * 100))}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-[0.6875rem] text-ink-3">
                      Profit target fires at 50% of max profit; the P&amp;L stop fires at 50% of
                      the debit paid.
                    </p>
                  </div>
                </div>
              </div>

              {p.state.type === "CLOSING" && (
                <div className="mt-4">
                  <Note tone="warn">
                    Close order {p.state.orderId} is live at the monitoring mid, retry{" "}
                    {p.state.retry}. If it does not fill within the timeout the engine requests
                    cancellation, waits for terminal confirmation from Alpaca, refetches quotes,
                    and steps the limit one increment toward the market — never two live close
                    orders at once.
                  </Note>
                </div>
              )}
            </Panel>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHead title="Exit triggers" hint="§13.3" />
          <ul className="space-y-2.5">
            {EXIT_TRIGGERS.map(([code, rule]) => (
              <li key={code} className="flex gap-3 border-b border-line pb-2 last:border-0">
                <span className="tnum w-40 shrink-0 text-[0.6875rem] text-ink-3">{code}</span>
                <span className="text-xs text-ink-2">{rule}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHead title="Close-order state machine" hint="§13.4" />
          <ol className="space-y-2 text-xs leading-5 text-ink-2">
            {[
              "Confirm the position is OPEN with no live close order.",
              "Submit a DAY mleg closing limit at the current monitoring mid → CLOSING(orderId).",
              "On timeout, request cancellation → CANCEL_PENDING(orderId).",
              "Wait for terminal cancellation confirmed by Alpaca.",
              "Refetch quotes and step the limit one increment toward the market.",
              "Enforce retry and total-slippage caps, then resubmit → CLOSING(newOrderId).",
              "A final attempt may cross only inside the slippage cap.",
              "If bounded retries are exhausted, raise for manual review.",
            ].map((s, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="tnum text-ink-3">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <Note tone="clay">
              Invariant: there is never more than one live close order for a position.
            </Note>
          </div>
        </Panel>
      </div>
    </div>
  );
}
