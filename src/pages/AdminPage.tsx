import React, { useState, useEffect } from 'react';
import { MediaItem, OrderItem, SiteSettings, AdminStats, VipLeadItem, VipPlan } from '../types';
import {
  adminLogin,
  getAdminToken,
  removeAdminToken,
  fetchAdminStats,
  fetchAdminOrders,
  fetchAdminContent,
  fetchSiteSettings,
  fetchVipLeads,
  deleteVipLead,
  updateVipLead,
  createVipLead,
  deleteAdminOrder,
  createAdminContent,
  updateAdminContent,
  deleteAdminContent,
  purgeDemoContent,
  updateAdminSettings,
  verifyAdminOrder,
  adminApproveOrder,
  adminRejectOrder,
  restorePreviousOriginalData,
  formatINR,
  CLIENT_SITE_SETTINGS
} from '../utils/api';
import { HomepageControlTab } from '../components/HomepageControlTab';
import { StoryHighlightsManager } from '../components/StoryHighlightsManager';
import { MediaUploadZone } from '../components/MediaUploadZone';
import { MultiPhotoUploadZone } from '../components/MultiPhotoUploadZone';
import { UserManagementSection } from '../components/UserManagementSection';
import { PaymentManagementSection } from '../components/PaymentManagementSection';
import { ProfileWebsiteSettingsSection } from '../components/ProfileWebsiteSettingsSection';
import {
  sendNewPostNotification,
  sendTestNotification,
  getActiveSubscribersCount
} from '../services/notificationService';
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
  EyeOff,
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
  Download,
  Bell,
  BellRing,
  Send,
  Radio,
  User,
  Phone,
  MessageCircle,
  Users,
  Crown,
  CreditCard,
  Award,
  PlusCircle,
  UserX,
  UserCheck,
  Smartphone,
  QrCode,
  SlidersHorizontal,
  CheckCircle,
  Info,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
  UserPlus
} from 'lucide-react';

