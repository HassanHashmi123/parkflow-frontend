'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, LogIn, LogOut as ExitIcon, Car, BarChart3 } from 'lucide-react';
import { useAuth, canAccess } from '@/lib/auth';
import { cn } from '@/lib/utils';

const items = [
  { href: '/', label: 'Home', icon: LayoutDashboard, roles: ['admin', 'operator', 'viewer'] },
  { href: '/checkin', label: 'Check-In', icon: LogIn, roles: ['admin', 'operator'] },
  { href: '/checkout', label: 'Check-Out', icon: ExitIcon, roles: ['admin', 'operator'] },
  { href: '/active', label: 'Active', icon: Car, roles: ['admin', 'operator', 'viewer'] },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'operator', 'viewer'] },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const visible = items.filter((i) => canAccess(user?.role, i.roles));

  return (
    <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="glass-strong rounded-2xl px-2 py-2 flex justify-around items-center shadow-lg">
        {visible.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl flex-1"
            >
              {active && (
                <motion.div
                  layoutId="mobileActiveBg"
                  className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl -z-10"
                />
              )}
              <Icon className={cn('w-5 h-5', active ? 'text-white' : 'text-slate-500')} />
              <span className={cn('text-[10px] font-medium', active ? 'text-white' : 'text-slate-500')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
