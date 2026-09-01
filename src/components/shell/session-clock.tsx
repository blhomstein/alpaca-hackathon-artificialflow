"use client";

import { useEffect, useState } from "react";
import { IconClock } from "@/components/ui/icons";

/**
 * Wall clock in UTC. Renders nothing until mounted so server and client
 * markup can't disagree.
 */
export function SessionClock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "UTC",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="hidden items-center gap-1.5 text-xs text-ink-3 sm:inline-flex">
      <IconClock size={13} />
      <span className="tnum">{now ?? "--:--:--"}</span>
      <span>UTC</span>
    </span>
  );
}
