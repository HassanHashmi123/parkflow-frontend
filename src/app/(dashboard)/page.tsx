'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Car, LogIn, LogOut, Clock, TrendingUp, Sparkles,
  ArrowRight, Banknote, Bike, Truck, Activity
} from 'lucide-react';
import CountUp from 'react-countup';
import Link from 'next/link';
import { sessionsApi, reportsApi } from '@/lib/api';
import { useAuth, canAccess } from '@/lib/auth';
import { formatTime, getDuration } from '@/lib/utils';
import { BRANDING, isVisibleForRole } from '@/config/branding';
import TopBar from '@/components/TopBar';
import StatCard from '@/components/StatCard';
import { DashboardSkeleton } from '@/components/Skeletons';

const VEHICLE_ICONS: Record<string, any> = {
  car: Car,
  bike: Bike,
  motorcycle: Bike,
  'auto rickshaw': Car,
  auto: Car,
  'truck/van': Truck,
  truck: Truck,
};

const VEHICLE_GRADIENTS: Record<string, string> = {
  car: 'from-blue-500 to-indigo-500',
  bike: 'from-emerald-500 to-teal-500',
  motorcycle: 'from-emerald-500 to-teal-500',
  'auto rickshaw': 'from-amber-500 to-orange-500',
  auto: 'from-amber-500 to-orange-500',
  'truck/van': 'from-rose-500 to-red-500',
  truck: 'from-rose-500 to-red-500',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [vehicleTypeRevenue, setVehicleTypeRevenue] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [summaryData, activeData] = await Promise.all([
        reportsApi.summary(),
        sessionsApi.active(),
      ]);
      setStats(summaryData);
      setActiveSessions(activeData);

      // Load vehicle type breakdown for admin
      if (isVisibleForRole('revenue', user?.role || '')) {
        try {
          const vtData = await reportsApi.byVehicleType();
          setVehicleTypeRevenue(Array.isArray(vtData) ? vtData : []);
        } catch (e) {
          console.error('Vehicle type revenue load failed', e);
        }
      }
    } catch (e) {
      console.error('Dashboard load failed', e);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, BRANDING.dashboard.refreshInterval);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) return <DashboardSkeleton />;

  const showRevenue = isVisibleForRole('revenue', user?.role || '');
  const totalRevenue = stats?.today_revenue || 0;
  const vehicleTypeBreakdownTotal = vehicleTypeRevenue.reduce(
    (sum: number, vt: any) => sum + (vt.revenue || vt.total_revenue || 0),
    0
  );

  return (
    <div className="space-y-6">
      <TopBar />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <motion.div
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 opacity-20 blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Live Dashboard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Smart Parking, <span className="gradient-text">Real-time Control</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Updates every {BRANDING.dashboard.refreshInterval / 1000} seconds · Logged in as <span className="font-semibold capitalize">{user?.role}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/checkin">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-gradient px-5 py-3 rounded-2xl text-white font-semibold flex items-center gap-2 shadow-lg">
                <LogIn className="w-4 h-4" /> Check-In
              </motion.div>
            </Link>
            <Link href="/checkout">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="glass px-5 py-3 rounded-2xl text-slate-700 font-semibold flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Check-Out
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>


      {/* REVENUE BY VEHICLE TYPE — Admin Only */}
      {user?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-lg">Today&apos;s Revenue by Vehicle Type</h3>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">
              Admin Only
            </span>
          </div>
          <VehicleRevenue />
        </motion.div>
      )}


      

      {/* Stats Row — using EXACT StatCard props: gradient, isLive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Active Vehicles"
          value={stats?.active_vehicles || 0}
          icon={Car}
          gradient="from-blue-500 to-cyan-500"
          isLive
          delay={0}
        />
        <StatCard
          label="Today In"
          value={stats?.today_checkins || 0}
          icon={LogIn}
          gradient="from-emerald-500 to-teal-500"
          delay={0.05}
        />
        <StatCard
          label="Today Out"
          value={stats?.today_checkouts || 0}
          icon={LogOut}
          gradient="from-amber-500 to-orange-500"
          delay={0.1}
        />
        {showRevenue ? (
          <StatCard
            label="Revenue"
            value={totalRevenue}
            icon={Banknote}
            gradient="from-purple-500 to-pink-500"
            prefix="Rs. "
            delay={0.15}
          />
        ) : (
          <StatCard
            label="Avg Duration"
            value={stats?.avg_duration_minutes || 0}
            icon={Clock}
            gradient="from-purple-500 to-pink-500"
            suffix=" min"
            delay={0.15}
          />
        )}
      </div>

      {/* REVENUE BY VEHICLE TYPE — Admin Only */}
      {showRevenue && BRANDING.dashboard.showVehicleTypeBreakdown && vehicleTypeRevenue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-lg">Today&apos;s Revenue by Vehicle Type</h3>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">
              Admin Only
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {vehicleTypeRevenue.map((vt: any, idx: number) => {
              const typeName = (vt.vehicle_type || vt.name || 'Unknown').toLowerCase();
              const IconComponent = VEHICLE_ICONS[typeName] || Car;
              const gradientClass = VEHICLE_GRADIENTS[typeName] || 'from-slate-500 to-slate-600';
              const revenue = vt.revenue || vt.total_revenue || 0;
              const count = vt.count || vt.total_sessions || 0;

              return (
                <motion.div
                  key={vt.vehicle_type || vt.name || idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  className="glass rounded-2xl p-4 text-center"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center mx-auto mb-2 text-white shadow-md`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {vt.vehicle_type || vt.name}
                  </p>
                  <p className="text-xl font-bold text-slate-800 mt-0.5">
                    Rs. <CountUp end={revenue} duration={1.5} />
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {count} {count === 1 ? 'trip' : 'trips'}
                  </p>
                </motion.div>
              );
            })}

            {/* Total Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-4 text-center ring-2 ring-emerald-200"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-2 text-white shadow-md">
                <Banknote className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total</p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">
                Rs. <CountUp end={vehicleTypeBreakdownTotal} duration={1.5} />
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {vehicleTypeRevenue.reduce((s: number, v: any) => s + (v.count || v.total_sessions || 0), 0)} trips
              </p>
            </motion.div>
          </div>

          {/* Revenue bar */}
          {vehicleTypeBreakdownTotal > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-semibold">Breakdown</p>
              <div className="flex rounded-full overflow-hidden h-3 bg-slate-100">
                {vehicleTypeRevenue.map((vt: any, idx: number) => {
                  const revenue = vt.revenue || vt.total_revenue || 0;
                  const pct = vehicleTypeBreakdownTotal > 0 ? (revenue / vehicleTypeBreakdownTotal) * 100 : 0;
                  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
                  return (
                    <motion.div
                      key={idx}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                      className={`${colors[idx % colors.length]} h-full`}
                      title={`${vt.vehicle_type || vt.name}: Rs. ${revenue} (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>
              <div className="flex gap-4 flex-wrap">
                {vehicleTypeRevenue.map((vt: any, idx: number) => {
                  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
                  const revenue = vt.revenue || vt.total_revenue || 0;
                  const pct = vehicleTypeBreakdownTotal > 0 ? Math.round((revenue / vehicleTypeBreakdownTotal) * 100) : 0;
                  return (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <div className={`w-2 h-2 rounded-full ${colors[idx % colors.length]}`} />
                      <span>{vt.vehicle_type || vt.name}: {pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Active vehicles + Quick links row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Active vehicles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-strong rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-slate-800">Active Vehicles</h3>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                {activeSessions.length}
              </span>
            </div>
            <Link href="/active" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {activeSessions.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No active vehicles right now</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeSessions.slice(0, 5).map((s: any, idx: number) => {
                const isPermanent = s.session_type === 'permanent';
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + idx * 0.05 }}
                    className={`glass rounded-2xl p-3 flex items-center gap-3 ${isPermanent ? 'ring-1 ring-emerald-200' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm ${isPermanent ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`}>
                      <Car className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold font-mono text-sm text-slate-800">{s.plate_number}</p>
                        {isPermanent && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase">Perm</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {s.vehicle_type_name} · {formatTime(s.entry_time)} · <span className="text-emerald-600 font-semibold">{getDuration(s.entry_time)}</span>
                      </p>
                    </div>
                    {!isPermanent && showRevenue && (
                      <span className="text-xs font-bold text-slate-600">Rs. {s.current_fee || s.vehicle_type_rate || '—'}</span>
                    )}
                  </motion.div>
                );
              })}
              {activeSessions.length > 5 && (
                <Link href="/active" className="block text-center text-xs text-blue-600 font-semibold py-2 hover:underline">
                  +{activeSessions.length - 5} more vehicles →
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Quick links + Role card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-4"
        >
          {/* Role card */}
          <div className="glass-strong rounded-2xl p-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Role</p>
            <p className="text-2xl font-bold text-blue-600 capitalize mt-1">{user?.role}</p>
            <p className="text-xs text-slate-500 mt-0.5">{user?.full_name}</p>
            <p className="text-xs text-slate-400">@{user?.username}</p>
          </div>

          {/* Quick Links */}
          <div className="glass-strong rounded-2xl p-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Quick Links</p>
            <div className="space-y-1.5">
              {[
                { href: '/checkin', label: 'Check-In Vehicle', icon: LogIn, color: 'text-emerald-600' },
                { href: '/checkout', label: 'Check-Out Vehicle', icon: LogOut, color: 'text-amber-600' },
                { href: '/search', label: 'Search Records', icon: Car, color: 'text-blue-600' },
                { href: '/reports', label: 'View Reports', icon: TrendingUp, color: 'text-purple-600' },
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-2 py-1.5 text-sm text-slate-600 hover:text-slate-900"
                  >
                    <link.icon className={`w-4 h-4 ${link.color}`} />
                    <span>{link.label}</span>
                    <ArrowRight className="w-3 h-3 ml-auto text-slate-300" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Plaza info */}
          <div className="glass-strong rounded-2xl p-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Plaza</p>
            <p className="text-sm font-bold text-slate-800">{BRANDING.plaza.shortName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{BRANDING.plaza.address}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}




function VehicleRevenue() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    reportsApi.byVehicleType().then((res: any) => {
      const breakdown = res?.breakdown || res || [];
      if (Array.isArray(breakdown)) {
        setData(breakdown);
        setTotal(breakdown.reduce((s: number, v: any) => s + (v.revenue || 0), 0));
      }
    }).catch(console.error);
  }, []);

  if (data.length === 0) return <p className="text-sm text-slate-400 text-center py-4">No revenue data yet — checkout some vehicles first</p>;

  const icons: Record<string, string> = { car: '🚗', bike: '🏍️', motorcycle: '🏍️', 'auto rickshaw': '🛺', auto: '🛺', 'truck/van': '🚛', truck: '🚛' };
  const colors = ['from-blue-500 to-indigo-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-red-500'];
  const barColors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {data.map((vt: any, idx: number) => (
          <div key={idx} className="glass rounded-2xl p-3 text-center">
            <p className="text-2xl mb-1">{icons[vt.vehicle_type?.toLowerCase()] || '🚗'}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase">{vt.vehicle_type}</p>
            <p className="text-lg font-bold text-slate-800">Rs. {vt.revenue || 0}</p>
            <p className="text-[10px] text-slate-400">{vt.visits || 0} trips</p>
          </div>
        ))}
        <div className="glass rounded-2xl p-3 text-center ring-2 ring-emerald-200">
          <p className="text-2xl mb-1">💰</p>
          <p className="text-xs font-semibold text-emerald-600 uppercase">Total</p>
          <p className="text-lg font-bold text-emerald-600">Rs. {total}</p>
          <p className="text-[10px] text-slate-400">{data.reduce((s: number, v: any) => s + (v.visits || 0), 0)} trips</p>
        </div>
      </div>
      {total > 0 && (
        <div className="space-y-2">
          <div className="flex rounded-full overflow-hidden h-3 bg-slate-100">
            {data.map((vt: any, idx: number) => (
              <div key={idx} className={`${barColors[idx % barColors.length]} h-full`} style={{ width: `${(vt.revenue || 0) / total * 100}%` }} />
            ))}
          </div>
          <div className="flex gap-4 flex-wrap">
            {data.map((vt: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                <div className={`w-2 h-2 rounded-full ${barColors[idx % barColors.length]}`} />
                <span>{vt.vehicle_type}: {Math.round((vt.revenue || 0) / total * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
