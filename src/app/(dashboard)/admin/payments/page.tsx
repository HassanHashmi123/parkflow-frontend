'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Plus, X, Sparkles, Loader2, Search,
  Calendar, Check, AlertCircle, ChevronLeft, ChevronRight,
  Bell, Printer, Clock, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { monthlyPaymentsApi, shopsApi, permanentVehiclesApi } from '@/lib/api';
import { useAuth, canAccess } from '@/lib/auth';
import TopBar from '@/components/TopBar';
import { ListItemSkeleton } from '@/components/Skeletons';
import BRANDING from '@/config/branding';

// ─── Reminder Slip (printable) ───────────────────────────────────────────────
function ReminderSlip({ shop, onClose }: { shop: any; onClose: () => void }) {
  const slipRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = slipRef.current;
    if (!content) return;
    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) return;
    win.document.write(`
      <html><head><title>Billing Reminder</title>
      <style>
        @page { margin: 0; }
        body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 8px; width: 58mm; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 6px 0; }
        .warn { font-size: 13px; font-weight: bold; text-align: center; border: 2px solid #000; padding: 6px; margin: 6px 0; }
        .row { display: flex; justify-content: space-between; }
        .small { font-size: 10px; }
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const today = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
      >
        {/* Modal header */}
        <div className="bg-gradient-to-br from-rose-500 to-orange-500 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <p className="font-bold">Billing Reminder Slip</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        {/* Slip preview */}
        <div className="p-5">
          <div ref={slipRef} className="font-mono text-xs bg-white p-3 border border-dashed border-slate-300 rounded-xl">
            <div className="text-center font-bold text-sm mb-1">{BRANDING.plaza.name}</div>
            <div className="text-center text-[10px] text-slate-500 mb-1">{BRANDING.plaza.address}</div>
            <div className="border-t border-dashed border-slate-400 my-2" />
            <div className="text-center font-bold text-sm mb-2">⚠ BILLING REMINDER ⚠</div>
            <div className="border-t border-dashed border-slate-400 my-2" />
            <div className="flex justify-between"><span>Shop #:</span><span className="font-bold">{shop.shop_number}</span></div>
            {shop.shop_name && <div className="flex justify-between"><span>Shop:</span><span className="font-bold">{shop.shop_name}</span></div>}
            <div className="flex justify-between"><span>Owner:</span><span className="font-bold">{shop.owner_name}</span></div>
            {shop.owner_phone && <div className="flex justify-between"><span>Phone:</span><span>{shop.owner_phone}</span></div>}
            {shop.floor && <div className="flex justify-between"><span>Floor:</span><span>{shop.floor}</span></div>}
            <div className="border-t border-dashed border-slate-400 my-2" />
            <div className="flex justify-between"><span>Billing Start:</span><span className="font-bold">{formatDate(shop.billing_start)}</span></div>
            <div className="flex justify-between"><span>Billing End:</span><span className="font-bold">{formatDate(shop.billing_end)}</span></div>
            <div className="flex justify-between"><span>Monthly Fee:</span><span className="font-bold">Rs. {(shop.monthly_fee || 0).toLocaleString()}</span></div>
            <div className="border-t border-dashed border-slate-400 my-2" />
            <div className="border-2 border-black p-2 text-center font-bold text-[11px] my-2">
              YOUR MONTHLY BILLING HAS FINISHED.<br />
              KINDLY RENEW AS SOON AS POSSIBLE.
            </div>
            <div className="border-t border-dashed border-slate-400 my-2" />
            <div className="text-center text-[10px]">Printed: {today}</div>
            <div className="text-center text-[10px]">ParkFlow Management System</div>
          </div>

          <div className="flex gap-3 mt-4">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handlePrint}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <Printer className="w-4 h-4" /> Print Slip
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm"
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [payments, setPayments] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [pendingAmounts, setPendingAmounts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'paid' | 'pending' | 'reminders'>('pending');
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [slipShop, setSlipShop] = useState<any>(null);

  // Add form — billing dates default to month start/end
  const monthStart = `${currentMonth}-01`;
  const monthEnd = (() => {
    const [y, m] = currentMonth.split('-').map(Number);
    return new Date(y, m, 0).toISOString().slice(0, 10);
  })();
  const [form, setForm] = useState({
    shop_id: '', amount: '', payment_method: 'cash',
    receipt_number: '', notes: '',
    billing_start: monthStart, billing_end: monthEnd,
  });

  useEffect(() => {
    if (user && !canAccess(user?.role, ['admin'])) {
      toast.error('Admin access required');
      router.replace('/');
    }
  }, [user, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, pend, summ, s, v, rem] = await Promise.all([
        monthlyPaymentsApi.list({ month: currentMonth, limit: 500 }),
        monthlyPaymentsApi.pending(currentMonth),
        monthlyPaymentsApi.summary(currentMonth),
        shopsApi.list({ limit: 1000 }),
        permanentVehiclesApi.list({ limit: 500 }),
        monthlyPaymentsApi.reminders(),
      ]);
      const pendingShops = Array.isArray(pend) ? pend : (pend?.pending_shops || []);
      setPayments(p);
      setPending(pendingShops);
      setSummary(summ);
      setShops(s);
      setVehicles(Array.isArray(v) ? v : []);
      setReminders(rem?.reminders || []);
      setPendingAmounts(
        pendingShops.reduce((acc: Record<number, string>, shop: any) => {
          acc[shop.id] = String(shop.monthly_fee || 0);
          return acc;
        }, {})
      );
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [currentMonth]);

  // Keep billing dates in sync when month changes
  useEffect(() => {
    const start = `${currentMonth}-01`;
    const [y, m] = currentMonth.split('-').map(Number);
    const end = new Date(y, m, 0).toISOString().slice(0, 10);
    setForm((f) => ({ ...f, billing_start: start, billing_end: end }));
  }, [currentMonth]);

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

  const normalizeSearch = (value: string) => value.toLowerCase().replace(/[\s-]/g, '');
  const plateMatchesShop = (shopId: number, query: string) => {
    const normalizedQuery = normalizeSearch(query);
    return vehicles.some((v: any) =>
      v.shop_id === shopId &&
      normalizeSearch(v.plate_number || '').includes(normalizedQuery)
    );
  };

  const filteredPaid = payments.filter((p: any) => {
    const q = search.toLowerCase();
    return !q ||
      (p.shop_number && p.shop_number.toLowerCase().includes(q)) ||
      (p.shop_name && p.shop_name.toLowerCase().includes(q)) ||
      (p.owner_name && p.owner_name.toLowerCase().includes(q)) ||
      plateMatchesShop(p.shop_id, search);
  });
  const filteredPending = (Array.isArray(pending) ? pending : []).filter((s: any) => {
    const q = search.toLowerCase();
    return !q ||
      s.shop_number.toLowerCase().includes(q) ||
      s.owner_name.toLowerCase().includes(q) ||
      (s.shop_name && s.shop_name.toLowerCase().includes(q)) ||
      plateMatchesShop(s.id, search);
  });
  const filteredReminders = reminders.filter((r: any) => {
    const q = search.toLowerCase();
    return !q ||
      r.shop_number.toLowerCase().includes(q) ||
      r.owner_name.toLowerCase().includes(q) ||
      (r.shop_name && r.shop_name?.toLowerCase().includes(q));
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
        billing_start: form.billing_start || undefined,
        billing_end: form.billing_end || undefined,
      });
      toast.success('Payment recorded');
      setForm({ shop_id: '', amount: '', payment_method: 'cash', receipt_number: '', notes: '', billing_start: monthStart, billing_end: monthEnd });
      setShowAdd(false);
      await loadData();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed to record'); }
    finally { setAdding(false); }
  };

  const quickPay = async (shop: any) => {
    const amount = parseFloat(pendingAmounts[shop.id] ?? String(shop.monthly_fee || 0));
    if (!amount || amount <= 0) { toast.error('Enter valid amount'); return; }
    setAdding(true);
    try {
      const [y, m] = currentMonth.split('-').map(Number);
      await monthlyPaymentsApi.create({
        shop_id: shop.id,
        month: currentMonth,
        amount,
        payment_method: 'cash',
        billing_start: `${currentMonth}-01`,
        billing_end: new Date(y, m, 0).toISOString().slice(0, 10),
      });
      toast.success(`${shop.shop_number} paid Rs. ${amount}`);
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
            <p className="text-slate-500 text-sm mt-1">Track shop fee collection and billing reminders</p>
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
          <div className="glass-strong rounded-2xl p-4 text-center relative">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Reminders</p>
            <p className="text-2xl font-bold text-orange-500 mt-1">{reminders.length}</p>
            {reminders.length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            )}
          </div>
        </div>
      )}

      {/* Tab switch + Search */}
      <div className="glass-strong rounded-2xl p-4 flex items-center gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTab('pending')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === 'pending' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>
            Pending ({pending.length})
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTab('paid')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === 'paid' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>
            Paid ({payments.length})
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTab('reminders')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition flex items-center gap-1.5 ${tab === 'reminders' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>
            <Bell className="w-3.5 h-3.5" /> Reminders {reminders.length > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === 'reminders' ? 'bg-white/30' : 'bg-rose-100 text-rose-600'}`}>{reminders.length}</span>}
          </motion.button>
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shop, owner, or plate..." className="input-glass w-full pl-10 pr-4 py-2 rounded-xl text-sm" />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2"><ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton /></div>
      ) : tab === 'reminders' ? (
        // ── Reminders Tab ──
        filteredReminders.length === 0 ? (
          <div className="glass-strong rounded-3xl p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No billing reminders</p>
            <p className="text-slate-400 text-sm mt-1">All shops have active billing or no billing dates set</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 px-1">Showing shops with billing expired or expiring within 7 days</p>
            <AnimatePresence>
              {filteredReminders.map((r: any, idx: number) => (
                <motion.div key={r.shop_id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                  className={`glass-strong rounded-2xl p-4 flex items-center gap-4 border ${r.status === 'expired' ? 'border-rose-200' : 'border-amber-200'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0 ${r.status === 'expired' ? 'bg-gradient-to-br from-rose-500 to-red-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
                    {r.status === 'expired' ? <AlertTriangle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 font-mono">{r.shop_number}</p>
                      {r.shop_name && <span className="text-sm text-slate-600">· {r.shop_name}</span>}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${r.status === 'expired' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'}`}>
                        {r.status === 'expired' ? `Expired ${Math.abs(r.days_left)}d ago` : `Expires in ${r.days_left}d`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{r.owner_name}{r.owner_phone ? ` · ${r.owner_phone}` : ''}</p>
                    {r.billing_start && r.billing_end && (
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(r.billing_start).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}
                        {' → '}
                        {new Date(r.billing_end).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="text-right mr-2">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Fee</p>
                    <p className="font-bold text-slate-700">Rs. {(r.monthly_fee || 0).toLocaleString()}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setSlipShop(r)}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-semibold shadow-md flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Slip
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      ) : tab === 'pending' ? (
        // ── Pending Tab ──
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
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-500">Rs.</span>
                      <input
                        type="number" min="1" step="1"
                        value={pendingAmounts[shop.id] ?? String(shop.monthly_fee || 0)}
                        onChange={(e) => setPendingAmounts((prev) => ({ ...prev, [shop.id]: e.target.value }))}
                        className="input-glass w-28 pl-8 pr-3 py-2 rounded-xl text-right font-bold text-rose-600"
                      />
                    </div>
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
        // ── Paid Tab ──
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
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 flex-wrap">
                      <span>{p.owner_name}</span>
                      {p.payment_method && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold uppercase">{p.payment_method}</span>}
                      {p.receipt_number && <span>Receipt: {p.receipt_number}</span>}
                      {p.paid_at && <span>{new Date(p.paid_at).toLocaleDateString('en-PK')}</span>}
                    </div>
                    {p.billing_start && p.billing_end && (
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(p.billing_start).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}
                        {' → '}
                        {new Date(p.billing_end).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
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
                    const shop = shops.find((s: any) => s.id === parseInt(shopId));
                    setForm((f) => ({ ...f, shop_id: shopId, amount: shop ? String(shop.monthly_fee || '') : f.amount }));
                  }} className="input-glass w-full px-3 py-2.5 rounded-xl text-sm">
                    <option value="">Select shop...</option>
                    {shops.filter((s: any) => s.is_active).map((s: any) => (
                      <option key={s.id} value={s.id}>{s.shop_number} — {s.owner_name} (Rs. {s.monthly_fee})</option>
                    ))}
                  </select>
                </div>

                {/* Billing period */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Billing Period</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Start Date</label>
                      <input type="date" value={form.billing_start} onChange={(e) => setForm({ ...form, billing_start: e.target.value })} className="input-glass w-full px-3 py-2 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">End Date</label>
                      <input type="date" value={form.billing_end} onChange={(e) => setForm({ ...form, billing_end: e.target.value })} className="input-glass w-full px-3 py-2 rounded-xl text-sm" />
                    </div>
                  </div>
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

      {/* Reminder Slip Modal */}
      <AnimatePresence>
        {slipShop && <ReminderSlip shop={slipShop} onClose={() => setSlipShop(null)} />}
      </AnimatePresence>
    </div>
  );
}
