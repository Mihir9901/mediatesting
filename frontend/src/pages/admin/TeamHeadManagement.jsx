import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader2, AlertCircle, UserCheck, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeamHeadManagement = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/team-heads');
      setItems(res.data || []);
    } catch (e) {
      const status = e.response?.status;
      if (status === 401 || status === 403) {
        setError('Session expired or access denied. Please login again.');
        setTimeout(() => navigate('/admin-login'), 800);
      } else if (e.code === 'ERR_NETWORK' || e.message === 'Network Error') {
        setError('Network error: cannot reach server.');
      } else {
        setError(
          e.response?.data?.message ||
            e.response?.data?.msg ||
            (status ? `Failed to load team heads (HTTP ${status}).` : 'Failed to load team heads.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleStatus = async (id) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.patch(`/admin/team-heads/${id}/toggle`);
      setItems((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isActive: res.data.isActive } : u))
      );
      setSuccess(`Team head ${res.data.isActive ? 'activated' : 'deactivated'} successfully.`);
      setTimeout(() => setSuccess(''), 2500);
    } catch (e) {
      const status = e.response?.status;
      if (status === 401 || status === 403) {
        setError('Session expired or access denied. Please login again.');
        setTimeout(() => navigate('/admin-login'), 800);
      } else if (e.code === 'ERR_NETWORK' || e.message === 'Network Error') {
        setError('Network error: cannot reach server.');
      } else {
        setError(
          e.response?.data?.message ||
            e.response?.data?.msg ||
            (status ? `Failed to update status (HTTP ${status}).` : 'Failed to update status.')
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px] text-slate-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        Loading team heads…
      </div>
    );
  }

  return (
    <div className="pt-2 px-4 md:px-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team heads</h1>
          <p className="text-slate-500 text-xs font-normal">
            View all team head accounts and activate/deactivate access.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 text-sm font-semibold flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm font-semibold">
          {success}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white text-sm font-bold flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-400" /> Accounts
          </h2>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {items.length} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                    No team head accounts found.
                  </td>
                </tr>
              ) : (
                items.map((u, idx) => (
                  <tr
                    key={u._id}
                    className={`hover:bg-slate-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{u.teamName || '—'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                          u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleStatus(u._id)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                      >
                        {u.isActive ? (
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-slate-500" />
                        )}
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamHeadManagement;

