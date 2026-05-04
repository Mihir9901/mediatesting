import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleCheck,
  CircleX,
  Hash,
  Loader2,
  Mail,
  Search,
  UserRound,
} from 'lucide-react';

const statusStyle = (status) => {
  if (status === 'Present') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'Absent') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (status === 'Completed') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

const formatMonth = (key) => {
  if (key === 'All') return 'All months';
  const [y, m] = key.split('-');
  const dt = new Date(Number(y), Number(m) - 1, 1);
  return dt.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
};

const formatDate = (raw) => {
  const [year, month, day] = String(raw || '').split('-').map(Number);
  if (!year || !month || !day) return raw || '-';
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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
    const q = filter.trim().toLowerCase();
    if (!q) return visibleMonthRecords;
    return visibleMonthRecords.filter((r) => {
      const rawDate = String(r.date || '').toLowerCase();
      const displayDate = String(formatDate(r.date) || '').toLowerCase();
      return (
        rawDate.includes(q) ||
        displayDate.includes(q) ||
        String(r.status || '').toLowerCase().includes(q) ||
        String(r.taskDescription || '').toLowerCase().includes(q)
      );
    });
  }, [visibleMonthRecords, filter]);

  const monthSummary = useMemo(() => {
    const summary = { present: 0, absent: 0, total: visibleMonthRecords.length };
    for (const r of visibleMonthRecords) {
      if (r.status === 'Present') summary.present += 1;
      else if (r.status === 'Absent') summary.absent += 1;
    }
    return summary;
  }, [visibleMonthRecords]);

  const monthTitle = useMemo(() => formatMonth(monthKey), [monthKey]);
  const attendanceRate = monthSummary.total
    ? Math.round((monthSummary.present / monthSummary.total) * 100)
    : 0;

  const stats = [
    {
      label: 'Present',
      value: monthSummary.present,
      icon: CircleCheck,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/70',
      accent: 'bg-emerald-500',
    },
    {
      label: 'Absent',
      value: monthSummary.absent,
      icon: CircleX,
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200/70',
      accent: 'bg-rose-500',
    },
    {
      label: 'Attendance',
      value: `${attendanceRate}%`,
      icon: CheckCircle2,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200/70',
      accent: 'bg-indigo-500',
    },
    {
      label: 'Total days',
      value: monthSummary.total,
      icon: CalendarDays,
      color: 'text-slate-800',
      bg: 'bg-slate-100',
      border: 'border-slate-200',
      accent: 'bg-slate-800',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-5 md:px-6 md:py-7">
        <header className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
          <div className="bg-[linear-gradient(135deg,#070816_0%,#151a3d_58%,#1f2a5f_100%)] px-5 py-6 text-white md:px-7 md:py-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <Link
                  to="/intern-attendance"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/10 transition hover:bg-white/15"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-indigo-200">
                    Intern attendance
                  </p>
                  <h1 className="mt-2 truncate text-3xl font-black tracking-tight md:text-4xl">
                    {result?.name || 'Attendance details'}
                  </h1>
                  <p className="mt-2 text-sm font-semibold text-slate-300">
                    {monthTitle} record summary
                  </p>
                </div>
              </div>
              <div className="w-fit rounded-lg bg-white px-4 py-3 text-slate-950 shadow-lg shadow-black/10">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                  <CalendarDays className="h-4 w-4 text-indigo-600" /> Attendance
                </div>
                <p className="mt-1 text-2xl font-black tabular-nums text-indigo-700">
                  {attendanceRate}%
                </p>
              </div>
            </div>
          </div>

          {!loading && !error && (
            <div className="grid divide-y divide-slate-200 bg-white md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="flex min-w-0 items-center gap-3 px-5 py-4 md:px-6">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                  <Mail className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Email</p>
                  <p className="truncate text-sm font-black text-slate-900">{email || '-'}</p>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-3 px-5 py-4 md:px-6">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <Hash className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Intern ID</p>
                  <p className="truncate text-sm font-black text-slate-900">{intern_id || '-'}</p>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-3 px-5 py-4 md:px-6">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <BriefcaseBusiness className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Department</p>
                  <p className="truncate text-sm font-black text-slate-900">{result?.department || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </header>

        {loading ? (
          <section className="mt-5 flex min-h-[36vh] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Loading attendance...
          </section>
        ) : error ? (
          <section className="mt-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </section>
        ) : (
          <div className="mt-5 space-y-5">
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`overflow-hidden rounded-lg border bg-white shadow-sm ${item.border}`}>
                    <div className={`h-1 ${item.accent}`} />
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                          {item.label}
                        </p>
                        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                      <p className={`mt-4 text-3xl font-black tabular-nums ${item.color}`}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-white/60">
              <div className="grid gap-4 lg:grid-cols-[minmax(220px,320px)_1fr]">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Month filter</span>
                  <select
                    value={monthKey}
                    onChange={(e) => setMonthKey(e.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="All">All months</option>
                    {availableMonths.map((k) => (
                      <option key={k} value={k}>
                        {formatMonth(k)}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Choose the month you want to review.</p>
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Search records</span>
                  <div className="relative mt-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="Search date, status, or task note"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Search matches date formats, status, and task note.</p>
                </label>
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-slate-950">Daily attendance</h2>
                    <p className="text-xs font-bold text-slate-500">Showing {monthTitle}</p>
                  </div>
                </div>
                <p className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-slate-600">
                  {filteredRecords.length} record(s)
                </p>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm font-semibold text-slate-500">
                  No records found.
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/90 text-xs font-black uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-5 py-3">Date</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredRecords.map((row) => (
                          <tr key={`${row.date}-${row.status}`} className="transition hover:bg-indigo-50/40">
                            <td className="whitespace-nowrap px-5 py-4 font-black text-slate-900">
                              <div>{formatDate(row.date)}</div>
                              <div className="mt-1 text-xs font-bold text-slate-500">{row.date}</div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-black ${statusStyle(row.status)}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-medium text-slate-700">
                              {row.taskDescription || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="divide-y divide-slate-100 md:hidden">
                    {filteredRecords.map((row) => (
                      <article key={`${row.date}-${row.status}`} className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-900">{formatDate(row.date)}</p>
                            <p className="mt-1 text-xs font-bold text-slate-500">{row.date}</p>
                          </div>
                          <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-black ${statusStyle(row.status)}`}>
                            {row.status}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-medium leading-6 text-slate-700">
                          {row.taskDescription || '-'}
                        </p>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default InternAttendanceDetails;