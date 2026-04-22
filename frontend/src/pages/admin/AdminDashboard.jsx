import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import {
  Users,
  Building2,
  Activity,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  BarChart3,
  PieChart as PieIcon,
  Shield,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = {
  present: '#22c55e',
  absent: '#ef4444',
  completed: '#6366f1',
  notMarked: '#f59e0b',
};

const toIsoDate = (d) => new Date(d).toISOString().split('T')[0];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [totals, setTotals] = useState({ interns: 0, domains: 0 });
  const [today, setToday] = useState({ present: 0, absent: 0, rate: 0 });

  const [dateRange, setDateRange] = useState({
    startDate: toIsoDate(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: toIsoDate(Date.now()),
  });

  const [trend, setTrend] = useState([]);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [empRes, deptRes, dashRes] = await Promise.all([
        api.get('/admin/employees'),
        api.get('/admin/all-departments'),
        api.get(
          `/attendance/dashboard?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&limit=8`
        ),
      ]);

      const interns = Array.isArray(empRes.data) ? empRes.data.length : 0;
      const domains = Array.isArray(deptRes.data) ? deptRes.data.length : 0;
      setTotals({ interns, domains });

      const stats = dashRes.data?.stats || {};
      const totalEmployees = stats.totalEmployees || 0;
      const presentToday = stats.todayAttendance || 0;
      const absentToday = stats.absent ?? Math.max(0, totalEmployees - presentToday);
      const rate =
        totalEmployees > 0 ? ((presentToday / totalEmployees) * 100).toFixed(1) : '0.0';
      setToday({ present: presentToday, absent: absentToday, rate });

      const chartData = dashRes.data?.analytics?.chartData || [];
      const mapped = chartData.map((x) => ({
        day: new Date(x.date).toLocaleDateString('en-US', { weekday: 'short' }),
        completed: x.completed || 0,
        notMarked: x.notMarked || 0,
      }));
      setTrend(mapped);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.startDate, dateRange.endDate]);

  const todayShare = useMemo(() => {
    const total = today.present + today.absent;
    if (!total) return [];
    return [
      { name: 'Present', value: today.present, color: '#22c55e' },
      { name: 'Absent', value: today.absent, color: '#ef4444' },
    ];
  }, [today.present, today.absent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto pt-2 px-4 md:px-6 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 shadow-lg">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative px-6 py-6 md:px-8 md:py-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-indigo-200 text-[11px] font-black uppercase tracking-[0.25em]">
                Admin console
              </p>
              <h1 className="mt-2 text-2xl md:text-3xl font-black text-white tracking-tight">
                Organization overview
              </h1>
              <p className="mt-1 text-sm font-semibold text-indigo-100/85">
                Live workforce and attendance signals across all departments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/15">
                <span className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">
                  Range
                </span>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((p) => ({ ...p, startDate: e.target.value }))
                  }
                  className="bg-transparent text-indigo-50 text-xs font-bold outline-none"
                />
                <span className="text-indigo-200 text-xs font-bold">→</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((p) => ({ ...p, endDate: e.target.value }))
                  }
                  className="bg-transparent text-indigo-50 text-xs font-bold outline-none"
                />
              </div>
              <button
                type="button"
                onClick={refresh}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-black border border-white/15 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 text-sm font-semibold flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total interns"
            value={totals.interns}
            helper="Employees in directory"
            icon={Users}
            tone="indigo"
          />
          <StatCard
            label="Active domains"
            value={totals.domains}
            helper="Departments / domains"
            icon={Building2}
            tone="blue"
          />
          <StatCard
            label="Present today"
            value={today.present}
            helper="Present + Completed"
            icon={Activity}
            tone="emerald"
          />
          <StatCard
            label="Attendance rate"
            value={`${today.rate}%`}
            helper="Today"
            icon={TrendingUp}
            tone="amber"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Attendance trend
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    Completed vs not marked
                  </p>
                </div>
              </div>
              <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600">
                <Shield className="w-4 h-4" />
              </div>
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2ff" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 20px -12px rgba(15,23,42,0.25)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke={COLORS.completed}
                    fill="rgba(99,102,241,0.12)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="notMarked"
                    stroke={COLORS.notMarked}
                    fill="rgba(245,158,11,0.10)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Today split
                </p>
                <p className="text-sm font-bold text-slate-800">Present vs absent</p>
              </div>
            </div>

            <div className="flex-1 h-[260px] w-full">
              {todayShare.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={todayShare}
                      innerRadius={70}
                      outerRadius={92}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {todayShare.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: '11px',
                        fontWeight: 800,
                        paddingTop: '14px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-500">
                  {loading ? 'Loading…' : 'No data for today yet.'}
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Quick note
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                Attendance scope is organization-wide (Admin).
              </p>
            </div>
          </div>
        </div>

        {/* Loading hint */}
        {loading ? (
          <div className="text-center text-xs font-semibold text-slate-500">
            Loading insights…
          </div>
        ) : null}
      </div>
    </div>
  );
};

function StatCard({ label, value, helper, icon: Icon, tone }) {
  const toneMap = {
    indigo: 'bg-indigo-50 text-indigo-700',
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  };
  const chip = toneMap[tone] || toneMap.indigo;

  return (
    <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200/70 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <div className={`p-2 rounded-2xl ${chip}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-black text-slate-900 tabular-nums">{value}</p>
      <p className="text-xs text-slate-500 font-semibold mt-1">{helper}</p>
    </div>
  );
}

export default AdminDashboard;