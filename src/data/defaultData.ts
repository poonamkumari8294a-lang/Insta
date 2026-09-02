import { MediaItem, SiteSettings } from '../types';

export const CLIENT_SITE_SETTINGS: SiteSettings = {
  creatorName: 'Ruma Kumari',
  username: 'ruma_cutegirl_official',
  bio: 'Pretty mood always 💋 | Fitness, Lifestyle & Exclusive VIP Content',
  tagline: 'Unlock my private, uncut HD photos, backstage reels & VIP stories instantly.',
  profilePicUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=max&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=max&q=80',
  instagramUrl: 'https://instagram.com/ruma__cutegirl',
  instagramHandle: '@ruma__cuteg...',
  badgeText: 'VIP Creator',
  upiId: '6202292319pnb@ybl',
  postsCount: 135,
  followersCount: 3358,
  viewsCount: '346.0K',
  announcement: '✨ New VIP Backstage Reel is LIVE! Get 50% off this week only with instant UPI scan!',
  announcementEnabled: true,
  supportEmail: 'contact.rumakumari@gmail.com',
  supportTelegram: 'https://t.me/rumakumari_vip',
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
      coverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=max&q=80',
      items: [
        {
          id: 'story-1-1',
          url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=max&q=80',
          type: 'image',
          caption: 'Morning vibes ✨ pretty mood always'
        },
        {
          id: 'story-1-2',
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=max&q=80',
          type: 'image',
          caption: 'Special shoot day coming up! 📸'
        }
      ]
    },
    {
      id: 'highlight-2',
      title: 'back look',
      coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=max&q=80',
      items: [
        {
          id: 'story-2-1',
          url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=max&q=80',
          type: 'image',
          caption: 'Gym session progress 💪'
        }
      ]
    },
    {
      id: 'highlight-3',
      title: 'link 🔗',
      coverImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=max&q=80',
      items: [
        {
          id: 'story-3-1',
          url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=max&q=80',
          type: 'image',
          caption: 'Instant direct checkout on UPI! Tap below.'
        }
      ]
    },
    {
      id: 'highlight-4',
      title: '🥵 special',
      coverImage: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=max&q=80',
      items: [
        {
          id: 'story-4-1',
          url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=max&q=80',
          type: 'image',
          caption: 'VIP reel teaser 🔥 check latest upload'
        }
      ]
    }
  ]
};

export const CLIENT_CONTENT_LIST: MediaItem[] = [];

