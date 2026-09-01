import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  Dot,
  Note,
  Panel,
  PageHeader,
  Stat,
} from "@/components/ui/primitives";
import { EVENTS, NOW } from "@/lib/mock";
import { compactUsd, cx, dateTime, since, titleCase } from "@/lib/format";

export const metadata: Metadata = { title: "Events" };

const STATE_TONE = { active: "pos", expired: "neutral", rejected: "neg" } as const;

export default function EventsPage() {
  const active = EVENTS.filter((e) => e.state === "active");
  const rejected = EVENTS.filter((e) => e.state === "rejected");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Event pipeline"
        title="Extracted capital-flow events"
        lede="Five accepted event types. Everything else resolves to NO_EVENT. Missing information stays null — it is never guessed, and any unsupported non-null field invalidates the whole event."
      />

      <Panel>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat label="Active" value={String(active.length)} sub="Live for two sessions" />
          <Stat label="Rejected today" value={String(rejected.length)} sub="No evidence for any field" />
          <Stat label="Dedupe drops" value="144" sub="Repeat payload hashes" />
          <Stat label="NO_EVENT" value="234" sub="Unsupported content" />
        </div>
      </Panel>

      <div className="space-y-3">
        {EVENTS.map((e) => (
          <Link
            key={e.eventId}
            href={`/events/${e.eventId}`}
            className={cx(
              "block rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-2/40",
              e.state === "rejected" && "opacity-75",
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={STATE_TONE[e.state]}>
                <Dot tone={STATE_TONE[e.state]} pulse={e.state === "active"} />
                {titleCase(e.state)}
              </Badge>
              <Badge tone="neutral" mono>
                {e.actor}
              </Badge>
              <Badge tone="neutral">{titleCase(e.eventType)}</Badge>
              <Badge tone={e.direction === "positive" ? "pos" : e.direction === "negative" ? "neg" : "warn"}>
                {titleCase(e.direction)}
              </Badge>
              {e.amountUsd !== null && (
                <Badge tone="clay" mono>
                  {compactUsd(e.amountUsd)}
                </Badge>
              )}
              {e.directRecipient && (
                <Badge tone="info" mono>
                  → {e.directRecipient}
                </Badge>
              )}
              <span className="tnum ml-auto text-[0.6875rem] text-ink-3">
                {since(e.detectedTs, NOW)} ago · {dateTime(e.sourceTs)}
              </span>
            </div>

            <h2 className="mt-2.5 text-sm leading-6 font-medium text-ink">{e.headline}</h2>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] text-ink-3">
              <span>{e.source}</span>
              <span className="tnum">{e.eventId}</span>
              <span>
                {e.evidenceSpans.length} evidence span{e.evidenceSpans.length === 1 ? "" : "s"}
              </span>
              <span>
                {e.spendingCategories.length
                  ? e.spendingCategories.join(" · ")
                  : "no categories extracted"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Note>
        LLM confidence is telemetry only. It never gates admission — the deterministic
        invariants do.
      </Note>
    </div>
  );
}
