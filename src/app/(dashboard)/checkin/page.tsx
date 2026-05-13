// 'use client';

// import { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Car, Bike, Truck, LogIn, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
// import { toast } from 'sonner';
// import { sessionsApi, vehicleTypesApi } from '@/lib/api';
// import { useAuth, canAccess } from '@/lib/auth';
// import { useRouter } from 'next/navigation';
// import TopBar from '@/components/TopBar';
// import ParkingSlip from '@/components/ParkingSlip';

// const ICONS: Record<string, any> = { car: Car, bike: Bike, truck: Truck };

// export default function CheckinPage() {
//   const router = useRouter();
//   const { user } = useAuth();
//   const [types, setTypes] = useState<any[]>([]);
//   const [selectedType, setSelectedType] = useState<any>(null);
//   const [plateNumber, setPlateNumber] = useState('');
//   const [notes, setNotes] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [slipData, setSlipData] = useState<any>(null);

//   useEffect(() => {
//     if (user && !canAccess(user?.role, ['admin', 'operator'])) {
//       router.replace('/');
//     }
//   }, [user, router]);

//   useEffect(() => {
//     vehicleTypesApi.list().then((data) => {
//       setTypes(data);
//       if (data.length > 0) setSelectedType(data[0]);
//     });
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedType) return toast.error('Please select a vehicle type');
//     if (!plateNumber.trim() || plateNumber.trim().length < 2) return toast.error('Please enter a valid plate number');
//     setLoading(true);
//     try {
//       const result = await sessionsApi.checkin({
//         plate_number: plateNumber.trim().toUpperCase(),
//         vehicle_type_id: selectedType.id,
//         entry_method: 'manual',
//         notes: notes.trim() || undefined,
//       });
//       toast.success(`Check-in successful! Token: ${result.session.token}`);
//       setSlipData(result.slip_data);
//       setPlateNumber('');
//       setNotes('');
//     } catch (err: any) {
//       toast.error(err.response?.data?.detail || 'Check-in failed');
//     } finally {
//       setLoading(false);
//     }
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
//           className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-300 opacity-20 blur-3xl"
//           animate={{ rotate: 360 }}
//           transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
//         />
//         <div className="relative">
//           <div className="flex items-center gap-2 mb-2">
//             <Sparkles className="w-4 h-4 text-emerald-500" />
//             <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">New Vehicle Entry</span>
//           </div>
//           <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
//             Vehicle <span className="gradient-text">Check-In</span>
//           </h2>
//           <p className="text-slate-500 text-sm mt-1">Register a new vehicle entry and generate parking slip</p>
//         </div>
//       </motion.div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="glass-strong rounded-3xl p-6"
//         >
//           <div className="mb-5">
//             <h3 className="font-bold text-slate-800 text-lg">Vehicle Type</h3>
//             <p className="text-xs text-slate-500 mt-0.5">Select the category</p>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//             {types.map((type, idx) => {
//               const Icon = ICONS[type.icon || 'car'] || Car;
//               const isSelected = selectedType?.id === type.id;
//               const gradients = ['from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500'];
//               const gradient = gradients[idx % gradients.length];

//               return (
//                 <motion.button
//                   key={type.id}
//                   type="button"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.15 + idx * 0.05 }}
//                   whileHover={{ y: -4, scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => setSelectedType(type)}
//                   className={`relative p-5 rounded-2xl border-2 transition-all overflow-hidden ${
//                     isSelected ? 'border-transparent bg-gradient-to-br ' + gradient + ' text-white shadow-xl' : 'border-slate-200/60 bg-white/50 hover:bg-white text-slate-700'
//                   }`}
//                 >
//                   {isSelected && (
//                     <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
//                       <CheckCircle2 className="w-5 h-5 text-white" />
//                     </motion.div>
//                   )}
//                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isSelected ? 'bg-white/20' : 'bg-gradient-to-br ' + gradient}`}>
//                     <Icon className="w-6 h-6 text-white" />
//                   </div>
//                   <p className="font-bold text-base">{type.name}</p>
//                   <p className={`text-2xl font-bold mt-1 ${isSelected ? 'text-white' : 'gradient-text'}`}>Rs. {type.flat_rate}</p>
//                   <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>Flat rate per visit</p>
//                 </motion.button>
//               );
//             })}
//           </div>
//         </motion.div>

//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-strong rounded-3xl p-6">
//           <h3 className="font-bold text-slate-800 text-lg mb-1">Plate Number</h3>
//           <p className="text-xs text-slate-500 mb-4">Enter the vehicle's registration number</p>
//           <input
//             type="text"
//             value={plateNumber}
//             onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
//             placeholder="ABC-123"
//             className="input-glass w-full px-5 py-4 rounded-2xl text-2xl font-mono font-bold tracking-wider text-center text-slate-800 placeholder:text-slate-300"
//             maxLength={20}
//             autoFocus
//           />
//           <div className="mt-4">
//             <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes (optional)</label>
//             <input
//               type="text"
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//               placeholder="Any special instructions..."
//               className="input-glass w-full px-4 py-2.5 rounded-xl text-sm"
//             />
//           </div>
//         </motion.div>

