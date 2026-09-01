"use client";

import { useMemo, useState } from "react";
import type { CapitalFlowEdge, Symbol_ } from "@/lib/types";
import { EDGES, SYMBOL_NAMES, SYMBOL_ROLE } from "@/lib/mock";
import { cx, titleCase } from "@/lib/format";

/* Three columns: spending hubs, first-hop suppliers, second-hop silicon. */
const POS: Record<Symbol_, { x: number; y: number }> = {
  MSFT: { x: 90, y: 76 },
  META: { x: 90, y: 196 },
  ORCL: { x: 90, y: 316 },
  NVDA: { x: 400, y: 46 },
  AMD: { x: 400, y: 146 },
  ANET: { x: 400, y: 246 },
  VRT: { x: 400, y: 346 },
  AVGO: { x: 700, y: 196 },
};

const NODE_W = 106;
const NODE_H = 40;

const ROLE_COLOR: Record<string, string> = {
  hub: "var(--clay)",
  compute: "var(--info)",
  infra: "var(--pos)",
};

const centre = (s: Symbol_) => ({ x: POS[s].x + NODE_W / 2, y: POS[s].y + NODE_H / 2 });

function edgePath(e: CapitalFlowEdge) {
  const a = centre(e.fromSymbol);
  const b = centre(e.toSymbol);
  const x1 = a.x + NODE_W / 2;
  const x2 = b.x - NODE_W / 2;
  const dx = Math.max(60, (x2 - x1) * 0.55);
  return `M ${x1} ${a.y} C ${x1 + dx} ${a.y}, ${x2 - dx} ${b.y}, ${x2} ${b.y}`;
}

export type FlowGraphProps = {
  /** Edge ids on the active decision path — drawn lit and animated. */
  activePath?: string[];
  /** Symbol the current event fired on. */
  actor?: Symbol_;
  /** Candidate supplier under evaluation. */
  target?: Symbol_;
  interactive?: boolean;
  height?: number;
};

