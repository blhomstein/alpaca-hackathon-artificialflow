import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Badge,
  KeyValue,
  Note,
  Panel,
  PanelHead,
  PageHeader,
} from "@/components/ui/primitives";
import { FlowGraph } from "@/components/graph/flow-graph";
import { EvidenceText } from "@/components/feature/evidence";
import {
  CatchUpGates,
  CriticCard,
  DecisionBadge,
  ExecutionTrail,
  GraphPath,
  InvariantGrid,
  SpreadLegs,
} from "@/components/feature/decision";
import { DOSSIERS, RISK_LIMITS, SYMBOL_NAMES, dossierById } from "@/lib/mock";
import { compactUsd, dateTime, num, pct, titleCase, usd } from "@/lib/format";

export async function generateStaticParams() {
  return DOSSIERS.map((d) => ({ dossierId: d.dossierId }));
}

export async function generateMetadata(
  props: PageProps<"/dossiers/[dossierId]">,
): Promise<Metadata> {
  const { dossierId } = await props.params;
  const d = dossierById(dossierId);
  return { title: d ? `${d.target} · ${d.dossierId}` : "Dossier" };
}

export default async function DossierPage(props: PageProps<"/dossiers/[dossierId]">) {
  const { dossierId } = await props.params;
  const d = dossierById(dossierId);
  if (!d) notFound();

  const failed = d.invariants.filter((i) => !i.passed);
  const m = d.marketSnapshot;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${d.dossierId} · ${dateTime(d.createdTs)}`}
        title={`${d.target} — ${d.decision === "TRADE" ? "traded" : "abstained"}`}
        lede={`${SYMBOL_NAMES[d.target]} evaluated against ${d.event.actor}'s ${titleCase(d.event.eventType).toLowerCase()}. ${
          d.decision === "TRADE"
            ? "All fourteen invariants passed and the risk engine placed a defined-risk debit spread."
            : `Blocked by ${d.rejectionReasons.join(", ")}.`
        }`}
        actions={<DecisionBadge decision={d.decision} />}
      />

      {d.decision === "REJECT" && (
        <Note tone={failed.length ? "neg" : "warn"}>
          <strong className="font-medium">No order was submitted.</strong>{" "}
          {failed.length
            ? `Invariant ${failed.map((f) => f.id).join(", ")} failed — ${failed[0].detail}.`
            : "The setup gates rejected the candidate before spread construction."}{" "}
          The critic can only block; it can never make a failed invariant pass.
        </Note>
      )}

      {/* ---------------------------------------------------- 1. the event */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHead
            title="1 · Event"
            hint={`${d.event.source} · ${dateTime(d.event.sourceTs)}`}
            action={
              <Link
                href={`/events/${d.event.eventId}`}
                className="text-clay-ink underline-offset-4 hover:underline"
              >
                Full event
              </Link>
            }
          />
          <h3 className="text-sm leading-6 font-medium text-ink">{d.event.headline}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="neutral" mono>
              {d.event.actor}
            </Badge>
            <Badge tone="neutral">{titleCase(d.event.eventType)}</Badge>
            <Badge tone={d.event.direction === "positive" ? "pos" : "neg"}>
              {titleCase(d.event.direction)}
            </Badge>
            <Badge tone="clay" mono>
              {compactUsd(d.event.amountUsd)}
            </Badge>
          </div>
          <div className="mt-3">
            <EvidenceText event={d.event} />
          </div>
        </Panel>

        <Panel>
          <PanelHead title="2 · Verified graph path" hint="Traversal capped at two hops" />
          <GraphPath dossier={d} />
          <div className="mt-3">
            <FlowGraph
              actor={d.event.actor}
              target={d.target}
              activePath={d.graphPath.map((e) => e.edgeId)}
              height={280}
              interactive={false}
            />
          </div>
        </Panel>
      </div>

      {/* ---------------------------------------------- 3. market + critic */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHead
            title="3 · Catch-up conditions"
            hint={`Reproducible from stored bars as of ${dateTime(m.asOf)}`}
          />
          <CatchUpGates m={m} />
          <div className="mt-4">
            <KeyValue
              items={[
                { k: "Last price", v: num(m.lastPrice) },
                { k: "Benchmark (SMH) return", v: pct(m.benchmarkReturn) },
                { k: "Bar interval", v: m.barInterval },
                { k: "Bar completed", v: dateTime(m.barCompletedAt) },
              ]}
            />
          </div>
        </Panel>

        <Panel>
          <PanelHead title="4 · Critic" hint="Sees only this dossier; may veto, never authorise" />
          <CriticCard critic={d.critic} />
        </Panel>
      </div>

      {/* ------------------------------------------------------- 5. spread */}
      <Panel>
        <PanelHead
          title="5 · Spread construction"
          hint={
            d.optionSnapshot
              ? `${titleCase(d.optionSnapshot.structure)} · ${d.optionSnapshot.dte} DTE · width ${num(d.optionSnapshot.strikeWidth, 0)}`
              : "No spread was constructed"
          }
        />
        {d.optionSnapshot ? (
          <SpreadLegs snap={d.optionSnapshot} />
        ) : (
          <p className="text-xs leading-5 text-ink-2">
            The candidate was rejected before the option-spread builder ran, so no chain was
            priced and no contracts were selected. Recording the abstention at this stage is
            deliberate: it keeps the decision reproducible without inventing option data.
          </p>
        )}
      </Panel>

      {/* -------------------------------------------------- 6. invariants */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHead
            title="6 · Trade-admission invariants"
            hint={`${d.invariants.filter((i) => i.passed).length} of ${d.invariants.length} passed · there are no exception tiers`}
            action={
              failed.length ? (
                <Badge tone="neg">{failed.length} failed</Badge>
              ) : (
                <Badge tone="pos">All passed</Badge>
              )
            }
          />
          <InvariantGrid invariants={d.invariants} />
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelHead title="7 · Risk" hint="Deterministic engine — the only component that can order" />
            <KeyValue
              columns={1}
              items={[
                {
                  k: "Open risk before",
                  v: `${usd(d.riskBefore.openTheoreticalLoss, { cents: false })} of ${usd(RISK_LIMITS.maxOpenLoss, { cents: false })}`,
                },
                {
                  k: "Open risk after",
                  v: d.riskAfter
                    ? `${usd(d.riskAfter.openTheoreticalLoss, { cents: false })} of ${usd(RISK_LIMITS.maxOpenLoss, { cents: false })}`
                    : "unchanged",
                },
                { k: "Positions before → after", v: `${d.riskBefore.openPositions} → ${d.riskAfter?.openPositions ?? d.riskBefore.openPositions}` },
                { k: "Daily stop", v: `${usd(d.riskBefore.markedPnlToday, { sign: true })} vs ${usd(RISK_LIMITS.dailyStop, { cents: false })}` },
                { k: "Kill switch", v: `${num(d.riskBefore.drawdownPct, 1)}% of ${RISK_LIMITS.killSwitchDrawdownPct}%` },
              ]}
            />
          </Panel>

          <Panel>
            <PanelHead
              title="8 · Execution"
              hint={d.positionId ? `Position ${d.positionId}` : "No order lifecycle"}
              action={
                d.positionId ? (
                  <Link
                    href={`/positions#${d.positionId}`}
                    className="text-clay-ink underline-offset-4 hover:underline"
                  >
                    Position
                  </Link>
                ) : undefined
              }
            />
            <ExecutionTrail dossier={d} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
