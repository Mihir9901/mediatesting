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
  Sparkles,
} from 'lucide-react';

const TeamHeadPage = () => {
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
        api.get('/teams'),
        api.get('/teams/intern-pool/all'),
        // api.get('/teams/intern-pool')
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
      await api.post('/teams', { name: newTeamName.trim() });
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
      await api.delete(`/teams/${teamId}`);
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
    const map = new Map();
    (pool || []).forEach((p) => {
      if (p?.employee_id) map.set(p.employee_id, p);
    });
    return map;
  }, [pool]);

  if (loading && teams.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm font-medium">Loading teams...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 shadow-2xl sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.12),_transparent_28%)]" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-100">
                  Team Control
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Team Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium text-slate-300 md:text-base">
                Create teams, assign members, and manage team operations in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {msg.text && (
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
        )}

        {/* Create Team */}
        <form
          onSubmit={createTeam}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                New Team Name
              </label>
              <input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Design Squad"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Create Team
              </button>

              <button
                type="button"
                onClick={loadAll}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </form>

        {/* Teams Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-700" />
              <span className="text-sm font-bold text-slate-900">Teams List</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              {teams.length} Total
            </span>
          </div>

          <div className="border-b border-slate-200 px-6 py-4">
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
              Search Team
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Type team name..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Team Name
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Team Head
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Department
                  </th>
                  <th className="px-5 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Members
                  </th>
                  <th className="px-5 py-4 text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
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
                    <tr key={team._id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm font-bold text-slate-900">{team.name}</td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700">{headLabel}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        <div className="max-w-[420px] truncate" title={deptLabel}>
                          {deptLabel}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {memberCount}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            // onClick={() => navigate(`/teams/${team._id}`)}
                            onClick={() => navigate(`/admin/create-team-head/${team._id}`)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                          >
                            <Users className="h-4 w-4" />
                            Manage
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteTeam(team._id)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredTeams.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm font-medium text-slate-500"
                    >
                      No teams match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamHeadPage;