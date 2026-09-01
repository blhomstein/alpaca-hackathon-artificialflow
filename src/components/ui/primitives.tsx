import type { ReactNode } from "react";
import { cx } from "@/lib/format";

/* ---------------------------------------------------------------- Panel */

export function Panel({
  children,
  className,
  flush,
}: {
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <section
      className={cx(
        "rounded-xl border border-line bg-surface",
        !flush && "p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHead({
  title,
  hint,
  action,
  className,
}: {
  title: string;
  hint?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cx("mb-4 flex items-baseline justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-[0.9375rem] font-medium tracking-tight text-ink">{title}</h2>
        {hint ? <p className="mt-0.5 text-xs text-ink-3">{hint}</p> : null}
      </div>
      {action ? <div className="shrink-0 text-xs">{action}</div> : null}
    </header>
  );
}

/* ---------------------------------------------------------------- Badge */

type Tone = "neutral" | "clay" | "pos" | "neg" | "warn" | "info";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-2 border-line",
  clay: "bg-clay-soft text-clay-ink border-transparent",
  pos: "bg-pos-soft text-pos border-transparent",
  neg: "bg-neg-soft text-neg border-transparent",
  warn: "bg-warn-soft text-warn border-transparent",
  info: "bg-info-soft text-info border-transparent",
};

export function Badge({
  children,
  tone = "neutral",
  mono,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  mono?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[0.6875rem] leading-4 font-medium whitespace-nowrap",
        TONES[tone],
        mono && "tnum",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = "neutral", pulse }: { tone?: Tone; pulse?: boolean }) {
  const bg: Record<Tone, string> = {
    neutral: "bg-ink-3",
    clay: "bg-clay",
    pos: "bg-pos",
    neg: "bg-neg",
    warn: "bg-warn",
    info: "bg-info",
  };
  return (
    <span
      className={cx("inline-block size-1.5 shrink-0 rounded-full", bg[tone], pulse && "pulse-dot")}
    />
  );
}

/* ----------------------------------------------------------------- Stat */

export function Stat({
  label,
  value,
  sub,
  tone,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "pos" | "neg";
  className?: string;
}) {
  return (
    <div className={cx("min-w-0", className)}>
      <div className="eyebrow">{label}</div>
      <div
        className={cx(
          "tnum mt-1.5 text-[1.375rem] leading-7 tracking-tight",
          tone === "pos" && "text-pos",
          tone === "neg" && "text-neg",
        )}
      >
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-ink-3">{sub}</div> : null}
    </div>
  );
}

/* ---------------------------------------------------------------- Meter */

export function Meter({
  value,
  max,
  tone = "clay",
  label,
  right,
}: {
  value: number;
  max: number;
  tone?: Tone;
  label?: string;
  right?: ReactNode;
}) {
  const ratio = max === 0 ? 0 : Math.min(1, Math.max(0, value / max));
  const fill: Record<Tone, string> = {
    neutral: "bg-ink-3",
    clay: "bg-clay",
    pos: "bg-pos",
    neg: "bg-neg",
    warn: "bg-warn",
    info: "bg-info",
  };
  return (
    <div>
      {(label || right) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
          <span className="text-ink-2">{label}</span>
          <span className="tnum text-ink-3">{right}</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
        <div
          className={cx("h-full rounded-full transition-[width] duration-500", fill[tone])}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Definition */

export function KeyValue({
  items,
  columns = 2,
  className,
}: {
  items: Array<{ k: string; v: ReactNode; mono?: boolean }>;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const cols = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" }[columns];
  return (
    <dl className={cx("grid grid-cols-1 gap-x-8 gap-y-3", cols, className)}>
      {items.map((it) => (
        <div key={it.k} className="flex items-baseline justify-between gap-4 border-b border-line pb-2 last:border-0">
          <dt className="text-xs text-ink-3">{it.k}</dt>
          <dd className={cx("text-right text-xs text-ink", it.mono !== false && "tnum")}>{it.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* --------------------------------------------------------------- Tables */

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className={cx("w-full min-w-full border-collapse text-left", className)}>{children}</table>
    </div>
  );
}

export function Th({ children, align = "left", className }: { children?: ReactNode; align?: "left" | "right"; className?: string }) {
  return (
    <th
      className={cx(
        "eyebrow border-b border-line pb-2 font-medium",
        align === "right" && "text-right",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  mono,
  className,
}: {
  children?: ReactNode;
  align?: "left" | "right";
  mono?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cx(
        "border-b border-line py-2.5 text-[0.8125rem] text-ink",
        align === "right" && "text-right",
        mono && "tnum",
        className,
      )}
    >
      {children}
    </td>
  );
}

/* ---------------------------------------------------------------- Page */

export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="display mt-2 text-[1.75rem] leading-9 text-ink">{title}</h1>
        {lede ? <p className="mt-2 text-sm leading-6 text-ink-2">{lede}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Note({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const map: Record<Tone, string> = {
    neutral: "border-line bg-surface-2 text-ink-2",
    clay: "border-clay/25 bg-clay-soft text-clay-ink",
    pos: "border-pos/25 bg-pos-soft text-pos",
    neg: "border-neg/25 bg-neg-soft text-neg",
    warn: "border-warn/30 bg-warn-soft text-warn",
    info: "border-info/25 bg-info-soft text-info",
  };
  return (
    <p className={cx("rounded-lg border px-3 py-2.5 text-xs leading-5", map[tone])}>{children}</p>
  );
}
