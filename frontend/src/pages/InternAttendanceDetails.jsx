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
  const [monthKey, setMonthKey] = useState('All'); // YYYY-MM | All

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
    // record.date is ISO YYYY-MM-DD
    const set = new Set();
    for (const r of allRecords) {
      const d = String(r?.date || '');
      if (d.length >= 7) set.add(d.slice(0, 7));
    }
    // Desc by month string
    return Array.from(set).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  }, [allRecords]);

  // Default month to most recent if present
  useEffect(() => {
    if (!availableMonths.length) return;
    setMonthKey((prev) => (prev === 'All' ? availableMonths[0] : prev));
  }, [availableMonths]);

  const monthScopedRecords = useMemo(() => {
    if (monthKey === 'All') return allRecords;
    return allRecords.filter((r) => String(r?.date || '').startsWith(monthKey));
  }, [allRecords, monthKey]);

  const visibleMonthRecords = useMemo(() => {
    // Hide "Completed" records from intern view
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

  const summaryGridCols = 'grid grid-cols-3 sm:grid-cols-3 gap-3';

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_-10%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(168,85,247,0.14),transparent_55%),linear-gradient(to_bottom_right,rgba(248,250,252,1),rgba(255,255,255,1),rgba(238,242,255,0.55))]">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/intern-attendance"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-extrabold hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            Attendance details
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 md:p-7 shadow-xl shadow-indigo-200/30 overflow-hidden relative border border-white/10">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-fuchsia-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="text-xs font-black uppercase tracking-widest text-white/80">
              Intern
            </div>
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
              {result?.name || '—'}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
                <div className="text-sm font-extrabold truncate">{email || '—'}</div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Intern ID
                </div>
                <div className="text-sm font-extrabold truncate">{intern_id || '—'}</div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  Department
                </div>
                <div className="text-sm font-extrabold truncate">{result?.department || '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[30vh] text-slate-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            Loading attendance…
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {/* Sticky controls for month + search */}
            <div className="sticky top-0 z-10 -mx-4 md:mx-0 px-4 md:px-0 py-3 bg-white/70 backdrop-blur border-y border-slate-200/60">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      Month
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {monthTitle}
                    </div>
                  </div>
                  <select
                    value={monthKey}
                    onChange={(e) => setMonthKey(e.target.value)}
                    className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm bg-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
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

                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm px-4 py-3">
                  <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Search records
                  </div>
                  <div className="mt-2 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="Date / status / note…"
                      className="w-full pl-9 pr-3 py-3 rounded-2xl border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={summaryGridCols}>
              {[
                ['Present', monthSummary.present, 'text-emerald-700'],
                ['Absent', monthSummary.absent, 'text-rose-700'],
                ['Total days', monthSummary.total, 'text-slate-800'],
              ].map(([label, val, color]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-slate-200/80 bg-white px-4 py-4 text-center shadow-sm"
                >
                  <p className={`text-3xl md:text-4xl font-extrabold tabular-nums ${color}`}>
                    {val}
                  </p>
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mt-1">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-200" />
                  <span className="font-extrabold text-sm">Daily attendance</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-slate-300 font-black">
                  {filteredRecords.length} record(s)
                </span>
              </div>
              <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Showing: {monthTitle}
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  {monthSummary.present + monthSummary.absent} marked day(s)
                </div>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="p-10 text-center text-slate-500 text-sm">
                  No records found.
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-indigo-50">
                        <tr className="text-left text-[11px] font-black uppercase tracking-wider text-indigo-700">
                          <th className="px-5 py-3.5">Date</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredRecords.map((row) => (
                          <tr key={row.date} className="hover:bg-slate-50">
                            <td className="px-5 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                              {row.date}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex rounded-2xl px-3 py-1 text-xs font-extrabold ring-1 ${statusStyle(
                                  row.status
                                )}`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-700">
                              {row.taskDescription || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {filteredRecords.map((row) => (
                      <div key={row.date} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">
                              {row.date}
                            </div>
                            <div className="mt-2">
                              <span
                                className={`inline-flex rounded-2xl px-3 py-1 text-xs font-extrabold ring-1 ${statusStyle(
                                  row.status
                                )}`}
                              >
                                {row.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Note
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">
                          {row.taskDescription || '—'}
                        </div>
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

