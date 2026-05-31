/* eslint-disable no-restricted-globals */
"use strict";

const CACHE_NAME = "fizki-v7";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/app.js",
  "/js/wzory-symbol-legends.js",
  "/zadania.json",
  "/data/fiszki-wzory.json",
  "/data/curriculum-lo-podstawa.json",
  "/data/curriculum-lo-rozszerzenie.json",
  "/data/curriculum-sp.json",
  "/manifest.json",
  "/logo/fizki_yellow.svg",
  "/logo/fizki_black.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

/** Shell assets — network-first, żeby deploy od razu trafiał do użytkowników PWA. */
const SHELL_PATHS = new Set([
  "/css/styles.css",
  "/js/app.js",
  "/js/wzory-symbol-legends.js",
]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
      )
      .then((results) => {
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length) console.warn("[sw] precache partial:", failed.length);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/**
 * HTML: stale-while-revalidate.
 * CSS/JS shell: network-first (świeży kod po deployu).
 * Reszta: cache-first (offline JSON, logo, ikony).
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return;

  const isNavigation =
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html");

  if (isNavigation) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (SHELL_PATHS.has(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || Response.error();
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await caches.match("/index.html");

  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        cache.put("/index.html", response.clone());
      }
      return response;
    })
    .catch(() => null);

  const network = await networkPromise;
  return cached || network || (await caches.match("/")) || Response.error();
}
