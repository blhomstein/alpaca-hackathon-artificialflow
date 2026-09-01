export const usd = (n: number, opts: { sign?: boolean; cents?: boolean } = {}) => {
  const { sign = false, cents = true } = opts;
  const s = n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
  return sign && n > 0 ? `+${s}` : s;
};

export const compactUsd = (n: number | null) => {
  if (n === null) return "—";
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return usd(n, { cents: false });
};

export const pct = (n: number, digits = 2, sign = true) =>
  `${sign && n > 0 ? "+" : ""}${(n * 100).toFixed(digits)}%`;

export const num = (n: number, digits = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Fixed-locale rendering so the server and client markup always match. */
const TZ = "UTC";
export const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TZ,
  });

export const dateTime = (iso: string) =>
  `${new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    timeZone: TZ,
  })} ${time(iso)}Z`;

export const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: TZ,
  });

export const since = (iso: string, from: string) => {
  const ms = new Date(from).getTime() - new Date(iso).getTime();
  const m = Math.max(0, Math.round(ms / 60000));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
};

export const titleCase = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");
