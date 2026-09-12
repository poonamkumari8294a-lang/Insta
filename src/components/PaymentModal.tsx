import React, { useState, useEffect, useRef } from 'react';
import { MediaItem, OrderItem, SiteSettings } from '../types';
import {
  createOrder,
  checkOrderStatus,
  submitPaymentProofApi,
  formatINR,
  saveAccessToken,
  getStoredUserProfile,
  saveStoredUserProfile,
  saveVipLeadToCloud,
  updateOrderCustomer,
  fetchSiteSettings,
  getCachedSiteSettingsSync
} from '../utils/api';
import { compressImageFile } from '../utils/mediaUpload';
import confetti from '../utils/confetti';
import {
  X,
  QrCode,
  Copy,
  Check,
  Download,
  AlertCircle,
  Lock,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Upload,
  FileImage,
  ExternalLink,
  Zap,
  MessageCircle,
  Phone,
  RotateCcw,
  XCircle
} from 'lucide-react';

interface PaymentModalProps {
  item: MediaItem | null;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess: (item: MediaItem) => void;
}

type CheckoutPage = 'checkout' | 'qr' | 'proof' | 'manual_review' | 'rejected' | 'success';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  item,
  isOpen = true,
  onClose,
  onSuccess,
}) => {
  const [currentPage, setCurrentPage] = useState<CheckoutPage>('checkout');
  const [orderData, setOrderData] = useState<{
    order: OrderItem;
    qrDataUrl: string;
    upiIntentUrl: string;
    appUrls?: {
      gpay: string;
      phonepe: string;
      paytm: string;
      bhim: string;
      cred: string;
      generic: string;
    };
    mode: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<OrderItem['status']>('pending');
  const [timeLeft, setTimeLeft] = useState(29 * 60 + 29); // 29:29 as in screenshot

  // Helpline and settings state
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(() => getCachedSiteSettingsSync());
  const [reviewReason, setReviewReason] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState<string | null>(null);
  const [copiedHelpline, setCopiedHelpline] = useState(false);

  // Screenshot Upload States
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [userUtr, setUserUtr] = useState('');
  const [isAutoVerified, setIsAutoVerified] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Polling ref
  const pollingRef = useRef<any>(null);

  // Customer Personal Details
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  // Fetch Site Settings for helpline
  useEffect(() => {
    fetchSiteSettings().then((st) => {
      if (st) setSiteSettings(st);
    }).catch(() => {});
  }, []);

  // Load existing profile if available
  useEffect(() => {
    const saved = getStoredUserProfile();
    if (saved) {
      if (saved.name) setUserName(saved.name);
      if (saved.phone) setUserPhone(saved.phone);
    }
  }, []);

  // Initialize Order
  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    setError(null);
    setLoading(true);
    setCurrentPage('checkout');

    const savedUser = getStoredUserProfile();
    const initName = savedUser?.name || '';
    const initPhone = savedUser?.phone || '';

    createOrder(item.id, item, initName, initPhone)
      .then((res) => {
        if (isMounted) {
          setOrderData(res);
          setPaymentStatus(res.order.status);
          if (res.order.status === 'manual_review') {
            setCurrentPage('manual_review');
            if (res.order.rejectionReason) setReviewReason(res.order.rejectionReason);
          } else if (res.order.status === 'failed') {
            setCurrentPage('rejected');
            if (res.order.rejectionReason) setRejectionNote(res.order.rejectionReason);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'पेमेंट इनिशियलाइज़ करने में समस्या हुई। कृपया पुनः प्रयास करें।');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [item]);

  // Polling for automated payment confirmation or admin manual approval
  useEffect(() => {
    if (!orderData || paymentStatus === 'paid' || paymentStatus === 'failed' || paymentStatus === 'expired') {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    pollingRef.current = setInterval(async () => {
      try {
        const statusRes = await checkOrderStatus(orderData.order.orderId);
        if (statusRes.status === 'paid') {
          setPaymentStatus('paid');
          setCurrentPage('success');
          if (item) {
            const validTok = statusRes.accessToken || `tok_paid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            saveAccessToken(item.id, validTok);
          }
          confetti({
            particleCount: 160,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#10b981', '#6366f1', '#ec4899', '#f59e0b']
          });
          clearInterval(pollingRef.current);
        } else if (statusRes.status === 'manual_review' || statusRes.status === 'waiting_verification') {
          setPaymentStatus('manual_review');
          if (statusRes.rejectionReason) {
            setReviewReason(statusRes.rejectionReason);
          }
          if (currentPage === 'proof') {
            setCurrentPage('manual_review');
          }
        } else if (statusRes.status === 'failed') {
          setPaymentStatus('failed');
          setCurrentPage('rejected');
          if (statusRes.rejectionReason) {
            setRejectionNote(statusRes.rejectionReason);
          }
          clearInterval(pollingRef.current);
        } else if (statusRes.status === 'expired') {
          setPaymentStatus(statusRes.status);
          clearInterval(pollingRef.current);
        }
      } catch (err) {
        console.warn('Polling check error', err);
      }
    }, 2500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [orderData, paymentStatus, item, currentPage]);

  // Countdown timer (Starts at 29:29)
  useEffect(() => {
    if (paymentStatus === 'paid' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, paymentStatus]);

  if (!item || !isOpen) return null;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyOrderId = () => {
    if (!orderData?.order.orderId) return;
    navigator.clipboard.writeText(orderData.order.orderId);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!orderData?.qrDataUrl) return;
    const link = document.createElement('a');
    link.href = orderData.qrDataUrl;
    link.download = `QR-${orderData.order.orderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Launch UPI App Intent
  const handleLaunchApp = (appName: 'phonepe' | 'paytm' | 'qr') => {
    if (appName === 'qr') {
      setCurrentPage('qr');
      return;
    }

    if (!orderData) return;

    // Create server-side payment intent
    fetch('/api/payment/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: orderData.order.orderId, appName })
    }).catch(() => {});

    const targetUrl = appName === 'phonepe'
      ? (orderData.appUrls?.phonepe || orderData.upiIntentUrl)
      : (orderData.appUrls?.paytm || orderData.upiIntentUrl);

    // Try opening deep link on mobile
    window.location.href = targetUrl;

    // Also transition to QR page after attempting deep link so desktop/fallback has immediate visual feedback
    setTimeout(() => {
      setCurrentPage('qr');
    }, 1200);
  };

  // Handle Screenshot File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('फ़ाइल 5 MB से बड़ी नहीं होनी चाहिए। (Max size 5 MB)');
      return;
    }

    // Validate type (JPG, PNG, WEBP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('कृपया केवल JPG, PNG या WebP फ़ाइल अपलोड करें।');
      return;
    }

    setScreenshotFile(file);
    try {
      const compressed = await compressImageFile(file, 1280, 1280, 0.82);
      setScreenshotPreview(compressed);
    } catch (_) {
      const reader = new FileReader();
      reader.onload = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Submit Screenshot Proof with AI Vision Auto-Verification
  const handleSubmitProof = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderData) return;

    if (!screenshotPreview) {
      setUploadError('कृपया पेमेंट स्क्रीनशॉट फ़ाइल चुनें। (Screenshot is required)');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await submitPaymentProofApi(orderData.order.orderId, screenshotPreview, userUtr.trim());
      if (res.success) {
        if (res.status === 'paid') {
          // Automatic Verification: UTR, amount, date & time matched!
          setIsAutoVerified(true);
          setPaymentStatus('paid');
          setCurrentPage('success');
          if (item) {
            const validTok = res.accessToken || `tok_paid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            saveAccessToken(item.id, validTok);
          }
          confetti({
            particleCount: 180,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#10b981', '#6366f1', '#ec4899', '#f59e0b', '#06b6d4']
          });
          if (pollingRef.current) clearInterval(pollingRef.current);
        } else if (res.status === 'failed') {
          setPaymentStatus('failed');
          setCurrentPage('rejected');
          if (res.message) setRejectionNote(res.message);
        } else {
          setPaymentStatus('manual_review');
          setCurrentPage('manual_review');
          if (res.message) setReviewReason(res.message);
        }
      } else {
        setUploadError(res.error || 'स्क्रीनशॉट अपलोड करने में समस्या हुई। कृपया पुनः प्रयास करें।');
      }
    } catch (err: any) {
      setUploadError(err.message || 'अपलोड विफल रहा');
    } finally {
      setIsUploading(false);
    }
  };

  const amountDisplay = item ? formatINR(item.price) : '₹0';

  /* Official Helpline & WhatsApp Support configuration */
  const helplineNumber = (siteSettings?.supportWhatsApp || siteSettings?.whatsappNumber || '+63 9465507887').trim();
  const cleanHelpline = helplineNumber.replace(/[^0-9]/g, '');

  const handleOpenWhatsAppHelpline = (reasonMsg?: string) => {
    const orderId = orderData?.order.orderId || 'VVV-ORDER';
    const amt = amountDisplay || (item ? `₹${item.price}` : '');
    const userTxt = userName ? ` (${userName})` : '';
    const extra = reasonMsg ? `\n\nसमस्या / स्थिति: ${reasonMsg}` : '';
    const text = `नमस्ते! मेरा Order ID: ${orderId}${userTxt} है।\nराशि: ${amt}${extra}\n\nमेरा पेमेंट स्क्रीनशॉट यह रहा। कृपया इसे चेक करके मेरा VIP कंटेंट तुरंत अनलॉक कर दीजिए।`;
    const url = `https://wa.me/${cleanHelpline}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyHelpline = () => {
    navigator.clipboard.writeText(helplineNumber);
    setCopiedHelpline(true);
    setTimeout(() => setCopiedHelpline(false), 2000);
  };

  return (
    <div
      id="upi-payment-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      {/* Centered Modal Container matching reference screenshot styling */}
      <div
        id="upi-payment-modal-card"
        className="w-full max-w-[480px] bg-[#0b101b] border border-[#1e293b] rounded-[28px] shadow-2xl shadow-black/80 overflow-hidden relative flex flex-col text-slate-100 max-h-[94vh]"
      >
        {/* Top Header Close button */}
        <button
          id="upi-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-20 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ======================================================== */}
        {/* PAGE 1: UPI PAYMENT CHECKOUT (Exact match to Screenshot 1) */}
        {/* ======================================================== */}
        {currentPage === 'checkout' && (
          <div className="p-5 sm:p-7 flex flex-col justify-between overflow-y-auto">
            {/* Top Heading */}
            <div className="text-center pt-2 pb-5">
              <h2 className="text-2xl sm:text-[28px] font-black tracking-tight text-white">
                Pay {amountDisplay} with UPI
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Select an app to pay {amountDisplay} securely.
              </p>
            </div>

            {/* UPI APPS Section */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-1">
                UPI APPS
              </div>

              {/* 1. PhonePe Card */}
              <button
                id="btn-pay-phonepe"
                onClick={() => handleLaunchApp('phonepe')}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0f172a] hover:bg-[#15213b] border border-[#223354] transition-all duration-150 group text-left cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  {/* PhonePe Custom Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-[#5f259f] flex items-center justify-center text-white font-black text-xl shadow-md border border-[#7a3cb8] shrink-0">
                    <span className="font-serif leading-none">पे</span>
                  </div>
                  <div>
                    <div className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                      PhonePe
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      Recommended · Fastest
                    </div>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center shrink-0 shadow-sm group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </div>
              </button>

              {/* 2. Paytm Card */}
              <button
                id="btn-pay-paytm"
                onClick={() => handleLaunchApp('paytm')}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0f172a] hover:bg-[#15213b] border border-[#223354] transition-all duration-150 group text-left cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  {/* Paytm Custom Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md border border-slate-300 shrink-0 p-1.5">
                    <span className="text-[#002e6e] font-black text-xs tracking-tighter">
                      pay<span className="text-[#00b9f5]">tm</span>
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                      Paytm
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      One tap pay
                    </div>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center shrink-0 shadow-sm group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </div>
              </button>

              {/* 3. QR Code Card */}
              <button
                id="btn-pay-qr"
                onClick={() => setCurrentPage('qr')}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0f172a] hover:bg-[#15213b] border border-[#223354] transition-all duration-150 group text-left cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  {/* QR Code Icon Box */}
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md border border-slate-300 shrink-0 text-slate-900">
                    <QrCode className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      QR Code
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      Scan in any UPI app
                    </div>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center shrink-0 shadow-sm group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </div>
              </button>
            </div>

            {/* Bottom Submit Screenshot Button (Screenshot 1 green button) */}
            <div className="pt-6">
              <button
                id="btn-goto-proof-page"
                onClick={() => setCurrentPage('proof')}
                className="w-full py-4 px-4 rounded-2xl bg-[#00c26f] hover:bg-[#00ad63] active:scale-[0.99] text-white font-bold transition-all shadow-lg shadow-[#00c26f]/25 flex items-center justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <ArrowUp className="w-5 h-5 text-white stroke-[2.5]" />
                </div>

                <div className="text-center">
                  <div className="text-base font-extrabold tracking-wide leading-tight">
                    Submit Screenshot
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-100/90 leading-tight">
                    After Payment
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 2: QR PAYMENT (Exact match to Screenshot 3) */}
        {/* ======================================================== */}
        {currentPage === 'qr' && (
          <div className="p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">
            {/* Top Navigation */}
            <div className="flex items-center justify-between pb-3">
              <button
                onClick={() => setCurrentPage('checkout')}
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                ← Back to UPI Apps
              </button>
            </div>

            {/* Inner White QR Card (Matching reference screenshot exactly) */}
            <div className="bg-white rounded-3xl p-5 text-center shadow-xl text-slate-900 my-2">
              <div className="text-base font-bold text-[#6d28d9] mb-0.5">
                Scan & Pay
              </div>
              <div className="text-sm font-bold text-slate-900">
                Amount: {amountDisplay}
              </div>
              <div className="text-xs font-bold text-[#e11d48] mt-0.5 mb-3">
                Expires in: {formatTimer(timeLeft)}
              </div>

              {/* Dynamic QR Display */}
              <div className="flex justify-center my-2">
                {orderData?.qrDataUrl ? (
                  <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-inner">
                    <img
                      src={orderData.qrDataUrl}
                      alt="UPI QR Code"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Save QR Button */}
              <button
                id="btn-save-qr"
                onClick={handleDownloadQr}
                className="mt-2.5 inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full border border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Save QR</span>
              </button>

              {/* Supported UPI Apps Subtext */}
              <div className="text-[11px] font-medium text-slate-600 mt-4 flex items-center justify-center gap-1 flex-wrap">
                <span>Scan & pay with</span>
                <span className="font-bold text-blue-600">G Pay</span>
                <span>|</span>
                <span className="font-bold text-[#5f259f]">PhonePe</span>
                <span>|</span>
                <span className="font-bold text-[#00b9f5]">Paytm</span>
                <span>or any UPI app</span>
              </div>

              {/* Subtle Loading Spinner & Status */}
              <div className="mt-3.5 flex flex-col items-center justify-center gap-1 text-[#6d28d9]">
                <div className="w-4 h-4 border-2 border-[#6d28d9] border-t-transparent rounded-full animate-spin" />
                <div className="text-xs font-bold mt-1">
                  Waiting for payment... submit your proof to confirm
                </div>
              </div>
            </div>

            {/* Bottom Submit Screenshot Button */}
            <div className="pt-4">
              <button
                id="btn-qr-submit-proof"
                onClick={() => setCurrentPage('proof')}
                className="w-full py-4 px-4 rounded-2xl bg-[#00c26f] hover:bg-[#00ad63] active:scale-[0.99] text-white font-bold transition-all shadow-lg shadow-[#00c26f]/25 flex items-center justify-between cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <ArrowUp className="w-5 h-5 text-white stroke-[2.5]" />
                </div>

                <div className="text-center">
                  <div className="text-base font-extrabold tracking-wide leading-tight">
                    Submit Screenshot
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-100/90 leading-tight">
                    After Payment
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 3: SCREENSHOT UPLOAD (Exact match to Screenshot 2) */}
        {/* ======================================================== */}
        {currentPage === 'proof' && (
          <div className="p-5 sm:p-7 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Back to QR link */}
              <button
                onClick={() => setCurrentPage('qr')}
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors pb-3"
              >
                ← Back to QR
              </button>

              {/* Payment Confirmation Small Orange Label */}
              <div className="text-[11px] font-extrabold tracking-widest text-[#f97316] uppercase mt-2">
                PAYMENT CONFIRMATION
              </div>

              {/* Main Heading */}
              <h2 className="text-2xl sm:text-[28px] font-black text-white mt-1">
                Screenshot Upload करें
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Payment ke baad Screenshot Upload करो.
              </p>

              {/* Upload Field */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white">
                    Screenshot Upload करें
                  </label>
                  <span className="text-xs text-slate-400 font-medium">
                    (required)
                  </span>
                </div>

                {/* Custom File Input Container */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3 rounded-xl bg-[#080d1a] border border-[#1e293b] hover:border-slate-500 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 group-hover:bg-slate-700 transition-colors shrink-0"
                    >
                      Choose File
                    </button>
                    <span className="text-xs text-slate-300 truncate">
                      {screenshotFile ? screenshotFile.name : 'No file chosen'}
                    </span>
                  </div>
                  {screenshotPreview && (
                    <img
                      src={screenshotPreview}
                      alt="Thumbnail preview"
                      className="w-8 h-8 rounded object-cover border border-slate-600 shrink-0"
                    />
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="text-[11px] text-slate-400 font-medium">
                  JPG, PNG or WebP, up to 5 MB.
                </div>

                {/* Optional Manual UTR entry to assist AI verification */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>12-Digit UPI UTR / Ref No.</span>
                    <span className="text-[10px] text-slate-400 font-normal">वैकल्पिक / Optional</span>
                  </label>
                  <input
                    type="text"
                    value={userUtr}
                    onChange={(e) => setUserUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                    maxLength={16}
                    placeholder="उदा. 423456789012"
                    className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl bg-[#080d1a] border border-[#1e293b] text-white text-xs font-mono focus:border-amber-500 focus:outline-none placeholder:text-slate-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    स्क्रीनशॉट के साथ UTR देने पर AI 100% सटीकता से तुरंत अनलॉक करता है।
                  </p>
                </div>

                {uploadError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Action Button with AI Auto-Verify notice */}
              <div className="mt-5">
                <button
                  id="btn-upload-screenshot-confirm"
                  onClick={handleSubmitProof}
                  disabled={isUploading || !screenshotPreview}
                  className="w-full py-4 px-4 rounded-2xl bg-[#ff5500] hover:bg-[#e04b00] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm transition-all shadow-lg shadow-[#ff5500]/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-center text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                      <span>⚡ AI द्वारा UTR, नाम, तारीख और अमाउंट चेक किया जा रहा है...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Screenshot Verify करें (Instant Auto-Check) →</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Warning Notice below button */}
              <p className="text-[11px] leading-relaxed text-slate-400 text-center mt-3 max-w-sm mx-auto font-medium">
                AI स्क्रीनशॉट का UTR, रिसीवर का नाम, तारीख और अमाउंट मैच करके तुरंत ऑटो-वेरीफाई करता है।
              </p>

              {/* Direct Helpline Assistant Bar */}
              <div className="mt-3.5 p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-medium text-[11px]">
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>स्क्रीनशॉट भेजने में कोई दिक्कत?</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenWhatsAppHelpline('स्क्रीनशॉट अपलोड में समस्या')}
                  className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <span>व्हाट्सएप हेल्पलाइन</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 4: MANUAL REVIEW (Exact match to Screenshot 4 + Helpline) */}
        {/* ======================================================== */}
        {currentPage === 'manual_review' && (
          <div className="p-5 sm:p-7 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Top Circular Badge with "V" */}
              <div className="flex justify-center pt-2">
                <div className="w-14 h-14 rounded-full bg-[#111c33] border border-[#2b3e66] flex items-center justify-center shadow-lg">
                  <span className="text-xl font-black text-white font-serif">V</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center mt-3">
                <div className="text-[11px] font-extrabold tracking-widest text-[#f97316] uppercase">
                  UPI PAYMENT CHECK
                </div>
                <h2 className="text-2xl font-black text-white mt-1">
                  Manual review required
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  {reviewReason || 'Queued for manual review: could not clearly read successful payment status, a clear payment amount, receipt date and time.'}
                </p>
              </div>

              {/* Verification window progress card */}
              <div className="mt-4 p-4 rounded-2xl bg-[#0e1628] border border-[#1e293b] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Verification window</span>
                  <span className="text-xs font-bold text-[#f97316]">Manual Review</span>
                </div>

                {/* Shimmering Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-3/5 rounded-full animate-pulse" />
                </div>

                <div className="text-[11px] text-slate-400">
                  The latest verification state is shown below.
                </div>
              </div>

              {/* Order Info Rows */}
              <div className="mt-3.5 p-3.5 rounded-2xl bg-[#0e1628] border border-[#1e293b] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Order</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-white">
                      {orderData?.order.orderId || 'VVV-54DC1E9C9A1C'}
                    </span>
                    <button
                      onClick={handleCopyOrderId}
                      className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                      title="Copy Order ID"
                    >
                      {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Amount</span>
                  <span className="font-bold text-white">{amountDisplay}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="font-bold text-[#f97316]">Manual Review</span>
                </div>
              </div>

              {/* Highlighted Queue Card with rotating circular icon */}
              <div className="mt-3.5 p-3.5 rounded-2xl bg-[#0e1628] border border-[#233554] text-center space-y-2">
                <div className="flex justify-center">
                  <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Your payment proof is in the manual queue.
                </h3>

                <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto">
                  {reviewReason || 'Queued for manual review: could not clearly read successful payment status, a clear payment amount, receipt date and time.'}
                </p>
              </div>

              {/* ======================================================== */}
              {/* HELPLINE & WHATSAPP CARD FOR SCREENSHOT SUBMISSION */}
              {/* ======================================================== */}
              <div className="mt-3.5 p-4 rounded-2xl bg-gradient-to-br from-[#062419] to-[#0c1a2e] border-2 border-emerald-500/40 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-400">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                      <span>आधिकारिक हेल्पलाइन सहायता</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                        24x7 Active
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      अगर आप तुरंत अनलॉक चाहते हैं, तो नीचे दिए गए व्हाट्सएप हेल्पलाइन नंबर पर अपना पेमेंट स्क्रीनशॉट भेजें।
                    </p>
                  </div>
                </div>

                {/* Big WhatsApp Send Screenshot Button */}
                <button
                  id="btn-whatsapp-manual-review"
                  onClick={() => handleOpenWhatsAppHelpline(reviewReason || undefined)}
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-[#25D366]/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-white shrink-0" />
                  <span>WhatsApp पर स्क्रीनशॉट भेजें (Send on WhatsApp)</span>
                </button>

                {/* Helpline Phone Number & Call / Copy buttons */}
                <div className="flex items-center justify-between pt-1 text-[11px] border-t border-emerald-500/20">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-mono font-bold">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{helplineNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyHelpline}
                      className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedHelpline ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHelpline ? 'कॉपी हुआ' : 'कॉपी नंबर'}</span>
                    </button>
                    <a
                      href={`tel:${cleanHelpline}`}
                      className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>कॉल करें</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Re-upload Screenshot option */}
              <div className="mt-3">
                <button
                  id="btn-reupload-from-manual"
                  onClick={() => {
                    setScreenshotPreview(null);
                    setScreenshotFile(null);
                    setUserUtr('');
                    setUploadError(null);
                    setCurrentPage('proof');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#131d33] hover:bg-[#1a2846] border border-[#233554] text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>गलत स्क्रीनशॉट चला गया? दोबारा सही स्क्रीनशॉट चुनें</span>
                </button>
              </div>

              {/* Safe to close disclaimer */}
              <p className="text-[11px] text-slate-500 text-center mt-3">
                You can safely close this page. Duplicate confirmations are handled automatically.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 5: REJECTED SCREEN (With Helpline & WhatsApp Proof) */}
        {/* ======================================================== */}
        {currentPage === 'rejected' && (
          <div className="p-5 sm:p-7 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Top Circular Badge with Red X */}
              <div className="flex justify-center pt-2">
                <div className="w-14 h-14 rounded-full bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/20">
                  <XCircle className="w-8 h-8" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="text-center mt-3">
                <div className="text-[11px] font-extrabold tracking-widest text-rose-400 uppercase">
                  PAYMENT UNVERIFIED / REJECTED
                </div>
                <h2 className="text-2xl font-black text-white mt-1">
                  पेमेंट अस्वीकार (Payment Rejected)
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  आपका भेजा गया स्क्रीनशॉट या UTR बैंक से वेरिफाई नहीं हो सका।
                </p>
              </div>

              {/* Rejection Reason Notice */}
              <div className="mt-3.5 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>अस्वीकार का कारण (Reason):</span>
                </div>
                <p className="text-rose-200/90 font-medium pl-5 text-[11px] leading-relaxed">
                  {rejectionNote || reviewReason || 'स्क्रीनशॉट में सही UTR या सफल भुगतान नहीं मिला, अथवा अमाउंट बैंक खाते से मेल नहीं खाया।'}
                </p>
              </div>

              {/* Order Info Rows */}
              <div className="mt-3 p-3.5 rounded-2xl bg-[#0e1628] border border-[#1e293b] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Order ID</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-white">
                      {orderData?.order.orderId || 'VVV-ORDER'}
                    </span>
                    <button
                      onClick={handleCopyOrderId}
                      className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                      title="Copy Order ID"
                    >
                      {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Amount</span>
                  <span className="font-bold text-white">{amountDisplay}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="font-bold text-rose-400">अस्वीकार (Rejected)</span>
                </div>
              </div>

              {/* Primary Helpline & WhatsApp Section */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-[#062419] to-[#0c1a2e] border-2 border-emerald-500/50 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0 text-emerald-400">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                      <span>हेल्पलाइन पर स्क्रीनशॉट भेजें</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                        Help Desk
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      यदि आपके खाते से पैसे कट गए हैं, तो कृपया स्क्रीनशॉट हमारे हेल्पलाइन नंबर पर भेजें। हमारी टीम तुरंत चेक करके आपका VIP अनलॉक कर देगी।
                    </p>
                  </div>
                </div>

                {/* Big WhatsApp Send Screenshot Button */}
                <button
                  id="btn-whatsapp-rejected-page"
                  onClick={() => handleOpenWhatsAppHelpline(rejectionNote || reviewReason || 'अस्वीकार हुआ')}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-white shrink-0" />
                  <span>WhatsApp पर स्क्रीनशॉट भेजें (Send on WhatsApp)</span>
                </button>

                {/* Helpline Phone Number */}
                <div className="flex items-center justify-between pt-1 text-[11px] border-t border-emerald-500/20">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-mono font-bold">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{helplineNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyHelpline}
                      className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedHelpline ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHelpline ? 'कॉपी हुआ' : 'नंबर कॉपी करें'}</span>
                    </button>
                    <a
                      href={`tel:${cleanHelpline}`}
                      className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>कॉल करें</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Re-upload or Pay Again */}
              <div className="mt-4 space-y-2">
                <button
                  id="btn-retry-upload-proof"
                  onClick={() => {
                    setScreenshotPreview(null);
                    setScreenshotFile(null);
                    setUserUtr('');
                    setUploadError(null);
                    setCurrentPage('proof');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#ff5500] hover:bg-[#e04b00] active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#ff5500]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>नया सही स्क्रीनशॉट अपलोड करें (Upload New Screenshot)</span>
                </button>

                <button
                  onClick={() => setCurrentPage('qr')}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>← दोबारा QR कोड से भुगतान करें</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 5: PAYMENT SUCCESS (Unlocks VIP Content) */}
        {/* ======================================================== */}
        {currentPage === 'success' && (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center overflow-y-auto space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 tracking-wider uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>PAYMENT VERIFIED</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">
                Payment Successful
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                आपका पेमेंट सफलतापूर्वक वेरिफ़ाई हो गया है।
              </p>
              {isAutoVerified && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>⚡ AI ऑटो-वेरिफाइड: UTR, नाम, तारीख और अमाउंट मैच हुआ!</span>
                </div>
              )}
            </div>

            <div className="w-full p-4 rounded-2xl bg-[#0e1628] border border-[#1e293b] text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono font-bold text-white">{orderData?.order.orderId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-emerald-400">{amountDisplay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-400">PAID & UNLOCKED</span>
              </div>
            </div>

            <button
              id="btn-access-unlocked-vip"
              onClick={() => {
                onSuccess(item);
                onClose();
              }}
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>VIP कंटेंट अभी देखें (View Content) →</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
