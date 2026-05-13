'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Plus, X, Sparkles, Loader2, Search,
  Store, Calendar, Check, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { monthlyPaymentsApi, shopsApi } from '@/lib/api';
import { useAuth, canAccess } from '@/lib/auth';
import TopBar from '@/components/TopBar';
import { ListItemSkeleton } from '@/components/Skeletons';

export default function PaymentsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [payments, setPayments] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'paid' | 'pending'>('pending');
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');

  // Add form
  const [form, setForm] = useState({ shop_id: '', amount: '', payment_method: 'cash', receipt_number: '', notes: '' });

  useEffect(() => {
    if (user && !canAccess(user?.role, ['admin'])) {
      toast.error('Admin access required');
      router.replace('/');
    }
  }, [user, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, pend, summ, s] = await Promise.all([
        monthlyPaymentsApi.list({ month: currentMonth, limit: 500 }),
        monthlyPaymentsApi.pending(currentMonth),
        monthlyPaymentsApi.summary(currentMonth),
        shopsApi.list({ limit: 1000 }),
      ]);
      setPayments(p);
      setPending(Array.isArray(pend) ? pend : (pend?.pending_shops || []));
      setSummary(summ);
      setShops(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [currentMonth]);

  const monthLabel = (() => {
    const [y, m] = currentMonth.split('-');
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
  })();

  const prevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 2);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const nextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const filteredPaid = payments.filter((p: any) => {
    const q = search.toLowerCase();
    return !q || (p.shop_number && p.shop.shop_number.toLowerCase().includes(q)) || (p.shop?.owner_name && p.shop.owner_name.toLowerCase().includes(q));
  });
