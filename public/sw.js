const CACHE_NAME = 'financecontrol-v5';

// Assets to cache on install
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.skipWaiting().then(() => self.clients.claim());
});

// Cache first with network fallback - simpler strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET' || url.origin !== location.origin) return;

  // Solo cachear GET requests al mismo dominio
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cached immediately if exists
      if (cached) return cached;

      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;

        // Cache successful responses
        const clone = response.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));

        return response;
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});