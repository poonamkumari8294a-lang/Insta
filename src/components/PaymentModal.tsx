import React, { useState, useEffect, useRef } from 'react';
import { MediaItem, OrderItem } from '../types';
import { createOrder, checkOrderStatus, confirmUpiPayment, devSimulatePayment, formatINR, saveAccessToken } from '../utils/api';
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
  HelpCircle
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
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [showUtrField, setShowUtrField] = useState(false);
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

  // Polling for server-side verification status
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
          // Trigger celebration confetti
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
          clearInterval(pollingRef.current);
        } else if (statusRes.status === 'expired' || statusRes.status === 'failed') {
          setPaymentStatus(statusRes.status);
          clearInterval(pollingRef.current);
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

  // Direct UPI Payment Confirmation Trigger (When user finishes payment in PhonePe/GPay/Paytm)
  const handleConfirmPayment = async (customUtr?: string) => {
    if (!orderData || isVerifyingPayment) return;
    setIsVerifyingPayment(true);
    
    try {
      // Confirm order with server & obtain access token
      const res = await confirmUpiPayment(orderData.order.orderId, customUtr || utrNumber);
      
      if (res.success) {
        // Small delay for smooth verification UX
        setTimeout(() => {
          setPaymentStatus('paid');
          if (res.order?.accessToken && item) {
            saveAccessToken(item.id, res.order.accessToken);
          }
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 }
          });
          setIsVerifyingPayment(false);
        }, 1000);
      } else {
        setIsVerifyingPayment(false);
        alert('Payment verification in progress. Please wait a moment or try again.');
      }
    } catch (err: any) {
      setIsVerifyingPayment(false);
      alert(err.message || 'Payment verification failed');
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
          particleCount: 100,
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

  return (
    <div className="fixed inset-0 z-50 bg-purple-950/40 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/90 overflow-hidden shadow-2xl my-auto">
        
        {/* Header with Title & Close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100/80 bg-white/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-pink-100/80 text-pink-600 border border-pink-200 shadow-sm">
              <QrCode className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-purple-950 font-display">
                UPI Instant Checkout
              </h3>
              <p className="text-[11px] text-pink-700 font-semibold">
                Instant Automatic Unlock • All UPI Apps Supported
              </p>
            </div>
          </div>

          <button
            id="payment-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/80 text-purple-900/60 hover:text-purple-950 hover:bg-white border border-purple-100 transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-bold text-purple-950">Generating Dynamic UPI QR...</p>
              <p className="text-xs text-purple-900/70 mt-1 font-medium">Securing server price and unique order session</p>
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
          ) : isVerifyingPayment ? (

            /* VERIFYING / PROCESSING STATE */
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-emerald-600 animate-pulse" />
                </div>
              </div>
              <h4 className="text-lg font-black text-purple-950 font-display">
                Verifying Payment with Bank...
              </h4>
              <p className="text-xs text-purple-900/80 mt-1.5 max-w-xs font-medium">
                आपके पेमेंट की पुष्टि की जा रही है। कृपया कुछ सेकंड प्रतीक्षा करें...
              </p>
              <div className="mt-4 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                Order ID: <span className="font-mono">{orderData?.order.orderId}</span>
              </div>
            </div>

          ) : paymentStatus === 'paid' ? (
            
            /* SUCCESS STATE */
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-purple-950 font-display">
                Payment Successful! 🎉
              </h3>
              <p className="text-xs sm:text-sm text-purple-900/80 mt-1 max-w-sm font-medium">
                Your payment of <strong className="text-emerald-600 font-bold">{formatINR(item.price)}</strong> has been verified. Your exclusive content is unlocked!
              </p>

              <div className="w-full mt-6 p-4 rounded-2xl bg-pink-50/70 border border-pink-200/80 flex items-center gap-3 text-left">
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-12 h-12 rounded-xl object-cover border border-pink-300"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-extrabold text-pink-700 uppercase tracking-wider block">
                    {item.type} Unlocked
                  </span>
                  <h5 className="text-xs sm:text-sm font-bold text-purple-950 truncate">
                    {item.title}
                  </h5>
                </div>
              </div>

              <button
                id="btn-unlock-content-now"
                onClick={() => onSuccess(item)}
                className="w-full mt-6 glow-pink-btn py-3.5 px-6 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25"
              >
                <span>View & Play Content Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          ) : paymentStatus === 'expired' ? (
            
            /* EXPIRED STATE */
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <Clock className="w-12 h-12 text-amber-500 mb-3" />
              <h4 className="text-base font-bold text-purple-950">QR Code Expired</h4>
              <p className="text-xs text-purple-900/70 max-w-xs mt-1">
                This dynamic payment session has expired for security. Please generate a fresh QR code.
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
                className="mt-5 px-5 py-2.5 rounded-2xl glow-pink-btn text-white text-xs font-bold"
              >
                Generate New QR Code
              </button>
            </div>

          ) : (

            /* ACTIVE PAYMENT STATE */
            <div className="space-y-4">
              
              {/* Product Summary Header */}
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-pink-50/80 via-purple-50/80 to-white/90 border border-purple-100 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-pink-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold text-pink-700 uppercase tracking-wider block">
                      Exclusive {item.type}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-purple-950 truncate">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-purple-900/60 font-medium">
                      Order: <span className="font-mono text-purple-950">{orderData?.order.orderId.substring(0, 14)}...</span>
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-purple-800/70 block font-bold uppercase">Total Amount</span>
                  <span className="text-lg sm:text-xl font-black text-purple-950 font-display">
                    {formatINR(item.price)}
                  </span>
                </div>
              </div>

              {/* Dynamic QR Code Display */}
              <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white/70 border border-purple-100 text-center relative overflow-hidden shadow-inner">
                
                {/* Timer Pill */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-800 text-xs font-bold mb-3 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-pink-600 animate-pulse" />
                  <span>Valid for: <strong className="font-mono text-purple-950">{formatTimer(timeLeft)}</strong></span>
                </div>

                {/* QR Code Container */}
                <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-pink-200">
                  {orderData?.qrDataUrl ? (
                    <img
                      src={orderData.qrDataUrl}
                      alt="UPI Dynamic QR Code"
                      className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-pink-600" />
                    </div>
                  )}
                </div>

                {/* Amount note under QR */}
                <p className="text-xs font-extrabold text-purple-950 mt-3 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                  Scan with any UPI App • Pay exactly {formatINR(item.price)}
                </p>
                <p className="text-[11px] text-purple-900/70 mt-0.5 font-medium">
                  GPay • PhonePe • Paytm • BHIM • Cred
                </p>

                {/* Mobile Intent Direct Pay Button */}
                {orderData?.upiIntentUrl && (
                  <div className="w-full mt-4 pt-3 border-t border-purple-100 flex flex-col sm:flex-row gap-2">
                    <a
                      id="btn-open-upi-app"
                      href={orderData.upiIntentUrl}
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 hover:opacity-90"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Pay via PhonePe / GPay / Paytm</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>

              {/* HIGH-VISIBILITY PAYMENT CONFIRMATION SECTION */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-pink-50 border-2 border-emerald-300/80 shadow-md space-y-3">
                <div className="text-center">
                  <h5 className="text-xs sm:text-sm font-black text-emerald-950 flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>पेमेंट करने के बाद यहाँ क्लिक करें</span>
                  </h5>
                  <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                    QR स्कैन करके पेमेंट पूरा करें, फिर नीचे दिया गया बटन दबाएं
                  </p>
                </div>

                {/* Big Direct Confirm Button */}
                <button
                  id="btn-confirm-upi-paid"
                  onClick={() => handleConfirmPayment()}
                  disabled={isVerifyingPayment}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>✅ मैंने पेमेंट कर दिया है (Unlock Content)</span>
                </button>

                {/* Optional 12-Digit UTR Field */}
                <div className="pt-2 border-t border-emerald-200/60">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowUtrField(!showUtrField)}
                      className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold underline flex items-center gap-1"
                    >
                      <span>{showUtrField ? '▲ UTR बॉक्स छुपाएं' : '▼ 12-Digit UTR / UPI Ref No. डालें (वैकल्पिक)'}</span>
                    </button>
                    <span className="text-[10px] text-emerald-700/80 font-medium">Optional</span>
                  </div>

                  {showUtrField && (
                    <div className="mt-2 flex gap-2 animate-in fade-in duration-150">
                      <input
                        type="text"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                        placeholder="e.g. 423812345678"
                        maxLength={18}
                        className="flex-1 bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-mono text-purple-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleConfirmPayment(utrNumber)}
                        disabled={isVerifyingPayment}
                        className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm"
                      >
                        Submit UTR
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* UPI ID & Details for manual transfer */}
              <div className="p-3 rounded-2xl bg-white/60 border border-purple-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-purple-900/70 font-medium">Payee UPI ID:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-purple-950">
                    <span>{orderData?.order.upiId}</span>
                    <button
                      onClick={handleCopyUpi}
                      className="p-1 rounded bg-white hover:bg-pink-50 border border-purple-100 text-purple-800"
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
                      className="p-1 rounded bg-white hover:bg-pink-50 border border-purple-100 text-purple-800"
                      title="Copy Order ID"
                    >
                      {copiedOrderId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Polling Status Indicator */}
              <div className="flex items-center justify-center gap-2 text-xs text-pink-700 py-1">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                <span className="font-bold">Automatic background status check active...</span>
              </div>

              {/* Development / Sandbox Testing Simulation Box */}
              {orderData?.mode === 'sandbox_simulator' && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black flex items-center gap-1">
                      🛠️ Dev Sandbox Simulator Mode
                    </span>
                    <button
                      onClick={handleTestSimulate}
                      disabled={isSimulating}
                      className="px-2.5 py-1 rounded-xl bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-500 transition-colors shadow-sm"
                    >
                      {isSimulating ? 'Verifying...' : '⚡ Simulate Server Webhook'}
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-800/80 mt-1 font-medium">
                    Triggers server-side webhook simulation for testing access token generation.
                  </p>
                </div>
              )}

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-purple-900/60 pt-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit Encrypted Secure Server Token Delivery</span>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
