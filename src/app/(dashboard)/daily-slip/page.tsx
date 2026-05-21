'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Printer, CheckCircle, Calendar, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { reportsApi } from '@/lib/api';
import { BRANDING } from '@/config/branding';
import TopBar from '@/components/TopBar';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatSlipDate(iso: string) {
  // "2026-05-18" → "18-05-26"
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y.slice(2)}`;
}

export default function DailySlipPage() {
  const [slipDate, setSlipDate] = useState(todayStr());
  const [slipData, setSlipData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const slipRef = useRef<HTMLDivElement>(null);

  const loadSlip = async (d: string) => {
    setLoading(true);
    try {
      const result = await reportsApi.dailySlip(d);
      setSlipData(result);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load slip data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSlip(slipDate); }, [slipDate]);

  const handleCloseDay = async () => {
    setSaving(true);
    try {
      const result = await reportsApi.closeDay(slipDate);
      toast.success(result.already_existed ? 'Daily report updated' : 'Day closed successfully');
      await loadSlip(slipDate);
    } catch (e) {
      toast.error('Failed to save daily report');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const slipEl = document.getElementById('thermal-slip');
    if (!slipEl) return;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: 58mm auto; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 10px;
      line-height: 1.5;
      color: #000;
      background: #fff;
      width: 56mm;
      padding: 2mm;
    }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 1px 0; vertical-align: top; }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 3px 0; }
    .divider-solid { border-top: 1px solid #000; margin: 3px 0; }
  </style>
</head>
<body>
  ${slipEl.innerHTML}
  <script>setTimeout(() => { window.print(); window.close(); }, 200);<\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'width=300,height=600');
    if (win) {
      win.onafterprint = () => URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          @page {
            size: 58mm auto;
            margin: 0mm;
          }
          body * { visibility: hidden !important; }
          #thermal-slip, #thermal-slip * { visibility: visible !important; }
          #thermal-slip {
            position: fixed !important;
            left: 0mm !important;
            top: 0mm !important;
            width: 56mm !important;
            margin: 0 !important;
            padding: 1mm 2mm !important;
            font-size: 10px !important;
            line-height: 1.4 !important;
          }
        }
      `}</style>

      <div className="space-y-6 no-print">
        <TopBar />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Daily Revenue Slip</h2>
                <p className="text-xs text-slate-500">Generate & save daily reports</p>
              </div>
            </div>

            {/* Date picker */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 glass px-3 py-2 rounded-xl">
                <Calendar className="w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={slipDate}
                  max={todayStr()}
                  onChange={(e) => setSlipDate(e.target.value)}
                  className="bg-transparent text-sm text-slate-700 outline-none"
                />
              </div>
              <button
                onClick={() => loadSlip(slipDate)}
                className="glass p-2 rounded-xl text-slate-600 hover:text-slate-900"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Slip preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-strong rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Slip Preview</h3>
              <button
                onClick={handlePrint}
                disabled={loading || !slipData}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md disabled:opacity-50 hover:shadow-lg transition-all"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>

            {loading ? (
              <div className="text-center py-10 text-slate-400 text-sm">Loading slip...</div>
            ) : slipData ? (
              <ThermalSlip data={slipData} slipRef={slipRef} />
            ) : null}
          </motion.div>

          {/* Actions + status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Summary stats */}
            {slipData && (
              <div className="glass-strong rounded-3xl p-5 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Summary</h3>

                <div className="space-y-2">
                  {slipData.vehicle_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">
                        Parking {item.vehicle_type}
                        <span className="ml-2 text-xs text-slate-400">×{item.quantity}</span>
                      </span>
                      <span className="text-sm font-bold text-slate-800">Rs. {item.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                  {slipData.parking_monthly?.revenue > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">
                        Parking Monthly
                        <span className="ml-2 text-xs text-slate-400">×{slipData.parking_monthly.quantity}</span>
                      </span>
                      <span className="text-sm font-bold text-slate-800">Rs. {slipData.parking_monthly.revenue.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-700">Grand Total</span>
                    <span className="font-bold text-teal-600 text-lg">Rs. {slipData.grand_total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Snapshot status */}
            {slipData && (
              <div className={`glass-strong rounded-3xl p-5 border-2 ${slipData.is_closed ? 'border-emerald-200' : 'border-amber-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className={`w-5 h-5 ${slipData.is_closed ? 'text-emerald-500' : 'text-amber-400'}`} />
                  <span className="font-bold text-slate-800">
                    {slipData.is_closed ? 'Day Closed' : 'Day Not Closed'}
                  </span>
                </div>
                {slipData.is_closed ? (
                  <p className="text-xs text-slate-500">
                    Saved at {new Date(slipData.closed_at).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Click "Close Day" to save a snapshot of today's revenue.
                  </p>
                )}
              </div>
            )}

            {/* Close Day button */}
            <button
              onClick={handleCloseDay}
              disabled={saving || loading || !slipData}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : slipData?.is_closed ? 'Update Daily Report' : 'Close Day & Save Report'}
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}


function ThermalSlip({ data, slipRef }: { data: any; slipRef: React.RefObject<HTMLDivElement | null> }) {
  const now = new Date();
  const dateTimeStr = now.toLocaleString('en-PK', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  return (
    <div
      id="thermal-slip"
      ref={slipRef}
      style={{
        width: '56mm',
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: '10px',
        lineHeight: '1.5',
        color: '#000',
        backgroundColor: '#fff',
        padding: '2mm',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{BRANDING.plaza.name}</div>
        <div style={{ fontSize: '9px' }}>{BRANDING.plaza.address}</div>
        <div style={{ fontWeight: 'bold', marginTop: '2px', fontSize: '11px' }}>Daily Revenue Slip</div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '3px 0' }} />

      {/* Date */}
      <div style={{ marginBottom: '3px' }}>
        <strong>Date:</strong> {formatSlipDate(data.date)}
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '3px 0' }} />

      {/* Column headers */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', fontWeight: 'bold' }}>
        <thead>
          <tr>
            <td style={{ width: '55%' }}>Item</td>
            <td style={{ width: '15%', textAlign: 'center' }}>Qty</td>
            <td style={{ width: '30%', textAlign: 'right' }}>Amount</td>
          </tr>
        </thead>
      </table>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '3px 0' }} />

      {/* Rows */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
        <tbody>
          {data.parking_monthly?.revenue > 0 && (
            <tr>
              <td style={{ width: '55%' }}>Parking Monthly</td>
              <td style={{ width: '15%', textAlign: 'center' }}>{data.parking_monthly.quantity}</td>
              <td style={{ width: '30%', textAlign: 'right' }}>Rs.{data.parking_monthly.revenue.toLocaleString()}</td>
            </tr>
          )}
          {data.vehicle_items?.map((item: any, idx: number) => (
            <tr key={idx}>
              <td style={{ width: '55%' }}>Parking {item.vehicle_type}</td>
              <td style={{ width: '15%', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ width: '30%', textAlign: 'right' }}>Rs.{item.revenue.toLocaleString()}</td>
            </tr>
          ))}
          {data.vehicle_items?.length === 0 && !data.parking_monthly?.revenue && (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', color: '#666', padding: '4px 0' }}>
                No transactions
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '3px 0' }} />

      {/* Total */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontWeight: 'bold', fontSize: '11px' }}>
        <tbody>
          <tr>
            <td>Total</td>
            <td style={{ textAlign: 'right' }}>Rs. {data.grand_total.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '3px 0' }} />

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '3px', fontSize: '9px' }}>
        <div>{dateTimeStr}</div>
        <div>Thank You</div>
      </div>
    </div>
  );
}
