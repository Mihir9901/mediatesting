import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { 
    Trash2, X, User, 
    Search,
    Loader2,
    Pencil,
    Save,
    AlertCircle
} from 'lucide-react';

const InternDetails = () => {
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    
    // Search
    const [searchTerm, setSearchTerm] = useState('');
    const [tenureFilter, setTenureFilter] = useState('All'); // All | Active | Completed

    // Edit modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingIntern, setEditingIntern] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        contactNo: '',
        domain: '',
        departmentName: '',
        appliedDate: '',
        tenureMonths: '',
        tenureStatus: 'Active',
    });
    const [saving, setSaving] = useState(false);

    // Fetch interns and departments on component mount
    useEffect(() => {
        fetchInterns();
        fetchDepartments();
    }, []);

    const fetchInterns = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/employees');
            setInterns(res.data);
        } catch (err) {
            console.error('Failed to fetch interns:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/admin/all-departments');
            setDepartments(response.data);
        } catch (err) {
            console.error('Failed to fetch departments:', err);
        }
    };

    const handleDeleteClick = (id) => {
        setDeletingId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/admin/employees/${deletingId}`);
            setInterns(interns.filter(intern => intern._id !== deletingId));
            setShowDeleteModal(false);
            setDeletingId(null);
            setStatusMsg({ type: 'success', text: 'Intern deleted successfully.' });
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 2000);
        } catch (err) {
            console.error('Failed to delete intern:', err);
            setStatusMsg({ type: 'error', text: 'Failed to delete intern. Please try again.' });
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeletingId(null);
    };

    const openEdit = (intern) => {
        setEditingIntern(intern);
        setEditForm({
            name: intern.name || '',
            email: intern.email || '',
            contactNo: intern.contactNo || '',
            domain: intern.domain || '',
            departmentName: intern.departmentName || '',
            appliedDate: intern.appliedDate ? new Date(intern.appliedDate).toISOString().split('T')[0] : '',
            tenureMonths: intern.tenureMonths ?? '',
            tenureStatus: intern.tenureStatus || 'Active',
        });
        setShowEditModal(true);
        setStatusMsg({ type: '', text: '' });
    };

    const closeEdit = () => {
        setShowEditModal(false);
        setEditingIntern(null);
        setSaving(false);
    };

    const saveEdit = async () => {
        if (!editingIntern?._id) return;
        setSaving(true);
        setStatusMsg({ type: '', text: '' });
        try {
            const payload = {
                name: editForm.name.trim(),
                email: editForm.email.trim(),
                contactNo: editForm.contactNo.trim(),
                domain: editForm.domain.trim(),
                departmentName: editForm.departmentName.trim(),
                appliedDate: editForm.appliedDate || undefined,
                tenureMonths:
                    editForm.tenureMonths === '' || editForm.tenureMonths === null
                        ? undefined
                        : Number(editForm.tenureMonths),
                // Always send explicitly so backend can persist reliably
                tenureStatus: editForm.tenureStatus,
            };

            const res = await api.put(`/admin/employees/${editingIntern._id}`, payload);
            setInterns((prev) => prev.map((it) => (it._id === editingIntern._id ? res.data : it)));
            // Ensure list reflects latest server state (avoid stale UI)
            await fetchInterns();
            setStatusMsg({ type: 'success', text: 'Intern updated successfully.' });
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 2000);
            closeEdit();
        } catch (err) {
            console.error('Failed to update intern:', err);
            setStatusMsg({ type: 'error', text: err.response?.data?.msg || 'Failed to update intern.' });
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Memoize filtered interns to prevent recalculation on every render
    const filteredInterns = useMemo(() => {
        let list = interns;

        if (tenureFilter !== 'All') {
            list = list.filter((intern) => (intern.tenureStatus || 'Active') === tenureFilter);
        }

        if (!searchTerm) return list;
        const searchLower = searchTerm.toLowerCase();
        return list.filter(intern =>
            intern.name?.toLowerCase().includes(searchLower) ||
            intern.email?.toLowerCase().includes(searchLower) ||
            intern.contactNo?.toLowerCase().includes(searchLower) ||
            intern.domain?.toLowerCase().includes(searchLower) ||
            intern.employee_id?.toLowerCase().includes(searchLower)
        );
    }, [interns, searchTerm, tenureFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="pt-2 px-4 md:px-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Intern Details</h1>
                <p className="text-slate-500 text-xs font-normal">Manage and view all intern information</p>
            </div>

            {statusMsg.text && (
                <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold flex items-start gap-2 ${
                    statusMsg.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-rose-200 bg-rose-50 text-rose-800'
                }`}>
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <span>{statusMsg.text}</span>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search interns by name, email, department, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Tenure
                        </span>
                        <select
                            value={tenureFilter}
                            onChange={(e) => setTenureFilter(e.target.value)}
                            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="All">All</option>
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Full Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Contact No.</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Unique ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Joining Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Tenure</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredInterns.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <User className="w-12 h-12 text-slate-300 mb-3" />
                                            <p className="text-slate-500 font-medium">
                                                {searchTerm ? 'No interns found matching your search' : 'No interns found'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredInterns.map((intern, index) => (
                                    <tr key={intern._id} className={`hover:bg-slate-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-slate-1000">{intern.name || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-1000">{intern.email || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-1000">{intern.contactNo || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-1 py-0.5">
                                                {intern.domain || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-mono text-slate-600">{intern.employee_id || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-1000">{formatDate(intern.appliedDate)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                                                    (intern.tenureStatus || 'Active') === 'Completed'
                                                        ? 'bg-slate-200 text-slate-700'
                                                        : 'bg-emerald-100 text-emerald-700'
                                                }`}
                                            >
                                                {intern.tenureStatus || 'Active'}
                                            </span>
                                            {intern.tenureMonths ? (
                                                <span className="ml-2 text-xs font-semibold text-slate-500">
                                                    {intern.tenureMonths}m
                                                </span>
                                            ) : intern.tenureDays ? (
                                                <span className="ml-2 text-xs font-semibold text-slate-500">
                                                    {intern.tenureDays}d
                                                </span>
                                            ) : null}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEdit(intern)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(intern._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-white text-sm font-bold">Edit Intern</p>
                                <p className="text-slate-400 text-xs">{editingIntern?.employee_id || ''}</p>
                            </div>
                            <button
                                onClick={closeEdit}
                                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                                title="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Full name">
                                <input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                                />
                            </Field>
                            <Field label="Email">
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                                />
                            </Field>
                            <Field label="Contact no.">
                                <input
                                    value={editForm.contactNo}
                                    onChange={(e) => setEditForm((p) => ({ ...p, contactNo: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                                />
                            </Field>
                            <Field label="Domain">
                                <input
                                    value={editForm.domain}
                                    onChange={(e) => setEditForm((p) => ({ ...p, domain: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                                />
                            </Field>
                            <Field label="Department name">
                                <input
                                    value={editForm.departmentName}
                                    onChange={(e) => setEditForm((p) => ({ ...p, departmentName: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                                />
                            </Field>
                            <Field label="Joining date">
                                <input
                                    type="date"
                                    value={editForm.appliedDate}
                                    onChange={(e) => setEditForm((p) => ({ ...p, appliedDate: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                                />
                            </Field>
                            <Field label="Duration (months)">
                                <input
                                    type="number"
                                    min="1"
                                    value={editForm.tenureMonths}
                                    onChange={(e) => setEditForm((p) => ({ ...p, tenureMonths: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                                    placeholder="e.g. 3"
                                />
                            </Field>
                            <Field label="Tenure status">
                                <select
                                    value={editForm.tenureStatus}
                                    onChange={(e) => setEditForm((p) => ({ ...p, tenureStatus: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </Field>
                        </div>
                        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3 justify-end">
                            <button
                                onClick={closeEdit}
                                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-semibold text-sm transition-colors"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEdit}
                                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
                                disabled={saving}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
                                <Trash2 className="h-7 w-7 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Intern</h3>
                            <p className="text-slate-500 mb-6">
                                Are you sure you want to delete this information? This action cannot be undone.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <button
                                    onClick={cancelDelete}
                                    className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-medium text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium text-sm transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InternDetails;

function Field({ label, children }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">
                {label}
            </label>
            {children}
        </div>
    );
}
