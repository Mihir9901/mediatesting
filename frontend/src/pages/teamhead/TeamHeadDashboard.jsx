import React, { useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ManagerDashboard from '../manager/ManagerDashboard';
import { CalendarRange, ShieldCheck, UserCheck, Users, ClipboardCheck } from 'lucide-react';

const TeamHeadDashboard = () => {
  const { user } = useContext(AuthContext);

  const teamName = useMemo(() => {
    const name = user?.teamName ? String(user.teamName).trim() : '';
    return name || 'Assigned Team';
  }, [user?.teamName]);

  const teamHeadName = user?.name || 'Team Head';

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative grid gap-5 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
              Team Head Workspace
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Attendance control for {teamName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
              Mark attendance and review reports for your assigned team. The original dashboard
              date range controls stay active in the dashboard panel below.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-600 p-2.5 text-white">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Scope
                  </p>
                  <p className="text-sm font-black text-slate-900">Assigned team only</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-900 p-2.5 text-white">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Team Head
                  </p>
                  <p className="text-sm font-black text-slate-900">{teamHeadName}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-400 p-2.5 text-slate-950">
                  <CalendarRange className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Date Range
                  </p>
                  <p className="text-sm font-black text-slate-900">Available below</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-600 p-2.5 text-white">
                  <ClipboardCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Self Attendance
                  </p>
                  <p className="text-sm font-black text-slate-900">{teamHeadName}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Marked from the Team Head attendance workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/70 p-3 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
        <ManagerDashboard />
      </section>
    </div>
  );
};

export default TeamHeadDashboard;
