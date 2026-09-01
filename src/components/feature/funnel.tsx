import { FUNNEL } from "@/lib/mock";
import { cx } from "@/lib/format";

/**
 * Decision funnel (§19.4). Bars are scaled against the widest stage so the
 * drop-off from 412 news items to 5 fills is legible at a glance.
 */
export function DecisionFunnel({ compact }: { compact?: boolean }) {
  const max = Math.max(...FUNNEL.map((s) => s.count));

  return (
    <ol className="space-y-2.5">
      {FUNNEL.map((stage, i) => {
        const prev = i > 0 ? FUNNEL[i - 1].count : null;
        const drop = prev !== null && prev > 0 ? 1 - stage.count / prev : null;
        const terminal = i === FUNNEL.length - 1;
        return (
          <li key={stage.key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs text-ink-2">{stage.label}</span>
              <span className="tnum text-xs text-ink">
                {stage.count.toLocaleString("en-US")}
                {drop !== null && drop > 0 && (
                  <span className="ml-1.5 text-[0.6875rem] text-ink-3">
                    −{Math.round(drop * 100)}%
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
              <div
                className={cx("h-full rounded-full", terminal ? "bg-clay" : "bg-ink-3/55")}
                style={{ width: `${Math.max(1.5, (stage.count / max) * 100)}%` }}
              />
            </div>
            {!compact && <p className="mt-1 text-[0.6875rem] text-ink-3">{stage.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}
