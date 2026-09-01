import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-2.5">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden className="shrink-0">
        <rect width="26" height="26" rx="7" fill="var(--clay)" />
        <g stroke="var(--surface)" strokeWidth="1.5" strokeLinecap="round" fill="none">
          <path d="M7 18.5V9.5a2 2 0 0 1 2-2h3" />
          <path d="M7 13.5h4.5" />
        </g>
        <circle cx="17.5" cy="9" r="2.1" fill="var(--surface)" />
        <circle cx="17.5" cy="17" r="2.1" fill="var(--surface)" opacity="0.55" />
      </svg>
      <span className="min-w-0">
        <span className="block text-[0.875rem] leading-4 font-medium tracking-tight text-ink">
          FlowGraph AI
        </span>
        <span className="block text-[0.6875rem] leading-4 text-ink-3">
          Capital-flow options agent
        </span>
      </span>
    </Link>
  );
}
