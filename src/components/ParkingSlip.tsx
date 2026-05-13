'use client';

import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, Calendar, Clock, Car, User, Hash, X, Printer } from 'lucide-react';

interface SlipProps {
  data: {
    token: string;
    plate_number: string;
    vehicle_type: string;
    rate: number;
    entry_time: string;
    qr_payload: string;
    operator?: string;
  };
  onClose: () => void;
  onNewCheckin: () => void;
}

export default function ParkingSlip({ data, onClose, onNewCheckin }: SlipProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, y: 100, rotate: -10 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.5, y: 100, rotate: 10 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md"
      >
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-rose-500"
        >
          <X className="w-5 h-5" />
        </motion.button>

        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
            <motion.div
              className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 blur-2xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative flex items-center gap-3 mb-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <div>
                <p className="text-xs font-semibold opacity-90 uppercase tracking-wider">ParkFlow</p>
                <p className="text-lg font-bold">Parking Slip</p>
              </div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold font-mono tracking-wider"
            >
              {data.token}
            </motion.p>
          </div>

          <div className="p-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center pb-4 border-b-2 border-dashed border-slate-200"
            >
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Plate Number</p>
              <p className="text-3xl font-bold font-mono text-slate-800">{data.plate_number}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-3"
            >
              <Detail icon={Car} label="Type" value={data.vehicle_type} />
              <Detail icon={Hash} label="Rate" value={`Rs. ${data.rate}`} />
              <Detail icon={Calendar} label="Date" value={new Date(data.entry_time).toLocaleDateString('en-PK')} />
              <Detail icon={Clock} label="Time" value={new Date(data.entry_time).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })} />
            </motion.div>

            {data.operator && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 text-xs text-slate-500 pt-2"
              >
                <User className="w-3.5 h-3.5" />
                <span>Issued by {data.operator}</span>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
              className="flex justify-center pt-4 border-t-2 border-dashed border-slate-200"
            >
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <QRCodeSVG value={data.qr_payload} size={120} level="M" />
              </div>
            </motion.div>

            <p className="text-center text-xs text-slate-400 pt-2">
              Scan QR or show this slip at exit
            </p>
          </div>

          <div className="p-4 bg-slate-50 grid grid-cols-2 gap-2 print:hidden">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              Print
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNewCheckin}
              className="btn-gradient py-3 rounded-xl text-white font-semibold text-sm"
            >
              New Check-In
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Detail({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}