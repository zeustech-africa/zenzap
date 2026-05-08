// Service Worker for offline caching during load shedding
const CACHE_NAME = 'zenzap-cache-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/dashboard/inbox',
  '/dashboard/contacts',
  '/dashboard/settings',
  '/offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});