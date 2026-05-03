// import React, { useContext, useState, useEffect } from 'react';
// import { AuthContext } from '../../context/AuthContext';
// import api from '../../services/api';
// import { 
//   Users,
//   Activity,
//   Calendar,
//   RefreshCw,
//   AlertCircle,
//   TrendingUp,
//   CheckCircle2,
//   XCircle,
//   ClipboardCheck
// } from 'lucide-react';
// import { 
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
//   AreaChart, Area 
// } from 'recharts';

// const COLORS = {
//   present: '#22c55e',
//   absent: '#ef4444'
// };

// const ManagerDashboard = () => {
//     const { user } = useContext(AuthContext);

//     // ✅ Safe default state
//     const [stats, setStats] = useState({
//         totalEmployees: 0,
//         todayAttendance: 0,
//         absent: 0
//     });

//     const [analytics, setAnalytics] = useState(null);
//     const [recentActivity, setRecentActivity] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     const [dateRange, setDateRange] = useState({
//         startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//         endDate: new Date().toISOString().split('T')[0]
//     });

//     useEffect(() => {
//         const fetchDashboardData = async () => {
//             setLoading(true);
//             setError(null);

//             try {
//                 const token = localStorage.getItem("token");

//                 const response = await api.get(
//                     `/attendance/dashboard?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&limit=4`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 );

//                 // ✅ SAFE DATA HANDLING
//                 const dashboardStats = response.data?.stats || {
//                     totalEmployees: 0,
//                     todayAttendance: 0,
//                     absent: 0
//                 };

//                 const dashboardAnalytics = response.data?.analytics || null;
//                 const activity = response.data?.recentActivity || [];

//                 setStats(dashboardStats);
//                 setAnalytics(dashboardAnalytics);
//                 setRecentActivity(activity);

//             } catch (err) {
//                 console.error('Dashboard Error:', err);

//                 if (err.response?.status === 403) {
//                     setError("Access denied (403). Please login again.");
//                     setTimeout(() => {
//                         window.location.href = "/manager-login";
//                     }, 1500);
//                 } else {
//                     setError(err.response?.data?.message || "Failed to load dashboard.");
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchDashboardData();
//     }, [dateRange]);

//     // ✅ SAFE CALCULATION
//     const attendanceRate =
//         stats?.totalEmployees > 0
//             ? ((stats?.todayAttendance / stats?.totalEmployees) * 100).toFixed(1)
//             : 0;

//     const weeklyTrend =
//         analytics?.chartData?.map(item => ({
//             day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
//             present: item.completed,
//             absent: item.notMarked
//         })) || [];

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header */}
//                 <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 shadow-lg">
//                     <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
//                     <div className="absolute bottom-0 left-0 w-28 h-28 bg-purple-400/20 rounded-full translate-y-12 -translate-x-12 blur-2xl" />
//                     <div className="relative px-6 py-6 md:px-8 md:py-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
//                         <div>
//                             <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Dashboard</p>
//                             <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
//                                 {user?.role === 'TeamHead' ? 'Team head overview' : 'Manager overview'}
//                             </h1>
//                             <p className="text-indigo-100/90 text-sm font-medium mt-1">
//                                 Attendance health across your scope
//                             </p>
//                         </div>

