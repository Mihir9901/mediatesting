import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';

const TeamManagement = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [newTeamName, setNewTeamName] = useState('');
  const [teamSearch, setTeamSearch] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [teamsRes, poolRes] = await Promise.all([
        api.get('/manager/teams'),
        api.get('/manager/intern-pool'),
      ]);
      setTeams(teamsRes.data || []);
      setPool(poolRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const createTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setMsg({ type: '', text: '' });
    try {
      await api.post('/manager/teams', { name: newTeamName.trim() });
      setNewTeamName('');
      setMsg({ type: 'ok', text: 'Team created' });
      await loadAll();
    } catch (err) {
      setMsg({ type: 'err', text: err.response?.data?.message || 'Could not create team' });
    }
  };

  const deleteTeam = async (teamId) => {
    if (!window.confirm('Delete this team? Team head login will be disabled.')) return;
    try {
      await api.delete(`/manager/teams/${teamId}`);
      setMsg({ type: 'ok', text: 'Team deleted' });
      await loadAll();
    } catch (err) {
      setMsg({ type: 'err', text: err.response?.data?.message || 'Could not delete team' });
    }
  };

  const filteredTeams = useMemo(() => {
    const q = teamSearch.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) => String(t.name || '').toLowerCase().includes(q));
  }, [teams, teamSearch]);

  const employeeById = useMemo(() => {
    const m = new Map();
    (pool || []).forEach((p) => {
      if (p?.employee_id) m.set(p.employee_id, p);
    });
    return m;
  }, [pool]);

  if (loading && teams.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        Loading teams…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white p-6 md:p-7 shadow-lg shadow-indigo-200/40 overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl" />
          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Teams</h1>
            <p className="text-sm text-indigo-100 mt-2 max-w-3xl">
              Teams list. Click <span className="font-extrabold">Manage</span> to open Team Details.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {msg.text && (
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
        )}

        <form
          onSubmit={createTeam}
          className="flex flex-col md:flex-row md:items-end gap-3 p-5 rounded-3xl border border-indigo-100 bg-white/80 backdrop-blur-sm shadow-sm"
        >
          <div className="flex-1 min-w-0">
            <label className="text-[11px] font-black text-indigo-600 uppercase tracking-wider">
              New team name
            </label>
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="e.g. Design squad"
              className="mt-2 w-full border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-extrabold hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              Create team
            </button>
            <button
              type="button"
              onClick={loadAll}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 text-sm font-extrabold text-slate-700 hover:bg-slate-50 active:scale-[0.99]"
              title="Refresh teams"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-300" />
              <span className="font-extrabold text-sm">Teams list</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-300 font-black">
              {teams.length} total
            </span>
          </div>

          <div className="p-4 border-b border-slate-100">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Search
            </label>
            <div className="mt-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Type team name…"
                className="w-full pl-9 pr-3 py-3 rounded-2xl border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-indigo-700 uppercase tracking-wider">
                    Team name
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-indigo-700 uppercase tracking-wider">
                    Team head
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-black text-indigo-700 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-5 py-4 text-center text-[11px] font-black text-indigo-700 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-5 py-4 text-right text-[11px] font-black text-indigo-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeams.map((team) => {
                  const head = team.teamHeadUserId;
                  const headLabel =
                    typeof head === 'object' ? head?.name || head?.email || '—' : '—';

                  const memberIds = team.memberEmployeeIds || [];
                  const memberCount = team.memberCount ?? memberIds.length ?? 0;

                  const departments = Array.from(
                    new Set(
                      memberIds
                        .map((id) => employeeById.get(id))
                        .map((e) => e?.domain || e?.departmentName)
                        .filter(Boolean)
                    )
                  );
                  const deptLabel = departments.length ? departments.join(', ') : '—';

                  return (
                    <tr key={team._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-slate-900">{team.name}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700 font-semibold">
                        {headLabel}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        <div className="max-w-[420px] truncate" title={deptLabel}>
                          {deptLabel}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold tabular-nums">
                          {memberCount}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/manager/teams/${team._id}`)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-extrabold hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-[0.99]"
                          >
                            <Users className="w-4 h-4" />
                            Manage
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTeam(team._id)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-extrabold hover:bg-rose-100 active:scale-[0.99]"
                            title="Delete team"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No teams match your search.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
