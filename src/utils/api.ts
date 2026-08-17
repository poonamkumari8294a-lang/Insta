import { MediaItem, OrderItem, SiteSettings, AdminStats } from '../types';

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

// API Fetchers
export async function fetchSiteSettings(): Promise<SiteSettings> {
  const res = await fetch('/api/site/settings');
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function fetchContentList(): Promise<MediaItem[]> {
  const tokens = Object.values(getStoredTokens()).join(',');
  const url = tokens ? `/api/content?tokens=${encodeURIComponent(tokens)}` : '/api/content';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch content');
  return res.json();
}

export async function fetchContentDetail(id: string): Promise<MediaItem> {
  const tokens = getStoredTokens();
  const token = tokens[id] || '';
  const url = token ? `/api/content/${id}?token=${encodeURIComponent(token)}` : `/api/content/${id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Content not found');
  return res.json();
}

export async function createOrder(contentId: string): Promise<{
  success: boolean;
  order: OrderItem;
  qrDataUrl: string;
  upiIntentUrl: string;
  mode: string;
}> {
  const customerSessionId = getOrCreateSessionId();
  const res = await fetch('/api/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentId, customerSessionId })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to create order');
  }

  const data = await res.json();
  saveOrderId(data.order.orderId);
  return data;
}

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
  const res = await fetch(`/api/orders/status/${orderId}`);
  if (!res.ok) throw new Error('Failed to check order status');
  const data = await res.json();

  if (data.status === 'paid' && data.accessToken && data.contentId) {
    saveAccessToken(data.contentId, data.accessToken);
  }

  return data;
}

export async function devSimulatePayment(orderId: string): Promise<{ success: boolean; order: OrderItem }> {
  const res = await fetch(`/api/payments/dev-verify/${orderId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactionRef: `SIM_${Date.now()}` })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Sandbox simulation failed');
  }

  const data = await res.json();
  if (data.order?.accessToken && data.order?.contentId) {
    saveAccessToken(data.order.contentId, data.order.accessToken);
  }
  return data;
}

// Admin API
export async function adminLogin(passcode: string): Promise<{ success: boolean; token: string }> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }

  const data = await res.json();
  setAdminToken(data.token);
  return data;
}

export async function fetchAdminStats(): Promise<AdminStats & { paymentConfig: any }> {
  const token = getAdminToken();
  const res = await fetch('/api/admin/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error('Unauthorized or failed to fetch admin stats');
  return res.json();
}

export async function fetchAdminOrders(): Promise<OrderItem[]> {
  const token = getAdminToken();
  const res = await fetch('/api/admin/orders', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function verifyAdminOrder(orderId: string, transactionRef?: string): Promise<OrderItem> {
  const token = getAdminToken();
  const res = await fetch(`/api/admin/orders/${orderId}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ transactionRef })
  });

  if (!res.ok) throw new Error('Failed to verify order');
  const data = await res.json();
  return data.order;
}

export async function fetchAdminContent(): Promise<MediaItem[]> {
  const token = getAdminToken();
  const res = await fetch('/api/admin/content', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error('Failed to fetch content');
  return res.json();
}

export async function createAdminContent(itemData: Partial<MediaItem>): Promise<MediaItem> {
  const token = getAdminToken();
  const res = await fetch('/api/admin/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(itemData)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create content');
  }

  return res.json();
}

export async function updateAdminContent(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
  const token = getAdminToken();
  const res = await fetch(`/api/admin/content/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });

  if (!res.ok) throw new Error('Failed to update content');
  return res.json();
}

export async function deleteAdminContent(id: string): Promise<boolean> {
  const token = getAdminToken();
  const res = await fetch(`/api/admin/content/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error('Failed to delete content');
  return true;
}

export async function updateAdminSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const token = getAdminToken();
  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(settings)
  });

  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

// Helpers
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