//                         <div className="flex flex-wrap items-center gap-2">
//                             <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20">
//                                 <Calendar className="w-4 h-4 text-indigo-200" />
//                                 <input
//                                     type="date"
//                                     value={dateRange.startDate}
//                                     onChange={(e) => setDateRange((p) => ({ ...p, startDate: e.target.value }))}
//                                     className="bg-transparent text-white text-xs font-bold outline-none"
//                                 />
//                                 <span className="text-indigo-200 text-xs font-bold">→</span>
//                                 <input
//                                     type="date"
//                                     value={dateRange.endDate}
//                                     onChange={(e) => setDateRange((p) => ({ ...p, endDate: e.target.value }))}
//                                     className="bg-transparent text-white text-xs font-bold outline-none"
//                                 />
//                             </div>
//                             <button
//                                 type="button"
//                                 onClick={() => setDateRange((p) => ({ ...p }))}
//                                 className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 transition"
//                                 title="Refresh"
//                             >
//                                 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//                                 Refresh
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Error */}
//                 {error && (
//                     <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 text-sm font-semibold flex items-start gap-2">
//                         <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
//                         <div>
//                             <p>{error}</p>
//                             <button
//                                 onClick={() => window.location.reload()}
//                                 className="mt-2 text-xs font-bold text-rose-700 underline underline-offset-2"
//                             >
//                                 Retry
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {/* Stat cards */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                     <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200/70 shadow-sm p-5">
//                         <div className="flex items-center justify-between">
//                             <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Total interns</p>
//                             <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-600">
//                                 <Users className="w-5 h-5" />
//                             </div>
//                         </div>
//                         <p className="mt-3 text-3xl font-black text-slate-900 tabular-nums">{stats.totalEmployees}</p>
//                         <p className="text-xs text-slate-500 font-semibold mt-1">In your scope</p>
//                     </div>
//                     <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200/70 shadow-sm p-5">
//                         <div className="flex items-center justify-between">
//                             <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Present today</p>
//                             <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-600">
//                                 <CheckCircle2 className="w-5 h-5" />
//                             </div>
//                         </div>
//                         <p className="mt-3 text-3xl font-black text-slate-900 tabular-nums">{stats.todayAttendance}</p>
//                         <p className="text-xs text-slate-500 font-semibold mt-1">Present + Completed</p>
//                     </div>
//                     <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200/70 shadow-sm p-5">
//                         <div className="flex items-center justify-between">
//                             <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Absent today</p>
//                             <div className="p-2 rounded-2xl bg-rose-50 text-rose-600">
//                                 <XCircle className="w-5 h-5" />
//                             </div>
//                         </div>
//                         <p className="mt-3 text-3xl font-black text-slate-900 tabular-nums">{stats.absent}</p>
//                         <p className="text-xs text-slate-500 font-semibold mt-1">Not present</p>
//                     </div>
//                     <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200/70 shadow-sm p-5">
//                         <div className="flex items-center justify-between">
//                             <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Attendance rate</p>
//                             <div className="p-2 rounded-2xl bg-amber-50 text-amber-700">
//                                 <TrendingUp className="w-5 h-5" />
//                             </div>
//                         </div>
//                         <p className="mt-3 text-3xl font-black text-slate-900 tabular-nums">{attendanceRate}%</p>
//                         <p className="text-xs text-slate-500 font-semibold mt-1">Today</p>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                     {/* Trend chart */}
//                     <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
//                         <div className="flex items-center justify-between mb-4">
//                             <div className="flex items-center gap-2">
//                                 <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
//                                     <Activity className="w-5 h-5" />
//                                 </div>
//                                 <div>
//                                     <p className="text-xs font-black uppercase tracking-widest text-slate-500">Trend</p>
//                                     <p className="text-sm font-bold text-slate-800">Completed vs not marked</p>
//                                 </div>
//                             </div>
//                             <div className="text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
//                                 {dateRange.startDate} → {dateRange.endDate}
//                             </div>
//                         </div>
//                         <div className="h-[300px]">
//                             <ResponsiveContainer width="100%" height="100%">
//                                 <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
//                                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2ff" />
//                                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
//                                     <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
//                                     <Tooltip
//                                         contentStyle={{
//                                             borderRadius: '12px',
//                                             border: '1px solid #e2e8f0',
//                                             boxShadow: '0 10px 20px -12px rgba(15,23,42,0.25)',
//                                         }}
//                                     />
//                                     <Area type="monotone" dataKey="present" stroke={COLORS.present} fill="rgba(34,197,94,0.12)" strokeWidth={2} />
//                                     <Area type="monotone" dataKey="absent" stroke={COLORS.absent} fill="rgba(239,68,68,0.10)" strokeWidth={2} />
//                                 </AreaChart>
//                             </ResponsiveContainer>
//                         </div>
//                     </div>

//                     {/* Recent activity */}
//                     <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
//                         <div className="flex items-center gap-2 mb-4">
//                             <div className="p-2 rounded-xl bg-slate-50 text-slate-700">
//                                 <ClipboardCheck className="w-5 h-5" />
//                             </div>
//                             <div>
//                                 <p className="text-xs font-black uppercase tracking-widest text-slate-500">Recent</p>
//                                 <p className="text-sm font-bold text-slate-800">Latest updates</p>
//                             </div>
//                         </div>

//                         {loading ? (
//                             <p className="text-sm text-slate-500">Loading activity…</p>
//                         ) : recentActivity.length > 0 ? (
//                             <div className="space-y-2">
//                                 {recentActivity.map((item, i) => (
//                                     <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2">
//                                         <p className="text-sm font-semibold text-slate-800 truncate pr-2">{item.employeeName}</p>
//                                         <span
//                                             className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${
//                                                 item.status === 'Completed'
//                                                     ? 'bg-indigo-100 text-indigo-700'
//                                                     : item.status === 'Present'
//                                                       ? 'bg-emerald-100 text-emerald-700'
//                                                       : 'bg-rose-100 text-rose-700'
//                                             }`}
//                                         >
//                                             {item.status}
//                                         </span>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <p className="text-sm text-slate-500">No activity found.</p>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ManagerDashboard;


import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Users,
  Activity,
  Calendar,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const COLORS = {
  present: '#22c55e',
  absent: '#ef4444'
};

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayAttendance: 0,
    absent: 0
  });

  const [analytics, setAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');

        const response = await api.get(
          `/attendance/dashboard?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&limit=4`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const dashboardStats = response.data?.stats || {
          totalEmployees: 0,
          todayAttendance: 0,
          absent: 0
        };

        const dashboardAnalytics = response.data?.analytics || null;
        const activity = response.data?.recentActivity || [];

        setStats(dashboardStats);
        setAnalytics(dashboardAnalytics);
        setRecentActivity(activity);
      } catch (err) {
        console.error('Dashboard Error:', err);

        if (err.response?.status === 403) {
          setError('Access denied (403). Please login again.');
          setTimeout(() => {
            window.location.href = '/manager-login';
          }, 1500);
        } else {
          setError(err.response?.data?.message || 'Failed to load dashboard.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  const attendanceRate =
    stats?.totalEmployees > 0
      ? ((stats?.todayAttendance / stats?.totalEmployees) * 100).toFixed(1)
      : 0;

  const weeklyTrend =
    analytics?.chartData?.map((item) => ({
      day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
      present: item.completed,
      absent: item.notMarked
    })) || [];

  const statCards = [
    {
      title: 'Total Interns',
      value: stats.totalEmployees,
      subtitle: 'In your scope',
      icon: Users,
      iconWrap: 'bg-indigo-100 text-indigo-700',
      glow: 'from-indigo-500/10 to-transparent'
    },
    {
      title: 'Present Today',
      value: stats.todayAttendance,
      subtitle: 'Present + Completed',
      icon: CheckCircle2,
      iconWrap: 'bg-emerald-100 text-emerald-700',
      glow: 'from-emerald-500/10 to-transparent'
    },
    {
      title: 'Absent Today',
      value: stats.absent,
      subtitle: 'Not present',
      icon: XCircle,
      iconWrap: 'bg-rose-100 text-rose-700',
      glow: 'from-rose-500/10 to-transparent'
    },
    {
      title: 'Attendance Rate',
      value: `${attendanceRate}%`,
      subtitle: 'Today',
      icon: TrendingUp,
      iconWrap: 'bg-amber-100 text-amber-700',
      glow: 'from-amber-500/10 to-transparent'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 shadow-2xl sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.18),_transparent_28%)]" />
          <div className="absolute right-10 top-10 hidden h-32 w-32 rounded-full bg-white/10 blur-3xl md:block" />
          <div className="absolute bottom-6 left-10 hidden h-24 w-24 rounded-full bg-indigo-400/20 blur-3xl md:block" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-100">
                  Performance Dashboard
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                {user?.role === 'TeamHead' ? 'Team Head Overview' : 'Manager Overview'}
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium text-slate-300 md:text-base">
                Monitor attendance performance, daily activity, and workforce consistency across your team.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-xl">
                <Calendar className="h-4 w-4 text-indigo-200" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange((p) => ({ ...p, startDate: e.target.value }))}
                  className="bg-transparent text-xs font-semibold text-white outline-none [color-scheme:dark]"
                />
                <span className="text-xs font-bold text-indigo-200">→</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange((p) => ({ ...p, endDate: e.target.value }))}
                  className="bg-transparent text-xs font-semibold text-white outline-none [color-scheme:dark]"
                />
              </div>

              <button
                type="button"
                onClick={() => setDateRange((p) => ({ ...p }))}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/15"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-800 shadow-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs font-bold text-rose-700 underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.glow} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {card.title}
                      </p>
                      <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                        {card.value}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {card.subtitle}
                      </p>
                    </div>

                    <div className={`rounded-2xl p-3 ${card.iconWrap}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-400">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Live metrics
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Chart */}
          <div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    Weekly Trend
                  </p>
                  <h3 className="text-base font-bold text-slate-900">
                    Completed vs Not Marked
                  </h3>
                </div>
              </div>

              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-500">
                {dateRange.startDate} → {dateRange.endDate}
              </div>
            </div>

            <div className="h-[320px] rounded-3xl bg-slate-50/80 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 12px 30px -12px rgba(15,23,42,0.25)'
                    }}
                  />
                  <Area type="monotone" dataKey="present" stroke="#22c55e" fill="url(#presentGradient)" strokeWidth={3} />
                  <Area type="monotone" dataKey="absent" stroke="#ef4444" fill="url(#absentGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Recent Activity
                </p>
                <h3 className="text-base font-bold text-slate-900">Latest Updates</h3>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {item.employeeName}
                      </p>
                      <p className="text-xs text-slate-500">Attendance updated</p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                        item.status === 'Completed'
                          ? 'bg-indigo-100 text-indigo-700'
                          : item.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-52 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-sm font-medium text-slate-500">
                No activity found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;