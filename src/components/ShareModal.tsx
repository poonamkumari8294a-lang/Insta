import React, { useState, useEffect } from 'react';
import { MediaItem, SiteSettings } from '../types';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Download,
  ExternalLink,
  Sparkles,
  Send,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';
import QRCode from 'qrcode';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: MediaItem | null;
  settings?: SiteSettings | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  item,
  settings,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  // Compute share URL & details
  const creatorName = settings?.creatorName || 'VIP Creator';
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = item ? `${baseUrl}#media/${item.id}` : baseUrl;
  
  const shareTitle = item
    ? `🔥 ${item.title} by @${creatorName}`
    : `✨ Official VIP Hub of @${creatorName}`;

  const shareDescription = item
    ? `Check out "${item.title}" exclusively on @${creatorName}'s VIP Hub! Instant UPI unlock & uncut 4K access.`
    : `Unlock uncut HD photos, master video sets, and backstage reels directly from @${creatorName}!`;

  const fullShareText = `${shareTitle}\n${shareDescription}\n👉 ${shareUrl}`;

  // Generate QR Code
  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(shareUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#4a044e',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR Generation failed:', err));
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      prompt('Copy this link:', shareUrl);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
        return;
      } catch (_) {
        // Fallback
      }
    }
    handleCopyLink();
  };

  // Social Share Handlers
  const handleWhatsAppShare = () => {
    const encodedText = encodeURIComponent(`${fullShareText}`);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  const handleTelegramShare = () => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareTitle);
    window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank');
  };

  const handleInstagramShare = () => {
    handleCopyLink();
    window.open('https://instagram.com', '_blank');
  };

  const handleFacebookShare = () => {
    const encodedUrl = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
  };

  const handleTwitterShare = () => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareTitle);
    window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`, '_blank');
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeDataUrl;
    a.download = `VIP-Share-QR-${item ? item.id : 'Hub'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-purple-100 flex items-center justify-between bg-white/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20">
              <Share2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-purple-950">
                {item ? 'शेयर करें (Share Post)' : 'वेबसाइट शेयर करें (Share VIP Hub)'}
              </h3>
              <p className="text-xs text-purple-900/60 font-semibold">
                दोस्तों और सोशल मीडिया पर 1-क्लिक में शेयर करें
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Post/Profile Preview Card */}
          <div className="p-3.5 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-2xl border border-pink-200/80 flex items-center gap-3.5 shadow-2xs">
            <img
              src={item ? (item.thumbnailUrl || item.mediaUrl) : (settings?.profilePicUrl || '')}
              alt="Preview"
              className="w-14 h-14 rounded-2xl object-cover border border-pink-300 shadow-sm shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-700 bg-pink-100 px-2 py-0.5 rounded-md">
                  {item ? item.type : 'VIP Hub'}
                </span>
                <span className="text-[11px] font-bold text-purple-900/70 truncate">
                  @{creatorName}
                </span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-purple-950 truncate">
                {item ? item.title : `${creatorName} Official Exclusive VIP Hub`}
              </h4>
              <p className="text-[11px] text-purple-900/60 truncate">
                {item ? item.description : settings?.tagline}
              </p>
            </div>
          </div>

          {/* Social Share Grid */}
          <div>
            <label className="text-xs font-black text-purple-950 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span>सोशल मीडिया पर शेयर करें (Share Directly):</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 flex flex-col items-center justify-center gap-1.5 transition-transform active:scale-95 group cursor-pointer shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <span className="text-xs font-bold">WhatsApp</span>
              </button>

              {/* Instagram */}
              <button
                type="button"
                onClick={handleInstagramShare}
                className="p-3 rounded-2xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-900 flex flex-col items-center justify-center gap-1.5 transition-transform active:scale-95 group cursor-pointer shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Instagram className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Instagram</span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={handleTelegramShare}
                className="p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 flex flex-col items-center justify-center gap-1.5 transition-transform active:scale-95 group cursor-pointer shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Send className="w-5 h-5 fill-white ml-0.5" />
                </div>
                <span className="text-xs font-bold">Telegram</span>
              </button>

              {/* Facebook / Twitter */}
              <button
                type="button"
                onClick={handleFacebookShare}
                className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 flex flex-col items-center justify-center gap-1.5 transition-transform active:scale-95 group cursor-pointer shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Facebook className="w-5 h-5 fill-white" />
                </div>
                <span className="text-xs font-bold">Facebook</span>
              </button>
            </div>
          </div>

          {/* Copy Link Input Bar */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-purple-950 uppercase tracking-wider block">
              सीधा लिंक कॉपी करें (Copy Link):
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-purple-50/80 rounded-2xl border border-purple-200/80">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs font-mono text-purple-950 outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'glow-pink-btn text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>कॉपी हो गया!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Native System Share & QR Code Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-2xl bg-white hover:bg-pink-50 border border-purple-200 text-purple-950 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-pink-600" />
                <span>More Share Options</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className={`w-full ${typeof navigator !== 'undefined' && 'share' in navigator ? 'sm:w-1/2' : 'w-full'} py-2.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer ${
                showQr
                  ? 'bg-purple-900 text-white border-purple-900'
                  : 'bg-white hover:bg-purple-50 text-purple-950 border-purple-200'
              }`}
            >
              <QrCode className="w-4 h-4 text-pink-600" />
              <span>{showQr ? 'Hide QR Code' : 'Scan / Download QR Code'}</span>
            </button>
          </div>

          {/* Collapsible QR Code Display */}
          {showQr && (
            <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 text-center space-y-3 animate-in zoom-in-95 duration-150">
              <div className="w-44 h-44 mx-auto p-2 bg-white rounded-2xl border border-purple-200 shadow-md flex items-center justify-center">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Page QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <p className="text-[11px] text-purple-900/70 font-semibold">
                किसी भी फोन से स्कैन करके यह पेज तुरंत खोलें
              </p>
              <button
                type="button"
                onClick={handleDownloadQr}
                className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR Code Image</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-purple-50/60 border-t border-purple-100 flex items-center justify-between text-xs text-purple-900/60 font-medium shrink-0">
          <span>✨ 100% Instant Delivery • Safe & Verified</span>
          <button
            type="button"
            onClick={onClose}
            className="text-pink-600 hover:underline font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
