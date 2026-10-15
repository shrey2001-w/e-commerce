"use client";

import { useEffect, useSyncExternalStore } from "react";
import { categories as staticCategories, type Category } from "../data/products";
import { DEFAULT_SETTINGS, type SiteSettings } from "./siteTypes";

type CatalogData = { categories: Category[]; source: "db" | "static" };

function createRemoteStore<T>(url: string, fallback: T, ttl = 30_000) {
  let data: T | null = null;
  let at = 0;
  let inflight: Promise<void> | null = null;
  const subs = new Set<() => void>();
  const emit = () => subs.forEach((f) => f());

  const load = (force = false): Promise<void> => {
    if (!force) {
      if (inflight) return inflight;
      if (data && Date.now() - at < ttl) return Promise.resolve();
    }
    const p: Promise<void> = fetch(url, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: T) => {
        data = j;
        at = Date.now();
        emit();
      })
      .catch(() => {
        if (!data) {
          data = fallback;
          at = 0;
          emit();
        }
      })
      .finally(() => {
        if (inflight === p) inflight = null;
      });
    inflight = p;
    return p;
  };

  return {
    subscribe: (f: () => void) => {
      subs.add(f);
      return () => {
        subs.delete(f);
      };
    },
    get: () => data,
    load,
  };
}

const siteStore = createRemoteStore<SiteSettings>("/api/public/site", DEFAULT_SETTINGS);
const catalogStore = createRemoteStore<CatalogData>("/api/public/catalog", {
  categories: staticCategories,
  source: "static",
});

export function useSite() {
  const data = useSyncExternalStore(siteStore.subscribe, siteStore.get, () => null);
  useEffect(() => {
    void siteStore.load();
  }, []);
  return { settings: data ?? DEFAULT_SETTINGS, loaded: data !== null };
}

export function useCatalog() {
  const data = useSyncExternalStore(catalogStore.subscribe, catalogStore.get, () => null);
  useEffect(() => {
    void catalogStore.load();
  }, []);
  return {
    categories: data?.categories ?? null,
    source: data?.source ?? null,
    loading: data === null,
  };
}

export const refreshSite = () => siteStore.load(true);
export const refreshCatalog = () => catalogStore.load(true);