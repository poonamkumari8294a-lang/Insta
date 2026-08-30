/**
 * Service Worker Registration for Instant Offline & Low-Bandwidth Speed
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Service Worker] Active & Cache Storage Ready:', registration.scope);
        })
        .catch((error) => {
          console.warn('[Service Worker] Registration note:', error?.message || error);
        });
    });
  }
}
