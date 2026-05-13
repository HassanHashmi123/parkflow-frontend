'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Plus, X, Edit2, Power, Sparkles, Loader2, Search,
  Upload, Download, Phone, User, MapPin, Hash, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { shopsApi } from '@/lib/api';
import { useAuth, canAccess } from '@/lib/auth';
import TopBar from '@/components/TopBar';
import { ListItemSkeleton } from '@/components/Skeletons';
import ConfirmModal from '@/components/ConfirmModal';

export default function ShopsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  // Add form
  const [form, setForm] = useState({ shop_number: '', shop_name: '', owner_name: '', owner_phone: '', owner_cnic: '', floor: '', block: '', monthly_fee: '', notes: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user && !canAccess(user?.role, ['admin'])) {
      toast.error('Admin access required');
      router.replace('/');
    }
  }, [user, router]);

  const loadData = async () => {
    try {
      const data = await shopsApi.list({ limit: 500 });
      setShops(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = shops.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.shop_number.toLowerCase().includes(q) || s.owner_name.toLowerCase().includes(q) || (s.shop_name && s.shop_name.toLowerCase().includes(q));
  });

  const stats = {
    total: shops.length,
    active: shops.filter((s) => s.is_active).length,
    totalFee: shops.filter((s) => s.is_active).reduce((sum: number, s: any) => sum + (s.monthly_fee || 0), 0),
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shop_number.trim() || !form.owner_name.trim()) return toast.error('Shop number and owner name required');
    setAdding(true);
    try {
      await shopsApi.create({
        ...form,
        monthly_fee: form.monthly_fee ? parseFloat(form.monthly_fee) : 0,
      });
      toast.success(`Shop ${form.shop_number} added`);
      setForm({ shop_number: '', shop_name: '', owner_name: '', owner_phone: '', owner_cnic: '', floor: '', block: '', monthly_fee: '', notes: '' });
      setShowAdd(false);
      await loadData();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed to add shop'); }
    finally { setAdding(false); }
  };

  const handleBulkUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await shopsApi.bulkUpload(file);
      toast.success(`Created: ${result.created}, Skipped: ${result.skipped}, Errors: ${result.errors}`);
      await loadData();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Upload failed'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const startEdit = (shop: any) => {
    setEditingId(shop.id);
    setEditValues({ shop_name: shop.shop_name || '', owner_name: shop.owner_name, owner_phone: shop.owner_phone || '', monthly_fee: String(shop.monthly_fee || 0) });
  };

  const saveEdit = async (id: number) => {
    setActionLoading(true);
    try {
      await shopsApi.update(id, { ...editValues, monthly_fee: parseFloat(editValues.monthly_fee) || 0 });
      toast.success('Updated');
      setEditingId(null);
      await loadData();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Update failed'); }
    finally { setActionLoading(false); }
  };

  const handleToggleActive = async () => {
    if (!confirmDeactivate) return;
    setActionLoading(true);
    try {
      await shopsApi.deactivate(confirmDeactivate.id);
      toast.success(`${confirmDeactivate.shop_number} deactivated`);
      setConfirmDeactivate(null);
      await loadData();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6">
      <TopBar />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <motion.div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-teal-300 to-emerald-300 opacity-20 blur-3xl" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Admin · Plaza Management</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Manage <span className="gradient-text">Shops</span></h2>
            <p className="text-slate-500 text-sm mt-1">Add shops, manage owners, and track monthly fees</p>
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleBulkUpload(e.target.files[0])} />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => fileRef.current?.click()} disabled={uploading} className="glass px-4 py-3 rounded-2xl text-slate-700 font-semibold flex items-center gap-2 hover:bg-white disabled:opacity-50">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              CSV Upload
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)} className="btn-gradient px-5 py-3 rounded-2xl text-white font-semibold flex items-center gap-2 shadow-lg">
              <Plus className="w-5 h-5" /> Add Shop
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-strong rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Shops</p>
          <p className="text-3xl font-bold gradient-text mt-1">{stats.total}</p>
        </div>
        <div className="glass-strong rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.active}</p>
        </div>
        <div className="glass-strong rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Monthly Revenue</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">Rs. {stats.totalFee.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-strong rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by shop number, name, or owner..." className="input-glass w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
        </div>
      </div>

      {/* Shop list */}
      {loading ? (
        <div className="space-y-2"><ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-strong rounded-3xl p-12 text-center">
          <Store className="w-16 h-16 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No shops found</p>
          <p className="text-xs text-slate-400 mt-1">Add shops manually or upload CSV</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-slate-500 px-2">{filtered.length} shops</p>
          <AnimatePresence>
            {filtered.map((shop, idx) => {
              const isEditing = editingId === shop.id;
              return (
                <motion.div key={shop.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.02 }} className={`glass-strong rounded-2xl p-4 ${!shop.is_active ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                      {shop.shop_number.slice(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 font-mono">{shop.shop_number}</span>
                        {isEditing ? (
                          <input type="text" value={editValues.shop_name} onChange={(e) => setEditValues({ ...editValues, shop_name: e.target.value })} className="input-glass px-2 py-0.5 rounded-lg text-sm w-40" />
                        ) : shop.shop_name && (
                          <span className="text-sm text-slate-600">· {shop.shop_name}</span>
                        )}
                        {!shop.is_active && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase">Inactive</span>}
                        {shop.floor && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">{shop.floor} · {shop.block}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{isEditing ? <input type="text" value={editValues.owner_name} onChange={(e) => setEditValues({ ...editValues, owner_name: e.target.value })} className="input-glass px-1 py-0.5 rounded text-xs w-28" /> : shop.owner_name}</span>
                        {(isEditing ? editValues.owner_phone : shop.owner_phone) && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{isEditing ? <input type="text" value={editValues.owner_phone} onChange={(e) => setEditValues({ ...editValues, owner_phone: e.target.value })} className="input-glass px-1 py-0.5 rounded text-xs w-28" /> : shop.owner_phone}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      {isEditing ? (
                        <div className="flex items-center gap-1"><span className="text-xs text-slate-500">Rs.</span><input type="number" value={editValues.monthly_fee} onChange={(e) => setEditValues({ ...editValues, monthly_fee: e.target.value })} className="input-glass px-2 py-0.5 rounded-lg text-sm font-bold w-20" /></div>
                      ) : (
                        <><p className="text-[10px] text-slate-400 uppercase font-bold">Monthly</p><p className="font-bold gradient-text">Rs. {shop.monthly_fee?.toLocaleString() || 0}</p></>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {isEditing ? (
                        <>
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => saveEdit(shop.id)} disabled={actionLoading} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50">{actionLoading ? '...' : 'Save'}</motion.button>
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">Cancel</motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startEdit(shop)} title="Edit" className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5" /></motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setConfirmDeactivate(shop)} title="Deactivate" className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center"><Power className="w-3.5 h-3.5" /></motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => !adding && setShowAdd(false)}>
            <motion.div initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.7, y: 30 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500 p-6 text-white relative">
                <button onClick={() => !adding && setShowAdd(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><X className="w-4 h-4" /></button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Store className="w-5 h-5" /></div>
                  <div><p className="text-xs font-semibold opacity-90 uppercase tracking-wider">New Shop</p><p className="text-lg font-bold">Add to Plaza</p></div>
                </div>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Shop Number *</label><input type="text" value={form.shop_number} onChange={(e) => setForm({ ...form, shop_number: e.target.value.toUpperCase() })} placeholder="A-101" className="input-glass w-full px-3 py-2 rounded-xl text-sm font-mono" autoFocus /></div>
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Shop Name</label><input type="text" value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} placeholder="Ahmed Cloth House" className="input-glass w-full px-3 py-2 rounded-xl text-sm" /></div>
                </div>
                <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Owner Name *</label><input type="text" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} placeholder="Ahmed Khan" className="input-glass w-full px-3 py-2 rounded-xl text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone</label><input type="text" value={form.owner_phone} onChange={(e) => setForm({ ...form, owner_phone: e.target.value })} placeholder="03001234567" className="input-glass w-full px-3 py-2 rounded-xl text-sm" /></div>
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">CNIC</label><input type="text" value={form.owner_cnic} onChange={(e) => setForm({ ...form, owner_cnic: e.target.value })} placeholder="42101-1234567-1" className="input-glass w-full px-3 py-2 rounded-xl text-sm" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Floor</label><input type="text" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} placeholder="Ground" className="input-glass w-full px-3 py-2 rounded-xl text-sm" /></div>
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Block</label><input type="text" value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} placeholder="A" className="input-glass w-full px-3 py-2 rounded-xl text-sm" /></div>
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Monthly Fee</label><input type="number" value={form.monthly_fee} onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })} placeholder="3000" className="input-glass w-full px-3 py-2 rounded-xl text-sm" /></div>
                </div>
                <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Notes</label><input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." className="input-glass w-full px-3 py-2 rounded-xl text-sm" /></div>
                <motion.button type="submit" disabled={adding} whileHover={{ scale: adding ? 1 : 1.02 }} whileTap={{ scale: adding ? 1 : 0.98 }} className="btn-gradient w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-2">
                  {adding ? <><Loader2 className="w-4 h-4 animate-spin" />Adding...</> : <><Plus className="w-4 h-4" />Add Shop</>}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal open={!!confirmDeactivate} title={`Deactivate ${confirmDeactivate?.shop_number}?`} message="This shop and its vehicles will be marked inactive. Existing records preserved." confirmLabel="Deactivate" variant="danger" loading={actionLoading} onConfirm={handleToggleActive} onCancel={() => setConfirmDeactivate(null)} />
    </div>
  );
}
