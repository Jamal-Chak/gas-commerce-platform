'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker for PWA capabilities.
 * Mount this once in the root layout.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registered:', registration.scope);
        })
        .catch((error) => {
          console.log('[SW] Registration failed:', error);
        });
    });
  }, []);

  return null;
}
