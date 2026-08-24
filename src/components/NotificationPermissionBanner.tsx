import React, { useState, useEffect } from 'react';
import { Bell, BellRing, CheckCircle, X } from 'lucide-react';
import {
  isPushNotificationSupported,
  getPushPermissionState,
  isPushPromptDismissed,
  dismissPushPrompt,
  requestNotificationSubscription
} from '../services/notificationService';

interface NotificationPermissionBannerProps {
  vapidKey?: string;
  onSubscribed?: (token: string) => void;
}

export const NotificationPermissionBanner: React.FC<NotificationPermissionBannerProps> = ({
  vapidKey,
  onSubscribed
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'denied'>('idle');

  useEffect(() => {
    // Only show if push notifications are supported, permission not yet granted or denied, and user hasn't dismissed it
    if (!isPushNotificationSupported()) return;
    const perm = getPushPermissionState();
    if (perm === 'granted' || perm === 'denied') return;
    if (isPushPromptDismissed()) return;

    // Small delay to let page settle first (mobile friendly)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const res = await requestNotificationSubscription(vapidKey);
      if (res.success && res.token) {
        setStatus('success');
        if (onSubscribed) onSubscribed(res.token);
        setTimeout(() => {
          setIsVisible(false);
        }, 2200);
      } else if (getPushPermissionState() === 'denied') {
        setStatus('denied');
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    } catch {
      setStatus('denied');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    dismissPushPrompt();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      id="notification-optin-card"
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="relative overflow-hidden rounded-3xl p-4 sm:p-5 bg-purple-950/95 backdrop-blur-2xl border border-pink-500/30 text-white shadow-2xl shadow-pink-950/50">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-close-notification-prompt"
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-purple-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close notification prompt"
        >
          <X className="w-4 h-4" />
        </button>

        {status === 'success' ? (
          <div className="flex items-center gap-3 py-1">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-300">नोटिफिकेशन्स चालू हो गए! 🎉</h4>
              <p className="text-xs text-purple-200/80">नया फोटो अपलोड होते ही आपको तुरंत अलर्ट मिलेगा।</p>
            </div>
          </div>
        ) : status === 'denied' ? (
          <div className="flex items-center gap-3 py-1">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-300">अनुमति अस्वीकार</h4>
              <p className="text-xs text-purple-200/80">आप ब्राउज़र सेटिंग्स में जाकर कभी भी नोटिफिकेशन ऑन कर सकते हैं।</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 pr-6">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/30 shrink-0">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm text-white flex items-center gap-1.5">
                  🔔 Notifications चालू करें
                  <span className="px-1.5 py-0.5 rounded-md bg-pink-500/30 text-pink-300 text-[10px] font-bold">New</span>
                </h3>
                <p className="text-xs text-purple-200/90 font-medium leading-relaxed mt-0.5">
                  नया फोटो या नया content upload होते ही notification पाने के लिए notifications चालू करें।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                id="btn-enable-push-notifications"
                onClick={handleEnableNotifications}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-2xl glow-pink-btn text-xs font-black text-white flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 active:scale-[0.98] transition-transform cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>अनुमति जांची जा रही है...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>🔔 Notifications चालू करें</span>
                  </>
                )}
              </button>

              <button
                id="btn-dismiss-push-notifications"
                onClick={handleDismiss}
                className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-purple-200 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                बाद में (Later)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
