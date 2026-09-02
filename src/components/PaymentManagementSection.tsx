import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Phone,
  User,
  Image as ImageIcon,
  RotateCw,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Download,
  AlertTriangle,
  RefreshCw,
  Eye,
  Link2,
  Copy,
  Check,
  ShieldCheck,
  IndianRupee,
  Sparkles
} from 'lucide-react';
import { OrderItem } from '../types';
import {
  formatINR,
  approveOrderPayment,
  rejectOrderPayment,
  deleteOrder,
  verifyOrderPayment,
  deletePaymentScreenshot,
  relinkPaymentScreenshot
} from '../utils/api';

interface PaymentManagementSectionProps {
  ordersList: OrderItem[];
  onReload: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const PaymentManagementSection: React.FC<PaymentManagementSectionProps> = ({
  ordersList,
  onReload,
  showToast
}) => {
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'screenshots'>('orders');

  // Modals & Action states
  const [viewingScreenshotOrder, setViewingScreenshotOrder] = useState<OrderItem | null>(null);
  const [screenshotZoom, setScreenshotZoom] = useState<number>(1);
  const [screenshotRotation, setScreenshotRotation] = useState<number>(0);

  const [verifyingOrder, setVerifyingOrder] = useState<OrderItem | null>(null);
  const [verifyingTxnRef, setVerifyingTxnRef] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [rejectingOrder, setRejectingOrder] = useState<OrderItem | null>(null);
  const [rejectReason, setRejectReason] = useState('Invalid or unverified UPI UTR reference');
  const [isRejecting, setIsRejecting] = useState(false);

  const [deletingOrder, setDeletingOrder] = useState<OrderItem | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  const [relinkingOrder, setRelinkingOrder] = useState<OrderItem | null>(null);
  const [newScreenshotUrlInput, setNewScreenshotUrlInput] = useState('');
  const [isRelinking, setIsRelinking] = useState(false);

  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filter orders
  const filteredOrders = ordersList.filter((o) => {
    const q = orderSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.orderId.toLowerCase().includes(q) ||
      (o.contentTitle && o.contentTitle.toLowerCase().includes(q)) ||
      (o.transactionRef && o.transactionRef.toLowerCase().includes(q)) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.customerPhone && o.customerPhone.includes(q));

    if (!matchesSearch) return false;

    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  // Orders with screenshots for Screenshot Gallery
  const ordersWithScreenshots = ordersList.filter((o) => o.screenshotUrl && o.screenshotUrl.trim().length > 0);

  // Approve Order
  const handleApproveOrder = async (orderId: string) => {
    try {
      showToast('⏳ Approving payment & unlocking content...');
      await approveOrderPayment(orderId);
      showToast('✅ Payment Approved! Customer content has been unlocked.');
      if (viewingScreenshotOrder && viewingScreenshotOrder.orderId === orderId) {
        setViewingScreenshotOrder({ ...viewingScreenshotOrder, status: 'paid' });
      }
      onReload();
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    }
  };

  // Reject Order
  const handleRejectOrderConfirm = async () => {
    if (!rejectingOrder) return;
    setIsRejecting(true);
    try {
      await rejectOrderPayment(rejectingOrder.orderId, rejectReason);
      showToast('❌ Payment rejected and flagged.');
      setRejectingOrder(null);
      if (viewingScreenshotOrder && viewingScreenshotOrder.orderId === rejectingOrder.orderId) {
        setViewingScreenshotOrder(null);
      }
      onReload();
    } catch (err: any) {
      showToast(err.message || 'Rejection failed', 'error');
    } finally {
      setIsRejecting(false);
    }
  };

  // Manual Verify & Issue
  const handleVerifyOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingOrder) return;
    setIsVerifying(true);
    try {
      await verifyOrderPayment(verifyingOrder.orderId, verifyingTxnRef || `ADMIN_VERIFIED_${Date.now()}`);
      showToast('✅ Payment verified & content issued!');
      setVerifyingOrder(null);
      onReload();
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  // Delete Order
  const handleDeleteOrderConfirm = async () => {
    if (!deletingOrder) return;
    setIsDeletingOrder(true);
    try {
      await deleteOrder(deletingOrder.orderId);
      showToast('🗑️ Order record deleted from database');
      setDeletingOrder(null);
      onReload();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete order', 'error');
    } finally {
      setIsDeletingOrder(false);
    }
  };

  // Delete Payment Screenshot
  const handleDeleteScreenshot = async (orderId: string) => {
    if (!confirm('क्या आप इस आर्डर की पेमेंट रसीद/स्क्रीनशॉट इमेज हटाना चाहते हैं?')) return;
    try {
      await deletePaymentScreenshot(orderId);
      showToast('🗑️ पेमेंट स्क्रीनशॉट हटा दिया गया');
      if (viewingScreenshotOrder && viewingScreenshotOrder.orderId === orderId) {
        setViewingScreenshotOrder(null);
      }
      onReload();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete screenshot', 'error');
    }
  };

  // Relink Screenshot
  const handleRelinkScreenshotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relinkingOrder || !newScreenshotUrlInput.trim()) return;
    setIsRelinking(true);
    try {
      await relinkPaymentScreenshot(relinkingOrder.orderId, newScreenshotUrlInput.trim());
      showToast('✅ स्क्रीनशॉट लिंक सफलतापूर्वक अपडेट हो गया');
      setRelinkingOrder(null);
      setNewScreenshotUrlInput('');
      onReload();
    } catch (err: any) {
      showToast(err.message || 'Relink failed', 'error');
    } finally {
      setIsRelinking(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (ordersList.length === 0) {
      showToast('No orders to export', 'error');
      return;
    }
    const headers = ['Order ID', 'Content Title', 'Amount', 'Status', 'UTR Ref', 'Customer Name', 'Phone', 'Created Date', 'Screenshot URL'];
    const rows = ordersList.map((o) => [
      o.orderId,
      `"${(o.contentTitle || '').replace(/"/g, '""')}"`,
      o.amount,
      o.status,
      `"${o.transactionRef || ''}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      o.createdAt ? new Date(o.createdAt).toLocaleString() : '',
      `"${o.screenshotUrl || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ruma_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 Orders exported to CSV!');
  };

  const pendingVerificationCount = ordersList.filter((o) => o.status === 'waiting_verification').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Pending Banner Alert */}
      {pendingVerificationCount > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">
                {pendingVerificationCount} New Payment Claims Waiting Verification!
              </h3>
              <p className="text-xs text-white/90 font-medium">
                Review submitted 12-digit UTR numbers and payment screenshots to instantly unlock content.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('orders');
              setOrderStatusFilter('waiting_verification');
            }}
            className="px-4 py-2.5 rounded-xl bg-white text-purple-950 font-black text-xs hover:bg-white/90 transition-transform active:scale-95 shadow-md whitespace-nowrap cursor-pointer"
          >
            Review {pendingVerificationCount} Pending UTRs
          </button>
        </div>
      )}

      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm">
        <div>
          <h2 className="font-display font-black text-xl text-purple-950 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-pink-600" />
            <span>Orders & Payment Management (पेमेंट सत्यापन व रसीदें)</span>
          </h2>
          <p className="text-xs text-purple-900/70 font-medium mt-0.5">
            Audit UPI bank transfers, review payment screenshots, approve orders, and manage financial records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sub Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-purple-100 border border-purple-200">
            <button
              type="button"
              onClick={() => setActiveSubTab('orders')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'orders'
                  ? 'bg-white text-purple-950 shadow-xs font-black'
                  : 'text-purple-700 hover:text-purple-950'
              }`}
            >
              📋 All Orders ({ordersList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('screenshots')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'screenshots'
                  ? 'bg-pink-600 text-white shadow-xs font-black'
                  : 'text-purple-700 hover:text-purple-950'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>📸 Screenshots ({ordersWithScreenshots.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-950 text-xs font-bold border border-purple-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export all orders to CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-purple-700" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 1: ORDERS TABLE AUDIT */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-purple-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order ID, customer name, phone, title or UTR reference..."
                className="w-full bg-white border border-purple-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-purple-950 placeholder-purple-900/40 shadow-xs font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-white border border-purple-200 rounded-2xl px-3.5 py-2 text-xs text-purple-950 font-bold shadow-xs cursor-pointer"
              >
                <option value="all">All Statuses ({ordersList.length})</option>
                <option value="waiting_verification">
                  ⏳ Review UTR ({ordersList.filter((o) => o.status === 'waiting_verification').length})
                </option>
                <option value="paid">✅ Paid ({ordersList.filter((o) => o.status === 'paid').length})</option>
                <option value="pending">🕒 Pending ({ordersList.filter((o) => o.status === 'pending').length})</option>
                <option value="failed">❌ Failed / Rejected ({ordersList.filter((o) => o.status === 'failed').length})</option>
                <option value="expired">⌛ Expired ({ordersList.filter((o) => o.status === 'expired').length})</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="glass-card rounded-3xl overflow-hidden border border-white/80 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-purple-950">
                <thead className="border-b border-purple-200 bg-purple-100/70 text-purple-950/80 uppercase text-[10px] font-black">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer (Lead)</th>
                    <th className="py-3.5 px-4">Content / Item</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Screenshot</th>
                    <th className="py-3.5 px-4">Submitted UTR</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 bg-white/60">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-purple-900/50 font-medium">
                        <CreditCard className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                        No orders found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr
                        key={o.orderId}
                        className={
                          o.status === 'waiting_verification'
                            ? 'bg-amber-50/70 hover:bg-amber-50 font-semibold transition-colors'
                            : 'hover:bg-purple-50/50 transition-colors'
                        }
                      >
                        {/* Order ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-black text-pink-700">{o.orderId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(o.orderId, o.orderId)}
                              className="p-1 hover:bg-purple-100 rounded text-purple-500"
                              title="Copy Order ID"
                            >
                              {copiedText === o.orderId ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          {o.customerName || o.customerPhone ? (
                            <div className="space-y-0.5">
                              <div className="font-bold text-purple-950 flex items-center gap-1 text-[11px]">
                                <User className="w-3 h-3 text-pink-600" />
                                <span>{o.customerName || 'VIP Buyer'}</span>
                              </div>
                              {o.customerPhone && (
                                <a
                                  href={`https://wa.me/91${o.customerPhone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-emerald-700 font-mono font-bold hover:underline flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 w-fit"
                                  title="WhatsApp पर चैट करें"
                                >
                                  <Phone className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>+91 {o.customerPhone}</span>
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-purple-900/40 text-[11px]">Direct Guest</span>
                          )}
                        </td>

                        {/* Content Title */}
                        <td className="py-3.5 px-4 font-bold text-purple-950 max-w-[160px] truncate">
                          {o.contentTitle}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-display font-black text-purple-950">
                          {formatINR(o.amount)}
                        </td>

                        {/* Status badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              o.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : o.status === 'waiting_verification'
                                ? 'bg-amber-200 text-amber-900 border border-amber-300 animate-pulse'
                                : o.status === 'failed'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : o.status === 'expired'
                                ? 'bg-zinc-100 text-zinc-600'
                                : 'bg-purple-100 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {o.status === 'waiting_verification' ? '⏳ Review UTR' : o.status}
                          </span>
                        </td>

                        {/* Screenshot thumbnail */}
                        <td className="py-3.5 px-4">
                          {o.screenshotUrl ? (
                            <button
                              type="button"
                              onClick={() => {
                                setViewingScreenshotOrder(o);
                                setScreenshotZoom(1);
                                setScreenshotRotation(0);
                              }}
                              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-800 text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                              title="Click to view full payment screenshot"
                            >
                              <img
                                src={o.screenshotUrl}
                                alt="Receipt"
                                className="w-6 h-6 rounded-md object-cover border border-pink-300 shadow-2xs"
                              />
                              <span>View Receipt</span>
                            </button>
                          ) : (
                            <span className="text-purple-900/40 text-[11px] font-medium">—</span>
                          )}
                        </td>

                        {/* UTR Ref */}
                        <td className="py-3.5 px-4">
                          {o.transactionRef ? (
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-950 shadow-xs">
                                {o.transactionRef}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(o.transactionRef!, `utr_${o.orderId}`)}
                                className="p-1 hover:bg-purple-100 rounded text-purple-500"
                                title="Copy UTR Ref"
                              >
                                {copiedText === `utr_${o.orderId}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-purple-900/40 font-mono text-[11px]">—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-purple-900/60 font-medium text-[11px]">
                          {new Date(o.createdAt).toLocaleString()}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {o.status === 'waiting_verification' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveOrder(o.orderId)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black shadow-sm flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
                                  title="Approve payment & unlock content for user"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectingOrder(o)}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-[11px] font-bold transition-colors cursor-pointer"
                                  title="Reject payment claim"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : o.status === 'pending' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setVerifyingOrder(o);
                                  setVerifyingTxnRef(`ADMIN_VERIFIED_${Date.now()}`);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-black shadow-sm transition-transform active:scale-95 cursor-pointer"
                              >
                                Verify & Issue
                              </button>
                            ) : o.status === 'paid' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-black">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Paid</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-purple-900/50 font-medium">
                                {o.status === 'failed' ? 'Rejected' : 'Closed'}
                              </span>
                            )}

                            {/* Delete Order */}
                            <button
                              type="button"
                              onClick={() => setDeletingOrder(o)}
                              className="p-1.5 rounded-xl bg-purple-50 hover:bg-rose-100 text-purple-400 hover:text-rose-600 border border-purple-100 transition-colors cursor-pointer"
                              title="Delete order record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 2: PAYMENT SCREENSHOTS GALLERY */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'screenshots' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-display font-black text-base text-purple-950">
                Payment Screenshots & Proof Gallery (ग्राहक पेमेंट रसीद गैलरी)
              </h3>
              <p className="text-xs text-purple-900/70 font-medium">
                Visual proof of UPI payments submitted by customers during checkout.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-black">
              {ordersWithScreenshots.length} Total Receipts
            </span>
          </div>

          {ordersWithScreenshots.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center text-purple-900/60 font-medium border border-white/80 shadow-sm">
              <ImageIcon className="w-10 h-10 text-purple-300 mx-auto mb-2" />
              No payment screenshots uploaded by customers yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ordersWithScreenshots.map((ord) => (
                <div
                  key={ord.orderId}
                  className="glass-card rounded-3xl overflow-hidden border border-white/80 shadow-md flex flex-col group hover:border-pink-300 transition-all"
                >
                  {/* Image Preview Container */}
                  <div className="relative aspect-3/4 bg-purple-950/5 overflow-hidden">
                    <img
                      src={ord.screenshotUrl}
                      alt={`Receipt for ${ord.orderId}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Status Pill on Top Left */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-md ${
                          ord.status === 'paid'
                            ? 'bg-emerald-600 text-white'
                            : ord.status === 'waiting_verification'
                            ? 'bg-amber-500 text-purple-950 animate-pulse'
                            : 'bg-purple-900 text-white'
                        }`}
                      >
                        {ord.status === 'waiting_verification' ? '⏳ Review UTR' : ord.status}
                      </span>
                    </div>

                    {/* Amount on Top Right */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-purple-950/80 backdrop-blur-md text-white font-black text-xs shadow-md">
                      {formatINR(ord.amount)}
                    </div>

                    {/* Quick View Button on Hover */}
                    <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setViewingScreenshotOrder(ord);
                          setScreenshotZoom(1);
                          setScreenshotRotation(0);
                        }}
                        className="px-3 py-2 rounded-xl bg-white text-purple-950 font-black text-xs shadow-lg flex items-center gap-1 hover:bg-pink-50 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-pink-600" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Details & Actions */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2 bg-white/70">
                    <div>
                      <div className="font-mono font-bold text-pink-700 text-xs truncate">
                        {ord.orderId}
                      </div>
                      <div className="font-bold text-purple-950 text-xs truncate mt-0.5">
                        {ord.contentTitle}
                      </div>
                      <div className="text-[11px] text-purple-900/60 flex items-center justify-between mt-1">
                        <span>{ord.customerName || 'Customer'}</span>
                        <span className="font-mono">{ord.customerPhone ? `+91 ${ord.customerPhone}` : ''}</span>
                      </div>
                      {ord.transactionRef && (
                        <div className="text-[10px] font-mono text-purple-950/80 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 mt-1 truncate">
                          UTR: {ord.transactionRef}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-purple-100 flex items-center justify-between gap-1.5">
                      {ord.status === 'waiting_verification' ? (
                        <button
                          type="button"
                          onClick={() => handleApproveOrder(ord.orderId)}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-purple-900/60">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteScreenshot(ord.orderId)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                        title="Delete this screenshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: FULLSCREEN SCREENSHOT VIEWER & ZOOM */}
      {/* ---------------------------------------------------- */}
      {viewingScreenshotOrder && viewingScreenshotOrder.screenshotUrl && (
        <div className="fixed inset-0 z-50 bg-purple-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/80 flex flex-col max-h-[95vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-purple-100 flex items-center justify-between bg-white/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-pink-100 text-pink-600">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-purple-950 flex items-center gap-2">
                    Payment Screenshot Audit
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        viewingScreenshotOrder.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : viewingScreenshotOrder.status === 'waiting_verification'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {viewingScreenshotOrder.status}
                    </span>
                  </h3>
                  <p className="text-xs text-purple-900/60 font-medium">
                    Order: <code className="font-mono text-pink-700 font-bold">{viewingScreenshotOrder.orderId}</code> • Amount:{' '}
                    <strong>{formatINR(viewingScreenshotOrder.amount)}</strong>
                  </p>
                </div>
              </div>

              {/* Controls Toolbar */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setScreenshotZoom((z) => Math.min(z + 0.25, 3))}
                  className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setScreenshotZoom((z) => Math.max(z - 0.25, 0.5))}
                  className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setScreenshotRotation((r) => (r + 90) % 360)}
                  className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 transition-colors"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <a
                  href={viewingScreenshotOrder.screenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setViewingScreenshotOrder(null)}
                  className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Image Stage */}
            <div className="flex-1 bg-zinc-950/90 overflow-auto p-4 flex items-center justify-center min-h-[350px]">
              <img
                src={viewingScreenshotOrder.screenshotUrl}
                alt="Receipt Full Preview"
                style={{
                  transform: `scale(${screenshotZoom}) rotate(${screenshotRotation}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Verification Footer Actions */}
            <div className="p-4 bg-white border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-purple-950">
                  Customer: {viewingScreenshotOrder.customerName || 'Direct'} ({viewingScreenshotOrder.customerPhone || 'No phone'})
                </div>
                {viewingScreenshotOrder.transactionRef && (
                  <div className="font-mono text-purple-900/70">Submitted UTR: <strong>{viewingScreenshotOrder.transactionRef}</strong></div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {viewingScreenshotOrder.status === 'waiting_verification' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApproveOrder(viewingScreenshotOrder.orderId)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Unlock Content</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingOrder(viewingScreenshotOrder);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs cursor-pointer"
                    >
                      Reject Claim
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setRelinkingOrder(viewingScreenshotOrder);
                    setNewScreenshotUrlInput(viewingScreenshotOrder.screenshotUrl || '');
                  }}
                  className="px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1"
                  title="Relink screenshot URL"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Relink</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteScreenshot(viewingScreenshotOrder.orderId)}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs"
                  title="Delete screenshot image"
                >
                  Delete Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: VERIFY & ISSUE (MANUAL OVERRIDE) */}
      {/* ---------------------------------------------------- */}
      {verifyingOrder && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-white/90 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
              <div className="p-2.5 rounded-2xl bg-pink-100 text-pink-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-purple-950">
                  Verify & Issue Content
                </h3>
                <p className="text-[11px] text-purple-900/60 font-medium">Manually mark paid and unlock user access</p>
              </div>
            </div>

            <form onSubmit={handleVerifyOrderSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-purple-900/60">Order ID:</span>
                  <span className="font-mono font-bold text-pink-700">{verifyingOrder.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-900/60">Amount:</span>
                  <span className="font-black text-emerald-700">{formatINR(verifyingOrder.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-900/60">Content:</span>
                  <span className="font-bold text-purple-950">{verifyingOrder.contentTitle}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">Bank Transaction Ref / UTR Number</label>
                <input
                  type="text"
                  required
                  value={verifyingTxnRef}
                  onChange={(e) => setVerifyingTxnRef(e.target.value)}
                  placeholder="e.g. 423456789012"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-purple-950 font-mono font-bold shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setVerifyingOrder(null)}
                  className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="glow-pink-btn px-6 py-2 rounded-xl text-white font-black shadow-md shadow-pink-500/25"
                >
                  {isVerifying ? 'Verifying...' : 'Confirm & Unlock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: REJECT PAYMENT CLAIM */}
      {/* ---------------------------------------------------- */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-white/90 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
              <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-purple-950">
                  Reject Payment Claim (पेमेंट दावा खारिज करें)
                </h3>
                <p className="text-[11px] text-purple-900/60 font-medium">Flag fake UTR submission</p>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-purple-900/60">Order ID:</span>
                <span className="font-mono font-bold text-pink-700">{rejectingOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-900/60">Claimed UTR:</span>
                <span className="font-mono font-bold text-purple-950">{rejectingOrder.transactionRef || 'None'}</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-purple-950 block mb-1 text-xs">Rejection Reason</label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-xs text-purple-950 shadow-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-purple-100">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRejecting}
                onClick={handleRejectOrderConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md"
              >
                {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: RELINK PAYMENT SCREENSHOT */}
      {/* ---------------------------------------------------- */}
      {relinkingOrder && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-white/90 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
              <div className="p-2.5 rounded-2xl bg-pink-100 text-pink-600">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-purple-950">
                  Relink Screenshot (स्क्रीनशॉट लिंक बदलें)
                </h3>
                <p className="text-[11px] text-purple-900/60 font-medium">Update receipt image URL for order</p>
              </div>
            </div>

            <form onSubmit={handleRelinkScreenshotSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-purple-950 block mb-1">New Image / Screenshot URL</label>
                <input
                  type="url"
                  required
                  value={newScreenshotUrlInput}
                  onChange={(e) => setNewScreenshotUrlInput(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 font-mono shadow-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setRelinkingOrder(null)}
                  className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRelinking}
                  className="glow-pink-btn px-5 py-2 rounded-xl text-white font-black shadow-md shadow-pink-500/25"
                >
                  {isRelinking ? 'Updating...' : 'Update Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 5: DELETE ORDER CONFIRM */}
      {/* ---------------------------------------------------- */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-white/90 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-purple-950">
                  Delete Order Record
                </h3>
                <p className="text-xs text-purple-900/60 font-medium">
                  Order ID: <span className="font-mono text-pink-700">{deletingOrder.orderId}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-purple-900/80 leading-relaxed font-medium">
              क्या आप वाकई इस आर्डर रिकॉर्ड को डेटाबेस से हमेशा के लिए डिलीट करना चाहते हैं?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={() => setDeletingOrder(null)}
                className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={handleDeleteOrderConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {isDeletingOrder ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
