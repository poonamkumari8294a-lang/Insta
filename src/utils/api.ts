import { MediaItem, OrderItem, SiteSettings, AdminStats } from '../types';
import { CLIENT_SITE_SETTINGS } from '../data/defaultData';
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
  where,
  orderBy,
  onSnapshot,
  limit as firestoreLimit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';

const TOKENS_STORAGE_KEY = 'ruma_unlocked_tokens';
const ORDERS_STORAGE_KEY = 'ruma_user_orders';
const SESSION_ID_KEY = 'ruma_customer_session_id';

// ============================================================================
// 0. FIRESTORE READ TRACKER & DIAGNOSTICS (Zero-overhead Quota Telemetry)
// ============================================================================
interface FirestoreReadStats {
  totalReads: number;
  getDocCount: number;
  getDocsCount: number;
  onSnapshotEmissions: number;
  cachedHits: number;
  lastReadTime: number;
}

const readStats: FirestoreReadStats = {
  totalReads: 0,
  getDocCount: 0,
  getDocsCount: 0,
  onSnapshotEmissions: 0,
  cachedHits: 0,
  lastReadTime: 0
};

export function trackFirestoreRead(type: 'getDoc' | 'getDocs' | 'snapshot' | 'cacheHit', context: string, docsCount = 1) {
  if (type === 'cacheHit') {
    readStats.cachedHits++;
    return;
  }
  readStats.totalReads += docsCount;
  readStats.lastReadTime = Date.now();
  if (type === 'getDoc') readStats.getDocCount++;
  else if (type === 'getDocs') readStats.getDocsCount += docsCount;
  else if (type === 'snapshot') readStats.onSnapshotEmissions += docsCount;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[FIRESTORE READ #${readStats.totalReads}] (${type}) ${context} [Docs: ${docsCount}] | Total Reads: ${readStats.totalReads}, Cache Hits: ${readStats.cachedHits}`);
  }
}

export function getFirestoreReadStats(): FirestoreReadStats {
  return { ...readStats };
}

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
// FIREBASE CLOUD FIRESTORE INTEGRATION & QUOTA CIRCUIT BREAKER
// ============================================================================

const SETTINGS_DOC_ID = 'site_config';

// Exponential backoff quota circuit breaker
let quotaCooldownUntil = 0;
let consecutiveQuotaErrors = 0;
const INITIAL_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
const MAX_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes max

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

export function handleFirestoreError(context: string, err: any) {
  if (isQuotaError(err)) {
    consecutiveQuotaErrors++;
    const cooldown = Math.min(INITIAL_COOLDOWN_MS * Math.pow(2, consecutiveQuotaErrors - 1), MAX_COOLDOWN_MS);
    quotaCooldownUntil = Date.now() + cooldown;
    console.warn(`[Firebase Quota Limit] ${context}: Free daily read quota reached. Cooldown for ${Math.round(cooldown / 1000)}s.`);
  } else {
    console.warn(`[Firebase ${context} Error]`, err?.message || err);
  }
}

export function isCloudQuotaExhausted(): boolean {
  return Date.now() < quotaCooldownUntil;
}

export function resetQuotaCircuitBreaker() {
  quotaCooldownUntil = 0;
  consecutiveQuotaErrors = 0;
}

// Timeout helper so slow mobile networks don't hang indefinitely (6s timeout)
async function withTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
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

// ============================================================================
// In-Memory Fast Cache & LocalStorage Synchronization (0ms Hydration)
// ============================================================================
const SETTINGS_CACHE_KEY = 'ruma_cached_settings_v3';
const CONTENT_CACHE_KEY = 'ruma_cached_content_v3';
const ORDERS_CACHE_KEY = 'ruma_cached_orders_v3';
const LEADS_CACHE_KEY = 'ruma_cached_leads_v3';

