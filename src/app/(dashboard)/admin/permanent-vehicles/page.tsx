// 'use client';

// import { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   CarFront, Plus, X, Edit2, Power, Sparkles, Loader2, Search,
//   Store, User, Phone, Car, Bike, Truck
// } from 'lucide-react';
// import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';
// import { permanentVehiclesApi, shopsApi, vehicleTypesApi } from '@/lib/api';
// import { useAuth, canAccess } from '@/lib/auth';
// import TopBar from '@/components/TopBar';
// import { ListItemSkeleton } from '@/components/Skeletons';
// import ConfirmModal from '@/components/ConfirmModal';

// const ICONS: Record<string, any> = { car: Car, bike: Bike, truck: Truck };

// export default function PermanentVehiclesPage() {
//   const router = useRouter();
//   const { user } = useAuth();

//   const [vehicles, setVehicles] = useState<any[]>([]);
//   const [shops, setShops] = useState<any[]>([]);
//   const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [showAdd, setShowAdd] = useState(false);
//   const [confirmDeactivate, setConfirmDeactivate] = useState<any>(null);
//   const [actionLoading, setActionLoading] = useState(false);

//   // Add form
//   const [form, setForm] = useState({ plate_number: '', shop_id: '', vehicle_type_id: '', owner_name: '', owner_phone: '', notes: '' });
//   const [adding, setAdding] = useState(false);

//   useEffect(() => {
//     if (user && !canAccess(user?.role, ['admin'])) {
//       toast.error('Admin access required');
//       router.replace('/');
//     }
//   }, [user, router]);

//   const loadData = async () => {
//     try {
//       const [v, s, vt] = await Promise.all([
//         permanentVehiclesApi.list({ limit: 500 }),
//         shopsApi.list({ limit: 1000 }),
//         vehicleTypesApi.list(),
//       ]);
//       setVehicles(v);
//       setShops(s);
//       setVehicleTypes(vt);
//     } catch (e) { console.error(e); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => { loadData(); }, []);

//   const filtered = vehicles.filter((v: any) => {
//     const q = search.toLowerCase();
//     return !q || v.plate_number.toLowerCase().includes(q) || (v.owner_name && v.owner_name.toLowerCase().includes(q)) || (v.shop?.shop_number && v.shop.shop_number.toLowerCase().includes(q));
//   });

//   const handleAdd = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form.plate_number.trim()) return toast.error('Plate number required');
//     if (!form.shop_id) return toast.error('Select a shop');
//     if (!form.vehicle_type_id) return toast.error('Select vehicle type');
//     setAdding(true);
//     try {
//       await permanentVehiclesApi.create({
//         plate_number: form.plate_number.trim().toUpperCase(),
//         shop_id: parseInt(form.shop_id),
//         vehicle_type_id: parseInt(form.vehicle_type_id),
//         owner_name: form.owner_name.trim() || undefined,
//         owner_phone: form.owner_phone.trim() || undefined,
//         notes: form.notes.trim() || undefined,
//       });
//       toast.success(`${form.plate_number.toUpperCase()} registered`);
//       setForm({ plate_number: '', shop_id: '', vehicle_type_id: '', owner_name: '', owner_phone: '', notes: '' });
//       setShowAdd(false);
//       await loadData();
//     } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed to register'); }
//     finally { setAdding(false); }
//   };

//   const handleDeactivate = async () => {
//     if (!confirmDeactivate) return;
//     setActionLoading(true);
//     try {
//       await permanentVehiclesApi.deactivate(confirmDeactivate.id);
//       toast.success(`${confirmDeactivate.plate_number} deactivated`);
//       setConfirmDeactivate(null);
//       await loadData();
//     } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed'); }
//     finally { setActionLoading(false); }
//   };

//   return (
//     <div className="space-y-6">
//       <TopBar />

