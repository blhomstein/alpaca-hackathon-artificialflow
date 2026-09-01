import type { Metadata } from "next";
import {
  Badge,
  Dot,
  Note,
  Panel,
  PanelHead,
  PageHeader,
  Table,
  Td,
  Th,
} from "@/components/ui/primitives";
import { HEALTH, MCP_CALLS, NOW } from "@/lib/mock";
import { dateTime, since } from "@/lib/format";

export const metadata: Metadata = { title: "System health" };

const TONE = { ok: "pos", degraded: "warn", down: "neg" } as const;

export default function HealthPage() {
  const degraded = HEALTH.filter((h) => h.status !== "ok");
  const mcpOk = MCP_CALLS.filter((c) => c.ok).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="System health and broker truth"
        lede="On restart the agent fetches account, positions, open orders and activities from Alpaca, repairs local projections from broker state, and refuses to submit anything new until reconciliation succeeds."
        actions={
          <Badge tone={degraded.length ? "warn" : "pos"}>
            <Dot tone={degraded.length ? "warn" : "pos"} pulse />
            {degraded.length ? `${degraded.length} degraded` : "All nominal"}
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HEALTH.map((h) => (
          <Panel key={h.key}>
            <div className="flex items-start justify-between gap-3">
              <div className="eyebrow">{h.label}</div>
              <Dot tone={TONE[h.status]} pulse={h.status === "ok"} />
            </div>
            <div className="tnum mt-2 text-lg leading-6 text-ink">{h.value}</div>
            <p className="mt-1.5 text-[0.6875rem] leading-4 text-ink-3">{h.detail}</p>
          </Panel>
        ))}
      </div>

      <Note tone="warn">
        <strong className="font-medium">Options feed disclosure.</strong> This account is not
        entitled to OPRA, so option quotes are indicative. The agent detects the feed at
        startup, records it here, prices every spread conservatively, and the submission
        states the limitation rather than reporting marks as if they were consolidated.
      </Note>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHead
            title="Alpaca MCP telemetry"
            hint="Tool name, purpose, timestamp and outcome — never credentials"
            action={
              <Badge tone="neutral">
                {mcpOk} / {MCP_CALLS.length} succeeded
              </Badge>
            }
          />
          <Table>
            <thead>
              <tr>
                <Th>Time</Th>
                <Th>Tool</Th>
                <Th>Purpose</Th>
                <Th align="right">Latency</Th>
                <Th align="right">Result</Th>
              </tr>
            </thead>
            <tbody>
              {MCP_CALLS.map((c, i) => (
                <tr key={i}>
                  <Td mono className="text-ink-3">
                    {dateTime(c.ts)}
                  </Td>
                  <Td mono>{c.tool}</Td>
                  <Td className="text-ink-2">{c.purpose}</Td>
                  <Td align="right" mono className="text-ink-3">
                    {c.latencyMs} ms
                  </Td>
                  <Td align="right">
                    <Badge tone={c.ok ? "pos" : "neg"}>{c.ok ? "ok" : "failed"}</Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p className="mt-3 text-[0.6875rem] text-ink-3">
            The failed call is the startup feed probe — it is how the agent learned the options
            feed is indicative rather than OPRA.
          </p>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelHead title="Restart recovery" hint="§13.5" />
            <ol className="space-y-2 text-xs leading-5 text-ink-2">
              {[
                "Fetch account, positions, open orders and recent activities.",
                "Compare broker state with local projections.",
                "Repair local state from broker truth — the broker always wins.",
                "Resume monitoring existing positions.",
                "Submit nothing new until reconciliation succeeds.",
              ].map((s, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="tnum text-ink-3">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[0.6875rem] text-ink-3">
              Last reconciliation {since("2026-09-01T18:40:00Z", NOW)} ago · 2 positions and 1
              open order matched with no repair required.
            </p>
          </Panel>

          <Panel>
            <PanelHead title="Idempotency" hint="§13.1" />
            <p className="text-xs leading-5 text-ink-2">
              Every entry carries a key derived from the dossier, target, direction and spread
              definition. Before submitting, the engine reconciles live Alpaca orders and
              refuses if an existing order or position already satisfies the intent. The Alpaca
              order ID is persisted before any retry logic runs, and an unfilled DAY entry
              expires and is logged — never silently resubmitted next session.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
