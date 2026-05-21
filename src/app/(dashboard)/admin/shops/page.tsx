'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Plus, X, Edit2, Power, Sparkles, Loader2, Search,
  Upload, Phone, User, Building2, IdCard, Trash2, AlertTriangle, Car
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { shopsApi, permanentVehiclesApi, vehicleTypesApi } from '@/lib/api';
import { useAuth, canAccess } from '@/lib/auth';
import { BRANDING } from '@/config/branding';
import TopBar from '@/components/TopBar';
import { ListItemSkeleton } from '@/components/Skeletons';
import ConfirmModal from '@/components/ConfirmModal';

const OWN_PLAZA = BRANDING.plaza.shortName;

function PlazaBadge({ plaza }: { plaza?: string | null }) {
  if (!plaza) return null;
  const isOwn = plaza === OWN_PLAZA || plaza.toLowerCase().includes('saddar') || plaza === 'Own Plaza';
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
      isOwn
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-amber-50 text-amber-700 border border-amber-200'
    }`}>
      {plaza}
    </span>
  );
}

function MemberIdBadge({ memberId }: { memberId?: string | null }) {
  if (!memberId) return null;
  return (
    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold font-mono">
      #{memberId}
    </span>
  );
}

const EMPTY_FORM = {
  shop_number: '', shop_name: '', owner_name: '', owner_phone: '',
  owner_cnic: '', floor: '', block: '', monthly_fee: '', notes: '',
  member_id: '', plaza_name: '',
};

export default function ShopsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [shops, setShops] = useState<any[]>([]);
  const [plazas, setPlazas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlaza, setFilterPlaza] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<any>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetType, setResetType] = useState<'shops' | 'vehicles' | null>(null);
  const [resetInput, setResetInput] = useState('');
  const [resetting, setResetting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [vehicleRows, setVehicleRows] = useState<{ plate: string; type_id: string }[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);

  useEffect(() => {
    if (user && !canAccess(user?.role, ['admin'])) {
      toast.error('Admin access required');
      router.replace('/');
    }
  }, [user, router]);

  const loadData = async () => {
    try {
      const shopsData = await shopsApi.list({ limit: 500 });
      setShops(shopsData);
    } catch (e) {
      console.error('Failed to load shops:', e);
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
    try {
      const plazasData = await shopsApi.plazas();
      setPlazas(plazasData);
    } catch (e) {
      console.error('Failed to load plazas:', e);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Load vehicle types once for the vehicle rows dropdown
  useEffect(() => {
    vehicleTypesApi.list().then(setVehicleTypes).catch(console.error);
  }, []);

  const filtered = shops.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.shop_number.toLowerCase().includes(q) ||
      s.owner_name.toLowerCase().includes(q) ||
      (s.shop_name && s.shop_name.toLowerCase().includes(q)) ||
      (s.member_id && s.member_id.toLowerCase().includes(q));
    const matchPlaza = !filterPlaza || s.plaza_name === filterPlaza;
    return matchSearch && matchPlaza;
  });

  const stats = {
    total: shops.length,
    own: shops.filter((s) => !s.plaza_name || s.plaza_name === OWN_PLAZA || s.plaza_name === 'Own Plaza').length,
    neighbour: shops.filter((s) => s.plaza_name && s.plaza_name !== OWN_PLAZA && s.plaza_name !== 'Own Plaza').length,
    totalFee: shops.filter((s) => s.is_active).reduce((sum: number, s: any) => sum + (s.monthly_fee || 0), 0),
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shop_number.trim() || !form.owner_name.trim()) return toast.error('Shop number and owner name required');
    setAdding(true);
    try {
      const shopResult = await shopsApi.create({
        shop_number:  form.shop_number.trim(),
        shop_name:    form.shop_name.trim()    || undefined,
        owner_name:   form.owner_name.trim(),
        owner_phone:  form.owner_phone.trim()  || undefined,
        owner_cnic:   form.owner_cnic.trim()   || undefined,
        floor:        form.floor.trim()        || undefined,
        block:        form.block.trim()        || undefined,
        monthly_fee:  form.monthly_fee ? parseFloat(form.monthly_fee) : 0,
        notes:        form.notes.trim()        || undefined,
        member_id:    form.member_id.trim()    || undefined,
        plaza_name:   form.plaza_name.trim()   || undefined,
      });

      // Save vehicles linked to this shop
      let vehiclesSaved = 0;
      const validRows = vehicleRows.filter(v => v.plate.trim());
      for (const v of validRows) {
        try {
          await permanentVehiclesApi.create({
            plate_number: v.plate.trim().toUpperCase(),
            shop_id: shopResult.id,
            vehicle_type_id: parseInt(v.type_id) || vehicleTypes[0]?.id,
            owner_name: form.owner_name.trim(),
            owner_phone: form.owner_phone.trim() || undefined,
          });
          vehiclesSaved++;
        } catch (ve: any) {
          toast.error(`Vehicle ${v.plate}: ${ve.response?.data?.detail || 'failed'}`);
        }
      }

      const msg = vehiclesSaved > 0
        ? `Shop ${form.shop_number} + ${vehiclesSaved} vehicle(s) added`
        : `Shop ${form.shop_number} added`;
      toast.success(msg);
      setForm(EMPTY_FORM);
      setVehicleRows([]);
      setShowAdd(false);
      await loadData();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed to add shop'); }
    finally { setAdding(false); }
  };

  const handleBulkUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await shopsApi.bulkUpload(file);
      toast.success(`Shops: ${result.created} created · Vehicles: ${result.vehicles_created ?? 0} linked · Skipped: ${result.skipped}`);
      await loadData();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Upload failed'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const startEdit = (shop: any) => {
    setEditingId(shop.id);
    setEditValues({
      shop_name:    shop.shop_name    || '',
      owner_name:   shop.owner_name,
      owner_phone:  shop.owner_phone  || '',
      owner_cnic:   shop.owner_cnic   || '',
      monthly_fee:  String(shop.monthly_fee || 0),
      member_id:    shop.member_id    || '',
      plaza_name:   shop.plaza_name   || '',
    });
  };

  const saveEdit = async (id: number) => {
    setActionLoading(true);
    try {
      await shopsApi.update(id, {
        shop_name:   editValues.shop_name.trim()   || null,
        owner_name:  editValues.owner_name.trim(),
        owner_phone: editValues.owner_phone.trim() || null,
        owner_cnic:  editValues.owner_cnic.trim()  || null,
        monthly_fee: parseFloat(editValues.monthly_fee) || 0,
        member_id:   editValues.member_id.trim()   || null,
        plaza_name:  editValues.plaza_name.trim()  || null,
      });
      toast.success('Updated');
      setEditingId(null);
      await loadData();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Update failed'); }
    finally { setActionLoading(false); }
  };

  const handleResetAll = async () => {
    if (resetInput.trim() !== 'DELETE ALL' || !resetType) return;
    setResetting(true);
    try {
      let result: any;
      if (resetType === 'shops') {
        result = await shopsApi.resetAll();
        toast.success(`${result.deleted} shops (+ vehicles + payments) deleted`);
      } else {
        result = await permanentVehiclesApi.resetAll();
        toast.success(`${result.deleted} permanent vehicles deleted`);
      }
      setShowResetConfirm(false);
      setResetInput('');
      setResetType(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Reset failed');
    } finally {
      setResetting(false);
    }
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
            <p className="text-slate-500 text-sm mt-1">Member IDs, Plaza differentiation, monthly fees</p>
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
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setShowResetConfirm(true); setResetInput(''); }} className="px-4 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold flex items-center gap-2 border border-rose-200">
              <Trash2 className="w-4 h-4" /> Reset All
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-strong rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total</p>
          <p className="text-3xl font-bold gradient-text mt-1">{stats.total}</p>
        </div>
        <div className="glass-strong rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Own Plaza</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.own}</p>
        </div>
        <div className="glass-strong rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Neighbour</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{stats.neighbour}</p>
        </div>
        <div className="glass-strong rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Monthly Revenue</p>
          <p className="text-xl font-bold text-purple-600 mt-1">Rs. {stats.totalFee.toLocaleString()}</p>
        </div>
      </div>

      {/* Search + Plaza filter */}
      <div className="glass-strong rounded-2xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by shop, owner, or member ID..." className="input-glass w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
        </div>
        <select
          value={filterPlaza}
          onChange={(e) => setFilterPlaza(e.target.value)}
          className="input-glass px-3 py-2.5 rounded-xl text-sm text-slate-700 min-w-36"
        >
          <option value="">All Plazas</option>
          <option value={OWN_PLAZA}>Own Plaza</option>
          {plazas.filter(p => p !== OWN_PLAZA).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
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
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                      {shop.shop_number.slice(0, 3)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 font-mono">{shop.shop_number}</span>
                        {isEditing ? (
                          <input type="text" value={editValues.shop_name} onChange={(e) => setEditValues({ ...editValues, shop_name: e.target.value })} className="input-glass px-2 py-0.5 rounded-lg text-sm w-40" placeholder="Shop name" />
                        ) : shop.shop_name && (
                          <span className="text-sm text-slate-600">· {shop.shop_name}</span>
                        )}
                        {!shop.is_active && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase">Inactive</span>}
                        {shop.floor && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">{shop.floor} · {shop.block}</span>}
                        {/* Member ID badge */}
                        {isEditing ? (
                          <input type="text" value={editValues.member_id} onChange={(e) => setEditValues({ ...editValues, member_id: e.target.value })} className="input-glass px-2 py-0.5 rounded-lg text-xs font-mono w-24" placeholder="Member ID" />
                        ) : <MemberIdBadge memberId={shop.member_id} />}
                        {/* Plaza badge */}
                        {isEditing ? (
                          <input
                            type="text"
                            list="plaza-list"
                            value={editValues.plaza_name}
                            onChange={(e) => setEditValues({ ...editValues, plaza_name: e.target.value })}
                            className="input-glass px-2 py-0.5 rounded-lg text-xs w-32"
                            placeholder="Plaza name"
                          />
                        ) : <PlazaBadge plaza={shop.plaza_name} />}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {isEditing
                            ? <input type="text" value={editValues.owner_name} onChange={(e) => setEditValues({ ...editValues, owner_name: e.target.value })} className="input-glass px-1 py-0.5 rounded text-xs w-28" />
                            : shop.owner_name
                          }
                        </span>
                        {(isEditing || shop.owner_phone) && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {isEditing
                              ? <input type="text" value={editValues.owner_phone} onChange={(e) => setEditValues({ ...editValues, owner_phone: e.target.value })} placeholder="Phone" className="input-glass px-1 py-0.5 rounded text-xs w-28" />
                              : shop.owner_phone
                            }
                          </span>
                        )}
                        {(isEditing || shop.owner_cnic) && (
                          <span className="flex items-center gap-1 font-mono">
                            {isEditing
                              ? <input type="text" value={editValues.owner_cnic} onChange={(e) => setEditValues({ ...editValues, owner_cnic: e.target.value })} placeholder="CNIC" className="input-glass px-1 py-0.5 rounded text-xs w-32 font-mono" />
                              : shop.owner_cnic
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Monthly fee */}
                    <div className="text-right">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">Rs.</span>
                          <input type="number" value={editValues.monthly_fee} onChange={(e) => setEditValues({ ...editValues, monthly_fee: e.target.value })} className="input-glass px-2 py-0.5 rounded-lg text-sm font-bold w-20" />
                        </div>
                      ) : (
                        <>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Monthly</p>
                          <p className="font-bold gradient-text">Rs. {shop.monthly_fee?.toLocaleString() || 0}</p>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5">
                      {isEditing ? (
                        <>
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => saveEdit(shop.id)} disabled={actionLoading} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50">{actionLoading ? '...' : 'Save'}</motion.button>
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">Cancel</motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startEdit(shop)} className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5" /></motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setConfirmDeactivate(shop)} className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center"><Power className="w-3.5 h-3.5" /></motion.button>
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

      {/* datalist for plaza autocomplete */}
      <datalist id="plaza-list">
        <option value={OWN_PLAZA} />
        <option value="Own Plaza" />
        {plazas.map((p) => <option key={p} value={p} />)}
      </datalist>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => !adding && setShowAdd(false)}>
            <motion.div initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.7, y: 30 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">

              {/* Modal header */}
              <div className="bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500 p-6 text-white relative">
                <button onClick={() => !adding && setShowAdd(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><X className="w-4 h-4" /></button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Store className="w-5 h-5" /></div>
                  <div><p className="text-xs font-semibold opacity-90 uppercase tracking-wider">New Shop</p><p className="text-lg font-bold">Add to Plaza</p></div>
                </div>
              </div>

              <form onSubmit={handleAdd} className="p-6 space-y-3">
                {/* Shop Number + Shop Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Shop Number *</label>
                    <input type="text" value={form.shop_number} onChange={(e) => { const v = e.target.value.toUpperCase(); setForm(p => ({ ...p, shop_number: v })); }} placeholder="A-101" className="input-glass w-full px-3 py-2 rounded-xl text-sm font-mono" autoFocus />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Shop Name</label>
                    <input type="text" value={form.shop_name} onChange={(e) => { const v = e.target.value; setForm(p => ({ ...p, shop_name: v })); }} placeholder="Ahmed Cloth House" className="input-glass w-full px-3 py-2 rounded-xl text-sm" />
                  </div>
                </div>

                {/* Member ID + Plaza Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold uppercase text-slate-500 mb-1">
                      <IdCard className="w-3 h-3" /> Member ID
                    </label>
                    <input type="text" value={form.member_id} onChange={(e) => { const v = e.target.value.toUpperCase(); setForm(p => ({ ...p, member_id: v })); }} placeholder="SCM-001" className="input-glass w-full px-3 py-2 rounded-xl text-sm font-mono" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold uppercase text-slate-500 mb-1">
                      <Building2 className="w-3 h-3" /> Plaza
                    </label>
                    <input type="text" list="plaza-list-modal" value={form.plaza_name} onChange={(e) => { const v = e.target.value; setForm(p => ({ ...p, plaza_name: v })); }} placeholder="Own Plaza / Neighbour" className="input-glass w-full px-3 py-2 rounded-xl text-sm" />
                    <datalist id="plaza-list-modal">
                      <option value={OWN_PLAZA} />
                      <option value="Own Plaza" />
                      {plazas.map((p) => <option key={p} value={p} />)}
                    </datalist>
                  </div>
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Owner Name *</label>
                  <input type="text" value={form.owner_name} onChange={(e) => { const v = e.target.value; setForm(p => ({ ...p, owner_name: v })); }} placeholder="Ahmed Khan" className="input-glass w-full px-3 py-2 rounded-xl text-sm" />
                </div>

                {/* Phone + CNIC */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone</label>
                    <input type="text" value={form.owner_phone} onChange={(e) => { const v = e.target.value; setForm(p => ({ ...p, owner_phone: v })); }} placeholder="03001234567" className="input-glass w-full px-3 py-2 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">CNIC</label>
                    <input type="text" value={form.owner_cnic} onChange={(e) => { const v = e.target.value; setForm(p => ({ ...p, owner_cnic: v })); }} placeholder="42101-1234567-1" className="input-glass w-full px-3 py-2 rounded-xl text-sm" />
                  </div>
                </div>

                {/* Floor + Block + Monthly Fee */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Floor</label>
                    <input type="text" value={form.floor} onChange={(e) => { const v = e.target.value; setForm(p => ({ ...p, floor: v })); }} placeholder="Ground" className="input-glass w-full px-3 py-2 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Block</label>
                    <input type="text" value={form.block} onChange={(e) => { const v = e.target.value; setForm(p => ({ ...p, block: v })); }} placeholder="A" className="input-glass w-full px-3 py-2 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Monthly Fee</label>
                    <input type="number" value={form.monthly_fee} onChange={(e) => { const v = e.target.value; setForm(p => ({ ...p, monthly_fee: v })); }} placeholder="3000" className="input-glass w-full px-3 py-2 rounded-xl text-sm" />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Notes</label>
                  <input type="text" value={form.notes} onChange={(e) => { const v = e.target.value; setForm(p => ({ ...p, notes: v })); }} placeholder="Optional notes..." className="input-glass w-full px-3 py-2 rounded-xl text-sm" />
                </div>

                {/* ── Vehicles Section ── */}
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold uppercase text-slate-600">Vehicles (Optional)</span>
                    </div>
                    {vehicleRows.length < 5 && (
                      <button
                        type="button"
                        onClick={() => setVehicleRows(r => [...r, { plate: '', type_id: String(vehicleTypes[0]?.id || '') }])}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Vehicle
                      </button>
                    )}
                  </div>

                  {vehicleRows.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">
                      Koi vehicle add nahi ki — baad mein bhi kar sakte ho
                    </p>
                  )}

                  <div className="space-y-2">
                    {vehicleRows.map((row, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={row.plate}
                          onChange={(e) => {
                            const v = e.target.value.toUpperCase();
                            setVehicleRows(r => r.map((x, i) => i === idx ? { ...x, plate: v } : x));
                          }}
                          placeholder={`Plate ${idx + 1} (e.g. KMN-7188)`}
                          className="input-glass flex-1 px-3 py-2 rounded-xl text-sm font-mono"
                        />
                        <select
                          value={row.type_id}
                          onChange={(e) => {
                            const v = e.target.value;
                            setVehicleRows(r => r.map((x, i) => i === idx ? { ...x, type_id: v } : x));
                          }}
                          className="input-glass px-2 py-2 rounded-xl text-sm w-28"
                        >
                          {vehicleTypes.map(vt => (
                            <option key={vt.id} value={String(vt.id)}>{vt.name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setVehicleRows(r => r.filter((_, i) => i !== idx))}
                          className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.button type="submit" disabled={adding} whileHover={{ scale: adding ? 1 : 1.02 }} whileTap={{ scale: adding ? 1 : 0.98 }} className="btn-gradient w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-2">
                  {adding
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Adding...</>
                    : <><Plus className="w-4 h-4" />Add Shop{vehicleRows.filter(v => v.plate.trim()).length > 0 ? ` + ${vehicleRows.filter(v => v.plate.trim()).length} Vehicle(s)` : ''}</>
                  }
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal open={!!confirmDeactivate} title={`Deactivate ${confirmDeactivate?.shop_number}?`} message="This shop and its vehicles will be marked inactive. Existing records preserved." confirmLabel="Deactivate" variant="danger" loading={actionLoading} onConfirm={handleToggleActive} onCancel={() => setConfirmDeactivate(null)} />

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-r from-rose-500 to-red-600 p-5 text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Danger Zone</p>
                  <p className="text-lg font-bold">Kya delete karna hai?</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Step 1 — choose type */}
                {!resetType ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Option choose karo:</p>

                    {/* Shops option */}
                    <button
                      onClick={() => setResetType('shops')}
                      className="w-full text-left p-4 rounded-2xl border-2 border-rose-200 hover:border-rose-400 hover:bg-rose-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 group-hover:bg-rose-200 flex items-center justify-center flex-shrink-0">
                          <Store className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">Saare Shops Delete karo</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Shops + unki permanent vehicles + monthly payments — sab jayega
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Vehicles option */}
                    <button
                      onClick={() => setResetType('vehicles')}
                      className="w-full text-left p-4 rounded-2xl border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center flex-shrink-0">
                          <Trash2 className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">Saari Permanent Vehicles Delete karo</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Sirf permanent vehicles jayengi — shops baqi rahenge
                          </p>
                        </div>
                      </div>
                    </button>

                    <button onClick={() => { setShowResetConfirm(false); setResetInput(''); }} className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  /* Step 2 — confirm */
                  <div className="space-y-4">
                    <div className={`p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${resetType === 'shops' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {resetType === 'shops'
                        ? `${shops.length} shops + vehicles + payments permanently delete honge`
                        : 'Saari permanent vehicles permanently delete hongi'}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Confirm karne ke liye likho: <span className="text-rose-600 font-mono">DELETE ALL</span>
                      </label>
                      <input
                        type="text"
                        value={resetInput}
                        onChange={(e) => setResetInput(e.target.value)}
                        placeholder="DELETE ALL"
                        className="input-glass w-full px-4 py-3 rounded-xl text-sm font-mono border-2 border-rose-200 focus:border-rose-400 outline-none"
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => { setResetType(null); setResetInput(''); }} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors text-sm">
                        ← Back
                      </button>
                      <motion.button
                        onClick={handleResetAll}
                        disabled={resetInput.trim() !== 'DELETE ALL' || resetting}
                        whileTap={{ scale: 0.97 }}
                        className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm ${resetInput.trim() === 'DELETE ALL' && !resetting ? 'bg-rose-500 hover:bg-rose-600 text-white cursor-pointer' : 'bg-rose-200 text-rose-400 cursor-not-allowed'}`}
                      >
                        {resetting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete</>}
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
