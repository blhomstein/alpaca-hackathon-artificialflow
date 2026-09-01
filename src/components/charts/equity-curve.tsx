"use client";

import { useState } from "react";
import { EQUITY_CURVE } from "@/lib/mock";
import { usd } from "@/lib/format";

/**
 * Single-series equity curve. One series, so no legend box — the panel
 * title names it. Crosshair + tooltip on hover.
 */
export function EquityCurve({ height = 190 }: { height?: number }) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = height;
  const padL = 8;
  const padR = 8;
  const padT = 12;
  const padB = 22;

  const values = EQUITY_CURVE.map((d) => d.v);
  const lo = Math.min(...values, 100_000) - 200;
  const hi = Math.max(...values) + 200;

  const x = (i: number) => padL + (i / (EQUITY_CURVE.length - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);

  const line = EQUITY_CURVE.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.v)}`).join(" ");
  const area = `${line} L ${x(EQUITY_CURVE.length - 1)} ${H - padB} L ${x(0)} ${H - padB} Z`;
  const baseY = y(100_000);

  const pt = hover === null ? null : EQUITY_CURVE[hover];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        role="img"
        aria-label="Paper account equity since the first trading session"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="eq-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--series-1)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--series-1)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Starting-capital reference, drawn recessive. */}
        <line
          x1={padL}
          x2={W - padR}
          y1={baseY}
          y2={baseY}
          stroke="var(--line-strong)"
          strokeDasharray="3 4"
        />
        <text x={W - padR} y={baseY - 5} textAnchor="end" fill="var(--ink-3)" style={{ fontSize: 9.5 }}>
          $100,000 start
        </text>

        <path d={area} fill="url(#eq-fill)" />
        <path d={line} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" />

        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={padT}
              y2={H - padB}
              stroke="var(--line-strong)"
            />
            <circle
              cx={x(hover)}
              cy={y(EQUITY_CURVE[hover].v)}
              r={4.5}
              fill="var(--series-1)"
              stroke="var(--surface)"
              strokeWidth={2}
            />
          </g>
        )}

        {EQUITY_CURVE.map((d, i) => (
          <rect
            key={d.t}
            x={x(i) - (W - padL - padR) / (EQUITY_CURVE.length - 1) / 2}
            y={0}
            width={(W - padL - padR) / (EQUITY_CURVE.length - 1)}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}

        {[0, Math.floor(EQUITY_CURVE.length / 2), EQUITY_CURVE.length - 1].map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 6}
            textAnchor={i === 0 ? "start" : i === EQUITY_CURVE.length - 1 ? "end" : "middle"}
            fill="var(--ink-3)"
            style={{ fontSize: 9.5 }}
          >
            {EQUITY_CURVE[i].t}
          </text>
        ))}
      </svg>

      {pt && (
        <div className="pointer-events-none absolute top-2 left-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 shadow-sm">
          <div className="text-[0.625rem] text-ink-3">{pt.t}</div>
          <div className="tnum text-xs text-ink">{usd(pt.v, { cents: false })}</div>
        </div>
      )}
    </div>
  );
}
