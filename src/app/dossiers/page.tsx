import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  Panel,
  PanelHead,
  PageHeader,
  Table,
  Td,
  Th,
} from "@/components/ui/primitives";
import { DecisionFunnel } from "@/components/feature/funnel";
import { RejectionBars } from "@/components/charts/rejection-bars";
import { DecisionBadge } from "@/components/feature/decision";
import { DOSSIERS } from "@/lib/mock";
import { dateTime, num, pct, titleCase, usd } from "@/lib/format";

export const metadata: Metadata = { title: "Decisions" };

export default function DossiersPage() {
  const trades = DOSSIERS.filter((d) => d.decision === "TRADE");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Decision record"
        title="Every candidate, traded or refused"
        lede="A dossier is written for each evaluated target — including the ones that never became orders. A rejection with a reason code is a successful outcome, not a missing one."
        actions={
          <Badge tone="neutral">
            {trades.length} traded · {DOSSIERS.length - trades.length} abstained
          </Badge>
        }
      />

      <Panel flush>
        <div className="p-5">
          <PanelHead title="Decision log" hint="Newest first" />
        </div>
        <div className="px-5 pb-5">
          <Table>
            <thead>
              <tr>
                <Th>Dossier</Th>
                <Th>Target</Th>
                <Th>Event</Th>
                <Th align="right">Hub rel.</Th>
                <Th align="right">Target rel.</Th>
                <Th align="right">RVOL</Th>
                <Th>Critic</Th>
                <Th align="right">Max loss</Th>
                <Th>Outcome</Th>
              </tr>
            </thead>
            <tbody>
              {DOSSIERS.map((d) => (
                <tr key={d.dossierId} className="group">
                  <Td mono className="text-ink-3">
                    <Link
                      href={`/dossiers/${d.dossierId}`}
                      className="text-ink-2 underline-offset-4 group-hover:text-clay-ink group-hover:underline"
                    >
                      {d.dossierId}
                    </Link>
                    <div className="text-[0.625rem]">{dateTime(d.createdTs)}</div>
                  </Td>
                  <Td mono>{d.target}</Td>
                  <Td className="max-w-72">
                    <span className="line-clamp-2 text-ink-2">{d.event.headline}</span>
                    <span className="tnum text-[0.625rem] text-ink-3">
                      {d.event.actor} → {d.target} · {d.graphPath.length} hop
                    </span>
                  </Td>
                  <Td align="right" mono>
                    {pct(d.marketSnapshot.hubRelativeReturn)}
                  </Td>
                  <Td align="right" mono>
                    {pct(d.marketSnapshot.targetRelativeReturn)}
                  </Td>
                  <Td align="right" mono>
                    {num(d.marketSnapshot.rvol)}×
                  </Td>
                  <Td>
                    <Badge
                      tone={
                        d.critic.verdict === "HARD_VETO"
                          ? "neg"
                          : d.critic.verdict === "SOFT_WARNING"
                            ? "warn"
                            : "pos"
                      }
                    >
                      {titleCase(d.critic.verdict)}
                    </Badge>
                  </Td>
                  <Td align="right" mono className="text-ink-3">
                    {d.optionSnapshot ? usd(d.optionSnapshot.maxLoss, { cents: false }) : "—"}
                  </Td>
                  <Td>
                    <DecisionBadge decision={d.decision} />
                    {d.rejectionReasons.length > 0 && (
                      <div className="tnum mt-1 text-[0.625rem] text-ink-3">
                        {d.rejectionReasons.join(" · ")}
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHead title="Decision funnel" hint="Where 412 news items go" />
          <DecisionFunnel />
        </Panel>
        <Panel>
          <PanelHead title="Rejections by reason" hint="Grouped across four sessions" />
          <RejectionBars />
        </Panel>
      </div>
    </div>
  );
}
