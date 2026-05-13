'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
  prefix?: string;
  suffix?: string;
  delay?: number;
  isLive?: boolean;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  prefix = '',
  suffix = '',
  delay = 0,
  isLive = false,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="glass-strong rounded-3xl p-6 relative overflow-hidden group cursor-pointer"
    >
      {/* Gradient blob */}
      <div
        className={`absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 blur-2xl bg-gradient-to-br ${gradient} group-hover:opacity-40 transition-opacity duration-500`}
      />

      <div className="relative flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {isLive && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="live-dot" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>

      <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold font-display text-slate-800 tabular-nums">
        {prefix}
        <CountUp end={value} duration={1.6} separator="," decimals={value % 1 !== 0 ? 2 : 0} />
        {suffix}
      </p>
    </motion.div>
  );
}
