// import React, { useEffect, useMemo, useState } from 'react';
// import { Link, useSearchParams } from 'react-router-dom';
// import api from '../services/api';
// import {
//   ArrowLeft,
//   CalendarCheck,
//   Loader2,
//   AlertCircle,
//   Mail,
//   Hash,
//   CheckCircle2,
//   Search,
// } from 'lucide-react';

// const statusStyle = (status) => {
//   if (status === 'Present') return 'bg-emerald-50 text-emerald-800 ring-emerald-200/80';
//   if (status === 'Absent') return 'bg-rose-50 text-rose-800 ring-rose-200/80';
//   if (status === 'Completed') return 'bg-indigo-50 text-indigo-800 ring-indigo-200';
//   return 'bg-slate-50 text-slate-700 ring-slate-200/80';
// };

// const InternAttendanceDetails = () => {
//   const [sp] = useSearchParams();
//   const email = (sp.get('email') || '').trim();
//   const intern_id = (sp.get('intern_id') || '').trim();

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [result, setResult] = useState(null);
//   const [filter, setFilter] = useState('');
//   const [monthKey, setMonthKey] = useState('All'); // YYYY-MM | All

//   useEffect(() => {
//     const run = async () => {
//       setLoading(true);
//       setError('');
//       setResult(null);
//       try {
//         if (!email || !intern_id) {
//           setError('Missing email or intern ID. Please go back and try again.');
//           return;
//         }
//         const res = await api.post('/attendance/intern-lookup', { email, intern_id });
//         setResult(res.data);
//       } catch (e) {
//         setError(
//           e.response?.data?.message ||
//             'Could not load attendance. Check your email and intern ID.'
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     run();
//   }, [email, intern_id]);

//   const allRecords = useMemo(() => result?.records || [], [result]);

//   const availableMonths = useMemo(() => {
//     // record.date is ISO YYYY-MM-DD
//     const set = new Set();
//     for (const r of allRecords) {
//       const d = String(r?.date || '');
//       if (d.length >= 7) set.add(d.slice(0, 7));
//     }
//     // Desc by month string
//     return Array.from(set).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
//   }, [allRecords]);

//   // Default month to most recent if present
//   useEffect(() => {
//     if (!availableMonths.length) return;
//     setMonthKey((prev) => (prev === 'All' ? availableMonths[0] : prev));
//   }, [availableMonths]);

//   const monthScopedRecords = useMemo(() => {
//     if (monthKey === 'All') return allRecords;
//     return allRecords.filter((r) => String(r?.date || '').startsWith(monthKey));
//   }, [allRecords, monthKey]);

//   const visibleMonthRecords = useMemo(() => {
//     // Hide "Completed" records from intern view
//     return monthScopedRecords.filter((r) => r?.status !== 'Completed');
//   }, [monthScopedRecords]);

//   const filteredRecords = useMemo(() => {
//     const rows = visibleMonthRecords;
//     const q = filter.trim().toLowerCase();
//     if (!q) return rows;
//     return rows.filter((r) => {
//       return (
//         String(r.date || '').toLowerCase().includes(q) ||
//         String(r.status || '').toLowerCase().includes(q) ||
//         String(r.taskDescription || '').toLowerCase().includes(q)
//       );
//     });
//   }, [visibleMonthRecords, filter]);

//   const monthSummary = useMemo(() => {
//     const rows = visibleMonthRecords;
//     const summary = { present: 0, absent: 0, total: rows.length };
//     for (const r of rows) {
//       if (r.status === 'Present') summary.present += 1;
//       else if (r.status === 'Absent') summary.absent += 1;
//     }
//     return summary;
//   }, [visibleMonthRecords]);

//   const monthTitle = useMemo(() => {
//     if (monthKey === 'All') return 'All months';
//     const [y, m] = monthKey.split('-');
//     const dt = new Date(Number(y), Number(m) - 1, 1);
//     return dt.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
//   }, [monthKey]);

//   const summaryGridCols = 'grid grid-cols-3 sm:grid-cols-3 gap-3';

