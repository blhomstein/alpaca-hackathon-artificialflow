import { REJECTIONS } from "@/lib/mock";
import { Badge } from "@/components/ui/primitives";

/**
 * Magnitude by category — one hue, ranked. Values are direct-labeled so the
 * bars carry shape and the numbers carry precision.
 */
export function RejectionBars({ limit }: { limit?: number }) {
  const rows = limit ? REJECTIONS.slice(0, limit) : REJECTIONS;
  const max = Math.max(...REJECTIONS.map((r) => r.count));
  const total = REJECTIONS.reduce((s, r) => s + r.count, 0);

  return (
    <div>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.code} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-xs text-ink-2">{r.label}</span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full bg-clay/70"
                  style={{ width: `${Math.max(1.5, (r.count / max) * 100)}%` }}
                />
              </div>
            </div>
            <span className="tnum w-10 text-right text-xs text-ink">{r.count}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[0.6875rem] text-ink-3">
        {total.toLocaleString("en-US")} rejections across 4 sessions.{" "}
        <Badge tone="neutral">Abstention is the default</Badge>
      </p>
    </div>
  );
}
