import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  Note,
  Panel,
  PanelHead,
  PageHeader,
  Stat,
  Table,
  Td,
  Th,
} from "@/components/ui/primitives";
import { EquityCurve } from "@/components/charts/equity-curve";
import { BenchmarkChart } from "@/components/charts/benchmark-chart";
import { RejectionBars } from "@/components/charts/rejection-bars";
import { BASELINE_SERIES, PERFORMANCE, POSITIONS } from "@/lib/mock";
import { cx, dateTime, num, titleCase, usd } from "@/lib/format";

export const metadata: Metadata = { title: "Performance" };

export default function PerformancePage() {
  const closed = POSITIONS.filter((p) => p.realizedPnl !== null);
  const last = BASELINE_SERIES[BASELINE_SERIES.length - 1];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reporting"
        title="Results, honestly bounded"
        lede="Four trading sessions on a paper account with indicative option quotes. These numbers describe decision behaviour and execution quality — they do not establish alpha."
        actions={<Badge tone="neutral">Aug 28 – Sep 1, 2026</Badge>}
      />

      <Panel>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-6">
          <Stat
            label="Realized P&L"
            value={usd(PERFORMANCE.realizedPnl, { sign: true, cents: false })}
            tone={PERFORMANCE.realizedPnl >= 0 ? "pos" : "neg"}
            sub={`${PERFORMANCE.closedTrades} closed trades`}
          />
          <Stat
            label="Marked P&L"
            value={usd(PERFORMANCE.markedPnl, { sign: true, cents: false })}
            tone={PERFORMANCE.markedPnl >= 0 ? "pos" : "neg"}
            sub={`Realized ${usd(PERFORMANCE.realizedPnl, { sign: true, cents: false })} + unrealized ${usd(PERFORMANCE.unrealizedPnl, { sign: true, cents: false })}`}
          />
          <Stat
            label="Account return"
            value={`${PERFORMANCE.accountReturnPct > 0 ? "+" : ""}${num(PERFORMANCE.accountReturnPct, 2)}%`}
            tone={PERFORMANCE.accountReturnPct >= 0 ? "pos" : "neg"}
          />
          <Stat
            label="Return on capital at risk"
            value={`${num(PERFORMANCE.returnOnCapitalAtRisk, 1)}%`}
            sub="Against debit deployed"
          />
          <Stat
            label="Win rate"
            value={`${Math.round(PERFORMANCE.winRate * 100)}%`}
            sub={`${PERFORMANCE.wins}W / ${PERFORMANCE.losses}L closed`}
          />
          <Stat
            label="Max drawdown"
            value={`−${num(PERFORMANCE.maxDrawdownPct, 1)}%`}
            sub="Peak to trough equity"
          />
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHead
            title="Paper account equity"
            hint="Marked with conservative liquidation values, not mid"
          />
          <EquityCurve />
        </Panel>

        <Panel>
          <PanelHead title="Trade statistics" />
          <Table>
            <thead>
              <tr>
                <Th>Measure</Th>
                <Th align="right">Value</Th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Entry orders filled", String(PERFORMANCE.fills)],
                ["Closed / still open", `${PERFORMANCE.closedTrades} / ${PERFORMANCE.openTrades}`],
                ["Wins / losses (closed)", `${PERFORMANCE.wins} / ${PERFORMANCE.losses}`],
                ["Average win", usd(PERFORMANCE.avgWin, { cents: false })],
                ["Average loss", usd(PERFORMANCE.avgLoss, { cents: false })],
                ["Average fill vs submission mid", num(PERFORMANCE.avgFillVsMid, 3)],
                ["Starting equity", usd(PERFORMANCE.startingEquity, { cents: false })],
              ].map(([k, v]) => (
                <tr key={k}>
                  <Td>{k}</Td>
                  <Td align="right" mono>
                    {v}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p className="mt-3 text-[0.6875rem] leading-4 text-ink-3">
            Fill versus mid is negative on average, meaning entries filled inside the quoted
            mid. On a paper account this is optimistic and should be read as such.
          </p>
        </Panel>
      </div>

      <Panel>
        <PanelHead
          title="Agent versus simulated baseline and benchmarks"
          hint="The baseline uses the same event timestamps with price-and-volume confirmation only — no LLM, no graph, no credentials, no access to the order adapter."
          action={
            <Badge tone="neutral">
              Agent {last.agent > 0 ? "+" : ""}
              {num(last.agent, 2)}% · baseline {last.baseline > 0 ? "+" : ""}
              {num(last.baseline, 2)}%
            </Badge>
          }
        />
        <BenchmarkChart height={260} />
        <div className="mt-4">
          <Note>
            Where point-in-time option quotes were unavailable, the baseline compares
            underlying stock returns rather than pretending to simulate an option fill. Every
            baseline figure is labelled <span className="tnum">SIMULATED</span>.
          </Note>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHead title="Closed trades" hint="Each row links to the dossier that authorised it" />
          <Table>
            <thead>
              <tr>
                <Th>Position</Th>
                <Th>Exit</Th>
                <Th align="right">Debit</Th>
                <Th align="right">Exit mark</Th>
                <Th align="right">Fill vs mid</Th>
                <Th align="right">Realized</Th>
              </tr>
            </thead>
            <tbody>
              {closed.map((p) => (
                <tr key={p.positionId}>
                  <Td>
                    <Link
                      href={`/dossiers/${p.dossierId}`}
                      className="text-ink underline-offset-4 hover:underline"
                    >
                      {p.target}
                    </Link>
                    <span className="tnum ml-2 text-[0.625rem] text-ink-3">×{p.contracts}</span>
                    <div className="tnum text-[0.625rem] text-ink-3">
                      {p.state.type === "CLOSED" ? dateTime(p.state.closedAt) : ""}
                    </div>
                  </Td>
                  <Td>
                    <Badge tone={p.exitTrigger === "profit_target" ? "pos" : "warn"}>
                      {titleCase(p.exitTrigger ?? "—")}
                    </Badge>
                  </Td>
                  <Td align="right" mono>
                    {num(p.entryDebit)}
                  </Td>
                  <Td align="right" mono>
                    {num(p.liquidationValue)}
                  </Td>
                  <Td align="right" mono className="text-ink-3">
                    {num(p.fillVsMid)}
                  </Td>
                  <Td
                    align="right"
                    mono
                    className={cx((p.realizedPnl ?? 0) >= 0 ? "text-pos" : "text-neg")}
                  >
                    {usd(p.realizedPnl ?? 0, { sign: true, cents: false })}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel>
          <PanelHead title="Decision funnel totals" hint="Rejections grouped by reason" />
          <RejectionBars limit={6} />
        </Panel>
      </div>

      <Panel>
        <PanelHead title="Limitations we are disclosing" hint="Read this before the numbers above" />
        <ul className="space-y-2.5 text-xs leading-5 text-ink-2">
          {[
            "Options data on this account is indicative rather than OPRA, so quotes and marks may differ from consolidated NBBO.",
            "Paper fills are optimistic: multi-leg debit orders filled at or inside the quoted mid more often than a live account should expect.",
            "Four trading sessions and five closed trades cannot establish durable alpha. The sample is far too small for a profitability claim.",
            "Development thresholds were tuned on a 15–18 event replay set and frozen; the holdout of 5–7 events was run exactly once.",
            "Extraction accuracy metrics are reported at n = 17 and are indicative only.",
            "This is a paper account. Nothing here is financial advice.",
          ].map((s) => (
            <li key={s} className="flex items-start gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-3" />
              {s}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
