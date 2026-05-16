'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, Clock, Banknote, Sparkles, Download, Loader2 } from 'lucide-react';
import CountUp from 'react-countup';
import { toast } from 'sonner';
import { reportsApi , sessionsApi} from '@/lib/api';
import { useAuth } from '@/lib/auth';
import TopBar from '@/components/TopBar';
import { StatCardSkeleton } from '@/components/Skeletons';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

export default function ReportsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'hourly' | 'daily' | 'monthly' | 'vehicle'>('daily');
  const [hourly, setHourly] = useState<any>(null);
  const [daily, setDaily] = useState<any>(null);
  const [monthly, setMonthly] = useState<any>(null);
  const [byType, setByType] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      reportsApi.summary(),
      reportsApi.hourly(),
      reportsApi.daily(),
      reportsApi.monthly(),
      reportsApi.byVehicleType(),
    ]).then(([s, h, d, m, v]) => {
      setSummary(s);
      setHourly(h);
      setDaily(d);
      setMonthly(m);
      setByType(v);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleDownloadPDF = async () => {
    setGeneratingPdf(true);
    try {
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

     
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // ===== HEADER =====
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 60, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('ParkFlow', 40, 35);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Parking Management System', 40, 50);

      // Date in header (top right)
      const generatedDate = new Date().toLocaleString('en-PK', {
        dateStyle: 'medium', timeStyle: 'short',
      });
      doc.setFontSize(9);
      doc.text(`Generated: ${generatedDate}`, pageWidth - 40, 35, { align: 'right' });
      doc.text(`By: ${user?.full_name || 'User'} (${user?.role})`, pageWidth - 40, 50, { align: 'right' });

      // ===== TITLE =====
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const titleMap = {
        daily: 'Daily Report',
        hourly: 'Hourly Activity Report',
        monthly: 'Monthly Trend Report',
        vehicle: 'Vehicle Type Revenue Report',
      };
      doc.text(titleMap[tab], 40, 90);

      // Date range / period
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      let periodText = '';
      if (tab === 'daily' && daily) periodText = `Period: ${daily.from_date} to ${daily.to_date}`;
      else if (tab === 'hourly' && hourly) periodText = `Date: ${hourly.date}`;
      else if (tab === 'monthly' && monthly) periodText = `Year: ${monthly.year}`;
      else if (tab === 'vehicle' && byType) periodText = `Period: ${byType.from_date} to ${byType.to_date}`;
      doc.text(periodText, 40, 108);

      // ===== SUMMARY CARDS =====
      let yPos = 130;
      if (summary) {
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Quick Stats', 40, yPos);
        yPos += 15;

        const stats = [
          { label: 'Active Vehicles', value: String(summary.active_vehicles), color: [59, 130, 246] },
          { label: "Today's Check-Ins", value: String(summary.today_checkins), color: [16, 185, 129] },
          { label: "Today's Check-Outs", value: String(summary.today_checkouts), color: [245, 158, 11] },
          { label: "Today's Revenue", value: `Rs. ${summary.today_revenue}`, color: [139, 92, 246] },
        ];

        const cardWidth = (pageWidth - 80 - 30) / 4;
        stats.forEach((s, i) => {
          const x = 40 + i * (cardWidth + 10);
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(x, yPos, cardWidth, 50, 6, 6, 'F');
          doc.setFillColor(s.color[0], s.color[1], s.color[2]);
          doc.roundedRect(x, yPos, 4, 50, 2, 2, 'F');
          doc.setTextColor(100, 116, 139);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(s.label.toUpperCase(), x + 12, yPos + 16);
          doc.setTextColor(15, 23, 42);
          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          doc.text(s.value, x + 12, yPos + 36);
        });
        yPos += 70;
      }

      // ===== CHART (screenshot) =====
      if (chartRef.current) {
        try {
          const canvas = await html2canvas(chartRef.current, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
          });
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 80;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Add new page if needed
          if (yPos + imgHeight > pageHeight - 60) {
            doc.addPage();
            yPos = 40;
          }

          doc.setTextColor(15, 23, 42);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Visual Chart', 40, yPos);
          yPos += 15;

          doc.addImage(imgData, 'PNG', 40, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 25;
        } catch (e) {
          console.error('Chart screenshot failed', e);
        }
      }

      // ===== DATA TABLE =====
      // Add new page if low space
      if (yPos > pageHeight - 200) {
        doc.addPage();
        yPos = 40;
      }

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Data', 40, yPos);
      yPos += 10;

      let tableData: any[] = [];
      let tableHeaders: string[] = [];

      if (tab === 'daily' && daily) {
        tableHeaders = ['Date', 'Check-Ins', 'Check-Outs', 'Revenue'];
        tableData = daily.daily_breakdown.map((r: any) => [
          r.date, r.checkins, r.checkouts, `Rs. ${r.revenue}`,
        ]);
      } else if (tab === 'hourly' && hourly) {
        tableHeaders = ['Hour', 'Check-Ins', 'Check-Outs', 'Revenue'];
        tableData = hourly.hourly_breakdown.map((r: any) => [
          `${r.hour}:00`, r.checkins, r.checkouts, `Rs. ${r.revenue}`,
        ]);
      } else if (tab === 'monthly' && monthly) {
        tableHeaders = ['Month', 'Visits', 'Revenue'];
        tableData = monthly.monthly_breakdown.map((r: any) => [
          r.month, r.visits, `Rs. ${r.revenue}`,
        ]);
      } else if (tab === 'vehicle' && byType) {
        tableHeaders = ['Vehicle Type', 'Visits', 'Revenue'];
        tableData = byType.breakdown.map((r: any) => [
          r.vehicle_type, r.visits, `Rs. ${r.revenue}`,
        ]);
      }

      autoTable(doc, {
        startY: yPos + 5,
        head: [tableHeaders],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
        },
        bodyStyles: { fontSize: 9, textColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 40, right: 40 },
      });

 // ===== DETAILED SESSIONS TABLE (with plates) =====
      if (tab === 'daily') {
        try {
          const todaySessions = await sessionsApi.today();
          if (todaySessions && todaySessions.length > 0) {
            // Check if we need a new page
            const currentY = (doc as any).lastAutoTable?.finalY || yPos + 80;
            if (currentY > pageHeight - 200) {
              doc.addPage();
              yPos = 40;
            } else {
              yPos = currentY + 20;
            }

            doc.setTextColor(15, 23, 42);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text("Today's Session Details", 40, yPos);
            yPos += 10;

            const sessionHeaders = ['Plate', 'Type', 'Owner/Shop', 'In', 'Out', 'Fee'];
            const sessionData = todaySessions.map((s: any) => [
              s.plate_number || '—',
              s.vehicle_type_name || '—',
              s.session_type === 'permanent' 
                ? (s.shop_info?.owner_name || s.shop_info?.shop_number || 'Permanent')
                : 'Guest',
              s.entry_time ? new Date(s.entry_time).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : '—',
              s.exit_time ? new Date(s.exit_time).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : 'Active',
              s.fee_charged ? `Rs. ${s.fee_charged}` : (s.session_type === 'permanent' ? 'Free' : '—'),
            ]);

            autoTable(doc, {
              startY: yPos + 5,
              head: [sessionHeaders],
              body: sessionData,
              theme: 'grid',
              headStyles: {
                fillColor: [30, 58, 95],
                textColor: [212, 160, 23],
                fontStyle: 'bold',
                fontSize: 9,
              },
              bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
              alternateRowStyles: { fillColor: [248, 250, 252] },
              margin: { left: 40, right: 40 },
              columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 70 },
                5: { fontStyle: 'bold', halign: 'right' },
              },
            });
          }
        } catch (e) {
          console.error('Failed to load session details for PDF', e);
        }
      }




      // ===== FOOTER on each page =====
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `ParkFlow Reports | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 20,
          { align: 'center' }
        );
      }

      // ===== SAVE =====
      const filename = `parkflow-${tab}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast.success('PDF downloaded successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const tabs = [
    { id: 'daily' as const, label: 'Daily', icon: Calendar },
    { id: 'hourly' as const, label: 'Hourly', icon: Clock },
    { id: 'monthly' as const, label: 'Monthly', icon: TrendingUp },
    { id: 'vehicle' as const, label: 'By Type', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <TopBar />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden"
      >
        <motion.div
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-violet-300 to-pink-300 opacity-20 blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
                Analytics & Insights
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Business <span className="gradient-text">Reports</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">Real-time analytics for parking operations</p>
          </div>

          {/* DOWNLOAD PDF BUTTON */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadPDF}
            disabled={loading || generatingPdf}
            className="btn-gradient px-5 py-3 rounded-2xl text-white font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {generatingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading || !summary ? (
          <>
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </>
        ) : (
          <>
            <MiniStat label="Active" value={summary.active_vehicles} color="from-blue-500 to-cyan-500" icon={Calendar} delay={0.1} />
            <MiniStat label="Today In" value={summary.today_checkins} color="from-emerald-500 to-teal-500" icon={Calendar} delay={0.15} />
            <MiniStat label="Today Out" value={summary.today_checkouts} color="from-amber-500 to-orange-500" icon={Calendar} delay={0.2} />
            <MiniStat label="Revenue" value={summary.today_revenue} color="from-purple-500 to-pink-500" icon={Banknote} prefix="Rs. " delay={0.25} />
          </>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                isActive ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'glass text-slate-600 hover:bg-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        ref={chartRef}
        key={tab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-6 bg-white"
      >
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="skeleton h-full w-full rounded-2xl" />
          </div>
        ) : tab === 'daily' ? (
          <DailyChart data={daily} />
        ) : tab === 'hourly' ? (
          <HourlyChart data={hourly} />
        ) : tab === 'monthly' ? (
          <MonthlyChart data={monthly} />
        ) : (
          <VehicleTypeChart data={byType} />
        )}
      </motion.div>
    </div>
  );
}

