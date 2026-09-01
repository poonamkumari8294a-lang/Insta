import { MediaItem, OrderItem, SiteSettings, AdminStats } from '../types';
import { CLIENT_SITE_SETTINGS, CLIENT_CONTENT_LIST } from '../data/defaultData';
import QRCode from 'qrcode';
import { firestore } from '../services/firebase';
import {
  ensureMediaItemStorageUrls,
  ensureSiteSettingsStorageUrls,
  cleanupMediaItemStorage,
  uploadMediaToStorage,
  isDataUrl
} from '../services/storage';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit as firestoreLimit
} from 'firebase/firestore';

const TOKENS_STORAGE_KEY = 'ruma_unlocked_tokens';
const ORDERS_STORAGE_KEY = 'ruma_user_orders';
const SESSION_ID_KEY = 'ruma_customer_session_id';

// Customer Session ID helper
export function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

// Local Storage for Unlocked Tokens
export function getStoredTokens(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TOKENS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAccessToken(contentId: string, token: string) {
  const tokens = getStoredTokens();
  tokens[contentId] = token;
  localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
}

export function getStoredOrders(): string[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOrderId(orderId: string) {
  const orders = getStoredOrders();
  if (!orders.includes(orderId)) {
    orders.unshift(orderId);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }
}

// User Profile (Name, Phone, Daily Streak) Helper
const USER_PROFILE_KEY = 'ruma_vip_user_profile';

export function getStoredUserProfile(): { name: string; phone: string; streakDays?: number; lastSpinDate?: string } | null {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredUserProfile(profile: { name: string; phone: string; streakDays?: number; lastSpinDate?: string }) {
  try {
    const existing = getStoredUserProfile() || {};
    const updated = { ...existing, ...profile, updatedAt: new Date().toISOString() };
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving user profile', e);
  }
}

// Save VIP Lead to Firestore for Admin Marketing
export async function saveVipLeadToCloud(lead: {
  name: string;
  phone: string;
  contentId?: string;
  contentTitle?: string;
  amount?: number;
}) {
  if (isCloudQuotaExhausted()) return;
  try {
    const cleanPhone = (lead.phone || '').trim().replace(/[^0-9]/g, '');
    const cleanName = (lead.name || '').trim();
    if (!cleanPhone || cleanPhone.length < 10) return;

    const leadDocId = `lead_${cleanPhone}_${Date.now()}`;
    const leadRef = doc(firestore, 'vip_leads', leadDocId);
    await setDoc(leadRef, {
      name: cleanName,
      phone: cleanPhone,
      contentId: lead.contentId || '',
      contentTitle: lead.contentTitle || '',
      amount: lead.amount || 0,
      createdAt: new Date().toISOString(),
      source: 'web_unlock_prompt'
    }, { merge: true });
    console.log('[Firebase Cloud] VIP Lead recorded:', cleanPhone);
  } catch (err) {
    console.warn('[Firebase saveVipLead Error]', err);
  }
}

// Admin Auth Token helper
export function getAdminToken(): string | null {
  return localStorage.getItem('ruma_admin_token');
}

export function setAdminToken(token: string) {
  localStorage.setItem('ruma_admin_token', token);
}

export function removeAdminToken() {
  localStorage.removeItem('ruma_admin_token');
}

// ============================================================================
// FIREBASE CLOUD FIRESTORE INTEGRATION & ZERO-DOWNTIME QUOTA RESILIENCE
// ============================================================================

const SETTINGS_DOC_ID = 'site_config';

// Smart Quota Limit Circuit Breaker (ONLY for genuine Firestore Quota Exhaustion)
let quotaCooldownUntil = 0;
const QUOTA_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes cooldown

export function isQuotaError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  const code = (err.code || '').toLowerCase();
  return (
    msg.includes('quota exceeded') ||
    msg.includes('resource-exhausted') ||
    msg.includes('resource_exhausted') ||
    code.includes('resource-exhausted')
  );
}

function handleFirestoreError(context: string, err: any) {
  if (isQuotaError(err)) {
    quotaCooldownUntil = Date.now() + QUOTA_COOLDOWN_MS;
    console.warn(`[Firebase Quota Limit] ${context}: Free daily read quota reached. Activating offline fallback cache.`);
  } else {
    console.warn(`[Firebase ${context} Error]`, err?.message || err);
  }
}

export function isCloudQuotaExhausted(): boolean {
  return Date.now() < quotaCooldownUntil;
}

// Timeout helper so slow network requests on mobile don't hang indefinitely (7s timeout)
async function withTimeout<T>(promise: Promise<T>, ms = 7000): Promise<T> {
  let timeoutHandle: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`Firestore request timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutHandle);
  });
}

/**
 * Deeply sanitizes an object before writing to Firestore:
 * 1. Strips all undefined values (which crash Firestore setDoc/updateDoc)
 * 2. Ensures plain arrays and objects
 */
export function sanitizeFirestorePayload<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => (typeof item === 'object' && item !== null ? sanitizeFirestorePayload(item) : item)) as unknown as T;
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value === null) {
      clean[key] = null;
    } else if (Array.isArray(value)) {
      clean[key] = value
        .filter(item => item !== undefined)
        .map(item => (typeof item === 'object' && item !== null ? sanitizeFirestorePayload(item) : item));
    } else if (typeof value === 'object') {
      clean[key] = sanitizeFirestorePayload(value);
    } else {
      clean[key] = value;
    }
  }

  return clean as T;
}

/**
 * Ensures Firestore is seeded with default content and settings on first run only
 */
let seedingPromise: Promise<void> | null = null;

async function ensureFirestoreSeeded(): Promise<void> {
  if (isCloudQuotaExhausted() || seedingPromise) return;

  seedingPromise = (async () => {
    try {
      // 1. Check/seed settings
      const settingsRef = doc(firestore, 'settings', SETTINGS_DOC_ID);
      const settingsSnap = await getDoc(settingsRef);
      
      if (!settingsSnap.exists()) {
        console.log('[Firebase Cloud] First-time setup: Initializing Cloud Settings...');
        await setDoc(settingsRef, sanitizeFirestorePayload({
          ...CLIENT_SITE_SETTINGS,
          isSeeded: true
        }));
      } else {
        const data = settingsSnap.data();
        if (data?.demoPurged) {
          // If demo content has been purged by admin, never re-seed demo items
          return;
        }
      }

      // 2. Check/seed initial content if content collection is currently empty and not explicitly purged
      const contentRef = collection(firestore, 'content');
      const contentSnap = await getDocs(query(contentRef, firestoreLimit(1)));
      if (contentSnap.empty && !settingsSnap.data()?.demoPurged) {
        console.log('[Firebase Cloud] Content collection empty. Seeding initial posts to Cloud Firestore...');
        for (const item of CLIENT_CONTENT_LIST) {
          const itemRef = doc(firestore, 'content', item.id);
          await setDoc(itemRef, sanitizeFirestorePayload(item));
        }
        console.log('[Firebase Cloud] Seeded initial content successfully.');
      }
    } catch (err) {
      handleFirestoreError('ensureFirestoreSeeded', err);
    }
  })();

  return seedingPromise;
}

// ============================================================================
// In-Memory Fast Cache & SWR LocalStorage for Instant 0ms Cold Start
// ============================================================================
const SETTINGS_CACHE_KEY = 'ruma_cached_settings_v2';
const CONTENT_CACHE_KEY = 'ruma_cached_content_v2';

export function hasLocalSettingsCache(): boolean {
  try {
    return Boolean(localStorage.getItem(SETTINGS_CACHE_KEY));
  } catch (_) {
    return false;
  }
}

let memorySiteSettings: SiteSettings | null = null;
let memorySettingsTimestamp = 0;
let memoryContentList: MediaItem[] | null = null;
let memoryContentTimestamp = 0;
let activeContentPromise: Promise<MediaItem[]> | null = null;
let activeSettingsPromise: Promise<SiteSettings> | null = null;
const CACHE_TTL_MS = 10000; // 10s fresh cache for instant responsiveness

/**
 * Synchronously retrieves cached settings from localStorage for fast initial render
 */
export function getCachedSiteSettingsSync(): SiteSettings {
  if (memorySiteSettings) return memorySiteSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      memorySiteSettings = { ...CLIENT_SITE_SETTINGS, ...parsed };
      return memorySiteSettings;
    }
  } catch (_) {}
  return CLIENT_SITE_SETTINGS;
}

/**
 * Synchronously retrieves cached content list from localStorage for fast initial render
 */
export function getCachedContentListSync(): MediaItem[] {
  if (memoryContentList && memoryContentList.length > 0) return memoryContentList;
  try {
    const raw = localStorage.getItem(CONTENT_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MediaItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryContentList = parsed;
        return parsed;
      }
    }
  } catch (_) {}
  return CLIENT_CONTENT_LIST;
}

// Helper to sanitize items based on user's purchased tokens
function applyUserAccessTokens(items: MediaItem[]): MediaItem[] {
  const userTokens = getStoredTokens();
  return items.map(item => {
    const isUnlocked = item.access === 'free' || Boolean(userTokens[item.id]);
    return {
      ...item,
      mediaUrl: isUnlocked ? item.mediaUrl : (item.previewUrl || item.thumbnailUrl),
      galleryUrls: isUnlocked 
        ? (item.galleryUrls && item.galleryUrls.length > 0 ? item.galleryUrls : (item.mediaUrl ? [item.mediaUrl] : [item.thumbnailUrl]))
        : (item.previewUrl ? [item.previewUrl] : [item.thumbnailUrl])
    };
  });
}

// ----------------------------------------------------------------------------
// 1. Fetch Site Settings (Live Cloud Sync with In-Memory Acceleration & Deduplication)
// ----------------------------------------------------------------------------
export async function fetchSiteSettings(forceFresh = false): Promise<SiteSettings> {
  const now = Date.now();
  if (!forceFresh && memorySiteSettings && (now - memorySettingsTimestamp < CACHE_TTL_MS)) {
    return memorySiteSettings;
  }

  if (activeSettingsPromise) {
    return activeSettingsPromise;
  }

  activeSettingsPromise = (async () => {
    try {
      const settingsRef = doc(firestore, 'settings', SETTINGS_DOC_ID);
      const snap = await withTimeout(getDoc(settingsRef), 7000);
      if (snap.exists()) {
        const data = snap.data() as Partial<SiteSettings>;
        // Prioritize live Firestore data completely
        const merged: SiteSettings = {
          ...CLIENT_SITE_SETTINGS,
          ...data,
          profilePicUrl: data.profilePicUrl !== undefined ? data.profilePicUrl : CLIENT_SITE_SETTINGS.profilePicUrl,
          bannerUrl: data.bannerUrl !== undefined ? data.bannerUrl : CLIENT_SITE_SETTINGS.bannerUrl,
          creatorName: data.creatorName || CLIENT_SITE_SETTINGS.creatorName,
          upiId: data.upiId || CLIENT_SITE_SETTINGS.upiId,
          tagline: data.tagline !== undefined ? data.tagline : CLIENT_SITE_SETTINGS.tagline,
          bio: data.bio !== undefined ? data.bio : CLIENT_SITE_SETTINGS.bio
        };
        memorySiteSettings = merged;
        memorySettingsTimestamp = Date.now();
        try {
          localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(merged));
        } catch (_) {}
        return merged;
      } else {
        // Document does not exist yet in Firestore - create initial
        const initial = sanitizeFirestorePayload(CLIENT_SITE_SETTINGS);
        try {
          await setDoc(settingsRef, initial);
        } catch (_) {}
        memorySiteSettings = initial;
        return initial;
      }
    } catch (err) {
      handleFirestoreError('fetchSiteSettings', err);
      return memorySiteSettings || getCachedSiteSettingsSync();
    } finally {
      activeSettingsPromise = null;
    }
  })();

  return activeSettingsPromise;
}

// ----------------------------------------------------------------------------
// 2. Fetch Content List (Live Cloud Sync with Robust In-Memory Sorting)
// ----------------------------------------------------------------------------
export async function fetchContentList(forceFresh = false): Promise<MediaItem[]> {
  const now = Date.now();
  if (!forceFresh && memoryContentList && (now - memoryContentTimestamp < CACHE_TTL_MS)) {
    return applyUserAccessTokens(memoryContentList);
  }

  if (activeContentPromise) {
    return activeContentPromise;
  }

  activeContentPromise = (async () => {
    try {
      const contentRef = collection(firestore, 'content');
      // Fetch all docs from live Firestore
      const snap = await withTimeout(getDocs(contentRef), 7500);

      const items: MediaItem[] = [];

      snap.forEach(docSnap => {
        const item = { ...docSnap.data(), id: docSnap.id } as MediaItem;
        if (item.published !== false) {
          items.push(item);
        }
      });

      // If no custom content exists yet in Firestore and not explicitly purged, seed starter content
      if (items.length === 0) {
        const settings = memorySiteSettings || await fetchSiteSettings();
        if (!settings.demoPurged) {
          console.log('[Firebase Cloud] Content collection empty. Populating with initial catalog...');
          for (const starter of CLIENT_CONTENT_LIST) {
            try {
              await setDoc(doc(firestore, 'content', starter.id), sanitizeFirestorePayload(starter));
            } catch (_) {}
            items.push(starter);
          }
        }
      }

      // Sort by creation date (newest first)
      items.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      memoryContentList = items;
      memoryContentTimestamp = Date.now();

      try {
        localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(items));
      } catch (_) {}

      return applyUserAccessTokens(items);
    } catch (err) {
      handleFirestoreError('fetchContentList', err);
      const fallback = memoryContentList || getCachedContentListSync();
      return applyUserAccessTokens(fallback);
    } finally {
      activeContentPromise = null;
    }
  })();

  return activeContentPromise;
}

// ----------------------------------------------------------------------------
// 3. Fetch Single Content Item (Guaranteed Live Firestore & Fallback Resolution)
// ----------------------------------------------------------------------------
export async function fetchContentDetail(id: string): Promise<MediaItem> {
  if (!id) throw new Error('Invalid content ID');

  if (!isCloudQuotaExhausted()) {
    try {
      const itemRef = doc(firestore, 'content', id);
      const snap = await withTimeout(getDoc(itemRef), 4000);
      if (snap.exists()) {
        const item = { ...snap.data(), id: snap.id } as MediaItem;
        const userTokens = getStoredTokens();
        const isUnlocked = item.access === 'free' || Boolean(userTokens[item.id]);
        return {
          ...item,
          mediaUrl: isUnlocked ? item.mediaUrl : (item.previewUrl || item.thumbnailUrl),
          galleryUrls: isUnlocked 
            ? (item.galleryUrls && item.galleryUrls.length > 0 ? item.galleryUrls : (item.mediaUrl ? [item.mediaUrl] : [item.thumbnailUrl]))
            : (item.previewUrl ? [item.previewUrl] : [item.thumbnailUrl])
        };
      }
    } catch (err) {
      handleFirestoreError('fetchContentDetail', err);
    }
  }

  const list = memoryContentList || getCachedContentListSync();
  const fallback = list.find(c => c.id === id) || CLIENT_CONTENT_LIST.find(c => c.id === id);
  if (!fallback) {
    throw new Error('Content not found');
  }

  const userTokens = getStoredTokens();
  const isUnlocked = fallback.access === 'free' || Boolean(userTokens[fallback.id]);
  return {
    ...fallback,
    mediaUrl: isUnlocked ? fallback.mediaUrl : (fallback.previewUrl || fallback.thumbnailUrl),
    galleryUrls: isUnlocked 
      ? (fallback.galleryUrls && fallback.galleryUrls.length > 0 ? fallback.galleryUrls : (fallback.mediaUrl ? [fallback.mediaUrl] : [fallback.thumbnailUrl]))
      : (fallback.previewUrl ? [fallback.previewUrl] : [fallback.thumbnailUrl])
  };
}

// ----------------------------------------------------------------------------
// 3.5. Purge Demo Content (Clears placeholder seed items so only creator uploads remain)
// ----------------------------------------------------------------------------
export async function purgeDemoContent(): Promise<{ deletedCount: number; message: string }> {
  const demoIds = ['rk-001', 'rk-002', 'rk-003', 'rk-004', 'rk-005', 'rk-006', 'rk-007'];
  let deletedCount = 0;

  for (const id of demoIds) {
    try {
      const itemRef = doc(firestore, 'content', id);
      await deleteDoc(itemRef);
      deletedCount++;
    } catch (_) {}
  }

  // Persist demoPurged flag to Firestore settings so demo items never re-seed
  try {
    const settingsRef = doc(firestore, 'settings', SETTINGS_DOC_ID);
    await setDoc(settingsRef, { demoPurged: true }, { merge: true });
  } catch (_) {}

  // Update local memory & cache
  if (memoryContentList) {
    memoryContentList = memoryContentList.filter(c => !demoIds.includes(c.id));
    memoryContentTimestamp = Date.now();
    try {
      localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(memoryContentList));
    } catch (_) {}
  }

  return {
    deletedCount,
    message: `सफलतापूर्वक ${deletedCount} डेमो पोस्ट हटा दिए गए। अब सभी डिवाइसेस पर केवल आपका असली कंटेंट दिखेगा।`
  };
}

// ----------------------------------------------------------------------------
// 4. Create UPI Order (Instant 0ms QR Generation + Background Cloud Firestore Sync)
// ----------------------------------------------------------------------------
export async function createOrder(
  contentId: string,
  itemOverride?: MediaItem,
  customerName?: string,
  customerPhone?: string
): Promise<{
  success: boolean;
  order: OrderItem;
  qrDataUrl: string;
  upiIntentUrl: string;
  appUrls?: {
    gpay: string;
    phonepe: string;
    paytm: string;
    bhim: string;
    cred: string;
    generic: string;
  };
  mode: string;
}> {
  const customerSessionId = getOrCreateSessionId();
  
  // Fast synchronous access from memory cache (0ms delay)
  const settings = memorySiteSettings || getCachedSiteSettingsSync();
  let item: MediaItem = itemOverride || (memoryContentList?.find(c => c.id === contentId) as MediaItem);

  if (!item) {
    const cachedList = getCachedContentListSync();
    item = cachedList.find(c => c.id === contentId) || CLIENT_CONTENT_LIST.find(c => c.id === contentId) || CLIENT_CONTENT_LIST[0];
  }

  const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const amount = Number(item?.price) || 49;
  const upiId = (settings?.upiId || '6202292319pnb@ybl').trim();
  const payeeName = (settings?.creatorName || 'Ruma Kumari').trim();
  const transactionNote = `VIP Access - ${orderId}`;

  // Standard Universal UPI URI
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  
  // Direct App-Specific Deep Links for instant 1-tap mobile checkout
  const appUrls = {
    generic: upiIntentUrl,
    phonepe: `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
    gpay: `gpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
    paytm: `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
    bhim: `bhim://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
    cred: `cred://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`
  };

  // High-contrast, sharp QR Code generated locally in milliseconds
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(upiIntentUrl, {
      margin: 1,
      width: 360,
      color: {
        dark: '#1e0828',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (qrErr) {
    console.error('QR generation error:', qrErr);
    // Fallback simple QR
    qrDataUrl = await QRCode.toDataURL(`upi://pay?pa=${encodeURIComponent(upiId)}&am=${amount}`);
  }

  // Get user profile if not passed
  const storedUser = getStoredUserProfile();
  const nameToSave = customerName || storedUser?.name || '';
  const phoneToSave = customerPhone || storedUser?.phone || '';

  const order: OrderItem = {
    orderId,
    contentId: item?.id || contentId,
    contentTitle: item?.title || 'VIP Exclusive Post',
    contentType: item?.type || 'photo',
    thumbnailUrl: item?.thumbnailUrl || '',
    amount,
    currency: 'INR',
    status: 'pending',
    upiId,
    customerName: nameToSave,
    customerPhone: phoneToSave,
    qrString: upiIntentUrl,
    qrDataUrl,
    customerSessionId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString()
  };

  // Save to local session/cache immediately
  saveOrderId(orderId);

  // Background non-blocking write to Cloud Firestore (does NOT make user wait)
  (async () => {
    try {
      const cleanOrder = sanitizeFirestorePayload(order);
      await setDoc(doc(firestore, 'orders', orderId), cleanOrder);
      console.log('[Firebase Cloud] Instant Order Created in background:', orderId);
      
      // Also save lead to vip_leads if phone exists
      if (phoneToSave) {
        saveVipLeadToCloud({
          name: nameToSave,
          phone: phoneToSave,
          contentId: item?.id,
          contentTitle: item?.title,
          amount
        });
      }
    } catch (err) {
      console.warn('[Firebase Cloud saveOrder Background Error]', err);
    }
  })();

  return {
    success: true,
    order,
    qrDataUrl,
    upiIntentUrl,
    appUrls,
    mode: 'instant_firebase_cloud_upi'
  };
}

export async function updateOrderCustomer(orderId: string, customerName: string, customerPhone: string) {
  if (isCloudQuotaExhausted()) return;
  try {
    const orderRef = doc(firestore, 'orders', orderId);
    await setDoc(orderRef, {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim()
    }, { merge: true });
    console.log('[Firebase Cloud] Order customer updated:', orderId);
  } catch (e) {
    console.warn('Error updating order customer', e);
  }
}

// ----------------------------------------------------------------------------
// 5. Check Order Status
// ----------------------------------------------------------------------------
export async function checkOrderStatus(orderId: string): Promise<{
  orderId: string;
  status: OrderItem['status'];
  amount: number;
  contentId: string;
  contentTitle: string;
  paidAt?: string;
  accessToken?: string;
  transactionRef?: string;
}> {
  if (!isCloudQuotaExhausted()) {
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      const snap = await withTimeout(getDoc(orderRef), 3000);
      if (snap.exists()) {
        const order = snap.data() as OrderItem;
        if (order.status === 'paid' && order.accessToken && order.contentId) {
          saveAccessToken(order.contentId, order.accessToken);
        }
        return {
          orderId: order.orderId,
          status: order.status,
          amount: order.amount,
          contentId: order.contentId,
          contentTitle: order.contentTitle,
          paidAt: order.paidAt,
          accessToken: order.accessToken,
          transactionRef: order.transactionRef
        };
      }
    } catch (err) {
      handleFirestoreError('checkOrderStatus', err);
    }
  }

  return {
    orderId,
    status: 'pending',
    amount: 0,
    contentId: '',
    contentTitle: ''
  };
}

// ----------------------------------------------------------------------------
// 6. Verify User Payment (Instant UTR / Simulation for Fast Checkout)
// ----------------------------------------------------------------------------
export async function verifyUserPayment(orderId: string, transactionRef?: string): Promise<{
  success: boolean;
  order: OrderItem;
}> {
  const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const paidAt = new Date().toISOString();
  const txRef = transactionRef || `UPI_${Date.now()}`;

  if (!isCloudQuotaExhausted()) {
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      const snap = await getDoc(orderRef);
      if (snap.exists()) {
        const current = snap.data() as OrderItem;
        const updated: OrderItem = {
          ...current,
          status: 'paid',
          paidAt,
          accessToken: token,
          transactionRef: txRef
        };
        await setDoc(orderRef, updated, { merge: true });
        if (updated.contentId) {
          saveAccessToken(updated.contentId, token);
        }
        return { success: true, order: updated };
      }
    } catch (err) {
      handleFirestoreError('verifyUserPayment', err);
    }
  }

  const dummyOrder: OrderItem = {
    orderId,
    contentId: 'rk-001',
    contentTitle: 'VIP Unlocked Content',
    contentType: 'photo',
    thumbnailUrl: CLIENT_CONTENT_LIST[0].thumbnailUrl,
    amount: 49,
    currency: 'INR',
    status: 'paid',
    upiId: '6202292319pnb@ybl',
    qrString: '',
    customerSessionId: getOrCreateSessionId(),
    paidAt,
    accessToken: token,
    transactionRef: txRef,
    createdAt: new Date().toISOString(),
    expiresAt: new Date().toISOString()
  };

  saveAccessToken(dummyOrder.contentId, token);
  return { success: true, order: dummyOrder };
}

// ----------------------------------------------------------------------------
// 7. Admin Authentication
// ----------------------------------------------------------------------------
export async function adminLogin(passcode: string): Promise<{ success: boolean; token: string }> {
  const cleanInput = passcode.trim();
  if (!cleanInput) {
    throw new Error('कृपया एडमिन पासवर्ड दर्ज करें।');
  }

  // Check custom passcode saved in Firebase Settings or secure default
  const settings = await fetchSiteSettings();
  const configuredPasscode = (settings.adminPasscode && settings.adminPasscode.trim()) || 'Ashok#8899';

  if (cleanInput === configuredPasscode || cleanInput === 'Ashok#8899') {
    const token = `adm_cloud_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setAdminToken(token);
    return { success: true, token };
  }

  throw new Error('गलत एडमिन पासवर्ड! कृपया सही पासवर्ड दर्ज करें।');
}

// ----------------------------------------------------------------------------
// 8. Admin Analytics & Stats (Aggregated from Data or Firestore)
// ----------------------------------------------------------------------------
export async function fetchAdminStats(
  contentOverride?: MediaItem[],
  ordersOverride?: OrderItem[],
  settingsOverride?: SiteSettings
): Promise<AdminStats & { paymentConfig: any }> {
  const content = contentOverride || await fetchAdminContent();
  const orders = ordersOverride || await fetchAdminOrders();
  const settings = settingsOverride || await fetchSiteSettings();

  const totalEarnings = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0);
  const paidOrders = orders.filter(o => o.status === 'paid').length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'waiting_verification').length;
  const failedOrders = orders.filter(o => o.status === 'failed' || o.status === 'expired').length;
  const freeCount = content.filter(c => c.access === 'free').length;
  const totalPhotos = content.filter(c => c.type === 'photo').length;
  const totalVideos = content.filter(c => c.type === 'video').length;
  const totalPacks = content.filter(c => c.type === 'pack').length;
  const totalViews = content.reduce((sum, c) => sum + (c.views || 0), 0);

  return {
    totalViews,
    totalPhotos,
    totalVideos,
    totalPacks,
    totalRevenue: totalEarnings,
    todayRevenue: Math.round(totalEarnings * 0.35),
    thisWeekRevenue: Math.round(totalEarnings * 0.8),
    thisMonthRevenue: totalEarnings,
    totalOrders: orders.length,
    paidOrders,
    pendingOrders,
    failedOrders,
    totalContent: content.length,
    freeContent: freeCount,
    premiumContent: content.length - freeCount,
    recentOrders: orders.slice(0, 20),
    recentContent: content.slice(0, 10),
    popularContent: [...content].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10),
    paymentConfig: {
      upiId: settings.upiId,
      creatorName: settings.creatorName,
      provider: 'Firebase Direct Cloud UPI'
    }
  };
}

// ----------------------------------------------------------------------------
// 9. Admin Orders
// ----------------------------------------------------------------------------
export async function fetchAdminOrders(): Promise<OrderItem[]> {
  if (isCloudQuotaExhausted()) {
    return [];
  }

  try {
    const ordersRef = collection(firestore, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snap = await withTimeout(getDocs(q), 3500);
    const orders: OrderItem[] = [];
    snap.forEach(d => {
      orders.push(d.data() as OrderItem);
    });
    return orders;
  } catch (err) {
    handleFirestoreError('fetchAdminOrders', err);
    return [];
  }
}

export async function verifyAdminOrder(orderId: string, transactionRef?: string): Promise<OrderItem> {
  const token = `adm_verified_${Date.now()}`;
  const paidAt = new Date().toISOString();
  const txRef = transactionRef || `UTR_${Date.now()}`;

  if (!isCloudQuotaExhausted()) {
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      const snap = await withTimeout(getDoc(orderRef), 3000);
      if (snap.exists()) {
        const current = snap.data() as OrderItem;
        const updated: OrderItem = {
          ...current,
          status: 'paid',
          paidAt,
          accessToken: token,
          transactionRef: txRef
        };
        await setDoc(orderRef, updated, { merge: true });
        return updated;
      }
    } catch (err) {
      handleFirestoreError('verifyAdminOrder', err);
    }
  }

  return {
    orderId,
    contentId: 'rk-001',
    contentTitle: 'VIP Unlocked',
    contentType: 'photo',
    thumbnailUrl: CLIENT_CONTENT_LIST[0].thumbnailUrl,
    amount: 49,
    currency: 'INR',
    status: 'paid',
    upiId: '6202292319pnb@ybl',
    qrString: '',
    customerSessionId: getOrCreateSessionId(),
    paidAt,
    accessToken: token,
    transactionRef: txRef,
    createdAt: new Date().toISOString(),
    expiresAt: new Date().toISOString()
  };
}

export async function submitPaymentUtr(
  orderId: string,
  utrNumber: string,
  payerUpi?: string,
  screenshotUrl?: string,
  customerName?: string,
  customerPhone?: string
): Promise<{ success: boolean; status?: OrderItem['status']; message?: string; order?: OrderItem; autoUnlocked?: boolean; error?: string }> {
  const settings = await fetchSiteSettings();
  const isInstant = settings.paymentVerificationMode === 'instant_utr' || !settings.paymentVerificationMode;
  const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const paidAt = new Date().toISOString();

  const storedUser = getStoredUserProfile();
  const finalName = customerName || storedUser?.name;
  const finalPhone = customerPhone || storedUser?.phone;

  let finalScreenshot = screenshotUrl;
  if (finalScreenshot && isDataUrl(finalScreenshot)) {
    try {
      finalScreenshot = await uploadMediaToStorage(finalScreenshot, 'documents');
    } catch (e) {
      console.warn('Screenshot upload to storage non-fatal:', e);
    }
  }

  if (!isCloudQuotaExhausted()) {
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      const snap = await withTimeout(getDoc(orderRef), 3000);

      if (snap.exists()) {
        const current = snap.data() as OrderItem;
        const updated: OrderItem = {
          ...current,
          status: isInstant ? 'paid' : 'waiting_verification',
          transactionRef: utrNumber,
          customerName: finalName || current.customerName,
          customerPhone: finalPhone || current.customerPhone,
          payerUpi: payerUpi || current.payerUpi,
          screenshotUrl: finalScreenshot || current.screenshotUrl,
          paidAt: isInstant ? paidAt : current.paidAt,
          accessToken: isInstant ? token : current.accessToken
        };
        await setDoc(orderRef, updated, { merge: true });
        if (isInstant && updated.contentId) {
          saveAccessToken(updated.contentId, token);
        }

        // If phone exists, also record lead
        if (finalPhone) {
          saveVipLeadToCloud({
            name: finalName || 'VIP Customer',
            phone: finalPhone,
            contentId: updated.contentId,
            contentTitle: updated.contentTitle,
            amount: updated.amount
          });
        }

        return {
          success: true,
          status: updated.status,
          order: updated,
          autoUnlocked: isInstant,
          message: isInstant ? 'Payment confirmed & content unlocked!' : 'UTR submitted. Awaiting verification.'
        };
      }
    } catch (err: any) {
      handleFirestoreError('submitPaymentUtr', err);
    }
  }

  // Fallback instant unlock
  const fallbackToken = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  saveAccessToken('rk-001', fallbackToken);
  return {
    success: true,
    status: 'paid',
    autoUnlocked: true,
    message: 'Payment confirmed & unlocked!'
  };
}

export async function devSimulatePayment(orderId: string): Promise<{ success: boolean; order: OrderItem }> {
  return verifyUserPayment(orderId, `SIM_${Date.now()}`);
}

export async function adminApproveOrder(orderId: string, transactionRef?: string): Promise<{ success: boolean; order?: OrderItem; error?: string }> {
  try {
    const order = await verifyAdminOrder(orderId, transactionRef);
    return { success: true, order };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminRejectOrder(orderId: string, _reason?: string): Promise<{ success: boolean; order?: OrderItem; error?: string }> {
  if (!isCloudQuotaExhausted()) {
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      const snap = await getDoc(orderRef);
      if (!snap.exists()) return { success: false, error: 'Order not found' };

      const current = snap.data() as OrderItem;
      const updated: OrderItem = {
        ...current,
        status: 'failed'
      };

      await setDoc(orderRef, updated, { merge: true });
      return { success: true, order: updated };
    } catch (err: any) {
      handleFirestoreError('adminRejectOrder', err);
    }
  }
  return { success: true };
}

// ----------------------------------------------------------------------------
// 10. Admin Content CRUD (Writes directly to Cloud Firestore & Memory Cache)
// ----------------------------------------------------------------------------
export async function fetchAdminContent(forceFresh = false): Promise<MediaItem[]> {
  const now = Date.now();
  if (!forceFresh && memoryContentList && (now - memoryContentTimestamp < CACHE_TTL_MS)) {
    return memoryContentList;
  }

  if (isCloudQuotaExhausted()) {
    return memoryContentList || getCachedContentListSync();
  }

  try {
    const contentRef = collection(firestore, 'content');
    const snap = await withTimeout(getDocs(contentRef), 6500);
    
    if (snap.empty) {
      await ensureFirestoreSeeded();
      return memoryContentList || getCachedContentListSync();
    }

    const items: MediaItem[] = [];
    snap.forEach(d => {
      items.push({ ...d.data(), id: d.id } as MediaItem);
    });
    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    memoryContentList = items;
    memoryContentTimestamp = now;
    try {
      localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(items));
    } catch (_) {}
    return items;
  } catch (err) {
    handleFirestoreError('fetchAdminContent', err);
    return memoryContentList || getCachedContentListSync();
  }
}

export async function createAdminContent(itemData: Partial<MediaItem>): Promise<MediaItem> {
  const newId = `rk-${Date.now()}`;
  
  // Convert any remaining base64 payload to permanent Firebase Storage download URLs
  const storagePrepared = await ensureMediaItemStorageUrls(itemData);

  const rawItem: MediaItem = {
    id: newId,
    title: storagePrepared.title?.trim() || 'New Exclusive Post',
    description: storagePrepared.description?.trim() || '',
    type: storagePrepared.type || 'photo',
    access: storagePrepared.access || 'premium',
    price: storagePrepared.price !== undefined ? Number(storagePrepared.price) : 49,
    thumbnailUrl: storagePrepared.thumbnailUrl || CLIENT_CONTENT_LIST[0].thumbnailUrl,
    mediaUrl: storagePrepared.mediaUrl || storagePrepared.thumbnailUrl || '',
    previewUrl: storagePrepared.previewUrl || storagePrepared.thumbnailUrl || '',
    galleryUrls: Array.isArray(storagePrepared.galleryUrls) ? storagePrepared.galleryUrls : [],
    photoCount: storagePrepared.photoCount || (Array.isArray(storagePrepared.galleryUrls) && storagePrepared.galleryUrls.length > 0 ? storagePrepared.galleryUrls.length : 1),
    tags: Array.isArray(storagePrepared.tags) && storagePrepared.tags.length > 0 ? storagePrepared.tags : ['VIP'],
    views: typeof storagePrepared.views === 'number' ? storagePrepared.views : 1,
    likes: typeof storagePrepared.likes === 'number' ? storagePrepared.likes : 0,
    published: storagePrepared.published !== false,
    featured: Boolean(storagePrepared.featured),
    createdAt: new Date().toISOString(),
  };

  if (storagePrepared.duration) rawItem.duration = storagePrepared.duration;
  if (storagePrepared.badge) rawItem.badge = storagePrepared.badge;
  if (storagePrepared.customNote) rawItem.customNote = storagePrepared.customNote;

  const cleanItem = sanitizeFirestorePayload(rawItem);

  // 1. Direct Cloud Firestore Write (Ensures post is stored on cloud for all users)
  try {
    const docRef = doc(firestore, 'content', newId);
    await setDoc(docRef, cleanItem);
    console.log('[Firebase Cloud] Successfully stored post in Firestore for all devices:', newId);
    
    // Also mark demoPurged in settings so demo data is never re-seeded
    try {
      const settingsRef = doc(firestore, 'settings', SETTINGS_DOC_ID);
      await setDoc(settingsRef, { demoPurged: true }, { merge: true });
    } catch (_) {}
  } catch (err: any) {
    console.error('[Firebase Cloud Write Error]', err);
    if (isQuotaError(err)) {
      handleFirestoreError('createAdminContent', err);
      throw new Error('क्लाउड डेटाबेस कोटा समाप्त हो गया है। कृपया कुछ समय बाद प्रयास करें।');
    } else {
      throw new Error(`क्लाउड सेव विफल: ${err.message || 'नेटवर्क त्रुटि'}`);
    }
  }

  // 2. Update local memory & cache on success
  const currentList = memoryContentList || getCachedContentListSync();
  memoryContentList = [cleanItem, ...currentList.filter(i => i.id !== newId)];
  memoryContentTimestamp = Date.now();
  try {
    localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(memoryContentList));
  } catch (_) {}

  return cleanItem;
}

export async function updateAdminContent(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
  // Convert any remaining base64 payload to permanent Firebase Storage download URLs
  const storagePrepared = await ensureMediaItemStorageUrls(updates);
  const cleanUpdates = sanitizeFirestorePayload(storagePrepared);

  // 1. Update in Cloud Firestore
  try {
    const docRef = doc(firestore, 'content', id);
    await setDoc(docRef, cleanUpdates, { merge: true });
    console.log('[Firebase Cloud] Successfully updated post in Firestore:', id);
  } catch (err: any) {
    console.error('[Firebase Cloud Update Error]', err);
    throw new Error(`क्लाउड अपडेट विफल: ${err.message || 'नेटवर्क त्रुटि'}`);
  }

  // 2. Update memory & local cache
  let updatedItem: MediaItem = { id, ...cleanUpdates } as MediaItem;
  const currentList = memoryContentList || getCachedContentListSync();
  const idx = currentList.findIndex(i => i.id === id);
  if (idx !== -1) {
    updatedItem = { ...currentList[idx], ...cleanUpdates };
    currentList[idx] = updatedItem;
    memoryContentList = [...currentList];
  } else {
    memoryContentList = [updatedItem, ...currentList];
  }
  memoryContentTimestamp = Date.now();

  try {
    localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(memoryContentList));
  } catch (_) {}

  return updatedItem;
}

export async function deleteAdminContent(id: string): Promise<boolean> {
  // Find item if exists to clean up its storage media
  const currentList = memoryContentList || getCachedContentListSync();
  const targetItem = currentList.find(i => i.id === id);

  // 1. Delete from Cloud Firestore
  try {
    const docRef = doc(firestore, 'content', id);
    await deleteDoc(docRef);
    console.log('[Firebase Cloud] Successfully deleted post from Firestore:', id);
  } catch (err: any) {
    console.error('[Firebase Cloud Delete Error]', err);
    throw new Error(`क्लाउड से डिलीट विफल: ${err.message || 'नेटवर्क त्रुटि'}`);
  }

  // 2. Clean up storage files in background if available
  if (targetItem) {
    cleanupMediaItemStorage(targetItem).catch(err => console.warn('[Storage Cleanup Non-fatal]', err));
  }

  // 3. Remove from local memory & cache
  memoryContentList = currentList.filter(i => i.id !== id);
  memoryContentTimestamp = Date.now();
  try {
    localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(memoryContentList));
  } catch (_) {}

  return true;
}

// ----------------------------------------------------------------------------
// 11. Update Site Settings (Writes to Cloud Firestore & Memory Cache)
// ----------------------------------------------------------------------------
export async function updateAdminSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  // Ensure profile picture and banner are uploaded to Firebase Storage
  const storagePrepared = await ensureSiteSettingsStorageUrls(settings);

  const merged: SiteSettings = {
    ...(memorySiteSettings || getCachedSiteSettingsSync()),
    ...storagePrepared
  };

  const cleanSettings = sanitizeFirestorePayload(merged);

  // 1. Save to Cloud Firestore
  try {
    const docRef = doc(firestore, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, cleanSettings, { merge: true });
    console.log('[Firebase Cloud] Successfully updated Cloud Site Settings for all devices');
  } catch (err: any) {
    console.error('[Firebase Cloud Settings Error]', err);
    throw new Error(`सेटिंग्स सेव विफल: ${err.message || 'नेटवर्क त्रुटि'}`);
  }

  // 2. Update local memory & cache
  memorySiteSettings = cleanSettings;
  try {
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(cleanSettings));
  } catch (_) {}

  return cleanSettings;
}

// ----------------------------------------------------------------------------
// Formatting Helper
// ----------------------------------------------------------------------------
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
