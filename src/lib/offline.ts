"use client";

/**
 * Offline support, app side. The caching rules live in public/sw.js; this module registers the
 * service worker, reports connectivity and cache status, and pre-downloads content on request by
 * fetching it through the service worker (which stores it).
 */
import { useSyncExternalStore } from "react";

export const offlineSupported = () => typeof window !== "undefined" && "serviceWorker" in navigator && "caches" in window;

export function registerServiceWorker() {
  if (!offlineSupported() || process.env.NODE_ENV !== "production") return;
  navigator.serviceWorker.register("/sw.js").then(warmCoreData, () => { /* offline mode simply stays off */ });
}

const WARM_KEY = "hanyu:offline-warm";
/** Once per device, quietly save the word/sentence data (~4 MB) so vocabulary and flashcards work offline. */
async function warmCoreData() {
  try {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData || localStorage.getItem(WARM_KEY)) return;
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) return; // first visit: the next page load does it
    const m = (await (await fetch("/offline-manifest.json")).json()) as Manifest;
    const failed = await pool(m.data, async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(u); await r.arrayBuffer(); }, () => {}, 2);
    if (!failed) localStorage.setItem(WARM_KEY, "1");
  } catch { /* try again next visit */ }
}

/* ---------- connectivity ---------- */
function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); };
}
/** true while the browser reports a network connection (always true during prerender) */
export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}

/* ---------- status ---------- */
export type OfflineStatus = {
  active: boolean;
  pages: number;
  dataFiles: number;
  audio: number;
  usageMB: number;
  quotaMB: number;
  persisted: boolean;
};

async function count(prefix: string): Promise<number> {
  let n = 0;
  for (const name of await caches.keys()) if (name.startsWith(prefix)) n += (await (await caches.open(name)).keys()).length;
  return n;
}

export async function offlineStatus(): Promise<OfflineStatus | null> {
  if (!offlineSupported()) return null;
  const est = (await navigator.storage?.estimate?.()) ?? {};
  return {
    active: !!navigator.serviceWorker.controller,
    pages: await count("hanyu-pages-"),
    dataFiles: await count("hanyu-data-"),
    audio: await count("hanyu-media-"),
    usageMB: Math.round(((est.usage ?? 0) / 1e6) * 10) / 10,
    quotaMB: Math.round((est.quota ?? 0) / 1e6),
    persisted: (await navigator.storage?.persisted?.()) ?? false,
  };
}

/* ---------- download ---------- */
type Manifest = { pages: string[]; dialogues: string[]; units: Record<string, string[]>; data: string[]; dict: string[] };
export type DownloadPlan = { levels: number[]; dict: boolean };

/** Fetch `urls` with limited concurrency; returns how many failed. */
async function pool(urls: string[], fn: (u: string) => Promise<void>, onDone: () => void, size = 6): Promise<number> {
  let i = 0;
  let failed = 0;
  const worker = async () => {
    while (i < urls.length) {
      const u = urls[i++];
      try { await fn(u); } catch { failed++; }
      onDone();
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, urls.length) }, worker));
  return failed;
}

const STATIC_RE = /(?:src|href)="(\/_next\/static\/[^"]+)"/g;

/**
 * Downloads app pages (and the scripts/styles they use), lesson units for the chosen levels,
 * the word/sentence data and optionally the dictionary. Progress is reported as done/total.
 */
export async function downloadForOffline(plan: DownloadPlan, onProgress: (done: number, total: number) => void): Promise<{ failed: number }> {
  if (!offlineSupported()) throw new Error("This browser doesn't support offline mode.");
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) throw new Error("Offline mode is still starting. Reload the page and try again.");
  await navigator.storage?.persist?.().catch(() => false);

  const m = (await (await fetch("/offline-manifest.json", { cache: "no-store" })).json()) as Manifest;
  const pages = [...m.pages, ...m.dialogues, ...plan.levels.flatMap((l) => m.units[l] ?? [])];
  const files = [...m.data, ...(plan.dict ? m.dict : [])];
  const assets = new Set<string>();
  let total = pages.length + files.length;
  let done = 0;
  const tick = () => onProgress(++done, total);
  onProgress(0, total);

  let failed = await pool(pages, async (u) => {
    const r = await fetch(u, { headers: { Accept: "text/html" }, cache: "no-cache" });
    if (!r.ok) throw new Error(u);
    for (const [, a] of (await r.text()).matchAll(STATIC_RE)) {
      if (!assets.has(a)) { assets.add(a); total++; }
    }
  }, tick);
  failed += await pool([...files, ...assets], async (u) => {
    const r = await fetch(u);
    if (!r.ok) throw new Error(u);
    await r.arrayBuffer();
  }, tick);
  return { failed };
}

/** Deletes everything stored for offline use (progress is not affected). */
export async function clearOffline() {
  try { localStorage.removeItem(WARM_KEY); } catch { /* ignore */ }
  for (const name of await caches.keys()) if (name.startsWith("hanyu-")) await caches.delete(name);
}
