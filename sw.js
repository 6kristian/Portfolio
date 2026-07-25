const CACHE_NAME = 'kf-portfolio-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/og-thumb.webp',
  '/manifest.json'
];

// INSTALL: Cache essential assets and force immediate activation
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Prevent waiting for older clients to close
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch((err) => console.error('Cache pre-fetch failed:', err))
  );
});

// ACTIVATE: Purge old caches to prevent stale data bloat
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('kf-portfolio-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH: Network-first for HTML, Stale-while-revalidate for assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestURL = new URL(event.request.url);

  // Network-First Strategy for HTML Navigation (Ensures latest content)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Stale-While-Revalidate for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch((err) => console.warn('Offline asset request:', err));

      return cachedResponse || fetchPromise;
    })
  );
});
