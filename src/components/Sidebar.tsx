// 'use client';

// import { usePathname, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import {
//   LayoutDashboard, LogIn, LogOut, Car, Search,
//   BarChart3, Settings, Users, Tag, Sparkles, Calendar
// } from 'lucide-react';
// import { useAuth, canAccess } from '@/lib/auth';
// import { cn } from '@/lib/utils';

// interface NavItem {
//   href: string;
//   label: string;
//   icon: any;
//   roles: string[];
// }

// const navItems: NavItem[] = [
//   { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'operator', 'viewer'] },
//   { href: '/checkin', label: 'Check-In', icon: LogIn, roles: ['admin', 'operator'] },
//   { href: '/checkout', label: 'Check-Out', icon: LogOut, roles: ['admin', 'operator'] },
//   { href: '/active', label: 'Active Vehicles', icon: Car, roles: ['admin', 'operator', 'viewer'] },
//   { href: '/today', label: "Today's Sessions", icon: Calendar, roles: ['admin', 'operator', 'viewer'] },
//   { href: '/search', label: 'Search', icon: Search, roles: ['admin', 'operator', 'viewer'] },
//   { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'operator', 'viewer'] },
// ];

// const adminItems: NavItem[] = [
//   { href: '/admin/vehicle-types', label: 'Vehicle Types', icon: Tag, roles: ['admin'] },
//   { href: '/admin/users', label: 'User Management', icon: Users, roles: ['admin'] },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { user, logout } = useAuth();

//   const handleLogout = () => {
//     logout();
//     router.push('/login');
//   };

//   const visibleNav = navItems.filter((it) => canAccess(user?.role, it.roles));
//   const visibleAdmin = adminItems.filter((it) => canAccess(user?.role, it.roles));

//   return (
//     <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 p-4">
//       <div className="glass-strong rounded-3xl flex flex-col h-full p-5">
//         {/* Brand */}
//         <Link href="/" className="flex items-center gap-3 px-2 mb-8 group">
//           <motion.div
//             whileHover={{ rotate: 360 }}
//             transition={{ duration: 0.6 }}
//             className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md"
//           >
//             <Sparkles className="w-5 h-5 text-white" />
//           </motion.div>
//           <div>
//             <p className="font-bold text-lg leading-none gradient-text font-display">ParkFlow</p>
//             <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">v2.0</p>
//           </div>
//         </Link>

//         {/* User info card */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="glass rounded-2xl p-3 mb-6 flex items-center gap-3"
//         >
//           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
//             {user?.full_name?.charAt(0) ?? '?'}
//           </div>
//           <div className="min-w-0 flex-1">
//             <p className="text-sm font-semibold text-slate-800 truncate">{user?.full_name}</p>
//             <div className="flex items-center gap-1.5 mt-0.5">
//               <span className="live-dot" />
//               <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
//             </div>
//           </div>
//         </motion.div>

//         {/* Main nav */}
//         <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
//           <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">Main</p>
//           {visibleNav.map((item, idx) => (
//             <NavLink key={item.href} item={item} active={pathname === item.href} delay={idx * 0.04} />
//           ))}

//           {visibleAdmin.length > 0 && (
//             <>
//               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 mt-6">Admin</p>
//               {visibleAdmin.map((item, idx) => (
//                 <NavLink key={item.href} item={item} active={pathname === item.href} delay={(visibleNav.length + idx) * 0.04} />
//               ))}
//             </>
//           )}
//         </nav>

//         {/* Bottom: settings + logout */}
//         <div className="space-y-1 pt-4 mt-auto border-t border-slate-200/50">
//           <NavLink
//             item={{ href: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'operator', 'viewer'] }}
//             active={pathname === '/settings'}
//             delay={0}
//           />
//           <motion.button
//             whileHover={{ x: 4 }}
//             onClick={handleLogout}
//             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors text-sm font-medium"
//           >
//             <LogOut className="w-4 h-4" />
//             <span>Logout</span>
//           </motion.button>
//         </div>
//       </div>
//     </aside>
//   );
// }

