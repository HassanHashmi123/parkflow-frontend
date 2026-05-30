'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Loader2, CheckCircle2, Clock, Car, Banknote,
  Sparkles, X, Store, ScanLine, Search
} from 'lucide-react';
import CountUp from 'react-countup';
import { toast } from 'sonner';
import { sessionsApi } from '@/lib/api';
import { useAuth, canAccess } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { formatTime, getDuration } from '@/lib/utils';
import TopBar from '@/components/TopBar';
import Confetti from '@/components/Confetti';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const scannerInputRef = useRef<HTMLInputElement>(null);

  const [searchType, setSearchType] = useState<'token' | 'plate'>('token');
  const [searchValue, setSearchValue] = useState('');
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);

  const normalizeScanValue = (value: string) =>
    value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '');

  useEffect(() => {
    if (!canAccess(user?.role, ['admin', 'operator'])) router.replace('/');
  }, [user, router]);

  const loadActive = async () => {
    const data = await sessionsApi.active();
    setActiveSessions(data);
    setFilteredSessions(data);
  };

  useEffect(() => { loadActive(); }, []);

  // Filter active sessions list as user types
  useEffect(() => {
    if (!searchValue) { setFilteredSessions(activeSessions); return; }
    const v = normalizeScanValue(searchValue);
    setFilteredSessions(
      activeSessions.filter((s) =>
        searchType === 'plate' ? s.plate_number.includes(v) : s.token.includes(v)
      )
    );
  }, [searchValue, activeSessions, searchType]);

  // Keep scanner input focused at all times (unless result modal is open)
  useEffect(() => {
    if (!result) {
      setTimeout(() => scannerInputRef.current?.focus(), 150);
    }
  }, [result]);

  // Global keydown — redirect any keypress to scanner input when not in modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (result) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      scannerInputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [result]);

  const handleCheckout = useCallback(async (session: any) => {
    setLoading(true);
    try {
      const data = await sessionsApi.checkout({ plate_number: session.plate_number });
      const isPermanent = data.is_permanent || data.session?.session_type === 'permanent' || session.session_type === 'permanent';
      setResult({
        ...data,
        plate_number: session.plate_number,
        vehicle_type_name: session.vehicle_type_name,
        entry_time: session.entry_time,
        exit_time: data.session?.exit_time || new Date().toISOString(),
        token: session.token,
        is_permanent: isPermanent,
        shop_info: session.shop_info || data.shop_info,
      });
      if (!isPermanent) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
        toast.success(`Checkout! Fee: Rs. ${data.fee || 0}`);
      } else {
        toast.success('Permanent vehicle exit logged');
      }
      setSearchValue('');
      await loadActive();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Called by barcode scanner (Enter key after token typed) or manual token entry
  const checkoutByToken = useCallback(async (rawToken: string) => {
    const token = normalizeScanValue(rawToken);
    if (!token) return;
    setSearchValue('');

    // First try local active sessions list for instant match
    const session = activeSessions.find((s) => {
      const suffix = s.token.split('-').pop();
      return s.token === token || suffix === token;
    });
    if (session) {
      await handleCheckout(session);
      return;
    }

    // Fallback: call API directly with token
    setLoading(true);
    try {
      const data = await sessionsApi.checkout({ token });
      const isPermanent = data.is_permanent || data.session?.session_type === 'permanent';
      setResult({
        ...data,
        plate_number: data.session?.plate_number || '',
        vehicle_type_name: data.session?.vehicle_type_name || '',
        entry_time: data.session?.entry_time || '',
        exit_time: data.session?.exit_time || new Date().toISOString(),
        token: data.session?.token || token,
        is_permanent: isPermanent,
        shop_info: data.session?.shop_info || null,
      });
      if (!isPermanent) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
        toast.success(`Checkout! Fee: Rs. ${data.fee || 0}`);
      } else {
        toast.success('Permanent vehicle exit logged');
      }
      await loadActive();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Token not found: ${token}`);
    } finally {
      setLoading(false);
    }
  }, [activeSessions, handleCheckout]);

  // Enter key handler — barcode scanner sends Enter after barcode string
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      e.preventDefault();
      if (searchType === 'token') {
        checkoutByToken(searchValue);
      }
    }
  };

  const closeReceipt = () => {
    setResult(null);
    setShowConfetti(false);
    setSearchValue('');
    setTimeout(() => scannerInputRef.current?.focus(), 150);
  };

  return (
    <div className="space-y-6 relative">
      <Confetti show={showConfetti} duration={2500} />
      <TopBar />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <motion.div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-amber-300 to-orange-300 opacity-20 blur-3xl" animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Smart Vehicle Exit</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Vehicle <span className="gradient-text">Check-Out</span></h2>
          <p className="text-slate-500 text-sm mt-1">Barcode scanner (SC-1205) · Manual plate search</p>
        </div>
      </motion.div>

      {/* Scanner section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-strong rounded-3xl p-6">

        {/* Mode tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setSearchType('token'); setSearchValue(''); setTimeout(() => scannerInputRef.current?.focus(), 100); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${searchType === 'token' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <ScanLine className="w-4 h-4" /> Barcode Scanner
          </button>
          <button
            onClick={() => { setSearchType('plate'); setSearchValue(''); setTimeout(() => scannerInputRef.current?.focus(), 100); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${searchType === 'plate' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <Search className="w-4 h-4" /> By Plate
          </button>
        </div>

        {/* Scanner status banner */}
        {searchType === 'token' && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <ScanLine className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-800">SC-1205 Scanner Ready</p>
              <p className="text-xs text-emerald-600 mt-0.5">Slip ka barcode scanner kay saamne rakho → yellow button dabao → automatic checkout</p>
            </div>
          </div>
        )}

        {/* Input field */}
        <div className="relative">
          {searchType === 'token'
            ? <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            : <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          }
          <input
            ref={scannerInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(normalizeScanValue(e.target.value))}
            onKeyDown={handleKeyDown}
            placeholder={searchType === 'token' ? 'Barcode scan karo — Enter par checkout hoga...' : 'Plate number type karo (e.g. ABC-123)'}
            className="input-glass w-full pl-12 pr-4 py-4 rounded-xl text-base font-mono tracking-wider"
            autoComplete="off"
            autoFocus
          />
        </div>

        {searchType === 'token' && (
          <p className="text-xs text-slate-400 mt-2 text-center">
            SC-1205 supports: Code 128 · Code 39 · Code 93 · EAN · UPC
          </p>
        )}
      </motion.div>

      {/* Active sessions list */}
      {filteredSessions.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-strong rounded-3xl p-12 text-center">
          <Car className="w-16 h-16 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">
            {searchValue ? 'No matching active vehicles' : 'No active vehicles right now'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-slate-500 px-2">{filteredSessions.length} active vehicles</p>
          <AnimatePresence>
            {filteredSessions.map((s, idx) => {
              const isPermanent = s.session_type === 'permanent' || !!s.shop_info;
              return (
                <motion.div
                  key={s.id} layout
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.03 }} whileHover={{ y: -2 }}
                  className={`glass-strong rounded-2xl p-4 flex items-center gap-4 ${isPermanent ? 'ring-2 ring-emerald-200' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0 ${isPermanent ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`}>
                    {isPermanent ? <Store className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold font-mono text-slate-800 text-lg">{s.plate_number}</p>
                      {isPermanent ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">Permanent · {s.shop_info?.shop_number || 'Shop'}</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">Guest</span>
                      )}
                      {s.vehicle_type_name && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">{s.vehicle_type_name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="font-mono">{s.token}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(s.entry_time)}</span>
                      <span className="font-semibold text-emerald-600">{getDuration(s.entry_time)}</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleCheckout(s)} disabled={loading}
                    className={`px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md disabled:opacity-50 flex items-center gap-2 ${isPermanent ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    {isPermanent ? 'Allow Exit' : 'Check Out'}
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Result Modal */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 flex items-center justify-center p-4" onClick={closeReceipt}>
            <motion.div initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.7, y: 30 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
              {result.is_permanent ? (
                <>
                  <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white relative">
                    <button onClick={closeReceipt} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><X className="w-4 h-4" /></button>
                    <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </motion.div>
                    <p className="text-center text-xs uppercase tracking-wider opacity-90 font-bold">Exit Allowed</p>
                    <p className="text-center text-3xl font-bold mt-1">No Fee</p>
                  </div>
                  <div className="p-6 space-y-3">
                    <Field label="Plate" value={result.plate_number} mono />
                    {result.shop_info && <Field label="Shop" value={`${result.shop_info.shop_number}${result.shop_info.shop_name ? ' · ' + result.shop_info.shop_name : ''}`} />}
                    <Field label="Entry" value={formatTime(result.entry_time)} />
                    <Field label="Exit" value={formatTime(result.exit_time)} />
                    <Field label="Duration" value={getDuration(result.entry_time, result.exit_time)} />
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeReceipt} className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-md">Next Vehicle</motion.button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 text-white relative">
                    <button onClick={closeReceipt} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><X className="w-4 h-4" /></button>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }} className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                      <Banknote className="w-10 h-10 text-white" />
                    </motion.div>
                    <p className="text-center text-xs uppercase tracking-wider opacity-90 font-bold">Total Fee</p>
                    <p className="text-center text-5xl font-bold mt-1">Rs. <CountUp end={result.fee || 0} duration={1.2} /></p>
                  </div>
                  <div className="p-6 space-y-3">
                    <Field label="Plate" value={result.plate_number} mono />
                    <Field label="Token" value={result.token} mono small />
                    <Field label="Vehicle" value={result.vehicle_type_name || '—'} />
                    <Field label="Entry" value={formatTime(result.entry_time)} />
                    <Field label="Exit" value={formatTime(result.exit_time)} />
                    <Field label="Duration" value={getDuration(result.entry_time, result.exit_time)} />
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeReceipt} className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md">Next Vehicle</motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, value, mono, small }: { label: string; value: string; mono?: boolean; small?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">{label}</span>
      <span className={`text-slate-800 font-bold ${mono ? 'font-mono' : ''} ${small ? 'text-xs' : ''}`}>{value}</span>
    </div>
  );
}
