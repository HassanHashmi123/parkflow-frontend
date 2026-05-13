'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Clock, LayoutGrid, List, RefreshCw, LogOut, Filter } from 'lucide-react';
import Link from 'next/link';
import { sessionsApi } from '@/lib/api';
import { useAuth, canAccess } from '@/lib/auth';
import { formatTime, getDuration } from '@/lib/utils';
import TopBar from '@/components/TopBar';
import { ListItemSkeleton } from '@/components/Skeletons';

export default function ActivePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    loadData();
    const refreshInterval = setInterval(loadData, 15000);
    const tickInterval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => {
      clearInterval(refreshInterval);
      clearInterval(tickInterval);
    };
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const data = await sessionsApi.active();
      setSessions(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setTimeout(() => setRefreshing(false), 600); }
  };

  const types = ['all', ...Array.from(new Set(sessions.map((s) => s.vehicle_type_name)))];
  const filtered = filter === 'all' ? sessions : sessions.filter((s) => s.vehicle_type_name === filter);

  return (
    <div className="space-y-6">
      <TopBar />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <motion.div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-blue-300 to-cyan-300 opacity-20 blur-3xl" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="live-dot" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live · {sessions.length} parked</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Active <span className="gradient-text">Vehicles</span></h2>
            <p className="text-slate-500 text-sm mt-1">Auto-refreshes every 15 seconds</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={loadData} className="glass rounded-xl w-10 h-10 flex items-center justify-center text-slate-600 hover:text-blue-600">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            <div className="glass rounded-xl p-1 inline-flex">
              <button onClick={() => setView('grid')} className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${view === 'grid' ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' : 'text-slate-500'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setView('list')} className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${view === 'list' ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' : 'text-slate-500'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-500" />
        {types.map((t) => (
          <motion.button key={t} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter(t)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${filter === t ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'glass text-slate-600'}`}>
            {t === 'all' ? 'All' : t}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-strong rounded-3xl p-16 text-center">
          <Car className="w-16 h-16 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No active vehicles</p>
          {canAccess(user?.role, ['admin', 'operator']) && (
            <Link href="/checkin"><motion.button whileHover={{ scale: 1.05 }} className="btn-gradient mt-4 px-5 py-2.5 rounded-xl text-white font-semibold text-sm">Check-In a Vehicle</motion.button></Link>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((session, idx) => (
              <motion.div key={session.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.04 }} whileHover={{ y: -4 }} className="glass-strong rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 opacity-10 blur-2xl group-hover:opacity-30 transition-opacity" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">Active</span>
                  </div>
                  <p className="text-2xl font-bold font-mono text-slate-800 mb-1">{session.plate_number}</p>
                  <p className="text-xs text-slate-500 font-mono mb-3">{session.token}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Entered {formatTime(session.entry_time)}</span>
                    </div>
                    <span className="font-bold text-emerald-600" key={tick}>{getDuration(session.entry_time)}</span>
                  </div>
                  {canAccess(user?.role, ['admin', 'operator']) && (
                    <Link href="/checkout">
                      <motion.button whileHover={{ scale: 1.02 }} className="w-full mt-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition">
                        <LogOut className="w-3.5 h-3.5" />Process Exit
                      </motion.button>
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((session, idx) => (
              <motion.div key={session.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: idx * 0.03 }} className="glass-strong rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                  <Car className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold font-mono text-slate-800">{session.plate_number}</p>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">{session.vehicle_type_name}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{session.token}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{formatTime(session.entry_time)}</p>
                  <p className="text-sm font-bold text-emerald-600" key={tick}>{getDuration(session.entry_time)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}