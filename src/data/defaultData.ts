import { MediaItem, SiteSettings } from '../types';

export const CLIENT_SITE_SETTINGS: SiteSettings = {
  creatorName: 'Ruma Kumari',
  username: 'ruma_cutegirl_official',
  bio: 'Pretty mood always 💋 | Fitness, Lifestyle & Exclusive VIP Content',
  tagline: 'Unlock my private, uncut HD photos, backstage reels & VIP stories instantly.',
  profilePicUrl: 'https://res.cloudinary.com/mnbjgtqu/image/upload/v1788341260/settings/xrfuncs6lmkwr1njlvhe.jpg',
  bannerUrl: 'https://res.cloudinary.com/mnbjgtqu/image/upload/v1788341261/settings/jizzyecqdpy22p2b1f2f.jpg',
  instagramUrl: 'https://instagram.com/ruma__cutegirl',
  instagramHandle: '@ruma__cuteg...',
  badgeText: 'VIP Creator',
  upiId: '6202292319pnb@ybl',
  postsCount: 37,
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
      limit: 8
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
      coverImage: 'https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338893/photos/lakkpxlkwc8a5vojzpdw.jpg',
      items: [
        {
          id: 'story-1-1',
          url: 'https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338893/photos/lakkpxlkwc8a5vojzpdw.jpg',
          type: 'image',
          caption: 'Morning vibes ✨ pretty mood always'
        }
      ]
    },
    {
      id: 'highlight-2',
      title: 'back look',
      coverImage: 'https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338590/photos/uinxxu1a0lrls2oem8uo.jpg',
      items: [
        {
          id: 'story-2-1',
          url: 'https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338590/photos/uinxxu1a0lrls2oem8uo.jpg',
          type: 'image',
          caption: 'Gym session progress 💪'
        }
      ]
    },
    {
      id: 'highlight-3',
      title: 'link 🔗',
      coverImage: 'https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338589/photos/wdmkat6v3vaozxu9mgrk.jpg',
      items: [
        {
          id: 'story-3-1',
          url: 'https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338589/photos/wdmkat6v3vaozxu9mgrk.jpg',
          type: 'image',
          caption: 'Instant direct checkout on UPI! Tap below.'
        }
      ]
    },
    {
      id: 'highlight-4',
      title: '🥵 special',
      coverImage: 'https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338588/photos/iqkzhgxzgwzbg41ei5oe.jpg',
      items: [
        {
          id: 'story-4-1',
          url: 'https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338588/photos/iqkzhgxzgwzbg41ei5oe.jpg',
          type: 'image',
          caption: 'VIP reel teaser 🔥 check latest upload'
        }
      ]
    }
  ]
};

export const INITIAL_CONTENT: MediaItem[] = [
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
    "id": "real-photo-2-lakkpxlkwc8a5vojzpdw",
    "title": "Exclusive HD Portrait Drop #2",
    "description": "Uncompressed high resolution original camera master capture from recent photoshoot.",
    "type": "photo",
    "access": "premium",
    "price": 49,
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338893/photos/lakkpxlkwc8a5vojzpdw.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338893/photos/lakkpxlkwc8a5vojzpdw.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338893/photos/lakkpxlkwc8a5vojzpdw.jpg",
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
    "thumbnailUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338544/photos/r6weazpcjync2apz5dqe.jpg",
    "mediaUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338544/photos/r6weazpcjync2apz5dqe.jpg",
    "previewUrl": "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338544/photos/r6weazpcjync2apz5dqe.jpg",
    "galleryUrls": [
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338544/photos/r6weazpcjync2apz5dqe.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338543/photos/ndsq32lmeosj7gfqcbea.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338543/photos/nfnzrfmeayxxr0yjhqpd.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338543/photos/ffl2xvmtzdz9entaebg5.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338539/photos/pfan9v1izs6rnn7zsdzn.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338539/photos/iysjwuvhh9zzdjetygot.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338539/photos/fryxtdw1gm8ehcxpgyyn.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338536/photos/dutrx4ghclp13fshmvy2.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338535/photos/wsyne2vlerc0b7csosag.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338534/photos/nn6rukct64heca563sqc.jpg",
      "https://res.cloudinary.com/mnbjgtqu/image/upload/v1788338534/photos/qwltnagen8i9dxevuh62.jpg"
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
  }
];

export const CLIENT_CONTENT_LIST = INITIAL_CONTENT;
