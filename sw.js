/* eslint-disable no-restricted-globals */
"use strict";

const CACHE_NAME = "fizki-v1";

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
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
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
 * Cache-First dla zasobów aplikacji; Stale-While-Revalidate dla nawigacji (HTML).
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
