"use client";

import { useEffect, useSyncExternalStore } from "react";
import { DEFAULT_FOOTER, type FooterSettings } from "./footerTypes";

let current: FooterSettings | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/** Re-fetches the footer from the database. Call it after the admin saves. */
export async function refreshFooter(): Promise<void> {
  try {
    const res = await fetch("/api/public/footer", { cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as { footer?: FooterSettings };
    if (res.ok && data.footer) {
      current = data.footer;
      emit();
      return;
    }
  } catch {
    /* fall through */
  }
  // if the very first load fails, show the built-in defaults instead of a blank footer
  if (!current) {
    current = DEFAULT_FOOTER;
    emit();
  }
}

/** Returns null until the footer has loaded. */
export function useFooter(): FooterSettings | null {
  const footer = useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );

  useEffect(() => {
    if (!current) void refreshFooter();
  }, []);

  return footer;
}