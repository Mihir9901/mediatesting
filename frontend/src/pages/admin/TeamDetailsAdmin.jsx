import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import {
  ArrowLeft,
  Users,
  Crown,
  Mail,
  Hash,
  Search,
  Plus,
  Trash2,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Briefcase,
  Sparkles
} from 'lucide-react';

const TeamDetailsAdmin = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [error, setError] = useState('');

  const [memberSearch, setMemberSearch] = useState('');
  const [memberPick, setMemberPick] = useState('');
  const [headForm, setHeadForm] = useState({ name: '', email: '', password: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [teamsRes, poolRes] = await Promise.all([
        api.get('/teams'),
        // api.get('/teams/intern-pool'),
        api.get('/teams/intern-pool/all'),
      ]);
      const nextTeams = teamsRes.data || [];
      setTeams(nextTeams);
      setPool(poolRes.data || []);
      const t = nextTeams.find((x) => x._id === teamId) || null;
      setTeam(t);
      if (!t) setError('Team not found (or you no longer have access).');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    load();
  }, [load]);

  const members = team?.memberEmployeeIds || [];
  const head = team?.teamHeadUserId;
  const headEmail = typeof head === 'object' && head?.email ? head.email : null;
  const headName = typeof head === 'object' && head?.name ? head.name : null;
  const memberCount = members.length;

  const memberDepartmentsLabel = useMemo(() => {
    const s = new Set();
    for (const eid of members) {
      const emp = pool.find((p) => p.employee_id === eid);
      const d = emp?.domain || emp?.departmentName;
      if (d) s.add(d);
    }
    return s.size ? Array.from(s).join(', ') : '—';
  }, [members, pool]);

  const poolForSelected = useMemo(() => {
    return pool
      .filter((p) => !members.includes(p.employee_id))
      .filter((p) => {
        if (!memberSearch.trim()) return true;
        const q = memberSearch.trim().toLowerCase();
        return (
          String(p.name || '').toLowerCase().includes(q) ||
          String(p.employee_id || '').toLowerCase().includes(q) ||
          String(p.domain || '').toLowerCase().includes(q) ||
          String(p.departmentName || '').toLowerCase().includes(q)
        );
      });
  }, [pool, members, memberSearch]);

  const addMember = async () => {
    if (!memberPick) {
      setMsg({ type: 'err', text: 'Select an intern' });
      return;
    }
    setMsg({ type: '', text: '' });
    try {
      await api.post(`/teams/${teamId}/members`, { employee_id: memberPick });
      setMemberPick('');
      setMsg({ type: 'ok', text: 'Intern added to team' });
      await load();
    } catch (err) {
      setMsg({ type: 'err', text: err.response?.data?.message || 'Could not add intern' });
    }
  };

  const removeMember = async (employeeId) => {
    try {
      await api.delete(`/teams/${teamId}/members/${encodeURIComponent(employeeId)}`);
      setMsg({ type: 'ok', text: 'Intern removed' });
      await load();
    } catch (err) {
      setMsg({ type: 'err', text: err.response?.data?.message || 'Could not remove' });
    }
  };

  const createHead = async () => {
    const { name, email, password } = headForm;
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      setMsg({ type: 'err', text: 'Name, email and password (min 6 chars) required' });
      return;
    }
    setMsg({ type: '', text: '' });
    try {
      await api.post(`/teams/${teamId}/head`, {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setHeadForm({ name: '', email: '', password: '' });
      setMsg({ type: 'ok', text: 'Team head account created. Share login with them.' });
      await load();
    } catch (err) {
      setMsg({ type: 'err', text: err.response?.data?.message || 'Could not create team head' });
    }
  };

  const deleteTeam = async () => {
    if (!window.confirm('Delete this team? Team head login will be disabled.')) return;
    try {
      await api.delete(`/teams/${teamId}`);
      navigate('/admin/create-team-head');
    } catch (err) {
      setMsg({ type: 'err', text: err.response?.data?.message || 'Could not delete team' });
    }
  };

  if (loading && !team) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm font-medium">Loading team workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            // onClick={() => navigate('/manager/teams')}
            onClick={() => navigate('/admin/create-team-head')}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Teams
          </button>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              type="button"
              onClick={deleteTeam}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100"
            >
              <Trash2 className="h-4 w-4" />
              Delete Team
            </button>
          </div>
        </div>

        {/* Premium Hero */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-7 shadow-2xl sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.18),_transparent_28%)]" />
          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-100">
                Team Workspace
              </span>
            </div>

            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white md:text-4xl">{team?.name || '—'}</h1>
                <p className="mt-1 max-w-2xl text-sm font-medium text-slate-300 md:text-base">
                  Manage members, assign leadership, and maintain team structure from one professional workspace.
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-2">
                    <Users className="h-5 w-5 text-indigo-200" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-200">Members</p>
                    <p className="text-2xl font-black text-white">{memberCount}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-200" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-200">Team Head</p>
                    <p className="text-base font-bold text-white truncate">{headEmail || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-2">
                    <Briefcase className="h-5 w-5 text-indigo-200" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-200">Departments</p>
                    <p className="text-base font-bold text-white truncate" title={memberDepartmentsLabel}>
                      {memberDepartmentsLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {msg.text ? (
          <div
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
              msg.type === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            {msg.type === 'ok' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {msg.text}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Team Head */}
          <div className="xl:col-span-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-2.5 text-amber-600">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Team Head</h3>
                  <p className="text-sm text-slate-500">Create or replace team head access</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Current Head</p>
                {headEmail ? (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {headEmail}
                    </div>
                    {headName ? <p className="text-sm text-slate-600">{headName}</p> : null}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">No team head assigned yet.</p>
                )}
              </div>

              <div className="space-y-3">
                <input
                  placeholder="Full name"
                  value={headForm.name}
                  onChange={(e) => setHeadForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white"
                />
                <input
                  type="email"
                  placeholder="Login email"
                  value={headForm.email}
                  onChange={(e) => setHeadForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white"
                />
                <input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={headForm.password}
                  onChange={(e) => setHeadForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white"
                />

                <button
                  type="button"
                  onClick={createHead}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <UserPlus className="h-4 w-4" />
                  Save Team Head Login
                </button>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="xl:col-span-7 space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-indigo-100 p-2.5 text-indigo-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Team Members</h3>
                      <p className="text-sm text-slate-500">Current interns assigned to this team</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {members.length} Total
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {members.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-slate-500">No interns assigned yet.</div>
                ) : (
                  members.map((eid) => {
                    const emp = pool.find((p) => p.employee_id === eid);
                    return (
                      <div key={eid} className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                            <Hash className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{emp?.name || '—'}</p>
                            <p className="text-xs text-slate-500">{eid}</p>
                          </div>
                        </div>

                        <div className="text-sm font-medium text-slate-600">
                          {emp?.domain || emp?.departmentName || '—'}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeMember(eid)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-base font-bold text-slate-900">Add Intern</h3>
                <p className="text-sm text-slate-500">Search and assign an available intern</p>
              </div>

              <div className="space-y-4 p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search by name / ID / department..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <select
                  value={memberPick}
                  onChange={(e) => setMemberPick(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white"
                >
                  <option value="">Select intern</option>
                  {poolForSelected.map((p) => (
                    <option key={p.employee_id} value={p.employee_id}>
                      {p.name} — {p.employee_id}
                      {p.domain ? ` (${p.domain})` : p.departmentName ? ` (${p.departmentName})` : ''}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={addMember}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Add to Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailsAdmin;