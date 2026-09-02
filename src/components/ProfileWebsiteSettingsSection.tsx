import React, { useState, useRef } from 'react';
import { SiteSettings, VipPlan } from '../types';
import {
  Camera,
  Upload,
  Check,
  AlertCircle,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Lock,
  Smartphone,
  MessageCircle,
  Instagram,
  Send,
  Youtube,
  Facebook,
  Globe,
  MapPin,
  Tag,
  TrendingUp,
  Flame,
  CheckCircle2,
  Crown,
  Bell,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  BadgeCheck,
  Radio
} from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinary';
import { updateAdminSettings, getSecretUrl, triggerPushNotificationToSubscribers } from '../utils/api';

interface ProfileWebsiteSettingsSectionProps {
  settings: SiteSettings;
  onSettingsUpdated: (newSettings: SiteSettings) => void;
  subscriberCount?: number;
}

type SubTab = 'profile' | 'payment' | 'whatsapp' | 'banner' | 'security';

export const ProfileWebsiteSettingsSection: React.FC<ProfileWebsiteSettingsSectionProps> = ({
  settings,
  onSettingsUpdated,
  subscriberCount = 0
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('profile');
  const [formData, setFormData] = useState<Partial<SiteSettings>>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Cloudinary upload state for profile photo
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState<number>(0);
  const [photoUploadStatusText, setPhotoUploadStatusText] = useState<string>('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Cloudinary upload state for banner
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerUploadProgress, setBannerUploadProgress] = useState<number>(0);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Security URL copy state
  const [copiedLink, setCopiedLink] = useState(false);
  const [testNotifLoading, setTestNotifLoading] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setSaveStatus({ type, message });
    setTimeout(() => {
      setSaveStatus({ type: null, message: '' });
    }, 4500);
  };

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Direct Cloudinary Upload for Profile Photo
  const handlePhotoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'कृपया केवल इमेज फाइल (JPG, PNG, WEBP) चुनें।');
      return;
    }

    const previousPicUrl = formData.profilePicUrl;
    const previousPublicId = formData.profilePicPublicId;

    setIsUploadingPhoto(true);
    setPhotoUploadProgress(5);
    setPhotoUploadStatusText('Cloudinary पर डायरेक्ट अपलोड शुरू हो रहा है...');

    try {
      const result = await uploadToCloudinary(file, {
        folder: 'settings',
        resourceType: 'image',
        onProgress: (pct, status) => {
          setPhotoUploadProgress(pct);
          setPhotoUploadStatusText(status);
        }
      });

      // Update local form state with Cloudinary result
      handleChange('profilePicUrl', result.secureUrl);
      handleChange('profilePicPublicId', result.publicId);
      handleChange('profilePicResourceType', result.resourceType);

      showToast('success', 'नई प्रोफाइल फोटो Cloudinary पर सफलतापूर्वक अपलोड हो गई!');

      // Asynchronously attempt non-fatal deletion of previous old asset if it was on Cloudinary
      if (previousPublicId && previousPublicId !== result.publicId) {
        try {
          const adminToken = localStorage.getItem('ruma_admin_token') || 'adm_Ashok#8899_token';
          fetch('/api/admin/media/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify({ publicId: previousPublicId, urls: previousPicUrl ? [previousPicUrl] : [] })
          }).catch((err) => console.warn('[Cloudinary old photo cleanup non-fatal]', err));
        } catch (_) {}
      }
    } catch (err: any) {
      console.error('[Profile Photo Upload Error]', err);
      showToast('error', `फोटो अपलोड विफल: ${err.message || 'नेटवर्क त्रुटि'}`);
    } finally {
      setIsUploadingPhoto(false);
      setPhotoUploadProgress(0);
      setPhotoUploadStatusText('');
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  // Direct Cloudinary Upload for Banner
  const handleBannerFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'कृपया केवल इमेज फाइल चुनें।');
      return;
    }

    setIsUploadingBanner(true);
    setBannerUploadProgress(10);

    try {
      const result = await uploadToCloudinary(file, {
        folder: 'settings',
        resourceType: 'image',
        onProgress: (pct) => setBannerUploadProgress(pct)
      });

      handleChange('bannerUrl', result.secureUrl);
      handleChange('bannerPublicId', result.publicId);
      handleChange('bannerResourceType', result.resourceType);

      showToast('success', 'कवर बैनर Cloudinary पर अपलोड हो गया!');
    } catch (err: any) {
      showToast('error', `बैनर अपलोड विफल: ${err.message || 'त्रुटि'}`);
    } finally {
      setIsUploadingBanner(false);
      setBannerUploadProgress(0);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  // Save Settings to Firestore & update Memory/State
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      // Ensure numeric/string casts for counts
      const payload: Partial<SiteSettings> = {
        ...formData,
        postsCount: Number(formData.postsCount) || 0,
        // followersCount can be string like "303K" or number
        followersCount: formData.followersCount ?? '303K',
        viewsCount: String(formData.viewsCount || '1.2M').trim(),
        updatedAt: new Date().toISOString()
      };

      const updated = await updateAdminSettings(payload);
      setFormData({ ...updated });
      onSettingsUpdated(updated);
      showToast('success', 'Settings updated successfully! वेबसाइट पर सभी बदलाव तुरंत लाइव हो गए हैं।');
    } catch (err: any) {
      console.error('[Save Settings Error]', err);
      showToast('error', `Failed to update settings: ${err.message || 'नेटवर्क त्रुटि'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...settings });
    showToast('success', 'सभी अनसेव्ड बदलाव रीसेट कर दिए गए हैं।');
  };

  const copyAdminUrl = () => {
    navigator.clipboard.writeText(getSecretUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendTestNotification = async () => {
    setTestNotifLoading(true);
    try {
      const res = await triggerPushNotificationToSubscribers({
        title: '🔔 VIP Alert Test Notification',
        body: 'Ruma Cute Girl VIP Hub से टेस्ट पुश नोटिफिकेशन सफलता पूर्वक भेजा गया!',
        url: window.location.origin
      });
      if (res.success) {
        showToast('success', `टेस्ट नोटिफिकेशन भेजा गया! (पहुंचा: ${res.sentCount} डिवाइस)`);
      } else {
        showToast('error', `नोटिफिकेशन विफल: ${res.error || 'अज्ञात त्रुटि'}`);
      }
    } catch (err: any) {
      showToast('error', `नोटिफिकेशन त्रुटि: ${err.message}`);
    } finally {
      setTestNotifLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={photoInputRef}
        onChange={handlePhotoFileSelect}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />
      <input
        type="file"
        ref={bannerInputRef}
        onChange={handleBannerFileSelect}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

      {/* Toast Alert */}
      {saveStatus.type && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg border transition-all animate-in slide-in-from-top-3 ${
            saveStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {saveStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-black">{saveStatus.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveStatus({ type: null, message: '' })}
            className="text-xs font-bold underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-purple-950">
                Profile & Website Settings (प्रोफ़ाइल व वेबसाइट सेटिंग्स)
              </h2>
              <p className="text-xs text-purple-900/70 font-medium">
                बिना कोड बदले वेबसाइट की पब्लिक प्रोफ़ाइल, UPI, WhatsApp, सोशल लिंक्स और स्टैट्स तुरंत अपडेट करें।
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              isPreviewOpen
                ? 'bg-purple-950 text-white shadow-md'
                : 'bg-purple-100 hover:bg-purple-200 text-purple-950'
            }`}
          >
            {isPreviewOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-purple-700" />}
            <span>{isPreviewOpen ? 'Hide Preview' : 'Live Preview'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cancel / Reset</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="glow-pink-btn px-5 py-2.5 rounded-2xl text-xs font-black text-white shadow-lg shadow-pink-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Saving to Cloud...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Preview Card Drawer / Collapse */}
      {isPreviewOpen && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-pink-50/70 via-purple-50/50 to-white border-2 border-pink-300 shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-pink-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-pink-600" />
              <span className="text-xs font-black text-purple-950 uppercase tracking-wider">
                Live Public Profile Preview (वेबसाइट पर ऐसा दिखेगा)
              </span>
            </div>
            <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-lg">
              Auto-updating Live
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl bg-white border border-purple-100 shadow-sm">
            {/* Avatar Preview */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-500 to-purple-600 shadow-md">
                <img
                  src={formData.profilePicUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'}
                  alt={formData.creatorName || 'Creator'}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
            </div>

            {/* Content Details */}
            <div className="space-y-1.5 text-center md:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h3 className="text-lg font-black text-purple-950 flex items-center gap-1.5">
                  {formData.creatorName || 'Ruma Kumari'}
                  {(formData.isVerified ?? true) && (
                    <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50" />
                  )}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-100 text-pink-700 border border-pink-200">
                  {formData.badgeText || 'VIP Creator'}
                </span>
              </div>

              <p className="text-xs font-mono font-bold text-purple-900/60">
                @{formData.username || 'ruma_cutegirl_official'}
              </p>

              <p className="text-xs text-purple-900/80 font-medium leading-relaxed max-w-xl">
                {formData.bio || 'Pretty mood always 💋 | Fitness, Lifestyle & Exclusive VIP Content'}
              </p>

              {/* Stats Row in Preview */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 text-center">
                  <span className="font-mono font-black text-xs text-purple-950 block">
                    {formData.postsCount ?? 37}
                  </span>
                  <span className="text-[10px] text-purple-900/60 font-bold">VIP Posts</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 text-center">
                  <span className="font-mono font-black text-xs text-purple-950 block">
                    {formData.followersCount ?? '303K'}
                  </span>
                  <span className="text-[10px] text-purple-900/60 font-bold">Followers</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-pink-50 border border-pink-200 text-center">
                  <span className="font-mono font-black text-xs text-pink-700 block flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    {formData.viewsCount ?? '1.2M'}
                  </span>
                  <span className="text-[10px] text-pink-800/70 font-bold">Monthly Views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/80 border border-purple-200 shadow-xs overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-50'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>1. Profile & Bio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('payment')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'payment'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-50'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>2. UPI & Payment</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('whatsapp')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'whatsapp'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-50'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>3. WhatsApp & Social</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('banner')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'banner'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>4. Banner & Announcement</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'security'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-50'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>5. Security & Push</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* SUB-TAB 1: PROFILE SETTINGS */}
      {/* ==================================================================== */}
      {activeSubTab === 'profile' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-200 space-y-6 shadow-md animate-in fade-in">
          
          {/* Profile Photo Uploader with Direct Cloudinary Integration */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-pink-50/80 via-purple-50/50 to-white border-2 border-pink-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full border-2 border-pink-400 overflow-hidden shadow-md bg-purple-100">
                    <img
                      src={formData.profilePicUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'}
                      alt="Profile Pic"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-bold transition-opacity cursor-pointer"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>बदलें</span>
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-black text-purple-950">
                    Profile Photo (Cloudinary Direct Storage)
                  </h4>
                  <p className="text-xs text-purple-900/70 font-medium">
                    नई फोटो सीधे Cloudinary CDN पर अपलोड होती है। 0MB Base64, सुरक्षित व हाई-स्पीड डिलीवरी।
                  </p>
                  {formData.profilePicPublicId && (
                    <span className="inline-block mt-1 font-mono text-[10px] text-purple-900/60 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                      ID: {formData.profilePicPublicId}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                >
                  {isUploadingPhoto ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>अपलोड हो रही है ({photoUploadProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Photo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Upload Progress Bar */}
            {isUploadingPhoto && (
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[11px] font-bold text-pink-700">
                  <span>{photoUploadStatusText || 'Cloudinary Stream Active...'}</span>
                  <span>{photoUploadProgress}%</span>
                </div>
                <div className="w-full bg-pink-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-150"
                    style={{ width: `${photoUploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Core Profile Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">
                Profile Display Name (नाम) *
              </label>
              <input
                type="text"
                value={formData.creatorName || ''}
                onChange={(e) => handleChange('creatorName', e.target.value)}
                placeholder="e.g. Ruma Kumari"
                className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 shadow-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">
                Username / User ID (@हैंडल) *
              </label>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="e.g. ruma_cutegirl_official"
                className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-purple-950 shadow-xs font-bold"
              />
            </div>
          </div>

          {/* Bio & Tagline */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">
                Bio / Profile Description (प्रोफ़ाइल विवरण)
              </label>
              <textarea
                rows={3}
                value={formData.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Write an appealing bio for your profile..."
                className="w-full bg-white border border-purple-200 rounded-2xl p-3 text-xs text-purple-950 shadow-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">
                Tagline (Home Hero Headline)
              </label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="e.g. Unlock my private, uncut HD photos, backstage reels & VIP stories instantly."
                className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 shadow-xs font-medium"
              />
            </div>
          </div>

          {/* Stats: Followers (supports "303K"), Monthly Views (supports "1.2M"), Posts */}
          <div className="p-4 sm:p-5 rounded-3xl bg-purple-50/70 border border-purple-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-pink-600" />
                <span>Live Metrics & Counter Settings (स्टैट्स कॉन्फ़िगरेशन)</span>
              </h4>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg">
                Shows in User Panel
              </span>
            </div>
            <p className="text-[11px] text-purple-900/70 font-medium">
              आप फॉलोअर्स (उदा: <strong>303K</strong>) और मंथली व्यूज (उदा: <strong>1.2M</strong>) मैन्युअल टेक्स्ट या संख्या के रूप में सेट कर सकते हैं।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">
                  Followers Count (फॉलोअर्स)
                </label>
                <input
                  type="text"
                  value={formData.followersCount ?? '303K'}
                  onChange={(e) => handleChange('followersCount', e.target.value)}
                  placeholder="e.g. 303K or 3358"
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-purple-950 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">
                  Monthly Views (मंथली व्यूज)
                </label>
                <input
                  type="text"
                  value={formData.viewsCount ?? '1.2M'}
                  onChange={(e) => handleChange('viewsCount', e.target.value)}
                  placeholder="e.g. 1.2M or 346.0K"
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-pink-700 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">
                  Total Posts Count (कुल पोस्ट)
                </label>
                <input
                  type="number"
                  value={formData.postsCount ?? 37}
                  onChange={(e) => handleChange('postsCount', Number(e.target.value) || 0)}
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-purple-950 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">
                  Following Count (ऑप्शनल)
                </label>
                <input
                  type="text"
                  value={formData.followingCount ?? '12'}
                  onChange={(e) => handleChange('followingCount', e.target.value)}
                  placeholder="e.g. 12"
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-purple-950 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Verification Badge, Category, Location, Website Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-purple-950">Profile Badge Text</label>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-pink-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVerified ?? true}
                    onChange={(e) => handleChange('isVerified', e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500"
                  />
                  <span>Verified Blue Tick</span>
                </label>
              </div>
              <input
                type="text"
                value={formData.badgeText || ''}
                onChange={(e) => handleChange('badgeText', e.target.value)}
                placeholder="e.g. VIP Creator"
                className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2 text-xs text-purple-950 shadow-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">
                Category (कैटेगरी)
              </label>
              <input
                type="text"
                value={formData.category || 'Creator • Fitness & Glamour'}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="e.g. Creator • Fitness & Glamour"
                className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2 text-xs text-purple-950 shadow-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">
                Location (स्थान)
              </label>
              <input
                type="text"
                value={formData.location || 'Mumbai, India'}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g. Mumbai, India"
                className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2 text-xs text-purple-950 shadow-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">
                Public Website / Bio Link (वेबसाइट लिंक)
              </label>
              <input
                type="url"
                value={formData.websiteLink || ''}
                onChange={(e) => handleChange('websiteLink', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2 text-xs text-purple-950 shadow-xs font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className="glow-pink-btn px-6 py-2.5 rounded-2xl text-xs font-black text-white shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 2: PAYMENT & UPI SETTINGS */}
      {/* ==================================================================== */}
      {activeSubTab === 'payment' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-200 space-y-6 shadow-md animate-in fade-in">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <h4 className="font-black text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe Cloud Firestore Payment Configuration</span>
            </h4>
            <p className="text-emerald-900/80">
              यहाँ दिया गया UPI ID और पेमेंट नंबर ग्राहकों के पेमेंट मोडल और QR कोड में तुरंत सक्रिय हो जाएगा। कोई भी क्रेडेंशियल हार्ड-कोड नहीं है।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">
                Bank UPI ID (पेमेंट के लिए मुख्य UPI ID) *
              </label>
              <input
                type="text"
                value={formData.upiId || ''}
                onChange={(e) => handleChange('upiId', e.target.value)}
                placeholder="e.g. 6202292319pnb@ybl or username@okhdfcbank"
                className="w-full bg-white border-2 border-emerald-300 rounded-2xl px-3.5 py-2.5 text-xs text-emerald-800 font-mono font-bold shadow-xs"
              />
              <p className="text-[10px] text-purple-900/70 mt-1">
                ⚠️ वॉलेट आईडी (जैसे <code>.wallet@phonepe</code>) काम नहीं करती। बैंक से जुड़ा UPI ID डालें।
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-purple-950 block mb-1">
                UPI Mobile Number / Payment Number (पेमेंट नंबर)
              </label>
              <input
                type="text"
                value={formData.paymentNumber || ''}
                onChange={(e) => handleChange('paymentNumber', e.target.value)}
                placeholder="e.g. 6202292319 or 9876543210"
                className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 font-mono font-bold shadow-xs"
              />
              <p className="text-[10px] text-purple-900/70 mt-1">
                💡 ग्राहक PhonePe / GPay / Paytm में इस नंबर पर भी सीधा पेमेंट कर सकते हैं।
              </p>
            </div>
          </div>

          {/* Payment Verification Mode */}
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
              चुनें कि ग्राहक का पेमेंट कैसे सत्यापित हो:
            </p>

            <select
              value={formData.paymentVerificationMode || 'manual_approval'}
              onChange={(e) => handleChange('paymentVerificationMode', e.target.value as any)}
              className="w-full bg-white border-2 border-emerald-300 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 font-bold focus:ring-2 focus:ring-emerald-500 shadow-xs"
            >
              <option value="manual_approval">
                🔒 Manual Approval (Recommended: ग्राहक 12-अंक UTR देगा, आपके 'Approve' करने पर ही खुलेगा)
              </option>
              <option value="instant_utr">
                ⚡ Instant 12-Digit UTR (ग्राहक के वैध 12-अंक UTR डालते ही तुरंत अनलॉक होगा)
              </option>
            </select>
          </div>

          {/* VIP Plans Summary & WhatsApp Access Rules on Plans */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Active VIP Plans & WhatsApp Benefits (VIP प्लान्स में WhatsApp सपोर्ट)</span>
              </h4>
              <span className="text-[11px] text-purple-900/70 font-bold">
                Total Plans: {(formData.vipPlans || []).length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(formData.vipPlans || []).map((plan, idx) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-2xl bg-white border border-purple-200 shadow-xs space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-pink-100 text-pink-700">
                        {plan.badge || 'VIP PASS'}
                      </span>
                      <h5 className="font-bold text-xs text-purple-950 mt-1">{plan.title}</h5>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-purple-950">₹{plan.price}</span>
                      <span className="text-[10px] line-through text-gray-400 block">₹{plan.originalPrice}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-[11px]">
                    <span className="text-purple-900/70 font-medium">{plan.durationLabel}</span>
                    <label className="flex items-center gap-1.5 font-bold text-emerald-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={plan.whatsappAccess ?? true}
                        onChange={(e) => {
                          const updatedPlans = [...(formData.vipPlans || [])];
                          updatedPlans[idx] = {
                            ...updatedPlans[idx],
                            whatsappAccess: e.target.checked
                          };
                          handleChange('vipPlans', updatedPlans);
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>WhatsApp Access Enabled</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className="glow-pink-btn px-6 py-2.5 rounded-2xl text-xs font-black text-white shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Payment Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 3: WHATSAPP & SOCIAL SETTINGS */}
      {/* ==================================================================== */}
      {activeSubTab === 'whatsapp' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-200 space-y-6 shadow-md animate-in fade-in">
          
          {/* WhatsApp Access Rules Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-300 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-black text-purple-950">
                  WhatsApp Contact & Privacy Protection (व्हाट्सएप गोपनीयता व एक्सेस नियम)
                </h4>
              </div>
              <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                VIP Access Control
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">
                  Official WhatsApp Number (कंटेंट क्रिएटर व्हाट्सएप नंबर) *
                </label>
                <input
                  type="text"
                  value={formData.supportWhatsApp || ''}
                  onChange={(e) => {
                    handleChange('supportWhatsApp', e.target.value);
                    handleChange('whatsappNumber', e.target.value);
                  }}
                  placeholder="e.g. +63 9465507887 or 91XXXXXXXXXX"
                  className="w-full bg-white border-2 border-emerald-400 rounded-2xl px-3.5 py-2.5 text-xs text-emerald-800 font-mono font-bold shadow-xs"
                />
                <p className="text-[10px] text-purple-900/70 mt-1">
                  💡 देश के कोड के साथ डालें (उदा: +63 9465507887 या +91 9876543210)।
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">
                  WhatsApp Access Gate (किसे दिखेगा व्हाट्सएप नंबर?)
                </label>
                <select
                  value={formData.whatsappAccessMode || 'paid_only'}
                  onChange={(e) => handleChange('whatsappAccessMode', e.target.value as any)}
                  className="w-full bg-white border-2 border-emerald-400 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 font-bold focus:ring-2 focus:ring-emerald-500 shadow-xs"
                >
                  <option value="paid_only">
                    🔒 Paid VIP Members Only (सख्त नियम: केवल पेमेंट स्वीकृत ग्राहकों को ही नंबर दिखेगा)
                  </option>
                  <option value="all">
                    🌐 Open to All Visitors (सार्वजनिक: सभी विजिटर्स को नंबर दिखेगा)
                  </option>
                </select>
                <p className="text-[10px] text-emerald-800 font-medium mt-1">
                  ✅ <strong>अनुशंसित:</strong> Paid Only मोड में अनपेड विजिटर्स को केवल लॉक संदेश दिखेगा। पेमेंट अप्रूव होते ही नंबर हमेशा के लिए अनलॉक रहेगा।
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-[11px] text-purple-950 space-y-1">
              <span className="font-black text-emerald-800 block">🔒 एक्सेस सत्यापन कार्यप्रणाली:</span>
              <ul className="list-disc list-inside space-y-0.5 text-purple-900/80">
                <li>अनपेड या रिजेक्टेड यूजर्स को व्हाट्सएप नंबर बिल्कुल दिखाई नहीं देगा।</li>
                <li>एडमिन द्वारा पेमेंट <strong>Approve</strong> करते ही क्लाउड डेटाबेस (Firestore) में उस नंबर का परमानेंट अनलॉक दर्ज हो जाता है।</li>
                <li>ग्राहक दूसरे डिवाइस या ब्राउज़र से भी लॉगिन करेगा तो उसका व्हाट्सएप एक्सेस हमेशा चालू रहेगा।</li>
              </ul>
            </div>
          </div>

          {/* Other Social & Support Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider">
              Social Media & Other Contact Channels (सोशल मीडिया लिंक्स)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  <span>Instagram Profile URL</span>
                </label>
                <input
                  type="url"
                  value={formData.instagramUrl || ''}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/ruma__cutegirl"
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">
                  Instagram Handle Label
                </label>
                <input
                  type="text"
                  value={formData.instagramHandle || ''}
                  onChange={(e) => handleChange('instagramHandle', e.target.value)}
                  placeholder="e.g. @ruma__cutegirl"
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-purple-600" />
                  <span>VIP Telegram Channel Link</span>
                </label>
                <input
                  type="url"
                  value={formData.supportTelegram || ''}
                  onChange={(e) => handleChange('supportTelegram', e.target.value)}
                  placeholder="https://t.me/rumakumari_vip"
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">
                  Support Email Address
                </label>
                <input
                  type="email"
                  value={formData.supportEmail || ''}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  placeholder="contact.rumakumari@gmail.com"
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1 flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-600" />
                  <span>YouTube Channel Link (ऑप्शनल)</span>
                </label>
                <input
                  type="url"
                  value={formData.youtubeUrl || ''}
                  onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                  placeholder="https://youtube.com/@rumakumari"
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1 flex items-center gap-1.5">
                  <Facebook className="w-3.5 h-3.5 text-blue-600" />
                  <span>Facebook Profile / Page (ऑप्शनल)</span>
                </label>
                <input
                  type="url"
                  value={formData.facebookUrl || ''}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/ruma.official"
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 shadow-xs font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className="glow-pink-btn px-6 py-2.5 rounded-2xl text-xs font-black text-white shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Contact & Social Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 4: BANNER & ANNOUNCEMENTS */}
      {/* ==================================================================== */}
      {activeSubTab === 'banner' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-200 space-y-6 shadow-md animate-in fade-in">
          
          {/* Cover Banner Uploader */}
          <div className="p-5 rounded-3xl bg-purple-50/70 border border-purple-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider">
                  Hero Cover Banner Image (होमपेज का मुख्य बैनर)
                </h4>
                <p className="text-[11px] text-purple-900/70 font-medium">
                  कवर बैनर इमेज सीधे Cloudinary पर स्टोर होती है।
                </p>
              </div>

              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={isUploadingBanner}
                className="px-4 py-2 rounded-2xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isUploadingBanner ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>अपलोड हो रहा है ({bannerUploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Banner</span>
                  </>
                )}
              </button>
            </div>

            <div className="w-full h-36 sm:h-48 rounded-2xl overflow-hidden border border-purple-200 bg-purple-100 shadow-inner relative">
              <img
                src={formData.bannerUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200'}
                alt="Banner Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-bold drop-shadow">Current Banner Preview</span>
              </div>
            </div>
          </div>

          {/* Top Announcement Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-950">Top Announcement Banner (टॉप नोटिस बार)</label>
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-pink-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.announcementEnabled ?? true}
                  onChange={(e) => handleChange('announcementEnabled', e.target.checked)}
                  className="rounded text-pink-600 focus:ring-pink-500"
                />
                <span>Show Announcement Banner</span>
              </label>
            </div>
            <textarea
              rows={2}
              value={formData.announcement || ''}
              onChange={(e) => handleChange('announcement', e.target.value)}
              placeholder="✨ New VIP Backstage Reel is LIVE! Get 50% off this week only with instant UPI scan!"
              className="w-full bg-white border border-purple-200 rounded-2xl p-3 text-xs text-purple-950 shadow-xs font-medium"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className="glow-pink-btn px-6 py-2.5 rounded-2xl text-xs font-black text-white shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Banner & Announcements</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 5: SECURITY & PUSH NOTIFICATIONS */}
      {/* ==================================================================== */}
      {activeSubTab === 'security' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-200 space-y-6 shadow-md animate-in fade-in">
          
          {/* Admin Passcode & Private Link */}
          <div className="p-5 rounded-3xl bg-purple-50/80 border-2 border-purple-200 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-black text-purple-950 uppercase tracking-wider">
                  Admin Passcode & Secret URL (एडमिन पासवर्ड व सुरक्षा)
                </span>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg">
                Protected Cloud
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">
                  Change Admin Passcode (नया एडमिन पासवर्ड)
                </label>
                <input
                  type="text"
                  value={formData.adminPasscode || 'Ashok#8899'}
                  onChange={(e) => handleChange('adminPasscode', e.target.value)}
                  placeholder="Enter new admin passcode"
                  className="w-full bg-white border border-purple-300 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 font-mono font-bold focus:ring-2 focus:ring-pink-500 shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-purple-950 block">
                  Your Private Secret Admin URL (बुकमार्क लिंक)
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[11px] font-mono text-purple-900 truncate bg-white p-2 rounded-xl border border-purple-200 select-all">
                    {getSecretUrl()}
                  </code>
                  <button
                    type="button"
                    onClick={copyAdminUrl}
                    className="px-3 py-2 bg-purple-200/80 hover:bg-purple-300 text-purple-950 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Web Push Notification Settings */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-900/10 via-pink-500/5 to-purple-50/80 border-2 border-pink-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-pink-200/60 pb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-pink-600" />
                <span className="text-xs font-black text-purple-950 uppercase tracking-wider">
                  Web Push Notifications (FCM / ब्राउज़र पुश नोटिफिकेशन)
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-black border border-pink-200">
                <Radio className="w-3 h-3 text-pink-600 animate-pulse" />
                <span>{subscriberCount} Active Subscribers</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-purple-100 shadow-xs">
                <div>
                  <h4 className="text-xs font-bold text-purple-950">Master Push Notifications Toggle</h4>
                  <p className="text-[11px] text-purple-900/70 font-medium">
                    पूरे सिस्टम के लिए वेब पुश नोटिफिकेशन्स चालू या बंद रखें।
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pushNotificationsEnabled ?? true}
                    onChange={(e) => handleChange('pushNotificationsEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-purple-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600" />
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-purple-100 shadow-xs">
                <div>
                  <h4 className="text-xs font-bold text-purple-950">New Post Auto-Notification</h4>
                  <p className="text-[11px] text-purple-900/70 font-medium">
                    जब भी आप नया फोटो या वीडियो पब्लिश करेंगे, सभी सब्सक्राइबर्स को तुरंत अलर्ट जाएगा।
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifyOnNewPost ?? true}
                    onChange={(e) => handleChange('notifyOnNewPost', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-purple-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600" />
                </label>
              </div>

              {/* Test Notification Trigger */}
              <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    <span>Live Notification Delivery Test</span>
                  </h4>
                  <p className="text-[10px] text-purple-900/70">
                    जांचें कि ब्राउज़र पर नोटिफिकेशन सही तरीके से आ रहा है या नहीं।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  disabled={testNotifLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {testNotifLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>भेज रहे हैं...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>🚀 Send Test Notification</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">
                  Custom Web Push VAPID Key (ऑप्शनल)
                </label>
                <input
                  type="text"
                  value={formData.vapidKey || ''}
                  onChange={(e) => handleChange('vapidKey', e.target.value)}
                  placeholder="Firebase Console > Cloud Messaging Web Key Pair"
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2 text-xs font-mono text-purple-950 shadow-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className="glow-pink-btn px-6 py-2.5 rounded-2xl text-xs font-black text-white shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Security Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
