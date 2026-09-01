"use client";

import { useSyncExternalStore } from "react";
import { IconMoon, IconSun } from "@/components/ui/icons";

type Theme = "light" | "dark";

/**
 * The theme lives on <html data-theme>, written before paint by themeScript.
 * The DOM is the source of truth, so we subscribe to it rather than mirroring
 * it into component state.
 */
const listeners = new Set<() => void>();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
};

const getSnapshot = (): Theme =>
  (document.documentElement.dataset.theme as Theme) ?? "light";

const getServerSnapshot = (): Theme => "light";

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("fg-theme", next);
  } catch {
    /* private mode — the choice just won't persist */
  }
  for (const listener of listeners) listener();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="grid size-7 place-items-center rounded-md text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {theme === "dark" ? <IconSun size={15} /> : <IconMoon size={15} />}
    </button>
  );
}

/** Applied before paint so the first frame is already the right theme. */
export const themeScript = `(function(){try{var t=localStorage.getItem('fg-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`;
