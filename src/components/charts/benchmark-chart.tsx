"use client";

import { useState } from "react";
import { BASELINE_SERIES } from "@/lib/mock";
import { cx } from "@/lib/format";

const SERIES = [
  { key: "agent", label: "FlowGraph agent", color: "var(--series-1)" },
  { key: "baseline", label: "Simulated baseline", color: "var(--series-2)" },
  { key: "smh", label: "SMH", color: "var(--series-3)" },
  { key: "qqq", label: "QQQ", color: "var(--series-4)" },
] as const;

/**
 * Cumulative percent return by session — one shared axis, four series.
 * Legend plus direct end labels, so identity never rests on color alone.
 */
export function BenchmarkChart({ height = 230 }: { height?: number }) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = height;
  const padL = 34;
  const padR = 96;
  const padT = 14;
  const padB = 24;

  const all = BASELINE_SERIES.flatMap((d) => [d.agent, d.baseline, d.smh, d.qqq]);
  const lo = Math.min(...all) - 0.15;
  const hi = Math.max(...all) + 0.15;

  const x = (i: number) => padL + (i / (BASELINE_SERIES.length - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);

  const ticks = [-0.5, 0, 0.5, 1].filter((t) => t >= lo && t <= hi);

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height }}
          role="img"
          aria-label="Cumulative percent return by session: agent, simulated baseline, SMH and QQQ"
          onMouseLeave={() => setHover(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y(t)}
                y2={y(t)}
                stroke={t === 0 ? "var(--line-strong)" : "var(--line)"}
              />
              <text x={padL - 6} y={y(t) + 3} textAnchor="end" fill="var(--ink-3)" style={{ fontSize: 9.5 }}>
                {t > 0 ? "+" : ""}
                {t}%
              </text>
            </g>
          ))}

          {SERIES.map((s) => {
            const d = BASELINE_SERIES.map(
              (p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p[s.key])}`,
            ).join(" ");
            const last = BASELINE_SERIES[BASELINE_SERIES.length - 1][s.key];
            return (
              <g key={s.key}>
                <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
                <circle
                  cx={x(BASELINE_SERIES.length - 1)}
                  cy={y(last)}
                  r={4}
                  fill={s.color}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
                <text
                  x={x(BASELINE_SERIES.length - 1) + 10}
                  y={y(last) + 3.5}
                  fill="var(--ink-2)"
                  style={{ fontSize: 10 }}
                >
                  {s.label === "FlowGraph agent" ? "Agent" : s.label === "Simulated baseline" ? "Baseline" : s.label}
                  <tspan fill="var(--ink-3)"> {last > 0 ? "+" : ""}{last.toFixed(2)}%</tspan>
                </text>
              </g>
            );
          })}

          {hover !== null && (
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="var(--line-strong)" />
          )}

          {BASELINE_SERIES.map((p, i) => (
            <rect
              key={p.session}
              x={x(i) - (W - padL - padR) / (BASELINE_SERIES.length - 1) / 2}
              y={0}
              width={(W - padL - padR) / (BASELINE_SERIES.length - 1)}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}

          {BASELINE_SERIES.map((p, i) => (
            <text
              key={p.session}
              x={x(i)}
              y={H - 6}
              textAnchor="middle"
              fill="var(--ink-3)"
              style={{ fontSize: 9.5 }}
            >
              {p.session}
            </text>
          ))}
        </svg>

        {hover !== null && (
          <div className="pointer-events-none absolute top-2 left-10 rounded-lg border border-line bg-surface px-2.5 py-2 shadow-sm">
            <div className="mb-1 text-[0.625rem] text-ink-3">{BASELINE_SERIES[hover].session}</div>
            {SERIES.map((s) => (
              <div key={s.key} className="flex items-center gap-2 text-[0.6875rem]">
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                <span className="text-ink-2">{s.label}</span>
                <span className="tnum ml-auto text-ink">
                  {BASELINE_SERIES[hover][s.key] > 0 ? "+" : ""}
                  {BASELINE_SERIES[hover][s.key].toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5 text-[0.6875rem] text-ink-2">
            <span className="inline-block h-0.5 w-4 rounded-full" style={{ background: s.color }} />
            {s.label}
            {s.key === "baseline" && (
              <span className={cx("tnum rounded bg-surface-3 px-1 text-[0.5625rem] text-ink-3")}>
                SIMULATED
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