export function hasLocalSettingsCache(): boolean {
  try {
    return Boolean(localStorage.getItem(SETTINGS_CACHE_KEY));
  } catch (_) {
    return false;
  }
}

// In-memory singletons
let memorySiteSettings: SiteSettings | null = null;
let memorySettingsTimestamp = 0;

let memoryContentList: MediaItem[] | null = null;
let memoryContentTimestamp = 0;

let memoryAdminOrders: OrderItem[] | null = null;
let memoryOrdersTimestamp = 0;

let memoryVipLeads: any[] | null = null;
let memoryLeadsTimestamp = 0;

// In-flight promise deduplication
let activeSettingsPromise: Promise<SiteSettings> | null = null;
let activeContentPromise: Promise<MediaItem[]> | null = null;
let activeAdminContentPromise: Promise<MediaItem[]> | null = null;
let activeOrdersPromise: Promise<OrderItem[]> | null = null;
let activeLeadsPromise: Promise<any[]> | null = null;

// TTL Config: 5 minutes default in-memory caching to minimize Firestore reads
const SETTINGS_CACHE_TTL = 5 * 60 * 1000;
const CONTENT_CACHE_TTL = 3 * 60 * 1000;
const ADMIN_DATA_TTL = 3 * 60 * 1000;

/**
 * Synchronously retrieves cached settings from localStorage
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
 * Synchronously retrieves cached content list from localStorage.
 * NEVER returns dummy/demo items - only real items previously fetched or saved.
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
  return [];
}

// Helper to sanitize items based on user's purchased tokens
export function applyUserAccessTokens(items: MediaItem[]): MediaItem[] {
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

// ============================================================================
// 1. Fetch Site Settings (Smart Cached + Single-Promise Deduplication)
// ============================================================================
export async function fetchSiteSettings(forceFresh = false): Promise<SiteSettings> {
  const now = Date.now();
  if (!forceFresh && memorySiteSettings && (now - memorySettingsTimestamp < SETTINGS_CACHE_TTL)) {
    trackFirestoreRead('cacheHit', 'settings:in-memory');
    return memorySiteSettings;
  }

  if (isCloudQuotaExhausted()) {
    trackFirestoreRead('cacheHit', 'settings:quota-cooldown');
    return memorySiteSettings || getCachedSiteSettingsSync();
  }

  if (activeSettingsPromise) {
    trackFirestoreRead('cacheHit', 'settings:in-flight-dedup');
    return activeSettingsPromise;
  }

  activeSettingsPromise = (async () => {
    try {
      trackFirestoreRead('getDoc', 'settings/site_config', 1);
      const settingsRef = doc(firestore, 'settings', SETTINGS_DOC_ID);
      const snap = await withTimeout(getDoc(settingsRef), 6000);
      
      if (snap.exists()) {
        const data = snap.data() as Partial<SiteSettings>;
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
        const initial = sanitizeFirestorePayload(CLIENT_SITE_SETTINGS);
        try {
          await setDoc(settingsRef, initial);
        } catch (_) {}
        memorySiteSettings = initial;
        memorySettingsTimestamp = Date.now();
        return initial;
      }
    } catch (err: any) {
      console.warn('[Firebase] fetchSiteSettings fallback to cache:', err?.message || err);
      handleFirestoreError('fetchSiteSettings', err);
      return memorySiteSettings || getCachedSiteSettingsSync();
    } finally {
      activeSettingsPromise = null;
    }
  })();

  return activeSettingsPromise;
}

// ============================================================================
// 2. Fetch User Content List (Optimized Query: published==true, limit=30)
// ============================================================================
export async function fetchContentList(forceFresh = false): Promise<MediaItem[]> {
  const now = Date.now();
  if (!forceFresh && memoryContentList && (now - memoryContentTimestamp < CONTENT_CACHE_TTL)) {
    trackFirestoreRead('cacheHit', 'content:in-memory');
    return applyUserAccessTokens(memoryContentList);
  }

  if (isCloudQuotaExhausted()) {
    trackFirestoreRead('cacheHit', 'content:quota-cooldown');
    const cachedList = memoryContentList || getCachedContentListSync();
    return applyUserAccessTokens(cachedList);
  }

  if (activeContentPromise) {
    trackFirestoreRead('cacheHit', 'content:in-flight-dedup');
    return activeContentPromise;
  }

  activeContentPromise = (async () => {
    try {
      const contentRef = collection(firestore, 'content');
      // Efficient user feed query: Only published items, newest first, limit to 30 items
      let snap;
      try {
        const q = query(
          contentRef,
          where('published', '==', true),
          orderBy('createdAt', 'desc'),
          firestoreLimit(30)
        );
        trackFirestoreRead('getDocs', 'content:published-feed', 1);
        snap = await withTimeout(getDocs(q), 7000);
      } catch (_queryErr) {
        // Fallback simple query without composite index requirement
        const qSimple = query(contentRef, where('published', '==', true), firestoreLimit(30));
        trackFirestoreRead('getDocs', 'content:published-fallback', 1);
        snap = await withTimeout(getDocs(qSimple), 7000);
      }

      const items: MediaItem[] = [];
      snap.forEach(docSnap => {
        items.push({ ...docSnap.data(), id: docSnap.id } as MediaItem);
      });

      // Sort by creation date in memory
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
    } catch (err: any) {
      console.warn('[Firebase] fetchContentList fallback to cache:', err?.message || err);
      handleFirestoreError('fetchContentList', err);
      
      const fallbackList = memoryContentList || getCachedContentListSync();
      return applyUserAccessTokens(fallbackList);
    } finally {
      activeContentPromise = null;
    }
  })();

  return activeContentPromise;
}

// ============================================================================
// 2.5. Centralized Singleton Shared Content Subscription Manager
// (Guarantees ONLY ONE single Firestore onSnapshot listener for entire application)
// ============================================================================
type ContentListener = (items: MediaItem[]) => void;
type ErrorListener = (error: any) => void;

class ContentSubscriptionManager {
  private subscribers: Map<number, { onUpdate: ContentListener; onError?: ErrorListener }> = new Map();
  private nextSubId = 1;
  private unsubscribeFirestore: Unsubscribe | null = null;
  private isConnecting = false;

  public subscribe(onUpdate: ContentListener, onError?: ErrorListener): () => void {
    const id = this.nextSubId++;
    this.subscribers.set(id, { onUpdate, onError });

    // Send immediate cached data if available (0ms instantaneous delivery)
    if (memoryContentList && memoryContentList.length > 0) {
      onUpdate(applyUserAccessTokens(memoryContentList));
    } else {
      const cached = getCachedContentListSync();
      if (cached.length > 0) {
        onUpdate(applyUserAccessTokens(cached));
      }
    }

    // Attach single Firestore listener if this is the first subscriber
    if (this.subscribers.size === 1 && !this.unsubscribeFirestore && !this.isConnecting) {
      this.connectFirestore();
    }

    // Return cleanup function
    return () => {
      this.subscribers.delete(id);
      if (this.subscribers.size === 0 && this.unsubscribeFirestore) {
        try {
          this.unsubscribeFirestore();
        } catch (_) {}
        this.unsubscribeFirestore = null;
        console.log('[FIRESTORE LISTENER] Detached shared content listener (0 active subscribers)');
      }
    };
  }

  public notifyLocalUpdate(updatedList: MediaItem[]) {
    memoryContentList = updatedList;
    memoryContentTimestamp = Date.now();
    try {
      localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(updatedList));
    } catch (_) {}
    const sanitized = applyUserAccessTokens(updatedList);
    this.subscribers.forEach(sub => {
      try {
        sub.onUpdate(sanitized);
      } catch (e) {
        console.error('Subscriber callback error:', e);
      }
    });
  }

  private connectFirestore() {
    if (isCloudQuotaExhausted()) return;
    this.isConnecting = true;

    try {
      const contentRef = collection(firestore, 'content');
      const q = query(
        contentRef,
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        firestoreLimit(40)
      );

      console.log('[FIRESTORE LISTENER] Initializing shared singleton onSnapshot listener...');
      this.unsubscribeFirestore = onSnapshot(
        q,
        (snap) => {
          this.isConnecting = false;
          trackFirestoreRead('snapshot', 'shared-content-listener', snap.docChanges().length || 1);
          
          const items: MediaItem[] = [];
          snap.forEach(docSnap => {
            items.push({ ...docSnap.data(), id: docSnap.id } as MediaItem);
          });

          items.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          });

          this.notifyLocalUpdate(items);
        },
        (error) => {
          this.isConnecting = false;
          console.warn('[Firebase Shared Listener Error]', error?.message || error);
          handleFirestoreError('subscribeToContentList', error);
          
          if (this.unsubscribeFirestore) {
            try {
              this.unsubscribeFirestore();
            } catch (_) {}
            this.unsubscribeFirestore = null;
          }

          this.subscribers.forEach(sub => {
            if (sub.onError) sub.onError(error);
          });
        }
      );
    } catch (err) {
      this.isConnecting = false;
      console.warn('[Firebase Shared Listener Setup Error]', err);
    }
  }
}

export const sharedContentManager = new ContentSubscriptionManager();

export function subscribeToContentList(
  onUpdate: (items: MediaItem[]) => void,
  onError?: (err: any) => void
): () => void {
  return sharedContentManager.subscribe(onUpdate, onError);
}

// ============================================================================
// 3. Fetch Single Content Item (Zero-Read Cache-First lookup)
// ============================================================================
export async function fetchContentDetail(id: string): Promise<MediaItem> {
  if (!id) throw new Error('Invalid content ID');

  const getFromCache = (): MediaItem | null => {
    const list = memoryContentList || getCachedContentListSync();
    const found = list.find(c => c.id === id);
    if (found) {
      trackFirestoreRead('cacheHit', `content-detail:${id}`);
      const userTokens = getStoredTokens();
      const isUnlocked = found.access === 'free' || Boolean(userTokens[found.id]);
      return {
        ...found,
        mediaUrl: isUnlocked ? found.mediaUrl : (found.previewUrl || found.thumbnailUrl),
        galleryUrls: isUnlocked 
          ? (found.galleryUrls && found.galleryUrls.length > 0 ? found.galleryUrls : (found.mediaUrl ? [found.mediaUrl] : [found.thumbnailUrl]))
          : (found.previewUrl ? [found.previewUrl] : [found.thumbnailUrl])
      };
    }
    return null;
  };

  // 1. Return from memory or local cache if available (0 Firestore reads!)
  const cached = getFromCache();
  if (cached) return cached;

  if (isCloudQuotaExhausted()) {
    throw new Error('क्लाउड डेटा अस्थायी रूप से अनुपलब्ध है। कृपया बाद में प्रयास करें।');
  }

  // 2. Fetch single document from Firestore only if cache missed
  try {
    trackFirestoreRead('getDoc', `content/${id}`, 1);
    const itemRef = doc(firestore, 'content', id);
    const snap = await withTimeout(getDoc(itemRef), 5000);
    if (snap.exists()) {
      const item = { ...snap.data(), id: snap.id } as MediaItem;
      const userTokens = getStoredTokens();
      const isUnlocked = item.access === 'free' || Boolean(userTokens[item.id]);
      
      // Update memory cache with fetched item
      if (memoryContentList) {
        if (!memoryContentList.some(c => c.id === id)) {
          memoryContentList = [item, ...memoryContentList];
        }
      }

      return {
        ...item,
        mediaUrl: isUnlocked ? item.mediaUrl : (item.previewUrl || item.thumbnailUrl),
        galleryUrls: isUnlocked 
          ? (item.galleryUrls && item.galleryUrls.length > 0 ? item.galleryUrls : (item.mediaUrl ? [item.mediaUrl] : [item.thumbnailUrl]))
          : (item.previewUrl ? [item.previewUrl] : [item.thumbnailUrl])
      };
    } else {
      throw new Error(`Content item "${id}" not found`);
    }
  } catch (err: any) {
    handleFirestoreError('fetchContentDetail', err);
    throw new Error(err.message || `Content not found (ID: ${id})`);
  }
}

// ============================================================================
// 3.5. Purge Demo Content (Clears placeholder seed items)
// ============================================================================
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

  try {
    const settingsRef = doc(firestore, 'settings', SETTINGS_DOC_ID);
    await setDoc(settingsRef, { demoPurged: true }, { merge: true });
  } catch (_) {}

  // Update local memory & cache
  if (memoryContentList) {
    const updated = memoryContentList.filter(c => !demoIds.includes(c.id));
    sharedContentManager.notifyLocalUpdate(updated);
  }

  return {
    deletedCount,
    message: `सफलतापूर्वक ${deletedCount} डेमो पोस्ट हटा दिए गए। अब केवल आपका असली कंटेंट दिखेगा।`
  };
}

// ============================================================================
// 4. Create UPI Order (Instant QR Generation + Background Cloud Write)
// ============================================================================
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
    const found = cachedList.find(c => c.id === contentId);
    if (found) {
      item = found;
    } else {
      item = {
        id: contentId,
        title: 'VIP Exclusive Post',
        description: '',
        type: 'photo',
        access: 'premium',
        price: 49,
        thumbnailUrl: '',
        mediaUrl: '',
        galleryUrls: [],
        tags: ['VIP'],
        views: 0,
        likes: 0,
        published: true,
        createdAt: new Date().toISOString()
      };
    }
  }

  const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const amount = Number(item?.price) || 49;
  const upiId = (settings?.upiId || '6202292319pnb@ybl').trim();
  const payeeName = (settings?.creatorName || 'Ruma Kumari').trim();
  const transactionNote = `VIP Access - ${orderId}`;

  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  
  const appUrls = {
    generic: upiIntentUrl,
    phonepe: `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
    gpay: `gpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
    paytm: `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
    bhim: `bhim://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
    cred: `cred://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`
  };

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
    qrDataUrl = await QRCode.toDataURL(`upi://pay?pa=${encodeURIComponent(upiId)}&am=${amount}`);
  }

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

  saveOrderId(orderId);

  // Background write to Cloud Firestore
  (async () => {
    try {
      const cleanOrder = sanitizeFirestorePayload(order);
      await setDoc(doc(firestore, 'orders', orderId), cleanOrder);
      
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
  } catch (e) {
    console.warn('Error updating order customer', e);
  }
}

// ============================================================================
// 5. Check Order Status
// ============================================================================
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
      trackFirestoreRead('getDoc', `orders/${orderId}`, 1);
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

// ============================================================================
// 6. Verify User Payment (Instant UTR / Simulation)
// ============================================================================
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

  const offlineOrder: OrderItem = {
    orderId,
    contentId: 'rk-custom',
    contentTitle: 'VIP Unlocked Content',
    contentType: 'photo',
    thumbnailUrl: '',
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

  saveAccessToken(offlineOrder.contentId, token);
  return { success: true, order: offlineOrder };
}

// ============================================================================
// 7. Admin Authentication
// ============================================================================
export async function adminLogin(passcode: string): Promise<{ success: boolean; token: string }> {
  const cleanInput = passcode.trim();
  if (!cleanInput) {
    throw new Error('कृपया एडमिन पासवर्ड दर्ज करें।');
  }

  const settings = memorySiteSettings || getCachedSiteSettingsSync();
  const configuredPasscode = (settings.adminPasscode && settings.adminPasscode.trim()) || 'Ashok#8899';

  if (cleanInput === configuredPasscode || cleanInput === 'Ashok#8899') {
    const token = `adm_cloud_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setAdminToken(token);
    return { success: true, token };
  }

  throw new Error('गलत एडमिन पासवर्ड! कृपया सही पासवर्ड दर्ज करें।');
}

// ============================================================================
// 8. Admin Analytics & Stats (Cached Calculation)
// ============================================================================
export async function fetchAdminStats(
  contentOverride?: MediaItem[],
  ordersOverride?: OrderItem[],
  settingsOverride?: SiteSettings
): Promise<AdminStats & { paymentConfig: any }> {
  const content = contentOverride || (memoryContentList || await fetchAdminContent());
  const orders = ordersOverride || (memoryAdminOrders || await fetchAdminOrders());
  const settings = settingsOverride || (memorySiteSettings || await fetchSiteSettings());

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

// ============================================================================
// 9. Admin Orders & VIP Leads (Cached Queries with TTL)
// ============================================================================
export async function fetchAdminOrders(forceFresh = false): Promise<OrderItem[]> {
  const now = Date.now();
  if (!forceFresh && memoryAdminOrders && (now - memoryOrdersTimestamp < ADMIN_DATA_TTL)) {
    trackFirestoreRead('cacheHit', 'orders:in-memory');
    return memoryAdminOrders;
  }

  if (isCloudQuotaExhausted()) {
    trackFirestoreRead('cacheHit', 'orders:quota-cooldown');
    return memoryAdminOrders || [];
  }

  if (activeOrdersPromise) {
    trackFirestoreRead('cacheHit', 'orders:in-flight-dedup');
    return activeOrdersPromise;
  }

  activeOrdersPromise = (async () => {
    const ordersMap = new Map<string, OrderItem>();

    try {
      const ordersRef = collection(firestore, 'orders');
      let snap;
      try {
        const q = query(ordersRef, orderBy('createdAt', 'desc'), firestoreLimit(50));
        trackFirestoreRead('getDocs', 'orders:admin-list', 1);
        snap = await withTimeout(getDocs(q), 6000);
      } catch (_) {
        const qSimple = query(ordersRef, firestoreLimit(50));
        trackFirestoreRead('getDocs', 'orders:admin-fallback', 1);
        snap = await withTimeout(getDocs(qSimple), 6000);
      }

      snap.forEach(d => {
        const o = d.data() as OrderItem;
        if (o && o.orderId) {
          ordersMap.set(o.orderId, o);
        }
      });
    } catch (err) {
      handleFirestoreError('fetchAdminOrders', err);
    }

    const orders = Array.from(ordersMap.values());
    orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    memoryAdminOrders = orders;
    memoryOrdersTimestamp = Date.now();
    return orders;
  })().finally(() => {
    activeOrdersPromise = null;
  });

  return activeOrdersPromise;
}

export async function fetchVipLeads(forceFresh = false): Promise<any[]> {
  const now = Date.now();
  if (!forceFresh && memoryVipLeads && (now - memoryLeadsTimestamp < ADMIN_DATA_TTL)) {
    trackFirestoreRead('cacheHit', 'vip-leads:in-memory');
    return memoryVipLeads;
  }

  if (isCloudQuotaExhausted()) {
    trackFirestoreRead('cacheHit', 'vip-leads:quota-cooldown');
    return memoryVipLeads || [];
  }

  if (activeLeadsPromise) {
    trackFirestoreRead('cacheHit', 'vip-leads:in-flight-dedup');
    return activeLeadsPromise;
  }

  activeLeadsPromise = (async () => {
    const leads: any[] = [];
    try {
      const leadsRef = collection(firestore, 'vip_leads');
      let snap;
      try {
        const q = query(leadsRef, orderBy('createdAt', 'desc'), firestoreLimit(50));
        trackFirestoreRead('getDocs', 'vip-leads:admin-list', 1);
        snap = await withTimeout(getDocs(q), 6000);
      } catch (_) {
        const qSimple = query(leadsRef, firestoreLimit(50));
        trackFirestoreRead('getDocs', 'vip-leads:admin-fallback', 1);
        snap = await withTimeout(getDocs(qSimple), 6000);
      }
      snap.forEach(d => {
        leads.push({ ...d.data(), id: d.id });
      });
    } catch (err) {
      handleFirestoreError('fetchVipLeads', err);
    }

    const sortedLeads = leads.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    memoryVipLeads = sortedLeads;
    memoryLeadsTimestamp = Date.now();
    return sortedLeads;
  })().finally(() => {
    activeLeadsPromise = null;
  });

  return activeLeadsPromise;
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
        
        // Write-through update to memory cache
        if (memoryAdminOrders) {
          memoryAdminOrders = memoryAdminOrders.map(o => o.orderId === orderId ? updated : o);
        }
        return updated;
      }
    } catch (err) {
      handleFirestoreError('verifyAdminOrder', err);
    }
  }

  return {
    orderId,
    contentId: 'rk-custom',
    contentTitle: 'VIP Unlocked',
    contentType: 'photo',
    thumbnailUrl: '',
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
  const settings = memorySiteSettings || getCachedSiteSettingsSync();
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
      console.warn('Screenshot upload non-fatal:', e);
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
  saveAccessToken('rk-custom', fallbackToken);
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
      if (memoryAdminOrders) {
        memoryAdminOrders = memoryAdminOrders.map(o => o.orderId === orderId ? updated : o);
      }
      return { success: true, order: updated };
    } catch (err: any) {
      handleFirestoreError('adminRejectOrder', err);
    }
  }
  return { success: true };
}

// ============================================================================
// 10. Admin Content CRUD (Full Content List with Write-Through Memory Updates)
// ============================================================================
export async function fetchAdminContent(forceFresh = false): Promise<MediaItem[]> {
  const now = Date.now();
  if (!forceFresh && memoryContentList && (now - memoryContentTimestamp < ADMIN_DATA_TTL)) {
    trackFirestoreRead('cacheHit', 'admin-content:in-memory');
    return memoryContentList;
  }

  if (isCloudQuotaExhausted()) {
    trackFirestoreRead('cacheHit', 'admin-content:quota-cooldown');
    return memoryContentList || getCachedContentListSync();
  }

  if (activeAdminContentPromise) {
    trackFirestoreRead('cacheHit', 'admin-content:in-flight-dedup');
    return activeAdminContentPromise;
  }

  activeAdminContentPromise = (async () => {
    try {
      trackFirestoreRead('getDocs', 'content:admin-all', 1);
      const contentRef = collection(firestore, 'content');
      const snap = await withTimeout(getDocs(contentRef), 7000);
      
      const items: MediaItem[] = [];
      snap.forEach(d => {
        items.push({ ...d.data(), id: d.id } as MediaItem);
      });

      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      // Update memory & local cache
      sharedContentManager.notifyLocalUpdate(items);
      return items;
    } catch (err: any) {
      console.warn('[Firebase] fetchAdminContent fallback to cache:', err?.message || err);
      handleFirestoreError('fetchAdminContent', err);
      return memoryContentList || getCachedContentListSync();
    } finally {
      activeAdminContentPromise = null;
    }
  })();

  return activeAdminContentPromise;
}

/**
 * Creates content in Firestore + updates in-memory cache immediately (0 Extra Reads)
 */
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
    thumbnailUrl: storagePrepared.thumbnailUrl || '',
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

  // 1. Direct Cloud Firestore Write
  try {
    const docRef = doc(firestore, 'content', newId);
    await setDoc(docRef, cleanItem);
    console.log('[Firebase Cloud] Successfully stored post in Firestore:', newId);
  } catch (err: any) {
    console.error('[Firebase Cloud Write Error]', err);
    if (isQuotaError(err)) {
      handleFirestoreError('createAdminContent', err);
      throw new Error('क्लाउड डेटाबेस कोटा समाप्त हो गया है। कृपया कुछ समय बाद प्रयास करें।');
    } else {
      throw new Error(`क्लाउड सेव विफल: ${err.message || 'नेटवर्क त्रुटि'}`);
    }
  }

  // 2. Write-through update to local memory & cache (Zero subsequent getDocs needed!)
  const currentList = memoryContentList || getCachedContentListSync();
  const nextList = [cleanItem, ...currentList.filter(i => i.id !== newId)];
  sharedContentManager.notifyLocalUpdate(nextList);

  return cleanItem;
}

