// import React, { useEffect, useState } from 'react';
// import api from '../../services/api';
// import { Loader2, AlertCircle, UserCheck, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const TeamHeadManagement = () => {
//   const navigate = useNavigate();
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const fetchData = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await api.get('/admin/team-heads');
//       setItems(res.data || []);
//     } catch (e) {
//       const status = e.response?.status;
//       if (status === 401 || status === 403) {
//         setError('Session expired or access denied. Please login again.');
//         setTimeout(() => navigate('/admin-login'), 800);
//       } else if (e.code === 'ERR_NETWORK' || e.message === 'Network Error') {
//         setError('Network error: cannot reach server.');
//       } else {
//         setError(
//           e.response?.data?.message ||
//             e.response?.data?.msg ||
//             (status ? `Failed to load team heads (HTTP ${status}).` : 'Failed to load team heads.')
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const toggleStatus = async (id) => {
//     setActionLoading(true);
//     setError('');
//     setSuccess('');
//     try {
//       const res = await api.patch(`/admin/team-heads/${id}/toggle`);
//       setItems((prev) =>
//         prev.map((u) => (u._id === id ? { ...u, isActive: res.data.isActive } : u))
//       );
//       setSuccess(`Team head ${res.data.isActive ? 'activated' : 'deactivated'} successfully.`);
//       setTimeout(() => setSuccess(''), 2500);
//     } catch (e) {
//       const status = e.response?.status;
//       if (status === 401 || status === 403) {
//         setError('Session expired or access denied. Please login again.');
//         setTimeout(() => navigate('/admin-login'), 800);
//       } else if (e.code === 'ERR_NETWORK' || e.message === 'Network Error') {
//         setError('Network error: cannot reach server.');
//       } else {
//         setError(
//           e.response?.data?.message ||
//             e.response?.data?.msg ||
//             (status ? `Failed to update status (HTTP ${status}).` : 'Failed to update status.')
//         );
//       }
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[420px] text-slate-500 gap-2">
//         <Loader2 className="w-6 h-6 animate-spin" />
//         Loading team heads…
//       </div>
//     );
//   }

//   return (
//     <div className="pt-2 px-4 md:px-6 max-w-6xl mx-auto space-y-6">
//       <div className="flex items-end justify-between gap-4 flex-wrap">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team heads</h1>
//           <p className="text-slate-500 text-xs font-normal">
//             View all team head accounts and activate/deactivate access.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={fetchData}
//           className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
//         >
//           <RefreshCw className="w-4 h-4" />
//           Refresh
//         </button>
//       </div>

//       {error && (
//         <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 text-sm font-semibold flex items-start gap-2">
//           <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
//           <span>{error}</span>
//         </div>
//       )}
//       {success && (
//         <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm font-semibold">
//           {success}
//         </div>
//       )}

//       <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
//         <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
//           <h2 className="text-white text-sm font-bold flex items-center gap-2">
//             <UserCheck className="w-4 h-4 text-indigo-400" /> Accounts
//           </h2>
//           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
//             {items.length} total
//           </span>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-200">
//                 <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
//                   Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
//                   Email
//                 </th>
//                 <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
//                   Team
//                 </th>
//                 <th className="px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-right text-[11px] font-black uppercase tracking-widest text-slate-500">
//                   Action
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {items.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
//                     No team head accounts found.
//                   </td>
//                 </tr>
//               ) : (
//                 items.map((u, idx) => (
//                   <tr
//                     key={u._id}
//                     className={`hover:bg-slate-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
//                   >
//                     <td className="px-6 py-4 text-sm font-semibold text-slate-900">{u.name}</td>
//                     <td className="px-6 py-4 text-sm text-slate-700">{u.email}</td>
//                     <td className="px-6 py-4 text-sm text-slate-700">{u.teamName || '—'}</td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
//                           u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
//                         }`}
//                       >
//                         {u.isActive ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <button
//                         type="button"
//                         onClick={() => toggleStatus(u._id)}
//                         disabled={actionLoading}
//                         className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
//                       >
//                         {u.isActive ? (
//                           <ToggleRight className="w-4 h-4 text-emerald-600" />
//                         ) : (
//                           <ToggleLeft className="w-4 h-4 text-slate-500" />
//                         )}
//                         {u.isActive ? 'Deactivate' : 'Activate'}
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TeamHeadManagement;



import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Loader2,
  AlertCircle,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Shield,
  Users,
} from 'lucide-react';
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
      <div className="min-h-[420px] flex items-center justify-center text-slate-500 gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="font-medium">Loading team heads…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-6 md:px-8 py-7 shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_35%)]" />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-200">
                Admin Console
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-black text-white tracking-tight">
                Team Heads
              </h1>
              <p className="mt-2 text-sm font-medium text-indigo-100">
                View all team head accounts and manage activation access.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white">
                <p className="text-xs font-semibold text-indigo-100">Total Team Heads</p>
                <p className="text-2xl font-black">{items.length}</p>
              </div>

              <button
                type="button"
                onClick={fetchData}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 px-5 py-3 text-white text-sm font-bold transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-semibold flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm font-semibold">
            {success}
          </div>
        )}

        {/* Table Card */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Team Head Accounts</h2>
                <p className="text-sm text-slate-500">Manage account status and access</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-3 py-2">
              <Shield className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {items.length} Total
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4 text-left">Profile</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Assigned Team</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                          <Users className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium">No team head accounts found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                            {u.name?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-500">Team Head</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-700">{u.email}</td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 text-xs font-semibold">
                          {u.teamName || '—'}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                            u.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => toggleStatus(u._id)}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 transition disabled:opacity-60"
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
        </section>
      </div>
    </div>
  );
};

export default TeamHeadManagement;
