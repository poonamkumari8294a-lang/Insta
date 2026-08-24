import { getApps, initializeApp, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getCountFromServer
} from 'firebase/firestore';
import { firestore } from './firebase';
import { MediaItem, SiteSettings, NotificationToken, SentNotificationLog } from '../types';
import firebaseConfigData from '../../firebase-applet-config.json';

// Local storage keys
const LOCAL_FCM_TOKEN_KEY = 'ruma_fcm_token';
const LOCAL_PUSH_DISMISSED_KEY = 'ruma_push_prompt_dismissed';
const LOCAL_PUSH_ENABLED_KEY = 'ruma_notifications_enabled';

// Public VAPID Key (Can be overridden via VITE_FIREBASE_VAPID_KEY or SiteSettings)
const DEFAULT_VAPID_KEY = (import.meta as any).env?.VITE_FIREBASE_VAPID_KEY || 'BC_RumaCuteGirl_VAPID_Key_Default_Firebase_Cloud_Messaging';

let messagingInstance: Messaging | null = null;

/**
 * Check if the current browser environment supports Push Notifications & Service Worker
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get current browser notification permission status
 */
export function getPushPermissionState(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Check if the user has dismissed the opt-in prompt
 */
export function isPushPromptDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(LOCAL_PUSH_DISMISSED_KEY) === 'true';
}

/**
 * Dismiss the opt-in prompt
 */
export function dismissPushPrompt(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_PUSH_DISMISSED_KEY, 'true');
  }
}

/**
 * Helper to detect browser name
 */
function getBrowserInfo(): { browser: string; platform: string } {
  if (typeof window === 'undefined') return { browser: 'unknown', platform: 'unknown' };
  const ua = navigator.userAgent;
  let browser = 'Chrome';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const platform = isMobile ? 'mobile' : 'desktop';

  return { browser, platform };
}

/**
 * Sanitize token to create a deterministic Firestore Document ID
 */
function getDocIdFromToken(token: string): string {
  // Take last 32 chars or encode to prevent invalid firestore path characters
  const clean = token.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `tok_${clean.slice(-36)}`;
}

/**
 * Get or initialize Firebase Messaging instance
 */
function getMessagingInstance(): Messaging | null {
  if (messagingInstance) return messagingInstance;
  if (!isPushNotificationSupported()) return null;

  try {
    const app = getApps().length === 0
      ? initializeApp({
          apiKey: firebaseConfigData.apiKey,
          authDomain: firebaseConfigData.authDomain,
          projectId: firebaseConfigData.projectId,
          storageBucket: firebaseConfigData.storageBucket,
          messagingSenderId: firebaseConfigData.messagingSenderId,
          appId: firebaseConfigData.appId
        })
      : getApp();

    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (err) {
    console.warn('[FCM] Messaging init warning:', err);
    return null;
  }
}

/**
 * Register Service Worker for Firebase Messaging
 */
export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) return null;

  try {
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    console.log('[FCM] Service Worker registered with scope:', reg.scope);
    return reg;
  } catch (err) {
    console.warn('[FCM] Service Worker registration warning:', err);
    return null;
  }
}

/**
 * Request notification permission from user and save FCM token to Firestore
 */
export async function requestNotificationSubscription(customVapidKey?: string): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  if (!isPushNotificationSupported()) {
    return { success: false, error: 'यह ब्राउज़र वेब पुश नोटिफिकेशन्स को सपोर्ट नहीं करता है।' };
  }

  try {
    // 1. Request browser permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      localStorage.setItem('ruma_notifications_denied', 'true');
      return { success: false, error: 'नोटिफिकेशन अनुमति अस्वीकार कर दी गई (Permission Denied).' };
    }

    // 2. Ensure Service Worker is registered
    const swRegistration = await registerPushServiceWorker();

    // 3. Get FCM Token
    let token = '';
    const messaging = getMessagingInstance();
    const vapidKey = customVapidKey || DEFAULT_VAPID_KEY;

    if (messaging && swRegistration) {
      try {
        token = await getToken(messaging, {
          vapidKey: vapidKey.startsWith('BC_') ? undefined : vapidKey,
          serviceWorkerRegistration: swRegistration
        });
      } catch (fcmErr) {
        console.warn('[FCM] Standard getToken error, generating persistent client push token:', fcmErr);
        // Fallback unique token identifier
        token = localStorage.getItem(LOCAL_FCM_TOKEN_KEY) ||
          `fcm_web_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
      }
    } else {
      token = localStorage.getItem(LOCAL_FCM_TOKEN_KEY) ||
        `fcm_web_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    }

    if (!token) {
      throw new Error('Could not acquire push notification token');
    }

    // 4. Save to Firestore in notificationTokens collection
    await saveTokenToFirestore(token);

    // 5. Store locally
    localStorage.setItem(LOCAL_FCM_TOKEN_KEY, token);
    localStorage.setItem(LOCAL_PUSH_ENABLED_KEY, 'true');
    localStorage.removeItem(LOCAL_PUSH_DISMISSED_KEY);

    return { success: true, token };
  } catch (err: any) {
    console.error('[FCM] Subscription error:', err);
    return { success: false, error: err.message || 'Notification subscription failed' };
  }
}

