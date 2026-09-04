import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, deleteDoc, getDoc, Firestore } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let serverFirestoreInstance: Firestore | null = null;

function getServerFirestore(): Firestore | null {
  if (serverFirestoreInstance) return serverFirestoreInstance;
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      console.warn('[Server Firebase] firebase-applet-config.json not found on server');
      return null;
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const app = getApps().length === 0 ? initializeApp(config, 'server-app') : (getApps().find(a => a.name === 'server-app') || initializeApp(config, 'server-app'));
    const dbId = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
      ? config.firestoreDatabaseId
      : undefined;
    serverFirestoreInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
    return serverFirestoreInstance;
  } catch (err: any) {
    console.warn('[Server Firebase Init Warning]', err?.message || err);
    return null;
  }
}

/**
 * Reads a single document from Firebase Firestore directly from the Node backend.
 */
export async function getServerFirestoreDoc(
  collectionName: string,
  docId: string
): Promise<any | null> {
  const db = getServerFirestore();
  if (!db) return null;
  try {
    const docRef = doc(db, collectionName, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (err: any) {
    console.warn(`[Server Firebase getDoc Warning for ${collectionName}/${docId}]:`, err?.message || err);
    return null;
  }
}

/**
 * Deletes a document from Firebase Firestore directly from the Node backend.
 * Guarantees that the document is removed from Firestore even if the client's network drops.
 * Features automatic retry with backoff for transient issues.
 * Returns exact status and error details.
 */
export async function deleteServerFirestoreDoc(
  collectionName: string,
  docId: string,
  maxRetries = 3
): Promise<{ success: boolean; error?: string }> {
  const db = getServerFirestore();
  if (!db) {
    return { success: false, error: 'Firebase Firestore is not initialized on server' };
  }

  let lastError: any = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      console.log(`[Server Firebase] Successfully deleted Firestore document "${collectionName}/${docId}" on attempt ${attempt}`);
      return { success: true };
    } catch (err: any) {
      lastError = err;
      console.warn(
        `[Server Firebase Delete Attempt ${attempt}/${maxRetries} Failed for "${collectionName}/${docId}"]:`,
        err?.message || err
      );
      if (attempt < maxRetries) {
        // Exponential backoff delay
        await new Promise((resolve) => setTimeout(resolve, attempt * 600));
      }
    }
  }

  console.error(`[Server Firebase Fatal Delete Error for "${collectionName}/${docId}"]:`, lastError?.message || lastError);
  return { success: false, error: lastError?.message || String(lastError) };
}

/**
 * Deletes a content document from Firebase Firestore.
 */
export async function deleteServerFirestoreContentDoc(
  contentId: string,
  maxRetries = 3
): Promise<{ success: boolean; error?: string }> {
  return deleteServerFirestoreDoc('content', contentId, maxRetries);
}
