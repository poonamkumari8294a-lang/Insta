import React, { useState } from 'react';
import { SiteSettings, HomepageSectionConfig } from '../types';
import { updateAdminSettings } from '../utils/api';
import { MediaUploadZone } from './MediaUploadZone';
import {
  Layout,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Sparkles,
  Save,
  CheckCircle2,
  Sliders,
  Type,
  Image as ImageIcon,
  Flame,
  Film,
  Package,
  HelpCircle,
  ShieldCheck,
  Check
} from 'lucide-react';

interface HomepageControlTabProps {
  settings: SiteSettings;
  onSettingsUpdated: (newSettings: SiteSettings) => void;
}

export const HomepageControlTab: React.FC<HomepageControlTabProps> = ({
  settings,
  onSettingsUpdated,
}) => {
  const defaultCfg: HomepageSectionConfig = {
    hero: {
      enabled: true,
      title: settings.creatorName || 'Ruma Kumari',
      description: settings.tagline || 'Unlock my private, uncut HD photos, backstage reels & VIP stories instantly.',
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
    sectionOrder: ['hero', 'featured', 'vipPacks', 'latestVideos', 'latestPhotos', 'freeSamples', 'howItWorks', 'faq']
  };

  const [cfg, setCfg] = useState<HomepageSectionConfig>(settings.homepageConfig || defaultCfg);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const sectionMeta: Record<string, { name: string; desc: string; icon: any }> = {
    hero: { name: 'Hero Header & Profile Card', desc: 'Main avatar, title, bio, stats, and primary action CTA', icon: Layout },
    featured: { name: 'Featured VIP Releases', desc: 'Top trending exclusive photo & video items', icon: Flame },
    vipPacks: { name: 'VIP Combo Pricing Packs', desc: 'Discounted all-access bundles and membership deals', icon: Package },
    latestVideos: { name: 'Latest Video Reels', desc: 'Recent video drops with play previews', icon: Film },
    latestPhotos: { name: 'Latest HD Photo Drops', desc: 'Grid of newly published high-res photos', icon: ImageIcon },
    freeSamples: { name: 'Free Previews Section', desc: 'Zero-cost sample lifestyle & workout media', icon: Sparkles },
    howItWorks: { name: 'How It Works (3-Step Guide)', desc: 'Explains instant UPI QR payment flow', icon: Sliders },
    faq: { name: 'Frequently Asked Questions', desc: 'Collapsible accordion with answers to common doubts', icon: HelpCircle }
  };

  const handleToggle = (secKey: string) => {
    setCfg((prev) => {
      const current = (prev as any)[secKey];
      return {
        ...prev,
        [secKey]: {
          ...current,
          enabled: !current?.enabled
        }
      };
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const order = [...cfg.sectionOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= order.length) return;
    const temp = order[index];
    order[index] = order[targetIdx];
    order[targetIdx] = temp;
    setCfg({ ...cfg, sectionOrder: order });
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await updateAdminSettings({
        homepageConfig: cfg,
        creatorName: cfg.hero?.title || settings.creatorName,
        tagline: cfg.hero?.description || settings.tagline
      });
      onSettingsUpdated(res);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save homepage settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header with Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-100 text-pink-600 border border-pink-200">
              <Layout className="w-5 h-5" />
            </span>
            <h2 className="font-display font-black text-xl text-purple-950">
              Homepage Layout & Sections Control
            </h2>
          </div>
          <p className="text-xs text-purple-900/70 mt-1 font-medium">
            Customize hero texts, reorder sections, enable/disable any module, and adjust content limits with no-code ease.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="glow-pink-btn px-6 py-3 rounded-2xl text-xs font-black text-white flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 active:scale-95 transition-transform"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Published to Live Site!</span>
            </>
          ) : saving ? (
            <span>Saving Changes...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Apply Homepage</span>
            </>
          )}
        </button>
      </div>

      {/* 1. SECTION REORDERING & VISIBILITY TOGGLES */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-base text-purple-950 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-pink-600" />
              Section Visibility & Order (Drag / Shift)
            </h3>
            <p className="text-xs text-purple-900/70 font-medium">
              Change the order in which sections appear to visitors on the homepage.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {cfg.sectionOrder.map((secKey, idx) => {
            const meta = sectionMeta[secKey] || { name: secKey, desc: '', icon: Layout };
            const Icon = meta.icon;
            const isEnabled = (cfg as any)[secKey]?.enabled ?? true;

            return (
              <div
                key={secKey}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isEnabled
                    ? 'bg-white/90 border-purple-100 shadow-xs'
                    : 'bg-zinc-100/80 border-zinc-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 rounded-lg bg-purple-50 hover:bg-purple-100 disabled:opacity-30 text-purple-900"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === cfg.sectionOrder.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 rounded-lg bg-purple-50 hover:bg-purple-100 disabled:opacity-30 text-purple-900"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center font-mono text-xs font-black">
                    {idx + 1}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-purple-950 flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-pink-600" />
                      {meta.name}
                    </h4>
                    <p className="text-[11px] text-purple-900/60 font-medium">
                      {meta.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggle(secKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                      isEnabled
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200'
                        : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'
                    }`}
                  >
                    {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{isEnabled ? 'Enabled' : 'Hidden'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. DETAILED SECTION CUSTOMIZERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Hero Section Config */}
        <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
            <Layout className="w-4 h-4 text-pink-600" />
            <h3 className="font-display font-black text-sm text-purple-950">Hero Header Customization</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-purple-950 block mb-1">Hero Heading / Name</label>
              <input
                type="text"
                value={cfg.hero.title || ''}
                onChange={(e) => setCfg({ ...cfg, hero: { ...cfg.hero, title: e.target.value } })}
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-purple-950 block mb-1">Hero Subtitle / Hook</label>
              <textarea
                rows={2}
                value={cfg.hero.description || ''}
                onChange={(e) => setCfg({ ...cfg, hero: { ...cfg.hero, description: e.target.value } })}
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-purple-950 block mb-1">CTA Button Label</label>
              <input
                type="text"
                value={cfg.hero.ctaText || 'View Premium Feed'}
                onChange={(e) => setCfg({ ...cfg, hero: { ...cfg.hero, ctaText: e.target.value } })}
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-medium"
              />
            </div>

            {/* Custom Hero Cover Image Upload */}
            <div className="pt-1">
              <MediaUploadZone
                label="Custom Hero Cover Photo (गैलरी से हीरो फोटो बदलें - ऐच्छिक)"
                value={cfg.hero.customCoverUrl || ''}
                onChange={(url) => setCfg({ ...cfg, hero: { ...cfg.hero, customCoverUrl: url } })}
                accept="image"
                aspectRatio="banner"
                helperText="Optional custom hero background. If left empty, default creator banner is used."
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-950">
                <input
                  type="checkbox"
                  checked={cfg.profile.showStats}
                  onChange={(e) => setCfg({ ...cfg, profile: { ...cfg.profile, showStats: e.target.checked } })}
                  className="rounded text-pink-600"
                />
                <span>Show Real-time Stats</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-950">
                <input
                  type="checkbox"
                  checked={cfg.profile.showBadge}
                  onChange={(e) => setCfg({ ...cfg, profile: { ...cfg.profile, showBadge: e.target.checked } })}
                  className="rounded text-pink-600"
                />
                <span>Show Verified Badge</span>
              </label>
            </div>
          </div>
        </div>

        {/* Featured Section Config */}
        <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
            <Flame className="w-4 h-4 text-pink-600" />
            <h3 className="font-display font-black text-sm text-purple-950">Featured VIP Section</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-purple-950 block mb-1">Section Title</label>
              <input
                type="text"
                value={cfg.featured.title}
                onChange={(e) => setCfg({ ...cfg, featured: { ...cfg.featured, title: e.target.value } })}
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-purple-950 block mb-1">Section Subtitle</label>
              <input
                type="text"
                value={cfg.featured.subtitle}
                onChange={(e) => setCfg({ ...cfg, featured: { ...cfg.featured, subtitle: e.target.value } })}
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-purple-950 block mb-1">Display Limit (Max cards on home)</label>
              <input
                type="number"
                min={1}
                max={24}
                value={cfg.featured.limit}
                onChange={(e) => setCfg({ ...cfg, featured: { ...cfg.featured, limit: Number(e.target.value) || 8 } })}
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-bold"
              />
            </div>
          </div>
        </div>

        {/* VIP Packs Config */}
        <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
            <Package className="w-4 h-4 text-pink-600" />
            <h3 className="font-display font-black text-sm text-purple-950">VIP Combo Pricing Section</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-purple-950 block mb-1">Section Title</label>
              <input
                type="text"
                value={cfg.vipPacks.title}
                onChange={(e) => setCfg({ ...cfg, vipPacks: { ...cfg.vipPacks, title: e.target.value } })}
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-purple-950 block mb-1">Section Subtitle</label>
              <input
                type="text"
                value={cfg.vipPacks.subtitle}
                onChange={(e) => setCfg({ ...cfg, vipPacks: { ...cfg.vipPacks, subtitle: e.target.value } })}
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Media Grids Config */}
        <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
            <Film className="w-4 h-4 text-pink-600" />
            <h3 className="font-display font-black text-sm text-purple-950">Videos & Photos Feed Rows</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-purple-950 block mb-1">Latest Videos Row Title</label>
              <input
                type="text"
                value={cfg.latestVideos.title}
                onChange={(e) => setCfg({ ...cfg, latestVideos: { ...cfg.latestVideos, title: e.target.value } })}
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-purple-950 block mb-1">Latest Photos Row Title</label>
              <input
                type="text"
                value={cfg.latestPhotos.title}
                onChange={(e) => setCfg({ ...cfg, latestPhotos: { ...cfg.latestPhotos, title: e.target.value } })}
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Story Highlights & Teasers Config */}
        <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
            <Sparkles className="w-4 h-4 text-pink-600" />
            <h3 className="font-display font-black text-sm text-purple-950">Story Highlights & Teasers Row</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-purple-950 block mb-1">Row Title on Homepage</label>
              <input
                type="text"
                value={cfg.storyHighlights?.title || 'Story Highlights & Teasers'}
                onChange={(e) =>
                  setCfg({
                    ...cfg,
                    storyHighlights: {
                      ...cfg.storyHighlights,
                      title: e.target.value
                    }
                  })
                }
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-medium"
              />
            </div>

            <div className="p-3 rounded-2xl bg-pink-50/70 border border-pink-200/60 text-purple-950 space-y-1.5">
              <p className="font-bold text-[11px] text-pink-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Active Highlight Circles: {settings.storyHighlights?.length || 0}</span>
              </p>
              <p className="text-[11px] text-purple-900/70 leading-relaxed font-medium">
                To upload new story slides, teaser videos, change circular covers, or reorder circles, visit the <strong>"Story Highlights"</strong> tab in the admin navigation bar!
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