interface AdminPageProps {
  onBackToSite: () => void;
  onSettingsUpdated: (newSettings: SiteSettings) => void;
  onContentUpdated?: (content: MediaItem[]) => void;
  initialContent?: MediaItem[];
  initialSettings?: SiteSettings;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onBackToSite,
  onSettingsUpdated,
  onContentUpdated,
  initialContent,
  initialSettings
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAdminToken());
  const [passcode, setPasscode] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'users' | 'orders' | 'plans' | 'highlights' | 'homepage' | 'settings' | 'setup'>('dashboard');

  // Data states (pre-populated instantly with initial site data)
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [contentList, setContentList] = useState<MediaItem[]>(() => (initialContent && initialContent.length > 0 ? initialContent : []));
  const [ordersList, setOrdersList] = useState<OrderItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(() => initialSettings || null);
  const [vipLeads, setVipLeads] = useState<VipLeadItem[]>([]);
  const [leadSearch, setLeadSearch] = useState('');
  const [userVipFilter, setUserVipFilter] = useState<'all' | 'active' | 'free' | 'banned'>('all');
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [testNotificationLoading, setTestNotificationLoading] = useState(false);

  // Content Filtering, Search, Sorting, Bulk selection
  const [contentSearch, setContentSearch] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'video' | 'photo' | 'pack'>('all');
  const [contentAccessFilter, setContentAccessFilter] = useState<'all' | 'premium' | 'free'>('all');
  const [contentSort, setContentSort] = useState<'newest' | 'oldest' | 'views' | 'priceAsc' | 'priceDesc'>('newest');
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Modals and Action States
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [adminPreviewItem, setAdminPreviewItem] = useState<MediaItem | null>(null);
  const [webhookSimOrderId, setWebhookSimOrderId] = useState('');
  const [webhookSimLoading, setWebhookSimLoading] = useState(false);
  const [webhookSimResult, setWebhookSimResult] = useState<string | null>(null);

  // Users & Members Management States
  const [deletingLead, setDeletingLead] = useState<VipLeadItem | null>(null);
  const [isDeletingLead, setIsDeletingLead] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', phone: '', email: '', tier: 'Gold VIP', notes: '' });

  // VIP Plans Management States
  const [editingPlan, setEditingPlan] = useState<VipPlan | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [planFormData, setPlanFormData] = useState<Partial<VipPlan>>({
    title: '',
    subtitle: '',
    price: 199,
    originalPrice: 499,
    durationDays: 30,
    durationLabel: '30 Days Access',
    badge: 'POPULAR 🔥',
    popular: true,
    enabled: true,
    perks: ['All HD Photo Sets', 'Exclusive Video Reels', 'VIP Instagram Support']
  });
  const [isSavingPlans, setIsSavingPlans] = useState(false);

  // Order deletion & Screenshot Zoom
  const [deletingOrder, setDeletingOrder] = useState<OrderItem | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [screenshotZoom, setScreenshotZoom] = useState<number>(1);

  // Profile and Banner state for Settings
  const [settingsProfilePic, setSettingsProfilePic] = useState<string>('');
  const [settingsBannerUrl, setSettingsBannerUrl] = useState<string>('');

  const [contentFormData, setContentFormData] = useState<Partial<MediaItem>>({
    title: '',
    description: '',
    type: 'photo',
    access: 'premium',
    price: 99,
    thumbnailUrl: '',
    mediaUrl: '',
    previewUrl: '',
    galleryUrls: [],
    photoCount: 1,
    tags: ['Exclusive', 'VIP'],
    duration: '1:30',
    published: true,
    featured: true
  });

  // Orders search & filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<OrderItem | null>(null);
  const [copiedSecretLink, setCopiedSecretLink] = useState(false);

  // In-App Toast & Confirmation Modal States (Eliminates iframe popup blocking)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState<OrderItem | null>(null);
  const [verifyingTxnRef, setVerifyingTxnRef] = useState('');
  const [rejectingOrder, setRejectingOrder] = useState<OrderItem | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
      showToast('✅ सीक्रेट लिंक कॉपी हो गया (Secret admin link copied)');
      setTimeout(() => setCopiedSecretLink(false), 2500);
    } catch (err) {
      showToast(getSecretUrl(), 'info');
    }
  };

  // Load Admin Data (with live sync)
  const loadAdminData = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsSyncing(true);
    try {
      const [ordersData, contentData, settingsData, leadsData] = await Promise.all([
        fetchAdminOrders(),
        fetchAdminContent(true),
        fetchSiteSettings(true),
        fetchVipLeads()
      ]);
      const validContent = Array.isArray(contentData) ? contentData : [];
      const validSettings = settingsData || initialSettings;

      const statsData = await fetchAdminStats(validContent, ordersData, validSettings);
      setStats(statsData);
      setOrdersList(ordersData);
      setContentList(validContent);
      if (onContentUpdated) onContentUpdated(validContent);
      if (validSettings) {
        setSiteSettings(validSettings);
        if (onSettingsUpdated) onSettingsUpdated(validSettings);
      }
      setVipLeads(leadsData);

      // Load push subscriber count
      getActiveSubscribersCount()
        .then((cnt) => setSubscriberCount(cnt))
        .catch(() => {});

      if (silent) {
        showToast('✅ सभी लाइव डेटा सिंक हो गया है (Data synced successfully)');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Unauthorized')) {
        removeAdminToken();
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
      setIsSyncing(false);
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
      showToast('✅ एडमिन लॉगिन सफल (Welcome to Admin Dashboard)');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid admin passcode');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeAdminToken();
    setIsAuthenticated(false);
    showToast('लॉगआउट सफल (Logged out)');
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<MediaItem> = { ...contentFormData };
      
      // Auto-sync multi-photo album fields
      if (payload.type === 'photo' || payload.type === 'pack') {
        if (payload.galleryUrls && payload.galleryUrls.length > 0) {
          if (!payload.mediaUrl || !payload.galleryUrls.includes(payload.mediaUrl)) {
            payload.mediaUrl = payload.galleryUrls[0];
          }
          if (!payload.thumbnailUrl) {
            payload.thumbnailUrl = payload.galleryUrls[0];
          }
          payload.photoCount = payload.galleryUrls.length;
        }
      }

      if (editingItem) {
        // Instant optimistic update
        const updatedItem = { ...editingItem, ...payload } as MediaItem;
        const nextList = contentList.map(item => item.id === editingItem.id ? updatedItem : item);
        setContentList(nextList);
        if (onContentUpdated) onContentUpdated(nextList);
        setShowContentModal(false);
        setEditingItem(null);
        showToast('✅ पोस्ट सफलतापूर्वक अपडेट हो गई');
        await updateAdminContent(editingItem.id, payload);
      } else {
        setShowContentModal(false);
        showToast('⏳ नई पोस्ट पब्लिश हो रही है...');
        const created = await createAdminContent(payload);
        const nextList = [created, ...contentList];
        setContentList(nextList);
        if (onContentUpdated) onContentUpdated(nextList);
        showToast('✅ नई पोस्ट सफलतापूर्वक पब्लिश हो गई');

        // Trigger Push Notification automatically if published (Single notification per post / album)
        if (created && created.published !== false && siteSettings) {
          try {
            const notifResult = await sendNewPostNotification(created, siteSettings);
            if (notifResult.success && notifResult.recipientCount !== undefined) {
              showToast(`🔔 ${notifResult.message}`, 'info');
            }
          } catch (notifErr) {
            console.warn('[FCM Notification Non-fatal]', notifErr);
          }
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save content', 'error');
    }
  };

  const handleSendTestNotification = async () => {
    if (!siteSettings) return;
    setTestNotificationLoading(true);
    try {
      const res = await sendTestNotification(siteSettings, false);
      if (res.success) {
        showToast(`🚀 ${res.message}`);
        const cnt = await getActiveSubscribersCount();
        setSubscriberCount(cnt);
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Test notification failed', 'error');
    } finally {
      setTestNotificationLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    const targetId = deletingItem.id;
    const itemToDelete = { ...deletingItem };
    try {
      await deleteAdminContent(targetId, itemToDelete);
      // Remove from UI after successful Cloudinary and Firebase deletion
      const nextList = contentList.filter(c => c.id !== targetId);
      setContentList(nextList);
      if (onContentUpdated) onContentUpdated(nextList);
      setDeletingItem(null);
      showToast('🗑️ Cloudinary और Firebase से सफलतापूर्वक डिलीट हो गया!');
    } catch (err: any) {
      console.error('[Admin Delete Error]', err);
      showToast(err.message || 'डिलीट करने में विफल (Failed to delete)', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreAllOriginalData = async () => {
    if (!window.confirm('क्या आप पिछला सारा डेटा, प्रोफाइल सेटिंग्स और सभी 8 ओरिजिनल पोस्ट्स वापस लाना चाहते हैं?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await restorePreviousOriginalData();
      const updatedContent = await fetchAdminContent(true);
      const updatedSettings = await fetchSiteSettings(true);
      setContentList(updatedContent);
      setSiteSettings(updatedSettings);
      if (onContentUpdated) onContentUpdated(updatedContent);
      if (onSettingsUpdated) onSettingsUpdated(updatedSettings);
      showToast(`🎉 ${res.message}`);
    } catch (err: any) {
      showToast(err.message || 'रीस्टोर करने में विफल', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePurgeAllDemoData = async () => {
    if (!window.confirm('क्या आप सभी डेमो पोस्ट्स हटाना चाहते हैं ताकि वेबसाइट पर सिर्फ आपके द्वारा अपलोड किए गए असली फोटो दिखें?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await purgeDemoContent();
      const demoIds = ['rk-001', 'rk-002', 'rk-003', 'rk-004', 'rk-005', 'rk-006', 'rk-007', 'rk-008'];
      const nextList = contentList.filter(c => !demoIds.includes(c.id) && c.badge !== 'Starter Demo' && !(Array.isArray(c.tags) && c.tags.includes('Starter Demo')));
      setContentList(nextList);
      if (onContentUpdated) onContentUpdated(nextList);
      showToast(`✨ ${res.message}`);
    } catch (err: any) {
      showToast(err.message || 'डेमो हटाने में विफल', 'error');
    } finally {
      setLoading(false);
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

  const handleConfirmBulkDelete = async () => {
    if (selectedContentIds.length === 0) return;
    setBulkActionLoading(true);
    const targetIds = [...selectedContentIds];
    const itemsToDelete = contentList.filter(c => targetIds.includes(c.id));
    setShowBulkDeleteConfirm(false);
    try {
      for (const item of itemsToDelete) {
        await deleteAdminContent(item.id, item);
      }
      const nextList = contentList.filter(c => !targetIds.includes(c.id));
      setContentList(nextList);
      if (onContentUpdated) onContentUpdated(nextList);
      setSelectedContentIds([]);
      showToast(`🗑️ ${itemsToDelete.length} पोस्ट्स Cloudinary और Firebase से सफलतापूर्वक डिलीट हो गईं!`);
    } catch (err: any) {
      showToast(err.message || 'Bulk delete failed', 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkPublish = async (publish: boolean) => {
    if (selectedContentIds.length === 0) return;
    setBulkActionLoading(true);
    const targetIds = [...selectedContentIds];
    // Optimistic UI update
    const nextList = contentList.map(c => targetIds.includes(c.id) ? { ...c, published: publish } : c);
    setContentList(nextList);
    if (onContentUpdated) onContentUpdated(nextList);
    setSelectedContentIds([]);
    try {
      for (const id of targetIds) {
        await updateAdminContent(id, { published: publish });
      }
      showToast(`✅ चुने हुए पोस्ट्स ${publish ? 'पब्लिश' : 'अनपब्लिश'} कर दिए गए`);
    } catch (err: any) {
      showToast(err.message || 'Bulk publish update failed', 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkFeatured = async (featured: boolean) => {
    if (selectedContentIds.length === 0) return;
    setBulkActionLoading(true);
    const targetIds = [...selectedContentIds];
    // Optimistic UI update
    const nextList = contentList.map(c => targetIds.includes(c.id) ? { ...c, featured } : c);
    setContentList(nextList);
    if (onContentUpdated) onContentUpdated(nextList);
    setSelectedContentIds([]);
    try {
      for (const id of targetIds) {
        await updateAdminContent(id, { featured });
      }
      showToast(`⭐ चुने हुए पोस्ट्स होमपेज पर ${featured ? 'फीचर' : 'हटाए'} गए`);
    } catch (err: any) {
      showToast(err.message || 'Bulk feature update failed', 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleManualVerifySubmit = async () => {
    if (!verifyingOrder) return;
    const txn = verifyingTxnRef.trim() || `ADMIN_VERIFIED_${Date.now()}`;
    try {
      const updated = await verifyAdminOrder(verifyingOrder.orderId, txn);
      const nextOrders = ordersList.map(o => o.orderId === verifyingOrder.orderId ? updated : o);
      setOrdersList(nextOrders);
      showToast('✅ आर्डर मार्क हुआ PAID और कंटेंट अनलॉक हो गया!');
      setVerifyingOrder(null);
      setVerifyingTxnRef('');
    } catch (err: any) {
      showToast(err.message || 'Failed to verify order', 'error');
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      const res = await adminApproveOrder(orderId);
      if (res.success && res.order) {
        const nextOrders = ordersList.map(o => o.orderId === orderId ? res.order! : o);
        setOrdersList(nextOrders);
        showToast('✅ पेमेंट स्वीकार! ग्राहक के लिए कंटेंट तुरंत अनलॉक कर दिया गया।');
      } else {
        showToast(res.error || 'Failed to approve order', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingOrder) return;
    try {
      const res = await adminRejectOrder(rejectingOrder.orderId, 'Payment not received in bank / Invalid UTR');
      if (res.success) {
        const nextOrders = ordersList.map(o => o.orderId === rejectingOrder.orderId ? { ...o, status: 'failed' as const } : o);
        setOrdersList(nextOrders);
        showToast('❌ आर्डर अस्वीकार (Order rejected)', 'info');
        setRejectingOrder(null);
      } else {
        showToast(res.error || 'Failed to reject order', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Reject failed', 'error');
    }
  };

  // ----------------------------------------------------
  // USER / VIP LEAD HANDLERS
  // ----------------------------------------------------
  const handleDeleteLeadConfirm = async () => {
    if (!deletingLead) return;
    setIsDeletingLead(true);
    try {
      await deleteVipLead(deletingLead.id);
      setVipLeads(prev => prev.filter(l => l.id !== deletingLead.id));
      showToast('✅ यूजर को सफलतापूर्वक डिलीट कर दिया गया (User deleted)');
      setDeletingLead(null);
    } catch (err: any) {
      showToast(err.message || 'यूजर डिलीट करने में विफल', 'error');
    } finally {
      setIsDeletingLead(false);
    }
  };

  const handleToggleUserVip = async (lead: VipLeadItem) => {
    const currentStatus = lead.vipStatus || 'free';
    const newStatus = currentStatus === 'active' ? 'free' : 'active';
    const newTier = newStatus === 'active' ? (lead.tier || 'Gold VIP') : 'Free Member';
    try {
      await updateVipLead(lead.id, { vipStatus: newStatus, tier: newTier });
      setVipLeads(prev => prev.map(l => l.id === lead.id ? { ...l, vipStatus: newStatus, tier: newTier } : l));
      showToast(newStatus === 'active' ? `👑 ${lead.name || 'User'} को VIP एक्सेस दिया गया!` : `ℹ️ ${lead.name || 'User'} का VIP स्टेटस हटाया गया।`);
    } catch (err: any) {
      showToast('VIP स्टेटस अपडेट करने में विफल', 'error');
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name.trim() || !newUserData.phone.trim()) {
      showToast('कृपया नाम और फोन नंबर दर्ज करें', 'error');
      return;
    }
    try {
      const created = await createVipLead({
        name: newUserData.name.trim(),
        phone: newUserData.phone.trim(),
        email: newUserData.email.trim(),
        tier: newUserData.tier,
        vipStatus: newUserData.tier.includes('VIP') ? 'active' : 'free',
        notes: newUserData.notes.trim()
      });
      setVipLeads(prev => [created, ...prev]);
      showToast('✅ नया VIP सदस्य सफलतापूर्वक जोड़ा गया!');
      setShowAddUserModal(false);
      setNewUserData({ name: '', phone: '', email: '', tier: 'Gold VIP', notes: '' });
    } catch (err: any) {
      showToast(err.message || 'यूजर जोड़ने में विफल', 'error');
    }
  };

  // ----------------------------------------------------
  // ORDER DELETION HANDLER
  // ----------------------------------------------------
  const handleDeleteOrderConfirm = async () => {
    if (!deletingOrder) return;
    setIsDeletingOrder(true);
    try {
      await deleteAdminOrder(deletingOrder.orderId);
      setOrdersList(prev => prev.filter(o => o.orderId !== deletingOrder.orderId));
      showToast('✅ आर्डर डेटाबेस से सफलतापूर्वक डिलीट कर दिया गया');
      setDeletingOrder(null);
    } catch (err: any) {
      showToast(err.message || 'आर्डर डिलीट करने में विफल', 'error');
    } finally {
      setIsDeletingOrder(false);
    }
  };

  // ----------------------------------------------------
  // VIP MEMBERSHIP PLANS HANDLERS
  // ----------------------------------------------------
  const handleSavePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPlans(true);
    try {
      const currentPlans = siteSettings?.vipPlans && siteSettings.vipPlans.length > 0 
        ? [...siteSettings.vipPlans] 
        : [];

      let updatedPlans: VipPlan[] = [];
      if (editingPlan) {
        // Editing existing plan
        updatedPlans = currentPlans.map(p => p.id === editingPlan.id ? { ...p, ...planFormData } as VipPlan : p);
      } else {
        // Creating new plan
        const newPlan: VipPlan = {
          id: `plan_${Date.now()}`,
          title: planFormData.title || 'Exclusive VIP Pass',
          subtitle: planFormData.subtitle || 'All Access Pass',
          price: Number(planFormData.price) || 199,
          originalPrice: Number(planFormData.originalPrice) || 499,
          durationDays: Number(planFormData.durationDays) || 30,
          durationLabel: planFormData.durationLabel || '30 Days Access',
          badge: planFormData.badge || 'POPULAR 🔥',
          popular: !!planFormData.popular,
          enabled: planFormData.enabled ?? true,
          perks: planFormData.perks && planFormData.perks.length > 0 ? planFormData.perks : ['All HD Photo Sets', 'Private Videos', 'Instant Access']
        };
        updatedPlans = [...currentPlans, newPlan];
      }

      const updatedSettings = await updateAdminSettings({ vipPlans: updatedPlans });
      setSiteSettings(updatedSettings);
      if (onSettingsUpdated) onSettingsUpdated(updatedSettings);
      showToast('✅ VIP प्लान सफलतापूर्वक सेव हो गया!');
      setEditingPlan(null);
      setIsCreatingPlan(false);
    } catch (err: any) {
      showToast(err.message || 'प्लान सेव करने में विफल', 'error');
    } finally {
      setIsSavingPlans(false);
    }
  };

  const handleTogglePlanStatus = async (planId: string) => {
    if (!siteSettings?.vipPlans) return;
    try {
      const updatedPlans = siteSettings.vipPlans.map(p => 
        p.id === planId ? { ...p, enabled: !p.enabled } : p
      );
      const updatedSettings = await updateAdminSettings({ vipPlans: updatedPlans });
      setSiteSettings(updatedSettings);
      if (onSettingsUpdated) onSettingsUpdated(updatedSettings);
      showToast('✅ प्लान स्थिति अपडेट हुई!');
    } catch (err: any) {
      showToast('प्लान अपडेट करने में विफल', 'error');
    }
  };

  const handleDeletePlanConfirm = async (planId: string) => {
    if (!siteSettings?.vipPlans) return;
    try {
      const updatedPlans = siteSettings.vipPlans.filter(p => p.id !== planId);
      const updatedSettings = await updateAdminSettings({ vipPlans: updatedPlans });
      setSiteSettings(updatedSettings);
      if (onSettingsUpdated) onSettingsUpdated(updatedSettings);
      showToast('✅ VIP प्लान हटा दिया गया!');
    } catch (err: any) {
      showToast('प्लान हटाने में विफल', 'error');
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
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) ||
        (o.transactionRef && o.transactionRef.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filtered VIP Leads & Users
  const filteredUsers = vipLeads.filter((lead) => {
    if (userVipFilter === 'active' && lead.vipStatus !== 'active') return false;
    if (userVipFilter === 'free' && lead.vipStatus === 'active') return false;
    if (leadSearch.trim()) {
      const q = leadSearch.toLowerCase();
      return (
        (lead.name && lead.name.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.tier && lead.tier.toLowerCase().includes(q)) ||
        (lead.notes && lead.notes.toLowerCase().includes(q))
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
              सुरक्षित एडमिन पासकोड दर्ज करें (Enter your secret passkey)
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 text-xs text-center font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">
                Admin Passcode (सीक्रेट पासवर्ड)
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl pl-4 pr-11 py-3 text-sm text-purple-950 placeholder-purple-900/40 focus:outline-none focus:border-pink-500 shadow-sm font-mono font-bold tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-purple-400 hover:text-purple-700 transition-colors cursor-pointer"
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glow-pink-btn py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white flex items-center justify-center gap-2 shadow-md shadow-pink-500/20 active:scale-[0.98] transition-transform cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>सत्यापित किया जा रहा है...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Access Admin Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={onBackToSite}
              className="text-xs text-purple-900/60 hover:text-pink-600 font-bold transition-colors block mx-auto cursor-pointer"
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
              UPI Payee: <strong className="text-pink-700">{siteSettings?.upiId || 'rima11q@ptyes'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => loadAdminData(true)}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-2xl bg-white hover:bg-purple-50 text-purple-900 text-xs font-bold border border-purple-200 shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Refresh and sync all data directly from website and database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-pink-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'सिंक हो रहा है...' : 'डेटा रिफ्रेश (Sync Data)'}</span>
          </button>

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
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'content'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Content ({contentList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Members ({vipLeads.length})</span>
          {vipLeads.filter(l => l.vipStatus === 'active').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-purple-950 text-[10px] font-black shadow-2xs">
              {vipLeads.filter(l => l.vipStatus === 'active').length} VIP
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
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
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>VIP Plans ({siteSettings?.vipPlans?.length || 3})</span>
        </button>

        <button
          onClick={() => setActiveTab('highlights')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'highlights'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Highlights ({siteSettings?.storyHighlights?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('homepage')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'homepage'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Homepage Control</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Profile & Website Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('setup')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'setup'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'text-purple-700 hover:text-purple-950 hover:bg-purple-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Gateway & Docs</span>
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
                              onClick={() => {
                                setVerifyingOrder(o);
                                setVerifyingTxnRef(`ADMIN_VERIFIED_${Date.now()}`);
                              }}
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
          
          {/* Header & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-black text-xl text-purple-950">Content Management & Library</h2>
              <p className="text-xs text-purple-900/70 font-medium">
                Add, edit, delete, publish/unpublish, feature, price, tag, and bulk control your VIP media catalog.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={handleRestoreAllOriginalData}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-purple-950 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border border-purple-300 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="पिछला सारा डेटा व ओरिजिनल पोस्ट्स रीस्टोर करें"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-700" />
                <span>पिछला डेटा व पोस्ट्स लाएं (Restore Data)</span>
              </button>

              <button
                type="button"
                onClick={handlePurgeAllDemoData}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="सभी डिफ़ॉल्ट डेमो पोस्ट्स हटाएं"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>डेमो पोस्ट हटाएं (Clear Demo Data)</span>
              </button>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setContentFormData({
                    title: '',
                    description: '',
                    type: 'photo',
                    access: 'premium',
                    price: 99,
                    thumbnailUrl: '',
                    mediaUrl: '',
                    previewUrl: '',
                    galleryUrls: [],
                    photoCount: 1,
                    tags: ['Exclusive', 'VIP'],
                    duration: '1:30',
                    published: true,
                    featured: false
                  });
                  setShowContentModal(true);
                }}
                className="glow-pink-btn px-5 py-2.5 rounded-2xl text-xs font-black text-white flex items-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-transform cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Content Item</span>
              </button>
            </div>
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
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-black border border-rose-200 shadow-xs transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Bulk Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* Content Cards Grid */}
          {filteredContent.length === 0 ? (
            <div className="p-8 sm:p-12 text-center glass-card rounded-3xl border-2 border-dashed border-purple-200 space-y-4 shadow-sm my-6">
              <div className="p-3.5 w-fit mx-auto rounded-2xl bg-pink-100 text-pink-600">
                <Film className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-purple-950">कोई पोस्ट नहीं मिली (No Content Items Found)</h3>
                <p className="text-xs text-purple-900/70 max-w-md mx-auto font-medium">
                  यदि आपके पिछले पोस्ट हट गए हैं या डेटा खाली दिख रहा है, तो नीचे दिए गए बटन पर क्लिक करके सभी पुराने 8 पोस्ट और डेटा तुरंत रीस्टोर करें।
                </p>
              </div>
              <button
                type="button"
                onClick={handleRestoreAllOriginalData}
                className="glow-pink-btn px-6 py-3 rounded-2xl text-xs font-black text-white inline-flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>🔄 पिछला सारा डेटा व 8 पोस्ट्स वापस लाएं (Restore All Content)</span>
              </button>
            </div>
          ) : (
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
                          const existingPhotos = item.galleryUrls && item.galleryUrls.length > 0
                            ? [...item.galleryUrls]
                            : item.mediaUrl
                            ? [item.mediaUrl]
                            : [];
                          setContentFormData({
                            ...item,
                            galleryUrls: existingPhotos,
                            photoCount: existingPhotos.length || item.photoCount || 1
                          });
                          setShowContentModal(true);
                        }}
                        className="p-2 rounded-xl bg-white hover:bg-pink-50 text-purple-900 border border-purple-100 shadow-sm"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingItem(item)}
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
        )}

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
      {/* TAB 4: ORDERS & PAYMENT MANAGEMENT (AUDIT & SCREENSHOTS) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'orders' && (
        <PaymentManagementSection
          ordersList={ordersList}
          onReload={loadAdminData}
          showToast={showToast}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: USERS & VIP MEMBERS MANAGEMENT (FULL SUITE) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'users' && (
        <UserManagementSection
          vipLeads={vipLeads}
          ordersList={ordersList}
          onReload={loadAdminData}
          showToast={showToast}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: VIP PLANS & PRICING MANAGEMENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'plans' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm">
            <div>
              <h2 className="font-display font-black text-xl text-purple-950 flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-500 fill-amber-400" />
                <span>VIP Membership Plans & Pricing (VIP प्लान्स व मूल्य)</span>
              </h2>
              <p className="text-xs text-purple-900/70 font-medium mt-0.5">
                Customize VIP pass duration, pricing, promotional discounts, and included perks directly on your website.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPlanFormData({
                  title: 'Special VIP Pass',
                  subtitle: 'Full Exclusive Access',
                  price: 299,
                  originalPrice: 699,
                  durationDays: 30,
                  durationLabel: '30 Days Access',
                  badge: 'EXCLUSIVE ✨',
                  popular: false,
                  enabled: true,
                  perks: ['All HD Photo Sets', 'VIP Video Reels', 'Priority Instagram Support']
                });
                setEditingPlan(null);
                setIsCreatingPlan(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-black shadow-md shadow-pink-600/20 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New VIP Plan</span>
            </button>
          </div>

          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(siteSettings?.vipPlans || []).map((plan) => {
              const discountPercent = plan.originalPrice > plan.price 
                ? Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)
                : 0;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-6 border-2 transition-all flex flex-col justify-between shadow-md ${
                    plan.popular
                      ? 'bg-gradient-to-b from-pink-50 via-white to-purple-50 border-pink-400 shadow-pink-500/10'
                      : 'bg-white border-purple-100 hover:border-purple-200'
                  } ${!plan.enabled ? 'opacity-60 grayscale-[30%]' : ''}`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-100 text-pink-700 border border-pink-200 shadow-2xs">
                      {plan.badge || 'VIP PASS'}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => handleTogglePlanStatus(plan.id)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-colors cursor-pointer ${
                        plan.enabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      {plan.enabled ? 'Active ✅' : 'Disabled ⛔'}
                    </button>
                  </div>

                  {/* Plan Details */}
                  <div className="space-y-2 mb-4">
                    <h3 className="font-display font-black text-lg text-purple-950">{plan.title}</h3>
                    <p className="text-xs text-purple-900/60 font-medium">{plan.subtitle}</p>

                    <div className="flex items-baseline gap-2 pt-2">
                      <span className="font-display font-black text-2xl text-purple-950">
                        {formatINR(plan.price)}
                      </span>
                      {plan.originalPrice > plan.price && (
                        <>
                          <span className="text-xs text-purple-900/40 line-through font-bold">
                            {formatINR(plan.originalPrice)}
                          </span>
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            {discountPercent}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <span className="inline-block text-[11px] font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-xl border border-pink-100">
                      ⏳ {plan.durationLabel}
                    </span>
                  </div>

                  {/* Perks List */}
                  <div className="space-y-1.5 py-3 border-t border-purple-100/80 mb-4 flex-1">
                    <span className="text-[10px] font-black uppercase text-purple-900/50 tracking-wider block mb-1">
                      Included Benefits:
                    </span>
                    {(plan.perks || []).map((perk, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2 text-xs font-semibold text-purple-950">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-purple-100">
                    <button
                      type="button"
                      onClick={() => {
                        setPlanFormData({ ...plan });
                        setEditingPlan(plan);
                        setIsCreatingPlan(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-950 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-pink-600" />
                      <span>Edit Plan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePlanConfirm(plan.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: PROFILE & WEBSITE SETTINGS */}
      {/* ---------------------------------------------------- */}
      {activeTab === "settings" && (
        <ProfileWebsiteSettingsSection
          settings={siteSettings || (initialSettings as SiteSettings) || CLIENT_SITE_SETTINGS}
          onSettingsUpdated={(newSettings) => {
            setSiteSettings(newSettings);
            onSettingsUpdated(newSettings);
            showToast("✅ सेटिंग्स सफलतापूर्वक सेव और अपडेट हो गईं!");
          }}
          subscriberCount={subscriberCount}
        />
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

              {/* 1. Main Media File Upload: Multi-Photo Album Zone for photos/packs, Video Zone for reels */}
              <div className="pt-1">
                {contentFormData.type === 'photo' || contentFormData.type === 'pack' ? (
                  <MultiPhotoUploadZone
                    label={
                      contentFormData.type === 'photo'
                        ? 'VIP Photo Album / Multiple Photos (एक साथ कई फोटो अपलोड करें)'
                        : 'VIP Photo Pack / Bundle (फोटो पैक गैलरी)'
                    }
                    photos={contentFormData.galleryUrls && contentFormData.galleryUrls.length > 0 
                      ? contentFormData.galleryUrls 
                      : contentFormData.mediaUrl 
                      ? [contentFormData.mediaUrl] 
                      : []
                    }
                    onChange={(photos) => {
                      setContentFormData(prev => ({
                        ...prev,
                        galleryUrls: photos,
                        mediaUrl: photos[0] || '',
                        thumbnailUrl: prev.thumbnailUrl || photos[0] || '',
                        photoCount: photos.length || 1
                      }));
                    }}
                    currentCover={contentFormData.thumbnailUrl || contentFormData.mediaUrl || ''}
                    onCoverChange={(coverUrl) => {
                      setContentFormData(prev => ({
                        ...prev,
                        thumbnailUrl: coverUrl
                      }));
                    }}
                    helperText="गैलरी से एक साथ 1 से अधिक फोटो चुनें। आप किसी भी फोटो को क्रॉप कर सकते हैं और कवर फोटो सेट कर सकते हैं।"
                    required
                  />
                ) : (
                  <MediaUploadZone
                    label="VIP Protected Video Reel (गैलरी से वीडियो चुनें)"
                    value={contentFormData.mediaUrl || ''}
                    onChange={(url) => {
                      setContentFormData(prev => ({
                        ...prev,
                        mediaUrl: url,
                        previewUrl: prev.previewUrl || url
                      }));
                    }}
                    accept="video"
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
                    helperText="Select video directly from gallery. Video length and frame thumbnail are generated automatically!"
                  />
                )}
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
                  helperText="Shown on public cards. If using multi-photo above, you can also star any photo to make it cover."
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
                      onClick={() => {
                        setRejectingOrder(viewingReceiptOrder);
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

      {/* ---------------------------------------------------- */}
      {/* 1. SINGLE ITEM DELETE CONFIRMATION MODAL */}
      {/* ---------------------------------------------------- */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-purple-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-purple-950">
                  डिलीट करने की पुष्टि करें (Confirm Delete)
                </h3>
                <p className="text-xs text-purple-900/60 font-medium">
                  Permanent Removal from Cloudinary & Firebase
                </p>
              </div>
            </div>

            <div className="p-3 bg-purple-50/80 rounded-2xl border border-purple-100 flex items-center gap-3">
              <img
                src={deletingItem.thumbnailUrl}
                alt={deletingItem.title}
                className="w-14 h-14 rounded-xl object-cover border border-purple-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-purple-950 truncate">{deletingItem.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-pink-100 text-pink-700">
                    {deletingItem.type}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    {deletingItem.access === 'free' ? 'FREE' : formatINR(deletingItem.price)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-purple-900/80 leading-relaxed font-medium">
              क्या आप वाकई इस मीडिया पोस्ट को डिलीट करना चाहते हैं? यह <b>Cloudinary</b> (फ़ोटो/वीडियो स्टोरेज) और <b>Firebase Firestore</b> (डेटाबेस) दोनों से हमेशा के लिए हटा दिया जाएगा।
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>डिलीट हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हाँ, डिलीट करें (Delete)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. BULK DELETE CONFIRMATION MODAL */}
      {/* ---------------------------------------------------- */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-purple-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-purple-950">
                  बल्क डिलीट (Bulk Delete Posts)
                </h3>
                <p className="text-xs text-purple-900/60 font-medium">
                  {selectedContentIds.length} items selected
                </p>
              </div>
            </div>

            <p className="text-xs text-purple-900/80 leading-relaxed font-medium">
              क्या आप वाकई चुने हुए <strong>{selectedContentIds.length}</strong> पोस्ट्स को एक साथ हमेशा के लिए डिलीट करना चाहते हैं?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={bulkActionLoading}
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                disabled={bulkActionLoading}
                onClick={handleConfirmBulkDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                {bulkActionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>डिलीट हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{selectedContentIds.length} पोस्ट्स डिलीट करें</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. MANUAL ORDER VERIFY MODAL */}
      {/* ---------------------------------------------------- */}
      {verifyingOrder && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-purple-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-pink-100 text-pink-600 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-purple-950">
                  मैनुअल पेमेंट सत्यापन (Verify Order)
                </h3>
                <p className="text-xs text-purple-900/60 font-medium">
                  Order ID: {verifyingOrder.orderId}
                </p>
              </div>
            </div>

            <div className="p-3 bg-purple-50/80 rounded-2xl border border-purple-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-purple-900/60">Content:</span>
                <span className="font-bold text-purple-950">{verifyingOrder.contentTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-900/60">Amount:</span>
                <span className="font-black text-emerald-700">{formatINR(verifyingOrder.amount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-950 mb-1">
                Bank UTR / Transaction Reference
              </label>
              <input
                type="text"
                value={verifyingTxnRef}
                onChange={(e) => setVerifyingTxnRef(e.target.value)}
                placeholder="e.g. 402849204928"
                className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs text-purple-950 font-mono shadow-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setVerifyingOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={handleManualVerifySubmit}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify & Issue Access</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. REJECT ORDER CONFIRMATION MODAL */}
      {/* ---------------------------------------------------- */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-purple-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-purple-950">
                  पेमेंट अस्वीकार करें (Reject Payment Claim)
                </h3>
                <p className="text-xs text-purple-900/60 font-medium">
                  Order ID: {rejectingOrder.orderId}
                </p>
              </div>
            </div>

            <p className="text-xs text-purple-900/80 leading-relaxed font-medium">
              क्या आप वाकई इस क्लेम को अस्वीकार करना चाहते हैं? आर्डर का स्टेटस <strong>FAILED</strong> हो जाएगा।
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>अस्वीकार करें (Reject Claim)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. CONFIRM DELETE USER / LEAD MODAL */}
      {/* ---------------------------------------------------- */}
      {deletingLead && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-purple-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-purple-950">
                  यूजर को डिलीट करें (Delete User Account)
                </h3>
                <p className="text-xs text-purple-900/60 font-medium">
                  Permanent Removal of User & VIP Status
                </p>
              </div>
            </div>

            <div className="p-3 bg-purple-50/80 rounded-2xl border border-purple-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-black text-sm shrink-0">
                {(deletingLead.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-purple-950 truncate">{deletingLead.name || 'VIP Member'}</h4>
                <p className="text-[11px] text-purple-900/60 font-mono">{deletingLead.phone || 'No phone'}</p>
              </div>
            </div>

            <p className="text-xs text-purple-900/80 leading-relaxed font-medium">
              क्या आप वाकई इस यूजर को हमेशा के लिए डिलीट करना चाहते हैं? इनका VIP एक्सेस और डेटाबेस रिकॉर्ड हटा दिया जाएगा।
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingLead}
                onClick={() => setDeletingLead(null)}
                className="px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                disabled={isDeletingLead}
                onClick={handleDeleteLeadConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                {isDeletingLead ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>डिलीट हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हाँ, डिलीट करें (Delete User)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. ADD NEW USER / VIP MEMBER MODAL */}
      {/* ---------------------------------------------------- */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-purple-950/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-white/90 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-purple-950">
                    नया यूजर / VIP सदस्य जोड़ें (Add User)
                  </h3>
                  <p className="text-[11px] text-purple-900/60 font-medium">Create direct user record or grant VIP access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-purple-950 block mb-1">Customer / User Name (नाम) *</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">WhatsApp / Phone Number (मोबाइल नंबर) *</label>
                <input
                  type="tel"
                  required
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-purple-950 shadow-xs font-mono font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="e.g. rahul@gmail.com"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">VIP Tier / Membership Plan</label>
                <select
                  value={newUserData.tier}
                  onChange={(e) => setNewUserData({ ...newUserData, tier: e.target.value })}
                  className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-bold shadow-xs"
                >
                  <option value="Gold VIP">👑 Gold VIP (₹199)</option>
                  <option value="Diamond VIP">👑 Diamond VIP (₹499)</option>
                  <option value="Lifetime VIP">👑 Lifetime VIP (₹999)</option>
                  <option value="Free Member">Free Member</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">Admin Notes (टिप्पणी)</label>
                <input
                  type="text"
                  value={newUserData.notes}
                  onChange={(e) => setNewUserData({ ...newUserData, notes: e.target.value })}
                  placeholder="e.g. Added manually by Admin / Paid via Cash"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-pink-btn px-5 py-2 rounded-xl text-white font-black shadow-md shadow-pink-500/25"
                >
                  Save User Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 7. VIP PLAN CREATE / EDIT MODAL */}
      {/* ---------------------------------------------------- */}
      {isCreatingPlan && (
        <div className="fixed inset-0 z-50 bg-purple-950/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 border border-white/90 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-purple-950">
                    {editingPlan ? 'VIP प्लान संपादित करें (Edit VIP Plan)' : 'नया VIP प्लान बनाएं (Create VIP Plan)'}
                  </h3>
                  <p className="text-[11px] text-purple-900/60 font-medium">Set plan duration, pricing & included benefits</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingPlan(false);
                  setEditingPlan(null);
                }}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlanSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-purple-950 block mb-1">Plan Title (शीर्षक) *</label>
                  <input
                    type="text"
                    required
                    value={planFormData.title}
                    onChange={(e) => setPlanFormData({ ...planFormData, title: e.target.value })}
                    placeholder="e.g. 1 Month VIP Pass"
                    className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-purple-950 shadow-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-950 block mb-1">Badge Tag (बैज)</label>
                  <input
                    type="text"
                    value={planFormData.badge}
                    onChange={(e) => setPlanFormData({ ...planFormData, badge: e.target.value })}
                    placeholder="e.g. POPULAR 🔥, BEST VALUE 💎"
                    className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-purple-950 shadow-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">Subtitle / Tagline (विवरण)</label>
                <input
                  type="text"
                  value={planFormData.subtitle}
                  onChange={(e) => setPlanFormData({ ...planFormData, subtitle: e.target.value })}
                  placeholder="e.g. Full Access to All VIP Photos & Video Reels"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-purple-950 block mb-1">Offer Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={planFormData.price}
                    onChange={(e) => setPlanFormData({ ...planFormData, price: Number(e.target.value) })}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 font-black shadow-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-950 block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={planFormData.originalPrice}
                    onChange={(e) => setPlanFormData({ ...planFormData, originalPrice: Number(e.target.value) })}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 font-bold shadow-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-950 block mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={planFormData.durationDays}
                    onChange={(e) => setPlanFormData({ ...planFormData, durationDays: Number(e.target.value) })}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 font-bold shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">Duration Label (उदा. 30 Days Access, Lifetime Unlimited)</label>
                <input
                  type="text"
                  value={planFormData.durationLabel}
                  onChange={(e) => setPlanFormData({ ...planFormData, durationLabel: e.target.value })}
                  placeholder="e.g. 30 Days Full Access"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">Included Benefits / Perks (Comma-separated)</label>
                <textarea
                  rows={2}
                  value={planFormData.perks.join(', ')}
                  onChange={(e) => setPlanFormData({
                    ...planFormData,
                    perks: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="All VIP Photos, HD Video Reels, Direct Instagram DM Support"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-950">
                  <input
                    type="checkbox"
                    checked={planFormData.enabled}
                    onChange={(e) => setPlanFormData({ ...planFormData, enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-pink-600 border-purple-300"
                  />
                  <span>Plan Active & Visible</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-950">
                  <input
                    type="checkbox"
                    checked={planFormData.popular}
                    onChange={(e) => setPlanFormData({ ...planFormData, popular: e.target.checked })}
                    className="w-4 h-4 rounded text-pink-600 border-purple-300"
                  />
                  <span>Highlight as Most Popular 🔥</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  disabled={isSavingPlans}
                  onClick={() => {
                    setIsCreatingPlan(false);
                    setEditingPlan(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlans}
                  className="glow-pink-btn px-6 py-2 rounded-xl text-white font-black shadow-md shadow-pink-500/25"
                >
                  {isSavingPlans ? 'Saving Plan...' : 'Save VIP Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 8. CONFIRM DELETE ORDER MODAL */}
      {/* ---------------------------------------------------- */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-purple-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-purple-950">
                  आर्डर को हमेशा के लिए डिलीट करें (Delete Order)
                </h3>
                <p className="text-xs text-purple-900/60 font-medium">
                  Order ID: <span className="font-mono text-pink-700">{deletingOrder.orderId}</span>
                </p>
              </div>
            </div>

            <div className="p-3 bg-purple-50/80 rounded-2xl border border-purple-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-purple-900/60">Customer:</span>
                <span className="font-bold text-purple-950">{deletingOrder.customerName || 'Direct Visitor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-900/60">Amount:</span>
                <span className="font-black text-emerald-700">{formatINR(deletingOrder.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-900/60">Content:</span>
                <span className="font-bold text-purple-950 truncate max-w-[200px]">{deletingOrder.contentTitle}</span>
              </div>
            </div>

            <p className="text-xs text-purple-900/80 leading-relaxed font-medium">
              क्या आप वाकई इस आर्डर रिकॉर्ड को डेटाबेस से डिलीट करना चाहते हैं?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={() => setDeletingOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={handleDeleteOrderConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                {isDeletingOrder ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>डिलीट हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हाँ, आर्डर डिलीट करें (Delete)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 9. FLOATING IN-APP TOAST NOTIFICATION */}
      {/* ---------------------------------------------------- */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-black ${
              toast.type === 'error'
                ? 'bg-rose-900 text-rose-50 border-rose-700'
                : toast.type === 'info'
                ? 'bg-purple-950 text-purple-100 border-purple-800'
                : 'bg-emerald-900 text-emerald-50 border-emerald-700'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 opacity-70 hover:opacity-100 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
