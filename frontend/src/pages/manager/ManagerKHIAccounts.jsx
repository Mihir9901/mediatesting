import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { 
    Key, Plus, Loader2, AlertCircle, User, Lock, 
    Globe, Eye, EyeOff, Check, ChevronDown, 
    ShieldCheck, X, Copy, Users, Settings, Trash2
} from 'lucide-react';

const ManagerKHIAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [adminShared, setAdminShared] = useState([]);
    const [teamHeads, setTeamHeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const userDropdownRef = useRef(null);

    const [formData, setFormData] = useState({
        platformName: '', username: '', password: '', apiDetails: '',
        allowedUsers: []
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchAccounts();
        fetchTeamHeads();
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) setShowUserDropdown(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/manager/khi-accounts');
            setAccounts(res.data.ownAccounts || []);
            setAdminShared(res.data.adminShared || []);
        } catch (err) {
            setError('Failed to fetch accounts');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamHeads = async () => {
        try {
            const res = await api.get('/manager/khi-accounts/my-team-heads');
            setTeamHeads(res.data);
        } catch (err) {
            console.error('Failed to fetch team heads', err);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!formData.platformName || !formData.username || !formData.password) {
            setError('Platform, Username and Password are required');
            return;
        }
        setActionLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await api.post('/manager/khi-accounts', formData);
            setAccounts([res.data.account, ...accounts]);
            setFormData({ platformName: '', username: '', password: '', apiDetails: '', allowedUsers: [] });
            setSuccess('Account created successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account');
        } finally {
            setActionLoading(false);
        }
    };

    const toggleAccountStatus = async (id) => {
        try {
            setActionLoading(true);
            const res = await api.patch(`/manager/khi-accounts/${id}/toggle`);
            setAccounts(accounts.map(acc => acc._id === id ? { ...acc, isActive: res.data.account.isActive } : acc));
            setSuccess(res.data.message);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to toggle status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingAccount) return;
        setActionLoading(true);
        try {
            const res = await api.put(`/manager/khi-accounts/${editingAccount._id}`, editingAccount);
            setAccounts(accounts.map(acc => acc._id === editingAccount._id ? res.data.account : acc));
            setIsEditModalOpen(false);
            setSuccess('Account updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update account');
        } finally {
            setActionLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSuccess('Copied to clipboard!');
        setTimeout(() => setSuccess(''), 2000);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this credential? This cannot be undone.')) return;
        try {
            setActionLoading(true);
            await api.delete(`/manager/khi-accounts/${id}`);
            setAccounts(accounts.filter(acc => acc._id !== id));
            setSuccess('Credential deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete account');
        } finally {
            setActionLoading(false);
            setDeletingId(null);
        }
    };

    const handleUserToggle = (userId, isEditing = false) => {
        const target = isEditing ? editingAccount : formData;
        const setTarget = isEditing ? setEditingAccount : setFormData;
        const current = target.allowedUsers;
        const currentIds = current.map(u => typeof u === 'object' ? u._id : u);
        if (currentIds.includes(userId)) {
            setTarget({ ...target, allowedUsers: current.filter(u => (typeof u === 'object' ? u._id : u) !== userId) });
        } else {
            setTarget({ ...target, allowedUsers: [...current, userId] });
        }
    };

    return (
        <div className="pt-2 px-4 md:px-6 max-w-6xl mx-auto space-y-6 font-sans">

            {/* HEADER */}
            <header className="flex items-center justify-between py-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">G-Accounts</h1>
                    <p className="text-sm text-slate-500">Share and view platform credentials</p>
                </div>
                <div className="bg-indigo-50 p-2 rounded-2xl">
                    <Key className="w-8 h-8 text-indigo-600" />
                </div>
            </header>

            {/* SUCCESS / ERROR ALERTS */}
            {success && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-200 flex items-center gap-3">
                    <Check className="w-5 h-5 shrink-0" /> {success}
                </div>
            )}
            {error && (
                <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-200 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                    <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* ===================== CREATE FORM ===================== */}
            <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-visible">
                <div className="bg-slate-900 p-5 rounded-t-3xl">
                    <h2 className="text-white font-bold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-indigo-400" /> Share New Credentials
                    </h2>
                </div>

                <form onSubmit={handleCreateSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Platform Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Platform Name</label>
                            <div className="relative group">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input type="text" required className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all"
                                    placeholder="e.g. Google Cloud, Meta API"
                                    value={formData.platformName} onChange={(e) => setFormData({ ...formData, platformName: e.target.value })} />
                            </div>
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Username / ID</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input type="text" required className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all"
                                    placeholder="Account email or username"
                                    value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input type={showPassword ? 'text' : 'password'} required className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all"
                                    placeholder="••••••••"
                                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                                    {showPassword ? <Eye className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* API Details */}
                        <div className="md:col-span-2 lg:col-span-3 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">API Details / Extra Info</label>
                            <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all min-h-[100px]"
                                placeholder="Paste API keys, secret tokens, or usage instructions here..."
                                value={formData.apiDetails} onChange={(e) => setFormData({ ...formData, apiDetails: e.target.value })} />
                        </div>

                        {/* Team Heads Dropdown */}
                        <div className="space-y-2 relative md:col-span-2 lg:col-span-3" ref={userDropdownRef}>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Share with Team Heads</label>
                            <div onClick={() => { if (!showUserDropdown) fetchTeamHeads(); setShowUserDropdown(!showUserDropdown); }}
                                className="w-full min-h-[50px] relative bg-slate-50 border border-slate-200 rounded-xl cursor-pointer flex flex-wrap items-center px-4 py-2 gap-2">
                                {formData.allowedUsers.length === 0
                                    ? <span className="text-slate-400 text-sm">Select Team Heads...</span>
                                    : formData.allowedUsers.map(u => {
                                        const uid = typeof u === 'object' ? u._id : u;
                                        return (
                                            <span key={uid} className="bg-slate-800 text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                                {teamHeads.find(th => th._id === uid)?.name || 'User'}
                                                <X className="w-3 h-3" onClick={(e) => { e.stopPropagation(); handleUserToggle(uid); }} />
                                            </span>
                                        );
                                    })
                                }
                                <ChevronDown className="ml-auto w-4 h-4 text-slate-400" />
                            </div>

                            {showUserDropdown && (
                                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 max-h-80 overflow-y-auto">
                                    {teamHeads.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <Users className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                                            <p className="text-xs text-slate-400">No team heads assigned to your teams yet.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 rounded-lg mb-1">
                                                Your Team Heads ({teamHeads.length})
                                            </div>
                                            {teamHeads.map(th => {
                                                const isSelected = formData.allowedUsers.some(u => (typeof u === 'object' ? u._id : u) === th._id);
                                                return (
                                                    <div key={th._id} onClick={() => handleUserToggle(th._id)}
                                                        className="flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors">
                                                        <div className={`w-4 h-4 border rounded ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-bold text-slate-700 truncate">{th.name}</div>
                                                            <div className="text-[10px] text-slate-400 truncate">{th.email}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" disabled={actionLoading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50">
                        {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                        {actionLoading ? 'Saving...' : 'Share Credentials'}
                    </button>
                </form>
            </section>

            {/* ===================== OWN ACCOUNTS TABLE ===================== */}
            <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-600" /> Shared Credentials
                    </h3>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                        {accounts.length} Accounts
                    </span>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" /></div>
                    ) : accounts.length === 0 ? (
                        <div className="p-20 text-center text-slate-400">No credentials shared yet. Use the form above to share one.</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="p-6">Platform & User</th>
                                    <th className="p-6">Credentials</th>
                                    <th className="p-6">Shared With</th>
                                    <th className="p-6 text-center">Status</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {accounts.map(acc => (
                                    <tr key={acc._id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-100">
                                                    {acc.platformName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{acc.platformName}</div>
                                                    <div className="text-xs text-slate-400 flex items-center gap-1"><User className="w-3 h-3" /> {acc.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono text-slate-600 max-w-[150px] truncate">
                                                    {'●'.repeat(8)}
                                                </div>
                                                <button onClick={() => copyToClipboard(acc.password)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {acc.allowedUsers?.map(u => {
                                                    const name = typeof u === 'object' ? u.name : (teamHeads.find(th => th._id === u)?.name || 'User');
                                                    const key = typeof u === 'object' ? u._id : u;
                                                    return (
                                                        <span key={key} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[9px] font-bold border border-purple-100">
                                                            {name}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col items-center gap-1">
                                                <button onClick={() => toggleAccountStatus(acc._id)}
                                                    className={`w-10 h-5 rounded-full relative transition-all ${acc.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                    <div className={`absolute top-0.5 ${acc.isActive ? 'right-0.5' : 'left-0.5'} w-4 h-4 bg-white rounded-full transition-all`} />
                                                </button>
                                                <span className={`text-[8px] font-black uppercase ${acc.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {acc.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => { setEditingAccount(acc); setIsEditModalOpen(true); fetchTeamHeads(); }}
                                                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm active:scale-90"
                                                    title="Edit">
                                                    <Settings className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(acc._id)}
                                                    disabled={deletingId === acc._id || actionLoading}
                                                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm active:scale-90 disabled:opacity-50"
                                                    title="Delete">
                                                    {deletingId === acc._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* ===================== ADMIN SHARED - READ ONLY ===================== */}
            {adminShared.length > 0 && (
                <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-600" /> Shared by Admin
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Read-only credentials assigned to you by the Admin</p>
                        </div>
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                            {adminShared.length} Accounts
                        </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {adminShared.map(acc => (
                            <div key={acc._id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-indigo-50/20 transition-colors">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-100 shrink-0">
                                        {acc.platformName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{acc.platformName}</div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                            <User className="w-3 h-3" /> {acc.username}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Password:</span>
                                        <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono text-slate-600">{'●'.repeat(8)}</div>
                                        <button onClick={() => copyToClipboard(acc.password)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm" title="Copy password">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button onClick={() => copyToClipboard(acc.username)} className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                                        <Copy className="w-3 h-3" /> Username
                                    </button>
                                    {acc.apiDetails && (
                                        <button onClick={() => copyToClipboard(acc.apiDetails)} className="text-[10px] font-bold text-purple-600 flex items-center gap-1 bg-purple-50 px-2.5 py-1.5 rounded-lg hover:bg-purple-100 transition-colors">
                                            <Copy className="w-3 h-3" /> API Details
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ===================== EDIT MODAL ===================== */}
            {isEditModalOpen && editingAccount && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !actionLoading && setIsEditModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
                        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
                            <div>
                                <h2 className="font-black text-2xl uppercase tracking-tighter">Edit Credentials</h2>
                                <p className="text-slate-400 text-xs">{editingAccount.platformName}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Platform</label>
                                    <input type="text" value={editingAccount.platformName}
                                        onChange={(e) => setEditingAccount({ ...editingAccount, platformName: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Username</label>
                                    <input type="text" value={editingAccount.username}
                                        onChange={(e) => setEditingAccount({ ...editingAccount, username: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 outline-none" />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Password</label>
                                    <input type="password" value={editingAccount.password}
                                        onChange={(e) => setEditingAccount({ ...editingAccount, password: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 outline-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Assign Team Heads</label>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-h-60 overflow-y-auto">
                                    {teamHeads.length === 0 ? (
                                        <p className="text-xs text-slate-400 text-center py-4">No team heads assigned to your teams.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {teamHeads.map(th => {
                                                const isSelected = editingAccount.allowedUsers.some(u => (typeof u === 'object' ? u._id : u) === th._id);
                                                return (
                                                    <div key={th._id} onClick={() => handleUserToggle(th._id, true)}
                                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-indigo-100 border border-indigo-200 shadow-sm' : 'bg-white border border-slate-200 hover:border-indigo-300'}`}>
                                                        <div className={`w-4 h-4 rounded-full border-2 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 scale-110' : 'bg-white border-slate-200'}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[11px] font-bold text-slate-700 truncate">{th.name}</div>
                                                            <div className="text-[9px] text-slate-400 truncate">{th.email}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50 flex gap-4 justify-end border-t border-slate-100">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-8 py-3 bg-white text-slate-500 rounded-2xl font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-all">Discard</button>
                            <button onClick={handleUpdate} disabled={actionLoading} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center gap-2">
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Save Updates
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ManagerKHIAccounts;
