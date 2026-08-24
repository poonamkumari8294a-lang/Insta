import React, { useState } from 'react';
import { SiteSettings, StoryHighlight } from '../types';
import { updateAdminSettings } from '../utils/api';
import { MediaUploadZone } from './MediaUploadZone';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  MoveLeft,
  MoveRight,
  Play,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Film,
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Layers,
  Sparkle
} from 'lucide-react';

interface StoryHighlightsManagerProps {
  settings: SiteSettings;
  onSettingsUpdated: (updated: SiteSettings) => void;
}

export const StoryHighlightsManager: React.FC<StoryHighlightsManagerProps> = ({
  settings,
  onSettingsUpdated
}) => {
  const [highlights, setHighlights] = useState<StoryHighlight[]>(
    settings.storyHighlights || []
  );
  const [sectionEnabled, setSectionEnabled] = useState<boolean>(
    settings.homepageConfig?.storyHighlights?.enabled ?? true
  );
  const [sectionTitle, setSectionTitle] = useState<string>(
    settings.homepageConfig?.storyHighlights?.title || 'Story Highlights & Teasers'
  );

  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(
    highlights.length > 0 ? highlights[0].id : null
  );

  // Modals / Editors
  const [showAddHighlightModal, setShowAddHighlightModal] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<StoryHighlight | null>(null);
  const [highlightForm, setHighlightForm] = useState<{ title: string; coverImage: string }>({
    title: '',
    coverImage: ''
  });

  // Story slide item modal
  const [showAddSlideModal, setShowAddSlideModal] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [slideForm, setSlideForm] = useState<{ url: string; type: 'image' | 'video'; caption: string }>({
    url: '',
    type: 'image',
    caption: ''
  });

  // Live Story Test Player
  const [previewingHighlight, setPreviewingHighlight] = useState<StoryHighlight | null>(null);
  const [previewSlideIdx, setPreviewSlideIdx] = useState<number>(0);
  const [previewMuted, setPreviewMuted] = useState(true);

  // Saving state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeHighlight = highlights.find(h => h.id === selectedHighlightId) || highlights[0] || null;

  // Save changes to backend
  const handleSaveAll = async (
    customHighlights = highlights,
    customEnabled = sectionEnabled,
    customTitle = sectionTitle
  ) => {
    setSaving(true);
    setSaveSuccess(false);
    
    const updatedHomepage = {
      ...(settings.homepageConfig || {}),
      storyHighlights: {
        enabled: customEnabled,
        title: customTitle
      }
    };

    const optimisticSettings: SiteSettings = {
      ...settings,
      storyHighlights: customHighlights,
      homepageConfig: updatedHomepage as any
    };

    // Instant local and parent state update
    onSettingsUpdated(optimisticSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    try {
      await updateAdminSettings({
        storyHighlights: customHighlights,
        homepageConfig: updatedHomepage as any
      });
    } catch (err: any) {
      console.warn('Background story highlight save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Reorder highlights
  const handleMoveHighlight = (index: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= highlights.length) return;
    const clone = [...highlights];
    const item = clone.splice(index, 1)[0];
    clone.splice(newIdx, 0, item);
    setHighlights(clone);
    handleSaveAll(clone);
  };

  // Delete highlight
  const handleDeleteHighlight = (id: string, title: string) => {
    const clone = highlights.filter(h => h.id !== id);
    setHighlights(clone);
    if (selectedHighlightId === id) {
      setSelectedHighlightId(clone.length > 0 ? clone[0].id : null);
    }
    handleSaveAll(clone);
  };

  // Open add/edit highlight
  const handleOpenHighlightForm = (hl?: StoryHighlight) => {
    if (hl) {
      setEditingHighlight(hl);
      setHighlightForm({
        title: hl.title,
        coverImage: hl.coverImage
      });
    } else {
      setEditingHighlight(null);
      setHighlightForm({
        title: '🌸 New Highlight',
        coverImage: settings.profilePicUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=max&q=80'
      });
    }
    setShowAddHighlightModal(true);
  };

  const handleSaveHighlightForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!highlightForm.title || !highlightForm.coverImage) {
      alert('Title and Cover Image are required!');
      return;
    }

    let updatedHighlights: StoryHighlight[];
    if (editingHighlight) {
      updatedHighlights = highlights.map(h =>
        h.id === editingHighlight.id
          ? { ...h, title: highlightForm.title, coverImage: highlightForm.coverImage }
          : h
      );
    } else {
      const newHl: StoryHighlight = {
        id: `highlight-${Date.now()}`,
        title: highlightForm.title,
        coverImage: highlightForm.coverImage,
        items: [
          {
            id: `story-${Date.now()}-1`,
            url: highlightForm.coverImage,
            type: 'image',
            caption: 'Exclusive highlight sneak peek ✨'
          }
        ]
      };
      updatedHighlights = [...highlights, newHl];
      setSelectedHighlightId(newHl.id);
    }

    setHighlights(updatedHighlights);
    setShowAddHighlightModal(false);
    handleSaveAll(updatedHighlights);
  };

  // Add / Edit Slide inside active highlight
  const handleOpenSlideForm = (slide?: { url: string; type: 'image' | 'video'; caption?: string }, index?: number) => {
    if (slide !== undefined && index !== undefined) {
      setEditingSlideIndex(index);
      setSlideForm({
        url: slide.url,
        type: slide.type,
        caption: slide.caption || ''
      });
    } else {
      setEditingSlideIndex(null);
      setSlideForm({
        url: '',
        type: 'image',
        caption: ''
      });
    }
    setShowAddSlideModal(true);
  };

  const handleSaveSlideForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHighlight) return;
    if (!slideForm.url) {
      alert('Please upload or enter a media image/video URL');
      return;
    }

    const currentItems = [...activeHighlight.items];
    if (editingSlideIndex !== null) {
      currentItems[editingSlideIndex] = {
        ...currentItems[editingSlideIndex],
        url: slideForm.url,
        type: slideForm.type,
        caption: slideForm.caption
      };
    } else {
      currentItems.push({
        id: `story-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        url: slideForm.url,
        type: slideForm.type,
        caption: slideForm.caption
      });
    }

    const updatedHighlights = highlights.map(h =>
      h.id === activeHighlight.id ? { ...h, items: currentItems } : h
    );

    setHighlights(updatedHighlights);
    setShowAddSlideModal(false);
    handleSaveAll(updatedHighlights);
  };

  const handleDeleteSlide = (index: number) => {
    if (!activeHighlight) return;
    if (activeHighlight.items.length <= 1) {
      return;
    }

    const currentItems = [...activeHighlight.items];
    currentItems.splice(index, 1);

    const updatedHighlights = highlights.map(h =>
      h.id === activeHighlight.id ? { ...h, items: currentItems } : h
    );

    setHighlights(updatedHighlights);
    handleSaveAll(updatedHighlights);
  };

  const handleMoveSlide = (index: number, direction: 'left' | 'right') => {
    if (!activeHighlight) return;
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= activeHighlight.items.length) return;

    const currentItems = [...activeHighlight.items];
    const item = currentItems.splice(index, 1)[0];
    currentItems.splice(newIdx, 0, item);

    const updatedHighlights = highlights.map(h =>
      h.id === activeHighlight.id ? { ...h, items: currentItems } : h
    );

    setHighlights(updatedHighlights);
    handleSaveAll(updatedHighlights);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & HOMEPAGE VISIBILITY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-100 text-pink-600 border border-pink-200">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="font-display font-black text-xl text-purple-950">
              Story Highlights & Teasers Manager (कहानियाँ व टीज़र)
            </h2>
          </div>
          <p className="text-xs text-purple-900/70 mt-1 font-medium">
            Manage Instagram-style circular story highlights on your homepage. Upload reels, teasers, and photos directly from your gallery!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const newStatus = !sectionEnabled;
              setSectionEnabled(newStatus);
              handleSaveAll(highlights, newStatus, sectionTitle);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-sm ${
              sectionEnabled
                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200'
                : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'
            }`}
          >
            {sectionEnabled ? <Eye className="w-4 h-4 text-emerald-700" /> : <EyeOff className="w-4 h-4 text-zinc-600" />}
            <span>{sectionEnabled ? 'Section Enabled on Home' : 'Section Hidden on Home'}</span>
          </button>

          <button
            onClick={() => handleSaveAll()}
            disabled={saving}
            className="glow-pink-btn px-6 py-2.5 rounded-2xl text-xs font-black text-white flex items-center gap-2 shadow-lg shadow-pink-500/25 active:scale-95 transition-transform"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Saved Live!</span>
              </>
            ) : saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Highlights</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. SECTION CONFIG ROW */}
      <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-purple-950 block mb-1">
              Homepage Row Section Title
            </label>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              onBlur={() => handleSaveAll(highlights, sectionEnabled, sectionTitle)}
              placeholder="e.g. Story Highlights & Teasers"
              className="w-full bg-white border border-purple-200 rounded-2xl px-4 py-2.5 text-xs text-purple-950 font-bold shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center pt-2 sm:pt-4">
            <button
              onClick={() => handleOpenHighlightForm()}
              className="glow-pink-btn px-4 py-2.5 rounded-2xl text-xs font-black text-white flex items-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Highlight Circle (+ नया हाइलाइट)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. HIGHLIGHTS LIST CAROUSEL (Instagram Style Circles) */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-sm text-purple-950 flex items-center gap-2">
            <Layers className="w-4 h-4 text-pink-600" />
            Active Story Highlights ({highlights.length})
          </h3>
          <span className="text-[11px] text-purple-900/60 font-medium">
            Select a circle below to edit slides, photos, or teaser videos
          </span>
        </div>

        {highlights.length === 0 ? (
          <div className="p-8 text-center bg-purple-50/60 rounded-3xl border border-dashed border-purple-200 space-y-3">
            <Sparkles className="w-8 h-8 text-pink-500 mx-auto opacity-70" />
            <p className="text-xs font-bold text-purple-950">No story highlights added yet</p>
            <p className="text-[11px] text-purple-900/60">
              Create your first highlight ring (e.g. 🌸 Ruma Diaries, 🔥 VIP Teasers, 💪 Workout) to engage visitors.
            </p>
            <button
              onClick={() => handleOpenHighlightForm()}
              className="glow-pink-btn px-5 py-2.5 rounded-2xl text-xs font-black text-white inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Story Highlight</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {highlights.map((hl, idx) => {
              const isSelected = selectedHighlightId === hl.id;
              return (
                <div
                  key={hl.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center relative group ${
                    isSelected
                      ? 'bg-pink-500/10 border-pink-500 shadow-md ring-2 ring-pink-500/30'
                      : 'bg-white/80 hover:bg-white border-purple-100 hover:border-purple-300 shadow-xs'
                  }`}
                >
                  {/* Reorder Buttons on hover */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveHighlight(idx, 'left')}
                      className="p-1 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-900 disabled:opacity-20 text-[10px]"
                      title="Move Left"
                    >
                      <MoveLeft className="w-2.5 h-2.5" />
                    </button>
                    <button
                      disabled={idx === highlights.length - 1}
                      onClick={() => handleMoveHighlight(idx, 'right')}
                      className="p-1 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-900 disabled:opacity-20 text-[10px]"
                      title="Move Right"
                    >
                      <MoveRight className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Edit/Delete Actions */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      onClick={() => handleOpenHighlightForm(hl)}
                      className="p-1 rounded-md bg-purple-100 hover:bg-pink-100 text-purple-900 hover:text-pink-700"
                      title="Edit Highlight"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteHighlight(hl.id, hl.title)}
                      className="p-1 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-700"
                      title="Delete Highlight"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Circular Avatar Ring */}
                  <button
                    onClick={() => setSelectedHighlightId(hl.id)}
                    className="mt-5 focus:outline-none flex flex-col items-center gap-1.5"
                  >
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-md">
                      <div className="w-full h-full rounded-full p-[2px] bg-white overflow-hidden">
                        <img
                          src={hl.coverImage}
                          alt={hl.title}
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    <span className="text-xs font-black text-purple-950 truncate max-w-[120px] block">
                      {hl.title}
                    </span>

                    <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                      {hl.items.length} {hl.items.length === 1 ? 'Slide' : 'Slides'}
                    </span>
                  </button>

                  {/* Preview Player Trigger */}
                  <button
                    onClick={() => {
                      setPreviewingHighlight(hl);
                      setPreviewSlideIdx(0);
                    }}
                    className="w-full mt-1 py-1 rounded-xl bg-purple-100 hover:bg-pink-600 hover:text-white text-purple-950 text-[10px] font-black flex items-center justify-center gap-1 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test Play</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. ACTIVE HIGHLIGHT SLIDES & CONTENT MANAGER */}
      {activeHighlight && (
        <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shrink-0 shadow-sm">
                <img
                  src={activeHighlight.coverImage}
                  alt={activeHighlight.title}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-purple-950 flex items-center gap-2">
                  <span>Managing Slides for:</span>
                  <span className="text-pink-600">{activeHighlight.title}</span>
                </h3>
                <p className="text-xs text-purple-900/70 font-medium">
                  {activeHighlight.items.length} total slides/stories inside this highlight ring
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPreviewingHighlight(activeHighlight);
                  setPreviewSlideIdx(0);
                }}
                className="px-4 py-2.5 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Play className="w-4 h-4 fill-pink-600 text-pink-600" />
                <span>Test Live Player</span>
              </button>

              <button
                onClick={() => handleOpenSlideForm()}
                className="glow-pink-btn px-4 py-2.5 rounded-2xl text-xs font-black text-white flex items-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
                <span>Add Story Slide (+ नई स्लाइड)</span>
              </button>
            </div>
          </div>

          {/* Slides Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeHighlight.items.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="rounded-2xl border border-purple-100 bg-white/90 p-3 space-y-2 shadow-xs hover:shadow-md transition-shadow relative group"
              >
                {/* Order indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md">
                    Slide #{idx + 1}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveSlide(idx, 'left')}
                      className="p-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-900 disabled:opacity-20"
                      title="Move Earlier"
                    >
                      <MoveLeft className="w-3 h-3" />
                    </button>
                    <button
                      disabled={idx === activeHighlight.items.length - 1}
                      onClick={() => handleMoveSlide(idx, 'right')}
                      className="p-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-900 disabled:opacity-20"
                      title="Move Later"
                    >
                      <MoveRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleOpenSlideForm(slide, idx)}
                      className="p-1 rounded bg-purple-50 hover:bg-pink-100 text-purple-900 hover:text-pink-700"
                      title="Edit Slide"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(idx)}
                      className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Media Preview Box */}
                <div className="w-full aspect-[9/14] bg-zinc-900 rounded-xl overflow-hidden relative shadow-inner">
                  {slide.type === 'video' ? (
                    <video
                      src={slide.url}
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={slide.url}
                      alt={slide.caption || 'Story preview'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase flex items-center gap-1">
                    {slide.type === 'video' ? <Film className="w-2.5 h-2.5 text-pink-400" /> : <ImageIcon className="w-2.5 h-2.5 text-pink-400" />}
                    <span>{slide.type}</span>
                  </div>

                  {/* Caption Overlay */}
                  {slide.caption && (
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <p className="text-white text-[11px] font-medium leading-tight line-clamp-2">
                        {slide.caption}
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-purple-900/80 truncate font-medium">
                  {slide.caption || <span className="italic text-purple-900/40">No caption</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. MODAL: ADD / EDIT HIGHLIGHT CIRCLE */}
      {showAddHighlightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 space-y-5">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="font-display font-black text-lg text-purple-950 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-600" />
                <span>{editingHighlight ? 'Edit Highlight Circle' : 'Add New Highlight Ring'}</span>
              </h3>
              <button
                onClick={() => setShowAddHighlightModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHighlightForm} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">
                  Highlight Title (e.g. 🌸 Ruma Diaries, back look, link 🔗, 🥵 special)
                </label>
                <input
                  type="text"
                  required
                  value={highlightForm.title}
                  onChange={(e) => setHighlightForm({ ...highlightForm, title: e.target.value })}
                  placeholder="e.g. 🌸 Exclusive Diaries"
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 font-bold shadow-xs"
                />
              </div>

              {/* Cover Photo Upload Zone */}
              <div>
                <MediaUploadZone
                  label="Highlight Circle Cover Photo (गैलरी से कवर फोटो चुनें)"
                  value={highlightForm.coverImage}
                  onChange={(url) => setHighlightForm({ ...highlightForm, coverImage: url })}
                  accept="image"
                  aspectRatio="square"
                  required
                  helperText="Choose a photo from your gallery. It appears inside the circular story ring on your homepage."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setShowAddHighlightModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-pink-btn px-6 py-2.5 rounded-2xl text-xs font-black text-white shadow-md shadow-pink-500/25"
                >
                  {editingHighlight ? 'Save Highlight' : 'Create Highlight Ring'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: ADD / EDIT STORY SLIDE (PHOTO OR VIDEO) */}
      {showAddSlideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 space-y-5">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="font-display font-black text-lg text-purple-950 flex items-center gap-2">
                <Film className="w-5 h-5 text-pink-600" />
                <span>{editingSlideIndex !== null ? 'Edit Story Slide' : 'Add Story Slide / Teaser'}</span>
              </h3>
              <button
                onClick={() => setShowAddSlideModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlideForm} className="space-y-4">
              {/* Media Type Selector */}
              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">Slide Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSlideForm({ ...slideForm, type: 'image' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      slideForm.type === 'image'
                        ? 'bg-pink-100 border-pink-500 text-pink-800 shadow-xs'
                        : 'bg-white border-purple-200 text-purple-950'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Photo Slide (फोटो)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSlideForm({ ...slideForm, type: 'video' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      slideForm.type === 'video'
                        ? 'bg-pink-100 border-pink-500 text-pink-800 shadow-xs'
                        : 'bg-white border-purple-200 text-purple-950'
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    <span>Video Clip / Teaser (वीडियो)</span>
                  </button>
                </div>
              </div>

              {/* Media File Upload Zone */}
              <div>
                <MediaUploadZone
                  label={
                    slideForm.type === 'video'
                      ? 'Story Teaser Video File (गैलरी से वीडियो चुनें)'
                      : 'Story Slide Photo (गैलरी से फोटो चुनें)'
                  }
                  value={slideForm.url}
                  onChange={(url) => setSlideForm({ ...slideForm, url })}
                  accept={slideForm.type === 'video' ? 'video' : 'image'}
                  aspectRatio="video"
                  required
                  helperText={
                    slideForm.type === 'video'
                      ? 'Select video teaser clip directly from phone/desktop gallery.'
                      : 'Select high quality story photo from gallery.'
                  }
                />
              </div>

              {/* Caption */}
              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">
                  Story Caption / Text Overlay (ऐच्छिक कैप्शन)
                </label>
                <input
                  type="text"
                  value={slideForm.caption}
                  onChange={(e) => setSlideForm({ ...slideForm, caption: e.target.value })}
                  placeholder="e.g. Morning vibes ✨ check out latest VIP post!"
                  className="w-full bg-white border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 font-medium shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setShowAddSlideModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-pink-btn px-6 py-2.5 rounded-2xl text-xs font-black text-white shadow-md shadow-pink-500/25"
                >
                  {editingSlideIndex !== null ? 'Update Slide' : 'Add Slide to Highlight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. LIVE INTERACTIVE STORY PREVIEW MODAL */}
      {previewingHighlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm sm:max-w-md bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col aspect-[9/16] max-h-[85vh]">
            
            {/* Story Progress Bars */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
              {previewingHighlight.items.map((it, idx) => (
                <div
                  key={it.id || idx}
                  className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className={`h-full bg-white transition-all ${
                      idx < previewSlideIdx
                        ? 'w-full'
                        : idx === previewSlideIdx
                        ? 'w-full animate-pulse'
                        : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Header info */}
            <div className="absolute top-6 inset-x-3 z-30 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-pink-400 overflow-hidden bg-white/20">
                  <img
                    src={previewingHighlight.coverImage}
                    alt={previewingHighlight.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs font-black block leading-tight">
                    {previewingHighlight.title}
                  </span>
                  <span className="text-[10px] opacity-75">
                    Slide {previewSlideIdx + 1} of {previewingHighlight.items.length}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMuted(!previewMuted)}
                  className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
                >
                  {previewMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setPreviewingHighlight(null)}
                  className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media Content */}
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              {(() => {
                const currentSlide = previewingHighlight.items[previewSlideIdx] || previewingHighlight.items[0];
                if (!currentSlide) return null;

                if (currentSlide.type === 'video') {
                  return (
                    <video
                      key={currentSlide.url}
                      src={currentSlide.url}
                      autoPlay
                      playsInline
                      muted={previewMuted}
                      className="w-full h-full object-cover"
                    />
                  );
                }

                return (
                  <img
                    key={currentSlide.url}
                    src={currentSlide.url}
                    alt={currentSlide.caption || 'Slide'}
                    className="w-full h-full object-cover"
                  />
                );
              })()}

              {/* Navigation Tap Zones */}
              <button
                onClick={() => {
                  if (previewSlideIdx > 0) {
                    setPreviewSlideIdx(previewSlideIdx - 1);
                  }
                }}
                className="absolute left-0 inset-y-0 w-1/3 z-20 opacity-0 cursor-pointer"
                title="Previous Slide"
              />
              <button
                onClick={() => {
                  if (previewSlideIdx < previewingHighlight.items.length - 1) {
                    setPreviewSlideIdx(previewSlideIdx + 1);
                  } else {
                    setPreviewingHighlight(null);
                  }
                }}
                className="absolute right-0 inset-y-0 w-1/3 z-20 opacity-0 cursor-pointer"
                title="Next Slide"
              />

              {/* Caption Overlay */}
              {previewingHighlight.items[previewSlideIdx]?.caption && (
                <div className="absolute bottom-6 inset-x-4 z-30 p-3 rounded-2xl bg-black/60 backdrop-blur-md text-white text-center">
                  <p className="text-xs font-semibold">
                    {previewingHighlight.items[previewSlideIdx].caption}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Nav arrows */}
            <div className="absolute bottom-2 inset-x-3 z-30 flex items-center justify-between text-white pointer-events-none">
              <button
                disabled={previewSlideIdx === 0}
                onClick={() => setPreviewSlideIdx(prev => Math.max(0, prev - 1))}
                className="p-2 rounded-full bg-black/40 pointer-events-auto disabled:opacity-20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (previewSlideIdx < previewingHighlight.items.length - 1) {
                    setPreviewSlideIdx(prev => prev + 1);
                  } else {
                    setPreviewingHighlight(null);
                  }
                }}
                className="p-2 rounded-full bg-black/40 pointer-events-auto"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
