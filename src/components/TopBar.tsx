'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function TopBar() {
  const { user } = useAuth();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-8"
    >
      <div>
        <p className="text-sm text-slate-500 font-medium">{greeting},</p>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-800">
          {user?.full_name?.split(' ')[0] ?? 'User'} 👋
        </h1>
      </div>
      <div className="hidden sm:flex items-center gap-3">
        {now && (
          <div className="glass rounded-2xl px-4 py-2.5 text-right">
            <p className="text-xs text-slate-500 font-medium">
              {now.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
            <p className="text-sm font-bold text-slate-800 font-mono">
              {now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass rounded-2xl w-11 h-11 flex items-center justify-center text-slate-600 hover:text-blue-600 transition relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        </motion.button>
      </div>
    </motion.div>
  );
}
