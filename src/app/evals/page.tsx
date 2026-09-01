import type { Metadata } from "next";
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
import { IconCheck, IconLock } from "@/components/ui/icons";
import { EVAL_RUNS, EXECUTION_TESTS, RISK_LIMITS } from "@/lib/mock";
import { dateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Replay & evals" };

export default function EvalsPage() {
  const dev = EVAL_RUNS.find((r) => r.set === "development")!;
  const hold = EVAL_RUNS.find((r) => r.set === "holdout")!;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Replay & evaluation"
        title="Tuned on development, judged on holdout"
        lede="Thresholds were chosen on the development replay set, frozen with a checksum, and the holdout was run exactly once. We evaluate decision behaviour — not invented historical option P&L."
        actions={
          <Badge tone="clay">
            <IconLock size={11} />
            Config frozen {dateTime(RISK_LIMITS.frozenAt)}
          </Badge>
        }
      />

      <Panel>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-5">
          <Stat label="Replay events" value="23" sub="17 development · 6 holdout" />
          <Stat label="Extraction corpus" value="17" sub="12 positive · 5 negative articles" />
          <Stat label="Holdout runs" value="1" sub="Run once, reported once" />
          <Stat label="Invented fields" value="0" sub="Amounts, recipients, statuses" tone="pos" />
          <Stat
            label="Execution tests"
            value={`${EXECUTION_TESTS.length} / ${EXECUTION_TESTS.length}`}
            sub="100% required"
            tone="pos"
          />
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {[dev, hold].map((run) => (
          <Panel key={run.id}>
            <PanelHead
              title={`${run.set === "development" ? "Development set" : "Holdout set"} · ${run.id}`}
              hint={`${run.events} events · ran ${dateTime(run.ranAt)}`}
              action={
                <Badge tone={run.set === "holdout" ? "clay" : "neutral"}>
                  {run.set === "holdout" ? "Single run" : "Tunable"}
                </Badge>
              }
            />
            <Table>
              <thead>
                <tr>
                  <Th>Metric</Th>
                  <Th align="right">Result</Th>
                  <Th align="right">Target</Th>
                </tr>
              </thead>
              <tbody>
                {run.metrics.map((m) => (
                  <tr key={m.label}>
                    <Td>{m.label}</Td>
                    <Td align="right" mono>
                      <span className={m.pass ? "text-pos" : "text-neg"}>{m.value}</span>
                    </Td>
                    <Td align="right" mono className="text-ink-3">
                      {m.target ?? "—"}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <p className="tnum mt-3 text-[0.625rem] text-ink-3">{run.configChecksum}</p>
          </Panel>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Panel>
          <PanelHead title="Protocol" hint="§16" />
          <ol className="space-y-2.5 text-xs leading-5 text-ink-2">
            {[
              "Tune only on development events.",
              "Freeze the configuration and store its checksum.",
              "Run the holdout exactly once.",
              "Report development and holdout separately — never pooled.",
              "Evaluate decision behaviour, not reconstructed historical option P&L.",
              "Exercise full, partial, rejected and no-fill order paths against mocks.",
            ].map((s, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="tnum text-ink-3">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <Note tone="warn">
              Extraction accuracy at n = 17 is indicative. The zero-invention targets are the
              metrics that actually gate shipping.
            </Note>
          </div>
        </Panel>

        <Panel>
          <PanelHead
            title="Risk & execution test suite"
            hint="All must pass — no partial credit"
            action={<Badge tone="pos">{EXECUTION_TESTS.length} passing</Badge>}
          />
          <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {EXECUTION_TESTS.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 border-b border-line py-1.5 last:border-0"
              >
                <span className="text-pos">
                  <IconCheck size={13} />
                </span>
                <span className="tnum text-[0.625rem] text-ink-3">{t.id}</span>
                <span className="text-xs text-ink-2">{t.label}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel>
        <PanelHead title="Offline baseline" hint="§17 — a script, not a service" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Same event timestamps", "Reads the identical replay events"],
            ["Price and volume only", "No LLM, no graph, no critic"],
            ["No Alpaca credentials", "Cannot authenticate, by construction"],
            ["Cannot import the adapter", "Enforced by a test — AC-14"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-line bg-surface-2/50 p-3">
              <div className="text-xs font-medium text-ink">{k}</div>
              <div className="mt-1 text-[0.6875rem] leading-4 text-ink-3">{v}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[0.6875rem] text-ink-3">
          Every baseline output is displayed as <span className="tnum">SIMULATED</span>. Its
          entries and exits are conservative and never presented as achieved fills.
        </p>
      </Panel>
    </div>
  );
}
