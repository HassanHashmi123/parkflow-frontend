'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  loading = false, variant = 'warning', onConfirm, onCancel,
}: ConfirmModalProps) {
  const colors = variant === 'danger'
    ? { btn: 'from-rose-500 to-red-500', iconBg: 'bg-rose-50', iconColor: 'text-rose-600' }
    : { btn: 'from-amber-500 to-orange-500', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.7, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, y: 30 }}
            transition={{ type: 'spring', stiffness: 250, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative"
          >
            <button
              onClick={onCancel}
              className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className={`w-14 h-14 rounded-2xl ${colors.iconBg} flex items-center justify-center mb-4`}
            >
              <AlertTriangle className={`w-7 h-7 ${colors.iconColor}`} />
            </motion.div>

            <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
            <p className="text-sm text-slate-600 mb-5">{message}</p>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition"
              >
                {cancelLabel}
              </button>
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-2.5 rounded-xl bg-gradient-to-r ${colors.btn} text-white font-semibold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}