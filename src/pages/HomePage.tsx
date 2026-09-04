import React, { useMemo, useState, useEffect, Suspense, lazy } from 'react';
import { SiteSettings, MediaItem } from '../types';
import { StoryHighlights } from '../components/StoryHighlights';
import { ContentCard } from '../components/ContentCard';
import { HotDropCountdownBanner } from '../components/HotDropCountdownBanner';
import { HotFlashSaleStickyBanner } from '../components/HotFlashSaleStickyBanner';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import {
  BadgeCheck,
  Instagram,
  Sparkles,
  Lock,
  Film,
  Image as ImageIcon,
  Flame,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Heart,
  Share2,
  Gift,
  Star,
  CheckCircle2,
  CheckCircle,
  Crown,
  Eye,
  Users
} from 'lucide-react';

// Lazy load below-the-fold static sections and on-demand modals
const PricingPacks = lazy(() => import('../components/PricingPacks').then(m => ({ default: m.PricingPacks })));
const HowItWorks = lazy(() => import('../components/HowItWorks').then(m => ({ default: m.HowItWorks })));
const FAQSection = lazy(() => import('../components/FAQSection').then(m => ({ default: m.FAQSection })));
const DailyRewardWheelModal = lazy(() => import('../components/DailyRewardWheelModal').then(m => ({ default: m.DailyRewardWheelModal })));
const TeaserPeekModal = lazy(() => import('../components/TeaserPeekModal').then(m => ({ default: m.TeaserPeekModal })));
const StopUserExitModal = lazy(() => import('../components/StopUserExitModal').then(m => ({ default: m.StopUserExitModal })));

