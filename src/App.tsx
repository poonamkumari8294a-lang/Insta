import React, { useState, useEffect } from 'react';
import { MediaItem, SiteSettings } from './types';
import {
  fetchSiteSettings,
  fetchContentList,
  getStoredTokens
} from './utils/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomMobileNav } from './components/BottomMobileNav';
import { PurchasedDrawer } from './components/PurchasedDrawer';
import { PaymentModal } from './components/PaymentModal';
import { MediaModal } from './components/MediaModal';
import { ShareModal } from './components/ShareModal';
import { HomePage } from './pages/HomePage';
import { ContentFeedPage } from './pages/ContentFeedPage';
import { ContentDetailPage } from './pages/ContentDetailPage';
import { LegalPages } from './pages/LegalPages';
import { AdminPage } from './pages/AdminPage';
import { PricingPacks } from './components/PricingPacks';
import { HowItWorks } from './components/HowItWorks';
import { Sparkles, RefreshCw } from 'lucide-react';

const getRouteFromUrl = (): { route: string; mediaId?: string } => {
  try {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    const path = window.location.pathname.replace(/^\//, '').toLowerCase();
    const params = new URLSearchParams(window.location.search);

    if (
      hash === 'admin' ||
      hash === 'admin-login' ||
      hash === 'secret-admin' ||
      hash === 'creator-admin' ||
      path === 'admin' ||
      path === 'secret-admin' ||
      params.get('admin') === 'true'
    ) {
      return { route: 'admin' };
    }

    if (hash === 'vip-packs' || hash === 'packs') return { route: 'vip-packs' };
    if (hash === 'how-it-works' || hash === 'guide') return { route: 'how-it-works' };
    if (hash === 'content' || hash === 'gallery' || hash === 'explore') return { route: 'content' };
    if (hash === 'terms' || hash === 'privacy' || hash === 'refund' || hash === 'contact') return { route: hash };

    if (hash.startsWith('media/')) {
      const id = hash.replace('media/', '');
      return { route: 'detail', mediaId: id };
    }
  } catch (e) {
    console.error('URL parse error:', e);
  }

  return { route: 'home' };
};

export default function App() {
  // Navigation Route from initial URL
  const initialUrlRoute = getRouteFromUrl();
  const [currentRoute, setCurrentRoute] = useState<string>(initialUrlRoute.route);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(initialUrlRoute.mediaId || null);

  // Data States
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [content, setContent] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unlocked Access Tokens state
  const [unlockedTokens, setUnlockedTokens] = useState<Record<string, string>>({});

  // Modals & Drawers
  const [purchasingItem, setPurchasingItem] = useState<MediaItem | null>(null);
  const [activeMediaItem, setActiveMediaItem] = useState<MediaItem | null>(null);
  const [isPurchasedDrawerOpen, setIsPurchasedDrawerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareItem, setShareItem] = useState<MediaItem | null>(null);

  // Sync unlocked tokens
  const refreshTokens = () => {
    setUnlockedTokens(getStoredTokens());
  };

  const handleOpenShare = (item?: MediaItem | null) => {
    setShareItem(item || null);
    setIsShareModalOpen(true);
  };

  // Initial Data Load
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      refreshTokens();
      const [settingsData, contentData] = await Promise.all([
        fetchSiteSettings(),
        fetchContentList()
      ]);
      setSettings(settingsData);
      setContent(contentData);
    } catch (err: any) {
      console.error('App init error:', err);
      setError(err.message || 'Failed to connect to backend service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for hash & URL changes (e.g. typing #admin in URL bar)
    const handleUrlChange = () => {
      const { route, mediaId } = getRouteFromUrl();
      setCurrentRoute(route);
      if (mediaId) setSelectedMediaId(mediaId);
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Handle URL changes & browser history
  const navigateTo = (route: string, mediaId?: string) => {
    setCurrentRoute(route);
    if (mediaId) {
      setSelectedMediaId(mediaId);
    }

    // Sync browser hash / history cleanly
    if (route === 'admin') {
      window.location.hash = '#admin';
    } else if (route === 'home') {
      if (window.location.hash) {
        try {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (_) {
          window.location.hash = '';
        }
      }
    } else if (route === 'detail' && mediaId) {
      window.location.hash = `#media/${mediaId}`;
    } else {
      window.location.hash = `#${route}`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open item for viewing / watching
  const handleOpenMedia = (item: MediaItem) => {
    setActiveMediaItem(item);
  };

  // Initiate purchase modal
  const handleBuyMedia = (item: MediaItem) => {
    setPurchasingItem(item);
  };

  // Payment Success Handler
  const handlePaymentSuccess = (item: MediaItem) => {
    refreshTokens();
    setPurchasingItem(null);
    setActiveMediaItem(item);
  };

  const unlockedIds = Object.keys(unlockedTokens);
  const unlockedItems = content.filter((c) => unlockedIds.includes(c.id) || c.access === 'free');

  if (loading && !settings) {
    return (
      <div className="min-h-screen bg-[#fdf2f8] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Floating Frosted Ambient Blurs */}
        <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-400/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="glass-card rounded-3xl p-8 max-w-sm text-center space-y-4 border border-white/80 shadow-2xl relative z-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 mx-auto shadow-lg shadow-pink-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-pink-600 animate-spin" />
            </div>
          </div>
          <h2 className="font-display font-black text-xl text-purple-950">Loading VIP Gallery</h2>
          <p className="text-xs text-purple-900/70 font-medium">Connecting to instant payment server & media vault...</p>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="min-h-screen bg-[#fdf2f8] flex flex-col items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 max-w-md text-center space-y-4 border border-rose-200">
          <h2 className="font-display font-black text-xl text-rose-900">Connection Error</h2>
          <p className="text-xs text-rose-800">{error}</p>
          <button
            onClick={loadData}
            className="glow-pink-btn px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  const activeContentItem = selectedMediaId
    ? content.find((c) => c.id === selectedMediaId) || content[0]
    : null;

  return (
    <div className="min-h-screen bg-[#fdf2f8] text-purple-950 flex flex-col relative overflow-x-hidden selection:bg-pink-500 selection:text-white">
      
      {/* Background Floating Ambient Orbs (Frosted Glass Aesthetic) */}
      <div className="fixed top-[-5%] left-[-5%] w-[550px] h-[550px] bg-pink-400/25 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[550px] h-[550px] bg-purple-400/25 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-[40%] right-[10%] w-[450px] h-[450px] bg-blue-300/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-[65%] left-[5%] w-[400px] h-[400px] bg-pink-300/20 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Main Sticky Header */}
      {settings && (
        <Header
          settings={settings}
          unlockedCount={unlockedIds.length}
          onOpenPurchases={() => setIsPurchasedDrawerOpen(true)}
          onOpenShare={() => handleOpenShare(null)}
          activeTab={currentRoute}
          onNavigate={(route) => navigateTo(route)}
        />
      )}

      {/* Main Page Routing Views with Mobile Bottom Bar Clearance */}
      <main className="flex-1 pb-20 md:pb-6">
        {settings && currentRoute === 'home' && (
          <HomePage
            settings={settings}
            content={content}
            unlockedIds={unlockedIds}
            onOpenMedia={handleOpenMedia}
            onBuyMedia={handleBuyMedia}
            onOpenShare={(item) => handleOpenShare(item)}
            onNavigate={(route) => navigateTo(route)}
          />
        )}

        {currentRoute === 'content' && (
          <ContentFeedPage
            content={content}
            unlockedIds={unlockedIds}
            onOpenMedia={handleOpenMedia}
            onBuyMedia={handleBuyMedia}
            onOpenShare={(item) => handleOpenShare(item)}
          />
        )}

        {currentRoute === 'vip-packs' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PricingPacks
              packs={content.filter((c) => c.type === 'pack')}
              unlockedIds={unlockedIds}
              onBuy={handleBuyMedia}
              onOpen={handleOpenMedia}
            />
          </div>
        )}

        {currentRoute === 'how-it-works' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <HowItWorks />
          </div>
        )}

        {currentRoute === 'detail' && activeContentItem && (
          <ContentDetailPage
            item={activeContentItem}
            allContent={content}
            isUnlocked={unlockedIds.includes(activeContentItem.id)}
            onBack={() => navigateTo('content')}
            onBuy={handleBuyMedia}
            onOpenMedia={handleOpenMedia}
            onOpenShare={(item) => handleOpenShare(item)}
          />
        )}

        {(currentRoute === 'terms' ||
          currentRoute === 'privacy' ||
          currentRoute === 'refund' ||
          currentRoute === 'contact') &&
          settings && (
            <LegalPages
              pageType={currentRoute as any}
              settings={settings}
              onNavigate={(route) => navigateTo(route)}
            />
          )}

        {currentRoute === 'admin' && (
          <AdminPage
            onBackToSite={() => navigateTo('home')}
            onSettingsUpdated={(newSettings) => setSettings(newSettings)}
          />
        )}
      </main>

      {/* Footer */}
      {settings && (
        <Footer
          settings={settings}
          onNavigate={(route) => navigateTo(route)}
        />
      )}

      {/* Bottom Floating Mobile Navigation */}
      <BottomMobileNav
        activeTab={currentRoute}
        unlockedCount={unlockedIds.length}
        onNavigate={(route) => navigateTo(route)}
        onOpenPurchases={() => setIsPurchasedDrawerOpen(true)}
        onOpenShare={() => handleOpenShare(null)}
      />

      {/* Payment Checkout Modal (UPI Dynamic QR) */}
      <PaymentModal
        item={purchasingItem}
        onClose={() => setPurchasingItem(null)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Media Fullscreen Viewer Modal */}
      {settings && (
        <MediaModal
          item={activeMediaItem}
          onClose={() => setActiveMediaItem(null)}
          creatorName={settings.creatorName}
        />
      )}

      {/* Share Modal (Social links, WhatsApp, Instagram, Telegram, QR code download) */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        item={shareItem}
        settings={settings}
      />

      {/* My Unlocks Slide-over Drawer */}
      <PurchasedDrawer
        isOpen={isPurchasedDrawerOpen}
        onClose={() => setIsPurchasedDrawerOpen(false)}
        unlockedItems={unlockedItems}
        onOpenItem={(item) => {
          setIsPurchasedDrawerOpen(false);
          handleOpenMedia(item);
        }}
        onExplore={() => {
          setIsPurchasedDrawerOpen(false);
          navigateTo('content');
        }}
      />

    </div>
  );
}