// function NavLink({ item, active, delay }: { item: NavItem; active: boolean; delay: number }) {
//   const Icon = item.icon;
//   return (
//     <motion.div
//       initial={{ opacity: 0, x: -10 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ delay }}
//     >
//       <Link
//         href={item.href}
//         className={cn(
//           'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
//           active
//             ? 'text-white shadow-md'
//             : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
//         )}
//       >
//         {active && (
//           <motion.div
//             layoutId="activeNavBg"
//             className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg -z-10"
//             transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//           />
//         )}
//         <Icon className="w-4 h-4 flex-shrink-0" />
//         <span>{item.label}</span>
//       </Link>
//     </motion.div>
//   );
// }





'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, LogIn, LogOut, Car, Search,
  BarChart3, Settings, Users, Tag, Calendar,
  Store, CarFront, CreditCard, History, Receipt
} from 'lucide-react';
import { useAuth, canAccess } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { BRANDING } from '@/config/branding';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  roles: string[];
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'operator', 'viewer'] },
  { href: '/checkin', label: 'Check-In', icon: LogIn, roles: ['admin', 'operator'] },
  { href: '/checkout', label: 'Check-Out', icon: LogOut, roles: ['admin', 'operator'] },
  { href: '/active', label: 'Active Vehicles', icon: Car, roles: ['admin', 'operator', 'viewer'] },
  { href: '/today', label: "Today's Sessions", icon: Calendar, roles: ['admin', 'operator', 'viewer'] },
  { href: '/search', label: 'Search', icon: Search, roles: ['admin', 'operator', 'viewer'] },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'operator', 'viewer'] },
  { href: '/history', label: 'History', icon: History, roles: ['admin', 'operator', 'viewer'] },
  { href: '/daily-slip', label: 'Daily Slip', icon: Receipt, roles: ['admin', 'operator'] },
];

const adminItems: NavItem[] = [
  { href: '/admin/shops', label: 'Shops', icon: Store, roles: ['admin'] },
  { href: '/admin/permanent-vehicles', label: 'Permanent Vehicles', icon: CarFront, roles: ['admin'] },
  { href: '/admin/payments', label: 'Monthly Payments', icon: CreditCard, roles: ['admin'] },
  { href: '/admin/vehicle-types', label: 'Vehicle Types', icon: Tag, roles: ['admin'] },
  { href: '/admin/users', label: 'User Management', icon: Users, roles: ['admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const visibleNav = navItems.filter((it) => canAccess(user?.role, it.roles));
  const visibleAdmin = adminItems.filter((it) => canAccess(user?.role, it.roles));

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 p-4">
      <div className="glass-strong rounded-3xl flex flex-col h-full p-5">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 px-2 mb-8 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md"
          >
            {BRANDING.app.logo ? (
              <img src={BRANDING.app.logo} alt={BRANDING.app.name} className="w-6 h-6 object-contain" />
            ) : (
              <Store className="w-5 h-5 text-white" />
            )}
          </motion.div>
          <div className="min-w-0">
            <p className="font-bold text-[13px] leading-tight gradient-text font-display">
              {BRANDING.app.name}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">v3.0 Plaza</p>
          </div>
        </Link>

        {/* User info card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-3 mb-6 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
            {user?.full_name?.charAt(0) ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.full_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="live-dot" />
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </motion.div>

        {/* Main nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">Main</p>
          {visibleNav.map((item, idx) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} delay={idx * 0.04} />
          ))}

          {visibleAdmin.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 mt-6">Admin</p>
              {visibleAdmin.map((item, idx) => (
                <NavLink key={item.href} item={item} active={pathname === item.href} delay={(visibleNav.length + idx) * 0.04} />
              ))}
            </>
          )}
        </nav>

        {/* Bottom: settings + logout */}
        <div className="space-y-1 pt-4 mt-auto border-t border-slate-200/50">
          <NavLink
            item={{ href: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'operator', 'viewer'] }}
            active={pathname === '/settings'}
            delay={0}
          />
          <motion.button
            whileHover={{ x: 4 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </motion.button>
        </div>
      </div>
    </aside>
  );
}

function NavLink({ item, active, delay }: { item: NavItem; active: boolean; delay: number }) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <Link
        href={item.href}
        className={cn(
          'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
          active
            ? 'text-white shadow-md'
            : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
        )}
      >
        {active && (
          <motion.div
            layoutId="activeNavBg"
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg -z-10"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span>{item.label}</span>
      </Link>
    </motion.div>
  );
}
