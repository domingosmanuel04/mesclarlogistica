// Mesclar Logística Service Worker
const CACHE_NAME = "mesclar-cache-v1";
const PRECACHE_ASSETS = [
  "/",
  "/ebooks",
  "/site.webmanifest",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Pre-caching skipped for some assets:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignore non-GET, API routes, Next.js internal assets, and local development
  if (
    request.method !== "GET" ||
    request.url.includes("/api/") ||
    request.url.includes("/_next/") ||
    request.url.includes("localhost") ||
    request.url.includes(":3020") ||
    request.url.includes(":3000")
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached and fetch in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          })
          .catch(() => undefined);
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (request.url.includes("/covers/") ||
              request.url.includes("/icons/") ||
              request.url.includes("/_next/static/"))
          ) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and requesting a page navigation, return cached home
          if (request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Offline", { status: 503, statusText: "Offline" });
        });
    })
  );
});
