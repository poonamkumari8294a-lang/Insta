import React, { useState, useEffect, Suspense, lazy } from 'react';
import { MediaItem, SiteSettings } from './types';
import {
  fetchSiteSettings,
  subscribeToContentList,
  getCachedSiteSettingsSync,
  getCachedContentListSync,
  getStoredTokens,
  hasLocalSettingsCache,
  isCloudQuotaExhausted,
  resetQuotaCircuitBreaker
} from './utils/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomMobileNav } from './components/BottomMobileNav';
import { HomePage } from './pages/HomePage';
import { ContentFeedPage } from './pages/ContentFeedPage';
import { PricingPacks } from './components/PricingPacks';
import { HowItWorks } from './components/HowItWorks';
import { NotificationPermissionBanner } from './components/NotificationPermissionBanner';
import { ForegroundNotificationToast, ForegroundNotificationData } from './components/ForegroundNotificationToast';
import { LiveUnlockActivityToast } from './components/LiveUnlockActivityToast';
import { FloatingWhatsAppSupport } from './components/FloatingWhatsAppSupport';
import { NetworkSpeedBanner } from './components/NetworkSpeedBanner';
import { setupForegroundMessageListener } from './services/notificationService';
import { Sparkles, RefreshCw } from 'lucide-react';

// Code-split heavy chunks for Android Mobile fast loading
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const ContentDetailPage = lazy(() => import('./pages/ContentDetailPage').then(m => ({ default: m.ContentDetailPage })));
const LegalPages = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.LegalPages })));
const PaymentModal = lazy(() => import('./components/PaymentModal').then(m => ({ default: m.PaymentModal })));
const MediaModal = lazy(() => import('./components/MediaModal').then(m => ({ default: m.MediaModal })));
const ShareModal = lazy(() => import('./components/ShareModal').then(m => ({ default: m.ShareModal })));
const PurchasedDrawer = lazy(() => import('./components/PurchasedDrawer').then(m => ({ default: m.PurchasedDrawer })));

const FallbackLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
  </div>
);

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

  const initialHasCache = hasLocalSettingsCache();
  // Instant SWR Hydration (0ms First Contentful Paint if cached, clean loader if new device/incognito)
  const [settings, setSettings] = useState<SiteSettings>(() => getCachedSiteSettingsSync());
  const [content, setContent] = useState<MediaItem[]>(() => getCachedContentListSync());
  const [loading, setLoading] = useState<boolean>(!initialHasCache);
  const [error, setError] = useState<string | null>(null);

  // Unlocked Access Tokens state
  const [unlockedTokens, setUnlockedTokens] = useState<Record<string, string>>(() => getStoredTokens());

  // Push Notification Foreground Toast state
  const [foregroundNotification, setForegroundNotification] = useState<ForegroundNotificationData | null>(null);

  // Modals & Drawers
  const [purchasingItem, setPurchasingItem] = useState<MediaItem | null>(null);
  const [activeMediaItem, setActiveMediaItem] = useState<MediaItem | null>(null);
  const [isPurchasedDrawerOpen, setIsPurchasedDrawerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareItem, setShareItem] = useState<MediaItem | null>(null);

  // Setup foreground push notification listener
  useEffect(() => {
    const unsubscribe = setupForegroundMessageListener((payload) => {
      const title = payload.notification?.title || payload.data?.title || '📸 नया फोटो अपलोड हुआ!';
      const body = payload.notification?.body || payload.data?.body || 'Ruma Cute Girl पर नया exclusive content उपलब्ध है।';
      const image = payload.notification?.image || payload.data?.image || '';
      const postId = payload.data?.postId || '';
      const url = payload.data?.url || (postId ? `/#detail/${postId}` : '/');

      setForegroundNotification({ title, body, image, url, postId });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync unlocked tokens
  const refreshTokens = () => {
    setUnlockedTokens(getStoredTokens());
  };

  const handleOpenShare = (item?: MediaItem | null) => {
    setShareItem(item || null);
    setIsShareModalOpen(true);
  };

  // Manual Refresh / Initial Data Load
  const loadData = async (force = false) => {
    setError(null);
    try {
      refreshTokens();
      const settingsData = await fetchSiteSettings(force);
      setSettings(settingsData);
    } catch (err: any) {
      console.warn('App settings sync:', err);
      if (!initialHasCache) {
        setError(err.message || 'Connecting to server...');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial settings fetch with caching
    loadData(false);

    // 2. Real-time content synchronization via Singleton Shared Listener
    const unsubscribeContent = subscribeToContentList(
      (items) => {
        setContent(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Content subscription fallback active:', err?.message || err);
        setLoading(false);
      }
    );

    // 3. Listen for hash & URL changes
    const handleUrlChange = () => {
      const { route, mediaId } = getRouteFromUrl();
      setCurrentRoute(route);
      if (mediaId) setSelectedMediaId(mediaId);
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      unsubscribeContent();
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

  if (loading && !settings && content.length === 0) {
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
          <p className="text-xs text-purple-900/70 font-medium">Connecting to live cloud server & media vault...</p>
        </div>
      </div>
    );
  }

  if (error && !settings && content.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdf2f8] flex flex-col items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 max-w-md text-center space-y-4 border border-rose-200 shadow-xl">
          <h2 className="font-display font-black text-xl text-purple-950">Cloud Data Temporarily Unavailable</h2>
          <p className="text-xs text-purple-900/70">
            {isCloudQuotaExhausted()
              ? 'डेटाबेस कोटा सीमा समाप्त हो गई है। कृपया थोड़ी देर बाद पुनः प्रयास करें।'
              : (error || 'Failed to connect to cloud server.')}
          </p>
          <button
            onClick={() => {
              resetQuotaCircuitBreaker();
              loadData(true);
            }}
            className="glow-pink-btn px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 mx-auto cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  const activeContentItem = selectedMediaId
    ? content.find((c) => c.id === selectedMediaId) || null
    : null;

  return (
    <div className="min-h-screen bg-[#fdf2f8] text-purple-950 flex flex-col relative overflow-x-clip selection:bg-pink-500 selection:text-white">
      
      {/* Background Floating Ambient Orbs (Frosted Glass Aesthetic) */}
      <div className="fixed top-[-5%] left-[-5%] w-[550px] h-[550px] bg-pink-400/25 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[550px] h-[550px] bg-purple-400/25 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-[40%] right-[10%] w-[450px] h-[450px] bg-blue-300/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-[65%] left-[5%] w-[400px] h-[400px] bg-pink-300/20 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Adaptive 2G/3G Low-Speed & Offline Speed Banner */}
      <NetworkSpeedBanner />

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
          <Suspense fallback={<FallbackLoader />}>
            <ContentDetailPage
              item={activeContentItem}
              allContent={content}
              isUnlocked={unlockedIds.includes(activeContentItem.id)}
              unlockedIds={unlockedIds}
              onBack={() => navigateTo('content')}
              onBuy={handleBuyMedia}
              onOpenMedia={handleOpenMedia}
              onOpenShare={(item) => handleOpenShare(item)}
            />
          </Suspense>
        )}

        {(currentRoute === 'terms' ||
          currentRoute === 'privacy' ||
          currentRoute === 'refund' ||
          currentRoute === 'contact') &&
          settings && (
            <Suspense fallback={<FallbackLoader />}>
              <LegalPages
                pageType={currentRoute as any}
                settings={settings}
                onNavigate={(route) => navigateTo(route)}
              />
            </Suspense>
          )}

        {currentRoute === 'admin' && (
          <Suspense fallback={<FallbackLoader />}>
            <AdminPage
              initialContent={content}
              initialSettings={settings}
              onBackToSite={() => {
                navigateTo('home');
              }}
              onContentUpdated={(newContent) => {
                setContent(newContent);
              }}
              onSettingsUpdated={(newSettings) => {
                setSettings(newSettings);
              }}
            />
          </Suspense>
        )}
      </main>

      {/* Main Global Footer */}
      {settings && currentRoute !== 'admin' && (
        <Footer settings={settings} onNavigate={(route) => navigateTo(route)} />
      )}

      {/* Floating Bottom Nav for One-Thumb Mobile Use */}
      {currentRoute !== 'admin' && (
        <BottomMobileNav
          activeTab={currentRoute}
          onNavigate={(route) => navigateTo(route)}
          unlockedCount={unlockedIds.length}
          onOpenPurchased={() => setIsPurchasedDrawerOpen(true)}
        />
      )}

      {/* Modals and Overlays */}
      <Suspense fallback={null}>
        {purchasingItem && (
          <PaymentModal
            item={purchasingItem}
            isOpen={Boolean(purchasingItem)}
            onClose={() => setPurchasingItem(null)}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {activeMediaItem && (
          <MediaModal
            item={activeMediaItem}
            isOpen={Boolean(activeMediaItem)}
            onClose={() => setActiveMediaItem(null)}
            onBuy={handleBuyMedia}
            isUnlocked={unlockedIds.includes(activeMediaItem.id)}
          />
        )}

        {isPurchasedDrawerOpen && (
          <PurchasedDrawer
            isOpen={isPurchasedDrawerOpen}
            onClose={() => setIsPurchasedDrawerOpen(false)}
            unlockedItems={unlockedItems}
            onOpenMedia={handleOpenMedia}
          />
        )}

        {isShareModalOpen && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            item={shareItem}
          />
        )}
      </Suspense>

      {/* Web Push Notification Opt-in Prompt Banner */}
      {settings && <NotificationPermissionBanner settings={settings} />}

      {/* Foreground Notification Toast Popups */}
      <ForegroundNotificationToast
        notification={foregroundNotification}
        onClose={() => setForegroundNotification(null)}
        onNavigate={(url) => {
          if (url.includes('#media/')) {
            const mediaId = url.split('#media/')[1];
            navigateTo('detail', mediaId);
          } else {
            navigateTo('content');
          }
        }}
      />

      {/* Live Unlock Activity Social Proof Toasts */}
      {currentRoute !== 'admin' && <LiveUnlockActivityToast content={content} />}

      {/* Floating WhatsApp Support 24/7 Widget */}
      {currentRoute !== 'admin' && <FloatingWhatsAppSupport settings={settings} />}
    </div>
  );
}
