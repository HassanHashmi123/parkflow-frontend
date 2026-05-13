'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, LogIn, LogOut, Car } from 'lucide-react';
import CountUp from 'react-countup';
import { sessionsApi } from '@/lib/api';
import { formatTime } from '@/lib/utils';
import TopBar from '@/components/TopBar';
import { ListItemSkeleton } from '@/components/Skeletons';

export default function TodayPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    sessionsApi.today().then((data) => {
      setSessions(data);
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'all' ? sessions : sessions.filter((s) => s.status === filter);
  const totalRevenue = sessions
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + (s.fee_charged || 0), 0);
  const activeCount = sessions.filter((s) => s.status === 'active').length;

  return (
    <div className="space-y-6">
      <TopBar />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <motion.div
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 opacity-20 blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Today's Activity
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Sessions <span className="gradient-text">Today</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-2xl p-4 text-center"
        >
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total</p>
          <p className="text-3xl font-bold gradient-text mt-1">
            <CountUp end={sessions.length} duration={1.2} />
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-strong rounded-2xl p-4 text-center"
        >
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">
            <CountUp end={activeCount} duration={1.2} />
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl p-4 text-center"
        >
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Revenue</p>
          <p className="text-3xl font-bold gradient-text mt-1">
            Rs. <CountUp end={totalRevenue} duration={1.2} />
          </p>
        </motion.div>
      </div>

      {/* Filter tabs - FIXED */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'active', 'completed'] as const).map((t) => {
          const isActive = filter === t;
          return (
            <motion.button
              key={t}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(t)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'glass text-slate-600 hover:bg-white'
              }`}
            >
              {t}
            </motion.button>
          );
        })}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-2">
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-strong rounded-3xl p-16 text-center">
          <Car className="w-16 h-16 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No sessions in this view</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((session, idx) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.03 }}
                className="glass-strong rounded-2xl p-4 flex items-center gap-3 sm:gap-4"
              >
                <div className="hidden sm:flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      session.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                    }`}
                  />
                </div>

                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {session.vehicle_type_name?.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold font-mono text-slate-800">{session.plate_number}</p>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                      {session.vehicle_type_name}
                    </span>
                    {session.status === 'active' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{session.token}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <LogIn className="w-3 h-3" />
                      {formatTime(session.entry_time)}
                    </div>
                    {session.exit_time && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <LogOut className="w-3 h-3" />
                        {formatTime(session.exit_time)}
                      </div>
                    )}
                  </div>
                </div>

                {session.fee_charged !== null && session.fee_charged !== undefined && (
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Fee</p>
                    <p className="text-base font-bold gradient-text">Rs. {session.fee_charged}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}