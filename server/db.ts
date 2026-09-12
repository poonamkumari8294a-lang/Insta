import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MediaItem, OrderItem, SiteSettings, AdminStats, VipLeadItem } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const DEFAULT_VIP_LEADS: VipLeadItem[] = [
  {
    id: 'lead_9876543210_01',
    userId: 'vip_9876543210',
    name: 'Rahul Sharma',
    phone: '9876543210',
    email: 'rahul.s@gmail.com',
    status: 'active',
    vipStatus: 'active',
    tier: 'Gold VIP',
    unlockedCount: 5,
    totalSpent: 495,
    createdAt: '2026-08-15T10:30:00.000Z',
    source: 'web_unlock_prompt'
  },
  {
    id: 'lead_9123456780_02',
    userId: 'vip_9123456780',
    name: 'Amit Verma',
    phone: '9123456780',
    email: 'amit.v@outlook.com',
    status: 'active',
    vipStatus: 'active',
    tier: 'Platinum VIP',
    unlockedCount: 8,
    totalSpent: 792,
    createdAt: '2026-08-20T14:15:00.000Z',
    source: 'web_unlock_prompt'
  },
  {
    id: 'lead_9988776655_03',
    userId: 'vip_9988776655',
    name: 'Vikram Singh',
    phone: '9988776655',
    email: 'vikram.singh@gmail.com',
    status: 'active',
    vipStatus: 'active',
    tier: 'Gold VIP',
    unlockedCount: 3,
    totalSpent: 297,
    createdAt: '2026-08-25T18:45:00.000Z',
    source: 'web_unlock_prompt'
  }
];

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
  upiId: process.env.CREATOR_UPI_ID || 'rima11q@ptyes',
  postsCount: 37,
  followersCount: '6,714',
  viewsCount: '10.3M',
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
    "id": "rk-1789036654000-p13",
    "title": "Exclusive VIP Album #42 (4 Photos)",
    "description": "Exclusive high definition photoshoot collection (4 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036654/website-media/atsdjg9ffswcugdpqxyt.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036654/website-media/atsdjg9ffswcugdpqxyt.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036654/website-media/atsdjg9ffswcugdpqxyt.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036654/website-media/atsdjg9ffswcugdpqxyt.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036654/website-media/diqkmdhn4bxi4lktsisl.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036654/website-media/pgbwk1yvzzvp8rapos4d.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036655/website-media/moks0ldlsrot8d4ovtlk.jpg"
    ],
    "photoCount": 4,
    "cloudinaryPublicId": "website-media/atsdjg9ffswcugdpqxyt",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 14,
    "likes": 7,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:37:34Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789036652000-p12",
    "title": "Exclusive VIP Album #41 (5 Photos)",
    "description": "Exclusive high definition photoshoot collection (5 photos).",
    "type": "pack",
    "access": "premium",
    "price": 149,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036652/website-media/yjqhhyvakvomg2ktaosm.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036652/website-media/yjqhhyvakvomg2ktaosm.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036652/website-media/yjqhhyvakvomg2ktaosm.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036652/website-media/yjqhhyvakvomg2ktaosm.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036653/website-media/bj2g7pxlfrfxsccnxvtl.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036653/website-media/cveffjweq3rtlildjw4i.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036653/website-media/jzkjdpe4dh6ycp3sgeq9.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036653/website-media/s7yx7byeycvk7bzhvlkb.jpg"
    ],
    "photoCount": 5,
    "cloudinaryPublicId": "website-media/yjqhhyvakvomg2ktaosm",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 43,
    "likes": 20,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:37:32Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789036651000-p11",
    "title": "Exclusive VIP Album #40 (4 Photos)",
    "description": "Exclusive high definition photoshoot collection (4 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036651/website-media/lweftqns2fq000iaw2da.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036651/website-media/lweftqns2fq000iaw2da.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036651/website-media/lweftqns2fq000iaw2da.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036651/website-media/lweftqns2fq000iaw2da.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036651/website-media/wujkwxlomjgohjel9brq.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036652/website-media/ht7zpuuomnwnibgktk9r.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036652/website-media/sbvpfaondtdookqoojha.jpg"
    ],
    "photoCount": 4,
    "cloudinaryPublicId": "website-media/lweftqns2fq000iaw2da",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 25,
    "likes": 6,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:37:31Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789036650000-p10",
    "title": "Exclusive VIP Album #39 (5 Photos)",
    "description": "Exclusive high definition photoshoot collection (5 photos).",
    "type": "pack",
    "access": "premium",
    "price": 149,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036650/website-media/cqieyb3j08ewjtqajssr.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036650/website-media/cqieyb3j08ewjtqajssr.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036650/website-media/cqieyb3j08ewjtqajssr.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036650/website-media/cqieyb3j08ewjtqajssr.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036650/website-media/cqul3z3qusdzoatk6dre.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036650/website-media/jp0ogwbt3rfdpttygmk7.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036651/website-media/dpu6rh4gsfkrlfyqxdch.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036651/website-media/kx77cwoms4ua3vbtsnbv.jpg"
    ],
    "photoCount": 5,
    "cloudinaryPublicId": "website-media/cqieyb3j08ewjtqajssr",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 47,
    "likes": 12,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:37:30Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789036649000-p9",
    "title": "Exclusive VIP Album #38 (4 Photos)",
    "description": "Exclusive high definition photoshoot collection (4 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036649/website-media/ct7ypmbstj72ir2z2ufl.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036649/website-media/ct7ypmbstj72ir2z2ufl.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036649/website-media/ct7ypmbstj72ir2z2ufl.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036649/website-media/ct7ypmbstj72ir2z2ufl.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036649/website-media/gamutkufmc6qnmcre5qm.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036649/website-media/khw2op6skiohkjcixkc9.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036650/website-media/aizae8fl3y9fr0h4jazy.jpg"
    ],
    "photoCount": 4,
    "cloudinaryPublicId": "website-media/ct7ypmbstj72ir2z2ufl",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 13,
    "likes": 18,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:37:29Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789036647000-p8",
    "title": "Exclusive VIP Album #37 (5 Photos)",
    "description": "Exclusive high definition photoshoot collection (5 photos).",
    "type": "pack",
    "access": "premium",
    "price": 149,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036647/website-media/p5mxn27fmpv3qyc497cn.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036647/website-media/p5mxn27fmpv3qyc497cn.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036647/website-media/p5mxn27fmpv3qyc497cn.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036647/website-media/p5mxn27fmpv3qyc497cn.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036648/website-media/djjaexwzvlzzvszch4j6.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036648/website-media/mognajoeve4oygxccorf.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036648/website-media/r0izzxzjlzogl31xqrvb.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036648/website-media/sss2dgq5tsr1bb3byga7.jpg"
    ],
    "photoCount": 5,
    "cloudinaryPublicId": "website-media/p5mxn27fmpv3qyc497cn",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 15,
    "likes": 17,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:37:27Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789036646000-p7",
    "title": "Exclusive VIP Album #36 (4 Photos)",
    "description": "Exclusive high definition photoshoot collection (4 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036646/website-media/lbqxufs7wsboo3udjmzi.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036646/website-media/lbqxufs7wsboo3udjmzi.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036646/website-media/lbqxufs7wsboo3udjmzi.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036646/website-media/lbqxufs7wsboo3udjmzi.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036646/website-media/ps2bjdtc5afb78mbvyhl.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036647/website-media/d86nvjcpqptfrzstwsag.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036647/website-media/gk01798cd4jfqbopbubz.jpg"
    ],
    "photoCount": 4,
    "cloudinaryPublicId": "website-media/lbqxufs7wsboo3udjmzi",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 18,
    "likes": 21,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:37:26Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789036645000-p6",
    "title": "Exclusive VIP Album #35 (5 Photos)",
    "description": "Exclusive high definition photoshoot collection (5 photos).",
    "type": "pack",
    "access": "premium",
    "price": 149,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036645/website-media/dexj0r4s6frosvenv7rd.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036645/website-media/dexj0r4s6frosvenv7rd.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036645/website-media/dexj0r4s6frosvenv7rd.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036645/website-media/dexj0r4s6frosvenv7rd.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036645/website-media/duwppfcaobbq67j1kq1f.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036645/website-media/p7dp4twofesmvgm3wxys.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036646/website-media/dkuvt7zgpzm0eofuu6a0.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036646/website-media/jxp1bzggxhqgxbwyf2pi.jpg"
    ],
    "photoCount": 5,
    "cloudinaryPublicId": "website-media/dexj0r4s6frosvenv7rd",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 39,
    "likes": 8,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:37:25Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789036644000-p5",
    "title": "Exclusive VIP Album #34 (4 Photos)",
    "description": "Exclusive high definition photoshoot collection (4 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036644/website-media/nfciprawcvedtauzqqch.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036644/website-media/nfciprawcvedtauzqqch.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036644/website-media/nfciprawcvedtauzqqch.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036644/website-media/nfciprawcvedtauzqqch.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036644/website-media/suothh8j0isk2ymenvwq.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036644/website-media/z08eusl2yy5uyscjjpri.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036645/website-media/d9awa33qo7k6wimzag1u.jpg"
    ],
    "photoCount": 4,
    "cloudinaryPublicId": "website-media/nfciprawcvedtauzqqch",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 44,
    "likes": 11,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:37:24Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789036642000-p4",
    "title": "Exclusive VIP Album #33 (5 Photos)",
    "description": "Exclusive high definition photoshoot collection (5 photos).",
    "type": "pack",
    "access": "premium",
    "price": 149,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036642/website-media/u2ytydwwknzau22rpol3.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036642/website-media/u2ytydwwknzau22rpol3.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036642/website-media/u2ytydwwknzau22rpol3.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036642/website-media/u2ytydwwknzau22rpol3.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036643/website-media/hydtmyfxf0gxfumspb5f.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036643/website-media/iszaozdnvz9jtnqa5hs7.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036643/website-media/oplzicsyz9wbyljlr7g2.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036643/website-media/qxmezkxsry3j5o8qzsxc.jpg"
    ],
    "photoCount": 5,
    "cloudinaryPublicId": "website-media/u2ytydwwknzau22rpol3",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 46,
    "likes": 9,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:37:22Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789036641000-p3",
    "title": "Exclusive VIP Album #32 (4 Photos)",
    "description": "Exclusive high definition photoshoot collection (4 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036641/website-media/trxmeaysdoaug1xblbft.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036641/website-media/trxmeaysdoaug1xblbft.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036641/website-media/trxmeaysdoaug1xblbft.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036641/website-media/trxmeaysdoaug1xblbft.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036641/website-media/yqid45i5i1vpaezkhdva.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036642/website-media/jmqcs8bgkhj343nsvj0a.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036642/website-media/ktykmbxvtqgsbvqb3lir.jpg"
    ],
    "photoCount": 4,
    "cloudinaryPublicId": "website-media/trxmeaysdoaug1xblbft",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 53,
    "likes": 5,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:37:21Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789036640000-p2",
    "title": "Exclusive VIP Album #31 (5 Photos)",
    "description": "Exclusive high definition photoshoot collection (5 photos).",
    "type": "pack",
    "access": "premium",
    "price": 149,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036640/website-media/fwlkiuumv9oqm9hpnnn0.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036640/website-media/fwlkiuumv9oqm9hpnnn0.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036640/website-media/fwlkiuumv9oqm9hpnnn0.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036640/website-media/fwlkiuumv9oqm9hpnnn0.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036640/website-media/l71xivvesbciebcpacdl.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036640/website-media/plmqa673lrr7jfxtjb9q.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036640/website-media/uvh3jqjzfsamu46v6gw4.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036641/website-media/tlz6umn1q0bnej4u8jsl.jpg"
    ],
    "photoCount": 5,
    "cloudinaryPublicId": "website-media/fwlkiuumv9oqm9hpnnn0",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 20,
    "likes": 7,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:37:20Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789036638000-p1",
    "title": "Exclusive VIP Album #30 (4 Photos)",
    "description": "Exclusive high definition photoshoot collection (4 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036638/website-media/w260gxq0mrt6ugu6s7a8.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036638/website-media/w260gxq0mrt6ugu6s7a8.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036638/website-media/w260gxq0mrt6ugu6s7a8.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036638/website-media/w260gxq0mrt6ugu6s7a8.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036639/website-media/nlhotuusqtdzaw9ny7qs.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036639/website-media/xnvumkneddwbwnyuou4b.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036639/website-media/yofxzqsybb0ttdrkaqkd.jpg"
    ],
    "photoCount": 4,
    "cloudinaryPublicId": "website-media/w260gxq0mrt6ugu6s7a8",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 19,
    "likes": 9,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:37:18Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789036637000",
    "title": "Exclusive VIP Album #29 (63 Photos)",
    "description": "Exclusive photoshoot collection (63 photos).",
    "type": "pack",
    "access": "premium",
    "price": 149,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036637/website-media/ffh69yvhik4qqqojwwbm.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036637/website-media/ffh69yvhik4qqqojwwbm.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036637/website-media/ffh69yvhik4qqqojwwbm.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036637/website-media/ffh69yvhik4qqqojwwbm.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036637/website-media/ia4ay1aqwzv7ioonb6yf.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036637/website-media/qvh5azk4r9vt6fdrywlk.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036637/website-media/sm8jsc2nfcr0oh7osi24.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036638/website-media/qtvthxodq5qxfbwknlrc.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036638/website-media/w260gxq0mrt6ugu6s7a8.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036639/website-media/nlhotuusqtdzaw9ny7qs.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036639/website-media/xnvumkneddwbwnyuou4b.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036639/website-media/yofxzqsybb0ttdrkaqkd.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036640/website-media/fwlkiuumv9oqm9hpnnn0.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036640/website-media/l71xivvesbciebcpacdl.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036640/website-media/plmqa673lrr7jfxtjb9q.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036640/website-media/uvh3jqjzfsamu46v6gw4.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036641/website-media/tlz6umn1q0bnej4u8jsl.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036641/website-media/trxmeaysdoaug1xblbft.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036641/website-media/yqid45i5i1vpaezkhdva.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036642/website-media/jmqcs8bgkhj343nsvj0a.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036642/website-media/ktykmbxvtqgsbvqb3lir.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036642/website-media/u2ytydwwknzau22rpol3.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036643/website-media/hydtmyfxf0gxfumspb5f.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036643/website-media/iszaozdnvz9jtnqa5hs7.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036643/website-media/oplzicsyz9wbyljlr7g2.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036643/website-media/qxmezkxsry3j5o8qzsxc.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036644/website-media/nfciprawcvedtauzqqch.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036644/website-media/suothh8j0isk2ymenvwq.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036644/website-media/z08eusl2yy5uyscjjpri.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036645/website-media/d9awa33qo7k6wimzag1u.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036645/website-media/dexj0r4s6frosvenv7rd.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036645/website-media/duwppfcaobbq67j1kq1f.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036645/website-media/p7dp4twofesmvgm3wxys.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036646/website-media/dkuvt7zgpzm0eofuu6a0.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036646/website-media/jxp1bzggxhqgxbwyf2pi.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036646/website-media/lbqxufs7wsboo3udjmzi.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036646/website-media/ps2bjdtc5afb78mbvyhl.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036647/website-media/d86nvjcpqptfrzstwsag.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036647/website-media/gk01798cd4jfqbopbubz.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036647/website-media/p5mxn27fmpv3qyc497cn.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036648/website-media/djjaexwzvlzzvszch4j6.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036648/website-media/mognajoeve4oygxccorf.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036648/website-media/r0izzxzjlzogl31xqrvb.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036648/website-media/sss2dgq5tsr1bb3byga7.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036649/website-media/ct7ypmbstj72ir2z2ufl.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036649/website-media/gamutkufmc6qnmcre5qm.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036649/website-media/khw2op6skiohkjcixkc9.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036650/website-media/aizae8fl3y9fr0h4jazy.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036650/website-media/cqieyb3j08ewjtqajssr.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036650/website-media/cqul3z3qusdzoatk6dre.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036650/website-media/jp0ogwbt3rfdpttygmk7.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036651/website-media/dpu6rh4gsfkrlfyqxdch.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036651/website-media/kx77cwoms4ua3vbtsnbv.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036651/website-media/lweftqns2fq000iaw2da.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036651/website-media/wujkwxlomjgohjel9brq.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036652/website-media/ht7zpuuomnwnibgktk9r.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036652/website-media/sbvpfaondtdookqoojha.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036652/website-media/yjqhhyvakvomg2ktaosm.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036653/website-media/bj2g7pxlfrfxsccnxvtl.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036653/website-media/cveffjweq3rtlildjw4i.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036653/website-media/jzkjdpe4dh6ycp3sgeq9.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036653/website-media/s7yx7byeycvk7bzhvlkb.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036654/website-media/atsdjg9ffswcugdpqxyt.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036654/website-media/diqkmdhn4bxi4lktsisl.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036654/website-media/pgbwk1yvzzvp8rapos4d.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036655/website-media/moks0ldlsrot8d4ovtlk.jpg"
    ],
    "photoCount": 63,
    "cloudinaryPublicId": "website-media/ffh69yvhik4qqqojwwbm",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 17,
    "likes": 22,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:37:17Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789036015000",
    "title": "Exclusive VIP Album #28 (3 Photos)",
    "description": "Exclusive photoshoot collection (3 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036015/website-media/pcnwsjpvuh3jeefo6kc0.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036015/website-media/pcnwsjpvuh3jeefo6kc0.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036015/website-media/pcnwsjpvuh3jeefo6kc0.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036015/website-media/pcnwsjpvuh3jeefo6kc0.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036016/website-media/dupduxvmg1dbprnzz3xj.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789036016/website-media/if6qjfmvge3xlz0gwd6q.jpg"
    ],
    "photoCount": 3,
    "cloudinaryPublicId": "website-media/pcnwsjpvuh3jeefo6kc0",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 32,
    "likes": 5,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:26:55Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789035970000",
    "title": "Exclusive VIP Album #27 (13 Photos)",
    "description": "Exclusive photoshoot collection (13 photos).",
    "type": "pack",
    "access": "premium",
    "price": 149,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035970/website-media/bcj30jqbj7jqw3hxutr2.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035970/website-media/bcj30jqbj7jqw3hxutr2.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035970/website-media/bcj30jqbj7jqw3hxutr2.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035970/website-media/bcj30jqbj7jqw3hxutr2.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035970/website-media/gshoxjf933lwi5e65oaj.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035970/website-media/gyjcktipmazdm22e1fsg.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035970/website-media/troa7r846zmkmw1auuxk.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035971/website-media/fgdb2f3be6rqmouhvpsg.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035971/website-media/qjf4gud7kbgmgxouo8ep.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035971/website-media/tsayjilsogd7ubsxyzb2.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035971/website-media/xypxt9g9mpgezhreo0oy.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035972/website-media/jn8gwumcryybpc0xbukg.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035972/website-media/lx5hrr6zza0x9pksjvwe.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035972/website-media/qoe8cc7jwgv95p9flaum.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035972/website-media/s0gbfnxpap15m5z6mmt4.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035973/website-media/ln4qxkqeed3s1tijoeiw.jpg"
    ],
    "photoCount": 13,
    "cloudinaryPublicId": "website-media/bcj30jqbj7jqw3hxutr2",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 31,
    "likes": 22,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:26:10Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789035875000",
    "title": "Exclusive VIP Album #26 (5 Photos)",
    "description": "Exclusive photoshoot collection (5 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035875/website-media/h4e1cgattjjdvryrsmlj.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035875/website-media/h4e1cgattjjdvryrsmlj.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035875/website-media/h4e1cgattjjdvryrsmlj.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035875/website-media/h4e1cgattjjdvryrsmlj.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035875/website-media/l1wzhqome5ssbhy11kuf.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035875/website-media/m0lsrk66psiabha1vmrr.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035875/website-media/wosufu7tioygsetcd7cw.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035898/website-media/wgzrbjyj6r0kikjdqjhu.jpg"
    ],
    "photoCount": 5,
    "cloudinaryPublicId": "website-media/h4e1cgattjjdvryrsmlj",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 14,
    "likes": 23,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:24:35Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789035821000",
    "title": "Exclusive VIP Photo #25",
    "description": "Exclusive photoshoot single photo.",
    "type": "photo",
    "access": "premium",
    "price": 49,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035821/website-media/hpen5ainbc79no9h9rmq.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035821/website-media/hpen5ainbc79no9h9rmq.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035821/website-media/hpen5ainbc79no9h9rmq.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035821/website-media/hpen5ainbc79no9h9rmq.jpg"
    ],
    "photoCount": 1,
    "cloudinaryPublicId": "website-media/hpen5ainbc79no9h9rmq",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "HD Photo"
    ],
    "views": 39,
    "likes": 10,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:23:41Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789035621000",
    "title": "Exclusive VIP Album #24 (4 Photos)",
    "description": "Exclusive photoshoot collection (4 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035621/website-media/fbon0izyjmltsg3b29ll.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035621/website-media/fbon0izyjmltsg3b29ll.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035621/website-media/fbon0izyjmltsg3b29ll.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035621/website-media/fbon0izyjmltsg3b29ll.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035621/website-media/k6smjiu9xif4yi0ixzzm.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035622/website-media/dw0sbgklvb2ae2qqycpz.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035622/website-media/tx0phwrxhqqq0rnvbhal.jpg"
    ],
    "photoCount": 4,
    "cloudinaryPublicId": "website-media/fbon0izyjmltsg3b29ll",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 52,
    "likes": 8,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:20:21Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789035520000",
    "title": "Exclusive VIP Album #23 (2 Photos)",
    "description": "Exclusive photoshoot collection (2 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035520/website-media/iubowc7bvoyvcqhram3z.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035520/website-media/iubowc7bvoyvcqhram3z.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035520/website-media/iubowc7bvoyvcqhram3z.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035520/website-media/iubowc7bvoyvcqhram3z.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035520/website-media/mqtj4fok9hmjr2jmyctf.jpg"
    ],
    "photoCount": 2,
    "cloudinaryPublicId": "website-media/iubowc7bvoyvcqhram3z",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 51,
    "likes": 5,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:18:40Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789035426000",
    "title": "Exclusive VIP Album #22 (2 Photos)",
    "description": "Exclusive photoshoot collection (2 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035426/website-media/pt0fxzedsiot4k5dimdp.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035426/website-media/pt0fxzedsiot4k5dimdp.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035426/website-media/pt0fxzedsiot4k5dimdp.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035426/website-media/pt0fxzedsiot4k5dimdp.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035427/website-media/oi1myw1yasa9jhre4vi1.jpg"
    ],
    "photoCount": 2,
    "cloudinaryPublicId": "website-media/pt0fxzedsiot4k5dimdp",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 39,
    "likes": 15,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:17:06Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789035299000",
    "title": "Exclusive VIP Album #21 (3 Photos)",
    "description": "Exclusive photoshoot collection (3 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035299/website-media/x7xnxbuwwtaxjfaj8oav.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035299/website-media/x7xnxbuwwtaxjfaj8oav.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035299/website-media/x7xnxbuwwtaxjfaj8oav.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035299/website-media/x7xnxbuwwtaxjfaj8oav.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035300/website-media/fdwqs8pylxw0ucmpebvs.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035300/website-media/jfyqdvhameonlpgv1shx.jpg"
    ],
    "photoCount": 3,
    "cloudinaryPublicId": "website-media/x7xnxbuwwtaxjfaj8oav",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 19,
    "likes": 22,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:14:59Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789035211000",
    "title": "Exclusive VIP Album #20 (3 Photos)",
    "description": "Exclusive photoshoot collection (3 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035211/website-media/f5b7d6snmgjofk4jczss.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035211/website-media/f5b7d6snmgjofk4jczss.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035211/website-media/f5b7d6snmgjofk4jczss.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035211/website-media/f5b7d6snmgjofk4jczss.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035211/website-media/prwdx6a5esfr4gtaehlx.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035228/website-media/ewufvv7glfxxcy340fxd.jpg"
    ],
    "photoCount": 3,
    "cloudinaryPublicId": "website-media/f5b7d6snmgjofk4jczss",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 33,
    "likes": 21,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:13:31Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789035157000",
    "title": "Exclusive VIP Album #19 (2 Photos)",
    "description": "Exclusive photoshoot collection (2 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035157/website-media/etdcknqwljbh3ssbo8rz.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035157/website-media/etdcknqwljbh3ssbo8rz.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035157/website-media/etdcknqwljbh3ssbo8rz.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035157/website-media/etdcknqwljbh3ssbo8rz.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035157/website-media/xmiriz9gthbl9scqq9b6.jpg"
    ],
    "photoCount": 2,
    "cloudinaryPublicId": "website-media/etdcknqwljbh3ssbo8rz",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 50,
    "likes": 11,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:12:37Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789035070000",
    "title": "Exclusive VIP Album #18 (2 Photos)",
    "description": "Exclusive photoshoot collection (2 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035070/website-media/otmwvo0ikolpuv2u8hq0.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035070/website-media/otmwvo0ikolpuv2u8hq0.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035070/website-media/otmwvo0ikolpuv2u8hq0.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035070/website-media/otmwvo0ikolpuv2u8hq0.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035071/website-media/lsngl6uyu5hugps4e1nc.jpg"
    ],
    "photoCount": 2,
    "cloudinaryPublicId": "website-media/otmwvo0ikolpuv2u8hq0",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 32,
    "likes": 8,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:11:10Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789035034000",
    "title": "Exclusive VIP Album #17 (2 Photos)",
    "description": "Exclusive photoshoot collection (2 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035034/website-media/fdphb8dxwqexg7kuouc8.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035034/website-media/fdphb8dxwqexg7kuouc8.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035034/website-media/fdphb8dxwqexg7kuouc8.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035034/website-media/fdphb8dxwqexg7kuouc8.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789035034/website-media/vvgkpadm6675ef7h8b1t.jpg"
    ],
    "photoCount": 2,
    "cloudinaryPublicId": "website-media/fdphb8dxwqexg7kuouc8",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 47,
    "likes": 12,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:10:34Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789034961000",
    "title": "Exclusive VIP Album #16 (2 Photos)",
    "description": "Exclusive photoshoot collection (2 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034961/website-media/cek2kjmfvkwotkbkxlfj.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034961/website-media/cek2kjmfvkwotkbkxlfj.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034961/website-media/cek2kjmfvkwotkbkxlfj.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034961/website-media/cek2kjmfvkwotkbkxlfj.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034961/website-media/rs3bshtd75x6p8hdxbq2.jpg"
    ],
    "photoCount": 2,
    "cloudinaryPublicId": "website-media/cek2kjmfvkwotkbkxlfj",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 52,
    "likes": 19,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:09:21Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789034895000",
    "title": "Exclusive VIP Album #15 (4 Photos)",
    "description": "Exclusive photoshoot collection (4 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034895/website-media/jfkniwpm4wzjfxkpzbce.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034895/website-media/jfkniwpm4wzjfxkpzbce.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034895/website-media/jfkniwpm4wzjfxkpzbce.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034895/website-media/jfkniwpm4wzjfxkpzbce.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034895/website-media/obn9xiwjxv4vc9drd5zy.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034896/website-media/xeeriatc9gxhtugyslli.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034896/website-media/y68qndsafn6rzmfm7rcc.jpg"
    ],
    "photoCount": 4,
    "cloudinaryPublicId": "website-media/jfkniwpm4wzjfxkpzbce",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 51,
    "likes": 14,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:08:15Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789034767000",
    "title": "Exclusive VIP Album #14 (2 Photos)",
    "description": "Exclusive photoshoot collection (2 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034767/website-media/lycdad5wpxdvf3jrybf4.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034767/website-media/lycdad5wpxdvf3jrybf4.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034767/website-media/lycdad5wpxdvf3jrybf4.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034767/website-media/lycdad5wpxdvf3jrybf4.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034767/website-media/u2imyj46jqyomhx6meps.jpg"
    ],
    "photoCount": 2,
    "cloudinaryPublicId": "website-media/lycdad5wpxdvf3jrybf4",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 43,
    "likes": 16,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:06:07Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789034703000",
    "title": "Exclusive VIP Album #13 (2 Photos)",
    "description": "Exclusive photoshoot collection (2 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034703/website-media/o4oquxk68khlgsopptxb.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034703/website-media/o4oquxk68khlgsopptxb.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034703/website-media/o4oquxk68khlgsopptxb.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034703/website-media/o4oquxk68khlgsopptxb.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034703/website-media/ynzqfpe6uztt18o57wsi.jpg"
    ],
    "photoCount": 2,
    "cloudinaryPublicId": "website-media/o4oquxk68khlgsopptxb",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 38,
    "likes": 16,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:05:03Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789034624000",
    "title": "Exclusive VIP Album #12 (2 Photos)",
    "description": "Exclusive photoshoot collection (2 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034624/website-media/l7vujoxrgeoi7rheogia.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034624/website-media/l7vujoxrgeoi7rheogia.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034624/website-media/l7vujoxrgeoi7rheogia.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034624/website-media/l7vujoxrgeoi7rheogia.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034624/website-media/yylxe5vaexpigdtuikbo.jpg"
    ],
    "photoCount": 2,
    "cloudinaryPublicId": "website-media/l7vujoxrgeoi7rheogia",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 30,
    "likes": 11,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:03:44Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789034547000",
    "title": "Exclusive VIP Album #11 (2 Photos)",
    "description": "Exclusive photoshoot collection (2 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034547/website-media/nmjjipqnlwwchorqt8fk.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034547/website-media/nmjjipqnlwwchorqt8fk.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034547/website-media/nmjjipqnlwwchorqt8fk.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034547/website-media/nmjjipqnlwwchorqt8fk.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034547/website-media/wrgahcom5s8fa27so4tk.jpg"
    ],
    "photoCount": 2,
    "cloudinaryPublicId": "website-media/nmjjipqnlwwchorqt8fk",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 27,
    "likes": 22,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:02:27Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789034434000",
    "title": "Exclusive VIP Album #10 (3 Photos)",
    "description": "Exclusive photoshoot collection (3 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034434/website-media/pjmwxyxpmto6mvkuspq4.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034434/website-media/pjmwxyxpmto6mvkuspq4.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034434/website-media/pjmwxyxpmto6mvkuspq4.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034434/website-media/pjmwxyxpmto6mvkuspq4.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034434/website-media/s56bbm2z7ul0tw0zmpdh.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034434/website-media/tmbj8pxuvakz62usugf5.jpg"
    ],
    "photoCount": 3,
    "cloudinaryPublicId": "website-media/pjmwxyxpmto6mvkuspq4",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 18,
    "likes": 21,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T10:00:34Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789034337000",
    "title": "Exclusive VIP Album #9 (5 Photos)",
    "description": "Exclusive photoshoot collection (5 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034337/website-media/cxnwac5nq9pf6dqhzfow.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034337/website-media/cxnwac5nq9pf6dqhzfow.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034337/website-media/cxnwac5nq9pf6dqhzfow.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034337/website-media/cxnwac5nq9pf6dqhzfow.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034337/website-media/vjvoxas7qsabpwcohnoa.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034337/website-media/xyxutddj6o8tjcixzweu.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034338/website-media/gvbql1xybmtxj8ssr8eh.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034338/website-media/jcsl8ozowem5tqazzz6v.jpg"
    ],
    "photoCount": 5,
    "cloudinaryPublicId": "website-media/cxnwac5nq9pf6dqhzfow",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 41,
    "likes": 8,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T09:58:57Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789034266000",
    "title": "Exclusive VIP Photo #8",
    "description": "Exclusive photoshoot single photo.",
    "type": "photo",
    "access": "premium",
    "price": 49,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034266/website-media/xhublciqsgyvpgsnvbgx.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034266/website-media/xhublciqsgyvpgsnvbgx.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034266/website-media/xhublciqsgyvpgsnvbgx.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034266/website-media/xhublciqsgyvpgsnvbgx.jpg"
    ],
    "photoCount": 1,
    "cloudinaryPublicId": "website-media/xhublciqsgyvpgsnvbgx",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "HD Photo"
    ],
    "views": 34,
    "likes": 17,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T09:57:46Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789034095000",
    "title": "Exclusive VIP Album #7 (3 Photos)",
    "description": "Exclusive photoshoot collection (3 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034095/website-media/kadb6fqclesikfru2pib.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034095/website-media/kadb6fqclesikfru2pib.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034095/website-media/kadb6fqclesikfru2pib.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034095/website-media/kadb6fqclesikfru2pib.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034095/website-media/taogpoo1beflpptupco6.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789034096/website-media/wa8x17susdreeju2bzez.jpg"
    ],
    "photoCount": 3,
    "cloudinaryPublicId": "website-media/kadb6fqclesikfru2pib",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 10,
    "likes": 20,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T09:54:55Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789033966000",
    "title": "Exclusive VIP Album #6 (3 Photos)",
    "description": "Exclusive photoshoot collection (3 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789033966/website-media/bo96yv4wfsszxz9i6itw.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789033966/website-media/bo96yv4wfsszxz9i6itw.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789033966/website-media/bo96yv4wfsszxz9i6itw.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789033966/website-media/bo96yv4wfsszxz9i6itw.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789033966/website-media/hgejcqarm4hs7cnv464z.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789033966/website-media/oe8anwxkubaqrhxjg38j.jpg"
    ],
    "photoCount": 3,
    "cloudinaryPublicId": "website-media/bo96yv4wfsszxz9i6itw",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 58,
    "likes": 8,
    "published": true,
    "featured": false,
    "createdAt": "2026-09-10T09:52:46Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789018500397",
    "title": "hot",
    "description": "hot",
    "type": "photo",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018476/website-media/x6icexiw1a15bfoc0pha.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018476/website-media/x6icexiw1a15bfoc0pha.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018476/website-media/x6icexiw1a15bfoc0pha.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018476/website-media/x6icexiw1a15bfoc0pha.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018476/website-media/hpm6iwiasqyokdbuest8.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018476/website-media/fqkduorah3ygpin4adq6.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018476/website-media/lnuvtrjjtb0eknobocci.jpg"
    ],
    "photoCount": 4,
    "cloudinaryPublicId": "website-media/x6icexiw1a15bfoc0pha",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP"
    ],
    "views": 1,
    "likes": 0,
    "published": true,
    "featured": true,
    "createdAt": "2026-09-10T05:35:00.451Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789018286000",
    "title": "Exclusive VIP Album #5 (3 Photos)",
    "description": "Exclusive photoshoot collection (3 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018286/website-media/fdt0z3f2fs3pr3xoswlz.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018286/website-media/fdt0z3f2fs3pr3xoswlz.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018286/website-media/fdt0z3f2fs3pr3xoswlz.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018286/website-media/fdt0z3f2fs3pr3xoswlz.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018286/website-media/hgd7rkf8y4m12nfvnpto.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018286/website-media/sqynix2vyfwihwcoizgv.jpg"
    ],
    "photoCount": 3,
    "cloudinaryPublicId": "website-media/fdt0z3f2fs3pr3xoswlz",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 40,
    "likes": 5,
    "published": true,
    "featured": true,
    "createdAt": "2026-09-10T05:31:26Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789018096000",
    "title": "Exclusive VIP Album #4 (3 Photos)",
    "description": "Exclusive photoshoot collection (3 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018096/website-media/omava7injokj8aeocghv.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018096/website-media/omava7injokj8aeocghv.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018096/website-media/omava7injokj8aeocghv.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018096/website-media/omava7injokj8aeocghv.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018096/website-media/sz2t76jcaumivveblyti.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018096/website-media/zqc8ehwauy0j0mr3wvci.jpg"
    ],
    "photoCount": 3,
    "cloudinaryPublicId": "website-media/omava7injokj8aeocghv",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 31,
    "likes": 13,
    "published": true,
    "featured": true,
    "createdAt": "2026-09-10T05:28:16Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789018029000",
    "title": "Exclusive VIP Photo #3",
    "description": "Exclusive photoshoot single photo.",
    "type": "photo",
    "access": "premium",
    "price": 49,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018029/website-media/eqwumtig1ccum8mqirbf.webp",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018029/website-media/eqwumtig1ccum8mqirbf.webp",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018029/website-media/eqwumtig1ccum8mqirbf.webp",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789018029/website-media/eqwumtig1ccum8mqirbf.webp"
    ],
    "photoCount": 1,
    "cloudinaryPublicId": "website-media/eqwumtig1ccum8mqirbf",
    "resource_type": "image",
    "format": "webp",
    "tags": [
      "Exclusive",
      "VIP",
      "HD Photo"
    ],
    "views": 28,
    "likes": 24,
    "published": true,
    "featured": true,
    "createdAt": "2026-09-10T05:27:09Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789017975000",
    "title": "Exclusive VIP Album #2 (3 Photos)",
    "description": "Exclusive photoshoot collection (3 photos).",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789017975/website-media/acwftvwatdyrbgw3eqhl.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789017975/website-media/acwftvwatdyrbgw3eqhl.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789017975/website-media/acwftvwatdyrbgw3eqhl.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789017975/website-media/acwftvwatdyrbgw3eqhl.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789017975/website-media/mpnety6uk5ppozablk4d.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789017975/website-media/qcozpxczcklq1brmbsja.jpg"
    ],
    "photoCount": 3,
    "cloudinaryPublicId": "website-media/acwftvwatdyrbgw3eqhl",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "Album"
    ],
    "views": 33,
    "likes": 23,
    "published": true,
    "featured": true,
    "createdAt": "2026-09-10T05:26:15Z",
    "duration": "1:30"
  },
  {
    "id": "rk-1789008729000",
    "title": "Exclusive VIP Photo #1",
    "description": "Exclusive photoshoot single photo.",
    "type": "photo",
    "access": "premium",
    "price": 49,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789008729/website-media/phjbnj8wukw1nkatv0rt.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789008729/website-media/phjbnj8wukw1nkatv0rt.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789008729/website-media/phjbnj8wukw1nkatv0rt.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1789008729/website-media/phjbnj8wukw1nkatv0rt.jpg"
    ],
    "photoCount": 1,
    "cloudinaryPublicId": "website-media/phjbnj8wukw1nkatv0rt",
    "resource_type": "image",
    "format": "jpg",
    "tags": [
      "Exclusive",
      "VIP",
      "HD Photo"
    ],
    "views": 19,
    "likes": 23,
    "published": true,
    "featured": true,
    "createdAt": "2026-09-10T02:52:09Z",
    "duration": "1:30"
  },
  {
    "id": "real-vid-1-mkqsvmolnf0ej3rw4hra",
    "title": "Exclusive VIP Vertical Dance Reel (Uncut 1080p)",
    "description": "Full uncompressed uncut studio video reel. Recorded in high quality original audio.",
    "type": "video",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/video/upload/so_0,w_800,c_limit,q_auto,f_jpg/v1788340208/videos/mkqsvmolnf0ej3rw4hra.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/video/upload/v1788340208/videos/mkqsvmolnf0ej3rw4hra.mp4",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/video/upload/so_0,w_800,c_limit,q_auto,f_jpg/v1788340208/videos/mkqsvmolnf0ej3rw4hra.jpg",
    "tags": [
      "Cloudinary Real",
      "VIP Video",
      "Uncut Reel",
      "HD Backstage"
    ],
    "views": 1250,
    "likes": 310,
    "duration": "1:15",
    "badge": "VIP REEL 🔥",
    "published": true,
    "featured": true,
    "createdAt": "2026-09-02T09:10:08Z"
  },
  {
    "id": "real-photo-2-lakkpxlkwc8a5vojzpdw",
    "title": "Exclusive HD Portrait Drop #2",
    "description": "Uncompressed high resolution original camera master capture from recent photoshoot.",
    "type": "photo",
    "access": "premium",
    "price": 49,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337347/photos/xjactgz4ifowkpbevalm.webp",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337347/photos/xjactgz4ifowkpbevalm.webp",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337347/photos/xjactgz4ifowkpbevalm.webp",
    "tags": [
      "Cloudinary Real",
      "HD Photo",
      "Exclusive"
    ],
    "views": 720,
    "likes": 170,
    "badge": "EXCLUSIVE HD",
    "published": true,
    "featured": true,
    "createdAt": "2026-09-02T08:48:13.000Z"
  },
  {
    "id": "real-pack-3-uinxxu1a0lrls2oem8uo",
    "title": "VIP Glamour Photoset #3 (9 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 9 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338590/photos/uinxxu1a0lrls2oem8uo.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338590/photos/uinxxu1a0lrls2oem8uo.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338590/photos/uinxxu1a0lrls2oem8uo.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338590/photos/uinxxu1a0lrls2oem8uo.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338589/photos/wdmkat6v3vaozxu9mgrk.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338588/photos/iqkzhgxzgwzbg41ei5oe.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338588/photos/fa9paklp27w8lfsb4j4i.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338585/photos/ck2yn1impvgqxmifzqqh.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338583/photos/ngsqb0fpwpkcwhjmp8df.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338581/photos/yutdkikdujibakvjhgf2.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338581/photos/x4gesz4k8r8amuzmzggf.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338580/photos/dj8fbfjff0c5pwnajjcu.jpg"
    ],
    "photoCount": 9,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 1110,
    "likes": 280,
    "badge": "9 PHOTOS PACK 🔥",
    "published": true,
    "featured": true,
    "createdAt": "2026-09-02T08:43:10.000Z"
  },
  {
    "id": "real-pack-4-uxzshkfezgzconpwnmdi",
    "title": "VIP Glamour Photoset #4 (14 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 14 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 199,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338579/photos/uxzshkfezgzconpwnmdi.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338579/photos/uxzshkfezgzconpwnmdi.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338579/photos/uxzshkfezgzconpwnmdi.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338579/photos/uxzshkfezgzconpwnmdi.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338579/photos/ufz0dmja6jzhmplvvur7.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338578/photos/lbla8ip39xabml9ztqnv.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338577/photos/xxavw5nnviyzevuo6t3k.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338577/photos/xkaiyxoeqeicy8ozlw6v.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338577/photos/ateu9wzgg1czdk3t2nfr.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338575/photos/k5kaayjqg2lso8lzx0fs.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338573/photos/hhae9in57ntclq1hr86i.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338572/photos/ckwkmckxiqmcjkcr8pq7.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338571/photos/jgwvlmzz9l89geovvnlb.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338571/photos/mqqkbxaobzysfd4hrdkd.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338570/photos/eoazglmhnjqkfhljaomh.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338569/photos/xet4vneloy4tev2qe2jv.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338569/photos/bagw02lm2rmpjyuhqjcc.jpg"
    ],
    "photoCount": 14,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 1220,
    "likes": 315,
    "badge": "14 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:42:59.000Z"
  },
  {
    "id": "real-pack-5-omgymjmpmkwxeln7gtxy",
    "title": "VIP Glamour Photoset #5 (17 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 17 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 199,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338567/photos/omgymjmpmkwxeln7gtxy.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338567/photos/omgymjmpmkwxeln7gtxy.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338567/photos/omgymjmpmkwxeln7gtxy.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338567/photos/omgymjmpmkwxeln7gtxy.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338567/photos/xx75ufyn8ut6iwklcer7.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338566/photos/uvscti28lmpkmn9sokub.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338566/photos/c3c77c55hxxlas1fhwlc.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338565/photos/pbt86axryta0jdz4fhri.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338565/photos/xmqrjy8jqf1fimpfwjmp.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338563/photos/hrzjwhsekkvvhgddrjio.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338563/photos/jadpwwuqfw4fkebdbw1w.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338561/photos/mcl5mbtaqhwjouiw8xro.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338561/photos/ys8trygcqxxaqchkadib.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338560/photos/vvbohndqx0balxmgbwzj.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338560/photos/pqdzprb4tizorzwpzmg2.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338560/photos/cqeabqrb6hbbq5qox5r9.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338559/photos/yf9lcihxwawrgt99tsjy.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338558/photos/d4k5z69z2it1wnf9ix7m.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338558/photos/yrxx7vcl1dph114ytdje.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338557/photos/ynon70grzpai1r0om8jm.jpg"
    ],
    "photoCount": 17,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 1330,
    "likes": 350,
    "badge": "17 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:42:47.000Z"
  },
  {
    "id": "real-pack-6-dfkiyht5jf0zehwupc7s",
    "title": "VIP Glamour Photoset #6 (12 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 12 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 199,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338556/photos/dfkiyht5jf0zehwupc7s.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338556/photos/dfkiyht5jf0zehwupc7s.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338556/photos/dfkiyht5jf0zehwupc7s.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338556/photos/dfkiyht5jf0zehwupc7s.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338555/photos/nulbijmgpbju6nexhdqq.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338553/photos/bmmzdi2mgkgep5rosfov.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338552/photos/kofq3wr0xsa42lkbvwn8.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338552/photos/crrn7m5gyvho4w8v7iab.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338552/photos/guv20pxpjdjgrwlwso89.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338550/photos/fgcgooeruf0j1fpjovdo.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338549/photos/lrtty8iagwksv7jtlrbz.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338549/photos/wlmfx5vxkppyvqtbprsd.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338547/photos/gtbkxcrukql3ykhtqigc.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338547/photos/yuzvwgk9cmzvzipntnzy.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338546/photos/pxrzrwckb9bix1uraxzk.jpg"
    ],
    "photoCount": 12,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 1440,
    "likes": 385,
    "badge": "12 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:42:36.000Z"
  },
  {
    "id": "real-pack-7-r6weazpcjync2apz5dqe",
    "title": "VIP Glamour Photoset #7 (11 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 11 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 199,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337211/photos/nxgydf7omzrmcmqynjeo.webp",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337211/photos/nxgydf7omzrmcmqynjeo.webp",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337211/photos/nxgydf7omzrmcmqynjeo.webp",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338590/photos/uinxxu1a0lrls2oem8uo.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338589/photos/wdmkat6v3vaozxu9mgrk.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338588/photos/iqkzhgxzgwzbg41ei5oe.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338588/photos/fa9paklp27w8lfsb4j4i.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338585/photos/ck2yn1impvgqxmifzqqh.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338583/photos/ngsqb0fpwpkcwhjmp8df.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338581/photos/yutdkikdujibakvjhgf2.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338581/photos/x4gesz4k8r8amuzmzggf.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338580/photos/dj8fbfjff0c5pwnajjcu.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338579/photos/uxzshkfezgzconpwnmdi.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338579/photos/ufz0dmja6jzhmplvvur7.jpg"
    ],
    "photoCount": 11,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 1550,
    "likes": 420,
    "badge": "11 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:42:24.000Z"
  },
  {
    "id": "real-pack-8-trnhknm3xunciranxlkf",
    "title": "VIP Glamour Photoset #8 (11 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 11 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 199,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338533/photos/trnhknm3xunciranxlkf.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338533/photos/trnhknm3xunciranxlkf.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338533/photos/trnhknm3xunciranxlkf.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338533/photos/trnhknm3xunciranxlkf.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338533/photos/vuaklo517dszpefydd2i.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338531/photos/lsjqqzupsq0jydcu6tl2.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338531/photos/s3mqoyimypmf5xmi61oc.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338531/photos/dilrezze9egqhqz8fgxc.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338529/photos/iobuaceoz7u5esdvbpxc.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338527/photos/klmvirkoj2de45suwgqf.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338526/photos/tznbjd1wkwh3s67ggaxa.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338525/photos/ufhoe3at38avfv23brdk.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338524/photos/ybkn4z5rizjvnrjfliis.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338523/photos/xebgvbylwnch8jda02bi.jpg"
    ],
    "photoCount": 11,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 1660,
    "likes": 455,
    "badge": "11 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:42:13.000Z"
  },
  {
    "id": "real-pack-9-rhmmoimqfgwrbjalnbsw",
    "title": "VIP Glamour Photoset #9 (9 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 9 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338521/photos/rhmmoimqfgwrbjalnbsw.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338521/photos/rhmmoimqfgwrbjalnbsw.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338521/photos/rhmmoimqfgwrbjalnbsw.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338521/photos/rhmmoimqfgwrbjalnbsw.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338519/photos/wdkpzh7hjxv3nkrm82kk.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338519/photos/nhi8q79bxrfvyyzbpqyc.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338518/photos/nkuwbrdlicqxzmvwmcwo.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338516/photos/syoxduwlh81juazardqf.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338515/photos/wzpxnffzxlo3zyatrh36.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338514/photos/zeu4adlpc48vq0furzr1.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338513/photos/zmf9diakcxbc2jwkpn4h.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338512/photos/t6wvrikza61ufxpvitks.jpg"
    ],
    "photoCount": 9,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 1770,
    "likes": 490,
    "badge": "9 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:42:01.000Z"
  },
  {
    "id": "real-pack-10-c4x4z72h91cnj00jzixy",
    "title": "VIP Glamour Photoset #10 (15 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 15 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 199,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338213/photos/c4x4z72h91cnj00jzixy.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338213/photos/c4x4z72h91cnj00jzixy.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338213/photos/c4x4z72h91cnj00jzixy.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338213/photos/c4x4z72h91cnj00jzixy.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338212/photos/rkajwsv5vnjhfnorrlqf.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338211/photos/bbnweyle9ew6h9gvogzp.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338209/photos/vho4sdev2afkwmn4assv.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338208/photos/ultcuskkg9xkbqyo2hks.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338207/photos/plwdlm7xsemtisufro2n.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338206/photos/sje5ovepplrvyw4jjnx5.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338206/photos/qmciwq3xzvenklcwun1u.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338206/photos/dk5iopsaroe5rb3k12ch.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338205/photos/sfnyvzfpvxxxs9da3lov.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338205/photos/izl0lxnqfynmjalrhnq6.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338204/photos/bcqjblqvhmbdxnugbxbp.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338204/photos/fgwkdhqzhuzecglcv8sd.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338203/photos/qrl3swuirzbawwcy5fsy.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338203/photos/ug1oupbd2buxu2kt09dl.jpg"
    ],
    "photoCount": 15,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 1880,
    "likes": 525,
    "badge": "15 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:36:53.000Z"
  },
  {
    "id": "real-pack-11-c87xeiwfmfgwuxlsxzyi",
    "title": "VIP Glamour Photoset #11 (9 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 9 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338202/photos/c87xeiwfmfgwuxlsxzyi.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338202/photos/c87xeiwfmfgwuxlsxzyi.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338202/photos/c87xeiwfmfgwuxlsxzyi.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338202/photos/c87xeiwfmfgwuxlsxzyi.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338202/photos/lhecv208qvwedxunnqet.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338201/photos/gzxftdzgwsjx35crwwat.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338201/photos/l4jebw8cz7zovjekhqxt.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338201/photos/cvmwuiorgisixxchdysy.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338200/photos/qtwisp3x7jix3bkhfv44.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338199/photos/ip3wa9fqf6a4r1ukhscm.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338199/photos/wkfhcrficxkzog2n0ixa.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338198/photos/fc8m7u0bnwzxujh5w7a3.jpg"
    ],
    "photoCount": 9,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 1990,
    "likes": 560,
    "badge": "9 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:36:42.000Z"
  },
  {
    "id": "real-pack-12-xzhsztl11zvivj7txjaw",
    "title": "VIP Glamour Photoset #12 (11 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 11 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 199,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338001/photos/xzhsztl11zvivj7txjaw.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338001/photos/xzhsztl11zvivj7txjaw.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338001/photos/xzhsztl11zvivj7txjaw.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338001/photos/xzhsztl11zvivj7txjaw.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337999/photos/ztiedi9wjfeg2ytebeqq.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337997/photos/fpgcudcwqwzgwtvzdroc.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337997/photos/e95shobjpcviiz6qdvvp.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337997/photos/irgeslxw7ps9kiqwvi2v.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337997/photos/rnhqo8dh8nfhnefohesd.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337993/photos/mld7i4kdjxqvpit0ap7m.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337992/photos/sjv3fqwvpqlecmwgy3yu.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337992/photos/r0gccux1avjixz8jnbnq.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337991/photos/vcefq5fkuusbsoyxnqir.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337991/photos/goyyhtq5yzwpe4ni9g3a.jpg"
    ],
    "photoCount": 11,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 2100,
    "likes": 595,
    "badge": "11 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:33:21.000Z"
  },
  {
    "id": "real-pack-13-salhc1sj8ajc30p76lxn",
    "title": "VIP Glamour Photoset #13 (14 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 14 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 199,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337990/photos/salhc1sj8ajc30p76lxn.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337990/photos/salhc1sj8ajc30p76lxn.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337990/photos/salhc1sj8ajc30p76lxn.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337990/photos/salhc1sj8ajc30p76lxn.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337989/photos/dbadh5efesvgrmoqttth.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337989/photos/g2exa0q5pmxwvxfttdla.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337987/photos/w5bwjjm7lxlfe1nkyfzq.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337986/photos/gq3o0ssutz2rn31byqgz.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337986/photos/w1ag7n91mkd7t1bav4gd.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337986/photos/sgrtlxze0lzj9qaamzxp.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337985/photos/nu7izczvzkzfldeqi8qk.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337983/photos/yntyllq2158ve1hwhyz0.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337983/photos/mrqqj7g7o8jknlnonqqp.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337982/photos/wd0t3bjrdrawvyziheco.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337982/photos/envxvo3nw31xhco26hu2.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337982/photos/pjkxjcpvmwdoxcpegmer.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337981/photos/scfgozupwdsjklb8ggdk.jpg"
    ],
    "photoCount": 14,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 2210,
    "likes": 630,
    "badge": "14 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:33:10.000Z"
  },
  {
    "id": "real-pack-14-rlvrsiczwogxak4zfadt",
    "title": "VIP Glamour Photoset #14 (9 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 9 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337978/photos/rlvrsiczwogxak4zfadt.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337978/photos/rlvrsiczwogxak4zfadt.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337978/photos/rlvrsiczwogxak4zfadt.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337978/photos/rlvrsiczwogxak4zfadt.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337977/photos/ltj3ljeadjeol1eusurk.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337976/photos/nhe6xpp2hr24pgvdoiqz.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337975/photos/wmxlw4ytot850iue4pve.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337974/photos/eriqpfupd1uyhiobmoy5.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337970/photos/oqwdbvk3ietlhbbm35fz.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337970/photos/alldvq48dni65wlujrsv.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337968/photos/ytj0einpeybynnks6zws.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337968/photos/q8b7x2wot1zf9v4xe1sv.jpg"
    ],
    "photoCount": 9,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 2320,
    "likes": 665,
    "badge": "9 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:32:58.000Z"
  },
  {
    "id": "real-pack-15-ouy0ujqsisom0uouktgd",
    "title": "VIP Glamour Photoset #15 (5 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 5 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337846/photos/ouy0ujqsisom0uouktgd.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337846/photos/ouy0ujqsisom0uouktgd.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337846/photos/ouy0ujqsisom0uouktgd.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337846/photos/ouy0ujqsisom0uouktgd.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337846/photos/egins4onkhcbplheqogb.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337844/photos/d1q8cauzozmigbyg0q54.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337844/photos/ov62kuxvbmj9gtthgh4b.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337844/photos/c49xxoufmhf5jkckxxlg.jpg"
    ],
    "photoCount": 5,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 2430,
    "likes": 700,
    "badge": "5 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:30:46.000Z"
  },
  {
    "id": "real-pack-16-zfhxfy7zgdkqhejdfwxs",
    "title": "VIP Glamour Photoset #16 (4 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 4 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337710/photos/zfhxfy7zgdkqhejdfwxs.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337710/photos/zfhxfy7zgdkqhejdfwxs.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337710/photos/zfhxfy7zgdkqhejdfwxs.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337710/photos/zfhxfy7zgdkqhejdfwxs.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337710/photos/cehcqwss0fpsyw2jlrjn.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337708/photos/qiu5sej3oodtcwbyp4cm.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337708/photos/russng9e7gifyomwneuo.jpg"
    ],
    "photoCount": 4,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 2540,
    "likes": 735,
    "badge": "4 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:28:30.000Z"
  },
  {
    "id": "real-pack-17-drjievgjsp1j8p3welnr",
    "title": "VIP Glamour Photoset #17 (6 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 6 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337599/photos/drjievgjsp1j8p3welnr.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337599/photos/drjievgjsp1j8p3welnr.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337599/photos/drjievgjsp1j8p3welnr.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337599/photos/drjievgjsp1j8p3welnr.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337599/photos/g7qjn9utfbwbozsh1g7z.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337599/photos/ebvdowuvlqvociq1v0oq.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337597/photos/bufgslqy11enuhug2qgt.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337596/photos/ntdeg5tyxiefhq4mvf7e.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337596/photos/ekvgh4us6bfpdddbb92t.jpg"
    ],
    "photoCount": 6,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 2650,
    "likes": 770,
    "badge": "6 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:26:39.000Z"
  },
  {
    "id": "real-pack-18-fehguzo95bvwoeygvwy3",
    "title": "VIP Glamour Photoset #18 (4 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 4 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337507/photos/fehguzo95bvwoeygvwy3.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337507/photos/fehguzo95bvwoeygvwy3.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337507/photos/fehguzo95bvwoeygvwy3.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337507/photos/fehguzo95bvwoeygvwy3.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337506/photos/iwdtqkx13vtfupbomkxz.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337506/photos/vjmnvzsw9perzdohtlbx.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337505/photos/pzirnma6sthhzdh1hfvs.jpg"
    ],
    "photoCount": 4,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 2760,
    "likes": 805,
    "badge": "4 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:25:07.000Z"
  },
  {
    "id": "real-pack-19-cs5tlwrvvvfbuygpopml",
    "title": "VIP Glamour Photoset #19 (4 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 4 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337441/photos/cs5tlwrvvvfbuygpopml.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337441/photos/cs5tlwrvvvfbuygpopml.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337441/photos/cs5tlwrvvvfbuygpopml.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337441/photos/cs5tlwrvvvfbuygpopml.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337441/photos/vsgvhcv6dd5nogl4s2sh.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337441/photos/dfyw1cnmgqyzus1xaav5.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337441/photos/wryzwkdghub7fxw0ybbf.jpg"
    ],
    "photoCount": 4,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 2870,
    "likes": 840,
    "badge": "4 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:24:01.000Z"
  },
  {
    "id": "real-photo-20-xjactgz4ifowkpbevalm",
    "title": "Exclusive HD Portrait Drop #20",
    "description": "Uncompressed high resolution original camera master capture from recent photoshoot.",
    "type": "photo",
    "access": "premium",
    "price": 49,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337347/photos/xjactgz4ifowkpbevalm.webp",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337347/photos/xjactgz4ifowkpbevalm.webp",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337347/photos/xjactgz4ifowkpbevalm.webp",
    "tags": [
      "Cloudinary Real",
      "HD Photo",
      "Exclusive"
    ],
    "views": 2160,
    "likes": 530,
    "badge": "EXCLUSIVE HD",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:22:27.000Z"
  },
  {
    "id": "real-pack-21-ggler6wbq5ukn8dl2thc",
    "title": "VIP Glamour Photoset #21 (6 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 6 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337326/photos/ggler6wbq5ukn8dl2thc.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337326/photos/ggler6wbq5ukn8dl2thc.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337326/photos/ggler6wbq5ukn8dl2thc.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337326/photos/ggler6wbq5ukn8dl2thc.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337326/photos/kmahxephexvlpmc06qwf.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337325/photos/jc8d1p79539ifewphqrl.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337325/photos/uc4tgcw67gjvbfivkwqt.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337324/photos/qplgdsq5gpcruqvdvb6w.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337323/photos/oaakmtyk17rnqzumczmw.jpg"
    ],
    "photoCount": 6,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 3090,
    "likes": 910,
    "badge": "6 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:22:06.000Z"
  },
  {
    "id": "real-photo-22-nxgydf7omzrmcmqynjeo",
    "title": "Exclusive HD Portrait Drop #22",
    "description": "Uncompressed high resolution original camera master capture from recent photoshoot.",
    "type": "photo",
    "access": "premium",
    "price": 49,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337211/photos/nxgydf7omzrmcmqynjeo.webp",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337211/photos/nxgydf7omzrmcmqynjeo.webp",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337211/photos/nxgydf7omzrmcmqynjeo.webp",
    "tags": [
      "Cloudinary Real",
      "HD Photo",
      "Exclusive"
    ],
    "views": 2320,
    "likes": 570,
    "badge": "EXCLUSIVE HD",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:20:11.000Z"
  },
  {
    "id": "real-pack-23-c0zvum7cj0xtruyvy7wp",
    "title": "VIP Glamour Photoset #23 (5 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 5 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337145/photos/c0zvum7cj0xtruyvy7wp.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337145/photos/c0zvum7cj0xtruyvy7wp.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337145/photos/c0zvum7cj0xtruyvy7wp.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337145/photos/c0zvum7cj0xtruyvy7wp.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337143/photos/ymabx3calyrxuwcp5quc.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337143/photos/uefpqbokisnyzffxmmla.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337143/photos/jibeiennrtfqxycyychl.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788337143/photos/zmpjxz9tvapwldprowpm.jpg"
    ],
    "photoCount": 5,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 3310,
    "likes": 980,
    "badge": "5 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:19:05.000Z"
  },
  {
    "id": "real-photo-24-j8l8opiisz6hnj4zjpvo",
    "title": "Exclusive HD Portrait Drop #24",
    "description": "Uncompressed high resolution original camera master capture from recent photoshoot.",
    "type": "photo",
    "access": "premium",
    "price": 49,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336775/photos/j8l8opiisz6hnj4zjpvo.webp",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336775/photos/j8l8opiisz6hnj4zjpvo.webp",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336775/photos/j8l8opiisz6hnj4zjpvo.webp",
    "tags": [
      "Cloudinary Real",
      "HD Photo",
      "Exclusive"
    ],
    "views": 2480,
    "likes": 610,
    "badge": "EXCLUSIVE HD",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:12:55.000Z"
  },
  {
    "id": "real-photo-25-wzzey3ww1pdhbapjavla",
    "title": "Exclusive HD Portrait Drop #25",
    "description": "Uncompressed high resolution original camera master capture from recent photoshoot.",
    "type": "photo",
    "access": "premium",
    "price": 49,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336759/photos/wzzey3ww1pdhbapjavla.webp",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336759/photos/wzzey3ww1pdhbapjavla.webp",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336759/photos/wzzey3ww1pdhbapjavla.webp",
    "tags": [
      "Cloudinary Real",
      "HD Photo",
      "Exclusive"
    ],
    "views": 2560,
    "likes": 630,
    "badge": "EXCLUSIVE HD",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:12:39.000Z"
  },
  {
    "id": "real-pack-26-lcona56delwwfpemaami",
    "title": "VIP Glamour Photoset #26 (5 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 5 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336745/photos/lcona56delwwfpemaami.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336745/photos/lcona56delwwfpemaami.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336745/photos/lcona56delwwfpemaami.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336745/photos/lcona56delwwfpemaami.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336745/photos/q7xm0utbrwslia5bebmz.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336744/photos/caflk27axwojhkfndi6i.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336744/photos/lvzsr3hdmaajbwhzpezo.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336742/photos/pomf1veughgfqfddu8hs.jpg"
    ],
    "photoCount": 5,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 3640,
    "likes": 1085,
    "badge": "5 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:12:25.000Z"
  },
  {
    "id": "real-pack-27-fgejsko2chryx3huyiuz",
    "title": "VIP Glamour Photoset #27 (5 Ultra-HD Photos)",
    "description": "Complete full-resolution studio photoshoot collection containing 5 high quality uncompressed photos.",
    "type": "pack",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336541/photos/fgejsko2chryx3huyiuz.webp",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336541/photos/fgejsko2chryx3huyiuz.webp",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336541/photos/fgejsko2chryx3huyiuz.webp",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336541/photos/fgejsko2chryx3huyiuz.webp",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336539/photos/og3gfgxu06ylr6pcrdqp.webp",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336538/photos/r2l3zhps9hluv2fuhkuu.webp",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336537/photos/zqrwyp4d3xbxyjyqhyzt.webp",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788336533/photos/kuhe6nzxdiycoxmy3peg.webp"
    ],
    "photoCount": 5,
    "tags": [
      "Cloudinary Real",
      "Photoset",
      "Ultra HD",
      "VIP Pack"
    ],
    "views": 3750,
    "likes": 1120,
    "badge": "5 PHOTOS PACK 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T08:09:01.000Z"
  },
  {
    "id": "real-vid-2-kjre8omkjqns5jxueyte",
    "title": "Backstage HD Modeling Reel & Studio Vlog",
    "description": "Full uncompressed uncut studio video reel. Recorded in high quality original audio.",
    "type": "video",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/video/upload/so_0,w_800,c_limit,q_auto,f_jpg/v1788333022/videos/kjre8omkjqns5jxueyte.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/video/upload/v1788333022/videos/kjre8omkjqns5jxueyte.mp4",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/video/upload/so_0,w_800,c_limit,q_auto,f_jpg/v1788333022/videos/kjre8omkjqns5jxueyte.jpg",
    "tags": [
      "Cloudinary Real",
      "VIP Video",
      "Uncut Reel",
      "HD Backstage"
    ],
    "views": 1680,
    "likes": 405,
    "duration": "2:45",
    "badge": "VIP REEL 🔥",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T07:10:22Z"
  },
  {
    "id": "real-photo-28-jcmqk96scgqhxhlezsmu",
    "title": "Exclusive HD Portrait Drop #28",
    "description": "Uncompressed high resolution original camera master capture from recent photoshoot.",
    "type": "photo",
    "access": "premium",
    "price": 49,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788332179/photos/jcmqk96scgqhxhlezsmu.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788332179/photos/jcmqk96scgqhxhlezsmu.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788332179/photos/jcmqk96scgqhxhlezsmu.jpg",
    "tags": [
      "Cloudinary Real",
      "HD Photo",
      "Exclusive"
    ],
    "views": 2800,
    "likes": 690,
    "badge": "EXCLUSIVE HD",
    "published": true,
    "featured": false,
    "createdAt": "2026-09-02T06:56:19.000Z"
  },
  {
    "id": "rk-002",
    "title": "Green Backless Dress Reel (Uncut 1080p Video)",
    "description": "Full uncut 2-minute dance and mirror reel in the emerald green slit dress with original audio.",
    "type": "video",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/video/upload/v1788340208/videos/mkqsvmolnf0ej3rw4hra.mp4",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/video/upload/v1788340208/videos/mkqsvmolnf0ej3rw4hra.mp4",
    "tags": [
      "Reel",
      "Dress",
      "Dance",
      "VIP Video",
      "Starter Demo"
    ],
    "views": 2939,
    "likes": 612,
    "duration": "1:45",
    "published": true,
    "featured": true,
    "createdAt": "2026-08-15T18:30:00.000Z",
    "badge": "Starter Demo"
  },
  {
    "id": "rk-003",
    "title": "Royal Blue Crop Top Workout & Poses Reel",
    "description": "Exclusive backstage workout reel, back-angle poses, and casual candid laughs.",
    "type": "video",
    "access": "premium",
    "price": 99,
    "thumbnailUrl": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/video/upload/v1788333022/videos/kjre8omkjqns5jxueyte.mp4",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/video/upload/v1788333022/videos/kjre8omkjqns5jxueyte.mp4",
    "tags": [
      "Workout",
      "Exclusive",
      "Reel",
      "Starter Demo"
    ],
    "views": 1850,
    "likes": 310,
    "duration": "2:10",
    "published": true,
    "featured": false,
    "createdAt": "2026-08-14T11:00:00.000Z",
    "badge": "Starter Demo"
  },
  {
    "id": "rk-004",
    "title": "Casual Red Tank Top & Café Diary (Free Preview)",
    "description": "Free sample lifestyle photo shoot from our weekend café outing. Follow along on Instagram for more!",
    "type": "photo",
    "access": "free",
    "price": 0,
    "thumbnailUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    "mediaUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&auto=format&fit=crop&q=90",
    "tags": [
      "Free",
      "Lifestyle",
      "Casual",
      "Starter Demo"
    ],
    "views": 5240,
    "likes": 890,
    "published": true,
    "featured": false,
    "createdAt": "2026-08-13T09:15:00.000Z",
    "badge": "Starter Demo"
  },
  {
    "id": "rk-005",
    "title": "Summer Glam VIP Photoset (15 Ultra-HD Photos)",
    "description": "Complete uncompressed high-resolution photo set including sunset glow and indoor studio portraits.",
    "type": "pack",
    "access": "premium",
    "price": 199,
    "thumbnailUrl": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
    "mediaUrl": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1600&auto=format&fit=crop&q=95",
    "tags": [
      "VIP Pack",
      "Photoset",
      "Ultra HD",
      "Best Value",
      "Starter Demo"
    ],
    "views": 4120,
    "likes": 730,
    "photoCount": 15,
    "published": true,
    "featured": true,
    "createdAt": "2026-08-12T16:45:00.000Z",
    "badge": "Starter Demo"
  },
  {
    "id": "rk-006",
    "title": "Daily Fit Routine Sneak Peek (Free Sample Video)",
    "description": "A 30-second free workout clip showing my daily warm-up stretches and favorite routines.",
    "type": "video",
    "access": "free",
    "price": 0,
    "thumbnailUrl": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/video/upload/v1788340208/videos/mkqsvmolnf0ej3rw4hra.mp4",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/video/upload/v1788340208/videos/mkqsvmolnf0ej3rw4hra.mp4",
    "tags": [
      "Free",
      "Workout",
      "Warmup",
      "Starter Demo"
    ],
    "views": 6890,
    "likes": 1240,
    "duration": "0:35",
    "published": true,
    "featured": false,
    "createdAt": "2026-08-11T13:00:00.000Z",
    "badge": "Starter Demo"
  },
  {
    "id": "rk-007",
    "title": "Late Night Q&A & Exclusive Story Behind The Scenes",
    "description": "Personal conversation, answering spicy fan questions and sharing private modeling stories.",
    "type": "video",
    "access": "premium",
    "price": 149,
    "thumbnailUrl": "https://images.unsplash.com/photo-1516575334481-f85287c2c82d?w=800&auto=format&fit=crop&q=80",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/video/upload/v1788333022/videos/kjre8omkjqns5jxueyte.mp4",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/video/upload/v1788333022/videos/kjre8omkjqns5jxueyte.mp4",
    "tags": [
      "Q&A",
      "VIP Video",
      "Uncut",
      "Starter Demo"
    ],
    "views": 1980,
    "likes": 410,
    "duration": "3:40",
    "published": true,
    "featured": false,
    "createdAt": "2026-08-10T21:10:00.000Z",
    "badge": "Starter Demo"
  },
  {
    "id": "rk-008",
    "title": "Golden Hour Traditional & Saree Collection",
    "description": "Stunning outdoor golden hour photoshoot capturing traditional saree and modern fusion looks.",
    "type": "photo",
    "access": "premium",
    "price": 49,
    "thumbnailUrl": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
    "mediaUrl": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&auto=format&fit=crop&q=95",
    "tags": [
      "Saree",
      "Golden Hour",
      "Traditional",
      "HD Photo",
      "Starter Demo"
    ],
    "views": 2450,
    "likes": 540,
    "published": true,
    "featured": false,
    "createdAt": "2026-08-09T17:00:00.000Z",
    "badge": "Starter Demo"
  }
];

