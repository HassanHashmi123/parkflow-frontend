'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Eye, EyeOff, Store, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BRANDING } from '@/config/branding';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const existingUser = useAuth((s) => s.user);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (existingUser) router.replace('/');
  }, [existingUser, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.login(username, password);
      setAuth(data.user, data.access_token);
      toast.success(`Welcome back, ${data.user.full_name}!`);
      setTimeout(() => router.push('/'), 400);
    } catch (err: any) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role: 'admin' | 'operator' | 'viewer') => {
    const credentials = {
      admin: { u: 'admin', p: 'admin123' },
      operator: { u: 'operator', p: 'operator123' },
      viewer: { u: 'viewer', p: 'viewer123' },
    };
    setUsername(credentials[role].u);
    setPassword(credentials[role].p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating animated blobs */}
      <motion.div
        className="absolute top-10 left-10 w-72 h-72 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 opacity-40 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-gradient-to-br from-pink-300 to-orange-300 opacity-30 blur-3xl"
        animate={{ x: [0, -60, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-200 to-blue-200 opacity-30 blur-3xl"
        animate={{ x: [0, 40, -20, 0], y: [0, -50, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          x: shake ? [-10, 10, -10, 10, 0] : 0,
        }}
        transition={{ duration: shake ? 0.4 : 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-8 sm:p-10 shadow-2xl">
          {/* Logo / branding */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="relative">
              <motion.div
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-glow"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {BRANDING.app.logo ? (
                  <img src={BRANDING.app.logo} alt={BRANDING.app.name} className="w-12 h-12 object-contain" />
                ) : (
                  <Store className="w-10 h-10 text-white" />
                )}
              </motion.div>
              <motion.div
                className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 opacity-30 blur-xl -z-10"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <h1 className="mt-5 text-2xl sm:text-3xl font-bold font-display tracking-tight text-center leading-tight">
              <span className="gradient-text">{BRANDING.app.name}</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">{BRANDING.app.tagline}</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-glass w-full pl-11 pr-4 py-3 rounded-xl text-slate-800 font-medium"
                  placeholder="Enter username"
                  autoComplete="username"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-glass w-full pl-11 pr-12 py-3 rounded-xl text-slate-800 font-medium"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="btn-gradient w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </motion.div>
                ) : (
                  <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    Sign in
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Quick login chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 pt-6 border-t border-slate-200/60"
          >
            <p className="text-xs text-center text-slate-500 mb-3 font-medium uppercase tracking-wider">
              Quick demo login
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'admin' as const, label: 'Admin', color: 'from-purple-500 to-pink-500' },
                { role: 'operator' as const, label: 'Operator', color: 'from-blue-500 to-cyan-500' },
                { role: 'viewer' as const, label: 'Viewer', color: 'from-emerald-500 to-teal-500' },
              ].map((r) => (
                <motion.button
                  key={r.role}
                  type="button"
                  onClick={() => fillCredentials(r.role)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`text-xs font-semibold py-2 px-3 rounded-lg bg-gradient-to-r ${r.color} text-white shadow-md hover:shadow-lg transition-shadow`}
                >
                  {r.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-xs text-slate-500 mt-6"
        >
          {BRANDING.app.name} {BRANDING.app.version}
        </motion.p>
      </motion.div>
    </div>
  );
}
