import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './serviceWorkerRegistration';

// Suppress benign canvas.getBoundingClientRect errors if a worker or external thread emits it
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('canvas.getBoundingClientRect is not a function')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      console.warn('[Safety] Suppressed canvas.getBoundingClientRect error from thread.');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();

