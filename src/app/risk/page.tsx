import type { Metadata } from "next";
import {
  Badge,
  Dot,
  Meter,
  Note,
  Panel,
  PanelHead,
  PageHeader,
  Stat,
  Table,
  Td,
  Th,
} from "@/components/ui/primitives";
import { IconCheck, IconShield } from "@/components/ui/icons";
import { EXECUTION_TESTS, POSITIONS, RISK_LIMITS, RISK_NOW } from "@/lib/mock";
import { num, usd } from "@/lib/format";

export const metadata: Metadata = { title: "Risk & controls" };

export default function RiskPage() {
  const open = POSITIONS.filter((p) => p.state.type !== "CLOSED");

  const limits = [
    {
      rule: "Maximum theoretical loss per trade",
      locked: `${usd(RISK_LIMITS.maxLossPerTrade, { cents: false })} · 1.2%`,
      current: usd(Math.max(...open.map((p) => p.maxLoss)), { cents: false }),
      ok: Math.max(...open.map((p) => p.maxLoss)) <= RISK_LIMITS.maxLossPerTrade,
    },
    {
      rule: "Maximum total open theoretical loss",
      locked: `${usd(RISK_LIMITS.maxOpenLoss, { cents: false })} · 5%`,
      current: usd(RISK_NOW.openTheoreticalLoss, { cents: false }),
      ok: RISK_NOW.openTheoreticalLoss <= RISK_LIMITS.maxOpenLoss,
    },
    {
      rule: "Maximum concurrent positions",
      locked: String(RISK_LIMITS.maxPositions),
      current: String(RISK_NOW.openPositions),
      ok: RISK_NOW.openPositions <= RISK_LIMITS.maxPositions,
    },
    {
      rule: "Maximum same-direction positions",
      locked: String(RISK_LIMITS.maxSameDirection),
      current: String(RISK_NOW.sameDirectionPositions),
      ok: RISK_NOW.sameDirectionPositions <= RISK_LIMITS.maxSameDirection,
    },
    {
      rule: "Daily stop — blocks new entries",
      locked: `${usd(RISK_LIMITS.dailyStop, { cents: false })} marked P&L`,
      current: usd(RISK_NOW.markedPnlToday, { sign: true, cents: false }),
      ok: RISK_NOW.markedPnlToday > RISK_LIMITS.dailyStop,
    },
    {
      rule: "Kill switch — halts all automation",
      locked: `−${RISK_LIMITS.killSwitchDrawdownPct}% equity drawdown`,
      current: `−${num(RISK_NOW.drawdownPct, 1)}%`,
      ok: RISK_NOW.drawdownPct < RISK_LIMITS.killSwitchDrawdownPct,
    },
    {
      rule: "Days to expiration",
      locked: `${RISK_LIMITS.dteMin}–${RISK_LIMITS.dteMax}`,
      current: open.map((p) => p.dte).join(", "),
      ok: open.every((p) => p.dte >= RISK_LIMITS.dteMin && p.dte <= RISK_LIMITS.dteMax),
    },
    {
      rule: "Order style",
      locked: "DAY multi-leg limit",
      current: "DAY mleg",
      ok: true,
    },
    {
      rule: "Uncovered short options",
      locked: "Never",
      current: "0",
      ok: true,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deterministic risk engine"
        title="Limits, stops, and the kill switch"
        lede="Risk is code, not judgement. The LLM components can research and object; only this engine can place an order, and it applies every limit below without exception tiers."
        actions={
          <Badge tone="pos">
            <Dot tone="pos" pulse />
            Automation live
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel>
          <PanelHead title="Portfolio risk" hint="Sum of open maximum theoretical loss" />
          <Stat
            label="In use"
            value={usd(RISK_NOW.openTheoreticalLoss, { cents: false })}
            sub={`${Math.round((RISK_NOW.openTheoreticalLoss / RISK_LIMITS.maxOpenLoss) * 100)}% of the ${usd(RISK_LIMITS.maxOpenLoss, { cents: false })} cap`}
          />
          <div className="mt-4">
            <Meter value={RISK_NOW.openTheoreticalLoss} max={RISK_LIMITS.maxOpenLoss} />
          </div>
        </Panel>

        <Panel>
          <PanelHead title="Daily stop" hint="Blocks new entries; open positions still managed" />
          <Stat
            label="Marked P&L today"
            value={usd(RISK_NOW.markedPnlToday, { sign: true, cents: false })}
            sub={`${usd(RISK_NOW.markedPnlToday - RISK_LIMITS.dailyStop, { cents: false })} of headroom`}
            tone={RISK_NOW.markedPnlToday >= 0 ? "pos" : "neg"}
          />
          <div className="mt-4">
            <Meter
              value={Math.max(0, -RISK_NOW.markedPnlToday)}
              max={Math.abs(RISK_LIMITS.dailyStop)}
              tone="warn"
            />
          </div>
        </Panel>

        <Panel>
          <PanelHead title="Kill switch" hint="Halts all automation at −8% equity" />
          <Stat
            label="Drawdown from peak"
            value={`−${num(RISK_NOW.drawdownPct, 1)}%`}
            sub={`Trips at −${RISK_LIMITS.killSwitchDrawdownPct}%`}
          />
          <div className="mt-4">
            <Meter
              value={RISK_NOW.drawdownPct}
              max={RISK_LIMITS.killSwitchDrawdownPct}
              tone="neg"
            />
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHead
          title="Locked risk rules"
          hint="Frozen before live trading; changing one after a losing trade is forbidden"
          action={
            <span className="tnum text-ink-3">{RISK_LIMITS.configChecksum}</span>
          }
        />
        <Table>
          <thead>
            <tr>
              <Th>Rule</Th>
              <Th>Locked setting</Th>
              <Th align="right">Current</Th>
              <Th align="right">Status</Th>
            </tr>
          </thead>
          <tbody>
            {limits.map((l) => (
              <tr key={l.rule}>
                <Td>{l.rule}</Td>
                <Td mono className="text-ink-2">
                  {l.locked}
                </Td>
                <Td align="right" mono>
                  {l.current}
                </Td>
                <Td align="right">
                  <Badge tone={l.ok ? "pos" : "neg"}>{l.ok ? "Within" : "Breach"}</Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p className="mt-3 text-[0.6875rem] text-ink-3">
          Marked P&amp;L = realized P&amp;L + conservative unrealized P&amp;L, where unrealized
          uses the liquidation value bid(long) − ask(short).
        </p>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHead
            title="Risk & execution test suite"
            hint="100% required — every one of these must pass to ship"
            action={<Badge tone="pos">{EXECUTION_TESTS.length} / {EXECUTION_TESTS.length}</Badge>}
          />
          <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {EXECUTION_TESTS.map((t) => (
              <li key={t.id} className="flex items-center gap-2 border-b border-line py-1.5 last:border-0">
                <span className="text-pos">
                  <IconCheck size={13} />
                </span>
                <span className="tnum text-[0.625rem] text-ink-3">{t.id}</span>
                <span className="text-xs text-ink-2">{t.label}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelHead title="Structures the agent may never build" hint="§3.2 and §12" />
            <ul className="space-y-2 text-xs leading-5 text-ink-2">
              {[
                "Naked or uncovered short options",
                "Credit spreads and any undefined-risk structure",
                "0DTE contracts",
                "Intraday scalping or high-frequency trading",
                "A second live setup or strategy",
                "Online threshold optimization during the competition",
              ].map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-neg" />
                  {s}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelHead title="Authority model" hint="§6.1" />
            <Table>
              <thead>
                <tr>
                  <Th>Capability</Th>
                  <Th align="right">Can place orders</Th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Research — LLM extraction with evidence spans", false],
                  ["Graph resolution — deterministic traversal", false],
                  ["Market analysis — deterministic from bars & quotes", false],
                  ["Critic — LLM falsification attempt (may veto)", false],
                  ["Risk & execution — deterministic code", true],
                ].map(([label, can]) => (
                  <tr key={label as string}>
                    <Td>{label as string}</Td>
                    <Td align="right">
                      {can ? (
                        <Badge tone="clay">
                          <IconShield size={11} /> Sole authority
                        </Badge>
                      ) : (
                        <span className="text-ink-3">No</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Panel>
        </div>
      </div>

      <Note tone="warn">
        Paper trading only, on a dedicated $100,000 Alpaca paper account. Nothing here is
        financial advice, and paper fills are optimistic relative to live execution.
      </Note>
    </div>
  );
}
