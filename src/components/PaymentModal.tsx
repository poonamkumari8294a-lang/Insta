import React, { useState, useEffect, useRef } from 'react';
import { MediaItem, OrderItem } from '../types';
import {
  createOrder,
  checkOrderStatus,
  submitPaymentUtr,
  devSimulatePayment,
  formatINR,
  saveAccessToken,
  getStoredUserProfile,
  saveStoredUserProfile,
  saveVipLeadToCloud,
  updateOrderCustomer
} from '../utils/api';
import { compressImageFile } from '../utils/mediaUpload';
import confetti from 'canvas-confetti';
import {
  X,
  QrCode,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Lock,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  HelpCircle,
  FileCheck,
  Flame,
  Zap,
  Crown,
  Eye,
  Download,
  Upload,
  Camera,
  Trash2,
  Star,
  User,
  Phone,
  Edit3
} from 'lucide-react';

interface PaymentModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onSuccess: (item: MediaItem) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  item,
  onClose,
  onSuccess,
}) => {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<OrderItem['status']>('pending');
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 mins countdown
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [showUtrHelp, setShowUtrHelp] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [isProcessingScreenshot, setIsProcessingScreenshot] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const [recentBuyersCount] = useState(() => Math.floor(Math.random() * 24) + 48);
  const pollingRef = useRef<any>(null);

  // Mandatory Customer Personal Details (Name & 10-digit Phone)
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    const saved = getStoredUserProfile();
    if (saved) {
      if (saved.name) setUserName(saved.name);
      if (saved.phone) setUserPhone(saved.phone);
    }
  }, []);

  const handleScreenshotSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingScreenshot(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1280, 1280, 0.82);
      setScreenshotUrl(compressedDataUrl);
      setScreenshotName(file.name);
    } catch (err: any) {
      console.error('Screenshot compression error:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotUrl(reader.result as string);
        setScreenshotName(file.name);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingScreenshot(false);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotUrl(null);
    setScreenshotName(null);
    if (screenshotInputRef.current) {
      screenshotInputRef.current.value = '';
    }
  };

  // Initialize Order Instantly (0ms response)
  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    setError(null);

    const savedUser = getStoredUserProfile();
    const initName = savedUser?.name || '';
    const initPhone = savedUser?.phone || '';

    // Call instant order generator with item override for 0ms loading
    createOrder(item.id, item, initName, initPhone)
      .then((res) => {
        if (isMounted) {
          setOrderData(res);
          setPaymentStatus(res.order.status);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'पेमेंट इनिशियलाइज़ करने में त्रुटि हुई');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [item]);

  // Polling for status
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
          if (statusRes.accessToken && item) {
            saveAccessToken(item.id, statusRes.accessToken);
          }
          confetti({
            particleCount: 140,
            spread: 100,
            origin: { y: 0.55 },
            colors: ['#ec4899', '#f43f5e', '#fbbf24', '#34d399', '#60a5fa']
          });
          clearInterval(pollingRef.current);
        } else if (statusRes.status === 'expired' || statusRes.status === 'failed') {
          setPaymentStatus(statusRes.status);
          clearInterval(pollingRef.current);
        } else if (statusRes.status === 'waiting_verification') {
          setPaymentStatus('waiting_verification');
        }
      } catch (err) {
        console.error('Polling check error', err);
      }
    }, 2500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [orderData, paymentStatus, item]);

  // Countdown timer
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

  if (!item) return null;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    if (!orderData?.order.upiId) return;
    navigator.clipboard.writeText(orderData.order.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
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
    link.download = `VIP-UPI-QR-${item.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // UTR Submission with validation & Personal Lead capture
  const handleSubmitUtr = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderData || isSubmittingUtr) return;

    setDetailsError(null);
    setUtrError(null);

    // Validate Name & 10-digit Phone
    const cleanName = userName.trim();
    const cleanPhone = userPhone.trim().replace(/[^0-9]/g, '');

    if (!cleanName || cleanName.length < 2) {
      setDetailsError('कृपया अपना पूरा नाम दर्ज करें।');
      setShowEditDetails(true);
      return;
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      setDetailsError('कृपया सही 10-अंकों का व्हाट्सएप मोबाइल नंबर दर्ज करें।');
      setShowEditDetails(true);
      return;
    }

    const cleanUtr = utrNumber.trim().replace(/[^0-9]/g, '');

    if (cleanUtr.length !== 12) {
      setUtrError('कृपया सही 12-अंकों का UPI UTR / Transaction No. डालें (Exact 12 digits required).');
      return;
    }

    if (/^(\d)\1{11}$/.test(cleanUtr)) {
      setUtrError('अमान्य UTR नंबर: सभी 12 अंक एक जैसे नहीं हो सकते।');
      return;
    }

    setIsSubmittingUtr(true);

    // Save profile locally & to lead cloud
    saveStoredUserProfile({ name: cleanName, phone: cleanPhone });
    saveVipLeadToCloud({
      name: cleanName,
      phone: cleanPhone,
      contentId: item.id,
      contentTitle: item.title,
      amount: item.price
    });
    updateOrderCustomer(orderData.order.orderId, cleanName, cleanPhone);

    try {
      const res = await submitPaymentUtr(
        orderData.order.orderId,
        cleanUtr,
        undefined,
        screenshotUrl || undefined,
        cleanName,
        cleanPhone
      );

      if (res.success) {
        if (res.status === 'paid') {
          setPaymentStatus('paid');
          if (res.order?.accessToken && item) {
            saveAccessToken(item.id, res.order.accessToken);
          }
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#ec4899', '#f43f5e', '#fbbf24', '#34d399']
          });
        } else {
          setPaymentStatus('waiting_verification');
        }
      } else {
        setUtrError(res.error || 'सत्यापन विफल रहा। कृपया सही UTR नंबर डालें।');
      }
    } catch (err: any) {
      setUtrError(err.message || 'सत्यापन विफल रहा');
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  // Safe Sandbox Testing Trigger
  const handleTestSimulate = async () => {
    if (!orderData) return;
    setIsSimulating(true);
    try {
      const res = await devSimulatePayment(orderData.order.orderId);
      if (res.success) {
        setPaymentStatus('paid');
        if (res.order.accessToken && item) {
          saveAccessToken(item.id, res.order.accessToken);
        }
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      alert(err.message || 'Simulation error');
    } finally {
      setIsSimulating(false);
    }
  };

  const originalPrice = Math.max(item.price * 3, item.price + 150);
  const hasSavedDetails = userName.trim().length >= 2 && userPhone.trim().replace(/[^0-9]/g, '').length === 10;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Modal Card with Seductive Glowing Border */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border-2 border-pink-400 overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-200">
        
        {/* Top Alluring Offer Banner with Flame Pulse */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 px-4 py-2.5 text-white flex items-center justify-between text-xs font-black shadow-inner">
          <div className="flex items-center gap-1.5 animate-pulse">
            <Flame className="w-4 h-4 text-yellow-300 animate-flame" />
            <span className="tracking-wide uppercase text-[11px] sm:text-xs">
              🔥 VIP UNCENSORED ACCESS • 85% छूट केवल आज!
            </span>
          </div>
          <div className="flex items-center gap-1 bg-black/40 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span>{recentBuyersCount} लोग अभी अनलॉक कर रहे हैं</span>
          </div>
        </div>

        {/* Header with Title & Close */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-purple-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/30">
              <Crown className="w-5 h-5 text-yellow-200" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-purple-950 font-display flex items-center gap-1.5">
                <span>VIP 1-क्लिक तुरंत UPI अनलॉक</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  0-Sec Fast
                </span>
              </h3>
              <p className="text-[11px] text-purple-900/70 font-semibold">
                बिना इंतज़ार किए तुरंत अनलॉक करें • 100% प्राइवेट
              </p>
            </div>
          </div>

          <button
            id="payment-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-purple-50 text-purple-900/60 hover:text-purple-950 hover:bg-pink-100 border border-purple-100 transition-colors shadow-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto space-y-4">
          
          {error ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
              <h4 className="text-base font-bold text-purple-950">भुगतान आरंभ करने में त्रुटि</h4>
              <p className="text-xs text-purple-900/70 max-w-xs mt-1">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  createOrder(item.id, item, userName, userPhone).then((res) => setOrderData(res));
                }}
                className="mt-4 px-5 py-2.5 rounded-2xl bg-pink-600 text-white text-xs font-bold hover:bg-pink-500 transition-colors shadow-md"
              >
                पुनः प्रयास करें (Try Again)
              </button>
            </div>
          ) : paymentStatus === 'waiting_verification' ? (

            /* WAITING VERIFICATION STATE */
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <FileCheck className="w-10 h-10 text-amber-600 animate-pulse" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-purple-950 font-display">
                  पेमेंट वेरिफिकेशन प्रगति पर है ⏳
                </h4>
                <p className="text-xs text-purple-900/80 mt-1 max-w-sm font-medium">
                  आपका 12-अंकों का UTR <span className="font-mono font-bold text-pink-700">#{utrNumber}</span> प्राप्त हो गया है।
                </p>
                {userName && (
                  <p className="text-xs text-purple-950 font-bold mt-1">
                    👤 VIP खरीदार: {userName} (+91 {userPhone})
                  </p>
                )}
              </div>

              <div className="w-full p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-amber-900/70 font-semibold">ऑर्डर आईडी:</span>
                  <span className="font-mono font-bold text-amber-950">{orderData?.order.orderId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-900/70 font-semibold">भुगतान राशि:</span>
                  <span className="font-bold text-amber-950">{formatINR(item.price)}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 text-xs text-purple-900/80 text-center font-medium">
                ⚡ <strong>कृपया इस स्क्रीन पर बने रहें।</strong> कन्फर्म होते ही आपका VIP कंटेंट तुरंत स्क्रीन पर खुल जाएगा।
              </div>

              <button
                onClick={() => setPaymentStatus('pending')}
                className="text-xs text-purple-700 hover:text-pink-600 font-bold underline cursor-pointer"
              >
                ← UTR नंबर बदलें या दोबारा प्रयास करें
              </button>
            </div>

          ) : paymentStatus === 'paid' ? (
            
            /* SUCCESS STATE */
            <div className="py-6 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
              <div className="relative mb-3">
                <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 opacity-60 blur-lg animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-emerald-100 border-3 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-purple-950 font-display">
                🎉 अनलॉक सफल रहा! (VIP Unlocked)
              </h3>
              <p className="text-xs sm:text-sm text-purple-900/80 mt-1 max-w-sm font-medium">
                नमस्ते <strong className="text-pink-600">{userName || 'VIP Member'}</strong>, आपका पेमेंट <strong className="text-emerald-600 font-bold">{formatINR(item.price)}</strong> सत्यापित हो चुका है।
              </p>

              <button
                id="btn-unlock-content-now"
                onClick={() => onSuccess(item)}
                className="w-full mt-6 hot-vip-btn py-4 px-6 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 shadow-2xl shadow-rose-600/40 cursor-pointer"
              >
                <span>🔥 अभी देखें & चलाएं (Watch / View Now)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          ) : (

            /* ACTIVE INSTANT PAYMENT STATE */
            <div className="space-y-4">
              
              {/* Seductive VIP Teaser Banner */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-pink-400 bg-gradient-to-br from-purple-950 via-pink-950 to-purple-950 text-white p-3.5 sm:p-4 shadow-xl">
                <div className="relative z-10 flex items-center justify-between gap-3">
                  
                  {/* Media Thumbnail with Blurred Lock */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-pink-400 shrink-0 shadow-lg">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover filter blur-[6px] scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="p-1.5 rounded-full bg-pink-600 text-white shadow-md animate-pulse">
                        <Lock className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="absolute bottom-1 right-1 text-[8px] font-black uppercase bg-rose-600 text-white px-1 rounded">
                      VIP 4K
                    </span>
                  </div>

                  {/* Description & Value Props */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-300/30 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-300" />
                        UNCENSORED
                      </span>
                      <span className="text-[10px] text-pink-300 font-semibold truncate">
                        {item.type === 'video' ? 'Full HD Video' : 'HD Photos Set'}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-black text-white truncate mt-1">
                      {item.title}
                    </h4>

                    <div className="mt-1 flex items-center gap-2 text-[10px] text-pink-200">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-400" /> तुरंत 0-सेकंड एक्सेस
                      </span>
                      <span className="flex items-center gap-1 text-emerald-300">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> 100% सेफ
                      </span>
                    </div>
                  </div>

                  {/* Strikethrough & Hot Price */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-pink-300/80 line-through block font-semibold">
                      ₹{originalPrice}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-yellow-300 font-display block leading-none">
                      {formatINR(item.price)}
                    </span>
                    <span className="inline-block mt-1 text-[9px] font-black uppercase bg-gradient-to-r from-rose-600 to-pink-600 text-white px-1.5 py-0.5 rounded shadow-xs animate-pulse">
                      85% OFF
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 1: MANDATORY USER PERSONAL DATA (NAME & 10-DIGIT MOBILE NUMBER) */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 border-2 border-pink-300 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-pink-600 text-white text-[11px] font-black flex items-center justify-center shadow-sm">
                      1
                    </span>
                    <h5 className="text-xs sm:text-sm font-black text-purple-950 uppercase tracking-tight">
                      अपना नाम & व्हाट्सएप नंबर दर्ज करें (VIP एक्सेस हेतु आवश्यक)
                    </h5>
                  </div>
                  {hasSavedDetails && !showEditDetails && (
                    <button
                      type="button"
                      onClick={() => setShowEditDetails(true)}
                      className="text-[11px] text-pink-700 hover:text-pink-900 font-black underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>बदलें</span>
                    </button>
                  )}
                </div>

                {hasSavedDetails && !showEditDetails ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/90 border border-purple-200 shadow-inner">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-purple-950">{userName}</span>
                          <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.2 rounded-full border border-emerald-300">
                            VIP Active ✓
                          </span>
                        </div>
                        <div className="text-[11px] text-purple-900/70 font-mono font-bold flex items-center gap-1">
                          <Phone className="w-3 h-3 text-pink-600" />
                          <span>+91 {userPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-black text-purple-950 block mb-1 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-pink-600" />
                          <span>आपका नाम (Your Full Name) *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={userName}
                          onChange={(e) => {
                            setUserName(e.target.value);
                            if (detailsError) setDetailsError(null);
                          }}
                          placeholder="उदा. राहुल कुमार"
                          className="w-full bg-white border-2 border-purple-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-xl px-3.5 py-2.5 text-xs text-purple-950 placeholder-purple-900/40 font-bold shadow-xs outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-black text-purple-950 block mb-1 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-pink-600" />
                          <span>व्हाट्सएप मोबाइल नंबर (10 अंक) *</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-purple-900/60 font-mono">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={userPhone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              setUserPhone(val);
                              if (detailsError) setDetailsError(null);
                            }}
                            placeholder="9876543210"
                            className="w-full bg-white border-2 border-purple-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-xl pl-11 pr-3.5 py-2.5 text-xs font-mono font-bold text-purple-950 placeholder-purple-900/40 shadow-xs outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {showEditDetails && hasSavedDetails && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowEditDetails(false)}
                          className="px-3 py-1 bg-pink-600 text-white rounded-lg text-xs font-bold shadow cursor-pointer"
                        >
                          सेव करें ✓
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {detailsError && (
                  <div className="p-2 rounded-xl bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{detailsError}</span>
                  </div>
                )}

                <p className="text-[10px] text-purple-900/60 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>आपकी जानकारी 100% गोपनीय है और सिर्फ VIP डिलीवरी के लिए इस्तेमाल होगी।</span>
                </p>
              </div>

              {/* STEP 2: DYNAMIC QR CODE CONTAINER */}
              <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border-2 border-purple-100 text-center relative overflow-hidden shadow-md">
                
                {/* Header & Urgency Countdown Timer */}
                <div className="flex items-center justify-between w-full mb-3 px-1">
                  <span className="text-xs font-black uppercase text-purple-950 tracking-wide flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-black flex items-center justify-center">2</span>
                    <span>UPI QR कोड स्कैन करके पेमेंट करें:</span>
                  </span>
                  
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold shadow-xs animate-pulse">
                    <Clock className="w-3 h-3 text-rose-600" />
                    <span>समय शेष: <strong className="font-mono text-rose-950">{formatTimer(timeLeft)}</strong></span>
                  </div>
                </div>

                {/* QR Code Container with Seductive Glowing Ring & Scanline */}
                <div className="relative p-1.5 rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-600 to-amber-400 shadow-xl">
                  <div className="p-3 bg-white rounded-[22px] flex flex-col items-center relative overflow-hidden">
                    {orderData?.qrDataUrl ? (
                      <div className="relative group">
                        <img
                          src={orderData.qrDataUrl}
                          alt="UPI Dynamic QR Code"
                          className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-xl"
                        />
                        {/* Laser Scanline */}
                        <div className="hot-scanner-line" />
                      </div>
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-pink-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* 1-Click Download QR Code Button */}
                <div className="flex items-center gap-2 mt-3 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>QR कोड डाउनलोड करें (Save QR)</span>
                  </button>
                </div>

                {/* 1-Click Copy UPI ID */}
                <div className="w-full mt-3 pt-3 border-t border-purple-100 space-y-2 text-left">
                  <div className="p-2.5 rounded-2xl bg-pink-50/80 border border-pink-200 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase text-pink-700 block">
                        Payee UPI ID
                      </span>
                      <p className="font-mono font-black text-xs sm:text-sm text-purple-950 truncate">
                        {orderData?.order.upiId || '6202292319pnb@ybl'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-950 text-white font-black text-xs flex items-center gap-1.5 hover:bg-pink-600 active:scale-95 transition-all shrink-0 cursor-pointer shadow-sm"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">कॉपी हुआ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-pink-400" />
                          <span>Copy UPI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 3: 12-DIGIT UTR NUMBER & SCREENSHOT SUBMISSION */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50/60 to-white border-2 border-purple-300 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs sm:text-sm font-black text-purple-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-black flex items-center justify-center">3</span>
                    <span>पेमेंट के बाद 12-अंकों का UTR No. डालें:</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() => setShowUtrHelp(!showUtrHelp)}
                    className="text-[11px] text-pink-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>UTR कहाँ देखें?</span>
                  </button>
                </div>

                {showUtrHelp && (
                  <div className="p-3 rounded-2xl bg-white border border-purple-200 text-[11px] text-purple-900/80 space-y-1 shadow-inner">
                    <div className="font-bold text-purple-950">📱 <strong>UTR / UPI Ref No. खोजें:</strong></div>
                    <ul className="list-disc list-inside space-y-0.5 pl-1">
                      <li><strong>PhonePe:</strong> हिस्ट्री ➔ पेमेंट विवरण ➔ <strong>"UTR"</strong> (12 अंक)।</li>
                      <li><strong>Google Pay:</strong> लेन-देन विवरण ➔ <strong>"UPI Transaction ID"</strong> (12 अंक)।</li>
                      <li><strong>Paytm:</strong> पासबुक ➔ <strong>"UPI Ref No."</strong> (12 अंक)।</li>
                    </ul>
                  </div>
                )}

                <form onSubmit={handleSubmitUtr} className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={12}
                      value={utrNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setUtrNumber(val);
                        if (utrError) setUtrError(null);
                      }}
                      placeholder="e.g. 423812345678 (12 Digits)"
                      className="w-full bg-white border-2 border-purple-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-mono font-bold text-purple-950 tracking-wider shadow-inner"
                    />
                    <span className={`absolute right-3.5 top-3.5 text-[11px] font-bold ${utrNumber.length === 12 ? 'text-emerald-600 font-black' : 'text-purple-900/50'}`}>
                      {utrNumber.length}/12 {utrNumber.length === 12 ? '✓' : 'अंक'}
                    </span>
                  </div>

                  {/* Screenshot Upload */}
                  <div className="p-3 bg-white rounded-2xl border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-purple-950 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-rose-600" />
                        <span>पेमेंट स्क्रीनशॉट (वैकल्पिक / Optional):</span>
                      </label>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        फास्ट अनलॉक
                      </span>
                    </div>

                    <input
                      ref={screenshotInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleScreenshotSelect}
                      className="hidden"
                    />

                    {isProcessingScreenshot ? (
                      <div className="py-3 px-3 rounded-xl bg-purple-50 text-xs font-bold text-purple-900 flex items-center justify-center gap-2 animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin text-pink-600" />
                        <span>स्क्रीनशॉट प्रोसेस हो रहा है...</span>
                      </div>
                    ) : screenshotUrl ? (
                      <div className="flex items-center justify-between gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={screenshotUrl}
                            alt="Receipt"
                            className="w-10 h-10 object-cover rounded-lg border border-emerald-300 shrink-0"
                          />
                          <span className="text-xs font-bold text-emerald-950 truncate">
                            स्क्रीनशॉट संलग्न है ✓
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveScreenshot}
                          className="p-1.5 rounded-lg bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => screenshotInputRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-purple-300 hover:border-pink-500 bg-purple-50/50 hover:bg-pink-50 text-purple-900 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-pink-600" />
                        <span className="text-xs font-bold">
                          स्क्रीनशॉट अपलोड करें (गैलरी से चुनें)
                        </span>
                      </button>
                    )}
                  </div>

                  {utrError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{utrError}</span>
                    </div>
                  )}

                  <button
                    id="btn-verify-utr-submit"
                    type="submit"
                    disabled={isSubmittingUtr || utrNumber.length !== 12}
                    className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg transition-all ${
                      utrNumber.length === 12
                        ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-emerald-600/30 hover:brightness-110 active:scale-[0.99] cursor-pointer'
                        : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmittingUtr ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>सत्यापित किया जा रहा है...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>सत्यापित करें & अनलॉक करें (Verify & Unlock)</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Dev Simulation */}
              {orderData?.mode === 'sandbox_simulator' && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900">🛠️ Admin Sandbox Test</span>
                  <button
                    onClick={handleTestSimulate}
                    disabled={isSimulating}
                    className="px-2.5 py-1 rounded-xl bg-amber-600 text-white font-bold text-[11px] cursor-pointer"
                  >
                    {isSimulating ? 'Testing...' : '⚡ Test Unlock'}
                  </button>
                </div>
              )}

              {/* Security Guarantee */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-purple-900/60 pt-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit एन्क्रिप्टेड सुरक्षित भुगतान • 100% प्राइवेट व तुरंत डिलीवरी</span>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
