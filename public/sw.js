/* Hanyu Easy service worker: makes the app work offline.
 *
 * Strategy per request type:
 *   pages (HTML)           network-first (4 s timeout), cached copy as fallback, then /offline
 *   RSC payloads           network-first, cached copy as fallback
 *   /_next/static, icons   cache-first (file names are content-hashed)
 *   /data, /dict JSON      stale-while-revalidate
 *   sentence audio         cache-first, stored as you listen (Range requests answered from cache)
 *   stroke data, fonts     cache-first
 * Everything else (Supabase, AI APIs, …) is not touched.
 *
 * Bump VERSION when this file's caching rules change; old caches are deleted on activate.
 */
const VERSION = "v1";
const C = {
  pages: `hanyu-pages-${VERSION}`,
  rsc: `hanyu-rsc-${VERSION}`,
  static: `hanyu-static-${VERSION}`,
  data: `hanyu-data-${VERSION}`,
  media: `hanyu-media-${VERSION}`,
  strokes: `hanyu-strokes-${VERSION}`,
  fonts: `hanyu-fonts-${VERSION}`,
};
/** max entries per cache (oldest removed first); 0 = unlimited */
const LIMIT = { pages: 0, rsc: 300, static: 600, data: 0, media: 800, strokes: 4000, fonts: 400 };
const CORE = ["/", "/offline", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(C.pages);
      await Promise.all(CORE.map((u) => fetch(u).then((r) => r.ok && cache.put(pageKey(new URL(u, self.location.origin)), r)).catch(() => {})));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set(Object.values(C));
      for (const k of await caches.keys()) if (k.startsWith("hanyu-") && !keep.has(k)) await caches.delete(k);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;

  if (same) {
    if (url.pathname === "/sw.js" || url.pathname.startsWith("/api/")) return;
    if (url.pathname.startsWith("/_next/static/") || /\.(png|svg|ico|webmanifest)$/.test(url.pathname) || url.pathname === "/manifest.webmanifest")
      return event.respondWith(cacheFirst(req, "static"));
    if (url.pathname.startsWith("/data/") || url.pathname.startsWith("/dict/")) return event.respondWith(staleWhileRevalidate(req, "data"));
    if (req.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return event.respondWith(rsc(req));
    if (req.mode === "navigate" || (req.headers.get("Accept") || "").includes("text/html")) return event.respondWith(page(req, event));
    return;
  }
  if (url.hostname === "raw.githubusercontent.com" && url.pathname.endsWith(".mp3")) return event.respondWith(media(req));
  if (url.pathname.includes("/hanzi-writer-data@")) return event.respondWith(cacheFirst(req, "strokes"));
  if (url.hostname === "fonts.gstatic.com") return event.respondWith(cacheFirst(req, "fonts"));
  if (url.hostname === "fonts.googleapis.com") return event.respondWith(staleWhileRevalidate(req, "fonts"));
});

/* ---------- strategies ---------- */

/** HTML is the same for every query string (pages read search params on the client) */
function pageKey(url) {
  return new Request(url.origin + (url.pathname.replace(/\/$/, "") || "/"));
}

async function page(req, event) {
  const url = new URL(req.url);
  const key = pageKey(url);
  const cache = await caches.open(C.pages);
  const net = fetch(req)
    .then((r) => {
      if (r.ok && r.type === "basic") event.waitUntil(cache.put(key, r.clone()));
      return r;
    });
  const cached = await cache.match(key);
  try {
    // with a cached copy, don't keep the user waiting on a slow connection
    return cached ? await Promise.race([net, timeout(4000)]) : await net;
  } catch {
    if (cached) return cached;
    return (await cache.match(pageKey(new URL("/offline", url.origin)))) || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

async function rsc(req) {
  const cache = await caches.open(C.rsc);
  try {
    const r = await fetch(req);
    if (r.ok) { await cache.put(req, r.clone()); trim("rsc"); }
    return r;
  } catch {
    // RSC responses vary on router-state headers, so only an exact URL match is reused
    const hit = await cache.match(req);
    if (hit) return hit;
    return Response.error(); // Next.js then falls back to a full page load, which `page()` can serve
  }
}

async function cacheFirst(req, name) {
  const cache = await caches.open(C[name]);
  const hit = await cache.match(req);
  if (hit) return hit;
  const r = await fetch(req);
  if (r.ok || r.type === "opaque") { await cache.put(req, r.clone()); trim(name); }
  return r;
}

async function staleWhileRevalidate(req, name) {
  const cache = await caches.open(C[name]);
  const hit = await cache.match(req);
  const net = fetch(req)
    .then(async (r) => {
      if (r.ok) { await cache.put(req, r.clone()); trim(name); }
      return r;
    })
    .catch(() => null);
  return hit || (await net) || Response.error();
}

/** Audio elements send Range requests; cache the full file once and answer ranges from it. */
async function media(req) {
  const cache = await caches.open(C.media);
  const key = req.url;
  let full = await cache.match(key);
  if (!full) {
    try {
      const r = await fetch(key, { mode: "cors", credentials: "omit" });
      if (!r.ok) return r;
      await cache.put(key, r.clone());
      trim("media");
      full = r;
    } catch {
      return fetch(req); // let the browser report the error; the app falls back to text-to-speech
    }
  }
  const range = req.headers.get("Range");
  if (!range) return full;
  const buf = await full.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  const size = buf.byteLength;
  let start = m && m[1] ? +m[1] : 0;
  let end = m && m[2] ? +m[2] : size - 1;
  if (m && !m[1] && m[2]) { start = Math.max(0, size - +m[2]); end = size - 1; }
  end = Math.min(end, size - 1);
  if (start > end || start >= size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": full.headers.get("Content-Type") || "audio/mpeg",
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
    },
  });
}

/* ---------- helpers ---------- */

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

const trimming = {};
function trim(name) {
  const max = LIMIT[name];
  if (!max || trimming[name]) return;
  trimming[name] = true;
  caches.open(C[name])
    .then(async (cache) => {
      const keys = await cache.keys();
      for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
    })
    .finally(() => { trimming[name] = false; });
}

/* ---------- messages from the app ---------- */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
