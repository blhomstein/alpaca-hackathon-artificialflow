import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <div className="eyebrow">404</div>
      <h1 className="display mt-2 text-2xl text-ink">No record here</h1>
      <p className="mt-2 text-sm leading-6 text-ink-2">
        That event, dossier or position is not in the store. Every decision the agent has made
        is on the decision log.
      </p>
      <Link
        href="/dossiers"
        className="mt-5 inline-block rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink transition-colors hover:bg-surface-2"
      >
        Open the decision log
      </Link>
    </div>
  );
}
