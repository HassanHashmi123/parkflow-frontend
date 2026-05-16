'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download } from 'lucide-react';
import { BRANDING } from '@/config/branding';

interface SlipData {
  token: string;
  plate_number: string;
  vehicle_type_name: string;
  entry_time: string;
  flat_rate: number;
  fee?: number;
  rate?: number;
  fee_charged?: number;
  qr_data?: string;
  
}

interface ParkingSlipProps {
  data: SlipData;
  onClose: () => void;
  onNewCheckin?: () => void;
}

export default function ParkingSlip({ data, onClose, onNewCheckin }: ParkingSlipProps) {
  const slipRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const price = data.flat_rate || data.rate || data.fee || data.fee_charged || 0;
  

  

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getFullYear()).slice(-2)}`;
  const hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const timeStr = `${h12}:${String(now.getMinutes()).padStart(2, '0')} ${ampm}`;

  // Generate QR code
  useEffect(() => {
    if (!qrRef.current || !BRANDING.slip.showQR) return;

    const qrData = data.qr_data || JSON.stringify({
      token: data.token,
      plate: data.plate_number,
      time: data.entry_time,
      plaza: BRANDING.plaza.shortName,
    });

    // Simple QR-like pattern (for demo — use qrcode library in production)
    const canvas = qrRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 120;
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';

    // Generate deterministic pattern from token
    const seed = data.token.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const modules = 21;
    const cellSize = Math.floor(size / modules);
    const offset = Math.floor((size - cellSize * modules) / 2);

    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        // Corner finder patterns (3 corners)
        const isFinderTL = row < 7 && col < 7;
        const isFinderTR = row < 7 && col >= modules - 7;
        const isFinderBL = row >= modules - 7 && col < 7;

        if (isFinderTL || isFinderTR || isFinderBL) {
          const localR = isFinderTL ? row : isFinderTR ? row : row - (modules - 7);
          const localC = isFinderTL ? col : isFinderTR ? col - (modules - 7) : col;
          const isBorder = localR === 0 || localR === 6 || localC === 0 || localC === 6;
          const isInner = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4;
          if (isBorder || isInner) {
            ctx.fillRect(offset + col * cellSize, offset + row * cellSize, cellSize, cellSize);
          }
        } else {
          // Data area — use seeded pseudo-random
          const hash = ((seed * (row * modules + col + 1)) % 997) / 997;
          if (hash > 0.5) {
            ctx.fillRect(offset + col * cellSize, offset + row * cellSize, cellSize, cellSize);
          }
        }
      }
    }
  }, [data]);

  const handlePrint = () => {
    
    const printWindow = window.open('', '_blank', 'width=250,height=500');
    
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Parking Receipt</title>
        <style>
          @page {
            size: ${BRANDING.slip.width} auto;
            margin: 2mm;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            width: ${BRANDING.slip.width === '58mm' ? '54mm' : '76mm'};
            font-size: ${BRANDING.slip.width === '58mm' ? '11px' : '13px'};
            color: #000;
            background: #fff;
          }
          .slip { padding: 3mm 2mm; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 3mm 0; }
          .row { display: flex; justify-content: space-between; margin: 1mm 0; }
          .plaza-name { font-size: ${BRANDING.slip.width === '58mm' ? '13px' : '15px'}; font-weight: bold; line-height: 1.3; }
          .address { font-size: ${BRANDING.slip.width === '58mm' ? '9px' : '11px'}; color: #333; margin-top: 1mm; }
          .title { font-size: ${BRANDING.slip.width === '58mm' ? '12px' : '14px'}; font-weight: bold; margin: 2mm 0; letter-spacing: 1px; }
          .plate { font-size: ${BRANDING.slip.width === '58mm' ? '16px' : '18px'}; font-weight: bold; letter-spacing: 2px; margin: 2mm 0; }
          .fee { font-size: ${BRANDING.slip.width === '58mm' ? '18px' : '20px'}; font-weight: bold; margin: 2mm 0; }
          .qr { margin: 3mm auto; display: block; }
          .footer { font-size: ${BRANDING.slip.width === '58mm' ? '8px' : '10px'}; color: #555; margin-top: 3mm; line-height: 1.4; }
          .token { font-size: ${BRANDING.slip.width === '58mm' ? '9px' : '11px'}; color: #555; }
          @media print { body { width: auto; } }
        </style>
      </head>
      <body>
        <div class="slip">
          ${BRANDING.slip.showPlazaName ? `<div class="center plaza-name">${BRANDING.plaza.name}</div>` : ''}
          ${BRANDING.slip.showAddress ? `<div class="center address">${BRANDING.plaza.address}</div>` : ''}
          
          <div class="divider"></div>
          
          <div class="center title">${BRANDING.slip.title.toUpperCase()}</div>
          
          <div class="divider"></div>
          
          <div class="row"><span>Date:</span><span class="bold">${dateStr}</span></div>
          <div class="row"><span>Time:</span><span class="bold">${timeStr}</span></div>
          <div class="row"><span>Token:</span><span class="token">${data.token}</span></div>
          
          <div class="divider"></div>
          
          <div class="center">${data.vehicle_type_name}</div>
          <div class="center plate">${data.plate_number}</div>
          <div class="center fee">Rs. ${price}</div>
          
          ${BRANDING.slip.showQR ? `
            <div class="divider"></div>
            <canvas class="qr" id="printQR" width="120" height="120"></canvas>
          ` : ''}
          
          <div class="divider"></div>
          
          <div class="center footer">${BRANDING.slip.footer.replace('\n', '<br>')}</div>
        </div>

        <script>
          ${BRANDING.slip.showQR ? `
            // Copy QR to print window
            const canvas = document.getElementById('printQR');
            const ctx = canvas.getContext('2d');
            const size = 120, modules = 21, cellSize = Math.floor(size/modules);
            const offset = Math.floor((size - cellSize*modules)/2);
            const seed = "${data.token}".split('').reduce((a,c) => a + c.charCodeAt(0), 0);
            ctx.fillStyle='#fff'; ctx.fillRect(0,0,size,size); ctx.fillStyle='#000';
            for(let r=0;r<modules;r++) for(let c=0;c<modules;c++) {
              const tl=r<7&&c<7, tr=r<7&&c>=modules-7, bl=r>=modules-7&&c<7;
              if(tl||tr||bl){const lr=tl?r:tr?r:r-(modules-7),lc=tl?c:tr?c-(modules-7):c;
              if(lr===0||lr===6||lc===0||lc===6||(lr>=2&&lr<=4&&lc>=2&&lc<=4))
              ctx.fillRect(offset+c*cellSize,offset+r*cellSize,cellSize,cellSize);}
              else{if(((seed*(r*modules+c+1))%997)/997>0.5)
              ctx.fillRect(offset+c*cellSize,offset+r*cellSize,cellSize,cellSize);}
            }
          ` : ''}
          setTimeout(() => { window.print(); window.close(); }, 300);
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.7, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.7, y: 30 }}
          transition={{ type: 'spring', stiffness: 250, damping: 22 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
        >
          {/* Screen preview of slip */}
          <div ref={slipRef} className="p-6">
            {/* Plaza header */}
            {BRANDING.slip.showPlazaName && (
              <div className="text-center mb-3">
                <h2 className="text-lg font-bold text-slate-800 leading-tight">
                  {BRANDING.plaza.name}
                </h2>
                {BRANDING.slip.showAddress && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {BRANDING.plaza.address}
                  </p>
                )}
              </div>
            )}

            <div className="border-t border-dashed border-slate-300 my-3" />

            <p className="text-center text-sm font-bold text-slate-700 tracking-wider uppercase">
              {BRANDING.slip.title}
            </p>

            <div className="border-t border-dashed border-slate-300 my-3" />

            {/* Date / Time / Token */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-bold text-slate-800 font-mono">{dateStr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time</span>
                <span className="font-bold text-slate-800 font-mono">{timeStr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Token</span>
                <span className="font-mono text-xs text-slate-600">{data.token}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-300 my-3" />

            {/* Vehicle info */}
            <div className="text-center space-y-1">
              <p className="text-sm text-slate-600">{data.vehicle_type_name}</p>
              <p className="text-2xl font-bold font-mono text-slate-800 tracking-wider">
                {data.plate_number}
              </p>
              <p className="text-3xl font-bold text-emerald-600">
                Rs. {price}
              </p>
            </div>

            {/* QR Code */}
            {BRANDING.slip.showQR && (
              <>
                <div className="border-t border-dashed border-slate-300 my-3" />
                <div className="flex justify-center">
                  <canvas
                    ref={qrRef}
                    className="border border-slate-200 rounded-lg"
                    style={{ width: 100, height: 100 }}
                  />
                </div>
              </>
            )}

            <div className="border-t border-dashed border-slate-300 my-3" />

            <p className="text-center text-[10px] text-slate-400 leading-relaxed whitespace-pre-line">
              {BRANDING.slip.footer}
            </p>
          </div>

          {/* Action buttons */}
          <div className="bg-slate-50 p-4 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrint}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md text-sm"
            >
              <Printer className="w-4 h-4" />
              Print Slip
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onClose(); onNewCheckin?.(); }}
              className="flex-1 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold flex items-center justify-center gap-2 text-sm"
            >
              Next Vehicle
            </motion.button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
