import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Badge,
  Dot,
  KeyValue,
  Note,
  Panel,
  PanelHead,
  PageHeader,
} from "@/components/ui/primitives";
import { IconExternal } from "@/components/ui/icons";
import { EvidenceList, EvidenceText } from "@/components/feature/evidence";
import { DecisionBadge } from "@/components/feature/decision";
import { FlowGraph } from "@/components/graph/flow-graph";
import { EDGES, EVENTS, NOW, dossiersForEvent, eventById } from "@/lib/mock";
import { compactUsd, dateTime, num, pct, since, titleCase } from "@/lib/format";

export async function generateStaticParams() {
  return EVENTS.map((e) => ({ eventId: e.eventId }));
}

export async function generateMetadata(props: PageProps<"/events/[eventId]">): Promise<Metadata> {
  const { eventId } = await props.params;
  const event = eventById(eventId);
  return { title: event ? `${event.actor} · ${event.eventId}` : "Event" };
}

export default async function EventPage(props: PageProps<"/events/[eventId]">) {
  const { eventId } = await props.params;
  const event = eventById(eventId);
  if (!event) notFound();

  const dossiers = dossiersForEvent(event.eventId);
  const reachable = EDGES.filter((e) => e.fromSymbol === event.actor);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${event.eventId} · ${event.source}`}
        title={event.headline}
        lede={`${titleCase(event.eventType)} on ${event.actor}, detected ${since(event.detectedTs, NOW)} after publication.`}
        actions={
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink transition-colors hover:bg-surface-2"
          >
            Source article <IconExternal size={13} />
          </a>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel>
            <PanelHead
              title="Evidence-grounded extraction"
              hint="Highlighted text backs a non-null field"
              action={
                <Badge tone={event.state === "active" ? "pos" : "neutral"}>
                  <Dot tone={event.state === "active" ? "pos" : "neutral"} />
                  {titleCase(event.state)}
                </Badge>
              }
            />
            <EvidenceText event={event} />
            <div className="hairline my-4" />
            <EvidenceList event={event} />
          </Panel>

          <Panel>
            <PanelHead title="Structured event" hint="Schema from §7.1" />
            <KeyValue
              items={[
                { k: "actor", v: event.actor },
                { k: "eventType", v: event.eventType },
                { k: "direction", v: event.direction },
                { k: "amountUsd", v: event.amountUsd === null ? "null" : compactUsd(event.amountUsd) },
                { k: "directRecipient", v: event.directRecipient ?? "null" },
                { k: "status", v: event.status ?? "null" },
                {
                  k: "spendingCategories",
                  v: event.spendingCategories.length ? event.spendingCategories.join(", ") : "[]",
                },
                { k: "sourceTs", v: dateTime(event.sourceTs) },
                { k: "detectedTs", v: dateTime(event.detectedTs) },
                { k: "activeUntil", v: dateTime(event.activeUntil) },
                { k: "rawPayloadHash", v: event.rawPayloadHash },
                { k: "evidenceSpans", v: String(event.evidenceSpans.length) },
              ]}
            />
            {event.state === "rejected" && (
              <div className="mt-4">
                <Note tone="warn">
                  Rejected at validation. The article is analyst speculation with no company
                  statement, so every factual field would have to be invented. The correct
                  behaviour is abstention.
                </Note>
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <PanelHead
              title="Graph propagation"
              hint={`${reachable.length} first-hop suppliers from ${event.actor}`}
            />
            <FlowGraph
              actor={event.actor}
              activePath={dossiers.flatMap((d) => d.graphPath.map((e) => e.edgeId))}
              height={320}
              interactive={false}
            />
          </Panel>

          <Panel>
            <PanelHead title="Decisions from this event" hint="One dossier per evaluated target" />
            {dossiers.length === 0 ? (
              <p className="text-xs text-ink-3">
                No dossier was produced — the event never reached the market-feature stage.
              </p>
            ) : (
              <ul className="space-y-2">
                {dossiers.map((d) => (
                  <li key={d.dossierId}>
                    <Link
                      href={`/dossiers/${d.dossierId}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2/50 px-3 py-2.5 transition-colors hover:bg-surface-2"
                    >
                      <span className="min-w-0">
                        <span className="text-xs font-medium text-ink">{d.target}</span>
                        <span className="tnum ml-2 text-[0.6875rem] text-ink-3">{d.dossierId}</span>
                        <span className="mt-0.5 block text-[0.6875rem] text-ink-3">
                          RVOL {num(d.marketSnapshot.rvol)}× · target {pct(d.marketSnapshot.targetRelativeReturn)}
                          {d.rejectionReasons.length ? ` · ${d.rejectionReasons.join(", ")}` : ""}
                        </span>
                      </span>
                      <DecisionBadge decision={d.decision} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHead title="Activation & dedupe" hint="§8" />
            <ol className="space-y-2 text-xs leading-5 text-ink-2">
              <li>1. Payload hashed — {event.rawPayloadHash}</li>
              <li>2. Hash unseen, so the item survived dedupe</li>
              <li>3. No matching actor + type + amount within 24h</li>
              <li>4. Stored active for two trading sessions</li>
              <li>5. Reevaluated against catch-up conditions every 30 minutes</li>
              <li>6. Expires {dateTime(event.activeUntil)} — stale events cannot order</li>
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}
