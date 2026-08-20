import React, { useState, useEffect } from 'react';
import { MediaItem, OrderItem, SiteSettings, AdminStats } from '../types';
import {
  adminLogin,
  getAdminToken,
  removeAdminToken,
  fetchAdminStats,
  fetchAdminOrders,
  fetchAdminContent,
  fetchSiteSettings,
  createAdminContent,
  updateAdminContent,
  deleteAdminContent,
  updateAdminSettings,
  verifyAdminOrder,
  adminApproveOrder,
  adminRejectOrder,
  formatINR
} from '../utils/api';
import { HomepageControlTab } from '../components/HomepageControlTab';
import { StoryHighlightsManager } from '../components/StoryHighlightsManager';
import { MediaUploadZone } from '../components/MediaUploadZone';
import {
  Lock,
  LayoutDashboard,
  Film,
  ShoppingBag,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  IndianRupee,
  RefreshCw,
  Eye,
  Search,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  KeyRound,
  ShieldAlert,
  Sliders,
  Filter,
  Image as ImageIcon,
  Flame,
  ArrowUpDown,
  Tag,
  CheckSquare,
  Square,
  TrendingUp,
  Package,
  Layers,
  Calendar,
  DollarSign,
  Upload,
  Download
} from 'lucide-react';

interface AdminPageProps {
  onBackToSite: () => void;
  onSettingsUpdated: (newSettings: SiteSettings) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToSite, onSettingsUpdated }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAdminToken());
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'highlights' | 'homepage' | 'orders' | 'settings' | 'setup'>('dashboard');

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [contentList, setContentList] = useState<MediaItem[]>([]);
  const [ordersList, setOrdersList] = useState<OrderItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Content Filtering, Search, Sorting, Bulk selection
  const [contentSearch, setContentSearch] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'video' | 'photo' | 'pack'>('all');
  const [contentAccessFilter, setContentAccessFilter] = useState<'all' | 'premium' | 'free'>('all');
  const [contentSort, setContentSort] = useState<'newest' | 'oldest' | 'views' | 'priceAsc' | 'priceDesc'>('newest');
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Content form modal
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [adminPreviewItem, setAdminPreviewItem] = useState<MediaItem | null>(null);
  const [webhookSimOrderId, setWebhookSimOrderId] = useState('');
  const [webhookSimLoading, setWebhookSimLoading] = useState(false);
  const [webhookSimResult, setWebhookSimResult] = useState<string | null>(null);

  // Profile and Banner state for Settings
  const [settingsProfilePic, setSettingsProfilePic] = useState<string>('');
  const [settingsBannerUrl, setSettingsBannerUrl] = useState<string>('');

  const [contentFormData, setContentFormData] = useState<Partial<MediaItem>>({
    title: '',
    description: '',
    type: 'video',
    access: 'premium',
    price: 99,
    thumbnailUrl: '',
    mediaUrl: '',
    previewUrl: '',
    tags: ['Exclusive', 'VIP'],
    duration: '1:30',
    published: true,
    featured: false
  });

  // Orders search & filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<OrderItem | null>(null);
  const [copiedSecretLink, setCopiedSecretLink] = useState(false);

  const getSecretUrl = () => {
    try {
      return `${window.location.origin}${window.location.pathname}#admin`;
    } catch (_) {
      return 'https://.../#admin';
    }
  };

  const copySecretLink = () => {
    try {
      navigator.clipboard.writeText(getSecretUrl());
      setCopiedSecretLink(true);
      setTimeout(() => setCopiedSecretLink(false), 2500);
    } catch (err) {
      prompt('Copy secret admin link:', getSecretUrl());
    }
  };

  // Load Admin Data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, contentData, settingsData] = await Promise.all([
        fetchAdminStats(),
        fetchAdminOrders(),
        fetchAdminContent(),
        fetchSiteSettings()
      ]);
      setStats(statsData);
      setOrdersList(ordersData);
      setContentList(contentData);
      setSiteSettings(settingsData);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Unauthorized')) {
        removeAdminToken();
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (siteSettings) {
      setSettingsProfilePic(siteSettings.profilePicUrl || '');
      setSettingsBannerUrl(siteSettings.bannerUrl || '');
    }
  }, [siteSettings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);
    try {
      await adminLogin(passcode);
      setIsAuthenticated(true);
      setPasscode('');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid admin passcode');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeAdminToken();
    setIsAuthenticated(false);
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateAdminContent(editingItem.id, contentFormData);
      } else {
        await createAdminContent(contentFormData);
      }
      setShowContentModal(false);
      setEditingItem(null);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save content');
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content item?')) return;
    try {
      await deleteAdminContent(id);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete content');
    }
  };

  // Bulk Content Handlers
  const handleToggleSelectAll = () => {
    if (selectedContentIds.length === filteredContent.length) {
      setSelectedContentIds([]);
    } else {
      setSelectedContentIds(filteredContent.map(c => c.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedContentIds.includes(id)) {
      setSelectedContentIds(selectedContentIds.filter(i => i !== id));
    } else {
      setSelectedContentIds([...selectedContentIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContentIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedContentIds.length} selected items?`)) return;
    setBulkActionLoading(true);
    try {
      for (const id of selectedContentIds) {
        await deleteAdminContent(id);
      }
      setSelectedContentIds([]);
      await loadAdminData();
      alert('Selected items deleted successfully!');
    } catch (err: any) {
      alert(err.message || 'Bulk delete failed');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkPublish = async (publish: boolean) => {
    if (selectedContentIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      for (const id of selectedContentIds) {
        await updateAdminContent(id, { published: publish });
      }
      setSelectedContentIds([]);
      await loadAdminData();
      alert(`Selected items ${publish ? 'published' : 'unpublished'}!`);
    } catch (err: any) {
      alert(err.message || 'Bulk publish update failed');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkFeatured = async (featured: boolean) => {
    if (selectedContentIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      for (const id of selectedContentIds) {
        await updateAdminContent(id, { featured });
      }
      setSelectedContentIds([]);
      await loadAdminData();
      alert(`Selected items ${featured ? 'featured on homepage' : 'removed from featured'}!`);
    } catch (err: any) {
      alert(err.message || 'Bulk feature update failed');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleManualVerify = async (orderId: string) => {
    const txnRef = prompt('Enter Bank UTR / SMS Reference for confirmation:', `ADMIN_VERIFIED_${Date.now()}`);
    if (!txnRef) return;
    try {
      await verifyAdminOrder(orderId, txnRef);
      alert('Order marked as PAID and access token issued!');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to verify order');
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      const res = await adminApproveOrder(orderId);
      if (res.success) {
        alert('✅ Order approved successfully! Content unlocked for customer.');
        loadAdminData();
      } else {
        alert(res.error || 'Failed to approve order');
      }
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to REJECT this payment claim? The order will be marked as Failed.')) return;
    try {
      const res = await adminRejectOrder(orderId, 'Payment not received in bank / Invalid UTR');
      if (res.success) {
        alert('❌ Order rejected.');
        loadAdminData();
      } else {
        alert(res.error || 'Failed to reject order');
      }
    } catch (err: any) {
      alert(err.message || 'Reject failed');
    }
  };

  // Filter & Sort Content Items
  const filteredContent = contentList
    .filter((c) => {
      if (contentTypeFilter !== 'all' && c.type !== contentTypeFilter) return false;
      if (contentAccessFilter !== 'all' && c.access !== contentAccessFilter) return false;
      if (contentSearch.trim()) {
        const q = contentSearch.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesDesc = c.description?.toLowerCase().includes(q);
        const matchesTags = c.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (contentSort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (contentSort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (contentSort === 'views') return (b.views || 0) - (a.views || 0);
      if (contentSort === 'priceAsc') return a.price - b.price;
      if (contentSort === 'priceDesc') return b.price - a.price;
      return 0;
    });

  // Filtered orders
  const filteredOrders = ordersList.filter((o) => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.contentTitle.toLowerCase().includes(q) ||
        (o.transactionRef && o.transactionRef.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // If not authenticated, show secure login
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center mx-auto text-pink-600 shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="font-display font-black text-2xl text-purple-950">Creator Admin Login</h2>
            <p className="text-xs text-purple-900/70 font-medium">
              Enter your secure admin passkey to manage content, UPI orders, and settings.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 text-xs text-center font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-purple-950 block">Admin Passcode</label>
                <button
                  type="button"
                  onClick={() => setPasscode('Ashok#8899')}
                  className="text-[11px] text-pink-600 hover:text-pink-700 font-bold hover:underline"
                >
                  Fill Default (Ashok#8899)
                </button>
              </div>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (e.g. Ashok#8899)"
                className="w-full bg-white/90 border border-purple-200 rounded-2xl px-4 py-3 text-sm text-purple-950 placeholder-purple-900/40 focus:outline-none focus:border-pink-500 shadow-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glow-pink-btn py-3 rounded-2xl text-xs sm:text-sm font-black text-white flex items-center justify-center gap-2 shadow-md shadow-pink-500/20 active:scale-[0.98] transition-transform"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>{loading ? 'Authenticating...' : 'Access Admin Panel'}</span>
            </button>
          </form>

          <div className="pt-2 text-center space-y-3">
            <div className="p-3 rounded-2xl bg-purple-100/70 border border-purple-200 text-left space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-purple-950">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-pink-600" />
                  Your Secret Admin URL:
                </span>
                <button
                  type="button"
                  onClick={copySecretLink}
                  className="text-[10px] text-pink-700 hover:text-pink-900 font-black flex items-center gap-1"
                >
                  {copiedSecretLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSecretLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
              <code className="block text-[10px] font-mono text-purple-900/80 truncate bg-white/80 p-1.5 rounded-xl border border-purple-200 select-all">
                {getSecretUrl()}
              </code>
              <p className="text-[10px] text-purple-900/60 leading-tight">
                🔒 Note: This link is completely hidden from the public website. Save/bookmark this URL in your browser to log in anytime.
              </p>
            </div>

            <button
              onClick={onBackToSite}
              className="text-xs text-purple-900/60 hover:text-pink-600 font-bold transition-colors block mx-auto"
            >
              ← Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      
      {/* Top Admin Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-pink-100 text-pink-600 border border-pink-200 shadow-sm">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-black text-lg sm:text-xl text-purple-950 flex items-center gap-2">
              Creator Complete Control Center
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                Live Admin
              </span>
            </h1>
            <p className="text-xs text-purple-900/70 font-medium">
              UPI Payee: <strong className="text-pink-700">{siteSettings?.upiId || 'ashokjee62022.wallet@phonepe'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={copySecretLink}
            className="px-3.5 py-2 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold border border-purple-200 shadow-sm flex items-center gap-1.5 transition-all"
            title="Copy Secret Admin Bookmark Link"
          >
            {copiedSecretLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-pink-600" />}
            <span>{copiedSecretLink ? 'Secret Link Copied!' : 'Copy Secret Link'}</span>
          </button>

          <button
            onClick={onBackToSite}
            className="px-4 py-2 rounded-2xl bg-white hover:bg-pink-50 text-purple-950 text-xs font-black border border-purple-200 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Eye className="w-4 h-4 text-pink-600" />
            <span>View Website</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black border border-rose-200 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-purple-100">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'content'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Content Manager ({contentList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('highlights')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'highlights'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Story Highlights ({siteSettings?.storyHighlights?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('homepage')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'homepage'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Homepage Control</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders & Payments ({ordersList.length})</span>
          {ordersList.filter(o => o.status === 'waiting_verification').length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse shadow-sm">
              {ordersList.filter(o => o.status === 'waiting_verification').length} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Profile & UPI Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('setup')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'setup'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'text-purple-700 hover:text-purple-950 hover:bg-purple-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Gateway & Webhook Docs</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: DASHBOARD OVERVIEW (ALL 10+ DASHBOARD CARDS & INTERVALS) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Revenue Intervals Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md bg-gradient-to-br from-emerald-500/10 to-transparent">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-black uppercase">
                <span>Total Revenue</span>
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-purple-950 mt-2">
                {formatINR(stats.totalRevenue)}
              </div>
              <div className="text-[11px] text-emerald-700 font-bold mt-1">
                Lifetime verified earnings
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md">
              <div className="flex items-center justify-between text-purple-900/70 text-xs font-black uppercase">
                <span>Today's Revenue</span>
                <Calendar className="w-4 h-4 text-pink-600" />
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-pink-700 mt-2">
                {formatINR(stats.todayRevenue || 0)}
              </div>
              <div className="text-[11px] text-pink-600 font-bold mt-1">
                Live 24h collections
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md">
              <div className="flex items-center justify-between text-purple-900/70 text-xs font-black uppercase">
                <span>This Week's Revenue</span>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-purple-950 mt-2">
                {formatINR(stats.thisWeekRevenue || 0)}
              </div>
              <div className="text-[11px] text-purple-700 font-bold mt-1">
                Past 7 days earnings
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md">
              <div className="flex items-center justify-between text-purple-900/70 text-xs font-black uppercase">
                <span>This Month's Revenue</span>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-purple-950 mt-2">
                {formatINR(stats.thisMonthRevenue || 0)}
              </div>
              <div className="text-[11px] text-blue-700 font-bold mt-1">
                Current month total
              </div>
            </div>
          </div>

          {/* Detailed Metric Cards (Total Views, Photos, Videos, Free, Premium, Orders, Paid, Pending, Failed) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="glass-card rounded-2xl p-4 border border-white/80 shadow-xs">
              <div className="flex items-center justify-between text-purple-900/70 text-[10px] font-black uppercase">
                <span>Total Views</span>
                <Eye className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="font-display text-xl font-black text-purple-950 mt-1">
                {stats.totalViews ? stats.totalViews.toLocaleString() : siteSettings?.viewsCount || '346.0K'}
              </div>
              <div className="text-[10px] text-purple-900/60 font-semibold mt-0.5">Impressions</div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-white/80 shadow-xs">
              <div className="flex items-center justify-between text-purple-900/70 text-[10px] font-black uppercase">
                <span>Total Photos</span>
                <ImageIcon className="w-3.5 h-3.5 text-pink-600" />
              </div>
              <div className="font-display text-xl font-black text-purple-950 mt-1">
                {stats.totalPhotos ?? contentList.filter(c => c.type === 'photo').length}
              </div>
              <div className="text-[10px] text-purple-900/60 font-semibold mt-0.5">Photo Sets</div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-white/80 shadow-xs">
              <div className="flex items-center justify-between text-purple-900/70 text-[10px] font-black uppercase">
                <span>Total Videos</span>
                <Film className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="font-display text-xl font-black text-purple-950 mt-1">
                {stats.totalVideos ?? contentList.filter(c => c.type === 'video').length}
              </div>
              <div className="text-[10px] text-purple-900/60 font-semibold mt-0.5">Master Reels</div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-white/80 shadow-xs">
              <div className="flex items-center justify-between text-purple-900/70 text-[10px] font-black uppercase">
                <span>Free Content</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="font-display text-xl font-black text-emerald-700 mt-1">
                {stats.freeContent}
              </div>
              <div className="text-[10px] text-purple-900/60 font-semibold mt-0.5">Zero-cost samples</div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-white/80 shadow-xs">
              <div className="flex items-center justify-between text-purple-900/70 text-[10px] font-black uppercase">
                <span>Premium Content</span>
                <Flame className="w-3.5 h-3.5 text-yellow-500" />
              </div>
              <div className="font-display text-xl font-black text-pink-700 mt-1">
                {stats.premiumContent}
              </div>
              <div className="text-[10px] text-purple-900/60 font-semibold mt-0.5">VIP Paywalled</div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-white/80 shadow-xs">
              <div className="flex items-center justify-between text-purple-900/70 text-[10px] font-black uppercase">
                <span>Total Orders</span>
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="font-display text-xl font-black text-purple-950 mt-1">
                {stats.totalOrders}
              </div>
              <div className="text-[10px] text-purple-900/60 font-semibold mt-0.5">
                {stats.paidOrders} paid • {stats.pendingOrders} pend
              </div>
            </div>

          </div>

          {/* Popular & Recent Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Popular Content */}
            <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-sm text-purple-950 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-pink-600" />
                  Popular Content (Most Viewed & Liked)
                </h3>
                <span className="text-[10px] text-purple-900/60 font-semibold">Top Performers</span>
              </div>

              <div className="space-y-2">
                {(stats.popularContent || contentList.slice(0, 5)).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-white/70 border border-purple-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.thumbnailUrl} alt={item.title} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-purple-950 truncate">{item.title}</h4>
                        <span className="text-[10px] text-purple-900/60 font-medium">
                          {item.type.toUpperCase()} • {item.access === 'free' ? 'FREE' : formatINR(item.price)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-pink-700 shrink-0">
                      {item.views} views
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Content */}
            <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-sm text-purple-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Recently Added Content
                </h3>
                <button onClick={() => setActiveTab('content')} className="text-[10px] text-pink-600 font-bold hover:underline">
                  Manage All →
                </button>
              </div>

              <div className="space-y-2">
                {(stats.recentContent || [...contentList].reverse().slice(0, 5)).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-white/70 border border-purple-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.thumbnailUrl} alt={item.title} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-purple-950 truncate">{item.title}</h4>
                        <span className="text-[10px] text-purple-900/60 font-medium">
                          {new Date(item.createdAt).toLocaleDateString()} • {item.access === 'free' ? 'FREE' : formatINR(item.price)}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.published ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
                      {item.published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Recent Orders Overview */}
          <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-base text-purple-950">
                Recent Payment Orders & Audit Log
              </h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-pink-600 hover:underline font-bold"
              >
                View All Orders ({ordersList.length}) →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-purple-100 text-purple-900/60 uppercase text-[10px] font-black">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Content Item</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Created</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {stats.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-purple-900/40 font-medium">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    stats.recentOrders.slice(0, 5).map((o) => (
                      <tr key={o.orderId} className="hover:bg-purple-50/50">
                        <td className="py-3 px-3 font-mono font-bold text-pink-700">
                          {o.orderId.substring(0, 16)}...
                        </td>
                        <td className="py-3 px-3 text-purple-950 max-w-[180px] truncate font-bold">
                          {o.contentTitle}
                        </td>
                        <td className="py-3 px-3 font-black text-purple-950">
                          {formatINR(o.amount)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              o.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : o.status === 'expired'
                                ? 'bg-zinc-100 text-zinc-600'
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-purple-900/60 font-medium">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          {o.status !== 'paid' && (
                            <button
                              onClick={() => handleManualVerify(o.orderId)}
                              className="px-2.5 py-1 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 text-[10px] font-black border border-pink-200 transition-colors"
                            >
                              Verify
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: CONTENT MANAGEMENT WITH FULL CRUD, BULK ACTIONS & SEARCH */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'content' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header & New Content Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-black text-xl text-purple-950">Content Management & Library</h2>
              <p className="text-xs text-purple-900/70 font-medium">
                Add, edit, delete, publish/unpublish, feature, price, tag, and bulk control your VIP media catalog.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingItem(null);
                setContentFormData({
                  title: '',
                  description: '',
                  type: 'video',
                  access: 'premium',
                  price: 99,
                  thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
                  mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                  previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                  tags: ['Exclusive', 'VIP'],
                  duration: '1:30',
                  published: true,
                  featured: false
                });
                setShowContentModal(true);
              }}
              className="glow-pink-btn px-5 py-2.5 rounded-2xl text-xs font-black text-white flex items-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Content Item</span>
            </button>
          </div>

          {/* Search, Filter & Sort Controls Toolbar */}
          <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-purple-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={contentSearch}
                  onChange={(e) => setContentSearch(e.target.value)}
                  placeholder="Search by title, tag, or description..."
                  className="w-full bg-white border border-purple-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-purple-950 placeholder-purple-900/40 shadow-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <select
                  value={contentTypeFilter}
                  onChange={(e) => setContentTypeFilter(e.target.value as any)}
                  className="bg-white border border-purple-200 rounded-2xl px-3 py-2 text-xs text-purple-950 shadow-xs font-semibold"
                >
                  <option value="all">All Media Types</option>
                  <option value="video">Videos Only</option>
                  <option value="photo">Photos Only</option>
                  <option value="pack">Packs Only</option>
                </select>

                <select
                  value={contentAccessFilter}
                  onChange={(e) => setContentAccessFilter(e.target.value as any)}
                  className="bg-white border border-purple-200 rounded-2xl px-3 py-2 text-xs text-purple-950 shadow-xs font-semibold"
                >
                  <option value="all">All Access</option>
                  <option value="premium">VIP Premium</option>
                  <option value="free">Free Preview</option>
                </select>

                <select
                  value={contentSort}
                  onChange={(e) => setContentSort(e.target.value as any)}
                  className="bg-white border border-purple-200 rounded-2xl px-3 py-2 text-xs text-purple-950 shadow-xs font-semibold"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="views">Sort: Most Views</option>
                  <option value="priceDesc">Sort: Price High to Low</option>
                  <option value="priceAsc">Sort: Price Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1.5 text-xs font-black text-purple-950 hover:text-pink-600 transition-colors"
              >
                {selectedContentIds.length === filteredContent.length && filteredContent.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-pink-600" />
                ) : (
                  <Square className="w-4 h-4 text-purple-400" />
                )}
                <span>Select All ({filteredContent.length})</span>
              </button>

              {selectedContentIds.length > 0 && (
                <span className="text-xs font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                  {selectedContentIds.length} Selected
                </span>
              )}
            </div>

            {selectedContentIds.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  disabled={bulkActionLoading}
                  onClick={() => handleBulkPublish(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-black border border-emerald-200 shadow-xs transition-all"
                >
                  Publish Selected
                </button>
                <button
                  type="button"
                  disabled={bulkActionLoading}
                  onClick={() => handleBulkPublish(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-[11px] font-black shadow-xs transition-all"
                >
                  Unpublish
                </button>
                <button
                  type="button"
                  disabled={bulkActionLoading}
                  onClick={() => handleBulkFeatured(true)}
                  className="px-3 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 text-[11px] font-black border border-pink-200 shadow-xs transition-all"
                >
                  Feature on Home
                </button>
                <button
                  type="button"
                  disabled={bulkActionLoading}
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-black border border-rose-200 shadow-xs transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Bulk Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* Content Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredContent.map((item) => {
              const isSelected = selectedContentIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`glass-card rounded-3xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                    isSelected ? 'border-pink-500 ring-2 ring-pink-400/30 bg-pink-50/40' : 'border-white/80 shadow-md'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Checkbox selector */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(item.id)}
                        className="rounded text-pink-600 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-20 h-24 rounded-2xl object-cover border border-purple-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-100 text-pink-700 border border-pink-200">
                          {item.type}
                        </span>
                        <span className="text-xs font-black text-emerald-700">
                          {item.access === 'free' ? 'FREE' : formatINR(item.price)}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-purple-950 truncate mt-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-purple-900/70 line-clamp-2 mt-1 font-medium">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {item.featured && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black">
                            ★ Featured
                          </span>
                        )}
                        {!item.published && (
                          <span className="px-1.5 py-0.5 rounded-md bg-zinc-200 text-zinc-700 text-[9px] font-bold">
                            Draft
                          </span>
                        )}
                        {item.tags?.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[9px] font-bold">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-purple-100 text-xs">
                    <span className="text-[11px] text-purple-900/60 font-semibold">
                      {item.views} views • {item.likes} likes
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setAdminPreviewItem(item)}
                        className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 shadow-sm"
                        title="Preview Media"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setContentFormData({ ...item });
                          setShowContentModal(true);
                        }}
                        className="p-2 rounded-xl bg-white hover:bg-pink-50 text-purple-900 border border-purple-100 shadow-sm"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteContent(item.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-sm"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2.5: STORY HIGHLIGHTS & TEASERS MANAGER */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'highlights' && siteSettings && (
        <StoryHighlightsManager
          settings={siteSettings}
          onSettingsUpdated={(updated) => {
            setSiteSettings(updated);
            onSettingsUpdated(updated);
          }}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: HOMEPAGE CONTROL (NO-CODE SECTION REORDER & TOGGLE) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'homepage' && siteSettings && (
        <HomepageControlTab
          settings={siteSettings}
          onSettingsUpdated={(updated) => {
            setSiteSettings(updated);
            onSettingsUpdated(updated);
          }}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: ORDERS MANAGEMENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Pending Verification Notice Banner */}
          {ordersList.filter(o => o.status === 'waiting_verification').length > 0 && (
            <div className="p-4 rounded-3xl bg-amber-500/15 border-2 border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-400 text-amber-950 font-black shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-amber-950">
                    {ordersList.filter(o => o.status === 'waiting_verification').length} Payment(s) Waiting For Verification!
                  </h4>
                  <p className="text-[11px] text-amber-900/80 font-medium">
                    ग्राहकों ने UTR सबमिट किया है। अपने PhonePe / Bank SMS में UTR चेक करें और <strong>"Approve & Unlock"</strong> दबाएं।
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOrderStatusFilter('waiting_verification')}
                className="px-4 py-2 rounded-xl bg-amber-500 text-amber-950 font-black text-xs hover:bg-amber-400 transition-colors shadow-sm whitespace-nowrap"
              >
                Show Pending ({ordersList.filter(o => o.status === 'waiting_verification').length})
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-black text-xl text-purple-950">Payment Orders & UTR Audit</h2>
              <p className="text-xs text-purple-900/70 font-medium">Track, audit, and approve verified UPI bank transfers.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order ID, title or UTR..."
                className="bg-white/90 border border-purple-200 rounded-2xl px-3 py-2 text-xs text-purple-950 placeholder-purple-900/40 focus:outline-none focus:border-pink-500 shadow-sm font-medium"
              />

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-white/90 border border-purple-200 rounded-2xl px-3 py-2 text-xs text-purple-950 shadow-sm font-semibold"
              >
                <option value="all">All Statuses ({ordersList.length})</option>
                <option value="waiting_verification">⏳ Review UTR ({ordersList.filter(o => o.status === 'waiting_verification').length})</option>
                <option value="paid">✅ Paid ({ordersList.filter(o => o.status === 'paid').length})</option>
                <option value="pending">🕒 Pending ({ordersList.filter(o => o.status === 'pending').length})</option>
                <option value="failed">❌ Failed / Rejected ({ordersList.filter(o => o.status === 'failed').length})</option>
                <option value="expired">⌛ Expired ({ordersList.filter(o => o.status === 'expired').length})</option>
              </select>
            </div>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-white/80 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-purple-100 bg-white/60 text-purple-900/60 uppercase text-[10px] font-black">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Content</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">📸 Receipt / Screenshot</th>
                    <th className="py-3 px-4">Submitted UTR / Ref</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-purple-900/40 font-medium">
                        No orders matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr
                        key={o.orderId}
                        className={
                          o.status === 'waiting_verification'
                            ? 'bg-amber-50/60 hover:bg-amber-50 font-semibold'
                            : 'hover:bg-purple-50/50'
                        }
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-pink-700">
                          {o.orderId}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-purple-950 max-w-[180px] truncate">
                          {o.contentTitle}
                        </td>
                        <td className="py-3.5 px-4 font-black text-purple-950">
                          {formatINR(o.amount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              o.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : o.status === 'waiting_verification'
                                ? 'bg-amber-200 text-amber-900 border border-amber-300 animate-pulse'
                                : o.status === 'failed'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : o.status === 'expired'
                                ? 'bg-zinc-100 text-zinc-600'
                                : 'bg-purple-100 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {o.status === 'waiting_verification' ? '⏳ Review UTR' : o.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {o.screenshotUrl ? (
                            <button
                              type="button"
                              onClick={() => setViewingReceiptOrder(o)}
                              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-800 text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                              title="क्लिक करके पेमेंट स्क्रीनशॉट देखें"
                            >
                              <img
                                src={o.screenshotUrl}
                                alt="Receipt"
                                className="w-5 h-5 rounded-md object-cover border border-pink-300"
                              />
                              <span>रसीद देखें (View)</span>
                            </button>
                          ) : (
                            <span className="text-purple-900/40 text-[11px] font-medium">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {o.transactionRef ? (
                            <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-950 shadow-xs">
                              {o.transactionRef}
                            </span>
                          ) : (
                            <span className="text-purple-900/40 font-mono text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-purple-900/60 font-medium text-[11px]">
                          {new Date(o.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {o.status === 'waiting_verification' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApproveOrder(o.orderId)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black shadow-sm flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
                                title="Approve payment & unlock content for user"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve & Unlock</span>
                              </button>
                              <button
                                onClick={() => handleRejectOrder(o.orderId)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Reject fake claim"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : o.status === 'pending' ? (
                            <button
                              onClick={() => handleManualVerify(o.orderId)}
                              className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-black shadow-sm transition-transform active:scale-95 cursor-pointer"
                            >
                              Verify & Issue Token
                            </button>
                          ) : o.status === 'paid' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-black">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Paid & Unlocked</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-purple-900/50 font-medium">
                              {o.status === 'failed' ? 'Rejected' : 'Closed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: PROFILE & PAYMENT SETTINGS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 space-y-6 max-w-3xl animate-in fade-in duration-200 shadow-lg">
          <div>
            <h2 className="font-display font-black text-xl text-purple-950">Creator Profile, Branding & Payment Settings</h2>
            <p className="text-xs text-purple-900/70 font-medium">Update your profile photo, cover banner, bio, stats, and UPI payment destination.</p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const updates: Partial<SiteSettings> = {
                creatorName: formData.get('creatorName') as string,
                username: formData.get('username') as string,
                profilePicUrl: settingsProfilePic || (formData.get('profilePicUrl') as string) || siteSettings?.profilePicUrl,
                bannerUrl: settingsBannerUrl || (formData.get('bannerUrl') as string) || siteSettings?.bannerUrl,
                bio: formData.get('bio') as string,
                tagline: formData.get('tagline') as string,
                instagramUrl: formData.get('instagramUrl') as string,
                instagramHandle: formData.get('instagramHandle') as string,
                badgeText: formData.get('badgeText') as string || 'VIP Creator',
                followersCount: Number(formData.get('followersCount')) || 3358,
                postsCount: Number(formData.get('postsCount')) || 135,
                viewsCount: formData.get('viewsCount') as string || '346.0K',
                upiId: formData.get('upiId') as string,
                paymentVerificationMode: (formData.get('paymentVerificationMode') as 'manual_approval' | 'instant_utr') || 'manual_approval',
                announcement: formData.get('announcement') as string,
                announcementEnabled: formData.get('announcementEnabled') === 'on',
                supportEmail: formData.get('supportEmail') as string,
                supportTelegram: formData.get('supportTelegram') as string
              };
              try {
                const res = await updateAdminSettings(updates);
                setSiteSettings(res);
                onSettingsUpdated(res);
                alert('Settings and Profile Photo updated successfully!');
              } catch (err: any) {
                alert(err.message || 'Failed to update settings');
              }
            }}
            className="space-y-5"
          >
            {/* Live Profile Picture & Banner Direct Gallery Upload Section */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-pink-500/5 via-purple-50/60 to-purple-100/40 border border-purple-200/90 rounded-3xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                <span className="text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-pink-600" />
                  Profile Photo & Cover Banner Upload (गैलरी से फोटो बदलें)
                </span>
                <span className="text-[10px] font-bold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-lg">
                  Direct Gallery & Camera Support
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Profile Photo Zone */}
                <div>
                  <MediaUploadZone
                    label="Profile Photo (प्रोफाइल फोटो)"
                    value={settingsProfilePic}
                    onChange={(url) => setSettingsProfilePic(url)}
                    accept="image"
                    aspectRatio="square"
                    helperText="Upload circular avatar photo directly from gallery or paste link."
                  />
                  <input type="hidden" name="profilePicUrl" value={settingsProfilePic} />
                </div>

                {/* 2. Cover Banner Zone */}
                <div>
                  <MediaUploadZone
                    label="Cover Banner (कवर बैनर बैकग्राउंड)"
                    value={settingsBannerUrl}
                    onChange={(url) => setSettingsBannerUrl(url)}
                    accept="image"
                    aspectRatio="banner"
                    helperText="Upload wide cover banner directly from gallery or paste link."
                  />
                  <input type="hidden" name="bannerUrl" value={settingsBannerUrl} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">Creator Display Name</label>
                <input
                  name="creatorName"
                  defaultValue={siteSettings?.creatorName || 'Ruma Kumari'}
                  required
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 shadow-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">
                  UPI ID (Bank Account UPI ID for Payments)
                </label>
                <input
                  name="upiId"
                  defaultValue={siteSettings?.upiId || '6202292319pnb@ybl'}
                  required
                  placeholder="e.g. 6202292319pnb@ybl or username@okhdfcbank"
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-emerald-700 font-mono font-bold shadow-sm"
                />
                <p className="text-[11px] text-purple-900/70 mt-1 font-medium">
                  ⚠️ <strong>जरूरी नोट:</strong> <code className="text-pink-600 font-bold">.wallet@phonepe</code> वॉलेट आईडी काम नहीं करता। अपना बैंक से जुड़ा UPI ID डालें (जैसे: PhonePe: <code className="text-emerald-700 font-bold">नंबर@ybl</code> / <code className="text-emerald-700 font-bold">नंबर@ibl</code>, GPay: <code className="text-emerald-700 font-bold">name@okhdfcbank</code>, Paytm: <code className="text-emerald-700 font-bold">नंबर@paytm</code>).
                </p>
              </div>
            </div>

            {/* Payment Security & Anti-Fraud Mode */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-200 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs sm:text-sm font-black text-purple-950">
                    Payment Verification & Anti-Fraud Security (पेमेंट सत्यापन सुरक्षा)
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Fraud Protected
                </span>
              </div>
              <p className="text-[11px] text-purple-900/70 font-medium">
                चुनें कि बिना असली पेमेंट के कोई फर्जी तरीके से कंटेंट न खोल सके:
              </p>
              <select
                name="paymentVerificationMode"
                defaultValue={siteSettings?.paymentVerificationMode || 'manual_approval'}
                className="w-full bg-white border-2 border-emerald-300 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 font-bold focus:ring-2 focus:ring-emerald-500 shadow-sm"
              >
                <option value="manual_approval">
                  🔒 Manual Approval (Recommended: ग्राहक 12-अंकों का UTR डालेगा, आपके 'Approve' करने पर ही खुलेगा)
                </option>
                <option value="instant_utr">
                  ⚡ Instant 12-Digit UTR (ग्राहक के वैध 12-अंक UTR डालते ही तुरंत अनलॉक होगा)
                </option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">Profile Badge Text</label>
                <input
                  name="badgeText"
                  defaultValue={siteSettings?.badgeText || 'VIP Creator'}
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2 text-xs text-purple-950 shadow-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">Tagline (Under Name on Home)</label>
                <input
                  name="tagline"
                  defaultValue={siteSettings?.tagline || 'Unlock my private, uncut HD photos, backstage reels & VIP stories instantly.'}
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2 text-xs text-purple-950 shadow-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">Bio / Profile Description</label>
              <textarea
                name="bio"
                rows={2}
                defaultValue={siteSettings?.bio || 'Pretty mood always 💋 | Fitness, Lifestyle & Exclusive VIP Content'}
                className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2 text-xs text-purple-950 shadow-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">Posts Count</label>
                <input
                  name="postsCount"
                  type="number"
                  defaultValue={siteSettings?.postsCount || 135}
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2 text-xs text-purple-950 shadow-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">Followers Count</label>
                <input
                  name="followersCount"
                  type="number"
                  defaultValue={siteSettings?.followersCount || 3358}
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2 text-xs text-purple-950 shadow-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">Monthly Views Count</label>
                <input
                  name="viewsCount"
                  defaultValue={siteSettings?.viewsCount || '346.0K'}
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2 text-xs text-purple-950 shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">Instagram Profile URL</label>
                <input
                  name="instagramUrl"
                  defaultValue={siteSettings?.instagramUrl || 'https://instagram.com/ruma__cutegirl'}
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 shadow-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">Instagram Handle Label</label>
                <input
                  name="instagramHandle"
                  defaultValue={siteSettings?.instagramHandle || '@ruma__cutegirl'}
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">Support Email</label>
                <input
                  name="supportEmail"
                  defaultValue={siteSettings?.supportEmail || 'contact.rumakumari@gmail.com'}
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 shadow-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">Support Telegram Link</label>
                <input
                  name="supportTelegram"
                  defaultValue={siteSettings?.supportTelegram || 'https://t.me/rumakumari_vip'}
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 shadow-sm font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-purple-950">Top Announcement Banner</label>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-pink-600 cursor-pointer">
                  <input
                    name="announcementEnabled"
                    type="checkbox"
                    defaultChecked={siteSettings?.announcementEnabled ?? true}
                    className="rounded text-pink-600 focus:ring-pink-500"
                  />
                  <span>Show Banner</span>
                </label>
              </div>
              <input
                name="announcement"
                defaultValue={siteSettings?.announcement || '✨ New VIP Backstage Reel is LIVE! Get 50% off this week only with instant UPI scan!'}
                className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 shadow-sm font-medium"
              />
            </div>

            <button
              type="submit"
              className="glow-pink-btn px-7 py-3.5 rounded-2xl text-xs font-black text-white shadow-lg shadow-pink-500/25 flex items-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Publish All Changes</span>
            </button>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 6: GATEWAY & WEBHOOK SETUP DOCS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'setup' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-200 space-y-6 text-xs text-purple-900/80 leading-relaxed max-w-4xl animate-in fade-in duration-200 shadow-lg">
          <div>
            <h2 className="font-display font-black text-xl text-purple-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              Payment Merchant & Webhook Documentation
            </h2>
            <p className="text-xs text-purple-900/70 mt-1 font-medium">
              Architecture guide for connecting PhonePe PG, Razorpay, or custom UPI webhooks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-purple-200 space-y-2 shadow-sm">
            <h4 className="font-black text-purple-950 text-sm">1. Webhook Endpoint</h4>
            <p>
              Configure your payment provider to send HTTP POST notifications to:
            </p>
            <code className="block p-3 bg-purple-950 text-purple-200 rounded-2xl font-mono text-xs select-all">
              POST https://your-domain.com/api/payments/webhook
            </code>
            <p className="text-purple-900/70 text-[11px] font-semibold">
              Required Payload JSON: <code className="text-pink-600 font-mono">&#123; orderId, amount, status: "PAID", transactionRef, signature &#125;</code>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-purple-200 space-y-2 shadow-sm">
            <h4 className="font-black text-purple-950 text-sm">2. Security Rules (NPCI / UPI Compliance)</h4>
            <ul className="list-disc list-inside space-y-1 text-purple-900/80 font-medium">
              <li>Prices are calculated server-side from the database (never trusted from frontend).</li>
              <li>Tokens are signed with cryptographically random 256-bit keys and verified on every protected media stream request.</li>
              <li>No media is unlocked on client-side state alone.</li>
            </ul>
          </div>

          {/* Webhook Test Simulator */}
          <div className="p-5 rounded-3xl bg-purple-50/80 border border-purple-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-purple-950 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-600" />
                Live Webhook Simulator (Test Bank Confirmation)
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-100 text-pink-700">
                Sandbox Mode
              </span>
            </div>
            <p className="text-purple-900/70 text-xs">
              Simulate an incoming bank webhook notification for an active or pending order to test automatic status transition to <strong>PAID</strong> and instant token delivery.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={webhookSimOrderId}
                onChange={(e) => setWebhookSimOrderId(e.target.value)}
                placeholder="Enter Order ID or select from list..."
                className="flex-1 bg-white border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 font-mono shadow-sm"
              />
              <button
                type="button"
                disabled={webhookSimLoading}
                onClick={async () => {
                  if (!webhookSimOrderId.trim()) {
                    alert('Please enter or select an Order ID to simulate webhook for.');
                    return;
                  }
                  setWebhookSimLoading(true);
                  setWebhookSimResult(null);
                  try {
                    const res = await fetch('/api/payments/webhook', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        orderId: webhookSimOrderId.trim(),
                        status: 'PAID',
                        transactionRef: `SIM_UTR_${Date.now()}`
                      })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Webhook failed');
                    setWebhookSimResult(`Success! Order verified & token issued. (${data.message || 'PAID'})`);
                    loadAdminData();
                  } catch (err: any) {
                    setWebhookSimResult(`Error: ${err.message}`);
                  } finally {
                    setWebhookSimLoading(false);
                  }
                }}
                className="glow-pink-btn px-5 py-2.5 rounded-2xl text-xs font-black text-white whitespace-nowrap shadow-md"
              >
                {webhookSimLoading ? 'Sending Webhook...' : 'Simulate Bank Paid Signal'}
              </button>
            </div>

            {ordersList.filter(o => o.status === 'pending').length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] font-bold text-purple-900/70">Pending Orders:</span>
                {ordersList.filter(o => o.status === 'pending').slice(0, 3).map(o => (
                  <button
                    key={o.orderId}
                    type="button"
                    onClick={() => setWebhookSimOrderId(o.orderId)}
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-pink-50 border border-purple-200 text-pink-700 font-mono text-[10px] font-bold shadow-xs"
                  >
                    {o.orderId.substring(0, 12)}... (₹{o.amount})
                  </button>
                ))}
              </div>
            )}

            {webhookSimResult && (
              <div className={`p-3 rounded-2xl text-xs font-bold ${
                webhookSimResult.startsWith('Success')
                  ? 'bg-emerald-100 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-100 border border-rose-200 text-rose-800'
              }`}>
                {webhookSimResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CONTENT ADD / EDIT MODAL WITH CATEGORY, TAGS, PRICING & UPLOAD PREVIEW */}
      {/* ---------------------------------------------------- */}
      {showContentModal && (
        <div className="fixed inset-0 z-50 bg-purple-950/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/90 p-6 sm:p-8 space-y-5 my-auto shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-purple-100 pb-4">
              <h3 className="font-display font-black text-lg text-purple-950">
                {editingItem ? 'Edit Content Item' : 'Add New Content Item'}
              </h3>
              <button
                onClick={() => setShowContentModal(false)}
                className="p-2 rounded-xl bg-white hover:bg-pink-50 text-purple-900/60 hover:text-purple-950 border border-purple-100 shadow-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContent} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-purple-950 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={contentFormData.title}
                  onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                  placeholder="e.g. Blue Gym Workout & Mirror Pose"
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2.5 text-purple-950 shadow-sm font-medium focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={contentFormData.description}
                  onChange={(e) => setContentFormData({ ...contentFormData, description: e.target.value })}
                  placeholder="Short teaser description..."
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2 text-purple-950 shadow-sm font-medium focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-purple-950 block mb-1">Category / Type</label>
                  <select
                    value={contentFormData.type}
                    onChange={(e) => setContentFormData({ ...contentFormData, type: e.target.value as any })}
                    className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3 py-2 text-purple-950 shadow-sm font-semibold"
                  >
                    <option value="video">Video Reel</option>
                    <option value="photo">Photo Set</option>
                    <option value="pack">VIP Combo Pack</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-purple-950 block mb-1">Access Level</label>
                  <select
                    value={contentFormData.access}
                    onChange={(e) => setContentFormData({ ...contentFormData, access: e.target.value as any })}
                    className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3 py-2 text-purple-950 shadow-sm font-semibold"
                  >
                    <option value="premium">VIP Premium (Paid)</option>
                    <option value="free">Free Preview</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-purple-950 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={contentFormData.price}
                    onChange={(e) => setContentFormData({ ...contentFormData, price: Number(e.target.value) })}
                    className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3 py-2 text-purple-950 font-black shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={contentFormData.tags?.join(', ') || ''}
                  onChange={(e) => setContentFormData({
                    ...contentFormData,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  placeholder="Exclusive, VIP, Gym, Backstage"
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2.5 text-purple-950 shadow-sm font-medium"
                />
              </div>

              {/* 1. Main Media File Upload (Video or Photo directly from Gallery or Web URL) */}
              <div className="pt-1">
                <MediaUploadZone
                  label={
                    contentFormData.type === 'video'
                      ? 'VIP Protected Video Reel (गैलरी से वीडियो चुनें)'
                      : contentFormData.type === 'photo'
                      ? 'VIP Protected HD Photo (गैलरी से फोटो चुनें)'
                      : 'VIP Combo Master File / Preview (गैलरी से मीडिया चुनें)'
                  }
                  value={contentFormData.mediaUrl || ''}
                  onChange={(url) => {
                    setContentFormData(prev => ({
                      ...prev,
                      mediaUrl: url,
                      previewUrl: prev.previewUrl || url
                    }));
                  }}
                  accept={contentFormData.type === 'video' ? 'video' : contentFormData.type === 'photo' ? 'image' : 'any'}
                  required
                  onThumbnailExtracted={(thumbUrl) => {
                    setContentFormData(prev => {
                      if (!prev.thumbnailUrl) {
                        return { ...prev, thumbnailUrl: thumbUrl };
                      }
                      return prev;
                    });
                  }}
                  onDurationExtracted={(dur) => {
                    setContentFormData(prev => ({ ...prev, duration: dur }));
                  }}
                  helperText={
                    contentFormData.type === 'video'
                      ? 'Select video directly from gallery. Video length and frame thumbnail are generated automatically!'
                      : 'Select high-resolution photo directly from gallery or camera.'
                  }
                />
              </div>

              {/* 2. Thumbnail / Cover Poster Upload */}
              <div>
                <MediaUploadZone
                  label="Card Cover / Poster Thumbnail (कवर फोटो)"
                  value={contentFormData.thumbnailUrl || ''}
                  onChange={(url) => setContentFormData(prev => ({ ...prev, thumbnailUrl: url }))}
                  accept="image"
                  aspectRatio="video"
                  required
                  helperText="Shown on public cards. Auto-extracted if you upload a video reel above."
                />
              </div>

              {/* Optional Video Duration & Teaser */}
              {contentFormData.type === 'video' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-purple-950 block mb-1">Duration / Time Length</label>
                    <input
                      type="text"
                      value={contentFormData.duration || '1:30'}
                      onChange={(e) => setContentFormData({ ...contentFormData, duration: e.target.value })}
                      placeholder="e.g. 2:45"
                      className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2 text-purple-950 font-medium shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-purple-950 block mb-1">Preview Video URL (Optional Teaser)</label>
                    <input
                      type="text"
                      value={contentFormData.previewUrl || ''}
                      onChange={(e) => setContentFormData({ ...contentFormData, previewUrl: e.target.value })}
                      placeholder="Same as media or short teaser"
                      className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2 text-purple-950 font-medium shadow-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentFormData.published}
                    onChange={(e) => setContentFormData({ ...contentFormData, published: e.target.checked })}
                    className="w-4 h-4 rounded text-pink-600 border-purple-300"
                  />
                  <span className="font-bold text-purple-950">Publish Immediately</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contentFormData.featured}
                    onChange={(e) => setContentFormData({ ...contentFormData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-pink-600 border-purple-300"
                  />
                  <span className="font-bold text-purple-950">Feature on Homepage</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setShowContentModal(false)}
                  className="px-4 py-2 rounded-2xl bg-white hover:bg-pink-50 text-purple-900 font-bold border border-purple-100 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-pink-btn px-6 py-2 rounded-2xl text-white font-black shadow-md shadow-pink-500/20"
                >
                  Save Item
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* ADMIN IN-PLACE MEDIA PREVIEW MODAL */}
      {/* ---------------------------------------------------- */}
      {adminPreviewItem && (
        <div className="fixed inset-0 z-50 bg-purple-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden border border-white shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  Admin Preview • {adminPreviewItem.type}
                </span>
                <h3 className="font-display font-black text-base text-purple-950 mt-1">
                  {adminPreviewItem.title}
                </h3>
              </div>
              <button
                onClick={() => setAdminPreviewItem(null)}
                className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black/90 aspect-video max-h-[60vh] flex items-center justify-center">
              {adminPreviewItem.type === 'video' ? (
                <video
                  src={adminPreviewItem.mediaUrl || adminPreviewItem.previewUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={adminPreviewItem.mediaUrl || adminPreviewItem.thumbnailUrl}
                  alt={adminPreviewItem.title}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-purple-900/70 font-semibold pt-1">
              <span>Price: <strong>{adminPreviewItem.access === 'free' ? 'FREE' : formatINR(adminPreviewItem.price)}</strong></span>
              <span>Duration/Size: <strong>{adminPreviewItem.duration || 'Full HD'}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* ADMIN PAYMENT RECEIPT / SCREENSHOT VIEWER MODAL */}
      {/* ---------------------------------------------------- */}
      {viewingReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-purple-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden border border-white shadow-2xl space-y-4 p-5 sm:p-6 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-pink-100 text-pink-700">
                  <ImageIcon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-display font-black text-base sm:text-lg text-purple-950">
                    पेमेंट रसीद / स्क्रीनशॉट (Payment Receipt)
                  </h3>
                  <p className="text-xs text-purple-900/60 font-medium">
                    Order ID: <strong className="font-mono text-pink-700">{viewingReceiptOrder.orderId}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingReceiptOrder(null)}
                className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Receipt Image Display */}
            <div className="rounded-2xl overflow-hidden bg-zinc-950/95 border border-zinc-800 flex-1 min-h-[250px] max-h-[55vh] flex items-center justify-center p-2">
              {viewingReceiptOrder.screenshotUrl ? (
                <img
                  src={viewingReceiptOrder.screenshotUrl}
                  alt="Customer Payment Receipt"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-zinc-500 text-sm">No screenshot uploaded</div>
              )}
            </div>

            {/* Order info details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-purple-50/70 p-3 rounded-2xl border border-purple-100 shrink-0">
              <div>
                <span className="text-purple-900/60 font-semibold block text-[10px]">Content</span>
                <span className="font-bold text-purple-950 truncate block">{viewingReceiptOrder.contentTitle}</span>
              </div>
              <div>
                <span className="text-purple-900/60 font-semibold block text-[10px]">Amount</span>
                <span className="font-black text-emerald-700">{formatINR(viewingReceiptOrder.amount)}</span>
              </div>
              <div>
                <span className="text-purple-900/60 font-semibold block text-[10px]">Submitted UTR</span>
                <span className="font-mono font-bold text-purple-950">{viewingReceiptOrder.transactionRef || 'None'}</span>
              </div>
              <div>
                <span className="text-purple-900/60 font-semibold block text-[10px]">Status</span>
                <span className="font-bold uppercase text-[10px] text-pink-700">{viewingReceiptOrder.status}</span>
              </div>
            </div>

            {/* Action Buttons in Receipt Modal */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-purple-100 shrink-0">
              {viewingReceiptOrder.screenshotUrl && (
                <a
                  href={viewingReceiptOrder.screenshotUrl}
                  download={`Receipt-${viewingReceiptOrder.orderId}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </a>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {viewingReceiptOrder.status === 'waiting_verification' && (
                  <>
                    <button
                      onClick={async () => {
                        await handleRejectOrder(viewingReceiptOrder.orderId);
                        setViewingReceiptOrder(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Fake Claim</span>
                    </button>
                    <button
                      onClick={async () => {
                        await handleApproveOrder(viewingReceiptOrder.orderId);
                        setViewingReceiptOrder(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Unlock Content</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setViewingReceiptOrder(null)}
                  className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