const filteredPending = (Array.isArray(pending) ? pending : []).filter((s: any) => {
    const q = search.toLowerCase();
    return !q || s.shop_number.toLowerCase().includes(q) || s.owner_name.toLowerCase().includes(q);
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shop_id) return toast.error('Select a shop');
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Enter valid amount');
    setAdding(true);
    try {
      await monthlyPaymentsApi.create({
        shop_id: parseInt(form.shop_id),
        month: currentMonth,
        amount: parseFloat(form.amount),
        payment_method: form.payment_method || undefined,
        receipt_number: form.receipt_number.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success('Payment recorded');
      setForm({ shop_id: '', amount: '', payment_method: 'cash', receipt_number: '', notes: '' });
      setShowAdd(false);
      await loadData();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed to record'); }
    finally { setAdding(false); }
  };

  const quickPay = async (shop: any) => {
    setAdding(true);
    try {
      await monthlyPaymentsApi.create({
        shop_id: shop.id,
        month: currentMonth,
        amount: shop.monthly_fee || 0,
        payment_method: 'cash',
      });
      toast.success(`${shop.shop_number} paid Rs. ${shop.monthly_fee}`);
      await loadData();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setAdding(false); }
  };

  return (
    <div className="space-y-6">
      <TopBar />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <motion.div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-amber-300 to-orange-300 opacity-20 blur-3xl" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Admin · Fee Collection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Monthly <span className="gradient-text">Payments</span></h2>
            <p className="text-slate-500 text-sm mt-1">Track shop fee collection and pending payments</p>
          </div>
          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)} className="btn-gradient px-5 py-3 rounded-2xl text-white font-semibold flex items-center gap-2 shadow-lg">
            <Plus className="w-5 h-5" /> Record Payment
          </motion.button>
        </div>
      </motion.div>

      {/* Month navigator */}
      <div className="glass-strong rounded-2xl p-4 flex items-center justify-between">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={prevMonth} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700">
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-800">{monthLabel}</p>
          <p className="text-xs text-slate-400 font-mono">{currentMonth}</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={nextMonth} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700">
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Stats */}
     {summary && (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <div className="glass-strong rounded-2xl p-4 text-center">
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Shops Paid</p>
      <p className="text-2xl font-bold text-emerald-600 mt-1">{summary.shops_paid || 0}</p>
    </div>
    <div className="glass-strong rounded-2xl p-4 text-center">
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Pending</p>
      <p className="text-2xl font-bold text-rose-600 mt-1">{pending.length}</p>
    </div>
    <div className="glass-strong rounded-2xl p-4 text-center">
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Collected</p>
      <p className="text-2xl font-bold gradient-text mt-1">Rs. {(summary.total_collected || 0).toLocaleString()}</p>
    </div>
    <div className="glass-strong rounded-2xl p-4 text-center">
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Collection Rate</p>
      <p className="text-2xl font-bold text-blue-600 mt-1">{summary.collection_rate || 0}%</p>
    </div>
  </div>
)}
      {/* Tab switch + Search */}
      <div className="glass-strong rounded-2xl p-4 flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTab('pending')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === 'pending' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>
            Pending ({pending.length})
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTab('paid')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === 'paid' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>
            Paid ({payments.length})
          </motion.button>
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shop or owner..." className="input-glass w-full pl-10 pr-4 py-2 rounded-xl text-sm" />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2"><ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton /></div>
      ) : tab === 'pending' ? (
        filteredPending.length === 0 ? (
          <div className="glass-strong rounded-3xl p-12 text-center">
            <Check className="w-16 h-16 mx-auto text-emerald-400 mb-3" />
            <p className="text-emerald-600 font-bold text-lg">All shops paid!</p>
            <p className="text-slate-400 text-sm">No pending payments for {monthLabel}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredPending.map((shop: any, idx: number) => (
                <motion.div key={shop.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }} className="glass-strong rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 font-mono">{shop.shop_number}</p>
                      {shop.shop_name && <span className="text-sm text-slate-600">· {shop.shop_name}</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{shop.owner_name}{shop.owner_phone ? ` · ${shop.owner_phone}` : ''}</p>
                  </div>
                  <div className="text-right mr-2">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Due</p>
                    <p className="font-bold text-rose-600">Rs. {(shop.monthly_fee || 0).toLocaleString()}</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => quickPay(shop)} disabled={adding} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-md disabled:opacity-50 flex items-center gap-1.5">
                    {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Mark Paid
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      ) : (
        filteredPaid.length === 0 ? (
          <div className="glass-strong rounded-3xl p-12 text-center">
            <CreditCard className="w-16 h-16 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No payments recorded for {monthLabel}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredPaid.map((p: any, idx: number) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }} className="glass-strong rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 font-mono">{p.shop_number || '—'}</p>
                      {p.shop_name && <span className="text-sm text-slate-600">· {p.shop_name}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                      <span>{p.owner_name}</span>
                      {p.payment_method && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold uppercase">{p.payment_method}</span>}
                      {p.receipt_number && <span>Receipt: {p.receipt_number}</span>}
                      {p.paid_at && <span>{new Date(p.paid_at).toLocaleDateString('en-PK')}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Paid</p>
                    <p className="font-bold text-emerald-600">Rs. {p.amount.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      )}

      {/* Record Payment Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => !adding && setShowAdd(false)}>
            <motion.div initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.7, y: 30 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 text-white relative">
                <button onClick={() => !adding && setShowAdd(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><X className="w-4 h-4" /></button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
                  <div><p className="text-xs font-semibold opacity-90 uppercase tracking-wider">Record</p><p className="text-lg font-bold">Monthly Payment — {monthLabel}</p></div>
                </div>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Shop *</label>
                  <select value={form.shop_id} onChange={(e) => {
                    const shopId = e.target.value;
                    setForm({ ...form, shop_id: shopId });
                    if (shopId) {
                      const shop = shops.find((s: any) => s.id === parseInt(shopId));
                      if (shop) setForm((f) => ({ ...f, shop_id: shopId, amount: String(shop.monthly_fee || '') }));
                    }
                  }} className="input-glass w-full px-3 py-2.5 rounded-xl text-sm">
                    <option value="">Select shop...</option>
                    {shops.filter((s: any) => s.is_active).map((s: any) => (
                      <option key={s.id} value={s.id}>{s.shop_number} — {s.owner_name} (Rs. {s.monthly_fee})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Amount (PKR) *</label>
                    <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="3000" className="input-glass w-full px-3 py-2.5 rounded-xl text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Method</label>
                    <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="input-glass w-full px-3 py-2.5 rounded-xl text-sm">
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="online">Online (JazzCash/EP)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Receipt #</label><input type="text" value={form.receipt_number} onChange={(e) => setForm({ ...form, receipt_number: e.target.value })} placeholder="Optional" className="input-glass w-full px-3 py-2 rounded-xl text-sm" /></div>
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Notes</label><input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" className="input-glass w-full px-3 py-2 rounded-xl text-sm" /></div>
                </div>
                <motion.button type="submit" disabled={adding} whileHover={{ scale: adding ? 1 : 1.02 }} whileTap={{ scale: adding ? 1 : 0.98 }} className="btn-gradient w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                  {adding ? <><Loader2 className="w-4 h-4 animate-spin" />Recording...</> : <><CreditCard className="w-4 h-4" />Record Payment</>}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
