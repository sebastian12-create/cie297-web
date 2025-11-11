const CACHE = "cie297-v1";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/assets/logo.png",
  // íconos PWA
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  // Leaflet CSS/JS se cachean en runtime
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: network-first, fallback a cache
self.addEventListener("fetch", (e) => {
  const req = e.request;
  // No interceptar llamadas a tu backend /api para evitar problemas de auth
  if (new URL(req.url).pathname.startsWith("/api")) return;

  e.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req).then((c) => c || caches.match("/index.html")))
  );
});
