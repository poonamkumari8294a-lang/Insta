// Firebase Cloud Messaging Service Worker for Ruma Cute Girl VIP Creator Hub
// Handles Background Web Push Notifications on Mobile (Android Chrome, iOS PWA, Desktop)

/* eslint-disable no-undef */

// 1. Give the service worker access to Firebase Messaging.
// Note that you can also use native Web Push payloads directly.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
try {
  firebase.initializeApp({
    projectId: "expanded-tangent-b8kj5",
    appId: "1:397467631439:web:6181a965da3716c1160f3a",
    apiKey: "AIzaSyAG7ec1pI0KMCktGnYo-4u9wb9DkGTlwfA",
    authDomain: "expanded-tangent-b8kj5.firebaseapp.com",
    storageBucket: "expanded-tangent-b8kj5.firebasestorage.app",
    messagingSenderId: "397467631439"
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || '📸 नया फोटो अपलोड हुआ!';
    const notificationBody = payload.notification?.body || payload.data?.body || 'Ruma Cute Girl पर नया premium content उपलब्ध है।';
    const notificationImage = payload.notification?.image || payload.data?.image || '';
    const postId = payload.data?.postId || '';
    const targetUrl = payload.data?.url || (postId ? `/#detail/${postId}` : '/');

    const notificationOptions = {
      body: notificationBody,
      icon: payload.notification?.icon || '/favicon.svg',
      badge: '/favicon.svg',
      image: notificationImage || undefined,
      tag: `ruma-post-${postId || Date.now()}`,
      renotify: true,
      vibrate: [200, 100, 200],
      data: {
        url: targetUrl,
        postId: postId,
        click_action: targetUrl,
        time: Date.now()
      },
      actions: [
        {
          action: 'open_post',
          title: 'अभी देखें (View Now)'
        }
      ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (err) {
  console.warn('[firebase-messaging-sw.js] Compat init skipped or native fallback active:', err);
}

// 2. Generic Push Event Fallback (for standard Web Push payloads)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const rawData = event.data.json();
    console.log('[Service Worker] Push event received:', rawData);

    const title = rawData.notification?.title || rawData.data?.title || rawData.title || '📸 नया फोटो अपलोड हुआ!';
    const body = rawData.notification?.body || rawData.data?.body || rawData.body || 'Ruma Cute Girl पर नया premium content उपलब्ध है।';
    const image = rawData.notification?.image || rawData.data?.image || rawData.image || '';
    const postId = rawData.data?.postId || rawData.postId || '';
    const targetUrl = rawData.data?.url || rawData.url || (postId ? `/#detail/${postId}` : '/');

    const options = {
      body: body,
      icon: rawData.icon || '/favicon.svg',
      badge: '/favicon.svg',
      image: image || undefined,
      tag: `ruma-post-${postId || Date.now()}`,
      renotify: true,
      vibrate: [200, 100, 200],
      data: {
        url: targetUrl,
        postId: postId,
        click_action: targetUrl
      },
      actions: [
        {
          action: 'open_post',
          title: 'अभी देखें (View Now)'
        }
      ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.warn('[Service Worker] Push parsing error, showing default notification:', e);
    event.waitUntil(
      self.registration.showNotification('📸 नया फोटो अपलोड हुआ!', {
        body: 'Ruma Cute Girl पर नया content उपलब्ध है।',
        icon: '/favicon.svg',
        data: { url: '/' }
      })
    );
  }
});

// 3. Handle Notification Click -> Open App and navigate to specific post
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const clickData = event.notification.data || {};
  const targetUrl = clickData.url || clickData.click_action || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it and navigate
      for (const client of windowClients) {
        if (client.url && 'focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      // If no tab is open, open a new window with the target post URL
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
