import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore, setLogLevel } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  measurementId: firebaseConfigData.measurementId || undefined
};

// Initialize Firebase App singleton
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Suppress non-critical Firestore connection noise in console
try {
  setLogLevel('error');
} catch (_) {}

const dbId = firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
  ? firebaseConfigData.firestoreDatabaseId
  : undefined;

// Initialize Firestore with auto-detect long polling to prevent WebChannel 10s timeout in browser/iframe
function createFirestoreInstance(): Firestore {
  try {
    return initializeFirestore(firebaseApp, {
      experimentalAutoDetectLongPolling: true,
      experimentalForceLongPolling: true
    }, dbId);
  } catch (_err) {
    return dbId ? getFirestore(firebaseApp, dbId) : getFirestore(firebaseApp);
  }
}

export const firestore: Firestore = createFirestoreInstance();

export default firestore;