interface HomePageProps {
  settings: SiteSettings;
  content: MediaItem[];
  unlockedIds: string[];
  onOpenMedia: (item: MediaItem) => void;
  onBuyMedia: (item: MediaItem) => void;
  onOpenShare?: (item?: MediaItem) => void;
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  content,
  unlockedIds,
  onOpenMedia,
  onBuyMedia,
  onOpenShare,
  onNavigate,
}) => {
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isPeekModalOpen, setIsPeekModalOpen] = useState(false);
  const [peekItem, setPeekItem] = useState<MediaItem | null>(null);

  // Exit intent & idle detection to stop leaving users with an irresistible hot offer
  useEffect(() => {
    const hasShownExit = sessionStorage.getItem('exit_modal_shown');
    if (hasShownExit) return;

    // Trigger after 25s of browsing if not shown yet
    const idleTimer = setTimeout(() => {
      const shown = sessionStorage.getItem('exit_modal_shown');
      if (!shown) {
        sessionStorage.setItem('exit_modal_shown', 'true');
        setIsExitModalOpen(true);
      }
    }, 25000);

    // Desktop mouseleave exit-intent
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10) {
        const shown = sessionStorage.getItem('exit_modal_shown');
        if (!shown) {
          sessionStorage.setItem('exit_modal_shown', 'true');
          setIsExitModalOpen(true);
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(idleTimer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  const cfg = settings.homepageConfig || {
    hero: { enabled: true, title: settings.creatorName, description: settings.tagline, ctaText: 'View Premium Feed' },
    profile: { enabled: true, showStats: true, showBadge: true, showInstagramBtn: true },
    storyHighlights: { enabled: true, title: 'Story Highlights & Teasers' },
    featured: { enabled: true, title: 'Featured VIP Releases', subtitle: 'Trending high-resolution sets and uncut master videos.', limit: 8 },
    vipPacks: { enabled: true, title: 'Exclusive VIP All-Access Bundles', subtitle: 'Unlock complete photo sets and full-length video archives at 60% discount.' },
    latestVideos: { enabled: true, title: 'Latest Video Reels & Backstage', limit: 4 },
    latestPhotos: { enabled: true, title: 'Latest HD Photo Drops', limit: 4 },
    freeSamples: { enabled: true, title: 'Free Lifestyle & Workout Samples', subtitle: 'Enjoy these complimentary photos and clips before unlocking VIP sets.' },
    howItWorks: { enabled: true, title: 'How It Works' },
    faq: { enabled: true, title: 'Frequently Asked Questions' },
    footer: { enabled: true, showDisclaimer: true },
    sectionOrder: ['hero', 'featured', 'vipPacks', 'latestVideos', 'latestPhotos', 'freeSamples', 'howItWorks', 'faq']
  };

  const featuredLimit = cfg.featured?.limit || 8;
  const videoLimit = cfg.latestVideos?.limit || 4;
  const photoLimit = cfg.latestPhotos?.limit || 4;

  const featuredContent = useMemo(() => {
    const featured = content.filter((c) => c.featured);
    return (featured.length > 0 ? featured : content).slice(0, featuredLimit);
  }, [content, featuredLimit]);
  const latestPhotos = useMemo(() => content.filter((c) => c.type === 'photo').slice(0, photoLimit), [content, photoLimit]);
  const latestVideos = useMemo(() => content.filter((c) => c.type === 'video').slice(0, videoLimit), [content, videoLimit]);
  const freeItems = useMemo(() => content.filter((c) => c.access === 'free'), [content]);
  const vipPacks = useMemo(() => content.filter((c) => c.type === 'pack'), [content]);

  // Render individual sections
  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case 'hero':
        if (cfg.hero && !cfg.hero.enabled) return null;
        return (
          <section key="hero" className="relative pt-4 sm:pt-8">
            {/* Ambient Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-tr from-pink-300/25 via-purple-300/15 to-transparent blur-3xl pointer-events-none rounded-full" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
              <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/80 shadow-2xl relative overflow-hidden">
                {/* Background Luxury Ambient Gradient */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-200/20 via-purple-200/15 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10">
                  {/* Creator Profile Photo with Active Status */}
                  <div className="relative shrink-0">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-2xl shadow-pink-500/25 relative group">
                      <div className="w-full h-full rounded-full p-1 bg-white overflow-hidden shadow-inner">
                        <img
                          src={getOptimizedImageUrl(settings.profilePicUrl, 240, 80)}
                          alt={settings.creatorName}
                          width={192}
                          height={192}
                          className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                          loading="eager"
                          fetchPriority="high"
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    {/* Live Online Badge */}
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-white/95 border border-pink-300 text-pink-700 text-[10px] sm:text-xs font-black px-3 py-0.5 rounded-full shadow-md whitespace-nowrap flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                      <span>Active Now • VIP Online</span>
                    </div>
                  </div>

                  {/* Creator Bio & Stats */}
                  <div className="flex-1 text-center md:text-left space-y-4">
                    {/* Name & Official Badges */}
                    <div>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5">
                        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-purple-950 tracking-tight">
                          {cfg.hero?.title || settings.creatorName}
                        </h1>
                        {(cfg.profile?.showBadge ?? true) && (
                          <div className="flex items-center gap-1.5">
                            <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500/20" title="Verified Creator" />
                            <span className="px-3 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border border-pink-200/80 shadow-xs">
                              {settings.badgeText || 'Official VIP Hub'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                        <a
                          href={settings.instagramUrl || 'https://www.instagram.com/ruma__cutegirl?igsi=cXo3ZmN3MWl0ZGQ3'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-pink-700 font-extrabold hover:underline flex items-center gap-1"
                        >
                          <Instagram className="w-3.5 h-3.5 text-pink-600" />
                          <span>{settings.instagramHandle || '@ruma__cutegirl'}</span>
                        </a>
                        <span className="text-purple-300">•</span>
                        <span className="text-xs text-purple-900/60 font-semibold">Premium Creator Hub</span>
                      </div>
                    </div>

                    {/* Bio text */}
                    <p className="text-xs sm:text-sm text-purple-900/80 max-w-xl leading-relaxed font-medium">
                      {cfg.hero?.description || settings.tagline || 'Exclusive 4K Uncut Photosets & Video Reels. 100% Instant Delivery via Secure Direct UPI.'}
                    </p>

                    {/* Real-time Performance & Trust Metrics Grid */}
                    {(cfg.profile?.showStats ?? true) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
                        <div className="p-3 rounded-2xl bg-white/80 border border-purple-100 text-center shadow-xs">
                          <span className="font-display text-base sm:text-xl font-black text-purple-950 block">
                            {settings.postsCount || '50+'}
                          </span>
                          <span className="text-[10px] sm:text-xs text-purple-900/70 font-semibold">VIP Drops</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/80 border border-purple-100 text-center shadow-xs">
                          <span className="font-display text-base sm:text-xl font-black text-purple-950 block">
                            {typeof settings.followersCount === 'number' ? settings.followersCount.toLocaleString() : settings.followersCount || '150K+'}
                          </span>
                          <span className="text-[10px] sm:text-xs text-purple-900/70 font-semibold">Followers</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-pink-50/80 border border-pink-200/80 text-center shadow-xs">
                          <span className="font-display text-base sm:text-xl font-black text-pink-700 block flex items-center justify-center gap-1">
                            <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                            0-Sec
                          </span>
                          <span className="text-[10px] sm:text-xs text-pink-900/70 font-semibold">Auto Unlock</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-center shadow-xs">
                          <span className="font-display text-base sm:text-xl font-black text-amber-700 block flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            4.9 / 5.0
                          </span>
                          <span className="text-[10px] sm:text-xs text-amber-900/70 font-semibold">Member Rating</span>
                        </div>
                      </div>
                    )}

                    {/* Action CTAs */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 pt-2">
                      <button
                        id="hero-btn-explore-feed"
                        onClick={() => onNavigate('content')}
                        className="glow-pink-btn px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-white flex items-center gap-2 shadow-lg shadow-pink-500/25 hover:scale-[1.02] transition-transform cursor-pointer"
                      >
                        <Flame className="w-4 h-4 text-yellow-300" />
                        <span>{cfg.hero?.ctaText || 'View VIP Releases'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        id="hero-btn-daily-spin"
                        onClick={() => setIsWheelOpen(true)}
                        className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer"
                      >
                        <Gift className="w-4 h-4 text-yellow-200 animate-bounce" />
                        <span>डेली स्पिन (Free Wheel)</span>
                      </button>

                      {(cfg.profile?.showInstagramBtn ?? true) && (
                        <a
                          id="hero-btn-instagram"
                          href={settings.instagramUrl || 'https://www.instagram.com/ruma__cutegirl?igsi=cXo3ZmN3MWl0ZGQ3'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-black text-purple-950 bg-white hover:bg-pink-50 border border-purple-200 transition-all flex items-center gap-2 shadow-sm"
                        >
                          <Instagram className="w-4 h-4 text-pink-600" />
                          <span>Instagram</span>
                        </a>
                      )}

                      {/* Share Profile / Hub Button */}
                      {onOpenShare && (
                        <button
                          id="hero-btn-share-hub"
                          type="button"
                          onClick={() => onOpenShare()}
                          className="px-4 py-3 rounded-2xl text-xs sm:text-sm font-black text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200/80 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                          title="प्रोफाइल शेयर करें"
                        >
                          <Share2 className="w-4 h-4 text-pink-600" />
                          <span>शेयर</span>
                        </button>
                      )}
                    </div>

                    {/* Trust Guarantees Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-purple-100/80 text-left">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/50">
                        <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
                        <div>
                          <div className="text-[10px] font-black text-purple-950 leading-tight">100% Private</div>
                          <div className="text-[9px] text-purple-900/60 font-semibold">Discreet Access</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-xl bg-pink-50/50">
                        <Zap className="w-4 h-4 text-pink-600 shrink-0" />
                        <div>
                          <div className="text-[10px] font-black text-purple-950 leading-tight">Instant UPI</div>
                          <div className="text-[9px] text-pink-700 font-semibold">GPay • PhonePe • Paytm</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/50">
                        <Film className="w-4 h-4 text-amber-700 shrink-0" />
                        <div>
                          <div className="text-[10px] font-black text-purple-950 leading-tight">4K Ultra HD</div>
                          <div className="text-[9px] text-amber-800 font-semibold">Original Masters</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50/50">
                        <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                        <div>
                          <div className="text-[10px] font-black text-purple-950 leading-tight">VIP Support</div>
                          <div className="text-[9px] text-rose-700 font-semibold">24/7 Instagram DM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stories / Highlights Carousel */}
                {(cfg.storyHighlights?.enabled ?? true) && settings.storyHighlights?.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-pink-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {cfg.storyHighlights?.title || 'Story Highlights & Teasers'}
                      </span>
                      <span className="text-[11px] text-purple-900/60 font-medium">Tap to preview teasers</span>
                    </div>
                    <StoryHighlights highlights={settings.storyHighlights} />
                  </div>
                )}
              </div>

              {/* VIP Quick Category Filter Bar */}
              <div className="sticky top-14 z-20 py-2 px-1 bg-white/80 backdrop-blur-xl border border-purple-100/90 rounded-2xl shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-black uppercase text-purple-900/60 px-2 shrink-0 hidden sm:inline-block">
                  Categories:
                </span>
                <button
                  onClick={() => document.getElementById('section-featured')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-purple-950 text-white shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer hover:bg-purple-900"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>All Drops ({content.length})</span>
                </button>
                {vipPacks.length > 0 && (
                  <button
                    onClick={() => document.getElementById('section-vipPacks')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-3 py-1.5 rounded-xl text-xs font-black bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5 text-rose-600" />
                    <span>VIP Bundles ({vipPacks.length})</span>
                  </button>
                )}
                {latestVideos.length > 0 && (
                  <button
                    onClick={() => document.getElementById('section-latestVideos')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-3 py-1.5 rounded-xl text-xs font-black bg-white text-purple-900 hover:bg-purple-50 border border-purple-200 shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Film className="w-3.5 h-3.5 text-pink-600" />
                    <span>4K Videos ({latestVideos.length})</span>
                  </button>
                )}
                {latestPhotos.length > 0 && (
                  <button
                    onClick={() => document.getElementById('section-latestPhotos')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-3 py-1.5 rounded-xl text-xs font-black bg-white text-purple-900 hover:bg-purple-50 border border-purple-200 shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                    <span>HD Photos ({latestPhotos.length})</span>
                  </button>
                )}
                {freeItems.length > 0 && (
                  <button
                    onClick={() => document.getElementById('section-freeSamples')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-3 py-1.5 rounded-xl text-xs font-black bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Free Previews ({freeItems.length})</span>
                  </button>
                )}
              </div>

              {/* VIP Engagement & Retention Section: Hot Drops Banner */}
              <div>
                <HotDropCountdownBanner
                  onOpenWheel={() => setIsWheelOpen(true)}
                  onExploreVip={() => onNavigate('content')}
                />
              </div>

            </div>
          </section>
        );

      case 'featured':
        if (cfg.featured && !cfg.featured.enabled) return null;
        if (featuredContent.length === 0) return null;
        return (
          <section key="featured" id="section-featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-pink-100 text-pink-600 border border-pink-200">
                    <Flame className="w-4 h-4" />
                  </span>
                  <h2 className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-purple-950">
                    {cfg.featured?.title || 'Featured VIP Releases'}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-purple-900/70 mt-1 font-medium">
                  {cfg.featured?.subtitle || 'Trending high-resolution sets and uncut master videos.'}
                </p>
              </div>

              <button
                onClick={() => onNavigate('content')}
                className="text-xs sm:text-sm font-extrabold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({content.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {featuredContent.map((item, idx) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  priority={idx < 2}
                  isUnlocked={unlockedIds.includes(item.id)}
                  onOpen={onOpenMedia}
                  onBuy={onBuyMedia}
                  onPeek={(peeked) => {
                    setPeekItem(peeked);
                    setIsPeekModalOpen(true);
                  }}
                  onOpenShare={onOpenShare}
                />
              ))}
            </div>
          </section>
        );

      case 'vipPacks':
        if (cfg.vipPacks && !cfg.vipPacks.enabled) return null;
        if (vipPacks.length === 0) return null;
        return (
          <div key="vipPacks" id="section-vipPacks" className="render-fast">
            <Suspense fallback={null}>
              <PricingPacks
                packs={vipPacks}
                unlockedIds={unlockedIds}
                onBuy={onBuyMedia}
                onOpen={onOpenMedia}
              />
            </Suspense>
          </div>
        );

      case 'latestVideos':
        if (cfg.latestVideos && !cfg.latestVideos.enabled) return null;
        if (latestVideos.length === 0) return null;
        return (
          <section key="latestVideos" id="section-latestVideos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 render-fast">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-pink-100 text-pink-600 border border-pink-200">
                  <Film className="w-4 h-4" />
                </span>
                <h2 className="font-display font-black text-xl sm:text-2xl text-purple-950">
                  {cfg.latestVideos?.title || 'Latest Video Reels & Backstage'}
                </h2>
              </div>

              <button
                onClick={() => onNavigate('content')}
                className="text-xs font-bold text-pink-600 hover:underline cursor-pointer"
              >
                See All Videos →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {latestVideos.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  isUnlocked={unlockedIds.includes(item.id)}
                  onOpen={onOpenMedia}
                  onBuy={onBuyMedia}
                  onPeek={(peeked) => {
                    setPeekItem(peeked);
                    setIsPeekModalOpen(true);
                  }}
                  onOpenShare={onOpenShare}
                />
              ))}
            </div>
          </section>
        );

      case 'latestPhotos':
        if (cfg.latestPhotos && !cfg.latestPhotos.enabled) return null;
        if (latestPhotos.length === 0) return null;
        return (
          <section key="latestPhotos" id="section-latestPhotos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 render-fast">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-pink-100 text-pink-600 border border-pink-200">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <h2 className="font-display font-black text-xl sm:text-2xl text-purple-950">
                  {cfg.latestPhotos?.title || 'Latest HD Photo Drops'}
                </h2>
              </div>

              <button
                onClick={() => onNavigate('content')}
                className="text-xs font-bold text-pink-600 hover:underline cursor-pointer"
              >
                See All Photos →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {latestPhotos.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  isUnlocked={unlockedIds.includes(item.id)}
                  onOpen={onOpenMedia}
                  onBuy={onBuyMedia}
                  onPeek={(peeked) => {
                    setPeekItem(peeked);
                    setIsPeekModalOpen(true);
                  }}
                  onOpenShare={onOpenShare}
                />
              ))}
            </div>
          </section>
        );

      case 'freeSamples':
        if (cfg.freeSamples && !cfg.freeSamples.enabled) return null;
        if (freeItems.length === 0) return null;
        return (
          <section key="freeSamples" id="section-freeSamples" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 render-fast">
            <div className="p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/90 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wider shadow-sm">
                    Zero Cost Previews
                  </span>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-purple-950 mt-2">
                    {cfg.freeSamples?.title || 'Free Lifestyle & Workout Samples'}
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-900/70 mt-1 font-medium">
                    {cfg.freeSamples?.subtitle || 'Enjoy these complimentary photos and clips before unlocking VIP sets.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {freeItems.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    isUnlocked={true}
                    onOpen={onOpenMedia}
                    onBuy={onBuyMedia}
                    onOpenShare={onOpenShare}
                  />
                ))}
              </div>
            </div>
          </section>
        );

      case 'reviews':
        return (
          <section key="reviews" id="section-reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 render-fast">
            <div className="rounded-3xl bg-gradient-to-br from-white/95 via-purple-50/40 to-pink-50/30 border border-pink-200/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-3 py-0.5 rounded-full text-[11px] font-black bg-pink-100 text-pink-700 border border-pink-200 uppercase tracking-wider">
                      ★ VERIFIED VIP COMMUNITY
                    </span>
                    <span className="text-xs text-purple-900/70 font-bold">2,800+ Active VIP Members</span>
                  </div>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-purple-950">
                    VIP Members Feedback & Ratings
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-900/70 font-medium mt-0.5">
                    100% Genuine reviews from verified subscribers across India.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white/90 border border-pink-200/80 px-4 py-2.5 rounded-2xl shadow-xs self-start sm:self-auto">
                  <div className="flex text-amber-400 text-sm sm:text-base">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <div className="border-l border-purple-100 pl-3">
                    <div className="text-base font-black text-purple-950 leading-tight">4.9 / 5.0</div>
                    <div className="text-[10px] text-purple-900/60 font-semibold">Satisfaction Score</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-5 rounded-2xl bg-white/90 border border-purple-100/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                    <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ Verified Member
                    </span>
                  </div>
                  <p className="text-xs text-purple-900/85 leading-relaxed font-medium">
                    "UPI scan karte hi bina kisi wait ke 2 second me video unlock ho gayi! Quality is pure 4K master copy. Best experience!"
                  </p>
                  <div className="flex items-center gap-2.5 pt-2 border-t border-purple-50 text-[11px]">
                    <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 font-black flex items-center justify-center text-xs">
                      R
                    </div>
                    <div>
                      <div className="font-bold text-purple-950">Rahul K.</div>
                      <div className="text-[10px] text-purple-900/50">Mumbai • VIP All-Access</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/90 border border-purple-100/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                    <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ Verified Member
                    </span>
                  </div>
                  <p className="text-xs text-purple-900/85 leading-relaxed font-medium">
                    "Full photoset bilkul clean aur high resolution me hai. Daily spin wheel me coupon mila to aur sasta pada. Support is super fast on Instagram!"
                  </p>
                  <div className="flex items-center gap-2.5 pt-2 border-t border-purple-50 text-[11px]">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs">
                      V
                    </div>
                    <div>
                      <div className="font-bold text-purple-950">Vikas S.</div>
                      <div className="text-[10px] text-purple-900/50">Delhi • VIP Member</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/90 border border-purple-100/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                    <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ Verified Member
                    </span>
                  </div>
                  <p className="text-xs text-purple-900/85 leading-relaxed font-medium">
                    "Zero hassle. Koi extra login ya password banane ka jhanjhat nahi. Direct UPI payment and instant access. Super safe and private!"
                  </p>
                  <div className="flex items-center gap-2.5 pt-2 border-t border-purple-50 text-[11px]">
                    <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 font-black flex items-center justify-center text-xs">
                      A
                    </div>
                    <div>
                      <div className="font-bold text-purple-950">Amit P.</div>
                      <div className="text-[10px] text-purple-900/50">Bangalore • VIP Member</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'howItWorks':
        if (cfg.howItWorks && !cfg.howItWorks.enabled) return null;
        return (
          <div key="howItWorks" className="render-fast">
            <Suspense fallback={<div className="h-40 flex items-center justify-center text-purple-400 text-xs">Loading guide...</div>}>
              <HowItWorks />
            </Suspense>
          </div>
        );

      case 'faq':
        if (cfg.faq && !cfg.faq.enabled) return null;
        return (
          <div key="faq" className="render-fast">
            <Suspense fallback={<div className="h-40 flex items-center justify-center text-purple-400 text-xs">Loading FAQ...</div>}>
              <FAQSection />
            </Suspense>
          </div>
        );

      default:
        return null;
    }
  };

  const sectionOrder = useMemo(() => {
    const defaultOrder = ['hero', 'featured', 'vipPacks', 'latestVideos', 'latestPhotos', 'freeSamples', 'reviews', 'howItWorks', 'faq'];
    const custom = cfg.sectionOrder || defaultOrder;
    if (!custom.includes('reviews')) {
      const idx = custom.indexOf('howItWorks');
      if (idx !== -1) {
        const copy = [...custom];
        copy.splice(idx, 0, 'reviews');
        return copy;
      }
      return [...custom, 'reviews'];
    }
    return custom;
  }, [cfg.sectionOrder]);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 relative">
      {/* Top Hot Flash Sale Urgency Banner */}
      <HotFlashSaleStickyBanner
        onUnlockFlashSale={() => {
          const target = featuredContent[0] || content[0];
          if (target) onBuyMedia(target);
        }}
      />

      {sectionOrder.map((secKey) => renderSection(secKey))}

      {/* Floating Daily Reward Gift Button (Sticky at Bottom Right) */}
      <button
        id="floating-daily-reward-btn"
        onClick={() => setIsWheelOpen(true)}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 p-3 sm:p-3.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white shadow-xl shadow-rose-600/30 border-2 border-yellow-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer animate-pulse"
        title="स्पिन करें और डेली कूपन जीतें!"
      >
        <Gift className="w-5 h-5 text-yellow-200" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-xs font-black text-white px-0 group-hover:px-1">
          डेली लकी स्पिन
        </span>
      </button>

      {/* Daily Reward Wheel Modal (Loaded on Demand) */}
      {isWheelOpen && (
        <Suspense fallback={null}>
          <DailyRewardWheelModal
            isOpen={isWheelOpen}
            onClose={() => setIsWheelOpen(false)}
          />
        </Suspense>
      )}

      {/* 1-Sec VIP Sneak Peek Preview Modal (Loaded on Demand) */}
      {isPeekModalOpen && (
        <Suspense fallback={null}>
          <TeaserPeekModal
            item={peekItem}
            isOpen={isPeekModalOpen}
            onClose={() => {
              setIsPeekModalOpen(false);
              setPeekItem(null);
            }}
            onUnlock={(item) => onBuyMedia(item)}
          />
        </Suspense>
      )}

      {/* Special Exit-Intent Retention & Discount Modal (Loaded on Demand) */}
      {isExitModalOpen && (
        <Suspense fallback={null}>
          <StopUserExitModal
            isOpen={isExitModalOpen}
            onClose={() => setIsExitModalOpen(false)}
            onUnlockItem={(item) => onBuyMedia(item)}
            onOpenWheel={() => setIsWheelOpen(true)}
            featuredItem={featuredContent[0] || content[0]}
          />
        </Suspense>
      )}
    </div>
  );
};
