const CACHE = 'cie297-v1';
const APP_SHELL = [
  '/', '/index.html',
  '/assets/logo.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/manifest.webmanifest',
];

// Instalar
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

// Activar
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', e => {
  const req = e.request;

  // 1) NUNCA interceptar la API ni métodos NO-GET
  const isAPI = new URL(req.url).pathname.startsWith('/api');
  if (isAPI || req.method !== 'GET') {
    return; // deja que vaya directo a red
  }

  // 2) Cache-first para estáticos
  e.respondWith(
    caches.match(req).then(res => res || fetch(req).then(r => {
      // opcional: guardar en cache recursos GET que no son API
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return r;
    }).catch(() => caches.match('/index.html')))
  );
});