export function FlowGraph({
  activePath = [],
  actor,
  target,
  interactive = true,
  height = 420,
}: FlowGraphProps) {
  const [focus, setFocus] = useState<Symbol_ | null>(null);
  const [hoverEdge, setHoverEdge] = useState<string | null>(null);

  const lit = useMemo(() => new Set(activePath), [activePath]);

  const focusedEdges = useMemo(() => {
    if (!focus) return null;
    return new Set(
      EDGES.filter((e) => e.fromSymbol === focus || e.toSymbol === focus).map((e) => e.edgeId),
    );
  }, [focus]);

  const edgeState = (e: CapitalFlowEdge) => {
    if (focusedEdges) return focusedEdges.has(e.edgeId) ? "focus" : "dim";
    if (lit.size) return lit.has(e.edgeId) ? "lit" : "dim";
    return "idle";
  };

  const nodeState = (s: Symbol_) => {
    if (focus) return s === focus ? "focus" : "dim";
    if (s === actor) return "actor";
    if (s === target) return "target";
    if (lit.size) {
      const on = EDGES.some(
        (e) => lit.has(e.edgeId) && (e.fromSymbol === s || e.toSymbol === s),
      );
      return on ? "lit" : "dim";
    }
    return "idle";
  };

  const hovered = hoverEdge ? EDGES.find((e) => e.edgeId === hoverEdge) : null;

  return (
    <div className="relative">
      <svg
        viewBox="0 0 820 420"
        className="grid-paper w-full rounded-lg"
        style={{ height }}
        role="img"
        aria-label="Verified capital-flow graph from spending hubs to suppliers"
        onMouseLeave={() => interactive && setFocus(null)}
      >
        <defs>
          <marker id="fg-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--line-strong)" />
          </marker>
          <marker id="fg-arrow-lit" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--clay)" />
          </marker>
        </defs>

        {/* Column captions */}
        {[
          { x: 143, label: "Spending hubs" },
          { x: 453, label: "First-hop suppliers" },
          { x: 753, label: "Second hop" },
        ].map((c) => (
          <text
            key={c.label}
            x={c.x}
            y={22}
            textAnchor="middle"
            className="eyebrow"
            fill="var(--ink-3)"
            style={{ fontSize: 10, letterSpacing: "0.11em", textTransform: "uppercase" }}
          >
            {c.label}
          </text>
        ))}

        {EDGES.map((e) => {
          const state = edgeState(e);
          const litEdge = state === "lit";
          return (
            <g key={e.edgeId}>
              <path
                d={edgePath(e)}
                fill="none"
                stroke={litEdge ? "var(--clay)" : "var(--line-strong)"}
                strokeWidth={litEdge ? 2 : 1.25}
                opacity={state === "dim" ? 0.2 : state === "focus" ? 0.9 : litEdge ? 1 : 0.55}
                markerEnd={litEdge ? "url(#fg-arrow-lit)" : "url(#fg-arrow)"}
                className={litEdge ? "flow-dash" : undefined}
              />
              {interactive && (
                <path
                  d={edgePath(e)}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={14}
                  onMouseEnter={() => setHoverEdge(e.edgeId)}
                  onMouseLeave={() => setHoverEdge(null)}
                  style={{ cursor: "help" }}
                />
              )}
            </g>
          );
        })}

        {(Object.keys(POS) as Symbol_[]).map((s) => {
          const p = POS[s];
          const state = nodeState(s);
          const role = SYMBOL_ROLE[s];
          const accent = ROLE_COLOR[role];
          const emphasised = state === "actor" || state === "target" || state === "focus" || state === "lit";
          return (
            <g
              key={s}
              transform={`translate(${p.x},${p.y})`}
              opacity={state === "dim" ? 0.35 : 1}
              onMouseEnter={() => interactive && setFocus(s)}
              style={{ cursor: interactive ? "pointer" : "default" }}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={9}
                fill="var(--surface)"
                stroke={emphasised ? accent : "var(--line-strong)"}
                strokeWidth={emphasised ? 1.6 : 1}
              />
              <rect x={0} y={0} width={3.5} height={NODE_H} rx={2} fill={accent} />
              <text x={14} y={17} fill="var(--ink)" style={{ fontSize: 12.5, fontWeight: 500 }}>
                {s}
              </text>
              <text x={14} y={30} fill="var(--ink-3)" style={{ fontSize: 9.5 }}>
                {SYMBOL_NAMES[s].slice(0, 18)}
              </text>
              {state === "actor" && (
                <text x={NODE_W - 8} y={17} textAnchor="end" fill="var(--clay)" style={{ fontSize: 9 }}>
                  EVENT
                </text>
              )}
              {state === "target" && (
                <text x={NODE_W - 8} y={17} textAnchor="end" fill="var(--clay)" style={{ fontSize: 9 }}>
                  TARGET
                </text>
              )}
            </g>
          );
        })}

        <text x={12} y={410} fill="var(--ink-3)" style={{ fontSize: 9.5 }}>
          {EDGES.length} human-verified directed edges · traversal capped at 2 hops · benchmarks SMH / QQQ are never traded
        </text>
      </svg>

      {hovered && (
        <div className="pointer-events-none absolute top-3 right-3 max-w-64 rounded-lg border border-line bg-surface p-3 shadow-sm">
          <div className="tnum text-[0.6875rem] text-ink-3">{hovered.edgeId}</div>
          <div className="mt-0.5 text-xs font-medium text-ink">
            {hovered.fromSymbol} → {hovered.toSymbol}
          </div>
          <div className="mt-1 text-[0.6875rem] text-ink-2">
            {titleCase(hovered.relationshipType)} · {hovered.categories.join(", ")}
          </div>
          <div className="mt-1.5 text-[0.6875rem] text-ink-3">
            {hovered.sourceLabel} · verified {hovered.verifiedAt}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.6875rem] text-ink-3">
        {[
          ["hub", "Spending hub"],
          ["compute", "Compute supplier"],
          ["infra", "Infrastructure supplier"],
        ].map(([role, label]) => (
          <span key={role} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-1 rounded-full"
              style={{ background: ROLE_COLOR[role] }}
            />
            {label}
          </span>
        ))}
        <span className={cx("inline-flex items-center gap-1.5", !lit.size && "hidden")}>
          <span className="inline-block h-px w-5" style={{ background: "var(--clay)" }} />
          Active decision path
        </span>
        {interactive && <span className="ml-auto">Hover a node to isolate its edges</span>}
      </div>
    </div>
  );
}
