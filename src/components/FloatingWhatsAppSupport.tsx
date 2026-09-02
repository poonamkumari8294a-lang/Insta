import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { Instagram, X, Sparkles, Send, ShieldCheck, ExternalLink, Copy, Check } from 'lucide-react';

interface FloatingWhatsAppSupportProps {
  settings?: SiteSettings;
}

export const FloatingWhatsAppSupport: React.FC<FloatingWhatsAppSupportProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quickMsg, setQuickMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const instagramUrl = settings?.supportInstagram || settings?.instagramUrl || 'https://www.instagram.com/ruma__cutegirl?igsi=cXo3ZmN3MWl0ZGQ3';
  const instagramHandle = settings?.instagramHandle || '@ruma__cutegirl';

  const defaultGreeting = `Hello ${settings?.creatorName || 'Ruma'}! I need VIP unlock / payment support on your VIP Gallery.`;

  const handleOpenInstagram = (customText?: string) => {
    const textToSend = customText?.trim() || quickMsg.trim() || defaultGreeting;
    if (textToSend) {
      try {
        navigator.clipboard.writeText(textToSend);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (_) {
        // clipboard might fail in some iframe contexts
      }
    }
    window.open(instagramUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-36 sm:bottom-24 right-4 sm:right-6 z-40 flex flex-col items-end select-none">
      {/* Expanded Quick Support Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 rounded-3xl bg-white/95 backdrop-blur-xl border border-pink-200/80 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 p-0.5 border border-white/40 overflow-hidden shadow-sm">
                    <img
                      src={settings?.profilePicUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=max&q=80'}
                      alt={settings?.creatorName || 'VIP Creator'}
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-pink-300 border-2 border-pink-700 rounded-full animate-ping" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-pink-400 border-2 border-pink-700 rounded-full" />
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-sm leading-tight text-white">
                      {settings?.creatorName || 'Ruma'} Instagram Support
                    </h4>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  </div>
                  <p className="text-[11px] text-pink-100 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span>Online • Instant DM Reply</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body with Chat Bubble */}
          <div className="p-4 space-y-3 bg-gradient-to-b from-pink-50/40 to-white">
            
            {/* Creator message */}
            <div className="bg-white rounded-2xl p-3 border border-pink-100/80 shadow-xs text-xs text-purple-950 space-y-2">
              <p className="font-semibold text-purple-900 leading-relaxed">
                नमस्ते! 👋 VIP गैलरी या UPI पेमेंट में कोई भी सहायता चाहिए तो सीधे हमारी आधिकारिक Instagram आईडी पर DM करें:
              </p>
              
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 hover:from-purple-100 hover:via-pink-100 hover:to-rose-100 border border-pink-200/80 p-2.5 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs text-pink-900 leading-tight">ruma__cutegirl</div>
                    <div className="text-[10px] text-pink-700/70 font-medium">Official Instagram Account</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-pink-500 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Quick action chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-900/50 block">
                Quick Support Inquiries (तुरंत DM करें):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenInstagram(`Hello! Mujhe VIP All-Access Plan unlock karna hai.`)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-pink-50 border border-purple-100 hover:border-pink-300 text-[11px] font-bold text-purple-900 transition-all text-left shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <span>👑 VIP Pass Unlock</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenInstagram(`Hello! Maine UPI payment kiya hai par content unlock nahi hua, please check karein.`)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-pink-50 border border-purple-100 hover:border-pink-300 text-[11px] font-bold text-purple-900 transition-all text-left shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <span>⚡ Payment Issue</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenInstagram(`Hello! Video Reels & Backstage Photos kaise dekhein?`)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-pink-50 border border-purple-100 hover:border-pink-300 text-[11px] font-bold text-purple-900 transition-all text-left shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <span>📸 Photos / Videos</span>
                </button>
              </div>
            </div>

            {/* Input & Direct Send */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={quickMsg}
                onChange={(e) => setQuickMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleOpenInstagram();
                  }
                }}
                placeholder="Type question for Instagram DM..."
                className="flex-1 bg-white border border-purple-200 rounded-2xl px-3 py-2 text-xs text-purple-950 placeholder-purple-900/40 focus:outline-none focus:border-pink-500 shadow-2xs font-medium"
              />
              <button
                type="button"
                onClick={() => handleOpenInstagram()}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-md shadow-pink-600/30 transition-transform active:scale-95 cursor-pointer shrink-0 flex items-center justify-center"
                title="Open Instagram DM"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {copied && (
              <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-2 py-1 text-center font-bold animate-in fade-in flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>मैसेज कॉपी हो गया! Instagram खुल रहा है...</span>
              </div>
            )}

            {/* Official Support badge */}
            <div className="pt-1 flex items-center justify-center gap-1 text-[10px] text-purple-900/60 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
              <span>Official 24/7 Instagram DM Support</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="relative group">
        
        {/* Subtle glowing animated pulse rings */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 opacity-40 blur-sm group-hover:opacity-75 animate-pulse transition duration-300" />

        <button
          id="floating-support-btn"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-2.5 px-3.5 sm:px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-black text-xs shadow-xl shadow-pink-600/35 border-2 border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          title={`Instagram Support (${instagramHandle})`}
        >
          <div className="relative flex items-center justify-center">
            <Instagram className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-300 rounded-full border border-pink-800 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-300 rounded-full border border-pink-800" />
          </div>

          <div className="hidden sm:flex flex-col items-start leading-none text-left">
            <span className="text-[10px] text-pink-100 font-bold uppercase tracking-wider">Support</span>
            <span className="text-xs font-black tracking-wide">Instagram DM</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export const FloatingInstagramSupport = FloatingWhatsAppSupport;

