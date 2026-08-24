import React from 'react';
import { X, Sparkles } from 'lucide-react';

export interface ForegroundNotificationData {
  title: string;
  body: string;
  image?: string;
  url?: string;
  postId?: string;
}

interface ForegroundNotificationToastProps {
  notification: ForegroundNotificationData | null;
  onClose: () => void;
  onNavigate: (url: string) => void;
}

export const ForegroundNotificationToast: React.FC<ForegroundNotificationToastProps> = ({
  notification,
  onClose,
  onNavigate
}) => {
  if (!notification) return null;

  const handleClick = () => {
    const targetUrl = notification.url || (notification.postId ? `/#detail/${notification.postId}` : '/');
    onNavigate(targetUrl);
    onClose();
  };

  return (
    <div
      id="foreground-push-toast"
      className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className="overflow-hidden rounded-3xl p-3.5 bg-purple-950/95 backdrop-blur-2xl border border-pink-500/40 text-white shadow-2xl shadow-purple-950/60 flex items-center gap-3">
        {notification.image ? (
          <img
            src={notification.image}
            alt="Preview"
            className="w-12 h-12 rounded-2xl object-cover border border-pink-500/30 shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
        )}

        <div className="flex-1 min-w-0" onClick={handleClick} role="button" tabIndex={0}>
          <h4 className="font-display font-black text-xs sm:text-sm text-pink-300 truncate cursor-pointer">
            {notification.title}
          </h4>
          <p className="text-[11px] text-purple-200/90 line-clamp-1 mt-0.5 cursor-pointer">
            {notification.body}
          </p>
          <span className="inline-block text-[10px] font-bold text-pink-400 hover:text-pink-300 mt-1 cursor-pointer">
            अभी देखें (View Now) →
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-purple-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
