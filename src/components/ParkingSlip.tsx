'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer } from 'lucide-react';
import { BRANDING } from '@/config/branding';

interface SlipData {
  token: string;
  plate_number: string;
  vehicle_type_name?: string;
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

const BARCODE_OPTIONS = {
  format: 'CODE128',
  width: 2.8,
  height: 92,
  displayValue: true,
  fontSize: 13,
  textMargin: 5,
  margin: 20,
  background: '#ffffff',
  lineColor: '#000000',
};

export default function ParkingSlip({ data, onClose, onNewCheckin }: ParkingSlipProps) {
  const slipRef = useRef<HTMLDivElement>(null);
  const barcodeSvgRef = useRef<SVGSVGElement>(null);
  const [JsBarcode, setJsBarcode] = useState<any>(null);

  const price = data.flat_rate || data.rate || data.fee || data.fee_charged || 0;
  const vehicleType = data.vehicle_type_name || '';
  // Encode the full token so hardware scanners do not depend on date/suffix inference.
  const barcodeValue = data.token;

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getFullYear()).slice(-2)}`;
  const hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const timeStr = `${h12}:${String(now.getMinutes()).padStart(2, '0')} ${ampm}`;

  // Load JsBarcode once and keep reference
  useEffect(() => {
    import('jsbarcode').then(({ default: Jbc }) => {
      setJsBarcode(() => Jbc);
    });
  }, []);

  // Render barcode to screen preview SVG whenever JsBarcode or token changes
  useEffect(() => {
    if (JsBarcode && barcodeSvgRef.current) {
      JsBarcode(barcodeSvgRef.current, barcodeValue, BARCODE_OPTIONS);
    }
  }, [JsBarcode, barcodeValue]);

  const handlePrint = () => {
    // Render a fresh SVG element just for printing — guaranteed to be ready
    let barcodeSvgHtml = '';
    if (JsBarcode) {
      const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(tempSvg, barcodeValue, BARCODE_OPTIONS);
      tempSvg.setAttribute('width', '72mm');
      tempSvg.setAttribute('height', '31mm');
      tempSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      tempSvg.setAttribute('shape-rendering', 'crispEdges');
      barcodeSvgHtml = tempSvg.outerHTML;
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Parking Receipt</title>
  <style>
    @page { margin: 0mm 3mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; background: #fff; }
    .slip { padding: 3mm 2mm; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .divider { border: none; border-top: 1px dashed #000; margin: 3mm 0; }
    .row { display: flex; justify-content: space-between; margin: 1mm 0; }
    .plaza-name { font-size: 15px; font-weight: 900; line-height: 1.3; }
    .address { font-size: 10px; font-weight: bold; margin-top: 1mm; }
    .phone { font-size: 11px; font-weight: bold; margin-top: 1mm; }
    .title { font-size: 13px; font-weight: bold; margin: 2mm 0; letter-spacing: 1px; }
    .vtype { font-size: 11px; margin-bottom: 1mm; }
    .plate { font-size: 18px; font-weight: bold; letter-spacing: 2px; margin: 1mm 0; }
    .fee { font-size: 20px; font-weight: bold; margin: 1mm 0; }
    .barcode-wrap { margin: 3mm 0; width: 100%; text-align: center; overflow: visible; }
    .barcode-wrap svg { display: block; width: 72mm !important; height: 31mm !important; max-width: 100%; margin: 0 auto; shape-rendering: crispEdges; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .barcode-wrap svg rect { fill-opacity: 1 !important; }
    .footer { font-size: 9px; margin-top: 3mm; line-height: 1.5; }
    .token-text { font-size: 10px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="slip">
    <div class="center plaza-name">${BRANDING.plaza.name}</div>
    <div class="center address">${BRANDING.plaza.address}</div>
    ${BRANDING.plaza.phone ? `<div class="center phone">${BRANDING.plaza.phone}</div>` : ''}
    <hr class="divider">
    <div class="center title">${BRANDING.slip.title.toUpperCase()}</div>
    <hr class="divider">
    <div class="row"><span>Date:</span><span class="bold">${dateStr}</span></div>
    <div class="row"><span>Time:</span><span class="bold">${timeStr}</span></div>
    <div class="row"><span>Token:</span><span class="token-text">${data.token}</span></div>
    <hr class="divider">
    ${vehicleType ? `<div class="center vtype">${vehicleType}</div>` : ''}
    <div class="center plate">${data.plate_number}</div>
    <div class="center fee">Rs. ${price}</div>
    ${barcodeSvgHtml ? `<hr class="divider">
    <div class="barcode-wrap">${barcodeSvgHtml}</div>` : ''}
    <hr class="divider">
    <div class="center footer">${BRANDING.slip.footer.replace(/\n/g, '<br>')}</div>
  </div>
  <script>setTimeout(function(){ window.print(); window.close(); }, 400);<\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'width=350,height=700');
    if (win) {
      win.onafterprint = () => URL.revokeObjectURL(url);
    }
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
          <div ref={slipRef} className="p-6">
            {BRANDING.slip.showPlazaName && (
              <div className="text-center mb-2">
                <h2 className="text-xl font-black text-slate-900 leading-tight">{BRANDING.plaza.name}</h2>
                {BRANDING.slip.showAddress && (
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{BRANDING.plaza.address}</p>
                )}
                {BRANDING.plaza.phone && (
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{BRANDING.plaza.phone}</p>
                )}
              </div>
            )}

            <div className="border-t border-dashed border-slate-300 my-3" />
            <p className="text-center text-sm font-bold text-slate-700 tracking-wider uppercase">{BRANDING.slip.title}</p>
            <div className="border-t border-dashed border-slate-300 my-3" />

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
                <span className="font-mono text-xs font-bold text-slate-800">{data.token}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-300 my-3" />

            <div className="text-center space-y-1">
              {vehicleType && <p className="text-sm text-slate-500">{vehicleType}</p>}
              <p className="text-2xl font-bold font-mono text-slate-800 tracking-wider">{data.plate_number}</p>
              <p className="text-3xl font-bold text-emerald-600">Rs. {price}</p>
            </div>

            {/* Barcode preview */}
            {BRANDING.slip.showQR && (
              <>
                <div className="border-t border-dashed border-slate-300 my-3" />
                <div className="w-full overflow-hidden">
                  <svg ref={barcodeSvgRef} className="mx-auto max-w-full" style={{ width: '72mm', height: '31mm', shapeRendering: 'crispEdges' }} />
                </div>
              </>
            )}

            <div className="border-t border-dashed border-slate-300 my-3" />
            <p className="text-center text-[10px] text-slate-700 leading-relaxed whitespace-pre-line">{BRANDING.slip.footer}</p>
          </div>

          <div className="bg-slate-50 p-4 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrint}
              disabled={!JsBarcode}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md text-sm disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              {JsBarcode ? 'Print Slip' : 'Loading...'}
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