//         <motion.button
//           type="submit"
//           disabled={loading || !plateNumber || !selectedType}
//           whileHover={{ scale: loading ? 1 : 1.02, y: -2 }}
//           whileTap={{ scale: loading ? 1 : 0.98 }}
//           className="btn-gradient w-full py-5 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
//         >
//           {loading ? (<><Loader2 className="w-6 h-6 animate-spin" />Processing...</>) : (<><LogIn className="w-6 h-6" />Generate Slip & Check-In</>)}
//         </motion.button>
//       </form>

//       <AnimatePresence>
//         {slipData && (
//           <ParkingSlip data={slipData} onClose={() => setSlipData(null)} onNewCheckin={() => setSlipData(null)} />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }






'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Bike, Truck, LogIn, Loader2, CheckCircle2, Sparkles, Camera,
  Store, User, Phone, AlertCircle, Search as SearchIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { sessionsApi, vehicleTypesApi, permanentVehiclesApi, anprApi } from '@/lib/api';
import { useAuth, canAccess } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import ParkingSlip from '@/components/ParkingSlip';

const ICONS: Record<string, any> = { car: Car, bike: Bike, truck: Truck };

type LookupState = 'idle' | 'searching' | 'permanent' | 'guest';

export default function CheckinPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lookupTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [types, setTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [plateNumber, setPlateNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [slipData, setSlipData] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  // Smart lookup state
  const [lookupState, setLookupState] = useState<LookupState>('idle');
  const [permanentInfo, setPermanentInfo] = useState<any>(null);

  useEffect(() => {
    if (user && !canAccess(user?.role, ['admin', 'operator'])) {
      router.replace('/');
    }
  }, [user, router]);

  useEffect(() => {
    vehicleTypesApi.list().then((data) => {
      setTypes(data);
      if (data.length > 0) setSelectedType(data[0]);
    });
  }, []);

  // Smart plate lookup with debounce
  const performLookup = useCallback(async (plate: string) => {
    if (!plate || plate.trim().length < 3) {
      setLookupState('idle');
      setPermanentInfo(null);
      return;
    }

    setLookupState('searching');
    try {
      const result = await permanentVehiclesApi.lookup(plate.trim().toUpperCase());
      if (result.is_permanent && result.permanent_vehicle) {
        setLookupState('permanent');
        setPermanentInfo(result.permanent_vehicle);

        // Auto-select matching vehicle type if found
        if (result.permanent_vehicle.vehicle_type_id) {
          const matchedType = types.find((t) => t.id === result.permanent_vehicle.vehicle_type_id);
          if (matchedType) setSelectedType(matchedType);
        }
      } else {
        setLookupState('guest');
        setPermanentInfo(null);
      }
    } catch (e) {
      console.error('Lookup failed', e);
      setLookupState('guest');
      setPermanentInfo(null);
    }
  }, [types]);

  // Trigger lookup when plate changes (debounced)
  useEffect(() => {
    if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);

    if (!plateNumber.trim() || plateNumber.trim().length < 3) {
      setLookupState('idle');
      setPermanentInfo(null);
      return;
    }

    lookupTimerRef.current = setTimeout(() => {
      performLookup(plateNumber);
    }, 500);

    return () => {
      if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    };
  }, [plateNumber, performLookup]);

  const handleScanPlate = async (file: File) => {
    setScanning(true);
    try {
      const result = await anprApi.scan(file);
      if (result.plate) {
        setPlateNumber(result.plate);
        const conf = Math.round(result.confidence * 100);
        toast.success(`Detected: ${result.plate} (${conf}% confidence)`);
      } else {
        toast.error('Could not detect plate. Try better lighting.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Scan failed');
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim() || plateNumber.trim().length < 2) {
      return toast.error('Please enter a valid plate number');
    }
    if (lookupState === 'guest' && !selectedType) {
      return toast.error('Please select a vehicle type');
    }

    setLoading(true);
    try {
      const result = await sessionsApi.checkin({
        plate_number: plateNumber.trim().toUpperCase(),
        vehicle_type_id: selectedType?.id || permanentInfo?.vehicle_type_id || 1,
        entry_method: 'manual',
        notes: notes.trim() || undefined,
      });

      if (result.is_permanent || result.session?.session_type === 'permanent') {
        toast.success(`Permanent vehicle entry logged — ${permanentInfo?.shop_number}`, {
          duration: 4000,
        });
        // Reset form for next entry
        setPlateNumber('');
        setNotes('');
        setLookupState('idle');
        setPermanentInfo(null);
      } else {
        toast.success(`Slip generated! Token: ${result.session.token}`);
        setSlipData(result.slip_data);
        setPlateNumber('');
        setNotes('');
        setLookupState('idle');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Check-in failed');
    } finally {
      setLoading(false);
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
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-300 opacity-20 blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Smart Vehicle Entry
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Vehicle <span className="gradient-text">Check-In</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Auto-detects permanent shop vehicles vs walk-in guests
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Plate Number Input - PROMINENT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-3xl p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Plate Number</h3>
              <p className="text-xs text-slate-500">Type or scan — system auto-detects</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleScanPlate(e.target.files[0])}
            />
            <motion.button
              type="button"
              whileHover={{ scale: scanning ? 1 : 1.05 }}
              whileTap={{ scale: scanning ? 1 : 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={scanning}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {scanning ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning</>
              ) : (
                <><Camera className="w-3.5 h-3.5" /> Scan</>
              )}
            </motion.button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              placeholder="ABC-123"
              className="input-glass w-full px-5 py-5 rounded-2xl text-3xl font-mono font-bold tracking-wider text-center text-slate-800 placeholder:text-slate-300"
              maxLength={20}
              autoFocus
            />
            {/* Lookup status indicator */}
            {lookupState === 'searching' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)..."
              className="input-glass w-full px-4 py-2 rounded-xl text-sm"
            />
          </div>
        </motion.div>

        {/* DETECTION RESULT - Permanent or Guest */}
        <AnimatePresence mode="wait">
          {lookupState === 'permanent' && permanentInfo && (
            <motion.div
              key="permanent"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22 }}
              className="rounded-3xl overflow-hidden shadow-xl border-2 border-emerald-300"
            >
              <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white relative">
                <motion.div
                  className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="relative flex items-start gap-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0"
                  >
                    <Store className="w-8 h-8 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                        Permanent Vehicle Recognized
                      </span>
                    </div>
                    <p className="text-2xl font-bold mb-2">
                      {permanentInfo.shop_number}
                      {permanentInfo.shop_name && (
                        <span className="opacity-90 font-normal text-lg ml-2">
                          · {permanentInfo.shop_name}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm opacity-95">
                      {permanentInfo.owner_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {permanentInfo.owner_name}
                        </span>
                      )}
                      {permanentInfo.owner_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {permanentInfo.owner_phone}
                        </span>
                      )}
                      {permanentInfo.vehicle_type_name && (
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase">
                          {permanentInfo.vehicle_type_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  No slip needed · No fee · Auto exit allowed
                </div>
              </div>
            </motion.div>
          )}

          {lookupState === 'guest' && plateNumber.trim().length >= 3 && (
            <motion.div
              key="guest"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22 }}
              className="space-y-4"
            >
              {/* Guest indicator */}
              <div className="rounded-2xl overflow-hidden border-2 border-blue-200">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <SearchIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-90">Guest Vehicle</p>
                    <p className="text-base font-bold">Not registered — slip will be generated</p>
                  </div>
                </div>
              </div>

              {/* Vehicle type cards for guest */}
              <div className="glass-strong rounded-3xl p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-slate-800 text-lg">Select Vehicle Type</h3>
                  <p className="text-xs text-slate-500">Choose category for fee calculation</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {types.map((type, idx) => {
                    const Icon = ICONS[type.icon || 'car'] || Car;
                    const isSelected = selectedType?.id === type.id;
                    const gradients = ['from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500'];
                    const gradient = gradients[idx % gradients.length];
                    return (
                      <motion.button
                        key={type.id}
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedType(type)}
                        className={`relative p-4 rounded-2xl border-2 transition-all overflow-hidden ${
                          isSelected
                            ? 'border-transparent bg-gradient-to-br ' + gradient + ' text-white shadow-lg'
                            : 'border-slate-200/60 bg-white/50 hover:bg-white text-slate-700'
                        }`}
                      >
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${isSelected ? 'bg-white/20' : 'bg-gradient-to-br ' + gradient}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="font-bold text-sm">{type.name}</p>
                        <p className={`text-lg font-bold mt-0.5 ${isSelected ? 'text-white' : 'gradient-text'}`}>Rs. {type.flat_rate}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button - Different for permanent vs guest */}
        {plateNumber.trim().length >= 3 && lookupState !== 'searching' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01, y: -2 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
            className={`w-full py-5 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 ${
              lookupState === 'permanent'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
            }`}
          >
            {loading ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</>
            ) : lookupState === 'permanent' ? (
              <><CheckCircle2 className="w-6 h-6" /> Log Permanent Entry</>
            ) : (
              <><LogIn className="w-6 h-6" /> Generate Slip & Check-In</>
            )}
          </motion.button>
        )}

        {/* Empty state hint */}
        {plateNumber.trim().length < 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-8 text-center"
          >
            <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">Enter a plate number to begin</p>
            <p className="text-xs text-slate-400 mt-1">System will auto-detect permanent vs guest</p>
          </motion.div>
        )}
      </form>

      <AnimatePresence>
        {slipData && (
          <ParkingSlip data={slipData} onClose={() => setSlipData(null)} onNewCheckin={() => setSlipData(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}



