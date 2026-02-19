
const CACHE_NAME = 'tokenpod-v8'; // Bumped version for Badging update
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-180.png',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// NATIVE WEB PUSH: Wake-Up Protocol
self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      // 1. If payload exists
      if (event.data) {
        try {
          const data = event.data.json();
          return self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: { url: data.url || '/' }
          });
        } catch (e) {}
      }

      // 2. Wake-Up Logic: Call Google Script via Proxy
      try {
        const subscription = await self.registration.pushManager.getSubscription();
        if (!subscription) throw new Error("Subscription missing");

        const PROXY_ENDPOINT = '/api/proxy';

        const response = await fetch(PROXY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ 
            action: 'FETCH_NOTIFICATIONS', 
            endpoint: subscription.endpoint 
          })
        });

        const result = await response.json();
        
        // Update App Badge if supported
        if (result.success && result.notifications?.length > 0) {
          if ('setAppBadge' in navigator) {
            // Set badge to total number of ready signals returned
            navigator.setAppBadge(result.notifications.length);
          }

          const n = result.notifications[0];
          return self.registration.showNotification(n.title, {
            body: n.body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'reward-ready',
            data: { url: n.url || '/#focus' }
          });
        } else {
          // Clear badge if no notifications
          if ('clearAppBadge' in navigator) navigator.clearAppBadge();
        }
      } catch (err) {
        console.error("[SW] Proxy fetch failed", err);
      }

      // 3. Fallback
      return self.registration.showNotification('TokenPod | Signal Ready', {
        body: 'An earning window is open. Launch app to claim!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'reward-ready',
        data: { url: '/#focus' }
      });
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Clear badge on click
  if ('clearAppBadge' in navigator) navigator.clearAppBadge();
  
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow(urlToOpen);
    })
  );
});
