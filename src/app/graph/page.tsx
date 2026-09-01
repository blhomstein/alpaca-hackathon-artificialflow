import type { Metadata } from "next";
import { FlowGraph } from "@/components/graph/flow-graph";
import {
  Badge,
  Note,
  Panel,
  PanelHead,
  PageHeader,
  Table,
  Td,
  Th,
} from "@/components/ui/primitives";
import { IconExternal } from "@/components/ui/icons";
import { BENCHMARKS, COMPUTE, EDGES, FEATURED_DOSSIER, HUBS, INFRA, SYMBOL_NAMES } from "@/lib/mock";
import { titleCase } from "@/lib/format";

export const metadata: Metadata = { title: "Capital flow" };

export default function GraphPage() {
  const d = FEATURED_DOSSIER;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Verified graph"
        title="Capital flow, edge by edge"
        lede="Fourteen directed edges, each with a source document and a human verification date. The agent traverses this graph; it can never add to it."
        actions={<Badge tone="clay">{EDGES.length} edges · 8 symbols</Badge>}
      />

      <Panel>
        <PanelHead
          title="Supplier graph"
          hint={`Lit path: ${d.event.actor} → ${d.target}, the current active decision`}
        />
        <FlowGraph
          activePath={d.graphPath.map((e) => e.edgeId)}
          actor={d.event.actor}
          target={d.target}
          height={460}
        />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)]">
        <div className="space-y-6">
          <Panel>
            <PanelHead title="Universe" hint="Locked before the competition" />
            <dl className="space-y-4">
              {([
                ["Spending hubs", HUBS],
                ["Compute suppliers", COMPUTE],
                ["Infrastructure suppliers", INFRA],
                ["Benchmarks — never traded", [...BENCHMARKS]],
              ] as Array<[string, string[]]>).map(([label, syms]) => (
                <div key={label}>
                  <dt className="eyebrow">{label}</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {syms.map((s) => (
                      <span
                        key={s}
                        className="rounded-md border border-line bg-surface-2 px-2 py-1 text-xs"
                      >
                        <span className="tnum text-ink">{s}</span>
                        <span className="ml-1.5 text-ink-3">{SYMBOL_NAMES[s]}</span>
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel>
            <PanelHead title="Traversal rules" />
            <ul className="space-y-2.5 text-xs leading-5 text-ink-2">
              <li>Edges are directed. A supplier relationship is never reversed automatically.</li>
              <li>Runtime traversal stops at two hops.</li>
              <li>Every edge carries a source URL and a verification date.</li>
              <li>The agent cannot insert or modify an edge while trading.</li>
              <li>
                A symbol joins the universe only with a documented relationship, Alpaca News
                coverage, tradable options, and quotes that pass liquidity inspection.
              </li>
            </ul>
            <div className="mt-4">
              <Note tone="clay">
                No global supplier discovery, no scraping, no automatic edge invention. The
                graph is small on purpose — it is the part a judge can verify.
              </Note>
            </div>
          </Panel>
        </div>

        <Panel>
          <PanelHead
            title="Edge register"
            hint="Every relationship the agent is allowed to traverse"
          />
          <Table>
            <thead>
              <tr>
                <Th>Edge</Th>
                <Th>From → To</Th>
                <Th>Relationship</Th>
                <Th>Categories</Th>
                <Th>Source</Th>
                <Th align="right">Verified</Th>
              </tr>
            </thead>
            <tbody>
              {EDGES.map((e) => {
                const lit = d.graphPath.some((p) => p.edgeId === e.edgeId);
                return (
                  <tr key={e.edgeId} className={lit ? "bg-clay-soft/40" : undefined}>
                    <Td mono className="text-ink-3">
                      {e.edgeId}
                    </Td>
                    <Td mono>
                      {e.fromSymbol} <span className="text-ink-3">→</span> {e.toSymbol}
                    </Td>
                    <Td>{titleCase(e.relationshipType)}</Td>
                    <Td className="text-ink-2">{e.categories.join(", ")}</Td>
                    <Td>
                      <a
                        href={e.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-clay-ink underline-offset-4 hover:underline"
                      >
                        {e.sourceLabel}
                        <IconExternal size={11} />
                      </a>
                    </Td>
                    <Td align="right" mono className="text-ink-3">
                      {e.verifiedAt}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Panel>
      </div>
    </div>
  );
}
