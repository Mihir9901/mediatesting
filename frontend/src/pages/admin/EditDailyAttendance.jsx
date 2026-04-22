import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import {
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle,
  Save,
  CheckCircle2,
  Search,
} from 'lucide-react';

const STATUSES = ['Present', 'Absent', 'Completed'];

const EditDailyAttendance = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState('All');
  const [departments, setDepartments] = useState([]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [q, setQ] = useState('');

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/all-departments');
      const list = Array.isArray(res.data) ? res.data : [];
      setDepartments(list.map((d) => d.departmentName || d._id).filter(Boolean));
    } catch {
      // ignore
    }
  };

  const fetchDay = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const params = new URLSearchParams();
      params.append('date', date);
      if (department && department !== 'All') params.append('department', department);
      const res = await api.get(`/admin/attendance-day?${params.toString()}`);
      const apiRows = res.data?.rows || [];
      setRows(
        apiRows.map((r) => ({
          employee: r.employee,
          attendance: r.attendance,
          draftStatus: r.attendance?.status || '',
          draftTask: r.attendance?.taskDescription || '',
        }))
      );
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load attendance day.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, department]);

  const filteredRows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const e = r.employee || {};
      return (
        e.name?.toLowerCase().includes(s) ||
        e.email?.toLowerCase().includes(s) ||
        e.employee_id?.toLowerCase().includes(s) ||
        e.domain?.toLowerCase().includes(s) ||
        e.departmentName?.toLowerCase().includes(s)
      );
    });
  }, [rows, q]);

  const saveRow = async (employee_id, draftStatus, draftTask) => {
    if (!draftStatus) {
      setError('Select a status before saving.');
      return;
    }
    setSavingId(employee_id);
    setError('');
    setSuccess('');
    try {
      await api.put('/admin/attendance-day', {
        employee_id,
        date,
        status: draftStatus,
        taskDescription: draftTask || '',
      });
      setSuccess('Saved successfully.');
      setTimeout(() => setSuccess(''), 1500);
      await fetchDay();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save attendance.');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className="pt-2 px-4 md:px-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Edit daily attendance
        </h1>
        <p className="text-slate-500 text-xs font-normal">
          Admin override: update any intern’s attendance for a specific date.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 md:p-5">
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">
            Department
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <option value="All">All</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name / email / ID / domain…"
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="md:col-span-4 flex justify-end">
          <button
            type="button"
            onClick={fetchDay}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 text-sm font-semibold flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <p className="text-white text-sm font-bold">Interns</p>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            {filteredRows.length} shown
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Intern
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Task note
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Save
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((r, idx) => {
                  const e = r.employee;
                  return (
                    <tr key={e.employee_id} className={idx % 2 ? 'bg-slate-50/40' : 'bg-white'}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">{e.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{e.employee_id}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {e.domain || e.departmentName || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={r.draftStatus}
                          onChange={(ev) => {
                            const v = ev.target.value;
                            setRows((prev) =>
                              prev.map((x) =>
                                x.employee.employee_id === e.employee_id
                                  ? { ...x, draftStatus: v }
                                  : x
                              )
                            );
                          }}
                          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800"
                        >
                          <option value="">—</option>
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          value={r.draftTask}
                          onChange={(ev) => {
                            const v = ev.target.value;
                            setRows((prev) =>
                              prev.map((x) =>
                                x.employee.employee_id === e.employee_id
                                  ? { ...x, draftTask: v }
                                  : x
                              )
                            );
                          }}
                          placeholder="Optional"
                          className="w-full min-w-[260px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => saveRow(e.employee_id, r.draftStatus, r.draftTask)}
                          disabled={savingId === e.employee_id}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
                        >
                          {savingId === e.employee_id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditDailyAttendance;

