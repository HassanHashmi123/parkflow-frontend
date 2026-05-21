'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  History, LogIn, LogOut, Banknote, Calendar,
  ChevronLeft, ChevronRight, Clock, TrendingUp
} from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { isVisibleForRole } from '@/config/branding';
import TopBar from '@/components/TopBar';
import StatCard from '@/components/StatCard';

type Period = 'hourly' | 'daily' | 'weekly' | 'monthly';

const PERIOD_LABELS: Record<Period, string> = {
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function HistoryPage() {
  const { user } = useAuth();
  const showRevenue = isVisibleForRole('revenue', user?.role || '');

  const [period, setPeriod] = useState<Period>('daily');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [targetDate, setTargetDate] = useState(todayStr());
  const [fromDate, setFromDate] = useState(daysAgoStr(29));
  const [toDate, setToDate] = useState(todayStr());
  const [year, setYear] = useState(new Date().getFullYear());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { period };
      if (period === 'hourly') params.target_date = targetDate;
      else if (period === 'daily') { params.from_date = fromDate; params.to_date = toDate; }
      else if (period === 'weekly') { params.from_date = fromDate; params.to_date = toDate; }
      else params.year = year;
      const result = await reportsApi.history(params);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [period, targetDate, fromDate, toDate, year]);

  useEffect(() => { load(); }, [load]);

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <TopBar />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">History</h2>
            <p className="text-xs text-slate-500">Hourly · Daily · Weekly · Monthly data</p>
          </div>
        </div>
      </motion.div>

      {/* Period tabs + date controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-strong rounded-3xl p-5"
      >
        {/* Period tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                period === p
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md'
                  : 'glass text-slate-600 hover:text-slate-900'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Date controls */}
        <div className="flex flex-wrap gap-3 items-end">
          {period === 'hourly' && (
            <div>
              <label className="block text-xs text-slate-500 font-semibold mb-1">Date</label>
              <input
                type="date"
                value={targetDate}
                max={todayStr()}
                onChange={(e) => setTargetDate(e.target.value)}
                className="glass px-3 py-2 rounded-xl text-sm text-slate-700 border-0 outline-none"
              />
            </div>
          )}
          {(period === 'daily' || period === 'weekly') && (
            <>
              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-1">From</label>
                <input
                  type="date"
                  value={fromDate}
                  max={toDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="glass px-3 py-2 rounded-xl text-sm text-slate-700 border-0 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-1">To</label>
                <input
                  type="date"
                  value={toDate}
                  max={todayStr()}
                  onChange={(e) => setToDate(e.target.value)}
                  className="glass px-3 py-2 rounded-xl text-sm text-slate-700 border-0 outline-none"
                />
              </div>
            </>
          )}
          {period === 'monthly' && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-semibold">Year</label>
              <button
                onClick={() => setYear((y) => y - 1)}
                className="glass p-2 rounded-xl text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold text-slate-800 w-16 text-center">{year}</span>
              <button
                onClick={() => setYear((y) => Math.min(y + 1, new Date().getFullYear()))}
                className="glass p-2 rounded-xl text-slate-600 hover:text-slate-900"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="btn-gradient px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-md disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </motion.div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard
            label="Total Check-Ins"
            value={summary.total_checkins}
            icon={LogIn}
            gradient="from-emerald-500 to-teal-500"
            delay={0}
          />
          <StatCard
            label="Total Check-Outs"
            value={summary.total_checkouts}
            icon={LogOut}
            gradient="from-amber-500 to-orange-500"
            delay={0.05}
          />
          {showRevenue && (
            <StatCard
              label="Total Revenue"
              value={summary.total_revenue}
              icon={Banknote}
              gradient="from-purple-500 to-pink-500"
              prefix="Rs. "
              delay={0.1}
            />
          )}
        </div>
      )}

      {/* Breakdown table */}
      {data && data.breakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-strong rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            <h3 className="font-bold text-slate-800">
              {PERIOD_LABELS[period]} Breakdown
            </h3>
            <span className="ml-auto text-xs text-slate-400">
              {data.breakdown.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/60">
                  <th className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {period === 'hourly' ? 'Hour' : period === 'daily' ? 'Date' : period === 'weekly' ? 'Week' : 'Month'}
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Check-Ins</th>
                  <th className="text-right py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Check-Outs</th>
                  {showRevenue && (
                    <th className="text-right py-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.breakdown.map((row: any, idx: number) => {
                  const hasActivity = row.checkins > 0 || row.checkouts > 0;
                  return (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.02 * idx }}
                      className={`border-b border-slate-100/60 hover:bg-white/40 transition-colors ${
                        hasActivity ? '' : 'opacity-40'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {row.label}
                        {period === 'weekly' && row.from_date && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {row.from_date} → {row.to_date}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-bold ${row.checkins > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {row.checkins}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-bold ${row.checkouts > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {row.checkouts}
                        </span>
                      </td>
                      {showRevenue && (
                        <td className="py-2.5 px-3 text-right">
                          <span className={`font-bold ${row.revenue > 0 ? 'text-purple-600' : 'text-slate-400'}`}>
                            {row.revenue > 0 ? `Rs. ${row.revenue.toLocaleString()}` : '—'}
                          </span>
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </tbody>
              {summary && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-700 text-xs uppercase tracking-wider">Total</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{summary.total_checkins}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-700">{summary.total_checkouts}</td>
                    {showRevenue && (
                      <td className="py-2.5 px-3 text-right font-bold text-purple-700">
                        Rs. {summary.total_revenue.toLocaleString()}
                      </td>
                    )}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {data.breakdown.length === 0 && (
            <div className="text-center py-10">
              <Clock className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No data for selected period</p>
            </div>
          )}
        </motion.div>
      )}

      {loading && (
        <div className="text-center py-10 text-slate-400 text-sm">Loading history...</div>
      )}
    </div>
  );
}
