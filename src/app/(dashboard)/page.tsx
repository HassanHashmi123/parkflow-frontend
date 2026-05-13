'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Car, LogIn, LogOut, Activity, Clock, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { reportsApi, sessionsApi } from '@/lib/api';
import { useAuth, canAccess } from '@/lib/auth';
import { formatTime, getDuration } from '@/lib/utils';
import TopBar from '@/components/TopBar';
import StatCard from '@/components/StatCard';
import { StatCardSkeleton, ListItemSkeleton } from '@/components/Skeletons';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [s, a] = await Promise.all([reportsApi.summary(), sessionsApi.active()]);
      setSummary(s);
      setActiveSessions(a);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <TopBar />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <motion.div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Live Dashboard
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
              Smart Parking, <span className="gradient-text">Real-time Control</span>
            </h2>
            <p className="text-slate-500 text-sm">
              Updates every 30 seconds · Logged in as <span className="font-semibold capitalize text-slate-700">{user?.role}</span>
            </p>
          </div>

          {canAccess(user?.role, ['admin', 'operator']) && (
            <div className="flex gap-2">
              <Link href="/checkin">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-gradient px-5 py-3 rounded-2xl text-white font-semibold flex items-center gap-2 shadow-lg"
                >
                  <LogIn className="w-4 h-4" />
                  Check-In
                </motion.button>
              </Link>
              <Link href="/checkout">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass px-5 py-3 rounded-2xl text-slate-700 font-semibold flex items-center gap-2 hover:bg-white"
                >
                  <LogOut className="w-4 h-4" />
                  Check-Out
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading || !summary ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Active Vehicles" value={summary.active_vehicles} icon={Car} gradient="from-blue-500 to-cyan-500" delay={0.1} isLive />
            <StatCard label="Today's Check-Ins" value={summary.today_checkins} icon={LogIn} gradient="from-emerald-500 to-teal-500" delay={0.2} />
            <StatCard label="Today's Check-Outs" value={summary.today_checkouts} icon={LogOut} gradient="from-amber-500 to-orange-500" delay={0.3} />
            <StatCard label="Today's Revenue" value={summary.today_revenue} icon={Sparkles} gradient="from-purple-500 to-pink-500" prefix="Rs. " delay={0.4} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-strong rounded-3xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-slate-800">Active Vehicles</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                {activeSessions.length}
              </span>
            </div>
            <Link href="/active" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {loading ? (
              <>
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
              </>
            ) : activeSessions.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No active vehicles right now</p>
              </div>
            ) : (
              activeSessions.slice(0, 8).map((session, idx) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  whileHover={{ x: 4 }}
                  className="glass rounded-2xl p-4 flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {session.vehicle_type_name?.charAt(0) ?? 'V'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 font-mono">{session.plate_number}</p>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                        {session.vehicle_type_name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{session.token}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(session.entry_time)}</span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">{getDuration(session.entry_time)}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-5"
        >
          <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
            <motion.div
              className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-20 blur-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Your Role</p>
              <p className="text-2xl font-bold capitalize gradient-text">{user?.role}</p>
              <p className="text-sm text-slate-600 mt-2">{user?.full_name}</p>
              <p className="text-xs text-slate-400 mt-1">@{user?.username}</p>
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Quick Links</p>
            <div className="space-y-2">
              {[
                { href: '/today', label: "Today's Sessions", icon: Clock },
                { href: '/search', label: 'Search History', icon: Sparkles },
                { href: '/reports', label: 'View Reports', icon: Activity },
              ].map((link, idx) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 transition group">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4 text-slate-700" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 flex-1">{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}