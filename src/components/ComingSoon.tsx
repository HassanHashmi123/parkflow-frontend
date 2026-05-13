'use client';

import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-3xl p-12 text-center"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 mx-auto flex items-center justify-center mb-6 shadow-lg"
      >
        <Construction className="w-10 h-10 text-white" />
      </motion.div>
      <h2 className="text-2xl font-bold font-display text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 mb-6">This page will be built in the next sub-phase 🚀</p>
      <Link href="/">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-gradient px-6 py-3 rounded-2xl text-white font-semibold inline-flex items-center gap-2 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </motion.button>
      </Link>
    </motion.div>
  );
}