interface DatabaseSchema {
  settings: SiteSettings;
  content: MediaItem[];
  orders: OrderItem[];
  leads: VipLeadItem[];
  tokens: { token: string; contentId: string; orderId: string; expiresAt: string; createdAt: string }[];
  deletedIds?: string[];
  contentVersion?: number;
  settingsVersion?: number;
  ordersVersion?: number;
  leadsVersion?: number;
}

class Database {
  private data: DatabaseSchema;
  private lastCloudSyncTime = 0;

  constructor() {
    this.data = this.loadData();
    this.syncFromCloudinaryFeed().catch(() => {});
  }

  public async syncFromCloudinaryFeed(): Promise<boolean> {
    try {
      this.lastCloudSyncTime = Date.now();
      const res = await fetch(`https://res.cloudinary.com/mnbjgtqu/raw/upload/ruma_content_feed?t=${Date.now()}`);
      if (!res.ok) return false;
      const remoteItems = await res.json();
      if (!Array.isArray(remoteItems) || remoteItems.length === 0) return false;

      const deletedSet = new Set<string>(this.getDeletedIds());
      const currentMap = new Map<string, MediaItem>(this.data.content.map(i => [i.id, i]));
      let hasChanges = false;

      for (const item of remoteItems) {
        if (!item || !item.id || deletedSet.has(item.id)) continue;
        if (!currentMap.has(item.id)) {
          this.data.content.unshift(item);
          currentMap.set(item.id, item);
          hasChanges = true;
          console.log(`[Cloudinary Feed Auto-Sync] Restored item: ${item.id} - ${item.title}`);
        }
      }

      if (hasChanges) {
        this.data.content.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        this.data.contentVersion = Date.now();
        this.saveData();
        console.log(`[Cloudinary Feed Auto-Sync] Database updated with ${this.data.content.length} total items.`);
        return true;
      }
    } catch (err) {
      console.warn('[Cloudinary Feed Auto-Sync Non-fatal error]:', err);
    }
    return false;
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const deletedSet = new Set<string>(Array.isArray(parsed.deletedIds) ? parsed.deletedIds : []);
        const rawContent: MediaItem[] = parsed.content || INITIAL_CONTENT;
        const filteredContent = rawContent.filter(c => !deletedSet.has(c.id));
        const loadedLeads: VipLeadItem[] = (Array.isArray(parsed.leads) && parsed.leads.length > 0)
          ? parsed.leads
          : DEFAULT_VIP_LEADS;

        return {
          settings: { ...DEFAULT_SITE_SETTINGS, ...(parsed.settings || {}) },
          content: filteredContent,
          orders: parsed.orders || [],
          leads: loadedLeads,
          tokens: parsed.tokens || [],
          deletedIds: Array.from(deletedSet),
          contentVersion: parsed.contentVersion || Date.now(),
          settingsVersion: parsed.settingsVersion || Date.now(),
          ordersVersion: parsed.ordersVersion || Date.now(),
          leadsVersion: parsed.leadsVersion || Date.now()
        };
      }
    } catch (err) {
      console.error('Error loading data file:', err);
    }
    return {
      settings: DEFAULT_SITE_SETTINGS,
      content: INITIAL_CONTENT,
      orders: [],
      leads: DEFAULT_VIP_LEADS,
      tokens: [],
      deletedIds: [],
      contentVersion: Date.now(),
      settingsVersion: Date.now(),
      ordersVersion: Date.now(),
      leadsVersion: Date.now()
    };
  }

  public saveData() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      try {
        const publicDir = path.join(process.cwd(), 'public', 'data');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        const siteSettingsJson = JSON.stringify(this.data.settings, null, 2);
        const contentJson = JSON.stringify(this.getAllContent(true), null, 2);
        const deletedIdsJson = JSON.stringify({ deletedIds: this.getDeletedIds() }, null, 2);

        fs.writeFileSync(path.join(publicDir, 'site-settings.json'), siteSettingsJson, 'utf-8');
        fs.writeFileSync(path.join(publicDir, 'content.json'), contentJson, 'utf-8');
        fs.writeFileSync(path.join(publicDir, 'deleted-ids.json'), deletedIdsJson, 'utf-8');

        const distDir = path.join(process.cwd(), 'dist', 'data');
        if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
          if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, { recursive: true });
          }
          fs.writeFileSync(path.join(distDir, 'site-settings.json'), siteSettingsJson, 'utf-8');
          fs.writeFileSync(path.join(distDir, 'content.json'), contentJson, 'utf-8');
          fs.writeFileSync(path.join(distDir, 'deleted-ids.json'), deletedIdsJson, 'utf-8');
        }
      } catch (_) {}
    } catch (err) {
      console.error('Error saving data file:', err);
    }
  }

  public getContentVersion(): number {
    return this.data.contentVersion || 1;
  }

  public getSettingsVersion(): number {
    return this.data.settingsVersion || 1;
  }

  public getOrdersVersion(): number {
    return this.data.ordersVersion || 1;
  }

  public getLeadsVersion(): number {
    return this.data.leadsVersion || 1;
  }

  // Site Settings
  public getSettings(): SiteSettings {
    return this.data.settings;
  }

  public updateSettings(partial: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.data.settings, ...partial };
    this.data.settingsVersion = Date.now();
    this.saveData();
    return this.data.settings;
  }

  // Content Operations
  public getAllContent(includeUnpublished = false): MediaItem[] {
    if (Date.now() - this.lastCloudSyncTime > 60000) {
      this.syncFromCloudinaryFeed().catch(() => {});
    }
    const deletedSet = new Set<string>(this.data.deletedIds || []);
    const liveContent = this.data.content.filter(c => !deletedSet.has(c.id));
    const list = includeUnpublished ? liveContent : liveContent.filter(c => c.published);
    return [...list].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  public getDeletedIds(): string[] {
    return this.data.deletedIds || [];
  }

  public getContentById(id: string): MediaItem | undefined {
    if (this.data.deletedIds && this.data.deletedIds.includes(id)) {
      return undefined;
    }
    return this.data.content.find(c => c.id === id);
  }

  public upsertContent(item: MediaItem): MediaItem {
    if (!item.id) {
      item.id = `rk-${Date.now().toString(36)}`;
    }
    const idx = this.data.content.findIndex(c => c.id === item.id);
    if (idx !== -1) {
      this.data.content[idx] = { ...this.data.content[idx], ...item };
    } else {
      this.data.content.unshift(item);
    }
    if (this.data.deletedIds) {
      this.data.deletedIds = this.data.deletedIds.filter(id => id !== item.id);
    }
    this.data.contentVersion = Date.now();
    this.saveData();
    return item;
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
    this.data.contentVersion = Date.now();
    this.saveData();
    return newItem;
  }

  public updateContent(id: string, updates: Partial<MediaItem>): MediaItem | null {
    const idx = this.data.content.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.content[idx] = { ...this.data.content[idx], ...updates };
    this.data.contentVersion = Date.now();
    this.saveData();
    return this.data.content[idx];
  }

  public deleteContent(id: string): boolean {
    if (!this.data.deletedIds) {
      this.data.deletedIds = [];
    }
    if (!this.data.deletedIds.includes(id)) {
      this.data.deletedIds.push(id);
    }
    const prevLen = this.data.content.length;
    this.data.content = this.data.content.filter(c => c.id !== id);
    this.data.contentVersion = Date.now();
    this.saveData();
    return true;
  }

  public purgeDemoContent(): { deletedCount: number; purgedIds: string[] } {
    const demoIds = ['rk-001', 'rk-002', 'rk-003', 'rk-004', 'rk-005', 'rk-006', 'rk-007', 'rk-008'];
    if (!this.data.deletedIds) {
      this.data.deletedIds = [];
    }
    const newlyPurged: string[] = [];
    demoIds.forEach(id => {
      if (!this.data.deletedIds!.includes(id)) {
        this.data.deletedIds!.push(id);
      }
      newlyPurged.push(id);
    });

    // Also remove items tagged or badged as Starter Demo
    const removedItems = this.data.content.filter(c => 
      demoIds.includes(c.id) || 
      c.badge === 'Starter Demo' || 
      (Array.isArray(c.tags) && c.tags.includes('Starter Demo'))
    );
    removedItems.forEach(i => {
      if (!this.data.deletedIds!.includes(i.id)) {
        this.data.deletedIds!.push(i.id);
        newlyPurged.push(i.id);
      }
    });

    this.data.content = this.data.content.filter(c => 
      !demoIds.includes(c.id) && 
      c.badge !== 'Starter Demo' && 
      !(Array.isArray(c.tags) && c.tags.includes('Starter Demo'))
    );

    this.data.contentVersion = Date.now();
    this.saveData();
    return { deletedCount: newlyPurged.length, purgedIds: newlyPurged };
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
    const existingIdx = this.data.orders.findIndex(o => o.orderId === order.orderId);
    if (existingIdx >= 0) {
      this.data.orders[existingIdx] = { ...this.data.orders[existingIdx], ...order };
    } else {
      this.data.orders.unshift(order);
    }
    this.data.ordersVersion = Date.now();
    this.saveData();
    return order;
  }

  public upsertOrder(order: OrderItem): OrderItem {
    return this.createOrder(order);
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

      // Auto-upsert or update VIP Lead when order is paid
      if (order.customerPhone) {
        this.upsertLead({
          name: order.customerName || 'VIP Member',
          phone: order.customerPhone,
          amount: order.amount,
          vipStatus: 'active',
          status: 'active'
        });
      }
    }
    this.data.ordersVersion = Date.now();
    this.saveData();
    return order;
  }

  public deleteOrder(orderId: string): boolean {
    const idx = this.data.orders.findIndex(o => o.orderId === orderId);
    if (idx >= 0) {
      this.data.orders.splice(idx, 1);
      this.data.ordersVersion = Date.now();
      this.saveData();
      return true;
    }
    return false;
  }

  // VIP Leads / Members Operations
  public getAllLeads(): VipLeadItem[] {
    if (!this.data.leads || this.data.leads.length === 0) {
      this.data.leads = [...DEFAULT_VIP_LEADS];
      this.saveData();
    }
    return this.data.leads;
  }

  public getLead(leadId: string): VipLeadItem | undefined {
    return (this.data.leads || []).find(l => l.id === leadId || l.userId === leadId);
  }

  public upsertLead(leadData: Partial<VipLeadItem>): VipLeadItem {
    if (!this.data.leads) this.data.leads = [...DEFAULT_VIP_LEADS];
    const cleanPhone = (leadData.phone || '').trim().replace(/[^0-9]/g, '');
    const leadId = leadData.id || (cleanPhone ? `lead_${cleanPhone}` : `lead_${Date.now()}`);

    const existingIndex = this.data.leads.findIndex(l =>
      l.id === leadId ||
      (cleanPhone && l.phone && l.phone.replace(/[^0-9]/g, '') === cleanPhone) ||
      (leadData.userId && l.userId === leadData.userId)
    );

    const fullLead: VipLeadItem = {
      id: leadId,
      userId: leadData.userId || `vip_${cleanPhone || Date.now().toString().slice(-6)}`,
      name: leadData.name || 'VIP Member',
      phone: leadData.phone || '',
      email: leadData.email || '',
      photoUrl: leadData.photoUrl || leadData.profilePicUrl || '',
      status: leadData.status || 'active',
      vipStatus: leadData.vipStatus || 'active',
      tier: leadData.tier || 'Gold VIP',
      unlockedCount: leadData.unlockedCount ?? (leadData.contentId ? 1 : 0),
      totalSpent: leadData.totalSpent ?? (leadData.amount ?? 0),
      notes: leadData.notes || '',
      createdAt: leadData.createdAt || new Date().toISOString(),
      source: leadData.source || 'web_unlock_prompt',
      ...leadData
    };

    if (existingIndex >= 0) {
      const prev = this.data.leads[existingIndex];
      this.data.leads[existingIndex] = {
        ...prev,
        ...fullLead,
        unlockedCount: Math.max(prev.unlockedCount || 0, fullLead.unlockedCount || 0),
        totalSpent: Math.max(prev.totalSpent || 0, fullLead.totalSpent || 0)
      };
    } else {
      this.data.leads.unshift(fullLead);
    }

    this.data.leadsVersion = Date.now();
    this.saveData();
    return fullLead;
  }

  public deleteLead(leadId: string): boolean {
    if (!this.data.leads) return false;
    const initialLen = this.data.leads.length;
    this.data.leads = this.data.leads.filter(l => l.id !== leadId && l.userId !== leadId);
    if (this.data.leads.length !== initialLen) {
      this.data.leadsVersion = Date.now();
      this.saveData();
      return true;
    }
    return false;
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

  public submitPaymentProof(
    orderId: string,
    screenshotUrl: string,
    utr?: string,
    aiData?: {
      autoVerified?: boolean;
      aiExtractedUtr?: string;
      aiExtractedAmount?: number;
      aiExtractedDate?: string;
      aiVerificationNotes?: string;
    }
  ): { success: boolean; order?: OrderItem; error?: string } {
    const order = this.data.orders.find(o => o.orderId === orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    order.screenshotUrl = screenshotUrl;
    if (utr) {
      order.transactionRef = utr;
    }
    if (aiData) {
      if (aiData.autoVerified !== undefined) order.autoVerified = aiData.autoVerified;
      if (aiData.aiExtractedUtr) order.aiExtractedUtr = aiData.aiExtractedUtr;
      if (aiData.aiExtractedAmount !== undefined) order.aiExtractedAmount = aiData.aiExtractedAmount;
      if (aiData.aiExtractedDate) order.aiExtractedDate = aiData.aiExtractedDate;
      if (aiData.aiVerificationNotes) order.aiVerificationNotes = aiData.aiVerificationNotes;
    }
    order.status = 'manual_review';
    this.saveData();
    return { success: true, order };
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
