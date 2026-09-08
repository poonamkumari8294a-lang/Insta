import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share2, Sparkles } from 'lucide-react';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
}) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
      setIsStandalone(
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      );
    }
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-rose-500 p-5 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors text-white"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white p-2 shadow-lg mb-2.5 flex items-center justify-center">
            <img src="/favicon.svg" alt="Ruma VIP Icon" className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">
            📱 VIP Android App / PWA
          </h3>
          <p className="text-xs text-pink-100 font-medium mt-1">
            अपने मोबाइल की होम स्क्रीन पर एक क्लिक में ऐप इंस्टॉल करें
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-purple-950">
          <div className="bg-pink-50/70 border border-pink-100 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-pink-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ऐप के फायदे (VIP App Benefits)</span>
            </div>
            <ul className="text-xs text-purple-900 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>बिना ब्राउज़र खोले डायरेक्ट खुलेगा:</strong> फ़ोन के होम स्क्रीन पर ऐप आइकॉन आ जाएगा।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>सुपर फ़ास्ट लोडिंग:</strong> 2G/3G नेटवर्क में भी वीडियो और फ़ोटो तेज़ी से खुलेंगी।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>0MB स्टोरेज:</strong> फ़ोन की मेमोरी फुल नहीं होगी, लाइटवेट PWA टेक्नोलॉजी।</span>
              </li>
            </ul>
          </div>

          {/* Action based on Device */}
          {isStandalone ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-emerald-800">ऐप पहले से इंस्टॉल है!</p>
              <p className="text-xs text-emerald-600 mt-0.5">आप ऐप मोड में ही हैं।</p>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3.5 px-6 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 hover:brightness-105 shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>तुरंत इंस्टॉल करें (Install App Now)</span>
              </button>
              <p className="text-[11px] text-center text-purple-900/60 font-medium">
                Google Chrome या Brave ब्राउज़र में सीधा इंस्टॉल डायलॉग खुलेगा।
              </p>
            </div>
          ) : isIOS ? (
            <div className="space-y-3 text-xs text-purple-900 bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <p className="font-bold text-purple-950 text-sm">🍎 iPhone / iPad यूज़र्स के लिए:</p>
              <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                <li>सफ़ारी ब्राउज़र में नीचे दिए गए <strong>Share बटन <Share2 className="w-3.5 h-3.5 inline mx-1 text-pink-600" /></strong> पर टैप करें।</li>
                <li>नीचे स्क्रॉल करके <strong>"Add to Home Screen"</strong> (होम स्क्रीन में जोड़ें) चुनें।</li>
                <li>ऊपर दाईं ओर <strong>"Add"</strong> पर क्लिक करें — ऐप स्क्रीन पर आ जाएगा!</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3 text-xs text-purple-900 bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <p className="font-bold text-purple-950 text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-pink-600" />
                <span>Android फ़ोन में इंस्टॉल कैसे करें (2 सेकंड):</span>
              </p>
              <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-purple-900/90">
                <li>ब्राउज़र में ऊपर दाईं ओर <strong>3 डॉट्स (⋮)</strong> पर क्लिक करें।</li>
                <li><strong>"Install app"</strong> या <strong>"Add to Home screen"</strong> चुनें।</li>
                <li><strong>"Install"</strong> पर दबाएं — ऐप तुरंत आपके फ़ोन के ऐप्स में आ जाएगा!</li>
              </ol>
            </div>
          )}

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="text-xs font-bold text-purple-900/60 hover:text-pink-600 transition-colors"
            >
              समझ गया / बाद में करें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
