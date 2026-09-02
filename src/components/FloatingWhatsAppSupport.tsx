import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { MessageCircle, X, CheckCircle, Sparkles, Send, ShieldCheck } from 'lucide-react';

interface FloatingWhatsAppSupportProps {
  settings?: SiteSettings;
}

export const FloatingWhatsAppSupport: React.FC<FloatingWhatsAppSupportProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quickMsg, setQuickMsg] = useState('');

  const rawPhone = settings?.supportWhatsApp || '+63 9465507887';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const displayPhone = rawPhone;

  const defaultGreeting = `Hello ${settings?.creatorName || 'Ruma'}! I am visiting your VIP Gallery and need help with VIP unlock / payment support.`;

  const handleOpenWhatsApp = (customText?: string) => {
    const textToSend = customText?.trim() || quickMsg.trim() || defaultGreeting;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40 flex flex-col items-end select-none">
      {/* Expanded Quick Chat Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-200/80 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 text-white">
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
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-300 border-2 border-emerald-700 rounded-full animate-ping" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-700 rounded-full" />
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-sm leading-tight text-white">
                      {settings?.creatorName || 'Ruma'} VIP Support
                    </h4>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  </div>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span>Online • Instant Reply</span>
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
          <div className="p-4 space-y-3 bg-gradient-to-b from-emerald-50/50 to-white">
            
            {/* Creator message */}
            <div className="bg-white rounded-2xl p-3 border border-emerald-100/80 shadow-xs text-xs text-purple-950 space-y-1">
              <p className="font-semibold text-purple-900 leading-relaxed">
                नमस्ते! 👋 VIP गैलरी या UPI पेमेंट में कोई भी समस्या आ रही हो, तो हमारे आधिकारिक व्हाट्सएप नंबर पर सीधे बात करें:
              </p>
              <div className="pt-1 flex items-center gap-1.5 font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xl w-fit">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{displayPhone}</span>
              </div>
            </div>

            {/* Quick action chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-900/50 block">
                Quick Inquiries (तुरंत पूछें):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenWhatsApp(`Hello! Mujhe VIP All-Access Plan unlock karna hai.`)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-purple-100 hover:border-emerald-300 text-[11px] font-bold text-purple-900 transition-all text-left shadow-2xs cursor-pointer"
                >
                  👑 VIP Pass Unlock
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenWhatsApp(`Hello! Maine UPI payment kiya hai par content unlock nahi hua, please check karein.`)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-purple-100 hover:border-emerald-300 text-[11px] font-bold text-purple-900 transition-all text-left shadow-2xs cursor-pointer"
                >
                  ⚡ Payment Issue
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenWhatsApp(`Hello! Video Reels & Backstage Photos kaise dekhein?`)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-purple-100 hover:border-emerald-300 text-[11px] font-bold text-purple-900 transition-all text-left shadow-2xs cursor-pointer"
                >
                  📸 Photos / Videos
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
                    handleOpenWhatsApp();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 bg-white border border-purple-200 rounded-2xl px-3 py-2 text-xs text-purple-950 placeholder-purple-900/40 focus:outline-none focus:border-emerald-500 shadow-2xs font-medium"
              />
              <button
                type="button"
                onClick={() => handleOpenWhatsApp()}
                className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer shrink-0"
                title="Send on WhatsApp"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Official Support badge */}
            <div className="pt-1 flex items-center justify-center gap-1 text-[10px] text-purple-900/60 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official 24/7 WhatsApp Support</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="relative group">
        
        {/* Subtle glowing animated pulse rings */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-40 blur-sm group-hover:opacity-75 animate-pulse transition duration-300" />

        <button
          id="floating-whatsapp-btn"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-2.5 px-3.5 sm:px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-black text-xs shadow-xl shadow-emerald-600/35 border-2 border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          title={`Chat with us on WhatsApp (${displayPhone})`}
        >
          <div className="relative flex items-center justify-center">
            <MessageCircle className="w-5 h-5 fill-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-300 rounded-full border border-emerald-800 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-300 rounded-full border border-emerald-800" />
          </div>

          <div className="hidden sm:flex flex-col items-start leading-none text-left">
            <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">Support</span>
            <span className="text-xs font-black tracking-wide">WhatsApp</span>
          </div>
        </button>
      </div>
    </div>
  );
};