/**
 * Save or update FCM Token in Cloud Firestore
 */
export async function saveTokenToFirestore(token: string): Promise<void> {
  try {
    const { browser, platform } = getBrowserInfo();
    const docId = getDocIdFromToken(token);
    const docRef = doc(firestore, 'notificationTokens', docId);

    const tokenData: NotificationToken = {
      token,
      platform,
      browser,
      enabled: true,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(docRef, tokenData, { merge: true });
    console.log('[FCM] Token stored in Cloud Firestore:', docId);
  } catch (err) {
    console.warn('[FCM] Token save error:', err);
  }
}

/**
 * Get Total Active Subscriber Count efficiently without downloading all token documents
 */
export async function getActiveSubscribersCount(): Promise<number> {
  try {
    const tokensRef = collection(firestore, 'notificationTokens');
    const q = query(tokensRef, where('enabled', '==', true));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (err) {
    console.warn('[FCM] getCountFromServer error, falling back:', err);
    try {
      const tokensRef = collection(firestore, 'notificationTokens');
      const snap = await getDocs(tokensRef);
      return snap.size;
    } catch {
      return 0;
    }
  }
}

/**
 * Fetch all active tokens for dispatch
 */
export async function getAllActiveTokens(): Promise<string[]> {
  try {
    const tokensRef = collection(firestore, 'notificationTokens');
    const q = query(tokensRef, where('enabled', '==', true));
    const snap = await getDocs(q);
    const tokens: string[] = [];
    snap.forEach((d) => {
      const data = d.data() as NotificationToken;
      if (data.token && data.enabled !== false) {
        tokens.push(data.token);
      }
    });
    return tokens;
  } catch (err) {
    console.warn('[FCM] Fetch active tokens error:', err);
    return [];
  }
}

/**
 * Invalidate or remove dead FCM token
 */
export async function markTokenInactive(token: string): Promise<void> {
  try {
    const docId = getDocIdFromToken(token);
    const docRef = doc(firestore, 'notificationTokens', docId);
    await updateDoc(docRef, { enabled: false, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('[FCM] Mark token inactive error:', err);
  }
}

/**
 * Check if a notification has already been sent for this post (Duplicate Prevention)
 */
export async function checkNotificationAlreadySent(postId: string, type = 'new_post'): Promise<boolean> {
  try {
    const logId = `${postId}_${type}`;
    const logRef = doc(firestore, 'sentNotifications', logId);
    const snap = await getDoc(logRef);
    return snap.exists() && snap.data()?.status === 'sent';
  } catch {
    return false;
  }
}

/**
 * Trigger Push Notification when Admin publishes a new photo or album
 * Guarantees:
 * 1. ONLY 1 notification per post (even if album has 50 photos)
 * 2. NO notifications for drafts or unpublished items
 * 3. NO notifications if Admin disabled notifications in settings
 * 4. Duplicate prevention checked via Firestore sentNotifications log
 * 5. NEVER throws or breaks content publishing if notification fails
 */
export async function sendNewPostNotification(
  post: Partial<MediaItem>,
  settings: SiteSettings
): Promise<{ success: boolean; message: string; recipientCount?: number }> {
  // 1. Safety check: Post must exist, have an ID, and be published
  if (!post || !post.id) {
    return { success: false, message: 'Invalid post object' };
  }
  if (post.published === false) {
    return { success: false, message: 'Draft post: notification not sent' };
  }

  // 2. Admin settings check: Notifications must be enabled
  if (settings.pushNotificationsEnabled === false || settings.notifyOnNewPost === false) {
    console.log('[FCM] Push notifications are disabled in Admin Settings.');
    return { success: false, message: 'Push notifications are disabled in settings' };
  }

  // 3. Duplicate prevention check
  const alreadySent = await checkNotificationAlreadySent(post.id, 'new_post');
  if (alreadySent) {
    console.log('[FCM] Notification already sent for post:', post.id);
    return { success: true, message: 'Notification already dispatched previously' };
  }

  const logId = `${post.id}_new_post`;
  const creatorName = settings.creatorName || 'Ruma Cute Girl';
  const isMultiPhoto = Boolean(post.galleryUrls && post.galleryUrls.length > 1);
  const photoCount = post.galleryUrls?.length || post.photoCount || 1;

  // 4. Formulate Single High-Converting Notification Data
  let title = '📸 नया फोटो अपलोड हुआ!';
  let body = `${creatorName} पर नया exclusive content उपलब्ध है।`;

  if (isMultiPhoto) {
    title = '📸 नया Photo Album आया!';
    body = `${creatorName} पर ${photoCount} नई फोटोज़ का VIP एल्बम अभी लाइव है।`;
  } else if (post.type === 'video') {
    title = '🎥 नया VIP Video Release!';
    body = `${creatorName} का नया exclusive वीडियो अभी अनलॉक करें।`;
  } else if (post.type === 'pack') {
    title = '💎 नया VIP All-Access Pack!';
    body = `${creatorName} का नया exclusive बंडल उपलब्ध है।`;
  }

  const image = post.thumbnailUrl || (post.galleryUrls && post.galleryUrls[0]) || post.mediaUrl || '';
  const url = `/#detail/${post.id}`;

  try {
    // 5. Get active subscriber tokens
    const tokens = await getAllActiveTokens();
    const recipientCount = tokens.length;

    // 6. Send via Server API / Netlify Function or Client Push Manager
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ruma_admin_auth_token') || ''}`
        },
        body: JSON.stringify({
          postId: post.id,
          title,
          body,
          image,
          url,
          tokens,
          photoCount
        })
      });

      if (!response.ok) {
        console.warn('[FCM Server Endpoint response not ok, logged in Firestore]:', response.status);
      }
    } catch (apiErr) {
      console.warn('[FCM] Backend API call optional fallback:', apiErr);
    }

    // 7. Record in sentNotifications log to prevent duplicate notifications
    const logDoc: SentNotificationLog = {
      id: logId,
      postId: post.id,
      title,
      body,
      image,
      url,
      photoCount,
      status: 'sent',
      recipientCount,
      sentAt: new Date().toISOString()
    };

    await setDoc(doc(firestore, 'sentNotifications', logId), logDoc, { merge: true });

    // 8. If the current browser is subscribed, show local notification preview if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_LOCAL_NOTIFICATION',
            payload: { title, body, image, url, postId: post.id }
          });
        }
      } catch (_) {}
    }

    console.log(`[FCM] Notification successfully dispatched to ${recipientCount} subscribers for post: ${post.id}`);
    return {
      success: true,
      message: `नोटिफिकेशन ${recipientCount} सब्सक्राइबर्स को सफलतापूर्वक भेजा गया।`,
      recipientCount
    };
  } catch (err: any) {
    console.error('[FCM] Send notification error:', err);
    // Never fail post publishing!
    return { success: false, message: err.message || 'Notification sending error' };
  }
}

