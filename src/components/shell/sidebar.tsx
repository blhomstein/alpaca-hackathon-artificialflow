"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "./nav";
import { cx } from "@/lib/format";
import {
  IconBeaker,
  IconChart,
  IconDossier,
  IconFeed,
  IconGauge,
  IconGraph,
  IconLayers,
  IconLock,
  IconPulse,
  IconShield,
} from "@/components/ui/icons";

const ICONS: Record<string, (p: { size?: number }) => React.ReactNode> = {
  gauge: IconGauge,
  graph: IconGraph,
  feed: IconFeed,
  dossier: IconDossier,
  layers: IconLayers,
  shield: IconShield,
  chart: IconChart,
  beaker: IconBeaker,
  pulse: IconPulse,
  lock: IconLock,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="flex h-full flex-col gap-6 overflow-y-auto px-3 pt-4 pb-6"
    >
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="eyebrow px-2.5 pb-2">{group.label}</div>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = ICONS[item.icon];
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[0.8125rem] transition-colors",
                      active
                        ? "bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-line"
                        : "text-ink-2 hover:bg-surface-2 hover:text-ink",
                    )}
                  >
                    <span className={cx(active ? "text-clay" : "text-ink-3 group-hover:text-ink-2")}>
                      <Icon size={15} />
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="mt-auto px-2.5">
        <div className="hairline mb-3" />
        <p className="text-[0.6875rem] leading-4 text-ink-3">
          Paper trading only. Not financial advice. Options quotes may be indicative
          rather than OPRA.
        </p>
      </div>
    </nav>
  );
}

/** Horizontal fallback for viewports too narrow for the rail. */
export function MobileNav() {
  const pathname = usePathname();
  const items = NAV_GROUPS.flatMap((g) => g.items);

  return (
    <nav
      aria-label="Primary"
      className="flex gap-1.5 overflow-x-auto border-b border-line bg-surface-2/60 px-3 py-2 lg:hidden"
    >
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "shrink-0 rounded-full px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
              active ? "bg-clay-soft text-clay-ink" : "text-ink-2 hover:bg-surface-3",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
