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
} from 'lucide-react';

const TeamDetails = () => {
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
        api.get('/manager/teams'),
        api.get('/manager/intern-pool'),
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
      await api.post(`/manager/teams/${teamId}/members`, { employee_id: memberPick });
      setMemberPick('');
      setMsg({ type: 'ok', text: 'Intern added to team' });
      await load();
    } catch (err) {
      setMsg({ type: 'err', text: err.response?.data?.message || 'Could not add intern' });
    }
  };

  const removeMember = async (employeeId) => {
    try {
      await api.delete(`/manager/teams/${teamId}/members/${encodeURIComponent(employeeId)}`);
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
      await api.post(`/manager/teams/${teamId}/head`, {
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
      await api.delete(`/manager/teams/${teamId}`);
      navigate('/manager/teams');
    } catch (err) {
      setMsg({ type: 'err', text: err.response?.data?.message || 'Could not delete team' });
    }
  };

  if (loading && !team) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        Loading team…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="max-w-7xl mx-auto space-y-5 p-4 md:p-6">
        {/* Sticky top actions (mobile-first) */}
        <div className="sticky top-0 z-20 -mx-4 md:mx-0 px-4 md:px-0 py-3 bg-white/80 backdrop-blur border-b border-slate-200/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate('/manager/teams')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-extrabold hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="text-right md:hidden">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Selected team
                </div>
                <div className="text-sm font-extrabold text-slate-900 truncate max-w-[55vw]">
                  {team?.name || '—'}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={load}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-extrabold hover:bg-slate-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={deleteTeam}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-extrabold hover:bg-rose-100"
              >
                <Trash2 className="w-4 h-4" />
                Delete team
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white p-6 md:p-7 shadow-lg shadow-indigo-200/40 overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl" />
          <div className="relative">
            <div className="text-xs font-black uppercase tracking-widest text-white/80">
              Team details
            </div>
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
              {team?.name || '—'}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/70">
                  Members
                </div>
                <div className="text-lg font-extrabold">{memberCount}</div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/70">
                  Team head
                </div>
                <div className="text-sm font-extrabold truncate">
                  {headEmail || 'Not assigned'}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3 sm:col-span-2 lg:col-span-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/70">
                  Departments
                </div>
                <div className="text-sm font-extrabold truncate" title={memberDepartmentsLabel}>
                  {memberDepartmentsLabel}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {msg.text ? (
          <div
            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
              msg.type === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            {msg.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {msg.text}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2 items-start">
          {/* Team head */}
          <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-300" />
                <span className="font-extrabold text-sm">Team head</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-300 font-black">
                Login
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Current head
                </div>
                {headEmail ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{headEmail}</span>
                    </div>
                    {headName ? <div className="text-sm text-slate-600">{headName}</div> : null}
                    <div className="text-xs text-slate-500">
                      Replacing will disable the old head automatically.
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">No team head assigned yet.</div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Create / Replace head
                </div>
                <div className="space-y-2">
                  <input
                    placeholder="Full name"
                    value={headForm.name}
                    onChange={(e) => setHeadForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white"
                  />
                  <input
                    type="email"
                    placeholder="Login email"
                    value={headForm.email}
                    onChange={(e) => setHeadForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white"
                  />
                  <input
                    type="password"
                    placeholder="Password (min 6 chars)"
                    value={headForm.password}
                    onChange={(e) => setHeadForm((p) => ({ ...p, password: e.target.value }))}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={createHead}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-extrabold hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-[0.99]"
                  >
                    <UserPlus className="w-4 h-4" />
                    Save team head login
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-300" />
                <span className="font-extrabold text-sm">Members</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-300 font-black">
                {members.length} total
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Current interns
                  </div>
                </div>

                {members.length === 0 ? (
                  <div className="p-6 text-sm text-slate-600">No interns in this team yet.</div>
                ) : (
                  <div className="overflow-x-auto hidden md:block">
                    <table className="w-full">
                      <thead className="bg-indigo-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-[11px] font-black text-indigo-700 uppercase tracking-wider">
                            Intern
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-black text-indigo-700 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-4 py-3 text-right text-[11px] font-black text-indigo-700 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {members.map((eid) => {
                          const emp = pool.find((p) => p.employee_id === eid);
                          return (
                            <tr key={eid} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 rounded-xl bg-indigo-50 border border-indigo-100 p-2">
                                    <Hash className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-extrabold text-slate-900">
                                      {emp?.name || '—'}
                                    </div>
                                    <div className="text-xs font-mono text-slate-500">{eid}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {emp?.domain || emp?.departmentName || '—'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => removeMember(eid)}
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-sm font-extrabold active:scale-[0.99]"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Mobile cards */}
                {members.length ? (
                  <div className="md:hidden divide-y divide-slate-100">
                    {members.map((eid) => {
                      const emp = pool.find((p) => p.employee_id === eid);
                      const dept = emp?.domain || emp?.departmentName || '—';
                      return (
                        <div key={eid} className="p-4 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-extrabold text-slate-900 truncate">
                              {emp?.name || '—'}
                            </div>
                            <div className="text-xs font-mono text-slate-500 mt-0.5">{eid}</div>
                            <div className="text-xs text-slate-600 mt-1 truncate">{dept}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMember(eid)}
                            className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-extrabold active:scale-[0.99]"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Add intern
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Search by name / ID / dept…"
                      className="w-full pl-9 pr-3 py-3 rounded-2xl border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white"
                    />
                  </div>

                  <select
                    value={memberPick}
                    onChange={(e) => setMemberPick(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm bg-white font-semibold"
                  >
                    <option value="">Select intern (from your scope)</option>
                    {poolForSelected.map((p) => (
                      <option key={p.employee_id} value={p.employee_id}>
                        {p.name} — {p.employee_id}
                        {p.domain
                          ? ` (${p.domain})`
                          : p.departmentName
                            ? ` (${p.departmentName})`
                            : ''}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={addMember}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl border border-indigo-200 text-indigo-700 text-sm font-extrabold hover:bg-indigo-50 active:scale-[0.99]"
                  >
                    <Plus className="w-4 h-4" />
                    Add to team
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick switch */}
        {teams.length > 1 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-extrabold text-slate-900">Switch team</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Navigate
              </span>
            </div>
            <div className="p-4 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {teams.map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => navigate(`/manager/teams/${t._id}`)}
                    className={`px-4 py-2.5 rounded-2xl border text-sm font-extrabold ${
                      t._id === teamId
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TeamDetails;
