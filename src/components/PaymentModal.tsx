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
  Lock,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  HelpCircle,
  FileCheck,
  Zap,
  Download,
  Upload,
  Camera,
  Trash2,
  User,
  Phone,
  Edit3,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  CreditCard
} from 'lucide-react';

interface PaymentModalProps {
  item: MediaItem | null;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess: (item: MediaItem) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  item,
  isOpen = true,
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

  const [loading, setLoading] = useState(true);
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
  const pollingRef = useRef<any>(null);

  // Customer Personal Details (Name & 10-digit WhatsApp Phone)
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Load existing profile if available
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

  // Initialize Order Instantly
  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    setError(null);
    setLoading(true);

    const savedUser = getStoredUserProfile();
    const initName = savedUser?.name || '';
    const initPhone = savedUser?.phone || '';

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
          setError(err.message || 'पेमेंट इनिशियलाइज़ करने में समस्या हुई। कृपया पुनः प्रयास करें।');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [item]);

  // Polling for automated payment confirmation
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
          if (item) {
            const validTok = statusRes.accessToken || `tok_paid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            saveAccessToken(item.id, validTok);
          }
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#10b981', '#6366f1', '#ec4899', '#f59e0b']
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

  if (!item || !isOpen) return null;

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
    link.download = `UPI-QR-${item.id}.png`;
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
      setDetailsError('कृपया अपना नाम दर्ज करें (Please enter your full name).');
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
          if (item) {
            const validTok = res.order?.accessToken || `tok_paid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            saveAccessToken(item.id, validTok);
          }
          confetti({
            particleCount: 160,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#10b981', '#3b82f6', '#ec4899', '#f59e0b']
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
        if (item) {
          const validTok = res.order?.accessToken || `tok_paid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          saveAccessToken(item.id, validTok);
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Main Checkout Container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-200">
        
        {/* Professional Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
                  सुरक्षित UPI पेमेंट (Secure Checkout)
                </h3>
                <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  256-Bit SSL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>100% सुरक्षित व गोपनीय</span>
                <span>•</span>
                <span>तुरंत VIP अनलॉक</span>
              </p>
            </div>
          </div>

          <button
            id="payment-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto space-y-4">
          
          {error ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
              <h4 className="text-base font-bold text-slate-900">भुगतान आरंभ करने में समस्या हुई</h4>
              <p className="text-xs text-slate-600 max-w-xs mt-1">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  createOrder(item.id, item, userName, userPhone).then((res) => setOrderData(res));
                }}
                className="mt-4 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors shadow-md cursor-pointer"
              >
                पुनः प्रयास करें (Try Again)
              </button>
            </div>

          ) : paymentStatus === 'waiting_verification' ? (

            /* WAITING VERIFICATION STATE */
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-400 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <FileCheck className="w-10 h-10 text-amber-600 animate-pulse" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900">
                  पेमेंट वेरिफिकेशन प्रगति पर है ⏳
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm font-medium">
                  आपका UTR <span className="font-mono font-bold text-emerald-700">#{utrNumber}</span> प्राप्त हो गया है।
                </p>
                {userName && (
                  <p className="text-xs text-slate-700 font-bold mt-1">
                    👤 VIP सदस्य: {userName} (+91 {userPhone})
                  </p>
                )}
              </div>

              <div className="w-full p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-amber-900/70 font-semibold">ऑर्डर आईडी:</span>
                  <span className="font-mono font-bold text-amber-950">{orderData?.order.orderId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-900/70 font-semibold">भुगतान राशि:</span>
                  <span className="font-bold text-amber-950">{formatINR(item.price)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 text-center font-medium space-y-2.5 w-full">
                <div>⚡ <strong>कृपया 1-2 मिनट प्रतीक्षा करें।</strong> कन्फर्म होते ही स्क्रीन पर फुल फोटो अपने आप खुल जाएगी।</div>
                
                <a
                  href={`https://wa.me/639465507887?text=${encodeURIComponent(`Hello Ruma! Maine Payment kar diya hai.\n\n📦 Order ID: ${orderData?.order.orderId || ''}\n💰 Amount: ₹${item.price}\n🔑 UTR: ${utrNumber}\n👤 Name: ${userName || ''} (+91 ${userPhone || ''})\n\nKripya turant approve karein!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-transform active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>व्हाट्सएप पर स्क्रीनशॉट भेजकर तुरंत अनलॉक करवाएं</span>
                </a>
              </div>

              <button
                onClick={() => setPaymentStatus('pending')}
                className="text-xs text-slate-600 hover:text-emerald-700 font-bold underline cursor-pointer"
              >
                ← UTR नंबर बदलें या दोबारा प्रयास करें
              </button>
            </div>

          ) : paymentStatus === 'paid' ? (
            
            /* SUCCESS STATE WITH CLEAR UNBLURRED PHOTO */
            <div className="py-4 sm:py-6 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
              <div className="relative mb-3">
                <div className="absolute -inset-3 rounded-full bg-emerald-400 opacity-40 blur-lg animate-pulse" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                🎉 भुगतान सफल रहा! (VIP Unlocked)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm font-medium">
                नमस्ते <strong className="text-slate-900">{userName || 'VIP Member'}</strong>, आपका पेमेंट <strong className="text-emerald-600 font-bold">{formatINR(item.price)}</strong> सत्यापित हो चुका है।
              </p>

              {/* Unblurred Clear Photo Showcase */}
              <div className="relative my-4 w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-xl shadow-emerald-500/20 bg-slate-950 flex items-center justify-center">
                <img
                  src={item.mediaUrl || item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-300 select-none"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-center">
                  <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-400/40 inline-flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    100% UNBLURRED ULTRA HD
                  </span>
                </div>
              </div>

              <button
                id="btn-unlock-content-now"
                onClick={() => {
                  if (item) {
                    const validTok = orderData?.order?.accessToken || `tok_paid_${Date.now()}`;
                    saveAccessToken(item.id, validTok);
                  }
                  onSuccess(item);
                }}
                className="w-full mt-2 py-4 px-6 rounded-2xl text-sm sm:text-base font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 cursor-pointer transition-transform active:scale-95"
              >
                <span>🔥 अभी फ़ोटो फुल स्क्रीन में देखें (View Full Photo)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          ) : (

            /* PROFESSIONAL ACTIVE PAYMENT STATE */
            <div className="space-y-4">
              
              {/* Clean Order Summary Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-slate-300 shrink-0 bg-slate-900 shadow-xs">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover filter blur-[4px] scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.type === 'video' ? 'Full HD Video' : 'Ultra HD Photoset'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 hidden sm:inline">
                        • 0-सेकंड डिलीवरी
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate mt-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      एक्सक्लूसिव अनसेंसर्ड VIP कंटेंट
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 line-through block font-medium">
                    ₹{originalPrice}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-950 font-display block leading-none">
                    {formatINR(item.price)}
                  </span>
                  <span className="inline-block mt-1 text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    ऑफर लागू
                  </span>
                </div>
              </div>

              {/* STEP 1: CUSTOMER DETAILS (NAME & 10-DIGIT WHATSAPP NUMBER) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                      ग्राहक विवरण (Customer Details)
                    </h5>
                  </div>
                  {hasSavedDetails && !showEditDetails && (
                    <button
                      type="button"
                      onClick={() => setShowEditDetails(true)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>बदलें (Edit)</span>
                    </button>
                  )}
                </div>

                {hasSavedDetails && !showEditDetails ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{userName}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>+91 {userPhone}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      सत्यापित ✓
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          आपका नाम (Your Full Name) *
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
                          className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 font-medium outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          व्हाट्सएप नंबर (10 Digits) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
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
                            className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl pl-11 pr-3 py-2 text-xs font-mono font-medium text-slate-900 placeholder-slate-400 outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {showEditDetails && hasSavedDetails && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowEditDetails(false)}
                          className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold shadow cursor-pointer hover:bg-slate-800"
                        >
                          सेव करें ✓
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {detailsError && (
                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{detailsError}</span>
                  </div>
                )}
              </div>

              {/* STEP 2: SCAN QR CODE TO PAY */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>QR कोड स्कैन करके भुगतान करें (Scan QR to Pay)</span>
                    </h5>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span className="font-mono">{formatTimer(timeLeft)}</span>
                  </div>
                </div>

                {/* QR Code Presentation */}
                <div className="flex flex-col items-center text-center space-y-3 pt-1">
                  <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-md inline-block relative">
                    {orderData?.qrDataUrl ? (
                      <div className="relative group">
                        <img
                          src={orderData.qrDataUrl}
                          alt="UPI Dynamic QR Code"
                          className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                        />
                        <div className="hot-scanner-line" />
                      </div>
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-slate-600" />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium max-w-xs">
                    किसी भी ऐप <strong>(PhonePe, Google Pay, Paytm, BHIM)</strong> से यह QR कोड स्कैन करके <strong className="text-emerald-700 font-bold">{formatINR(item.price)}</strong> पे करें।
                  </p>

                  <div className="flex items-center gap-2 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-colors cursor-pointer active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>QR कोड डाउनलोड करें (Save QR)</span>
                    </button>
                  </div>

                  <div className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-left">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">
                        Payee UPI ID
                      </span>
                      <p className="font-mono font-bold text-slate-900 text-xs truncate">
                        {orderData?.order.upiId || 'rima11q@ptyes'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1 hover:bg-slate-100 cursor-pointer shadow-xs active:scale-95 shrink-0"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">कॉपी हुआ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy UPI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 3: 12-DIGIT UTR VERIFICATION & OPTIONAL SCREENSHOT */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                      3
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                      पेमेंट कन्फर्म करें (Enter 12-Digit UTR No.)
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUtrHelp(!showUtrHelp)}
                    className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>UTR कहाँ देखें?</span>
                  </button>
                </div>

                {showUtrHelp && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1.5 animate-in fade-in duration-150">
                    <div className="font-bold text-slate-900">📱 UTR / UPI Transaction Reference No. खोजने का तरीका:</div>
                    <ul className="list-disc list-inside space-y-1 pl-1">
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
                      placeholder="उदा. 423812345678 (12 अंक)"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl px-3.5 py-3 text-sm font-mono font-bold text-slate-900 tracking-wider outline-none transition-colors"
                    />
                    <span className={`absolute right-3.5 top-3.5 text-[11px] font-bold ${utrNumber.length === 12 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {utrNumber.length}/12 {utrNumber.length === 12 ? '✓' : 'अंक'}
                    </span>
                  </div>

                  {/* Optional Screenshot Upload */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        <span>पेमेंट रसीद / स्क्रीनशॉट (वैकल्पिक / Optional):</span>
                      </label>
                      <span className="text-[10px] font-semibold text-slate-500">
                        फास्ट वेरिफिकेशन
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
                      <div className="py-2.5 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        <span>स्क्रीनशॉट प्रोसेस हो रहा है...</span>
                      </div>
                    ) : screenshotUrl ? (
                      <div className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={screenshotUrl}
                            alt="Receipt"
                            className="w-9 h-9 object-cover rounded-md border border-slate-200 shrink-0"
                          />
                          <span className="text-xs font-bold text-emerald-700 truncate">
                            स्क्रीनशॉट संलग्न है ✓
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveScreenshot}
                          className="p-1 rounded-md text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => screenshotInputRef.current?.click()}
                        className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 hover:border-emerald-500 bg-white text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-medium"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>स्क्रीनशॉट अपलोड करें (गैलरी से)</span>
                      </button>
                    )}
                  </div>

                  {utrError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{utrError}</span>
                    </div>
                  )}

                  {/* Primary CTA Button */}
                  <button
                    id="btn-verify-utr-submit"
                    type="submit"
                    disabled={isSubmittingUtr || utrNumber.length !== 12}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all ${
                      utrNumber.length === 12
                        ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer active:scale-[0.99]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmittingUtr ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>सत्यापित किया जा रहा है...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>पेमेंट वेरिफाई करें & अनलॉक करें (Verify & Unlock)</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Dev Simulation Sandbox */}
              {orderData?.mode === 'sandbox_simulator' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900">🛠️ Admin Sandbox Test Mode</span>
                  <button
                    onClick={handleTestSimulate}
                    disabled={isSimulating}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] cursor-pointer hover:bg-amber-700"
                  >
                    {isSimulating ? 'Testing...' : '⚡ Test Unlock'}
                  </button>
                </div>
              )}

              {/* WhatsApp Support Helper */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="font-bold text-slate-900 text-xs leading-tight">भुगतान में कोई सहायता चाहिए?</h6>
                    <p className="text-[10px] text-slate-500">व्हाट्सएप पर 24/7 तत्काल सहायता</p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/639465507887?text=${encodeURIComponent(`Hello! Mujhe payment karne me help chahiye.\nItem: ${item.title} (₹${item.price})\nOrder ID: ${orderData?.order.orderId || ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>व्हाट्सएप चैट</span>
                </a>
              </div>

              {/* Security & Privacy Badges */}
              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 pt-1 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  256-Bit SSL सुरक्षित
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  NPCI UPI अनुकूल
                </span>
                <span>•</span>
                <span>100% गोपनीय व तुरंत डिलीवरी</span>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
