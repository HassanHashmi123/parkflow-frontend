'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Plus, X, Edit2, Trash2, Power, Car, Bike, Truck, Sparkles,
  Save, Loader2, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { vehicleTypesApi } from '@/lib/api';
import { useAuth, canAccess } from '@/lib/auth';
import TopBar from '@/components/TopBar';
import { ListItemSkeleton } from '@/components/Skeletons';
import ConfirmModal from '@/components/ConfirmModal';

const ICONS: Record<string, any> = { car: Car, bike: Bike, truck: Truck };
const ICON_OPTIONS = ['car', 'bike', 'truck'];

interface VehicleType {
  id: number;
  name: string;
  flat_rate: number;
  icon?: string;
  is_active: boolean;
  created_at: string;
}

export default function VehicleTypesAdminPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [types, setTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; flat_rate: string }>({ name: '', flat_rate: '' });
  const [confirmDelete, setConfirmDelete] = useState<VehicleType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Add form state
  const [newName, setNewName] = useState('');
  const [newRate, setNewRate] = useState('');
  const [newIcon, setNewIcon] = useState('car');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user && !canAccess(user?.role, ['admin'])) {
      toast.error('Admin access required');
      router.replace('/');
    }
  }, [user, router]);

  const loadData = async () => {
    try {
      // Show active and inactive types so admins can reactivate a deactivated type.
      const data = await vehicleTypesApi.list(false);
      setTypes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRate || parseFloat(newRate) <= 0) {
      toast.error('Please enter valid name and rate');
      return;
    }
    setAdding(true);
    try {
      await vehicleTypesApi.create({
        name: newName.trim(),
        flat_rate: parseFloat(newRate),
        icon: newIcon,
      });
      toast.success(`${newName} added successfully`);
      setNewName('');
      setNewRate('');
      setNewIcon('car');
      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add vehicle type');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (type: VehicleType) => {
    setEditingId(type.id);
    setEditValues({ name: type.name, flat_rate: String(type.flat_rate) });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: '', flat_rate: '' });
  };

  const saveEdit = async (id: number) => {
    if (!editValues.name.trim() || !editValues.flat_rate) return;
    setActionLoading(true);
    try {
      await vehicleTypesApi.update(id, {
        name: editValues.name.trim(),
        flat_rate: parseFloat(editValues.flat_rate),
      });
      toast.success('Updated successfully');
      setEditingId(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleActive = async (type: VehicleType) => {
    setActionLoading(true);
    try {
      await vehicleTypesApi.update(type.id, { is_active: !type.is_active });
      toast.success(type.is_active ? `${type.name} deactivated` : `${type.name} activated`);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    try {
      await vehicleTypesApi.delete(confirmDelete.id);
      toast.success(`${confirmDelete.name} deleted`);
      setConfirmDelete(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Delete failed');
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
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-cyan-300 to-blue-300 opacity-20 blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
                Admin · Vehicle Types
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Manage <span className="gradient-text">Vehicle Types</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Add categories, edit rates, and manage active status
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="btn-gradient px-5 py-3 rounded-2xl text-white font-semibold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add New Type
          </motion.button>
        </div>
      </motion.div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-strong rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Types</p>
          <p className="text-3xl font-bold gradient-text mt-1">{types.length}</p>
        </div>
        <div className="glass-strong rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">
            {types.filter((t) => t.is_active).length}
          </p>
        </div>
        <div className="glass-strong rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Inactive</p>
          <p className="text-3xl font-bold text-slate-400 mt-1">
            {types.filter((t) => !t.is_active).length}
          </p>
        </div>
      </div>

      {/* Types list */}
      {loading ? (
        <div className="space-y-2">
          <ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton />
        </div>
      ) : types.length === 0 ? (
        <div className="glass-strong rounded-3xl p-12 text-center">
          <Tag className="w-16 h-16 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No vehicle types yet</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowAddModal(true)}
            className="btn-gradient mt-4 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
          >
            Add Your First Type
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {types.map((type, idx) => {
              const Icon = ICONS[type.icon || 'car'] || Car;
              const isEditing = editingId === type.id;
              const gradients = [
                'from-blue-500 to-cyan-500',
                'from-emerald-500 to-teal-500',
                'from-amber-500 to-orange-500',
                'from-purple-500 to-pink-500',
                'from-rose-500 to-red-500',
              ];
              const gradient = gradients[idx % gradients.length];

              return (
                <motion.div
                  key={type.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`glass-strong rounded-2xl p-5 relative overflow-hidden ${!type.is_active ? 'opacity-70' : ''}`}
                >
                  <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-2xl`} />

                  <div className="relative">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValues.name}
                            onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                            className="input-glass w-full px-3 py-1.5 rounded-lg text-base font-bold mb-2"
                            autoFocus
                          />
                        ) : (
                          <h3 className="text-lg font-bold text-slate-800">{type.name}</h3>
                        )}

                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-slate-500">Rs.</span>
                            <input
                              type="number"
                              value={editValues.flat_rate}
                              onChange={(e) => setEditValues({ ...editValues, flat_rate: e.target.value })}
                              className="input-glass w-24 px-2 py-1 rounded-lg text-base font-bold"
                              min="1"
                              step="1"
                            />
                          </div>
                        ) : (
                          <p className="text-2xl font-bold gradient-text">Rs. {type.flat_rate}</p>
                        )}

                        <div className="mt-2 flex items-center gap-2">
                          {type.is_active ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase">
                              Inactive
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">ID: {type.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => saveEdit(type.id)}
                            disabled={actionLoading}
                            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                          >
                            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            Save
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={cancelEdit}
                            className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startEdit(type)}
                            className="flex-1 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleActive(type)}
                            disabled={actionLoading}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                              type.is_active
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            {type.is_active ? 'Deactivate' : 'Activate'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setConfirmDelete(type)}
                            className="py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
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
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 text-white relative">
                <button
                  onClick={() => !adding && setShowAddModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold opacity-90 uppercase tracking-wider">New Vehicle Type</p>
                    <p className="text-lg font-bold">Add Category</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Rickshaw, EV, Bus"
                    className="input-glass w-full px-4 py-3 rounded-xl"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Flat Rate (PKR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">Rs.</span>
                    <input
                      type="number"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      placeholder="50"
                      min="1"
                      step="1"
                      className="input-glass w-full pl-12 pr-4 py-3 rounded-xl text-lg font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Icon</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ICON_OPTIONS.map((icon) => {
                      const Icon = ICONS[icon];
                      const isSelected = newIcon === icon;
                      return (
                        <motion.button
                          key={icon}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setNewIcon(icon)}
                          className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-semibold capitalize">{icon}</span>
                          {isSelected && <Check className="w-3 h-3" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={adding}
                  whileHover={{ scale: adding ? 1 : 1.02 }}
                  whileTap={{ scale: adding ? 1 : 0.98 }}
                  className="btn-gradient w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {adding ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Adding...</>
                  ) : (
                    <><Plus className="w-4 h-4" />Add Vehicle Type</>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!confirmDelete}
        title={`Delete ${confirmDelete?.name}?`}
        message="This will permanently delete this vehicle type if it is not used in sessions or permanent vehicles. Used types should be deactivated instead."
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
