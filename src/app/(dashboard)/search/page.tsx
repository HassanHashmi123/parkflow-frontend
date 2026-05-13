'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Hash, Filter, X, Loader2, Car, LogIn, LogOut } from 'lucide-react';
import { sessionsApi } from '@/lib/api';
import { formatTime, formatDateTime } from '@/lib/utils';
import TopBar from '@/components/TopBar';
import { ListItemSkeleton } from '@/components/Skeletons';

export default function SearchPage() {
  const [plate, setPlate] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (plate.trim()) params.plate = plate.trim();
      if (token.trim()) params.token = token.trim();
      if (status !== 'all') params.status = status;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const data = await sessionsApi.search(params);
      setResults(data);
      setSearched(true);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleClear = () => {
    setPlate(''); setToken(''); setStatus('all'); setFromDate(''); setToDate(''); setResults([]); setSearched(false);
  };

  return (
    <div className="space-y-6">
      <TopBar />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <motion.div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 opacity-20 blur-3xl" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Advanced Search</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Search <span className="gradient-text">History</span></h2>
          <p className="text-slate-500 text-sm mt-1">Find any session by plate, token, or date range</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-strong rounded-3xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"><Car className="w-3 h-3 inline mr-1" /> Plate Number</label>
            <input type="text" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="ABC-123" className="input-glass w-full px-4 py-2.5 rounded-xl font-mono" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"><Hash className="w-3 h-3 inline mr-1" /> Token</label>
            <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="PF-20260501-0001" className="input-glass w-full px-4 py-2.5 rounded-xl font-mono" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"><Calendar className="w-3 h-3 inline mr-1" /> From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input-glass w-full px-4 py-2.5 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"><Calendar className="w-3 h-3 inline mr-1" /> To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input-glass w-full px-4 py-2.5 rounded-xl" />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"><Filter className="w-3 h-3 inline mr-1" /> Status</label>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'completed', 'cancelled'] as const).map((s) => (
              <motion.button key={s} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setStatus(s)} className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition ${status === s ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {s}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSearch} disabled={loading} className="btn-gradient flex-1 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
            {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Searching...</>) : (<><Search className="w-4 h-4" />Search</>)}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleClear} className="glass px-5 py-3 rounded-xl text-slate-600 font-semibold flex items-center gap-2 hover:bg-white">
            <X className="w-4 h-4" />Clear
          </motion.button>
        </div>
      </motion.div>

      {searched && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <p className="text-sm font-semibold text-slate-700 px-2">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          {loading ? (<><ListItemSkeleton /><ListItemSkeleton /></>) : results.length === 0 ? (
            <div className="glass-strong rounded-3xl p-12 text-center">
              <Search className="w-16 h-16 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No matching sessions</p>
            </div>
          ) : (
            <AnimatePresence>
              {results.map((session, idx) => (
                <motion.div key={session.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }} className="glass-strong rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {session.vehicle_type_name?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold font-mono text-slate-800">{session.plate_number}</p>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">{session.vehicle_type_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${session.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{session.status}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{session.token}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      <span><LogIn className="w-3 h-3 inline" /> {formatDateTime(session.entry_time)}</span>
                      {session.exit_time && (<span><LogOut className="w-3 h-3 inline" /> {formatTime(session.exit_time)}</span>)}
                    </div>
                  </div>
                  {session.fee_charged !== null && session.fee_charged !== undefined && (
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Fee</p>
                      <p className="font-bold gradient-text">Rs. {session.fee_charged}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </div>
  );
}