import React, { useState, useEffect } from 'react';
import { Flame, Zap, Crown, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../utils/api';
import { MediaItem } from '../types';

interface LiveUnlockActivityToastProps {
  items: MediaItem[];
  onItemClick?: (item: MediaItem) => void;
}

const SAMPLE_NAMES = [
  'राहुल (दिल्ली)',
  'विकास (मुंबई)',
  'रोहित (जयपुर)',
  'अमन (पुणे)',
  'समीर (लखनऊ)',
  'अभिषेक (पटना)',
  'दीपक (इंदौर)',
  'गौरव (चंडीगढ़)',
  'करण (अहमदाबाद)',
  'मनीष (भोपाल)'
];

export const LiveUnlockActivityToast: React.FC<LiveUnlockActivityToastProps> = ({
  items,
  onItemClick,
}) => {
  const [currentActivity, setCurrentActivity] = useState<{
    userName: string;
    item: MediaItem;
    timeAgo: string;
    action: string;
  } | null>(null);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!items || items.length === 0) return;

    const showRandomActivity = () => {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const randomName = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
      const mins = Math.floor(Math.random() * 3) + 1;
      
      setCurrentActivity({
        userName: randomName,
        item: randomItem,
        timeAgo: `${mins} मिनट पहले`,
        action: randomItem.type === 'video' ? 'ने VIP वीडियो अनलॉक किया' : 'ने प्राइवेट HD फ़ोटो अनलॉक की'
      });

      setVisible(true);

      // Hide after 5.5 seconds
      setTimeout(() => {
        setVisible(false);
      }, 5500);
    };

    // First trigger after 4s, then repeat every 14s
    const firstTimeout = setTimeout(showRandomActivity, 4000);
    const interval = setInterval(showRandomActivity, 14000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, [items]);

  if (!visible || !currentActivity) return null;

  return (
    <div
      onClick={() => onItemClick && onItemClick(currentActivity.item)}
      className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 max-w-[320px] bg-purple-950/95 backdrop-blur-xl border border-pink-500/50 rounded-2xl p-2.5 sm:p-3 text-white shadow-2xl shadow-purple-950/80 cursor-pointer animate-in slide-in-from-bottom-5 fade-in duration-300 hover:scale-105 transition-transform"
    >
      <div className="flex items-center gap-2.5">
        <div className="relative shrink-0">
          <img
            src={currentActivity.item.thumbnailUrl}
            alt=""
            className="w-11 h-11 rounded-xl object-cover border border-pink-400/80"
            referrerPolicy="no-referrer"
          />
          <span className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 rounded-full text-white">
            <CheckCircle2 className="w-3 h-3" />
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-[10px] text-pink-300 font-bold">
            <Flame className="w-3 h-3 text-orange-400 animate-flame" />
            <span className="truncate">{currentActivity.userName}</span>
            <span className="text-purple-300">• {currentActivity.timeAgo}</span>
          </div>

          <p className="text-[11px] font-black text-white truncate mt-0.5">
            {currentActivity.item.title}
          </p>

          <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
            <span className="text-emerald-400 font-bold">
              {formatINR(currentActivity.item.price)} अनलॉक किया ✓
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
