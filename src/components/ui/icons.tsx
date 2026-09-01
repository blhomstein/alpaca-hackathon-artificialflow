import type { SVGProps } from "react";

/**
 * Hand-rolled 16px stroke icons. Kept deliberately plain: one weight,
 * round caps, no fills — the interface should read as instrument panel,
 * not app-store gloss.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const Base = ({ size = 16, children, ...rest }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...rest}
  >
    {children}
  </svg>
);

export const IconGauge = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.5 12a5.5 5.5 0 1 1 11 0" />
    <path d="M8 12 10.6 7.6" />
  </Base>
);
export const IconGraph = (p: IconProps) => (
  <Base {...p}>
    <circle cx="3.5" cy="4" r="1.6" />
    <circle cx="12.5" cy="3.5" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="4" cy="11.5" r="1.6" />
    <path d="M5 4.4 11 3.7M4.6 10.2 11.5 4.9M5.6 11.8h4.8M12.3 5.1l-.2 5.3" />
  </Base>
);
export const IconFeed = (p: IconProps) => (
  <Base {...p}>
    <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
    <path d="M5 6h6M5 8.5h6M5 11h3.5" />
  </Base>
);
export const IconDossier = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 2.5h5.5L12.5 5.5V13a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z" />
    <path d="M9.5 2.5v3h3M5.75 9h4.5M5.75 11h3" />
  </Base>
);
export const IconLayers = (p: IconProps) => (
  <Base {...p}>
    <path d="m8 2.5 5.5 3-5.5 3-5.5-3 5.5-3Z" />
    <path d="m2.5 8.5 5.5 3 5.5-3" />
    <path d="m2.5 11 5.5 3 5.5-3" />
  </Base>
);
export const IconShield = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 2 13 3.6v4.2c0 3-2.1 5.3-5 6.2-2.9-.9-5-3.2-5-6.2V3.6L8 2Z" />
    <path d="m5.9 8 1.5 1.5L10.2 6.6" />
  </Base>
);
export const IconChart = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.5 13.5h11" />
    <path d="M4.5 11V7.5M7.5 11V4M10.5 11V8.75M13 11V6" />
  </Base>
);
export const IconBeaker = (p: IconProps) => (
  <Base {...p}>
    <path d="M6.5 2v4L3 12a1 1 0 0 0 .87 1.5h8.26A1 1 0 0 0 13 12L9.5 6V2" />
    <path d="M5.75 2h4.5M4.9 9.5h6.2" />
  </Base>
);
export const IconPulse = (p: IconProps) => (
  <Base {...p}>
    <path d="M1.75 8h2.9l1.4-4 2.4 8 1.5-4h3.8" />
  </Base>
);
export const IconLock = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="7" width="10" height="6.5" rx="1.5" />
    <path d="M5.5 7V5.25a2.5 2.5 0 0 1 5 0V7" />
  </Base>
);
export const IconArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </Base>
);
export const IconExternal = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 3.5H4.5A1.5 1.5 0 0 0 3 5v6.5A1.5 1.5 0 0 0 4.5 13H11a1.5 1.5 0 0 0 1.5-1.5V9" />
    <path d="M9.5 2.5h4v4M13 3 8 8" />
  </Base>
);
export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="m3.5 8.5 3 3 6-7" />
  </Base>
);
export const IconX = (p: IconProps) => (
  <Base {...p}>
    <path d="m4 4 8 8M12 4l-8 8" />
  </Base>
);
export const IconAlert = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 2.75 14 13H2L8 2.75Z" />
    <path d="M8 6.5v3M8 11.4v.1" />
  </Base>
);
export const IconSun = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="8" r="2.75" />
    <path d="M8 1.5v1.4M8 13.1v1.4M1.5 8h1.4M13.1 8h1.4M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1" />
  </Base>
);
export const IconMoon = (p: IconProps) => (
  <Base {...p}>
    <path d="M13 9.6A5.6 5.6 0 0 1 6.4 3a5.6 5.6 0 1 0 6.6 6.6Z" />
  </Base>
);
export const IconClock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="8" r="5.75" />
    <path d="M8 4.75V8l2.25 1.5" />
  </Base>
);