function MiniStat({ label, value, color, icon: Icon, prefix = '', delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="glass-strong rounded-2xl p-4 relative overflow-hidden"
    >
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-20 blur-xl`} />
      <div className="relative">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-md`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">
          {prefix}<CountUp end={value} duration={1.2} separator="," />
        </p>
      </div>
    </motion.div>
  );
}

function DailyChart({ data }: any) {
  if (!data) return null;
  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">Last 7 Days</h3>
        <p className="text-xs text-slate-500">{data.from_date} to {data.to_date}</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data.daily_breakdown}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: 12 }} />
          <Legend />
          <Area type="monotone" dataKey="checkins" stroke="#10b981" fillOpacity={1} fill="url(#colorCheckins)" strokeWidth={2} />
          <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}

function HourlyChart({ data }: any) {
  if (!data) return null;
  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">Hourly Activity</h3>
        <p className="text-xs text-slate-500">{data.date} · 24-hour breakdown</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data.hourly_breakdown}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: 12 }} />
          <Legend />
          <Bar dataKey="checkins" fill="#3b82f6" radius={[8, 8, 0, 0]} animationDuration={800} />
          <Bar dataKey="checkouts" fill="#8b5cf6" radius={[8, 8, 0, 0]} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

function MonthlyChart({ data }: any) {
  if (!data) return null;
  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">{data.year} Monthly Trend</h3>
        <p className="text-xs text-slate-500">Visits and revenue per month</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data.monthly_breakdown}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: 12 }} />
          <Legend />
          <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} animationDuration={1200} />
          <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={3} dot={{ r: 5 }} animationDuration={1200} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}

function VehicleTypeChart({ data }: any) {
  if (!data || !data.breakdown || data.breakdown.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-400">
        <p>No data available yet</p>
      </div>
    );
  }
  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">Revenue by Vehicle Type</h3>
        <p className="text-xs text-slate-500">{data.from_date} to {data.to_date}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data.breakdown} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="revenue" nameKey="vehicle_type" animationDuration={1200}>
              {data.breakdown.map((_: any, idx: number) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2">
          {data.breakdown.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl glass">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                <span className="font-semibold text-slate-700">{item.vehicle_type}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">Rs. {item.revenue}</p>
                <p className="text-xs text-slate-500">{item.visits} visits</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}