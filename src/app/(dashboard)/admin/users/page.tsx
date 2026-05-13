'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, X, Trash2, Power, Sparkles, Loader2, Key, Search,
  Shield, ShieldCheck, Eye, UserCheck, UserX, Calendar, AtSign
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api';
import { useAuth, canAccess } from '@/lib/auth';
import { formatDateTime } from '@/lib/utils';
import TopBar from '@/components/TopBar';
import { ListItemSkeleton } from '@/components/Skeletons';
import ConfirmModal from '@/components/ConfirmModal';

interface UserRecord {
  id: number;
  username: string;
  full_name: string;
  email?: string;
  role: 'admin' | 'operator' | 'viewer';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; gradient: string; icon: any }> = {
  admin: { label: 'Admin', color: 'text-purple-700 bg-purple-50 border-purple-200', gradient: 'from-purple-500 to-pink-500', icon: ShieldCheck },
  operator: { label: 'Operator', color: 'text-blue-700 bg-blue-50 border-blue-200', gradient: 'from-blue-500 to-cyan-500', icon: Shield },
  viewer: { label: 'Viewer', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', gradient: 'from-emerald-500 to-teal-500', icon: Eye },
};

export default function UsersAdminPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'operator' | 'viewer'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetPwModal, setShowResetPwModal] = useState<UserRecord | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<UserRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Add user form
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'operator' | 'viewer'>('operator');
  const [adding, setAdding] = useState(false);

  // Reset password form
  const [resetPw, setResetPw] = useState('');

  useEffect(() => {
    if (currentUser && !canAccess(currentUser?.role, ['admin'])) {
      toast.error('Admin access required');
      router.replace('/');
    }
  }, [currentUser, router]);

  const loadData = async () => {
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = users.filter((u) => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const s = search.toLowerCase();
    const matchesSearch = !s ||
      u.username.toLowerCase().includes(s) ||
      u.full_name.toLowerCase().includes(s) ||
      (u.email && u.email.toLowerCase().includes(s));
    return matchesRole && matchesSearch;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    admins: users.filter((u) => u.role === 'admin').length,
    operators: users.filter((u) => u.role === 'operator').length,
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || newUsername.trim().length < 3) return toast.error('Username must be at least 3 characters');
    if (!newFullName.trim()) return toast.error('Full name is required');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setAdding(true);
    try {
      await usersApi.create({
        username: newUsername.trim().toLowerCase(),
        full_name: newFullName.trim(),
        email: newEmail.trim() || undefined,
        password: newPassword,
        role: newRole,
      });
      toast.success(`${newFullName} added as ${newRole}`);
      setNewUsername(''); setNewFullName(''); setNewEmail(''); setNewPassword(''); setNewRole('operator');
      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setAdding(false);
    }
  };

  const handleResetPassword = async () => {
    if (!showResetPwModal) return;
    if (resetPw.length < 6) return toast.error('Password must be at least 6 characters');
    setActionLoading(true);
    try {
      await usersApi.resetPassword(showResetPwModal.id, resetPw);
      toast.success(`Password reset for ${showResetPwModal.username}`);
      setShowResetPwModal(null);
      setResetPw('');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Reset failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (user: UserRecord) => {
    if (user.id === currentUser?.id) {
      toast.error("You cannot deactivate yourself");
      return;
    }
    setActionLoading(true);
    try {
      if (user.is_active) {
        await usersApi.deactivate(user.id);
        toast.success(`${user.username} deactivated`);
      } else {
        await usersApi.update(user.id, { is_active: true });
        toast.success(`${user.username} reactivated`);
      }
      setConfirmDeactivate(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (user: UserRecord, newRole: string) => {
    if (user.id === currentUser?.id) {
      toast.error("You cannot change your own role");
      return;
    }
    setActionLoading(true);
    try {
      await usersApi.update(user.id, { role: newRole });
      toast.success(`${user.username} is now ${newRole}`);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Role change failed');
    } finally {
      setActionLoading(false);
    }
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
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 opacity-20 blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Admin · User Management
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Manage <span className="gradient-text">Users</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">Add team members, assign roles, and manage access</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="btn-gradient px-5 py-3 rounded-2xl text-white font-semibold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add User
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Total Users" value={stats.total} color="from-blue-500 to-cyan-500" />
        <StatBox label="Active" value={stats.active} color="from-emerald-500 to-teal-500" />
        <StatBox label="Admins" value={stats.admins} color="from-purple-500 to-pink-500" />
        <StatBox label="Operators" value={stats.operators} color="from-amber-500 to-orange-500" />
      </div>

      {/* Filters */}
      <div className="glass-strong rounded-2xl p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username, or email..."
            className="input-glass w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'admin', 'operator', 'viewer'] as const).map((r) => (
            <motion.button
              key={r}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
                filterRole === r ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </motion.button>
          ))}
        </div>
      </div>

      {/* User list */}
      {loading ? (
        <div className="space-y-2">
          <ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-strong rounded-3xl p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((user, idx) => {
              const roleConfig = ROLE_CONFIG[user.role];
              const RoleIcon = roleConfig.icon;
              const isMe = user.id === currentUser?.id;

              return (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ y: -2 }}
                  className={`glass-strong rounded-2xl p-5 flex items-center gap-4 ${!user.is_active ? 'opacity-70' : ''}`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md`}>
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base font-bold text-slate-800">{user.full_name}</p>
                      {isMe && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase border border-blue-200">
                          You
                        </span>
                      )}
                      {!user.is_active && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-slate-500 font-mono">@{user.username}</span>
                      {user.email && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <AtSign className="w-3 h-3" />
                          {user.email}
                        </span>
                      )}
                      {user.last_login && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {formatDateTime(user.last_login)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Role pill - clickable to change */}
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      disabled={isMe || actionLoading}
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${roleConfig.color} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <option value="admin">Admin</option>
                      <option value="operator">Operator</option>
                      <option value="viewer">Viewer</option>
                    </select>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowResetPwModal(user)}
                      title="Reset password"
                      className="w-9 h-9 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center justify-center transition"
                    >
                      <Key className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setConfirmDeactivate(user)}
                      disabled={isMe}
                      title={user.is_active ? 'Deactivate' : 'Reactivate'}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed ${
                        user.is_active
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => !adding && setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, y: 30 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-6 text-white relative">
                <button
                  onClick={() => !adding && setShowAddModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold opacity-90 uppercase tracking-wider">New Team Member</p>
                    <p className="text-lg font-bold">Add User</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Username</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                      placeholder="saad"
                      className="input-glass w-full px-3 py-2.5 rounded-xl text-sm font-mono"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="input-glass w-full px-3 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Saad Ahmed"
                    className="input-glass w-full px-3 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email (optional)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="saad@example.com"
                    className="input-glass w-full px-3 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['admin', 'operator', 'viewer'] as const).map((role) => {
                      const config = ROLE_CONFIG[role];
                      const Icon = config.icon;
                      const isSelected = newRole === role;
                      return (
                        <motion.button
                          key={role}
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setNewRole(role)}
                          className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 overflow-hidden ${
                            isSelected
                              ? 'border-transparent bg-gradient-to-br ' + config.gradient + ' text-white shadow-lg'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-semibold capitalize">{role}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    {newRole === 'admin' && 'Full access — can manage users, rates, and all data'}
                    {newRole === 'operator' && 'Can check vehicles in/out, view reports'}
                    {newRole === 'viewer' && 'Read-only access — view sessions and reports'}
                  </p>
                </div>

                <motion.button
                  type="submit"
                  disabled={adding}
                  whileHover={{ scale: adding ? 1 : 1.02 }}
                  whileTap={{ scale: adding ? 1 : 0.98 }}
                  className="btn-gradient w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {adding ? (<><Loader2 className="w-4 h-4 animate-spin" />Creating...</>) : (<><Plus className="w-4 h-4" />Create User</>)}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetPwModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => !actionLoading && setShowResetPwModal(null)}
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
                onClick={() => !actionLoading && setShowResetPwModal(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                <Key className="w-7 h-7 text-amber-600" />
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-1">Reset Password</h3>
              <p className="text-sm text-slate-600 mb-4">
                Set a new password for <span className="font-bold">@{showResetPwModal.username}</span>
              </p>

              <input
                type="text"
                value={resetPw}
                onChange={(e) => setResetPw(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="input-glass w-full px-4 py-3 rounded-xl mb-4"
                autoFocus
              />

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowResetPwModal(null); setResetPw(''); }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: actionLoading ? 1 : 1.02 }}
                  onClick={handleResetPassword}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deactivate confirm */}
      <ConfirmModal
        open={!!confirmDeactivate}
        title={confirmDeactivate?.is_active ? `Deactivate ${confirmDeactivate?.username}?` : `Reactivate ${confirmDeactivate?.username}?`}
        message={confirmDeactivate?.is_active
          ? 'This user will no longer be able to log in. Their existing data is preserved.'
          : 'This user will be able to log in again.'}
        confirmLabel={confirmDeactivate?.is_active ? 'Deactivate' : 'Reactivate'}
        variant={confirmDeactivate?.is_active ? 'danger' : 'warning'}
        loading={actionLoading}
        onConfirm={() => confirmDeactivate && handleToggleActive(confirmDeactivate)}
        onCancel={() => setConfirmDeactivate(null)}
      />
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass-strong rounded-2xl p-4 relative overflow-hidden"
    >
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-20 blur-xl`} />
      <div className="relative">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
    </motion.div>
  );
}