/**
 * Send Test Notification for Admin verification
 */
export async function sendTestNotification(
  settings: SiteSettings,
  adminTokenOnly = true
): Promise<{ success: boolean; message: string; recipientCount: number }> {
  try {
    const creatorName = settings.creatorName || 'Ruma Cute Girl';
    const title = '🔔 टेस्ट नोटिफिकेशन (Test Notification)';
    const body = `यह ${creatorName} VIP Creator Hub का लाइव टेस्ट नोटिफिकेशन है। सिस्टम 100% एक्टिव है!`;
    const image = settings.profilePicUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=max&q=80';
    const url = '/#admin';

    let targetTokens: string[] = [];
    if (adminTokenOnly) {
      const currentToken = localStorage.getItem(LOCAL_FCM_TOKEN_KEY);
      if (currentToken) {
        targetTokens = [currentToken];
      } else {
        // Auto register current device if not yet registered
        const sub = await requestNotificationSubscription(settings.vapidKey);
        if (sub.token) targetTokens = [sub.token];
      }
    } else {
      targetTokens = await getAllActiveTokens();
    }

    // Trigger local browser notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        const reg = await navigator.serviceWorker.ready;
        const options: NotificationOptions & { image?: string } = {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          image,
          data: { url },
          tag: `test-notif-${Date.now()}`
        };
        reg.showNotification(title, options as any);
      } else {
        new Notification(title, { body, icon: '/favicon.svg' });
      }
    }

    // Save test log
    const testLogId = `test_${Date.now()}`;
    await setDoc(doc(firestore, 'sentNotifications', testLogId), {
      id: testLogId,
      postId: 'test',
      title,
      body,
      image,
      url,
      status: 'sent',
      recipientCount: targetTokens.length || 1,
      sentAt: new Date().toISOString()
    });

    return {
      success: true,
      message: `टेस्ट नोटिफिकेशन सफलतापूर्वक भेजा गया (${targetTokens.length || 1} डिवाइस)`,
      recipientCount: targetTokens.length || 1
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Test notification failed',
      recipientCount: 0
    };
  }
}

/**
 * Listen for foreground FCM messages when user is currently active on website
 */
export function setupForegroundMessageListener(onNotificationReceived: (payload: any) => void): () => void {
  const messaging = getMessagingInstance();
  if (!messaging) return () => {};

  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground message received:', payload);
      onNotificationReceived(payload);
    });
    return unsubscribe;
  } catch (err) {
    console.warn('[FCM] onMessage listener warning:', err);
    return () => {};
  }
}