//       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden">
//         <motion.div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-blue-300 to-indigo-300 opacity-20 blur-3xl" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
//         <div className="relative flex items-center justify-between flex-wrap gap-4">
//           <div>
//             <div className="flex items-center gap-2 mb-2">
//               <Sparkles className="w-4 h-4 text-blue-500" />
//               <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Admin · Registered Vehicles</span>
//             </div>
//             <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Permanent <span className="gradient-text">Vehicles</span></h2>
//             <p className="text-slate-500 text-sm mt-1">Pre-registered shop keeper vehicles — no slip, no fee</p>
//           </div>
//           <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)} className="btn-gradient px-5 py-3 rounded-2xl text-white font-semibold flex items-center gap-2 shadow-lg">
//             <Plus className="w-5 h-5" /> Register Vehicle
//           </motion.button>
//         </div>
//       </motion.div>

//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-3">
//         <div className="glass-strong rounded-2xl p-4 text-center">
//           <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Registered</p>
//           <p className="text-3xl font-bold gradient-text mt-1">{vehicles.length}</p>
//         </div>
//         <div className="glass-strong rounded-2xl p-4 text-center">
//           <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active</p>
//           <p className="text-3xl font-bold text-emerald-600 mt-1">{vehicles.filter((v: any) => v.is_active).length}</p>
//         </div>
//         <div className="glass-strong rounded-2xl p-4 text-center">
//           <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Shops with Vehicles</p>
//           <p className="text-3xl font-bold text-blue-600 mt-1">{new Set(vehicles.map((v: any) => v.shop_id)).size}</p>
//         </div>
//       </div>

//       {/* Search */}
//       <div className="glass-strong rounded-2xl p-4">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//           <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by plate, owner, or shop number..." className="input-glass w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
//         </div>
//       </div>

//       {/* List */}
//       {loading ? (
//         <div className="space-y-2"><ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton /></div>
//       ) : filtered.length === 0 ? (
//         <div className="glass-strong rounded-3xl p-12 text-center">
//           <CarFront className="w-16 h-16 mx-auto text-slate-300 mb-3" />
//           <p className="text-slate-500 font-medium">No permanent vehicles registered</p>
//         </div>
//       ) : (
//         <div className="space-y-2">
//           <p className="text-sm text-slate-500 px-2">{filtered.length} vehicles</p>
//           <AnimatePresence>
//             {filtered.map((v: any, idx: number) => {
//               const VIcon = ICONS[v.vehicle_type?.icon || 'car'] || Car;
//               return (
//                 <motion.div key={v.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.02 }} className={`glass-strong rounded-2xl p-4 flex items-center gap-4 ${!v.is_active ? 'opacity-60' : ''}`}>
//                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
//                     <VIcon className="w-6 h-6" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 flex-wrap">
//                       <p className="text-lg font-bold font-mono text-slate-800">{v.plate_number}</p>
//                       <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">{v.vehicle_type?.name || 'Vehicle'}</span>
//                       {!v.is_active && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase">Inactive</span>}
//                     </div>
//                     <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
//                       <span className="flex items-center gap-1"><Store className="w-3 h-3" />{v.shop?.shop_number || 'N/A'}{v.shop?.shop_name ? ` · ${v.shop.shop_name}` : ''}</span>
//                       {v.owner_name && <span className="flex items-center gap-1"><User className="w-3 h-3" />{v.owner_name}</span>}
//                       {v.owner_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{v.owner_phone}</span>}
//                     </div>
//                   </div>
//                   <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setConfirmDeactivate(v)} title="Deactivate" className="w-9 h-9 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center">
//                     <Power className="w-4 h-4" />
//                   </motion.button>
//                 </motion.div>
//               );
//             })}
//           </AnimatePresence>
//         </div>
//       )}

