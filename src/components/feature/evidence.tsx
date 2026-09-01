import type { CapitalFlowEvent } from "@/lib/types";

/**
 * Renders the article excerpt with evidence spans marked. Every non-null
 * field on an event must point at a span here — that is the whole
 * anti-hallucination contract (§7.1).
 */
export function EvidenceText({ event }: { event: CapitalFlowEvent }) {
  const text = event.bodyExcerpt;
  const spans = [...event.evidenceSpans]
    .filter((s) => s.start < text.length)
    .sort((a, b) => a.start - b.start);

  const parts: Array<{ text: string; field?: string }> = [];
  let cursor = 0;
  for (const s of spans) {
    const start = Math.max(cursor, s.start);
    const end = Math.min(text.length, Math.max(start, s.end));
    if (start > cursor) parts.push({ text: text.slice(cursor, start) });
    if (end > start) parts.push({ text: text.slice(start, end), field: s.field });
    cursor = Math.max(cursor, end);
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });

  return (
    <p className="text-[0.8125rem] leading-6 text-ink-2">
      {parts.map((p, i) =>
        p.field ? (
          <mark
            key={i}
            title={`evidence for ${p.field}`}
            className="rounded bg-clay-soft px-0.5 text-clay-ink decoration-clay/40 underline-offset-4 [text-decoration-line:underline]"
          >
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </p>
  );
}

export function EvidenceList({ event }: { event: CapitalFlowEvent }) {
  if (event.evidenceSpans.length === 0) {
    return (
      <p className="text-xs text-ink-3">
        No evidence spans — every factual field on this event is null, which is why it
        produced no candidate.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {event.evidenceSpans.map((s) => (
        <li key={`${s.field}-${s.start}`} className="flex gap-3 border-b border-line pb-2 last:border-0">
          <span className="tnum w-36 shrink-0 text-[0.6875rem] text-ink-3">
            {s.field}
            <span className="ml-1 opacity-60">
              [{s.start}:{s.end}]
            </span>
          </span>
          <span className="text-xs text-ink-2 italic">“{s.text}”</span>
        </li>
      ))}
    </ul>
  );
}