//   return (
//     <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_-10%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(168,85,247,0.14),transparent_55%),linear-gradient(to_bottom_right,rgba(248,250,252,1),rgba(255,255,255,1),rgba(238,242,255,0.55))]">
//       <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-5">
//         <div className="flex items-center justify-between gap-3">
//           <Link
//             to="/intern-attendance"
//             className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-extrabold hover:bg-slate-50"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back
//           </Link>

//           <div className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
//             <CalendarCheck className="w-4 h-4 text-indigo-600" />
//             Attendance details
//           </div>
//         </div>

//         <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 md:p-7 shadow-xl shadow-indigo-200/30 overflow-hidden relative border border-white/10">
//           <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl" />
//           <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-fuchsia-500/10 rounded-full blur-3xl" />
//           <div className="relative">
//             <div className="text-xs font-black uppercase tracking-widest text-white/80">
//               Intern
//             </div>
//             <div className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
//               {result?.name || '—'}
//             </div>
//             <div className="mt-3 grid gap-2 sm:grid-cols-3">
//               <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
//                 <div className="text-[10px] font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
//                   <Mail className="w-4 h-4" />
//                   Email
//                 </div>
//                 <div className="text-sm font-extrabold truncate">{email || '—'}</div>
//               </div>
//               <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
//                 <div className="text-[10px] font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
//                   <Hash className="w-4 h-4" />
//                   Intern ID
//                 </div>
//                 <div className="text-sm font-extrabold truncate">{intern_id || '—'}</div>
//               </div>
//               <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
//                 <div className="text-[10px] font-black uppercase tracking-widest text-white/60">
//                   Department
//                 </div>
//                 <div className="text-sm font-extrabold truncate">{result?.department || '—'}</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {loading ? (
//           <div className="flex items-center justify-center min-h-[30vh] text-slate-500 gap-2">
//             <Loader2 className="w-6 h-6 animate-spin" />
//             Loading attendance…
//           </div>
//         ) : error ? (
//           <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
//             <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
//             <span>{error}</span>
//           </div>
//         ) : (
//           <>
//             {/* Sticky controls for month + search */}
//             <div className="sticky top-0 z-10 -mx-4 md:mx-0 px-4 md:px-0 py-3 bg-white/70 backdrop-blur border-y border-slate-200/60">
//               <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
//                 <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm px-4 py-3">
//                   <div className="flex items-center justify-between gap-3">
//                     <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
//                       Month
//                     </div>
//                     <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
//                       {monthTitle}
//                     </div>
//                   </div>
//                   <select
//                     value={monthKey}
//                     onChange={(e) => setMonthKey(e.target.value)}
//                     className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm bg-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
//                   >
//                     <option value="All">All months</option>
//                     {availableMonths.map((k) => (
//                       <option key={k} value={k}>
//                         {(() => {
//                           const [y, m] = k.split('-');
//                           const dt = new Date(Number(y), Number(m) - 1, 1);
//                           return dt.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
//                         })()}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm px-4 py-3">
//                   <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
//                     Search records
//                   </div>
//                   <div className="mt-2 relative">
//                     <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//                     <input
//                       value={filter}
//                       onChange={(e) => setFilter(e.target.value)}
//                       placeholder="Date / status / note…"
//                       className="w-full pl-9 pr-3 py-3 rounded-2xl border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className={summaryGridCols}>
//               {[
//                 ['Present', monthSummary.present, 'text-emerald-700'],
//                 ['Absent', monthSummary.absent, 'text-rose-700'],
//                 ['Total days', monthSummary.total, 'text-slate-800'],
//               ].map(([label, val, color]) => (
//                 <div
//                   key={label}
//                   className="rounded-3xl border border-slate-200/80 bg-white px-4 py-4 text-center shadow-sm"
//                 >
//                   <p className={`text-3xl md:text-4xl font-extrabold tabular-nums ${color}`}>
//                     {val}
//                   </p>
//                   <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mt-1">
//                     {label}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden">
//               <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <CheckCircle2 className="w-5 h-5 text-indigo-200" />
//                   <span className="font-extrabold text-sm">Daily attendance</span>
//                 </div>
//                 <span className="text-[10px] uppercase tracking-widest text-slate-300 font-black">
//                   {filteredRecords.length} record(s)
//                 </span>
//               </div>
//               <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
//                 <div className="text-xs font-black uppercase tracking-wider text-slate-500">
//                   Showing: {monthTitle}
//                 </div>
//                 <div className="text-xs font-semibold text-slate-600">
//                   {monthSummary.present + monthSummary.absent} marked day(s)
//                 </div>
//               </div>

//               {filteredRecords.length === 0 ? (
//                 <div className="p-10 text-center text-slate-500 text-sm">
//                   No records found.
//                 </div>
//               ) : (
//                 <>
//                   {/* Desktop table */}
//                   <div className="hidden md:block overflow-x-auto">
//                     <table className="w-full text-sm">
//                       <thead className="bg-indigo-50">
//                         <tr className="text-left text-[11px] font-black uppercase tracking-wider text-indigo-700">
//                           <th className="px-5 py-3.5">Date</th>
//                           <th className="px-5 py-3.5">Status</th>
//                           <th className="px-5 py-3.5">Note</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-slate-100 bg-white">
//                         {filteredRecords.map((row) => (
//                           <tr key={row.date} className="hover:bg-slate-50">
//                             <td className="px-5 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
//                               {row.date}
//                             </td>
//                             <td className="px-5 py-3.5">
//                               <span
//                                 className={`inline-flex rounded-2xl px-3 py-1 text-xs font-extrabold ring-1 ${statusStyle(
//                                   row.status
//                                 )}`}
//                               >
//                                 {row.status}
//                               </span>
//                             </td>
//                             <td className="px-5 py-3.5 text-slate-700">
//                               {row.taskDescription || '—'}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>

//                   {/* Mobile cards */}
//                   <div className="md:hidden divide-y divide-slate-100">
//                     {filteredRecords.map((row) => (
//                       <div key={row.date} className="p-4">
//                         <div className="flex items-start justify-between gap-3">
//                           <div>
//                             <div className="text-sm font-extrabold text-slate-900">
//                               {row.date}
//                             </div>
//                             <div className="mt-2">
//                               <span
//                                 className={`inline-flex rounded-2xl px-3 py-1 text-xs font-extrabold ring-1 ${statusStyle(
//                                   row.status
//                                 )}`}
//                               >
//                                 {row.status}
//                               </span>
//                             </div>
//                           </div>
//                           <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
//                             Note
//                           </div>
//                         </div>
//                         <div className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">
//                           {row.taskDescription || '—'}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default InternAttendanceDetails;





import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  CalendarCheck,
  Loader2,
  AlertCircle,
  Mail,
  Hash,
  CheckCircle2,
  Search,
  Sparkles,
  Building2,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';

const statusStyle = (status) => {
  if (status === 'Present') return 'bg-emerald-50 text-emerald-800 ring-emerald-200/80';
  if (status === 'Absent') return 'bg-rose-50 text-rose-800 ring-rose-200/80';
  if (status === 'Completed') return 'bg-indigo-50 text-indigo-800 ring-indigo-200';
  return 'bg-slate-50 text-slate-700 ring-slate-200/80';
};

const InternAttendanceDetails = () => {
  const [sp] = useSearchParams();
  const email = (sp.get('email') || '').trim();
  const intern_id = (sp.get('intern_id') || '').trim();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('');
  const [monthKey, setMonthKey] = useState('All');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      setResult(null);
      try {
        if (!email || !intern_id) {
          setError('Missing email or intern ID. Please go back and try again.');
          return;
        }
        const res = await api.post('/attendance/intern-lookup', { email, intern_id });
        setResult(res.data);
      } catch (e) {
        setError(
          e.response?.data?.message ||
            'Could not load attendance. Check your email and intern ID.'
        );
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [email, intern_id]);

  const allRecords = useMemo(() => result?.records || [], [result]);

  const availableMonths = useMemo(() => {
    const set = new Set();
    for (const r of allRecords) {
      const d = String(r?.date || '');
      if (d.length >= 7) set.add(d.slice(0, 7));
    }
    return Array.from(set).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  }, [allRecords]);

  useEffect(() => {
    if (!availableMonths.length) return;
    setMonthKey((prev) => (prev === 'All' ? availableMonths[0] : prev));
  }, [availableMonths]);

  const monthScopedRecords = useMemo(() => {
    if (monthKey === 'All') return allRecords;
    return allRecords.filter((r) => String(r?.date || '').startsWith(monthKey));
  }, [allRecords, monthKey]);

  const visibleMonthRecords = useMemo(() => {
    return monthScopedRecords.filter((r) => r?.status !== 'Completed');
  }, [monthScopedRecords]);

  const filteredRecords = useMemo(() => {
    const rows = visibleMonthRecords;
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      return (
        String(r.date || '').toLowerCase().includes(q) ||
        String(r.status || '').toLowerCase().includes(q) ||
        String(r.taskDescription || '').toLowerCase().includes(q)
      );
    });
  }, [visibleMonthRecords, filter]);

  const monthSummary = useMemo(() => {
    const rows = visibleMonthRecords;
    const summary = { present: 0, absent: 0, total: rows.length };
    for (const r of rows) {
      if (r.status === 'Present') summary.present += 1;
      else if (r.status === 'Absent') summary.absent += 1;
    }
    return summary;
  }, [visibleMonthRecords]);

  const monthTitle = useMemo(() => {
    if (monthKey === 'All') return 'All months';
    const [y, m] = monthKey.split('-');
    const dt = new Date(Number(y), Number(m) - 1, 1);
    return dt.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  }, [monthKey]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/intern-attendance"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
            <CalendarCheck className="h-4 w-4 text-indigo-600" />
            Attendance Details
          </div>
        </div>

        {/* Premium Hero */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 shadow-2xl sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.12),_transparent_28%)]" />
          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-100">
                Intern Record
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              {result?.name || '—'}
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-300 md:text-base">
              View attendance records, daily status, and monthly summaries in one professional dashboard.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-indigo-200" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Email</p>
                    <p className="text-sm font-bold text-white truncate">{email || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-indigo-200" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Intern ID</p>
                    <p className="text-sm font-bold text-white truncate">{intern_id || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-indigo-200" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Department</p>
                    <p className="text-sm font-bold text-white truncate">{result?.department || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-medium">Loading attendance...</span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Month</p>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {monthTitle}
                  </span>
                </div>
                <select
                  value={monthKey}
                  onChange={(e) => setMonthKey(e.target.value)}
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white"
                >
                  <option value="All">All months</option>
                  {availableMonths.map((k) => (
                    <option key={k} value={k}>
                      {(() => {
                        const [y, m] = k.split('-');
                        const dt = new Date(Number(y), Number(m) - 1, 1);
                        return dt.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
                      })()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Search Records</p>
                <div className="relative mt-3">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Date / status / note..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ['Present', monthSummary.present, 'text-emerald-700', <CheckCircle2 className="h-5 w-5" />],
                ['Absent', monthSummary.absent, 'text-rose-700', <AlertCircle className="h-5 w-5" />],
                ['Total Days', monthSummary.total, 'text-slate-800', <CalendarDays className="h-5 w-5" />],
              ].map(([label, val, color, icon]) => (
                <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-2xl bg-slate-100 p-2 ${color}`}>{icon}</div>
                    <TrendingUp className="h-4 w-4 text-slate-300" />
                  </div>
                  <p className={`mt-4 text-3xl font-black ${color}`}>{val}</p>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Records */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-6 py-4 text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-200" />
                  <span className="text-sm font-bold">Daily Attendance</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                  {filteredRecords.length} Records
                </span>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">No records found.</div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                          <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Date</th>
                          <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                          <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredRecords.map((row) => (
                          <tr key={row.date} className="transition hover:bg-slate-50">
                            <td className="px-5 py-4 text-sm font-semibold text-slate-900">{row.date}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex rounded-2xl px-3 py-1 text-xs font-bold ring-1 ${statusStyle(row.status)}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-700">{row.taskDescription || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="divide-y divide-slate-200 md:hidden">
                    {filteredRecords.map((row) => (
                      <div key={row.date} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{row.date}</p>
                            <span className={`mt-2 inline-flex rounded-2xl px-3 py-1 text-xs font-bold ring-1 ${statusStyle(row.status)}`}>
                              {row.status}
                            </span>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{row.taskDescription || '—'}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InternAttendanceDetails;