//       {/* Add Modal */}
//       <AnimatePresence>
//         {showAdd && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => !adding && setShowAdd(false)}>
//             <motion.div initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.7, y: 30 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto">
//               <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-6 text-white relative">
//                 <button onClick={() => !adding && setShowAdd(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><X className="w-4 h-4" /></button>
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><CarFront className="w-5 h-5" /></div>
//                   <div><p className="text-xs font-semibold opacity-90 uppercase tracking-wider">Register</p><p className="text-lg font-bold">Permanent Vehicle</p></div>
//                 </div>
//               </div>
//               <form onSubmit={handleAdd} className="p-6 space-y-4">
//                 <div>
//                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Plate Number *</label>
//                   <input type="text" value={form.plate_number} onChange={(e) => setForm({ ...form, plate_number: e.target.value.toUpperCase() })} placeholder="ABC-123" className="input-glass w-full px-4 py-3 rounded-xl text-xl font-mono font-bold tracking-wider text-center" autoFocus />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Shop *</label>
//                   <select value={form.shop_id} onChange={(e) => setForm({ ...form, shop_id: e.target.value })} className="input-glass w-full px-3 py-2.5 rounded-xl text-sm">
//                     <option value="">Select shop...</option>
//                     {shops.filter((s: any) => s.is_active).map((s: any) => (
//                       <option key={s.id} value={s.id}>{s.shop_number} — {s.owner_name}{s.shop_name ? ` (${s.shop_name})` : ''}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vehicle Type *</label>
//                   <select value={form.vehicle_type_id} onChange={(e) => setForm({ ...form, vehicle_type_id: e.target.value })} className="input-glass w-full px-3 py-2.5 rounded-xl text-sm">
//                     <option value="">Select type...</option>
//                     {vehicleTypes.map((t: any) => (
//                       <option key={t.id} value={t.id}>{t.name} (Rs. {t.flat_rate})</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Driver/Owner Name</label><input type="text" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} placeholder="Optional" className="input-glass w-full px-3 py-2 rounded-xl text-sm" /></div>
//                   <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone</label><input type="text" value={form.owner_phone} onChange={(e) => setForm({ ...form, owner_phone: e.target.value })} placeholder="Optional" className="input-glass w-full px-3 py-2 rounded-xl text-sm" /></div>
//                 </div>
//                 <motion.button type="submit" disabled={adding} whileHover={{ scale: adding ? 1 : 1.02 }} whileTap={{ scale: adding ? 1 : 0.98 }} className="btn-gradient w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
//                   {adding ? <><Loader2 className="w-4 h-4 animate-spin" />Registering...</> : <><Plus className="w-4 h-4" />Register Vehicle</>}
//                 </motion.button>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <ConfirmModal open={!!confirmDeactivate} title={`Deactivate ${confirmDeactivate?.plate_number}?`} message="This vehicle will no longer be treated as permanent. It will be charged as guest on next visit." confirmLabel="Deactivate" variant="danger" loading={actionLoading} onConfirm={handleDeactivate} onCancel={() => setConfirmDeactivate(null)} />
//     </div>
//   );
// }





'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CarFront, Plus, X, Power, Sparkles, Loader2, Search,
  Store, User, Phone, Car, Bike, Truck, Upload, Printer
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { permanentVehiclesApi, shopsApi, vehicleTypesApi } from '@/lib/api';
import { useAuth, canAccess } from '@/lib/auth';
import TopBar from '@/components/TopBar';
import { ListItemSkeleton } from '@/components/Skeletons';
import ConfirmModal from '@/components/ConfirmModal';

const ICONS: Record<string, any> = { car: Car, bike: Bike, truck: Truck };

