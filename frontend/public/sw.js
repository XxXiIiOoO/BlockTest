const CACHE_NAME = "blocktest-shell-v2";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/blocktest-icon.svg",
  "/blocktest-icon-maskable.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("blocktest-shell-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", responseClone));
          return response;
        })
        .catch(async () => (await caches.match("/index.html")) || (await caches.match("/"))),
    );
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  // Keep Cache Storage limited to static frontend assets. Caching arbitrary
  // same-origin GET responses can persist authenticated API data across users.
  const isStaticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/blocktest-icon.svg" ||
    url.pathname === "/blocktest-icon-maskable.svg";
  if (!isStaticAsset || request.headers.has("Authorization")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkResponse = fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkResponse;
    }),
  );
});
