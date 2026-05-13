// 'use client';

// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { User, Lock, Save, Loader2, Eye, EyeOff, Sparkles, LogOut } from 'lucide-react';
// import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';
// import { authApi } from '@/lib/api';
// import { useAuth } from '@/lib/auth';
// import TopBar from '@/components/TopBar';

// export default function SettingsPage() {
//   const router = useRouter();
//   const { user, logout } = useAuth();

//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showCurrent, setShowCurrent] = useState(false);
//   const [showNew, setShowNew] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const passwordStrength = (() => {
//     if (!newPassword) return 0;
//     let s = 0;
//     if (newPassword.length >= 6) s++;
//     if (newPassword.length >= 10) s++;
//     if (/[A-Z]/.test(newPassword)) s++;
//     if (/[0-9]/.test(newPassword)) s++;
//     if (/[^a-zA-Z0-9]/.test(newPassword)) s++;
//     return s;
//   })();

//   const strengthLabel = ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength];
//   const strengthColor = [
//     'bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-600'
//   ][passwordStrength];

//   const handleChangePassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!currentPassword || !newPassword) {
//       toast.error('Please fill all fields');
//       return;
//     }
//     if (newPassword.length < 6) {
//       toast.error('New password must be at least 6 characters');
//       return;
//     }
//     if (newPassword !== confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     setLoading(true);
//     try {
//       await authApi.changePassword(currentPassword, newPassword);
//       toast.success('Password changed successfully!');
//       setCurrentPassword('');
//       setNewPassword('');
//       setConfirmPassword('');
//     } catch (err: any) {
//       toast.error(err.response?.data?.detail || 'Password change failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     router.push('/login');
//   };

//   return (
//     <div className="space-y-6">
//       <TopBar />

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden"
//       >
//         <motion.div
//           className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-slate-300 to-blue-300 opacity-20 blur-3xl"
//           animate={{ rotate: 360 }}
//           transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
//         />
//         <div className="relative">
//           <div className="flex items-center gap-2 mb-2">
//             <Sparkles className="w-4 h-4 text-blue-500" />
//             <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Account</span>
//           </div>
//           <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
//             Your <span className="gradient-text">Settings</span>
//           </h2>
//           <p className="text-slate-500 text-sm mt-1">Manage your profile and security</p>
//         </div>
//       </motion.div>

//       {/* Profile card */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//         className="glass-strong rounded-3xl p-6"
//       >
//         <div className="flex items-center gap-2 mb-5">
//           <User className="w-5 h-5 text-blue-500" />
//           <h3 className="font-bold text-slate-800 text-lg">Profile</h3>
//         </div>

//         <div className="flex items-center gap-4 mb-6">
//           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
//             {user?.full_name?.charAt(0) ?? '?'}
//           </div>
//           <div>
//             <p className="text-xl font-bold text-slate-800">{user?.full_name}</p>
//             <p className="text-sm text-slate-500">@{user?.username}</p>
//             <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
//               <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
//               {user?.role}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//           <Field label="Username" value={user?.username || ''} />
//           <Field label="Full Name" value={user?.full_name || ''} />
//           <Field label="Email" value={user?.email || 'Not set'} />
//           <Field label="Role" value={user?.role || ''} capitalize />
//         </div>
//       </motion.div>

//       {/* Change Password */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.2 }}
//         className="glass-strong rounded-3xl p-6"
//       >
//         <div className="flex items-center gap-2 mb-5">
//           <Lock className="w-5 h-5 text-purple-500" />
//           <h3 className="font-bold text-slate-800 text-lg">Change Password</h3>
//         </div>