export default function PermanentVehiclesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Add form
  const [form, setForm] = useState({ plate_number: '', shop_id: '', vehicle_type_id: '', owner_name: '', owner_phone: '', notes: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user && !canAccess(user?.role, ['admin'])) {
      toast.error('Admin access required');
      router.replace('/');
    }
  }, [user, router]);

  const loadData = async () => {
    try {
      const [v, s, vt] = await Promise.all([
        permanentVehiclesApi.list({ limit: 500 }),
        shopsApi.list({ limit: 1000 }),
        vehicleTypesApi.list(),
      ]);
      setVehicles(Array.isArray(v) ? v : []);
      setShops(Array.isArray(s) ? s : []);
      setVehicleTypes(Array.isArray(vt) ? vt : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = vehicles.filter((v: any) => {
    const q = search.toLowerCase();
    return !q || v.plate_number.toLowerCase().includes(q) || (v.owner_name && v.owner_name.toLowerCase().includes(q)) || (v.shop_number && v.shop_number.toLowerCase().includes(q));
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plate_number.trim()) return toast.error('Plate number required');
    if (!form.shop_id) return toast.error('Select a shop');
    if (!form.vehicle_type_id) return toast.error('Select vehicle type');
    setAdding(true);
    try {
      await permanentVehiclesApi.create({
        plate_number: form.plate_number.trim().toUpperCase(),
        shop_id: parseInt(form.shop_id),
        vehicle_type_id: parseInt(form.vehicle_type_id),
        owner_name: form.owner_name.trim() || undefined,
        owner_phone: form.owner_phone.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success(`${form.plate_number.toUpperCase()} registered`);
      setForm({ plate_number: '', shop_id: '', vehicle_type_id: '', owner_name: '', owner_phone: '', notes: '' });
      setShowAdd(false);
      await loadData();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed to register'); }
    finally { setAdding(false); }
  };

  const handleBulkUpload = async (file: File) => {
    setUploading(true);
    setUploadResult(null);
    try {
      const result = await permanentVehiclesApi.bulkUpload(file);
      setUploadResult(result);
      if (result.created > 0) {
        toast.success(`${result.created} vehicles registered!`);
      }
      if (result.skipped > 0) {
        toast.info(`${result.skipped} skipped (already exist)`);
      }
      if (result.errors > 0) {
        toast.error(`${result.errors} errors — check details`);
      }
      await loadData();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Upload failed'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const generateBarcodesPDF = async () => {
    setGeneratingPDF(true);
    try {
      // fetch without is_active filter — filter client side
      const raw = await permanentVehiclesApi.list({ limit: 2000 });
      const list: any[] = (Array.isArray(raw) ? raw : []).filter((v: any) => v.is_active !== false);

      if (list.length === 0) {
        toast.error('No vehicles found');
        return;
      }

      const mod = await import('jsbarcode');
      const JsBarcode: any = (mod as any).default ?? mod;

      const cardsHtml = list.map((v: any) => {
        let svgHtml = '';
        try {
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          JsBarcode(svg, String(v.plate_number), {
            format: 'CODE128', width: 1.5, height: 40, displayValue: false, margin: 2,
          });
          svgHtml = svg.outerHTML;
        } catch {
          svgHtml = `<div style="height:40px;line-height:40px;font-size:8px;color:red">ERR</div>`;
        }
        return `<div class="card">${svgHtml}<div class="plate">${v.plate_number}</div><div class="phone">${v.owner_phone || '—'}</div></div>`;
      }).join('');

      const win = window.open('', '_blank');
      if (!win) { toast.error('Popup blocked — allow popups and try again'); return; }

      win.document.write(`<!DOCTYPE html><html><head><title>Barcodes</title><style>
        @page{size:A4 portrait;margin:8mm}*{box-sizing:border-box}
        body{font-family:Arial,sans-serif;margin:0;background:#fff}
        .bar{padding:10px;background:#4f46e5;display:flex;gap:12px;align-items:center}
        .bar button{padding:8px 18px;background:#fff;color:#4f46e5;border:none;border-radius:6px;font-weight:bold;cursor:pointer;font-size:14px}
        .bar span{color:#fff;font-size:13px}
        .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;padding:4mm}
        .card{border:1px solid #bbb;padding:2mm;text-align:center;break-inside:avoid}
        .card svg{width:100%;height:auto;display:block}
        .plate{font-weight:bold;font-size:9pt;margin:1mm 0;font-family:monospace}
        .phone{font-size:8pt;color:#555}
        @media print{.bar{display:none}}
      </style></head><body>
        <div class="bar">
          <button onclick="window.print()">🖨 Print / Save as PDF</button>
          <span>${list.length} barcodes</span>
        </div>
        <div class="grid">${cardsHtml}</div>
      </body></html>`);
      win.document.close();
      toast.success(`${list.length} barcodes ready — Print in new window`);
    } catch (err: any) {
      console.error('Barcode error:', err);
      toast.error(err?.message ? `Error: ${err.message}` : 'Failed to generate barcodes');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmDeactivate) return;
    setActionLoading(true);
    try {
      await permanentVehiclesApi.deactivate(confirmDeactivate.id);
      toast.success(`${confirmDeactivate.plate_number} deactivated`);
      setConfirmDeactivate(null);
      await loadData();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6">
      <TopBar />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <motion.div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-blue-300 to-indigo-300 opacity-20 blur-3xl" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Admin · Registered Vehicles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Permanent <span className="gradient-text">Vehicles</span></h2>
            <p className="text-slate-500 text-sm mt-1">Pre-registered shop keeper vehicles — no slip, no fee</p>
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleBulkUpload(e.target.files[0])} />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => fileRef.current?.click()} disabled={uploading} className="glass px-4 py-3 rounded-2xl text-slate-700 font-semibold flex items-center gap-2 hover:bg-white disabled:opacity-50">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              CSV Upload
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generateBarcodesPDF} disabled={generatingPDF || vehicles.length === 0} className="glass px-4 py-3 rounded-2xl text-emerald-700 font-semibold flex items-center gap-2 hover:bg-white disabled:opacity-50">
              {generatingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              {generatingPDF ? 'Generating...' : 'Print Barcodes'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)} className="btn-gradient px-5 py-3 rounded-2xl text-white font-semibold flex items-center gap-2 shadow-lg">
              <Plus className="w-5 h-5" /> Register Vehicle
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Upload result panel */}
      <AnimatePresence>
        {uploadResult && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-strong rounded-2xl p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800">Upload Summary</h4>
              <button onClick={() => setUploadResult(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div className="text-center"><p className="text-xs text-slate-500">Created</p><p className="text-2xl font-bold text-emerald-600">{uploadResult.created}</p></div>
              <div className="text-center"><p className="text-xs text-slate-500">Skipped</p><p className="text-2xl font-bold text-amber-600">{uploadResult.skipped}</p></div>
              <div className="text-center"><p className="text-xs text-slate-500">Errors</p><p className="text-2xl font-bold text-rose-600">{uploadResult.errors}</p></div>
            </div>
            {uploadResult.error_details && uploadResult.error_details.length > 0 && (
              <details className="mt-2">
                <summary className="text-xs text-rose-600 cursor-pointer font-semibold">Show error details</summary>
                <div className="mt-2 max-h-32 overflow-y-auto bg-rose-50 rounded-lg p-2 text-xs text-rose-700 font-mono">
                  {uploadResult.error_details.map((err: string, i: number) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              </details>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-strong rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Registered</p>
          <p className="text-3xl font-bold gradient-text mt-1">{vehicles.length}</p>
        </div>
        <div className="glass-strong rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{vehicles.filter((v: any) => v.is_active).length}</p>
        </div>
        <div className="glass-strong rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Shops with Vehicles</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{new Set(vehicles.map((v: any) => v.shop_id)).size}</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-strong rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by plate, owner, or shop number..." className="input-glass w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2"><ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-strong rounded-3xl p-12 text-center">
          <CarFront className="w-16 h-16 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No permanent vehicles registered</p>
          <p className="text-xs text-slate-400 mt-1">Use CSV upload or register manually</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-slate-500 px-2">{filtered.length} vehicles</p>
          <AnimatePresence>
            {filtered.map((v: any, idx: number) => {
              const VIcon = ICONS[v.vehicle_type_name?.toLowerCase() === 'bike' ? 'bike' : v.vehicle_type_name?.toLowerCase().includes('truck') ? 'truck' : 'car'] || Car;
              return (
                <motion.div key={v.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.02 }} className={`glass-strong rounded-2xl p-4 flex items-center gap-4 ${!v.is_active ? 'opacity-60' : ''}`}>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                    <VIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-lg font-bold font-mono text-slate-800">{v.plate_number}</p>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">{v.vehicle_type_name || 'Vehicle'}</span>
                      {!v.is_active && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase">Inactive</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><Store className="w-3 h-3" />{v.shop_number || 'N/A'}{v.shop_name ? ` · ${v.shop_name}` : ''}</span>
                      {v.owner_name && <span className="flex items-center gap-1"><User className="w-3 h-3" />{v.owner_name}</span>}
                      {v.owner_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{v.owner_phone}</span>}
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setConfirmDeactivate(v)} title="Deactivate" className="w-9 h-9 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Power className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => !adding && setShowAdd(false)}>
            <motion.div initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.7, y: 30 }} transition={{ type: 'spring', stiffness: 250, damping: 22 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-6 text-white relative">
                <button onClick={() => !adding && setShowAdd(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><X className="w-4 h-4" /></button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><CarFront className="w-5 h-5" /></div>
                  <div><p className="text-xs font-semibold opacity-90 uppercase tracking-wider">Register</p><p className="text-lg font-bold">Permanent Vehicle</p></div>
                </div>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Plate Number *</label>
                  <input type="text" value={form.plate_number} onChange={(e) => setForm({ ...form, plate_number: e.target.value.toUpperCase() })} placeholder="ABC-123" className="input-glass w-full px-4 py-3 rounded-xl text-xl font-mono font-bold tracking-wider text-center" autoFocus />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Shop *</label>
                  <select value={form.shop_id} onChange={(e) => setForm({ ...form, shop_id: e.target.value })} className="input-glass w-full px-3 py-2.5 rounded-xl text-sm">
                    <option value="">Select shop...</option>
                    {shops.filter((s: any) => s.is_active).map((s: any) => (
                      <option key={s.id} value={s.id}>{s.shop_number} — {s.owner_name}{s.shop_name ? ` (${s.shop_name})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vehicle Type *</label>
                  <select value={form.vehicle_type_id} onChange={(e) => setForm({ ...form, vehicle_type_id: e.target.value })} className="input-glass w-full px-3 py-2.5 rounded-xl text-sm">
                    <option value="">Select type...</option>
                    {vehicleTypes.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name} (Rs. {t.flat_rate})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Driver/Owner Name</label><input type="text" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} placeholder="Optional" className="input-glass w-full px-3 py-2 rounded-xl text-sm" /></div>
                  <div><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone</label><input type="text" value={form.owner_phone} onChange={(e) => setForm({ ...form, owner_phone: e.target.value })} placeholder="Optional" className="input-glass w-full px-3 py-2 rounded-xl text-sm" /></div>
                </div>
                <motion.button type="submit" disabled={adding} whileHover={{ scale: adding ? 1 : 1.02 }} whileTap={{ scale: adding ? 1 : 0.98 }} className="btn-gradient w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                  {adding ? <><Loader2 className="w-4 h-4 animate-spin" />Registering...</> : <><Plus className="w-4 h-4" />Register Vehicle</>}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal open={!!confirmDeactivate} title={`Deactivate ${confirmDeactivate?.plate_number}?`} message="This vehicle will no longer be treated as permanent. It will be charged as guest on next visit." confirmLabel="Deactivate" variant="danger" loading={actionLoading} onConfirm={handleDeactivate} onCancel={() => setConfirmDeactivate(null)} />
    </div>
  );
}