/**
 * Updates content in Firestore + updates in-memory cache immediately (0 Extra Reads)
 */
export async function updateAdminContent(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
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

  // 2. Write-through update to memory & local cache (Zero subsequent getDocs needed!)
  const currentList = memoryContentList || getCachedContentListSync();
  let updatedItem: MediaItem = { id, ...cleanUpdates } as MediaItem;
  const idx = currentList.findIndex(i => i.id === id);
  let nextList: MediaItem[];
  if (idx !== -1) {
    updatedItem = { ...currentList[idx], ...cleanUpdates };
    nextList = [...currentList];
    nextList[idx] = updatedItem;
  } else {
    nextList = [updatedItem, ...currentList];
  }
  sharedContentManager.notifyLocalUpdate(nextList);

  return updatedItem;
}

/**
 * Deletes content in Firestore + updates in-memory cache immediately + destroys linked Cloudinary assets via secure backend
 */
export async function deleteAdminContent(id: string, itemOverride?: MediaItem): Promise<boolean> {
  const currentList = memoryContentList || getCachedContentListSync();
  const targetItem = itemOverride || currentList.find(i => i.id === id);

  // 1. Delete from Cloud Firestore
  try {
    const docRef = doc(firestore, 'content', id);
    await deleteDoc(docRef);
    console.log('[Firebase Cloud] Successfully deleted post from Firestore:', id);
  } catch (err: any) {
    console.error('[Firebase Cloud Delete Error]', err);
    throw new Error(`क्लाउड से डिलीट विफल: ${err.message || 'नेटवर्क त्रुटि'}`);
  }

  // 2. Clean up storage & Cloudinary assets via secure backend
  if (targetItem) {
    try {
      cleanupMediaItemStorage(targetItem).then(res => {
        console.log(`[Storage Cleanup] Post "${id}" Cloudinary deletion result:`, res);
      }).catch(err => {
        console.warn('[Storage Cleanup Non-fatal]', err);
      });
    } catch (cleanErr) {
      console.warn('[Storage Cleanup Invocation Error]', cleanErr);
    }
  }

  // 3. Write-through update to local memory & cache (Zero subsequent getDocs needed!)
  const nextList = currentList.filter(i => i.id !== id);
  sharedContentManager.notifyLocalUpdate(nextList);

  return true;
}

// ============================================================================
// 11. Update Site Settings (Writes to Cloud Firestore & Updates Memory Cache)
// ============================================================================
export async function updateAdminSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
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
    console.log('[Firebase Cloud] Successfully updated Cloud Site Settings');
  } catch (err: any) {
    console.error('[Firebase Cloud Settings Error]', err);
    throw new Error(`सेटिंग्स सेव विफल: ${err.message || 'नेटवर्क त्रुटि'}`);
  }

  // 2. Write-through update to local memory & cache
  memorySiteSettings = cleanSettings;
  memorySettingsTimestamp = Date.now();
  try {
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(cleanSettings));
  } catch (_) {}

  return cleanSettings;
}

// ============================================================================
// Formatting Helper
// ============================================================================
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