//         <form onSubmit={handleChangePassword} className="space-y-4">
//           <div>
//             <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Current Password</label>
//             <div className="relative">
//               <input
//                 type={showCurrent ? 'text' : 'password'}
//                 value={currentPassword}
//                 onChange={(e) => setCurrentPassword(e.target.value)}
//                 className="input-glass w-full px-4 py-3 pr-11 rounded-xl"
//                 placeholder="••••••••"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowCurrent((s) => !s)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//               >
//                 {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">New Password</label>
//             <div className="relative">
//               <input
//                 type={showNew ? 'text' : 'password'}
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 className="input-glass w-full px-4 py-3 pr-11 rounded-xl"
//                 placeholder="••••••••"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowNew((s) => !s)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//               >
//                 {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>

//             {/* Strength indicator */}
//             {newPassword && (
//               <div className="mt-2">
//                 <div className="flex gap-1 mb-1">
//                   {[1, 2, 3, 4, 5].map((i) => (
//                     <motion.div
//                       key={i}
//                       initial={{ scaleX: 0 }}
//                       animate={{ scaleX: i <= passwordStrength ? 1 : 0.2 }}
//                       className={`h-1 flex-1 rounded-full origin-left ${i <= passwordStrength ? strengthColor : 'bg-slate-200'}`}
//                     />
//                   ))}
//                 </div>
//                 <p className="text-xs text-slate-500">
//                   Strength: <span className="font-semibold text-slate-700">{strengthLabel}</span>
//                 </p>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Confirm New Password</label>
//             <input
//               type={showNew ? 'text' : 'password'}
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               className={`input-glass w-full px-4 py-3 rounded-xl ${
//                 confirmPassword && confirmPassword !== newPassword ? 'border-rose-300' : ''
//               }`}
//               placeholder="••••••••"
//             />
//             {confirmPassword && confirmPassword !== newPassword && (
//               <p className="text-xs text-rose-500 mt-1">Passwords do not match</p>
//             )}
//           </div>

//           <motion.button
//             type="submit"
//             disabled={loading}
//             whileHover={{ scale: loading ? 1 : 1.02 }}
//             whileTap={{ scale: loading ? 1 : 0.98 }}
//             className="btn-gradient w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
//           >
//             {loading ? (
//               <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
//             ) : (
//               <><Save className="w-4 h-4" />Update Password</>
//             )}
//           </motion.button>
//         </form>
//       </motion.div>

//       {/* Logout */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3 }}
//         className="glass-strong rounded-3xl p-6"
//       >
//         <h3 className="font-bold text-slate-800 text-lg mb-3">Sign Out</h3>
//         <p className="text-sm text-slate-500 mb-4">Sign out of your ParkFlow account on this device.</p>
//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           onClick={handleLogout}
//           className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold flex items-center gap-2 transition"
//         >
//           <LogOut className="w-4 h-4" />
//           Logout
//         </motion.button>
//       </motion.div>
//     </div>
//   );
// }

// function Field({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
//   return (
//     <div className="bg-slate-50 rounded-xl p-3">
//       <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
//       <p className={`text-sm font-bold text-slate-800 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
//     </div>
//   );
// }







