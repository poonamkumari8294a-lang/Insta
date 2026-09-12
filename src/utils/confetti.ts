import confetti from 'canvas-confetti';

// Singleton instance configured safely without Web Workers.
// Running with useWorker: true in iframe / sandboxed environments causes OffscreenCanvas
// to be passed to confetti resizer, triggering "canvas.getBoundingClientRect is not a function".
let safeCannon: confetti.CreateTypes | null = null;

export const triggerConfetti = (options?: confetti.Options): Promise<null> | null => {
  if (typeof window === 'undefined') return null;

  try {
    if (!safeCannon) {
      safeCannon = confetti.create(undefined, {
        resize: true,
        useWorker: false,
        disableForReducedMotion: true,
      });
    }

    return safeCannon(options);
  } catch (err) {
    console.warn('[Confetti] Animation error safely handled:', err);
    return null;
  }
};

triggerConfetti.reset = () => {
  try {
    if (safeCannon && typeof safeCannon.reset === 'function') {
      safeCannon.reset();
    }
  } catch (_) {}
};

export default triggerConfetti;
