import React, { useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ManagerDashboard from '../manager/ManagerDashboard';
import { ShieldCheck } from 'lucide-react';

/**
 * Team head dashboard shares the same data source as ManagerDashboard
 * (API scope is enforced by backend for TeamHead).
 * This wrapper simply adds a top context banner for the team head.
 */
const TeamHeadDashboard = () => {
  const { user } = useContext(AuthContext);

  const teamLabel = useMemo(() => {
    const name = user?.teamName ? String(user.teamName) : '';
    return name ? `Team: ${name}` : 'Team head access';
  }, [user?.teamName]);

  return (
    <div>
      <div className="mb-6 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-indigo-600">
              Team head
            </p>
            <p className="mt-1 text-lg font-black text-slate-900">{teamLabel}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              You can mark attendance and view reports for your assigned team only.
            </p>
          </div>
          <div className="shrink-0 p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      <ManagerDashboard />
    </div>
  );
};

export default TeamHeadDashboard;