'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Lock, Save, Loader2, Eye, EyeOff, Sparkles, LogOut,
  Edit2, Check, X, Mail, AtSign
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { authApi, usersApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import TopBar from '@/components/TopBar';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = (() => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 6) s++;
    if (newPassword.length >= 10) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) s++;
    return s;
  })();

  const strengthLabel = ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength];
  const strengthColor = [
    'bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-600'
  ][passwordStrength];

  const startEditing = () => {
    setProfileForm({
      full_name: user?.full_name || '',
      email: user?.email || '',
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setProfileForm({
      full_name: user?.full_name || '',
      email: user?.email || '',
    });
  };

  const saveProfile = async () => {
    if (!profileForm.full_name.trim()) {
      toast.error('Full name cannot be empty');
      return;
    }
    if (!user?.id) {
      toast.error('User not loaded');
      return;
    }

    setSavingProfile(true);
    try {
      // Use users PATCH endpoint (admin only - works for editing own profile too)
      await usersApi.update(user.id, {
        full_name: profileForm.full_name.trim(),
        email: profileForm.email.trim() || null,
      });
      toast.success('Profile updated successfully!');
      setEditing(false);

      // Refresh user data in auth context
      if (refreshUser) {
        await refreshUser();
      } else {
        // Fallback: refetch from /me
        const fresh = await authApi.me();
        if (typeof window !== 'undefined') {
          localStorage.setItem('parkflow_user', JSON.stringify(fresh));
          window.location.reload();
        }
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string' && detail.toLowerCase().includes('admin')) {
        toast.error('Only admins can edit profiles. Ask your admin to update.');
      } else {
        toast.error(detail || 'Profile update failed');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="space-y-6">
      <TopBar />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <motion.div
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-slate-300 to-blue-300 opacity-20 blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Account</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Your <span className="gradient-text">Settings</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage your profile and security</p>
        </div>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-3xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-800 text-lg">Profile</h3>
          </div>
          {!editing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startEditing}
              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Profile
            </motion.button>
          ) : (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelEditing}
                disabled={savingProfile}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveProfile}
                disabled={savingProfile}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save
              </motion.button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {(editing ? profileForm.full_name : user?.full_name)?.charAt(0) ?? '?'}
          </div>
          <div className="flex-1">
            {editing ? (
              <input
                type="text"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                placeholder="Full Name"
                className="input-glass w-full px-3 py-2 rounded-xl text-lg font-bold mb-1"
                autoFocus
              />
            ) : (
              <p className="text-xl font-bold text-slate-800">{user?.full_name}</p>
            )}
            <p className="text-sm text-slate-500">@{user?.username}</p>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {user?.role}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Username" value={user?.username || ''} readOnly />

          {editing ? (
            <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-200">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Email</p>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="email@example.com"
                className="input-glass w-full px-2 py-1 rounded-lg text-sm font-bold"
              />
            </div>
          ) : (
            <Field label="Email" value={user?.email || 'Not set'} icon={Mail} />
          )}

          <Field label="Full Name (Display)" value={editing ? profileForm.full_name : (user?.full_name || '')} />
          <Field label="Role" value={user?.role || ''} capitalize readOnly />
        </div>

        {editing && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <p className="font-semibold mb-1">⚠️ Note about profile editing:</p>
            <p>Username and role cannot be changed (security). Only admins can edit profiles. Your admin role lets you edit your own profile and other users from User Management.</p>
          </div>
        )}
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-strong rounded-3xl p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-5 h-5 text-purple-500" />
          <h3 className="font-bold text-slate-800 text-lg">Change Password</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-glass w-full px-4 py-3 pr-11 rounded-xl"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-glass w-full px-4 py-3 pr-11 rounded-xl"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {newPassword && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: i <= passwordStrength ? 1 : 0.2 }}
                      className={`h-1 flex-1 rounded-full origin-left ${i <= passwordStrength ? strengthColor : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Strength: <span className="font-semibold text-slate-700">{strengthLabel}</span>
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Confirm New Password</label>
            <input
              type={showNew ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`input-glass w-full px-4 py-3 rounded-xl ${
                confirmPassword && confirmPassword !== newPassword ? 'border-rose-300' : ''
              }`}
              placeholder="••••••••"
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-rose-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="btn-gradient w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4" />Update Password</>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-strong rounded-3xl p-6"
      >
        <h3 className="font-bold text-slate-800 text-lg mb-3">Sign Out</h3>
        <p className="text-sm text-slate-500 mb-4">Sign out of your ParkFlow account on this device.</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold flex items-center gap-2 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </motion.button>
      </motion.div>
    </div>
  );
}

function Field({ label, value, capitalize, readOnly, icon: Icon }: { label: string; value: string; capitalize?: boolean; readOnly?: boolean; icon?: any }) {
  return (
    <div className={`bg-slate-50 rounded-xl p-3 ${readOnly ? 'opacity-75' : ''}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {label} {readOnly && <span className="text-slate-300">(read-only)</span>}
      </p>
      <p className={`text-sm font-bold text-slate-800 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  );
}
