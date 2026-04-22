import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { Shield, Search, Loader2, RefreshCw } from 'lucide-react';

const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const LoginLogs = () => {
  const [role, setRole] = useState('All'); // All | Admin | Manager | TeamHead
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({ logs: [], total: 0, pages: 1 });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (role !== 'All') params.set('role', role);
    if (q.trim()) params.set('q', q.trim());
    return params.toString();
  }, [page, limit, role, q]);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/admin/login-logs?${queryString}`);
      setData(res.data);
    } catch (e) {
      const status = e.response?.status;
      const msg =
        e.response?.data?.message ||
        e.response?.data?.msg ||
        e.response?.data?.error ||
        e.message;
      setError(
        status ? `(${status}) ${msg || 'Failed to load login logs'}` : msg || 'Failed to load login logs'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  return (
    <div className="pt-2 px-4 md:px-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Login logs</h1>
        <p className="text-slate-500 text-xs font-normal">
          Security audit view. Only Admins can access these logs.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-300" />
            <span className="font-extrabold text-sm">Audit feed</span>
          </div>
          <button
            type="button"
            onClick={fetchLogs}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-extrabold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="grid gap-3 md:grid-cols-[180px_1fr_160px] items-end">
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setPage(1);
                }}
                className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm bg-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              >
                <option value="All">All</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="TeamHead">TeamHead</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Search
              </label>
              <div className="mt-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Name / email / IP…"
                  className="w-full pl-9 pr-3 py-3 rounded-2xl border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Total
              </div>
              <div className="text-lg font-extrabold text-slate-900 tabular-nums">
                {data.total ?? 0}
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-6 text-sm text-rose-700 bg-rose-50 border-t border-rose-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading…
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-indigo-50">
                  <tr className="text-left text-[11px] font-black uppercase tracking-wider text-indigo-700">
                    <th className="px-5 py-3.5">Date & time</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Username</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">IP</th>
                    <th className="px-5 py-3.5 text-right">Lat / Long</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(data.logs || []).map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-900 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700 font-semibold">
                        {log.role || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-800">
                        {log.username || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">
                        {log.email || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-mono text-slate-600">
                        {log.ipAddress || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700 text-right font-mono">
                        {log.latitude != null && log.longitude != null
                          ? `${log.latitude}, ${log.longitude}`
                          : '—'}
                      </td>
                    </tr>
                  ))}

                  {(!data.logs || data.logs.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-white">
              <div className="text-xs font-semibold text-slate-500">
                Page <span className="font-extrabold text-slate-800">{data.page || page}</span> of{' '}
                <span className="font-extrabold text-slate-800">{data.pages || 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={(data.page || page) <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-4 py-2 rounded-2xl border border-slate-200 text-sm font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={(data.page || page) >= (data.pages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-2xl border border-slate-200 text-sm font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginLogs;

