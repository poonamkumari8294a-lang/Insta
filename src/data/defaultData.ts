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
  supportWhatsApp: '+63 9465507887',
  paymentVerificationMode: 'manual_approval',
  pushNotificationsEnabled: true,
  notifyOnNewPost: true,
  vipPlans: [
    {
      id: 'plan-monthly',
      title: '1-Month VIP All-Access Pass',
      subtitle: '30 Days Instant Access to All VIP Photos & Reels',
      price: 199,
      originalPrice: 499,
      durationDays: 30,
      durationLabel: '30 Days Access',
      badge: 'POPULAR 🔥',
      popular: true,
      enabled: true,
      perks: [
        'All HD Photo Sets & Uncensored Albums',
        'Exclusive Video Reels & Backstage Clips',
        'Daily Reward Wheel Access',
        'Direct Creator WhatsApp Chat Support'
      ]
    },
    {
      id: 'plan-6months',
      title: '6-Month VIP Mega Pass',
      subtitle: '180 Days of Complete VIP Content + Future Drops',
      price: 499,
      originalPrice: 1299,
      durationDays: 180,
      durationLabel: '6 Months Access',
      badge: 'BEST VALUE ⚡',
      popular: false,
      enabled: true,
      perks: [
        'Unlimited Access to All VIP Media',
        'All Future Backstage Drops Included',
        '4K Ultra-HD Downloads Enabled',
        'Priority WhatsApp Chat Support',
        '3 Bonus Daily Wheel Spins'
      ]
    },
    {
      id: 'plan-lifetime',
      title: 'Lifetime VIP Royal All-Access',
      subtitle: 'Permanent 1-Click Access Forever (No Expiry)',
      price: 999,
      originalPrice: 2999,
      durationDays: 3650,
      durationLabel: 'Lifetime Access',
      badge: 'ROYAL VIP 👑',
      popular: false,
      enabled: true,
      perks: [
        'Permanent 1-Click Access Forever',
        'Every Current & Future Master Video/Album',
        'Personalized Welcome Note & Audio',
        'Zero Expiration / No Renewal Ever',
        'VIP Status Gold Badge'
      ]
    }
  ],
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

export const CLIENT_CONTENT_LIST: MediaItem[] = [
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

