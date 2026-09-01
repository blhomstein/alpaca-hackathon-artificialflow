import Link from "next/link";
import { FlowGraph } from "@/components/graph/flow-graph";
import { DecisionFunnel } from "@/components/feature/funnel";
import { EvidenceText } from "@/components/feature/evidence";
import {
  CatchUpGates,
  CriticCard,
  DecisionBadge,
  GraphPath,
  SpreadLegs,
} from "@/components/feature/decision";
import { BenchmarkChart } from "@/components/charts/benchmark-chart";
import {
  Badge,
  Dot,
  Meter,
  Panel,
  PanelHead,
  Stat,
  Table,
  Td,
  Th,
} from "@/components/ui/primitives";
import { IconArrowRight } from "@/components/ui/icons";
import {
  ACTIVE_EVENT,
  EVENTS,
  FEATURED_DOSSIER,
  HEALTH,
  NOW,
  POSITIONS,
  RISK_LIMITS,
  RISK_NOW,
  SYMBOL_NAMES,
} from "@/lib/mock";
import { compactUsd, dateTime, num, pct, since, titleCase, usd } from "@/lib/format";
import { PositionStateBadge } from "@/components/feature/position-state";

export default function MissionControl() {
  const d = FEATURED_DOSSIER;
  const activeEvents = EVENTS.filter((e) => e.state === "active");
  const open = POSITIONS.filter((p) => p.state.type !== "CLOSED");
  const degraded = HEALTH.filter((h) => h.status !== "ok");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className="eyebrow">Mission control</div>
          <h1 className="display mt-2 text-[1.75rem] leading-9 text-ink">
            One event, one verified path, one defined-risk spread.
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink-2">
            FlowGraph reads AI-investment news, maps it through a human-verified supplier
            graph, and trades a supplier still lagging its repriced hub — or abstains and
            says why.
          </p>
        </div>
        <Link
          href="/dossiers"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink transition-colors hover:bg-surface-2"
        >
          Latest decisions <IconArrowRight size={14} />
        </Link>
      </header>

      {/* -------------------------------------------------- headline stats */}
      <Panel>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-5">
          <Stat
            label="Account equity"
            value={usd(RISK_NOW.equity, { cents: false })}
            sub={`${pct(RISK_NOW.equity / 100000 - 1)} since Aug 28`}
            tone={RISK_NOW.equity >= 100000 ? "pos" : "neg"}
          />
          <Stat
            label="Marked P&L today"
            value={usd(RISK_NOW.markedPnlToday, { sign: true })}
            sub={`Daily stop at ${usd(RISK_LIMITS.dailyStop, { cents: false })}`}
            tone={RISK_NOW.markedPnlToday >= 0 ? "pos" : "neg"}
          />
          <Stat
            label="Open theoretical risk"
            value={usd(RISK_NOW.openTheoreticalLoss, { cents: false })}
            sub={`of ${usd(RISK_LIMITS.maxOpenLoss, { cents: false })} cap`}
          />
          <Stat
            label="Open positions"
            value={`${RISK_NOW.openPositions} / ${RISK_LIMITS.maxPositions}`}
            sub={`${RISK_NOW.sameDirectionPositions} same-direction of ${RISK_LIMITS.maxSameDirection}`}
          />
          <Stat
            label="Active events"
            value={String(activeEvents.length)}
            sub="Reevaluated every 30 minutes"
          />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Meter
            label="Portfolio risk used"
            right={`${Math.round((RISK_NOW.openTheoreticalLoss / RISK_LIMITS.maxOpenLoss) * 100)}%`}
            value={RISK_NOW.openTheoreticalLoss}
            max={RISK_LIMITS.maxOpenLoss}
          />
          <Meter
            label="Daily stop headroom"
            right={usd(RISK_NOW.markedPnlToday - RISK_LIMITS.dailyStop, { cents: false })}
            value={Math.max(0, -RISK_NOW.markedPnlToday)}
            max={Math.abs(RISK_LIMITS.dailyStop)}
            tone="warn"
          />
          <Meter
            label="Kill-switch drawdown"
            right={`${num(RISK_NOW.drawdownPct, 1)}% of ${RISK_LIMITS.killSwitchDrawdownPct}%`}
            value={RISK_NOW.drawdownPct}
            max={RISK_LIMITS.killSwitchDrawdownPct}
            tone="neg"
          />
        </div>
      </Panel>

      {/* ------------------------------------------------- graph + funnel */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHead
            title="Capital-flow map"
            hint={`Active path lit for ${d.event.actor} → ${d.target}`}
            action={
              <Link href="/graph" className="text-clay-ink underline-offset-4 hover:underline">
                Full graph
              </Link>
            }
          />
          <FlowGraph
            activePath={d.graphPath.map((e) => e.edgeId)}
            actor={d.event.actor}
            target={d.target}
          />
        </Panel>

        <Panel>
          <PanelHead
            title="Decision funnel"
            hint="412 news items in, 5 fills out"
            action={
              <Link href="/dossiers" className="text-clay-ink underline-offset-4 hover:underline">
                Rejections
              </Link>
            }
          />
          <DecisionFunnel compact />
        </Panel>
      </div>

      {/* ------------------------------------------------- current event */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHead
            title="Current active event"
            hint={`${ACTIVE_EVENT.source} · detected ${since(ACTIVE_EVENT.detectedTs, NOW)} ago`}
            action={
              <Badge tone="clay">
                <Dot tone="clay" pulse />
                Active
              </Badge>
            }
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral" mono>
              {ACTIVE_EVENT.actor}
            </Badge>
            <Badge tone="neutral">{titleCase(ACTIVE_EVENT.eventType)}</Badge>
            <Badge tone={ACTIVE_EVENT.direction === "positive" ? "pos" : "neg"}>
              {titleCase(ACTIVE_EVENT.direction)}
            </Badge>
            <Badge tone="neutral" mono>
              {compactUsd(ACTIVE_EVENT.amountUsd)}
            </Badge>
            <Badge tone="neutral">{titleCase(ACTIVE_EVENT.status ?? "null")}</Badge>
          </div>
          <h3 className="mt-3 text-sm leading-6 font-medium text-ink">
            {ACTIVE_EVENT.headline}
          </h3>
          <div className="mt-3">
            <EvidenceText event={ACTIVE_EVENT} />
          </div>
          <p className="mt-3 text-[0.6875rem] text-ink-3">
            Highlighted text is the evidence span backing a non-null field. Expires{" "}
            {dateTime(ACTIVE_EVENT.activeUntil)} · hash {ACTIVE_EVENT.rawPayloadHash}
          </p>
          <div className="mt-4">
            <Link
              href={`/events/${ACTIVE_EVENT.eventId}`}
              className="text-xs text-clay-ink underline-offset-4 hover:underline"
            >
              Open extracted event →
            </Link>
          </div>
        </Panel>

        <Panel>
          <PanelHead
            title={`Latest decision · ${d.target}`}
            hint={`${SYMBOL_NAMES[d.target]} · dossier ${d.dossierId}`}
            action={<DecisionBadge decision={d.decision} />}
          />
          <GraphPath dossier={d} />
          <div className="mt-4">
            <CatchUpGates m={d.marketSnapshot} />
          </div>
          <div className="mt-4 rounded-lg border border-line bg-surface-2/50 p-3">
            <div className="eyebrow mb-2">Critic</div>
            <CriticCard critic={d.critic} />
          </div>
          <Link
            href={`/dossiers/${d.dossierId}`}
            className="mt-4 inline-block text-xs text-clay-ink underline-offset-4 hover:underline"
          >
            Open full dossier →
          </Link>
        </Panel>
      </div>

      {/* --------------------------------------------------- spread + P&L */}
      {d.optionSnapshot && (
        <Panel>
          <PanelHead
            title="Executed spread"
            hint={`${titleCase(d.optionSnapshot.structure)} · ${d.optionSnapshot.dte} DTE · order ${d.executionEvents.at(-1)?.orderId}`}
            action={
              <Link href="/positions" className="text-clay-ink underline-offset-4 hover:underline">
                Positions
              </Link>
            }
          />
          <SpreadLegs snap={d.optionSnapshot} />
        </Panel>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHead
            title="Open spreads"
            hint="Application-controlled close lifecycle"
            action={
              <Link href="/positions" className="text-clay-ink underline-offset-4 hover:underline">
                All positions
              </Link>
            }
          />
          <Table>
            <thead>
              <tr>
                <Th>Position</Th>
                <Th>State</Th>
                <Th align="right">Debit</Th>
                <Th align="right">Mark</Th>
                <Th align="right">Liquidation</Th>
                <Th align="right">Max loss</Th>
              </tr>
            </thead>
            <tbody>
              {open.map((p) => (
                <tr key={p.positionId}>
                  <Td>
                    <Link
                      href={`/positions#${p.positionId}`}
                      className="text-ink underline-offset-4 hover:underline"
                    >
                      {p.target}
                    </Link>
                    <span className="tnum ml-2 text-[0.6875rem] text-ink-3">
                      ×{p.contracts} · {p.dte}d
                    </span>
                  </Td>
                  <Td>
                    <PositionStateBadge state={p.state} />
                  </Td>
                  <Td align="right" mono>
                    {num(p.entryDebit)}
                  </Td>
                  <Td align="right" mono>
                    {num(p.monitoringMark)}
                  </Td>
                  <Td align="right" mono>
                    {num(p.liquidationValue)}
                  </Td>
                  <Td align="right" mono className="text-ink-3">
                    {usd(p.maxLoss, { cents: false })}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel>
          <PanelHead
            title="System health"
            hint={degraded.length ? `${degraded.length} check needs disclosure` : "All checks nominal"}
            action={
              <Link href="/health" className="text-clay-ink underline-offset-4 hover:underline">
                Details
              </Link>
            }
          />
          <ul className="space-y-2">
            {HEALTH.slice(0, 6).map((h) => (
              <li key={h.key} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs text-ink-2">
                  <Dot tone={h.status === "ok" ? "pos" : h.status === "degraded" ? "warn" : "neg"} />
                  {h.label}
                </span>
                <span className="tnum text-xs text-ink">{h.value}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel>
        <PanelHead
          title="Agent versus simulated baseline"
          hint="Cumulative percent return by session. Baseline is offline, price-and-volume only, and never touches the order API."
          action={
            <Link href="/performance" className="text-clay-ink underline-offset-4 hover:underline">
              Full reporting
            </Link>
          }
        />
        <BenchmarkChart />
      </Panel>
    </div>
  );
}
