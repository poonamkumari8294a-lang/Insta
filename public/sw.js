// High-Speed Offline & 2G/3G Low-Bandwidth Cache Service Worker
const CACHE_NAME = 'ruma-vip-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
];

// Install Event - Pre-cache essential entry points
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial fail:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up stale old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate & Cache-First Strategy for Ultra-Fast 2G Loading
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-GET requests or Firebase Firestore/Auth API mutations
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Skip Firestore API and Google Auth endpoints from service worker interception
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // 1. Static Assets (JS, CSS, Fonts, SVGs) - Cache-First with Background Update
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.svg') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cache immediately, fetch update in background
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // Not in cache, fetch from network and store
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 2. Images (Unsplash, Cloudinary, Static) - Stale-While-Revalidate
  if (
    request.destination === 'image' ||
    url.hostname.includes('images.unsplash.com') ||
    url.hostname.includes('res.cloudinary.com')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Navigation / HTML - Network First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
  }
});

// Purge media URLs on demand when content is deleted by Admin
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PURGE_MEDIA_URLS' && Array.isArray(event.data.urls)) {
    caches.open(CACHE_NAME).then((cache) => {
      event.data.urls.forEach((url) => {
        if (url) {
          cache.delete(url).catch(() => {});
          try {
            const parsed = new URL(url);
            cache.delete(parsed.pathname).catch(() => {});
          } catch (_) {}
        }
      });
    }).catch(() => {});
  }
});
