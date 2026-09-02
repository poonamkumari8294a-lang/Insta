export type ContentType = 'photo' | 'video' | 'pack';
export type ContentAccess = 'free' | 'premium';
export type OrderStatus = 'pending' | 'waiting_verification' | 'paid' | 'failed' | 'expired';

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  access: ContentAccess;
  price: number; // In INR (₹)
  thumbnailUrl: string;
  mediaUrl: string; // Protected URL (served via API token or preview)
  previewUrl?: string; // Short teaser or watermarked sample
  galleryUrls?: string[]; // Array of photos for multi-photo sets and VIP albums
  tags: string[];
  views: number;
  likes: number;
  duration?: string; // e.g. "0:45", "1:30"
  photoCount?: number; // for packs / photo sets
  badge?: string;
  customNote?: string;
  published: boolean;
  featured?: boolean;
  createdAt: string;
}

export interface OrderItem {
  orderId: string;
  contentId: string;
  contentTitle: string;
  contentType: ContentType;
  thumbnailUrl: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  upiId: string;
  payerUpi?: string;
  customerName?: string;
  customerPhone?: string;
  transactionRef?: string;
  screenshotUrl?: string;
  qrString: string;
  qrDataUrl?: string;
  accessToken?: string;
  customerSessionId: string;
  createdAt: string;
  paidAt?: string;
  expiresAt: string;
}

export interface VipUserProfile {
  name: string;
  phone: string;
  email?: string;
  memberSince?: string;
  streakDays?: number;
  lastVisit?: string;
  unlockedCount?: number;
}

export interface VipLeadItem {
  id: string;
  userId?: string;
  username?: string;
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  profilePicUrl?: string;
  cloudinaryPublicId?: string;
  contentId?: string;
  contentTitle?: string;
  amount?: number;
  totalSpent?: number;
  unlockedCount?: number;
  unlockedIds?: string[];
  status?: 'active' | 'inactive' | 'banned' | 'free';
  vipStatus?: 'active' | 'free' | 'expired' | 'banned';
  tier?: string;
  notes?: string;
  bio?: string;
  createdAt: string;
  joinedAt?: string;
  lastActive?: string;
  source?: string;
}

export interface VipPlan {
  id: string;
  title: string;
  subtitle?: string;
  price: number; // in INR
  originalPrice: number; // in INR
  durationDays: number;
  durationLabel: string;
  badge?: string;
  perks: string[];
  popular?: boolean;
  enabled: boolean;
}

export interface StoryHighlight {
  id: string;
  title: string;
  coverImage: string;
  items: {
    id: string;
    url: string;
    type: 'image' | 'video';
    caption?: string;
  }[];
}

export interface HomepageSectionConfig {
  hero: { enabled: boolean; title?: string; description?: string; ctaText?: string; customCoverUrl?: string };
  profile: { enabled: boolean; showStats: boolean; showBadge: boolean; showInstagramBtn: boolean };
  storyHighlights: { enabled: boolean; title: string };
  featured: { enabled: boolean; title: string; subtitle: string; limit: number };
  vipPacks: { enabled: boolean; title: string; subtitle: string };
  latestVideos: { enabled: boolean; title: string; limit: number };
  latestPhotos: { enabled: boolean; title: string; limit: number };
  freeSamples: { enabled: boolean; title: string; subtitle: string };
  howItWorks: { enabled: boolean; title: string };
  faq: { enabled: boolean; title: string };
  footer: { enabled: boolean; customCopyright?: string; showDisclaimer: boolean };
  sectionOrder: string[];
}

export interface SiteSettings {
  creatorName: string;
  username: string;
  bio: string;
  tagline: string;
  profilePicUrl: string;
  bannerUrl: string;
  instagramUrl: string;
  instagramHandle: string;
  badgeText?: string;
  upiId: string;
  postsCount: number;
  followersCount: number;
  viewsCount: string;
  announcement: string;
  announcementEnabled: boolean;
  supportEmail: string;
  supportTelegram: string;
  supportWhatsApp?: string;
  paymentVerificationMode?: 'manual_approval' | 'instant_utr';
  adminPasscode?: string;
  vipPlans?: VipPlan[];
  storyHighlights: StoryHighlight[];
  homepageConfig?: HomepageSectionConfig;
  // Push Notification settings
  pushNotificationsEnabled?: boolean;
  notifyOnNewPost?: boolean;
  vapidKey?: string;
  demoPurged?: boolean;
  isSeeded?: boolean;
}

export interface NotificationToken {
  token: string;
  createdAt: string;
  updatedAt: string;
  platform: string;
  browser: string;
  enabled: boolean;
  userAgent?: string;
}

export interface SentNotificationLog {
  id: string;
  postId: string;
  title: string;
  body: string;
  image?: string;
  url: string;
  photoCount?: number;
  status: 'sent' | 'failed' | 'simulated';
  recipientCount: number;
  sentAt: string;
  error?: string;
}

export interface AdminStats {
  totalViews: number;
  totalPhotos: number;
  totalVideos: number;
  totalPacks: number;
  totalContent: number;
  freeContent: number;
  premiumContent: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  recentOrders: OrderItem[];
  recentContent?: MediaItem[];
  popularContent?: MediaItem[];
}
