import React from 'react';
import { SiteSettings } from '../types';
import { Instagram, Send, ShieldCheck, Heart, Lock, Mail } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  return (
    <footer className="border-t border-white/80 bg-white/70 backdrop-blur-xl text-purple-900/80 text-xs py-12 pb-24 md:pb-12 mt-12 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Creator Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src={settings.profilePicUrl}
                alt={settings.creatorName}
                className="w-9 h-9 rounded-full border-2 border-pink-400 object-cover shadow-sm"
                referrerPolicy="no-referrer"
              />
              <span className="font-display font-black text-lg text-purple-950">
                {settings.creatorName} Official
              </span>
            </div>
            <p className="text-purple-900/70 text-xs leading-relaxed max-w-md font-medium">
              {settings.bio}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-pink-700 transition-all flex items-center gap-1.5 font-bold text-xs shadow-sm"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram</span>
              </a>

              {settings.supportTelegram && (
                <a
                  href={settings.supportTelegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-2xl bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 transition-all flex items-center gap-1.5 font-bold text-xs shadow-sm"
                >
                  <Send className="w-4 h-4 text-purple-600" />
                  <span>VIP Telegram</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-black text-sm text-purple-950 mb-3 tracking-wide">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <button onClick={() => onNavigate('home')} className="text-purple-900/70 hover:text-pink-600 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('content')} className="text-purple-900/70 hover:text-pink-600 transition-colors">
                  All Photos & Videos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('vip-packs')} className="text-purple-900/70 hover:text-pink-600 transition-colors">
                  VIP Combo Packs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="text-purple-900/70 hover:text-pink-600 transition-colors">
                  How UPI Unlock Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="text-purple-900/70 hover:text-pink-600 transition-colors">
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Admin */}
          <div>
            <h4 className="font-display font-black text-sm text-purple-950 mb-3 tracking-wide">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <button onClick={() => onNavigate('terms')} className="text-purple-900/70 hover:text-pink-600 transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="text-purple-900/70 hover:text-pink-600 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('refund')} className="text-purple-900/70 hover:text-pink-600 transition-colors">
                  Refund & Cancellation Policy
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-purple-900/60 font-medium">
          <div className="flex items-center gap-1.5">
            <span>© 2026 {settings.creatorName}. All Rights Reserved.</span>
            <span>•</span>
            <span className="text-purple-950 font-semibold">UPI Payee: {settings.upiId}</span>
          </div>

          <div className="flex items-center gap-2 text-pink-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Server Token Authorization • DMCA Protected</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
