import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { BadgeCheck, Instagram, Sparkles, Lock, Menu, X, ShieldCheck, Heart, Film, Share2 } from 'lucide-react';

interface HeaderProps {
  settings: SiteSettings;
  unlockedCount: number;
  onOpenPurchases: () => void;
  onOpenShare?: () => void;
  activeTab: string;
  onNavigate: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  unlockedCount,
  onOpenPurchases,
  onOpenShare,
  activeTab,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-pink-200/60 bg-white/95 backdrop-blur-md transition-all shadow-xs hardware-accelerated">
      {/* Top Notification / VIP Announcement Banner */}
      {settings.announcementEnabled && settings.announcement && (
        <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 text-white text-xs font-semibold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 overflow-hidden shadow-inner">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300 shrink-0" />
          <span className="truncate">{settings.announcement}</span>
          <span className="hidden sm:inline-block bg-white/25 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider shrink-0">VIP Access</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Creator Brand / Logo */}
          <div 
            id="header-brand-logo"
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-105 transition-transform duration-300 shadow-md shadow-pink-500/20">
                <img
                  src={settings.profilePicUrl}
                  alt={settings.creatorName}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-pink-600 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                <Heart className="w-2.5 h-2.5 fill-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-base sm:text-xl text-purple-950 tracking-tight group-hover:text-pink-600 transition-colors">
                  {settings.creatorName}
                </span>
                <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 fill-blue-500/20 shrink-0" />
              </div>
              <p className="text-xs text-purple-900/60 font-semibold hidden sm:block">
                {settings.instagramHandle} • VIP Hub
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              id="nav-btn-home"
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'home'
                  ? 'bg-white/90 text-pink-600 border border-pink-200 shadow-sm'
                  : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/50'
              }`}
            >
              Home
            </button>

            <button
              id="nav-btn-feed"
              onClick={() => onNavigate('content')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'content'
                  ? 'bg-white/90 text-pink-600 border border-pink-200 shadow-sm'
                  : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/50'
              }`}
            >
              All Content
            </button>

            <button
              id="nav-btn-vip"
              onClick={() => onNavigate('vip-packs')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'vip-packs'
                  ? 'bg-white/90 text-pink-600 border border-pink-200 shadow-sm'
                  : 'text-pink-600 hover:text-pink-700 hover:bg-pink-50/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              VIP Packs
            </button>

            <button
              id="nav-btn-how-it-works"
              onClick={() => onNavigate('how-it-works')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'how-it-works'
                  ? 'bg-white/90 text-pink-600 border border-pink-200 shadow-sm'
                  : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/50'
              }`}
            >
              How It Works
            </button>

            <a
              id="nav-link-instagram"
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-full text-xs font-bold text-pink-700 bg-white/70 hover:bg-white border border-pink-200/70 shadow-sm transition-all flex items-center gap-1.5"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-600" />
              <span>Instagram</span>
            </a>
          </nav>

          {/* Right Actions: Share, My Purchases & Instant Unlock Button */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Share Button (Desktop & Tablet) */}
            {onOpenShare && (
              <button
                id="header-btn-share"
                type="button"
                onClick={onOpenShare}
                className="px-3 py-2 rounded-2xl text-xs font-bold text-purple-900 bg-white/80 hover:bg-pink-50 border border-purple-200/60 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                title="वेबसाइट शेयर करें (Share VIP Hub)"
              >
                <Share2 className="w-3.5 h-3.5 text-pink-600" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}

            <button
              id="header-btn-my-purchases"
              onClick={onOpenPurchases}
              className="relative px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold text-purple-900 bg-white/80 hover:bg-white border border-purple-200/60 shadow-sm transition-all flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-pink-600" />
              <span className="hidden xs:inline">My Unlocks</span>
              {unlockedCount > 0 ? (
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  {unlockedCount}
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-pink-400"></span>
              )}
            </button>

            <button
              id="header-btn-explore-cta"
              onClick={() => onNavigate('content')}
              className="glow-pink-btn px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 shrink-0 shadow-md"
            >
              <Film className="w-4 h-4" />
              <span className="hidden xs:inline">Unlock Content</span>
              <span className="xs:hidden">VIP</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="header-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-2xl text-purple-900 bg-white/70 border border-purple-100 hover:bg-white shadow-sm"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/60 bg-white/90 backdrop-blur-2xl px-4 py-5 space-y-3 animate-in slide-in-from-top duration-200 shadow-2xl">
          <div className="flex items-center gap-3 pb-3 border-b border-purple-100">
            <img
              src={settings.profilePicUrl}
              alt={settings.creatorName}
              className="w-10 h-10 rounded-full border-2 border-pink-400 object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="font-bold text-purple-950 text-sm flex items-center gap-1">
                {settings.creatorName}
                <BadgeCheck className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xs text-purple-900/70">{settings.viewsCount} monthly views • {settings.followersCount.toLocaleString()} followers</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-2xl bg-white/80 border border-purple-100 text-left font-bold text-xs text-purple-950 hover:bg-pink-50 shadow-sm"
            >
              🏠 Home
            </button>

            <button
              onClick={() => {
                onNavigate('content');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-2xl bg-white/80 border border-purple-100 text-left font-bold text-xs text-purple-950 hover:bg-pink-50 shadow-sm"
            >
              🎬 All Content
            </button>

            <button
              onClick={() => {
                onNavigate('vip-packs');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-2xl bg-pink-50 border border-pink-200 text-left font-bold text-xs text-pink-700 shadow-sm"
            >
              👑 VIP Packs
            </button>

            <button
              onClick={() => {
                onNavigate('how-it-works');
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-2xl bg-white/80 border border-purple-100 text-left font-bold text-xs text-purple-950 hover:bg-pink-50 shadow-sm"
            >
              ⚡ How It Works
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {onOpenShare && (
              <button
                type="button"
                onClick={() => {
                  onOpenShare();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 hover:brightness-105 flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Share2 className="w-4 h-4 text-white" />
                <span>वेबसाइट दोस्तों के साथ शेयर करें (Share VIP Hub)</span>
              </button>
            )}

            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-pink-700 bg-white border border-pink-200 flex items-center justify-center gap-2 shadow-sm"
            >
              <Instagram className="w-4 h-4 text-pink-600" />
              <span>Follow {settings.instagramHandle} on Instagram</span>
            </a>

            <div className="flex items-center justify-between text-[11px] text-purple-900/60 px-1 pt-1 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified UPI Instant Delivery
              </span>
              <button 
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="text-pink-600 hover:underline font-bold"
              >
                Creator Login
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

