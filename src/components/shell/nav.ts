export type NavItem = {
  href: string;
  label: string;
  icon: string;
  hint: string;
};

export const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Signal",
    items: [
      { href: "/", label: "Mission control", icon: "gauge", hint: "Live loop status" },
      { href: "/graph", label: "Capital flow", icon: "graph", hint: "Verified supplier graph" },
      { href: "/events", label: "Events", icon: "feed", hint: "Extracted capital-flow events" },
      { href: "/dossiers", label: "Decisions", icon: "dossier", hint: "Trade & rejection dossiers" },
    ],
  },
  {
    label: "Execution",
    items: [
      { href: "/positions", label: "Positions", icon: "layers", hint: "Open spreads & lifecycle" },
      { href: "/risk", label: "Risk & controls", icon: "shield", hint: "Limits, stop, kill switch" },
      { href: "/performance", label: "Performance", icon: "chart", hint: "P&L, baseline, benchmarks" },
    ],
  },
  {
    label: "Evidence",
    items: [
      { href: "/evals", label: "Replay & evals", icon: "beaker", hint: "Dev set, holdout, test suite" },
      { href: "/health", label: "System health", icon: "pulse", hint: "Feeds, MCP, reconciliation" },
      { href: "/config", label: "Frozen config", icon: "lock", hint: "Thresholds & checksum" },
    ],
  },
];

export const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);
