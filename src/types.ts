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
  tags: string[];
  views: number;
  likes: number;
  duration?: string; // e.g. "0:45", "1:30"
  photoCount?: number; // for packs
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
  paymentVerificationMode?: 'manual_approval' | 'instant_utr';
  storyHighlights: StoryHighlight[];
  homepageConfig?: HomepageSectionConfig;
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
