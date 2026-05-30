'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, Store, AlertCircle, LogIn, LogOut } from 'lucide-react';

export interface BadgeData {
  mode: 'checkin' | 'checkout';
  plate: string;
  shopNumber?: string;
  shopName?: string;
  ownerName?: string;
  error?: string;
}

export default function ScannerBadge({
  data,
  onDismiss,
}: {
  data: BadgeData | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [data, onDismiss]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key={`${data.plate}-${data.mode}`}
          initial={{ opacity: 0, x: 100, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed bottom-6 right-6 z-[100] w-64 shadow-2xl rounded-2xl overflow-hidden"
        >
          <div
            className={`p-4 text-white flex items-start gap-3 ${
              data.error
                ? 'bg-gradient-to-r from-red-500 to-rose-600'
                : data.mode === 'checkin'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              {data.error ? (
                <AlertCircle className="w-5 h-5" />
              ) : data.mode === 'checkin' ? (
                <LogIn className="w-5 h-5" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {data.error
                  ? 'Card Scan Error'
                  : data.mode === 'checkin'
                  ? 'Card Check-In'
                  : 'Card Check-Out'}
              </p>
              <p className="font-bold font-mono text-base truncate">{data.plate}</p>
            </div>
            <button
              onClick={onDismiss}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {data.error ? (
            <div className="bg-white px-4 py-3 text-red-600 text-xs font-medium">
              {data.error}
            </div>
          ) : (
            <div className="bg-white px-4 py-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">
                  {data.shopNumber || '—'}
                  {data.shopName ? ` · ${data.shopName}` : ''}
                </p>
                {data.ownerName && (
                  <p className="text-slate-500 text-xs truncate">{data.ownerName}</p>
                )}
                <p
                  className={`text-xs font-semibold mt-0.5 flex items-center gap-1 ${
                    data.mode === 'checkin' ? 'text-emerald-600' : 'text-blue-600'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {data.mode === 'checkin' ? 'Entry Logged' : 'Exit Allowed'}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
