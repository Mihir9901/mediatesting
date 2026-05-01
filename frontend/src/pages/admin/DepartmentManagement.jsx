import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Building2,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Layers3,
  FolderKanban,
} from 'lucide-react';

const DepartmentManagement = () => {
  const [departmentName, setDepartmentName] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDepartments = async () => {
    setFetching(true);
    setError('');

    try {
      const res = await api.get('/admin/all-departments');
      setDepartments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to load departments.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();

    if (!departmentName.trim()) {
      setError('Please enter department name.');
      setSuccess('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await api.post('/admin/create-department', {
        departmentName: departmentName.trim(),
      });

      setSuccess('Department created successfully.');
      setDepartmentName('');
      fetchDepartments();
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to create department.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] p-3 md:p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-6 md:px-7 py-7 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] font-black text-indigo-200">
                Admin Console
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-black text-white tracking-tight">
                Department management
              </h1>
              <p className="mt-2 text-sm font-medium text-indigo-100">
                Create and manage departments before assigning managers.
              </p>
            </div>

            <button
              onClick={fetchDepartments}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 px-5 py-3 text-sm font-bold text-white transition"
            >
              <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 flex items-center gap-2 text-sm font-semibold">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Create Department */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">Create New Department</h2>
                <p className="text-sm text-slate-500 font-medium">
                  Add departments for manager access and team assignments
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateDepartment} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Department Name
                </label>

                <div className="h-16 rounded-2xl border border-slate-200 bg-slate-50 px-4 flex items-center gap-3 focus-within:border-indigo-500 focus-within:bg-white transition">
                  <FolderKanban className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="Enter department name..."
                    className="w-full bg-transparent outline-none text-[17px] font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-16 mt-[30px] px-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-70 text-white font-bold text-base shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                {loading ? 'Creating...' : 'Create Department'}
              </button>
            </div>
          </form>
        </div>

        {/* Department List */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Layers3 className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">Available Departments</h2>
                <p className="text-sm text-slate-500 font-medium">
                  Total departments available for assignment
                </p>
              </div>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 text-sm font-bold">
              {departments.length} Total
            </div>
          </div>

          <div className="p-6">
            {fetching ? (
              <div className="h-40 flex items-center justify-center text-slate-500 text-sm font-medium">
                Loading departments...
              </div>
            ) : departments.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <Building2 className="w-6 h-6" />
                </div>
                <p className="text-base font-bold text-slate-700">No departments found</p>
                <p className="text-sm text-slate-500 mt-1">
                  Create your first department to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {departments.map((dept) => (
                  <div
                    key={dept._id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200 px-4 py-4 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">{dept.departmentName}</p>
                        <p className="text-xs text-slate-500 font-medium">Department</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagement;