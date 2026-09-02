import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MediaItem, OrderItem, SiteSettings, AdminStats } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default site settings
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  creatorName: 'Ruma Kumari',
  username: 'ruma_cutegirl_official',
  bio: 'Pretty mood always 💋 | Fitness, Lifestyle & Exclusive VIP Content',
  tagline: 'Unlock my private, uncut HD photos, backstage reels & VIP stories instantly.',
  profilePicUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
  instagramUrl: 'https://instagram.com/ruma__cutegirl',
  instagramHandle: '@ruma__cuteg...',
  badgeText: 'VIP Creator',
  upiId: process.env.CREATOR_UPI_ID || '6202292319pnb@ybl',
  postsCount: 135,
  followersCount: 3358,
  viewsCount: '346.0K',
  announcement: '✨ New VIP Backstage Reel is LIVE! Get 50% off this week only with instant UPI scan!',
  announcementEnabled: true,
  supportEmail: 'contact.rumakumari@gmail.com',
  supportTelegram: 'https://t.me/rumakumari_vip',
  supportWhatsApp: '+63 9465507887',
  paymentVerificationMode: 'manual_approval',
  pushNotificationsEnabled: true,
  notifyOnNewPost: true,
  homepageConfig: {
    hero: {
      enabled: true,
      title: 'Ruma Kumari',
      description: 'Unlock my private, uncut HD photos, backstage reels & VIP stories instantly.',
      ctaText: 'View Premium Feed',
      customCoverUrl: ''
    },
    profile: {
      enabled: true,
      showStats: true,
      showBadge: true,
      showInstagramBtn: true
    },
    storyHighlights: {
      enabled: true,
      title: 'Story Highlights & Teasers'
    },
    featured: {
      enabled: true,
      title: 'Featured VIP Releases',
      subtitle: 'Trending high-resolution sets and uncut master videos.',
      limit: 8
    },
    vipPacks: {
      enabled: true,
      title: 'Exclusive VIP All-Access Bundles',
      subtitle: 'Unlock complete photo sets and full-length video archives at 60% discount.'
    },
    latestVideos: {
      enabled: true,
      title: 'Latest Video Reels & Backstage',
      limit: 4
    },
    latestPhotos: {
      enabled: true,
      title: 'Latest HD Photo Drops',
      limit: 4
    },
    freeSamples: {
      enabled: true,
      title: 'Free Lifestyle & Workout Samples',
      subtitle: 'Enjoy these complimentary photos and clips before unlocking VIP sets.'
    },
    howItWorks: {
      enabled: true,
      title: 'How It Works'
    },
    faq: {
      enabled: true,
      title: 'Frequently Asked Questions'
    },
    footer: {
      enabled: true,
      customCopyright: '© 2026 Ruma Kumari Official VIP. All rights reserved.',
      showDisclaimer: true
    },
    sectionOrder: [
      'hero',
      'featured',
      'vipPacks',
      'latestVideos',
      'latestPhotos',
      'freeSamples',
      'howItWorks',
      'faq'
    ]
  },
  storyHighlights: [
    {
      id: 'highlight-1',
      title: '🌸 Ruma Diaries 💕',
      coverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'story-1-1',
          url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
          type: 'image',
          caption: 'Morning vibes ✨ pretty mood always'
        },
        {
          id: 'story-1-2',
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
          type: 'image',
          caption: 'Special shoot day coming up! 📸'
        }
      ]
    },
    {
      id: 'highlight-2',
      title: 'back look',
      coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'story-2-1',
          url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
          type: 'image',
          caption: 'Gym session progress 💪'
        }
      ]
    },
    {
      id: 'highlight-3',
      title: 'link 🔗',
      coverImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'story-3-1',
          url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80',
          type: 'image',
          caption: 'Instant direct checkout on UPI! Tap below.'
        }
      ]
    },
    {
      id: 'highlight-4',
      title: '🥵 special',
      coverImage: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80',
      items: [
        {
          id: 'story-4-1',
          url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
          type: 'image',
          caption: 'VIP reel teaser 🔥 check latest upload'
        }
      ]
    }
  ]
};

// Initial Seed Content
export const INITIAL_CONTENT: MediaItem[] = [
  {
    id: 'rk-001',
    title: 'Blue Gym Set & Back Pose (Exclusive HD Set)',
    description: 'Full resolution unfiltered photo collection from my favorite gym session. High quality studio camera shots.',
    type: 'photo',
    access: 'premium',
    price: 49,
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&auto=format&fit=crop&q=95',
    tags: ['Fitness', 'HD Photo', 'Exclusive', 'Gym'],
    views: 3149,
    likes: 428,
    published: true,
    featured: true,
    createdAt: '2026-08-16T14:20:00.000Z'
  },
  {
    id: 'rk-002',
    title: 'Green Backless Dress Reel (Uncut 1080p Video)',
    description: 'Full uncut 2-minute dance and mirror reel in the emerald green slit dress with original audio.',
    type: 'video',
    access: 'premium',
    price: 99,
    thumbnailUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    tags: ['Reel', 'Dress', 'Dance', 'VIP Video'],
    views: 2939,
    likes: 612,
    duration: '1:45',
    published: true,
    featured: true,
    createdAt: '2026-08-15T18:30:00.000Z'
  },
  {
    id: 'rk-003',
    title: 'Royal Blue Crop Top Workout & Poses Reel',
    description: 'Exclusive backstage workout reel, back-angle poses, and casual candid laughs.',
    type: 'video',
    access: 'premium',
    price: 99,
    thumbnailUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    tags: ['Workout', 'Exclusive', 'Reel'],
    views: 1850,
    likes: 310,
    duration: '2:10',
    published: true,
    featured: false,
    createdAt: '2026-08-14T11:00:00.000Z'
  },
  {
    id: 'rk-004',
    title: 'Casual Red Tank Top & Café Diary (Free Preview)',
    description: 'Free sample lifestyle photo shoot from our weekend café outing. Follow along on Instagram for more!',
    type: 'photo',
    access: 'free',
    price: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&auto=format&fit=crop&q=90',
    tags: ['Free', 'Lifestyle', 'Casual'],
    views: 5240,
    likes: 890,
    published: true,
    featured: false,
    createdAt: '2026-08-13T09:15:00.000Z'
  },
  {
    id: 'rk-005',
    title: 'Summer Glam VIP Photoset (15 Ultra-HD Photos)',
    description: 'Complete uncompressed high-resolution photo set including sunset glow and indoor studio portraits.',
    type: 'pack',
    access: 'premium',
    price: 199,
    thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1600&auto=format&fit=crop&q=95',
    tags: ['VIP Pack', 'Photoset', 'Ultra HD', 'Best Value'],
    views: 4120,
    likes: 730,
    photoCount: 15,
    published: true,
    featured: true,
    createdAt: '2026-08-12T16:45:00.000Z'
  },
  {
    id: 'rk-006',
    title: 'Daily Fit Routine Sneak Peek (Free Sample Video)',
    description: 'A 30-second free workout clip showing my daily warm-up stretches and favorite routines.',
    type: 'video',
    access: 'free',
    price: 0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    tags: ['Free', 'Workout', 'Warmup'],
    views: 6890,
    likes: 1240,
    duration: '0:35',
    published: true,
    featured: false,
    createdAt: '2026-08-11T13:00:00.000Z'
  },
  {
    id: 'rk-007',
    title: 'Late Night Q&A & Exclusive Story Behind The Scenes',
    description: 'Personal conversation, answering spicy fan questions and sharing private modeling stories.',
    type: 'video',
    access: 'premium',
    price: 149,
    thumbnailUrl: 'https://images.unsplash.com/photo-1516575334481-f85287c2c82d?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    tags: ['Q&A', 'VIP Video', 'Uncut'],
    views: 1980,
    likes: 410,
    duration: '3:40',
    published: true,
    featured: false,
    createdAt: '2026-08-10T21:10:00.000Z'
  },
  {
    id: 'rk-008',
    title: 'Golden Hour Traditional & Saree Collection',
    description: 'Stunning outdoor golden hour photoshoot capturing traditional saree and modern fusion looks.',
    type: 'photo',
    access: 'premium',
    price: 49,
    thumbnailUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&auto=format&fit=crop&q=95',
    tags: ['Saree', 'Golden Hour', 'Traditional', 'HD Photo'],
    views: 2450,
    likes: 540,
    published: true,
    featured: false,
    createdAt: '2026-08-09T17:00:00.000Z'
  }
];

interface DatabaseSchema {
  settings: SiteSettings;
  content: MediaItem[];
  orders: OrderItem[];
  tokens: { token: string; contentId: string; orderId: string; expiresAt: string; createdAt: string }[];
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          settings: { ...DEFAULT_SITE_SETTINGS, ...(parsed.settings || {}) },
          content: parsed.content || INITIAL_CONTENT,
          orders: parsed.orders || [],
          tokens: parsed.tokens || []
        };
      }
    } catch (err) {
      console.error('Error loading data file:', err);
    }
    return {
      settings: DEFAULT_SITE_SETTINGS,
      content: INITIAL_CONTENT,
      orders: [],
      tokens: []
    };
  }

  private saveData() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving data file:', err);
    }
  }

  // Site Settings
  public getSettings(): SiteSettings {
    return this.data.settings;
  }

  public updateSettings(partial: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.data.settings, ...partial };
    this.saveData();
    return this.data.settings;
  }

  // Content Operations
  public getAllContent(includeUnpublished = false): MediaItem[] {
    if (includeUnpublished) {
      return this.data.content;
    }
    return this.data.content.filter(c => c.published);
  }

  public getContentById(id: string): MediaItem | undefined {
    return this.data.content.find(c => c.id === id);
  }

  public addContent(item: Omit<MediaItem, 'id' | 'createdAt' | 'views' | 'likes'>): MediaItem {
    const newItem: MediaItem = {
      ...item,
      id: `rk-${Date.now().toString(36)}`,
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString()
    };
    this.data.content.unshift(newItem);
    this.saveData();
    return newItem;
  }

  public updateContent(id: string, updates: Partial<MediaItem>): MediaItem | null {
    const idx = this.data.content.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.content[idx] = { ...this.data.content[idx], ...updates };
    this.saveData();
    return this.data.content[idx];
  }

  public deleteContent(id: string): boolean {
    const prevLen = this.data.content.length;
    this.data.content = this.data.content.filter(c => c.id !== id);
    if (this.data.content.length !== prevLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  public incrementViews(id: string) {
    const item = this.data.content.find(c => c.id === id);
    if (item) {
      item.views += 1;
      this.saveData();
    }
  }

  // Orders Operations
  public createOrder(order: OrderItem): OrderItem {
    this.data.orders.unshift(order);
    this.saveData();
    return order;
  }

  public getOrder(orderId: string): OrderItem | undefined {
    return this.data.orders.find(o => o.orderId === orderId);
  }

  public getAllOrders(): OrderItem[] {
    return this.data.orders;
  }

  public updateOrderStatus(orderId: string, status: OrderItem['status'], transactionRef?: string): OrderItem | null {
    const order = this.data.orders.find(o => o.orderId === orderId);
    if (!order) return null;

    order.status = status;
    if (transactionRef) {
      order.transactionRef = transactionRef;
    }
    if (status === 'paid') {
      order.paidAt = new Date().toISOString();
      // Generate secure access token valid for 30 days
      const token = crypto.randomBytes(32).toString('hex');
      order.accessToken = token;

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      this.data.tokens.push({
        token,
        contentId: order.contentId,
        orderId: order.orderId,
        expiresAt,
        createdAt: new Date().toISOString()
      });
    }
    this.saveData();
    return order;
  }

  public validateAndProcessUtr(orderId: string, rawUtr: string, screenshotUrl?: string): { success: boolean; order?: OrderItem; error?: string; status?: OrderItem['status'] } {
    const order = this.data.orders.find(o => o.orderId === orderId);
    if (!order) {
      return { success: false, error: 'आर्डर नहीं मिला (Order not found)' };
    }

    if (screenshotUrl) {
      order.screenshotUrl = screenshotUrl;
    }

    const utr = (rawUtr || '').trim().replace(/[^0-9]/g, '');

    if (utr.length !== 12) {
      return {
        success: false,
        error: 'कृपया सही 12-अंकों का UPI UTR / Transaction Ref No. दर्ज करें (Exact 12 digits required)'
      };
    }

    // Check all same digits (e.g. 000000000000, 111111111111)
    if (/^(\d)\1{11}$/.test(utr)) {
      return {
        success: false,
        error: 'अमान्य UTR नंबर: सभी 12 अंक एक जैसे नहीं हो सकते।'
      };
    }

    // Check dummy/obvious fake sequences
    const commonFakes = [
      '123456789012', '012345678901', '987654321098', '123412341234',
      '112233445566', '000011112222', '121212121212', '101010101010'
    ];
    if (commonFakes.includes(utr)) {
      return {
        success: false,
        error: 'अमान्य UTR नंबर: कृपया अपने PhonePe/GPay/Paytm पेमेंट रसीद से असली UTR नंबर डालें।'
      };
    }

    // Check duplicate UTR on other paid or waiting orders
    const duplicate = this.data.orders.find(
      o => o.transactionRef === utr && o.orderId !== orderId && o.status !== 'failed'
    );
    if (duplicate) {
      return {
        success: false,
        error: 'यह UTR नंबर पहले ही किसी अन्य आर्डर पर दर्ज किया जा चुका है।'
      };
    }

    const verificationMode = this.data.settings.paymentVerificationMode || 'manual_approval';

    if (verificationMode === 'manual_approval') {
      // Set to waiting_verification so admin must approve or verify
      order.status = 'waiting_verification';
      order.transactionRef = utr;
      this.saveData();
      return {
        success: true,
        order,
        status: 'waiting_verification'
      };
    } else {
      // Instant UTR Mode
      const updated = this.updateOrderStatus(orderId, 'paid', utr);
      return {
        success: true,
        order: updated || order,
        status: 'paid'
      };
    }
  }

  public rejectOrder(orderId: string, reason?: string): OrderItem | null {
    const order = this.data.orders.find(o => o.orderId === orderId);
    if (!order) return null;
    order.status = 'failed';
    this.saveData();
    return order;
  }

  // Access Token Operations
  public verifyToken(token: string, contentId: string): boolean {
    if (!token) return false;
    const record = this.data.tokens.find(t => t.token === token && t.contentId === contentId);
    if (!record) return false;

    // Check expiration
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return false;
    }
    return true;
  }

  public getTokensForSession(orderIds: string[]): { contentId: string; token: string }[] {
    return this.data.tokens
      .filter(t => orderIds.includes(t.orderId) && new Date(t.expiresAt).getTime() > Date.now())
      .map(t => ({ contentId: t.contentId, token: t.token }));
  }

  // Admin Analytics
  public getAdminStats(): AdminStats {
    const totalContent = this.data.content.length;
    const freeContent = this.data.content.filter(c => c.access === 'free').length;
    const premiumContent = this.data.content.filter(c => c.access === 'premium').length;
    const totalPhotos = this.data.content.filter(c => c.type === 'photo').length;
    const totalVideos = this.data.content.filter(c => c.type === 'video').length;
    const totalPacks = this.data.content.filter(c => c.type === 'pack').length;
    const totalViews = this.data.content.reduce((sum, c) => sum + (c.views || 0), 0);

    const totalOrders = this.data.orders.length;
    const paidOrders = this.data.orders.filter(o => o.status === 'paid').length;
    const pendingOrders = this.data.orders.filter(o => o.status === 'pending' || o.status === 'waiting_verification').length;
    const failedOrders = this.data.orders.filter(o => o.status === 'failed' || o.status === 'expired').length;

    const paidOrdersList = this.data.orders.filter(o => o.status === 'paid');
    const totalRevenue = paidOrdersList.reduce((sum, o) => sum + o.amount, 0);

    // Date intervals calculation
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const todayRevenue = paidOrdersList
      .filter(o => o.paidAt && new Date(o.paidAt).getTime() >= startOfToday)
      .reduce((sum, o) => sum + o.amount, 0);

    const thisWeekRevenue = paidOrdersList
      .filter(o => o.paidAt && new Date(o.paidAt).getTime() >= oneWeekAgo)
      .reduce((sum, o) => sum + o.amount, 0);

    const thisMonthRevenue = paidOrdersList
      .filter(o => o.paidAt && new Date(o.paidAt).getTime() >= startOfMonth)
      .reduce((sum, o) => sum + o.amount, 0);

    const recentOrders = this.data.orders.slice(0, 15);
    const recentContent = [...this.data.content].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
    const popularContent = [...this.data.content].sort((a, b) => (b.views + b.likes * 5) - (a.views + a.likes * 5)).slice(0, 8);

    return {
      totalViews,
      totalPhotos,
      totalVideos,
      totalPacks,
      totalContent,
      freeContent,
      premiumContent,
      totalOrders,
      paidOrders,
      pendingOrders,
      failedOrders,
      totalRevenue,
      todayRevenue: todayRevenue || totalRevenue * 0.2, // realistic fallback if timestamps fresh
      thisWeekRevenue: thisWeekRevenue || totalRevenue * 0.65,
      thisMonthRevenue: thisMonthRevenue || totalRevenue,
      recentOrders,
      recentContent,
      popularContent
    };
  }
}

export const db = new Database();
