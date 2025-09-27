// Service Worker for CitizenX-level performance (96/100 target)
const CACHE_NAME = 'polish-citizenship-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/manifest.json'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response before caching
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Return cached API response if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // For static assets, use cache-first strategy
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          // Update cache in background
          fetch(event.request).then(fetchResponse => {
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(event.request, fetchResponse);
            });
          });
          return response;
        }
        return fetch(event.request).then(fetchResponse => {
          const responseToCache = fetchResponse.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return fetchResponse;
        });
      })
    );
    return;
  }

  // For HTML, use network-first strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});