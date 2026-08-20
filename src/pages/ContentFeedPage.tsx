import React, { useState, useMemo } from 'react';
import { MediaItem } from '../types';
import { ContentCard } from '../components/ContentCard';
import { Search, Filter, Sparkles, Film, Image as ImageIcon, Layers, Gift } from 'lucide-react';

interface ContentFeedPageProps {
  content: MediaItem[];
  unlockedIds: string[];
  onOpenMedia: (item: MediaItem) => void;
  onBuyMedia: (item: MediaItem) => void;
  onOpenShare?: (item: MediaItem) => void;
}

export const ContentFeedPage: React.FC<ContentFeedPageProps> = ({
  content,
  unlockedIds,
  onOpenMedia,
  onBuyMedia,
  onOpenShare,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('latest');

  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      // Type / Access filter
      if (filterType === 'photo' && item.type !== 'photo') return false;
      if (filterType === 'video' && item.type !== 'video') return false;
      if (filterType === 'pack' && item.type !== 'pack') return false;
      if (filterType === 'free' && item.access !== 'free') return false;
      if (filterType === 'premium' && item.access !== 'premium') return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.views - a.views;
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      // Default latest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [content, filterType, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header Title */}
      <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-purple-100 pb-6">
        <div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-pink-100 text-pink-700 border border-pink-200 uppercase tracking-wider inline-flex items-center gap-1.5 mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-pink-600" />
            Official VIP Vault
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-purple-950">
            Exclusive Photos & Master Reels
          </h1>
          <p className="text-xs sm:text-sm text-purple-900/70 mt-1 font-medium">
            Browse all unfiltered collections. Zero login required • Instant UPI unlock.
          </p>
        </div>

        <div className="text-xs text-pink-700 font-extrabold bg-pink-50 px-3.5 py-1.5 rounded-2xl border border-pink-200 self-center sm:self-auto shadow-sm">
          {filteredContent.length} Items Available
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
                : 'bg-white/80 text-purple-950 border border-purple-100 hover:bg-pink-50'
            }`}
          >
            All Content
          </button>

          <button
            onClick={() => setFilterType('video')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterType === 'video'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
                : 'bg-white/80 text-purple-950 border border-purple-100 hover:bg-pink-50'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>VIP Reels (₹99)</span>
          </button>

          <button
            onClick={() => setFilterType('photo')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterType === 'photo'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
                : 'bg-white/80 text-purple-950 border border-purple-100 hover:bg-pink-50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>HD Photos (₹49)</span>
          </button>

          <button
            onClick={() => setFilterType('pack')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterType === 'pack'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
                : 'bg-white/80 text-purple-950 border border-purple-100 hover:bg-pink-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>VIP Packs (₹199)</span>
          </button>

          <button
            onClick={() => setFilterType('free')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterType === 'free'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-white/80 text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Free Samples</span>
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-purple-900/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reels, gym, saree..."
              className="w-full bg-white/90 border border-purple-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-purple-950 placeholder-purple-900/40 focus:outline-none focus:border-pink-500 shadow-sm transition-colors font-medium"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/90 border border-purple-200 rounded-2xl px-3 py-2 text-xs text-purple-950 focus:outline-none focus:border-pink-500 cursor-pointer shadow-sm font-semibold"
          >
            <option value="latest">Latest First</option>
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

      </div>

      {/* Grid of Content Cards */}
      {filteredContent.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-3 shadow-inner">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="font-display font-black text-lg text-purple-950">No Content Found</h3>
          <p className="text-xs text-purple-900/70 mt-1 font-medium">Try changing your search term or filter.</p>
          <button
            onClick={() => {
              setFilterType('all');
              setSearchQuery('');
            }}
            className="mt-4 px-5 py-2.5 rounded-2xl bg-pink-600 text-white text-xs font-black shadow-md shadow-pink-500/20"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredContent.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              isUnlocked={unlockedIds.includes(item.id)}
              onOpen={onOpenMedia}
              onBuy={onBuyMedia}
              onOpenShare={onOpenShare}
            />
          ))}
        </div>
      )}

    </div>
  );
};
