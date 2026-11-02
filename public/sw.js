// Service Worker for Quran App - Advanced Offline Caching & Notifications
const CACHE_NAME = 'quran-shell-v7';
const API_CACHE_NAME = 'quran-api-v7';
const FONTS_CACHE_NAME = 'quran-fonts-v7';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
];

// 1. Install Event: Pre-cache core app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache partial warning:', err);
      });
    })
  );
});

// 2. Activate Event: Clean up all legacy stale caches immediately
self.addEventListener('activate', (event) => {
  const preservedCaches = [CACHE_NAME, API_CACHE_NAME, FONTS_CACHE_NAME, 'quran-audio-cache-v1'];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!preservedCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Bypass cache completely for dev modules, Vite internals, and source files
  if (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/node_modules') ||
    url.pathname.startsWith('/api/') ||
    url.searchParams.has('v') ||
    url.searchParams.has('t')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Strategy A: Quran Cloud API & Tafsir (Network-First with dynamic offline caching)
  if (url.hostname.includes('alquran.cloud')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedMatch = await caches.match(request);
          if (cachedMatch) return cachedMatch;
          return new Response(
            JSON.stringify({
              code: 503,
              status: 'Offline',
              message: 'المحتوى غير متاح بدون اتصال بالإنترنت',
            }),
            {
              headers: { 'Content-Type': 'application/json; charset=utf-8' },
            }
          );
        })
    );
    return;
  }

  // Strategy B: Google Fonts (Cache-First)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(FONTS_CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        }).catch(() => cachedResponse);
      })
    );
    return;
  }

  // Strategy C: HTML Navigation & App Assets (Network-First, fallback to Cache only when offline)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          return caches.match('/index.html').then((res) => res || caches.match('/'));
        }
        return new Response('Network error occurred', { status: 408, headers: { 'Content-Type': 'text/plain' } });
      })
  );
});

// 4. Notification Click Event for Adhan and Prayer Times
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
