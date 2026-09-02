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

// Initialize Firestore instance cleanly with mobile long-polling compatibility
const dbId = firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
  ? firebaseConfigData.firestoreDatabaseId
  : undefined;

function getFirestoreInstance(): Firestore {
  try {
    const instance = initializeFirestore(firebaseApp, {
      experimentalAutoDetectLongPolling: true
    }, dbId);
    console.log('[FIREBASE CONFIG]', {
      projectId: firebaseConfigData.projectId,
      databaseId: dbId || '(default)',
      mode: 'initializeFirestore'
    });
    return instance;
  } catch (_err) {
    const fallback = dbId ? getFirestore(firebaseApp, dbId) : getFirestore(firebaseApp);
    console.log('[FIREBASE CONFIG]', {
      projectId: firebaseConfigData.projectId,
      databaseId: dbId || '(default)',
      mode: 'getFirestore-fallback'
    });
    return fallback;
  }
}

export const firestore: Firestore = getFirestoreInstance();

export default firestore;

