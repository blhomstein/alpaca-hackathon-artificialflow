import { Badge, Dot } from "@/components/ui/primitives";
import { SessionClock } from "./session-clock";
import { ThemeToggle } from "./theme-toggle";
import { PERFORMANCE, RISK_NOW } from "@/lib/mock";
import { pct, usd } from "@/lib/format";

export function Topbar() {
  const marked = RISK_NOW.markedPnlToday;

  return (
    <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-paper/85 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2">
        <Badge tone="pos">
          <Dot tone="pos" pulse />
          Market open
        </Badge>
        <Badge tone="warn" className="hidden md:inline-flex">
          <Dot tone="warn" />
          Options feed: indicative
        </Badge>
        <Badge tone="neutral" className="hidden lg:inline-flex">
          <Dot tone="pos" />
          Kill switch armed
        </Badge>
      </div>

      <div className="ml-auto flex items-center gap-4 sm:gap-5">
        <div className="hidden text-right sm:block">
          <div className="eyebrow">Equity</div>
          <div className="tnum text-[0.8125rem] leading-4 text-ink">
            {usd(RISK_NOW.equity, { cents: false })}
          </div>
        </div>
        <div className="text-right">
          <div className="eyebrow">Marked P&amp;L today</div>
          <div
            className={`tnum text-[0.8125rem] leading-4 ${marked >= 0 ? "text-pos" : "text-neg"}`}
          >
            {usd(marked, { sign: true })}{" "}
            <span className="text-ink-3">
              ({pct(marked / PERFORMANCE.startingEquity, 2)})
            </span>
          </div>
        </div>
        <div className="hidden h-6 w-px bg-line sm:block" />
        <SessionClock />
        <ThemeToggle />
      </div>
    </div>
  );
}
