import React, { useState, useEffect, useRef } from 'react';
import { MediaItem, OrderItem } from '../types';
import { createOrder, checkOrderStatus, submitPaymentUtr, devSimulatePayment, formatINR, saveAccessToken } from '../utils/api';
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
  CheckCircle,
  HelpCircle,
  MessageCircle,
  FileCheck,
  Flame,
  Zap,
  Crown,
  Eye,
  Film,
  Image as ImageIcon,
  Layers,
  Star
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
    mode: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<OrderItem['status']>('pending');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins countdown
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [showUtrHelp, setShowUtrHelp] = useState(false);
  const [recentBuyersCount] = useState(() => Math.floor(Math.random() * 18) + 34);
  const pollingRef = useRef<any>(null);

  // Initialize Order on mount
  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    createOrder(item.id)
      .then((res) => {
        if (isMounted) {
          setOrderData(res);
          setPaymentStatus(res.order.status);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to initialize payment order');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [item]);

  // Polling for server-side verification status (Approvals from admin or background checks)
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
          // Trigger celebratory confetti explosion
          confetti({
            particleCount: 120,
            spread: 100,
            origin: { y: 0.55 },
            colors: ['#ec4899', '#a855f7', '#fbbf24', '#34d399', '#60a5fa']
          });
          clearInterval(pollingRef.current);
        } else if (statusRes.status === 'expired' || statusRes.status === 'failed') {
          setPaymentStatus(statusRes.status);
          clearInterval(pollingRef.current);
        } else if (statusRes.status === 'waiting_verification') {
          setPaymentStatus('waiting_verification');
        }
      } catch (err) {
        console.error('Polling check failed', err);
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

  // UTR Submission with validation
  const handleSubmitUtr = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderData || isSubmittingUtr) return;

    const cleanUtr = utrNumber.trim().replace(/[^0-9]/g, '');
    setUtrError(null);

    if (cleanUtr.length !== 12) {
      setUtrError('कृपया सही 12-अंकों का UPI UTR / Transaction No. डालें (Exact 12 digits required).');
      return;
    }

    if (/^(\d)\1{11}$/.test(cleanUtr)) {
      setUtrError('अमान्य UTR नंबर: सभी 12 अंक एक जैसे नहीं हो सकते।');
      return;
    }

    setIsSubmittingUtr(true);

    try {
      const res = await submitPaymentUtr(orderData.order.orderId, cleanUtr);

      if (res.success) {
        if (res.status === 'paid') {
          setPaymentStatus('paid');
          if (res.order?.accessToken && item) {
            saveAccessToken(item.id, res.order.accessToken);
          }
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#ec4899', '#a855f7', '#fbbf24', '#34d399']
          });
        } else {
          // Waiting for admin/bank review
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

  return (
    <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Modal Card with Animated Gradient Border */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border-2 border-pink-300/80 overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-200">
        
        {/* Top Alluring Offer Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 px-4 py-2 text-white flex items-center justify-between text-xs font-black shadow-inner">
          <div className="flex items-center gap-1.5 animate-pulse">
            <Crown className="w-3.5 h-3.5 text-yellow-200" />
            <span className="tracking-wide uppercase text-[11px]">VIP EXCLUSIVE UNLOCK • 75% OFF TODAY</span>
          </div>
          <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
            <Flame className="w-3 h-3 text-yellow-300 animate-bounce" />
            <span>{recentBuyersCount} unlocked today</span>
          </div>
        </div>

        {/* Header with Title & Close */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-purple-100 bg-white/80">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-pink-500/25">
                <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" style={{ animationDuration: '8s' }} />
              </span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-purple-950 font-display flex items-center gap-1.5">
                <span>Instant VIP Checkout</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                  Instant
                </span>
              </h3>
              <p className="text-[11px] text-purple-900/70 font-semibold">
                Direct UPI Transfer • Instant Automatic Token
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
        <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
          
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-pink-600 animate-pulse" />
                </div>
              </div>
              <p className="text-sm font-bold text-purple-950">Generating Secure UPI QR & Pricing...</p>
              <p className="text-xs text-purple-900/70 mt-1 font-medium">Applying exclusive creator discount</p>
            </div>
          ) : error ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
              <h4 className="text-base font-bold text-purple-950">Payment Initialization Failed</h4>
              <p className="text-xs text-purple-900/70 max-w-xs mt-1">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  createOrder(item.id)
                    .then((res) => {
                      setOrderData(res);
                      setLoading(false);
                    })
                    .catch((err) => {
                      setError(err.message);
                      setLoading(false);
                    });
                }}
                className="mt-5 px-5 py-2.5 rounded-2xl bg-pink-600 text-white text-xs font-bold hover:bg-pink-500 transition-colors shadow-md"
              >
                Try Again
              </button>
            </div>
          ) : paymentStatus === 'waiting_verification' ? (

            /* WAITING VERIFICATION / UNDER REVIEW STATE */
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in duration-200 space-y-4">
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
                  Payment Verification in Progress ⏳
                </h4>
                <p className="text-xs text-purple-900/80 mt-1.5 max-w-sm font-medium">
                  आपका UTR नंबर <span className="font-mono font-bold text-pink-700">#{utrNumber || orderData?.order.transactionRef}</span> प्राप्त हो गया है। हम बैंक खाते से इसका मिलान कर रहे हैं।
                </p>
              </div>

              <div className="w-full p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-amber-900/70 font-semibold">Order ID:</span>
                  <span className="font-mono font-bold text-amber-950">{orderData?.order.orderId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-900/70 font-semibold">Amount:</span>
                  <span className="font-bold text-amber-950">{formatINR(item.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-900/70 font-semibold">Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 text-[10px] font-black uppercase">
                    Under Review (जाँच जारी)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 text-xs text-purple-900/80 text-center font-medium">
                ⚡ <strong>कृपया इस स्क्रीन को बंद न करें।</strong> एडमिन/बैंक द्वारा पुष्टि होते ही यह स्क्रीन अपने आप <strong>Unlock</strong> हो जाएगी।
              </div>

              <button
                onClick={() => setPaymentStatus('pending')}
                className="text-xs text-purple-700 hover:text-pink-600 font-bold underline cursor-pointer"
              >
                ← UTR नंबर दोबारा बदलें
              </button>
            </div>

          ) : paymentStatus === 'paid' ? (
            
            /* SUCCESS CELEBRATION STATE */
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
              <div className="relative mb-4">
                <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 opacity-60 blur-lg animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-emerald-100 border-3 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-purple-950 font-display">
                Unlocked Successfully! 🎉
              </h3>
              <p className="text-xs sm:text-sm text-purple-900/80 mt-1 max-w-sm font-medium">
                आपका पेमेंट <strong className="text-emerald-600 font-bold">{formatINR(item.price)}</strong> सत्यापित हो गया है। आपका एक्सक्लूसिव VIP कंटेंट तैयार है!
              </p>

              <div className="w-full mt-6 p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-white border-2 border-emerald-300 flex items-center gap-3 text-left shadow-md">
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                    <Crown className="w-3 h-3 text-yellow-500" />
                    VIP Uncensored Media Ready
                  </span>
                  <h5 className="text-xs sm:text-sm font-bold text-purple-950 truncate">
                    {item.title}
                  </h5>
                  <span className="text-[11px] text-purple-900/60 font-medium">
                    Lifetime Unlimited Access Unlocked
                  </span>
                </div>
              </div>

              <button
                id="btn-unlock-content-now"
                onClick={() => onSuccess(item)}
                className="w-full mt-6 glow-pink-btn py-3.5 px-6 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>अभी देखें & चलाएं (Play Now)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          ) : paymentStatus === 'expired' ? (
            
            /* EXPIRED STATE */
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <Clock className="w-12 h-12 text-amber-500 mb-3" />
              <h4 className="text-base font-bold text-purple-950">QR Code Expired</h4>
              <p className="text-xs text-purple-900/70 max-w-xs mt-1">
                सुरक्षा कारणों से यह पेमेंट सेशन समाप्त हो गया है। कृपया नया QR कोड जनरेट करें।
              </p>
              <button
                onClick={() => {
                  setLoading(true);
                  setTimeLeft(15 * 60);
                  createOrder(item.id).then((res) => {
                    setOrderData(res);
                    setPaymentStatus('pending');
                    setLoading(false);
                  });
                }}
                className="mt-5 px-5 py-2.5 rounded-2xl glow-pink-btn text-white text-xs font-bold cursor-pointer"
              >
                Generate New QR Code
              </button>
            </div>

          ) : (

            /* ACTIVE PAYMENT STATE */
            <div className="space-y-4">
              
              {/* IRRESISTIBLE VIP TEASER PREVIEW CARD */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-pink-300/80 bg-gradient-to-br from-purple-950 via-pink-950 to-purple-950 text-white p-3.5 sm:p-4 shadow-xl">
                
                {/* Floating particles aura background */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/30 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl" />

                <div className="relative z-10 flex items-center justify-between gap-3">
                  
                  {/* Media Thumbnail with Blurred Lock Reveal Teaser */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-pink-400/80 shrink-0 shadow-lg group">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover filter blur-[6px] scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="p-1.5 rounded-full bg-pink-600/90 text-white shadow-md animate-pulse">
                        <Lock className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="absolute bottom-1 right-1 text-[8px] font-black uppercase bg-pink-600 text-white px-1 rounded">
                      VIP 4K
                    </span>
                  </div>

                  {/* Item Description & Value Props */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-300/30 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-300" />
                        UNCENSORED
                      </span>
                      <span className="text-[10px] text-pink-300 font-semibold truncate">
                        {item.type === 'video' ? 'Full Video • 60 FPS' : 'Full HD Photo Set'}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-black text-white truncate mt-1">
                      {item.title}
                    </h4>

                    {/* Value Checklist */}
                    <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10px] text-purple-200">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-400" /> Instant Access
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> 100% Private
                      </span>
                    </div>
                  </div>

                  {/* Price Strikethrough & Deal Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-pink-300/80 line-through block font-semibold">
                      ₹{originalPrice}
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-yellow-300 font-display block leading-none">
                      {formatINR(item.price)}
                    </span>
                    <span className="inline-block mt-1 text-[9px] font-black uppercase bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-1.5 py-0.5 rounded-md shadow-xs animate-pulse">
                      Save 75%
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 1: Dynamic QR Code & Instant UPI Apps */}
              <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border-2 border-purple-100 text-center relative overflow-hidden shadow-md">
                
                {/* Header & Urgent Timer Pill */}
                <div className="flex items-center justify-between w-full mb-3 px-1">
                  <span className="text-xs font-black uppercase text-purple-950 tracking-wide flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-pink-600 text-white text-[11px] font-black flex items-center justify-center">1</span>
                    <span>QR स्कैन करें या ऐप से सीधे पेमेंट करें</span>
                  </span>
                  
                  {/* Urgent countdown pill */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold shadow-xs animate-pulse">
                    <Clock className="w-3 h-3 text-rose-600" />
                    <span>ऑफ़र शेष: <strong className="font-mono text-rose-950">{formatTimer(timeLeft)}</strong></span>
                  </div>
                </div>

                {/* QR Code Container with Glowing Gradient Ring */}
                <div className="relative p-1 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-400 shadow-xl shadow-pink-500/20">
                  <div className="p-3 bg-white rounded-[22px]">
                    {orderData?.qrDataUrl ? (
                      <img
                        src={orderData.qrDataUrl}
                        alt="UPI Dynamic QR Code"
                        className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                      />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-pink-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount note under QR */}
                <p className="text-xs font-extrabold text-purple-950 mt-3 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-600 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>किसी भी UPI ऐप से केवल <strong>{formatINR(item.price)}</strong> भेजें</span>
                </p>
                <p className="text-[11px] text-purple-900/70 mt-0.5 font-medium">
                  PhonePe • Google Pay • Paytm • BHIM • Cred
                </p>

                {/* Mobile Intent Direct Pay Button */}
                {orderData?.upiIntentUrl && (
                  <div className="w-full mt-3 pt-3 border-t border-purple-100">
                    <a
                      id="btn-open-upi-app"
                      href={orderData.upiIntentUrl}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-700 via-pink-600 to-purple-800 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-yellow-300" />
                      <span>PhonePe / GPay / Paytm में तुरंत खोलें</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                    </a>
                  </div>
                )}
              </div>

              {/* STEP 2: STRICT MANDATORY 12-DIGIT UTR VERIFICATION */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50/60 to-white border-2 border-purple-300 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs sm:text-sm font-black text-purple-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-900 text-white text-[11px] font-black flex items-center justify-center">2</span>
                    <span>पेमेंट के बाद 12-अंकों का UTR No. डालें</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() => setShowUtrHelp(!showUtrHelp)}
                    className="text-[11px] text-pink-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>UTR कहाँ मिलेगा?</span>
                  </button>
                </div>

                {/* UTR Help Accordion */}
                {showUtrHelp && (
                  <div className="p-3.5 rounded-2xl bg-white border border-purple-200 text-[11px] text-purple-900/80 space-y-1.5 animate-in fade-in duration-150 shadow-inner">
                    <div className="font-bold text-purple-950 flex items-center gap-1">
                      📱 <strong>UTR / UPI Ref No. कैसे देखें:</strong>
                    </div>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                      <li><strong>PhonePe:</strong> हिस्ट्री में जाएँ ➔ पेमेंट खोलें ➔ <strong>"UTR"</strong> (12 अंक)।</li>
                      <li><strong>Google Pay (GPay):</strong> ट्रांजेक्शन खोलें ➔ <strong>"UPI transaction ID"</strong> (12 अंक)।</li>
                      <li><strong>Paytm:</strong> पासबुक में जाएँ ➔ <strong>"UPI Ref No."</strong> (12 अंक)।</li>
                    </ul>
                  </div>
                )}

                {/* UTR Submission Form */}
                <form onSubmit={handleSubmitUtr} className="space-y-2.5">
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
                      className="w-full bg-white border-2 border-purple-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-2xl px-4 py-3.5 text-sm sm:text-base font-mono font-bold text-purple-950 tracking-wider shadow-inner placeholder:font-sans placeholder:text-xs placeholder:text-purple-900/40"
                    />
                    <span className={`absolute right-3.5 top-3.5 text-[11px] font-bold ${utrNumber.length === 12 ? 'text-emerald-600 font-black' : 'text-purple-900/50'}`}>
                      {utrNumber.length}/12 {utrNumber.length === 12 ? '✓' : 'अंक'}
                    </span>
                  </div>

                  {utrError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 animate-in shake duration-200">
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
                        : 'bg-zinc-200 text-zinc-500 cursor-not-allowed shadow-none'
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
                        <span>सत्यापित करें & कंटेंट अनलॉक करें (Verify & Unlock)</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* UPI ID & Details for manual transfer */}
              <div className="p-3 rounded-2xl bg-white/70 border border-purple-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-purple-900/70 font-medium">Payee UPI ID:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-purple-950">
                    <span>{orderData?.order.upiId}</span>
                    <button
                      onClick={handleCopyUpi}
                      className="p-1 rounded-lg bg-white hover:bg-pink-50 border border-purple-100 text-purple-800 cursor-pointer shadow-xs"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-purple-900/70 font-medium">Order ID:</span>
                  <div className="flex items-center gap-1.5 font-mono text-purple-900/80 text-[11px]">
                    <span>{orderData?.order.orderId}</span>
                    <button
                      onClick={handleCopyOrderId}
                      className="p-1 rounded-lg bg-white hover:bg-pink-50 border border-purple-100 text-purple-800 cursor-pointer shadow-xs"
                      title="Copy Order ID"
                    >
                      {copiedOrderId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Development / Sandbox Testing Simulation Box */}
              {orderData?.mode === 'sandbox_simulator' && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black flex items-center gap-1">
                      🛠️ Dev Sandbox Mode (Admin Preview Only)
                    </span>
                    <button
                      onClick={handleTestSimulate}
                      disabled={isSimulating}
                      className="px-2.5 py-1 rounded-xl bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-500 transition-colors shadow-sm cursor-pointer"
                    >
                      {isSimulating ? 'Verifying...' : '⚡ Test Unlock (Dev)'}
                    </button>
                  </div>
                </div>
              )}

              {/* Security & Guarantee Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-purple-900/60 pt-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit Encrypted Instant Token Delivery • Direct Creator Access</span>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

