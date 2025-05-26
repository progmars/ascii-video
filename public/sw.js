// This service worker is automatically registered by vite-plugin-pwa
// It's used for offline capabilities and "Add to Home Screen" functionality

// Add the Workbox injection point for the precache manifest
self.__WB_MANIFEST;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
