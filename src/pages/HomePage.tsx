import React from 'react';
import { SiteSettings, MediaItem } from '../types';
import { StoryHighlights } from '../components/StoryHighlights';
import { ContentCard } from '../components/ContentCard';
import { HowItWorks } from '../components/HowItWorks';
import { PricingPacks } from '../components/PricingPacks';
import { FAQSection } from '../components/FAQSection';
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
  Heart
} from 'lucide-react';

interface HomePageProps {
  settings: SiteSettings;
  content: MediaItem[];
  unlockedIds: string[];
  onOpenMedia: (item: MediaItem) => void;
  onBuyMedia: (item: MediaItem) => void;
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  content,
  unlockedIds,
  onOpenMedia,
  onBuyMedia,
  onNavigate,
}) => {
  const featuredContent = content.filter((c) => c.featured);
  const latestPhotos = content.filter((c) => c.type === 'photo').slice(0, 4);
  const latestVideos = content.filter((c) => c.type === 'video').slice(0, 4);
  const freeItems = content.filter((c) => c.access === 'free');
  const vipPacks = content.filter((c) => c.type === 'pack');

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* Hero Creator Section */}
      <section className="relative pt-6 sm:pt-10">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-tr from-pink-300/30 via-purple-300/20 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/80 shadow-2xl relative overflow-hidden">
            
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10">
              
              {/* Creator Profile Photo */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full p-1 bg-gradient-to-tr from-yellow-300 via-pink-400 to-purple-500 shadow-2xl shadow-pink-500/25">
                  <div className="w-full h-full rounded-full p-1 bg-white overflow-hidden shadow-inner">
                    <img
                      src={settings.profilePicUrl}
                      alt={settings.creatorName}
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Mood Tag */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/95 border border-pink-300 text-pink-700 text-[10px] sm:text-xs font-black px-3.5 py-0.5 rounded-full shadow-md whitespace-nowrap flex items-center gap-1">
                  <span>Pretty mood always 💋</span>
                </div>
              </div>

              {/* Creator Bio & Stats */}
              <div className="flex-1 text-center md:text-left space-y-4">
                
                {/* Name & Handle */}
                <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-purple-950 tracking-tight">
                      {settings.creatorName}
                    </h1>
                    <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500/20" />
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-pink-100 text-pink-700 border border-pink-200 shadow-sm">
                      VIP Creator
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-pink-700 font-bold mt-1">
                    {settings.instagramHandle} • Official Premium Hub
                  </p>
                </div>

                {/* Bio text */}
                <p className="text-xs sm:text-sm text-purple-900/80 max-w-xl leading-relaxed font-medium">
                  {settings.tagline}
                </p>

                {/* Real-time stats row */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/70 border border-purple-100 text-center min-w-[90px] shadow-sm">
                    <span className="font-display text-base sm:text-xl font-black text-purple-950 block">
                      {settings.postsCount}
                    </span>
                    <span className="text-[10px] sm:text-xs text-purple-900/70 font-semibold">VIP Posts</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/70 border border-purple-100 text-center min-w-[90px] shadow-sm">
                    <span className="font-display text-base sm:text-xl font-black text-purple-950 block">
                      {settings.followersCount.toLocaleString()}
                    </span>
                    <span className="text-[10px] sm:text-xs text-purple-900/70 font-semibold">Followers</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-pink-50/80 border border-pink-200 text-center min-w-[110px] shadow-sm">
                    <span className="font-display text-base sm:text-xl font-black text-pink-700 block flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      {settings.viewsCount}
                    </span>
                    <span className="text-[10px] sm:text-xs text-pink-800/80 font-bold">Monthly Views</span>
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <button
                    id="hero-btn-explore-feed"
                    onClick={() => onNavigate('content')}
                    className="glow-pink-btn px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-white flex items-center gap-2 shadow-lg shadow-pink-500/25"
                  >
                    <Flame className="w-4 h-4 text-yellow-300" />
                    <span>View Premium Feed</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    id="hero-btn-instagram"
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-black text-purple-950 bg-white hover:bg-pink-50 border border-purple-200 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Instagram className="w-4 h-4 text-pink-600" />
                    <span>Instagram Profile</span>
                  </a>
                </div>

              </div>

            </div>

            {/* Stories / Highlights Carousel */}
            <div className="mt-8 pt-6 border-t border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-pink-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Story Highlights & Teasers
                </span>
                <span className="text-[11px] text-purple-900/60 font-medium">Tap to play stories</span>
              </div>
              <StoryHighlights highlights={settings.storyHighlights} />
            </div>

          </div>
        </div>
      </section>

      {/* Featured VIP Content Section */}
      {featuredContent.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-pink-100 text-pink-600 border border-pink-200">
                  <Flame className="w-4 h-4" />
                </span>
                <h2 className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-purple-950">
                  Featured VIP Releases
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-purple-900/70 mt-1 font-medium">
                Trending high-resolution sets and uncut master videos.
              </p>
            </div>

            <button
              onClick={() => onNavigate('content')}
              className="text-xs sm:text-sm font-extrabold text-pink-600 hover:text-pink-700 flex items-center gap-1"
            >
              <span>View All ({content.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {featuredContent.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                isUnlocked={unlockedIds.includes(item.id)}
                onOpen={onOpenMedia}
                onBuy={onBuyMedia}
              />
            ))}
          </div>
        </section>
      )}

      {/* VIP Combo Deals Section */}
      {vipPacks.length > 0 && (
        <PricingPacks
          packs={vipPacks}
          unlockedIds={unlockedIds}
          onBuy={onBuyMedia}
          onOpen={onOpenMedia}
        />
      )}

      {/* Latest Uncut Videos / Reels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-100 text-pink-600 border border-pink-200">
              <Film className="w-4 h-4" />
            </span>
            <h2 className="font-display font-black text-xl sm:text-2xl text-purple-950">
              Latest Video Reels & Backstage
            </h2>
          </div>

          <button
            onClick={() => onNavigate('content')}
            className="text-xs font-bold text-pink-600 hover:underline"
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
            />
          ))}
        </div>
      </section>

      {/* Free Sample Previews */}
      {freeItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/90 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wider shadow-sm">
                  Zero Cost Previews
                </span>
                <h3 className="font-display font-black text-xl sm:text-2xl text-purple-950 mt-2">
                  Free Lifestyle & Workout Samples
                </h3>
                <p className="text-xs sm:text-sm text-purple-900/70 mt-1 font-medium">
                  Enjoy these complimentary photos and clips before unlocking VIP sets.
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
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it Works Step Flow */}
      <HowItWorks />

      {/* FAQ Section */}
      <FAQSection />

    </div>
  );
};
