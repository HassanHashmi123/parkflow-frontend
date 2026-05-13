'use client';

import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 px-4 py-4 lg:py-6 lg:pr-6 lg:pl-0 pb-28 lg:pb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
