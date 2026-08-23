/// <reference lib="webworker" />

// Service Worker for Ember Gas PWA
// Handles push notifications and offline caching

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'ember-gas-v1';
const OFFLINE_URL = '/offline';

// Install event — cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/offline',
      ]).catch(() => {
        // Offline page may not exist yet — that's fine
      });
    })
  );
  self.skipWaiting();
});

// Activate event — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event — network-first with offline fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed — try cache, then offline page
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // For navigation requests, return offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/offline').then((offline) => {
              return offline ?? new Response('Offline', { status: 503 });
            });
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let title = 'Ember Gas';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let options: Record<string, any> = {
    body: event.data.text(),
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'ember-gas-notification',
    data: { url: '/account/orders' },
  };

  try {
    const data = event.data.json();
    title = data.title ?? title;
    options = {
      ...options,
      body: data.body ?? options.body,
      icon: data.icon ?? options.icon,
      tag: data.tag ?? options.tag,
      data: data.data ?? options.data,
    };
  } catch {
    // Not JSON — use plain text
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click — navigate to relevant page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url ?? '/account/orders';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url.includes(url)) {
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});

export {};
