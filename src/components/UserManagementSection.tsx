import React, { useState } from 'react';
import {
  Users,
  Crown,
  Search,
  PlusCircle,
  Download,
  Phone,
  MessageCircle,
  Trash2,
  Edit2,
  Eye,
  Camera,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  IndianRupee,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  UserPlus
} from 'lucide-react';
import { VipLeadItem, OrderItem } from '../types';
import {
  updateVipLead,
  updateVipUserProfile,
  changeVipUserId,
  deleteVipLead,
  createVipLead,
  formatINR
} from '../utils/api';
import { uploadFileToStorage, isCloudinaryUrl } from '../services/storage';

interface UserManagementSectionProps {
  vipLeads: VipLeadItem[];
  ordersList: OrderItem[];
  onReload: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const UserManagementSection: React.FC<UserManagementSectionProps> = ({
  vipLeads,
  ordersList,
  onReload,
  showToast
}) => {
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'vip' | 'free' | 'banned'>('all');

  // Modals state
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<VipLeadItem | null>(null);
  const [editingUser, setEditingUser] = useState<VipLeadItem | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<VipLeadItem>>({});
  const [isSavingUser, setIsSavingUser] = useState(false);

  const [changingUserIdUser, setChangingUserIdUser] = useState<VipLeadItem | null>(null);
  const [newUserIdInput, setNewUserIdInput] = useState('');
  const [isChangingUserId, setIsChangingUserId] = useState(false);

  const [changingPhotoUser, setChangingPhotoUser] = useState<VipLeadItem | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [deletingUser, setDeletingUser] = useState<VipLeadItem | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState<Partial<VipLeadItem>>({
    name: '',
    phone: '',
    email: '',
    username: '',
    tier: 'Gold VIP',
    status: 'active',
    vipStatus: 'active',
    notes: ''
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter users
  const filteredUsers = vipLeads.filter((lead) => {
    const q = userSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (lead.name && lead.name.toLowerCase().includes(q)) ||
      (lead.phone && lead.phone.includes(q)) ||
      (lead.email && lead.email.toLowerCase().includes(q)) ||
      (lead.userId && lead.userId.toLowerCase().includes(q)) ||
      (lead.id && lead.id.toLowerCase().includes(q)) ||
      (lead.username && lead.username.toLowerCase().includes(q)) ||
      (lead.tier && lead.tier.toLowerCase().includes(q)) ||
      (lead.notes && lead.notes.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (userFilter === 'vip') return lead.vipStatus === 'active';
    if (userFilter === 'free') return lead.vipStatus !== 'active' && lead.status !== 'banned';
    if (userFilter === 'banned') return lead.status === 'banned' || lead.vipStatus === 'banned';
    return true;
  });

  // Calculate user spendings & linked orders
  const getUserOrders = (lead: VipLeadItem) => {
    const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
    const cleanLeadId = lead.userId || lead.id;
    return ordersList.filter((o) => {
      const oPhone = (o.customerPhone || '').replace(/[^0-9]/g, '');
      if (cleanPhone && oPhone && (oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone))) return true;
      if (o.customerSessionId && (o.customerSessionId === cleanLeadId || o.customerSessionId === lead.id)) return true;
      if (o.orderId && o.orderId === lead.contentId) return true;
      return false;
    });
  };

  const getUserTotalSpent = (lead: VipLeadItem) => {
    if (lead.totalSpent !== undefined && lead.totalSpent > 0) return lead.totalSpent;
    const userOrders = getUserOrders(lead);
    return userOrders.filter((o) => o.status === 'paid').reduce((sum, o) => sum + (o.amount || 0), 0);
  };

  // Toggle VIP
  const handleToggleVip = async (lead: VipLeadItem) => {
    const newStatus = lead.vipStatus === 'active' ? 'free' : 'active';
    const newTier = newStatus === 'active' ? (lead.tier || 'Gold VIP') : 'Free Member';
    try {
      await updateVipLead(lead.id, {
        vipStatus: newStatus,
        tier: newTier,
        updatedAt: new Date().toISOString()
      });
      showToast(newStatus === 'active' ? `👑 ${lead.name} को VIP एक्सेस दिया गया` : `VIP एक्सेस हटाया गया`);
      onReload();
    } catch (err: any) {
      showToast(err.message || 'Failed to update VIP status', 'error');
    }
  };

  // Toggle Ban / Activate
  const handleToggleBan = async (lead: VipLeadItem) => {
    const isCurrentlyBanned = lead.status === 'banned' || lead.vipStatus === 'banned';
    const newStatus = isCurrentlyBanned ? 'active' : 'banned';
    const newVipStatus = isCurrentlyBanned ? 'free' : 'banned';
    try {
      await updateVipLead(lead.id, {
        status: newStatus,
        vipStatus: newVipStatus,
        updatedAt: new Date().toISOString()
      });
      showToast(isCurrentlyBanned ? `✅ User unbanned successfully` : `🚫 User banned from platform`);
      onReload();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Save Edit User Form
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingUser(true);
    try {
      await updateVipUserProfile(editingUser.id, {
        ...editFormData,
        updatedAt: new Date().toISOString()
      });
      showToast('✅ यूजर प्रोफाइल सफलतापूर्वक अपडेट हो गई');
      setEditingUser(null);
      onReload();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error');
    } finally {
      setIsSavingUser(false);
    }
  };

  // Change User ID Handler
  const handleChangeUserIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changingUserIdUser || !newUserIdInput.trim()) return;
    setIsChangingUserId(true);
    try {
      const res = await changeVipUserId(changingUserIdUser.id, newUserIdInput.trim(), changingUserIdUser);
      showToast(`✅ ${res.message}`);
      setChangingUserIdUser(null);
      setNewUserIdInput('');
      onReload();
    } catch (err: any) {
      showToast(err.message || 'Failed to change User ID', 'error');
    } finally {
      setIsChangingUserId(false);
    }
  };

  // Change Profile Photo Upload to Cloudinary
  const handlePhotoUpload = async (file: File) => {
    if (!changingPhotoUser || !file) return;
    setIsUploadingPhoto(true);
    try {
      showToast('⏳ Uploading avatar to Cloudinary...');
      const res = await uploadFileToStorage(file, 'photos', `user_${changingPhotoUser.id}_${Date.now()}`);
      if (res && res.downloadUrl) {
        await updateVipUserProfile(changingPhotoUser.id, {
          photoUrl: res.downloadUrl,
          profilePicUrl: res.downloadUrl,
          cloudinaryPublicId: res.storagePath,
          updatedAt: new Date().toISOString()
        });
        showToast('✅ प्रोफाइल फोटो सफलतापूर्वक बदल दी गई!');
        setChangingPhotoUser(null);
        onReload();
      }
    } catch (err: any) {
      showToast(err.message || 'Photo upload failed', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Delete User Confirm
  const handleDeleteUserConfirm = async () => {
    if (!deletingUser) return;
    setIsDeletingUser(true);
    try {
      await deleteVipLead(deletingUser.id);
      showToast('🗑️ यूजर डेटाबेस से डिलीट कर दिया गया');
      setDeletingUser(null);
      onReload();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Create User Submit
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.phone) {
      showToast('कृपया नाम और मोबाइल नंबर भरें', 'error');
      return;
    }
    setIsCreatingUser(true);
    try {
      const cleanPhone = newUserData.phone.replace(/[^0-9]/g, '');
      const customUserId = newUserData.userId?.trim() || `usr_${cleanPhone.slice(-6)}_${Math.random().toString(36).substring(2, 6)}`;
      await createVipLead({
        ...newUserData,
        id: customUserId,
        userId: customUserId,
        phone: cleanPhone,
        totalSpent: 0,
        unlockedCount: 0,
        createdAt: new Date().toISOString()
      });
      showToast('✅ नया यूजर रिकॉर्ड सफलतापूर्वक बन गया');
      setShowAddUserModal(false);
      setNewUserData({
        name: '',
        phone: '',
        email: '',
        username: '',
        tier: 'Gold VIP',
        status: 'active',
        vipStatus: 'active',
        notes: ''
      });
      onReload();
    } catch (err: any) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (vipLeads.length === 0) {
      showToast('No user records to export', 'error');
      return;
    }
    const headers = ['User ID', 'Username', 'Name', 'Phone', 'Email', 'VIP Status', 'Tier', 'Status', 'Total Spent', 'Registered Date', 'Notes'];
    const rows = vipLeads.map((l) => [
      l.userId || l.id,
      l.username || '',
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      l.vipStatus || 'free',
      l.tier || 'Free Member',
      l.status || 'active',
      getUserTotalSpent(l),
      l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '',
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ruma_vip_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 Users exported to CSV!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm">
        <div>
          <h2 className="font-display font-black text-xl text-purple-950 flex items-center gap-2">
            <Users className="w-6 h-6 text-pink-600" />
            <span>Complete User & Member Management (सम्पूर्ण यूजर प्रबंधन)</span>
          </h2>
          <p className="text-xs text-purple-900/70 font-medium mt-0.5">
            Full control over registered users, VIP memberships, User IDs, profile photos, order dossiers, and statuses.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-black shadow-md shadow-pink-600/20 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add User / Member</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-950 text-xs font-bold border border-purple-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export all users to CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-purple-700" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-purple-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search by name, phone, user ID, email, username or tier..."
            className="w-full bg-white border border-purple-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-purple-950 placeholder-purple-900/40 shadow-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setUserFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              userFilter === 'all'
                ? 'bg-purple-950 text-white shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900'
            }`}
          >
            All Users ({vipLeads.length})
          </button>

          <button
            type="button"
            onClick={() => setUserFilter('vip')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              userFilter === 'vip'
                ? 'bg-amber-500 text-purple-950 font-black shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-700 fill-amber-500" />
            <span>VIP Members ({vipLeads.filter((l) => l.vipStatus === 'active').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setUserFilter('free')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              userFilter === 'free'
                ? 'bg-purple-950 text-white shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900'
            }`}
          >
            Free Members ({vipLeads.filter((l) => l.vipStatus !== 'active' && l.status !== 'banned').length})
          </button>

          <button
            type="button"
            onClick={() => setUserFilter('banned')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              userFilter === 'banned'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800'
            }`}
          >
            Banned ({vipLeads.filter((l) => l.status === 'banned' || l.vipStatus === 'banned').length})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-3xl border border-white/80 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-purple-950">
            <thead className="bg-purple-100/70 text-purple-950/80 font-black uppercase text-[10px] tracking-wider border-b border-purple-200">
              <tr>
                <th className="py-3.5 px-4">User & Profile</th>
                <th className="py-3.5 px-4">User ID & Username</th>
                <th className="py-3.5 px-4">Contact & WhatsApp</th>
                <th className="py-3.5 px-4">VIP Tier & Status</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-center">VIP Access</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 bg-white/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-purple-900/60 font-medium">
                    <Users className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                    No user records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((lead, idx) => {
                  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
                  const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
                  const isVip = lead.vipStatus === 'active';
                  const isBanned = lead.status === 'banned' || lead.vipStatus === 'banned';
                  const totalSpent = getUserTotalSpent(lead);
                  const effectiveUserId = lead.userId || lead.id;
                  const photoSrc = lead.photoUrl || lead.profilePicUrl;

                  return (
                    <tr
                      key={lead.id || idx}
                      className={`hover:bg-purple-50/70 transition-colors ${
                        isBanned ? 'bg-rose-50/40 opacity-75' : ''
                      }`}
                    >
                      {/* User Avatar & Name */}
                      <td className="py-3.5 px-4 font-bold text-purple-950">
                        <div className="flex items-center gap-3">
                          <div className="relative group">
                            {photoSrc ? (
                              <img
                                src={photoSrc}
                                alt={lead.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-pink-300 shadow-xs"
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-xs ${
                                  isVip
                                    ? 'bg-gradient-to-tr from-amber-400 to-yellow-200 text-purple-950 border border-amber-300'
                                    : 'bg-pink-100 text-pink-600 border border-pink-200'
                                }`}
                              >
                                {(lead.name || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => setChangingPhotoUser(lead)}
                              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-purple-950 text-white hover:bg-pink-600 transition-colors shadow-xs"
                              title="Change Profile Photo (Cloudinary)"
                            >
                              <Camera className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-purple-950 text-xs">{lead.name || 'VIP Member'}</span>
                              {isVip && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
                              {isBanned && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-200 text-rose-800">
                                  BANNED
                                </span>
                              )}
                            </div>
                            {lead.email && (
                              <span className="text-[10px] text-purple-900/50 block font-normal">{lead.email}</span>
                            )}
                            {lead.bio && (
                              <span className="text-[10px] text-purple-900/60 block italic line-clamp-1">{lead.bio}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* User ID & Username */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[11px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-100">
                              {effectiveUserId}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(effectiveUserId, lead.id)}
                              className="p-1 hover:bg-purple-100 rounded text-purple-500"
                              title="Copy User ID"
                            >
                              {copiedId === lead.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-purple-900/60 font-medium">
                              {lead.username ? `@${lead.username}` : 'No username'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setChangingUserIdUser(lead);
                                setNewUserIdInput(effectiveUserId);
                              }}
                              className="text-[10px] text-purple-700 hover:text-pink-600 font-bold underline cursor-pointer"
                              title="Change User ID"
                            >
                              Change ID
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Contact & WhatsApp */}
                      <td className="py-3.5 px-4 font-bold text-purple-900">
                        {cleanPhone ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs">+91 {cleanPhone.slice(-10)}</span>
                            <a
                              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                                `Hello ${lead.name || ''}! Ruma Cute Girl VIP Gallery se aapka VIP account update information.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-colors"
                              title="WhatsApp Chat"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                            <a
                              href={`tel:+91${cleanPhone.slice(-10)}`}
                              className="p-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 transition-colors"
                              title="Direct Phone Call"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-purple-400 text-[11px]">Direct Lead</span>
                        )}
                      </td>

                      {/* VIP Tier & Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
                              isVip
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-purple-100 text-purple-800 border-purple-200'
                            }`}
                          >
                            {isVip ? (
                              <>
                                <Crown className="w-3 h-3 text-amber-600" />
                                <span>{lead.tier || 'Gold VIP'}</span>
                              </>
                            ) : (
                              <span>{lead.tier || 'Free Member'}</span>
                            )}
                          </span>

                          <div className="text-[10px] font-semibold text-purple-900/60">
                            Status: <strong className={isBanned ? 'text-rose-600' : 'text-emerald-700'}>{lead.status || 'active'}</strong>
                          </div>
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4">
                        <span className="font-display font-black text-xs text-purple-950">
                          {formatINR(totalSpent)}
                        </span>
                        <span className="text-[10px] text-purple-900/50 block font-normal">
                          {getUserOrders(lead).length} order(s)
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-purple-900/60 font-medium text-[11px]">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Recent'}
                      </td>

                      {/* Toggle VIP */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleVip(lead)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all active:scale-95 cursor-pointer shadow-2xs ${
                            isVip
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                          title={isVip ? 'Revoke VIP Status' : 'Grant VIP Status'}
                        >
                          {isVip ? 'Revoke VIP' : '👑 Make VIP'}
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Dossier */}
                          <button
                            type="button"
                            onClick={() => setSelectedUserForDetails(lead)}
                            className="p-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 transition-colors"
                            title="View Full User Details & Linked Payments Dossier"
                          >
                            <Eye className="w-3.5 h-3.5 text-pink-600" />
                          </button>

                          {/* Edit User Info */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(lead);
                              setEditFormData({
                                name: lead.name,
                                username: lead.username,
                                phone: lead.phone,
                                email: lead.email,
                                tier: lead.tier || 'Gold VIP',
                                status: lead.status || 'active',
                                vipStatus: lead.vipStatus || 'free',
                                notes: lead.notes,
                                bio: lead.bio
                              });
                            }}
                            className="p-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 transition-colors"
                            title="Edit User Profile Information"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-purple-700" />
                          </button>

                          {/* Ban / Unban */}
                          <button
                            type="button"
                            onClick={() => handleToggleBan(lead)}
                            className={`p-1.5 rounded-xl border transition-colors ${
                              isBanned
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            }`}
                            title={isBanned ? 'Unban user' : 'Ban user'}
                          >
                            {isBanned ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete User */}
                          <button
                            type="button"
                            onClick={() => setDeletingUser(lead)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                            title="Delete user permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: VIEW FULL USER DOSSIER & PAYMENT HISTORY */}
      {/* ---------------------------------------------------- */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 border border-white/90 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center font-black text-lg overflow-hidden border border-pink-200">
                  {selectedUserForDetails.photoUrl || selectedUserForDetails.profilePicUrl ? (
                    <img
                      src={selectedUserForDetails.photoUrl || selectedUserForDetails.profilePicUrl}
                      alt={selectedUserForDetails.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (selectedUserForDetails.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-purple-950 flex items-center gap-2">
                    {selectedUserForDetails.name}
                    {selectedUserForDetails.vipStatus === 'active' && (
                      <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                    )}
                  </h3>
                  <p className="text-xs text-purple-900/60 font-medium">
                    User ID: <code className="font-mono text-pink-700 font-bold">{selectedUserForDetails.userId || selectedUserForDetails.id}</code>
                    {selectedUserForDetails.username && ` • @${selectedUserForDetails.username}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForDetails(null)}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-purple-900/60 block font-bold">Total Spent</span>
                <span className="font-display font-black text-base text-purple-950">
                  {formatINR(getUserTotalSpent(selectedUserForDetails))}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-purple-900/60 block font-bold">Membership Tier</span>
                <span className="font-black text-pink-700">
                  {selectedUserForDetails.tier || 'Free Member'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-purple-900/60 block font-bold">Account Status</span>
                <span className="font-bold text-emerald-700">
                  {selectedUserForDetails.status || 'Active'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-purple-900/60 block font-bold">Orders Placed</span>
                <span className="font-bold text-purple-950">
                  {getUserOrders(selectedUserForDetails).length} Orders
                </span>
              </div>
            </div>

            {/* Contact Details & Direct WhatsApp Action */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs space-y-2">
              <h4 className="font-black text-purple-950 uppercase text-[10px] tracking-wider">Contact Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-purple-900/60 block">Mobile Phone:</span>
                  <span className="font-mono font-bold text-purple-950">
                    {selectedUserForDetails.phone ? `+91 ${selectedUserForDetails.phone}` : 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-purple-900/60 block">Email Address:</span>
                  <span className="font-bold text-purple-950">
                    {selectedUserForDetails.email || 'Not provided'}
                  </span>
                </div>
              </div>

              {selectedUserForDetails.notes && (
                <div className="pt-2 border-t border-purple-200/60">
                  <span className="text-purple-900/60 block">Admin Notes:</span>
                  <p className="font-medium text-purple-950">{selectedUserForDetails.notes}</p>
                </div>
              )}
            </div>

            {/* Linked Payment Orders Dossier */}
            <div className="space-y-3">
              <h4 className="font-black text-purple-950 text-sm flex items-center justify-between">
                <span>Linked Orders & Payments ({getUserOrders(selectedUserForDetails).length})</span>
                <span className="text-[11px] text-purple-900/60 font-normal">Auto-linked by phone & User ID</span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {getUserOrders(selectedUserForDetails).length === 0 ? (
                  <div className="p-4 rounded-2xl bg-purple-50 text-center text-purple-900/60 text-xs">
                    No orders linked to this user yet.
                  </div>
                ) : (
                  getUserOrders(selectedUserForDetails).map((ord) => (
                    <div
                      key={ord.orderId}
                      className="p-3 rounded-2xl bg-white border border-purple-100 shadow-2xs flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-pink-700">{ord.orderId}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              ord.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'waiting_verification'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                        <div className="font-bold text-purple-950 mt-0.5">{ord.contentTitle}</div>
                        {ord.transactionRef && (
                          <div className="text-[10px] text-purple-900/50 font-mono">UTR: {ord.transactionRef}</div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="font-black text-purple-950">{formatINR(ord.amount)}</div>
                        <div className="text-[10px] text-purple-900/50">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-purple-100">
              {selectedUserForDetails.phone ? (
                <a
                  href={`https://wa.me/91${selectedUserForDetails.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${selectedUserForDetails.name}! Ruma Cute Girl VIP Gallery se aapka account update.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedUserForDetails(null)}
                className="px-5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: EDIT USER PROFILE INFORMATION */}
      {/* ---------------------------------------------------- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 border border-white/90 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-purple-950">
                    यूजर प्रोफाइल संपादित करें (Edit Profile)
                  </h3>
                  <p className="text-[11px] text-purple-900/60 font-medium">Update name, contact, VIP tier, status and notes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-purple-950 block mb-1">Full Name (पूरा नाम) *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 shadow-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-950 block mb-1">Username (@username)</label>
                  <input
                    type="text"
                    value={editFormData.username || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    placeholder="e.g. rahul_vip"
                    className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 shadow-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-purple-950 block mb-1">WhatsApp / Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 shadow-xs font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-950 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 shadow-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-purple-950 block mb-1">VIP Membership Tier</label>
                  <select
                    value={editFormData.tier || 'Gold VIP'}
                    onChange={(e) => setEditFormData({ ...editFormData, tier: e.target.value })}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-bold shadow-xs"
                  >
                    <option value="Gold VIP">👑 Gold VIP (₹199)</option>
                    <option value="Diamond VIP">👑 Diamond VIP (₹499)</option>
                    <option value="Lifetime VIP">👑 Lifetime VIP (₹999)</option>
                    <option value="Free Member">Free Member</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-purple-950 block mb-1">Account Status</label>
                  <select
                    value={editFormData.status || 'active'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-bold shadow-xs"
                  >
                    <option value="active">Active (चालू)</option>
                    <option value="inactive">Inactive (निष्क्रिय)</option>
                    <option value="banned">Banned (प्रतिबंधित)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">Bio / Profile Tagline</label>
                <input
                  type="text"
                  value={editFormData.bio || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  placeholder="e.g. VIP Club Member since 2024"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">Admin Notes (आंतरिक टिप्पणी)</label>
                <textarea
                  rows={2}
                  value={editFormData.notes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Notes about payments or VIP requests"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="glow-pink-btn px-6 py-2 rounded-xl text-white font-black shadow-md shadow-pink-500/25"
                >
                  {isSavingUser ? 'Saving...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: CHANGE USER ID (WITH DATA PRESERVATION) */}
      {/* ---------------------------------------------------- */}
      {changingUserIdUser && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-white/90 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
              <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-purple-950">
                  User ID बदलें (Change User ID)
                </h3>
                <p className="text-[11px] text-purple-900/60 font-medium">Safe migration preserves all user payments & links</p>
              </div>
            </div>

            <form onSubmit={handleChangeUserIdSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                <span className="text-purple-900/60 block font-bold">Current User ID:</span>
                <span className="font-mono font-black text-pink-700 text-sm">
                  {changingUserIdUser.userId || changingUserIdUser.id}
                </span>
                <span className="text-[10px] text-purple-900/50 block mt-0.5">
                  User: {changingUserIdUser.name} ({changingUserIdUser.phone})
                </span>
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">New Unique User ID *</label>
                <input
                  type="text"
                  required
                  value={newUserIdInput}
                  onChange={(e) => setNewUserIdInput(e.target.value)}
                  placeholder="e.g. usr_vip_9988 or custom_id"
                  className="w-full bg-white border-2 border-pink-300 rounded-xl px-3.5 py-2.5 text-purple-950 font-mono font-bold shadow-xs focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-[10px] text-purple-900/60 mt-1">
                  ⚠️ Changing User ID will automatically transfer all verified orders and subscriptions.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setChangingUserIdUser(null)}
                  className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingUserId}
                  className="glow-pink-btn px-6 py-2 rounded-xl text-white font-black shadow-md shadow-pink-500/25"
                >
                  {isChangingUserId ? 'Migrating ID...' : 'Confirm New User ID'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: CHANGE USER PROFILE PHOTO (CLOUDINARY) */}
      {/* ---------------------------------------------------- */}
      {changingPhotoUser && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-white/90 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-purple-950">
                    User Profile Photo बदलें
                  </h3>
                  <p className="text-[11px] text-purple-900/60 font-medium">Upload new avatar directly to Cloudinary</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChangingPhotoUser(null)}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-pink-400 shadow-md">
                {changingPhotoUser.photoUrl || changingPhotoUser.profilePicUrl ? (
                  <img
                    src={changingPhotoUser.photoUrl || changingPhotoUser.profilePicUrl}
                    alt={changingPhotoUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-pink-100 text-pink-600 flex items-center justify-center font-black text-2xl">
                    {(changingPhotoUser.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <label className="inline-block px-5 py-2.5 rounded-2xl glow-pink-btn text-white text-xs font-black shadow-md cursor-pointer active:scale-95 transition-transform">
                  {isUploadingPhoto ? 'Uploading to Cloudinary...' : '📷 Choose Photo from Gallery'}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingPhoto}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handlePhotoUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-purple-900/60 mt-1.5">
                  Preset: <code>rumacutegirl</code> | Folder: <code>website-media</code>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-purple-100">
              <button
                type="button"
                onClick={() => setChangingPhotoUser(null)}
                className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 5: CONFIRM DELETE USER */}
      {/* ---------------------------------------------------- */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-purple-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-purple-950">
                  यूजर डिलीट करें (Delete User Record)
                </h3>
                <p className="text-xs text-purple-900/60 font-medium">
                  User: <span className="font-bold text-purple-950">{deletingUser.name}</span>
                </p>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-purple-900/60">Phone:</span>
                <span className="font-bold text-purple-950">{deletingUser.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-900/60">VIP Tier:</span>
                <span className="font-bold text-amber-700">{deletingUser.tier || 'Free'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-900/60">Total Spent:</span>
                <span className="font-black text-emerald-700">{formatINR(getUserTotalSpent(deletingUser))}</span>
              </div>
            </div>

            <p className="text-xs text-purple-900/80 leading-relaxed font-medium">
              क्या आप वाकई इस यूजर रिकॉर्ड को हटाना चाहते हैं? (वित्तीय ऑडिट ट्रेल सुरक्षित रहेगी)।
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={handleDeleteUserConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {isDeletingUser ? 'डिलीट हो रहा है...' : 'हाँ, डिलीट करें (Delete)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 6: ADD NEW USER / VIP MEMBER */}
      {/* ---------------------------------------------------- */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-white/90 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-purple-950">
                    नया यूजर / VIP सदस्य जोड़ें
                  </h3>
                  <p className="text-[11px] text-purple-900/60 font-medium">Create direct user record or grant VIP access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-purple-950 block mb-1">Customer / User Name *</label>
                <input
                  type="text"
                  required
                  value={newUserData.name || ''}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">WhatsApp / Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newUserData.phone || ''}
                  onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-purple-950 shadow-xs font-mono font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-purple-950 block mb-1">Username (Optional)</label>
                  <input
                    type="text"
                    value={newUserData.username || ''}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                    placeholder="e.g. rahul_vip"
                    className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 shadow-xs font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-950 block mb-1">Custom User ID (Optional)</label>
                  <input
                    type="text"
                    value={newUserData.userId || ''}
                    onChange={(e) => setNewUserData({ ...newUserData, userId: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 shadow-xs font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={newUserData.email || ''}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="e.g. rahul@gmail.com"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">VIP Tier / Membership Plan</label>
                <select
                  value={newUserData.tier}
                  onChange={(e) => setNewUserData({ ...newUserData, tier: e.target.value })}
                  className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-purple-950 font-bold shadow-xs"
                >
                  <option value="Gold VIP">👑 Gold VIP (₹199)</option>
                  <option value="Diamond VIP">👑 Diamond VIP (₹499)</option>
                  <option value="Lifetime VIP">👑 Lifetime VIP (₹999)</option>
                  <option value="Free Member">Free Member</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-purple-950 block mb-1">Admin Notes (टिप्पणी)</label>
                <input
                  type="text"
                  value={newUserData.notes || ''}
                  onChange={(e) => setNewUserData({ ...newUserData, notes: e.target.value })}
                  placeholder="e.g. Added manually by Admin / Paid via Cash"
                  className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2 text-purple-950 shadow-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="glow-pink-btn px-5 py-2 rounded-xl text-white font-black shadow-md shadow-pink-500/25"
                >
                  {isCreatingUser ? 'Creating...' : 'Save User Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
