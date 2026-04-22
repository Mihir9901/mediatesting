import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { 
    Key, Plus, Loader2, AlertCircle, User, Lock, 
    Globe, Eye, EyeOff, Edit2, Check, ChevronDown, 
    ShieldCheck, X, Trash2, Copy, Users, Settings
} from 'lucide-react';

const KHIAccountManagement = () => {
    const [accounts, setAccounts] = useState([]);
    const [managerAccounts, setManagerAccounts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const roleDropdownRef = useRef(null);
    const userDropdownRef = useRef(null);

    const roles = ['Admin', 'Manager', 'TeamHead', 'User'];

    const [formData, setFormData] = useState({
        platformName: '', 
        username: '', 
        password: '', 
        apiDetails: '',
        allowedRoles: [],
        allowedUsers: [] 
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchAccounts();
        fetchUsers();
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) setShowRoleDropdown(false);
            if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) setShowUserDropdown(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/khi-accounts');
            // Handle both old array format and new split format
            if (Array.isArray(res.data)) {
                setAccounts(res.data);
            } else {
                setAccounts(res.data.adminAccounts || []);
                setManagerAccounts(res.data.managerAccounts || []);
            }
        } catch (err) {
            setError('Failed to fetch accounts');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/all-shareable-users');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
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
            const res = await api.post('/admin/khi-accounts', formData);
            setAccounts([res.data.account, ...accounts]);
            setFormData({ platformName: '', username: '', password: '', apiDetails: '', allowedRoles: [], allowedUsers: [] });
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
            const res = await api.patch(`/admin/khi-accounts/${id}/toggle`);
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
            const res = await api.put(`/admin/khi-accounts/${editingAccount._id}`, editingAccount);
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

    const handleDelete = async (id, isManagerAccount = false) => {
        if (!window.confirm('Are you sure you want to permanently delete this credential?')) return;
        try {
            setActionLoading(true);
            await api.delete(`/admin/khi-accounts/${id}`);
            if (isManagerAccount) {
                setManagerAccounts(managerAccounts.filter(acc => acc._id !== id));
            } else {
                setAccounts(accounts.filter(acc => acc._id !== id));
            }
            setSuccess('Credential deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete account');
        } finally {
            setActionLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSuccess('Copied to clipboard!');
        setTimeout(() => setSuccess(''), 2000);
    };

    const handleRoleToggle = (role, isEditing = false) => {
        const target = isEditing ? editingAccount : formData;
        const setTarget = isEditing ? setEditingAccount : setFormData;
        const current = target.allowedRoles;
        if (current.includes(role)) {
            setTarget({ ...target, allowedRoles: current.filter(r => r !== role) });
        } else {
            setTarget({ ...target, allowedRoles: [...current, role] });
        }
    };

    const handleUserToggle = (userId, isEditing = false) => {
        const target = isEditing ? editingAccount : formData;
        const setTarget = isEditing ? setEditingAccount : setFormData;
        const current = target.allowedUsers;
        
        // Extract IDs if populated
        const currentIds = current.map(u => typeof u === 'object' ? u._id : u);
        
        if (currentIds.includes(userId)) {
            setTarget({ ...target, allowedUsers: current.filter(u => (typeof u === 'object' ? u._id : u) !== userId) });
        } else {
            setTarget({ ...target, allowedUsers: [...current, userId] });
        }
    };

    return (
        <div className="pt-2 px-4 md:px-6 max-w-6xl mx-auto space-y-6 font-sans">
            <header className="flex items-center justify-between py-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">G-Accounts Management</h1>
                    <p className="text-sm text-slate-500">Securely share and manage API & Platform credentials</p>
                </div>
                <div className="bg-indigo-50 p-2 rounded-2xl">
                    <Key className="w-8 h-8 text-indigo-600" />
                </div>
            </header>

            {success && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <Check className="w-5 h-5" /> {success}
                </div>
            )}

            {error && (
                <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
            )}

            {/* CREATE FORM */}
            <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-visible transition-all hover:shadow-2xl hover:shadow-indigo-100/50">
                <div className="bg-slate-900 p-5 rounded-t-3xl flex items-center justify-between">
                    <h2 className="text-white font-bold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-indigo-400" /> Add New Credentials
                    </h2>
                </div>

                <form onSubmit={handleCreateSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Platform Name</label>
                            <div className="relative group">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input 
                                    type="text" required className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all" 
                                    placeholder="e.g. Google Cloud, Meta API" 
                                    value={formData.platformName} onChange={(e) => setFormData({...formData, platformName: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Username / ID</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input 
                                    type="text" required className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all" 
                                    placeholder="Account email or username" 
                                    value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input 
                                    type={showPassword ? "text" : "password"} required className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all" 
                                    placeholder="••••••••" 
                                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">API Details / Extra Info</label>
                            <textarea 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all min-h-[100px]" 
                                placeholder="Paste API keys, secret tokens, or usage instructions here..." 
                                value={formData.apiDetails} onChange={(e) => setFormData({...formData, apiDetails: e.target.value})} 
                            />
                        </div>

                        {/* ROLES SELECT */}
                        <div className="space-y-2 relative" ref={roleDropdownRef}>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Share with Roles</label>
                            <div 
                                onClick={() => setShowRoleDropdown(!showRoleDropdown)} 
                                className="w-full min-h-[50px] relative bg-slate-50 border border-slate-200 rounded-xl cursor-pointer flex flex-wrap items-center px-4 py-2 gap-2"
                            >
                                {formData.allowedRoles.length === 0 ? <span className="text-slate-400 text-sm">Select Roles...</span> : 
                                    formData.allowedRoles.map(r => (
                                        <span key={r} className="bg-indigo-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                            {r} <X className="w-3 h-3" onClick={(e) => { e.stopPropagation(); handleRoleToggle(r); }} />
                                        </span>
                                    ))
                                }
                                <ChevronDown className="ml-auto w-4 h-4 text-slate-400" />
                            </div>
                            {showRoleDropdown && (
                                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 max-h-48 overflow-y-auto">
                                    {roles.map(r => (
                                        <div key={r} onClick={() => handleRoleToggle(r)} className="flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl cursor-pointer">
                                            <div className={`w-4 h-4 border rounded ${formData.allowedRoles.includes(r) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                {formData.allowedRoles.includes(r) && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{r}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* USERS SELECT */}
                        <div className="space-y-2 relative md:col-span-1 lg:col-span-2" ref={userDropdownRef}>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Share with Specific Users</label>
                            <div 
                                onClick={() => {
                                    if (!showUserDropdown) fetchUsers();
                                    setShowUserDropdown(!showUserDropdown);
                                }} 
                                className="w-full min-h-[50px] relative bg-slate-50 border border-slate-200 rounded-xl cursor-pointer flex flex-wrap items-center px-4 py-2 gap-2"
                            >
                                {formData.allowedUsers.length === 0 ? <span className="text-slate-400 text-sm">Select Users...</span> : 
                                    formData.allowedUsers.map(u => {
                                        const uid = typeof u === 'object' ? u._id : u;
                                        return (
                                            <span key={uid} className="bg-slate-800 text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                                {users.find(user => user._id === uid)?.name || 'User'} <X className="w-3 h-3" onClick={(e) => { e.stopPropagation(); handleUserToggle(uid); }} />
                                            </span>
                                        );
                                    })
                                }
                                <ChevronDown className="ml-auto w-4 h-4 text-slate-400" />
                            </div>
                            {showUserDropdown && (
                                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 max-h-80 overflow-y-auto custom-scrollbar">
                                    {users.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mx-auto mb-2" />
                                            <p className="text-xs text-slate-400">Loading users from database...</p>
                                        </div>
                                    ) : (
                                        ['Manager', 'TeamHead', 'User'].map(roleGroup => {
                                            const groupUsers = users.filter(u => u.role === roleGroup);
                                            if (groupUsers.length === 0) return null;
                                            return (
                                                <div key={roleGroup} className="mb-2">
                                                    <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 rounded-lg mb-1">
                                                        {roleGroup === 'User' ? 'Dept Leads' : roleGroup === 'TeamHead' ? 'Team Heads' : roleGroup + 's'} ({groupUsers.length})
                                                    </div>
                                                    {groupUsers.map(user => {
                                                        const isSelected = formData.allowedUsers.some(u => (typeof u === 'object' ? u._id : u) === user._id);
                                                        return (
                                                            <div key={user._id} onClick={() => handleUserToggle(user._id)} className="flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors">
                                                                <div className={`w-4 h-4 border rounded ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm font-bold text-slate-700 truncate">{user.name}</div>
                                                                    <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <button 
                        type="submit" disabled={actionLoading} 
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                    >
                        {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                        {actionLoading ? 'Saving...' : 'Create & Assign Account'}
                    </button>
                </form>
            </section>

            {/* ACCOUNTS LIST */}
            <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-600" /> Active Credentials
                    </h3>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                        {accounts.length} Accounts
                    </span>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" /></div>
                    ) : accounts.length === 0 ? (
                        <div className="p-20 text-center text-slate-400">No accounts found. Use the form above to add one.</div>
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
                                    <tr key={acc._id} className="hover:bg-indigo-50/30 transition-colors group">
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
                                                <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono text-slate-600 select-all max-w-[150px] truncate">
                                                    {acc.password.replace(/./g, '*')}
                                                </div>
                                                <button onClick={() => copyToClipboard(acc.password)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {acc.allowedRoles.map(r => (
                                                    <span key={r} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[9px] font-bold uppercase border border-indigo-100">{r}</span>
                                                ))}
                                                {acc.allowedUsers?.length > 0 && (
                                                    <span className="px-2 py-0.5 bg-slate-800 text-white rounded-md text-[9px] font-bold uppercase">+{acc.allowedUsers.length} Users</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col items-center gap-1">
                                                <button 
                                                    onClick={() => toggleAccountStatus(acc._id)}
                                                    className={`w-10 h-5 rounded-full relative transition-all ${acc.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-0.5 ${acc.isActive ? 'right-0.5' : 'left-0.5'} w-4 h-4 bg-white rounded-full transition-all`} />
                                                </button>
                                                <span className={`text-[8px] font-black uppercase ${acc.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {acc.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => { setEditingAccount(acc); setIsEditModalOpen(true); }}
                                                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm active:scale-90"
                                                    title="Edit"
                                                >
                                                    <Settings className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(acc._id, false)}
                                                    disabled={actionLoading}
                                                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm active:scale-90 disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
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

            {/* MANAGER-SHARED CREDENTIALS - READ ONLY VIEW */}
            {managerAccounts.length > 0 && (
                <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-600" /> Manager-Shared Credentials
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Credentials that Managers have shared with their Team Heads</p>
                        </div>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                            {managerAccounts.length} Accounts
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="p-5">Platform</th>
                                    <th className="p-5">Shared By (Manager)</th>
                                    <th className="p-5">Shared With (Team Heads)</th>
                                    <th className="p-5 text-center">Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {managerAccounts.map(acc => (
                                    <tr key={acc._id} className="hover:bg-purple-50/20 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-base shadow-md shadow-purple-100 shrink-0">
                                                    {acc.platformName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{acc.platformName}</div>
                                                    <div className="text-[10px] text-slate-400">{acc.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            {acc.createdByManager ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                                                        {acc.createdByManager.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-700">{acc.createdByManager.name}</div>
                                                        <div className="text-[10px] text-slate-400">{acc.createdByManager.email}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Unknown Manager</span>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-wrap gap-1 max-w-[250px]">
                                                {acc.allowedUsers?.length > 0 ? acc.allowedUsers.map(u => (
                                                    <span key={typeof u === 'object' ? u._id : u} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[9px] font-bold border border-indigo-100">
                                                        {typeof u === 'object' ? u.name : 'TeamHead'}
                                                    </span>
                                                )) : (
                                                    <span className="text-[10px] text-slate-400 italic">Not shared with anyone</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide ${acc.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                                                {acc.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button
                                                onClick={() => handleDelete(acc._id, true)}
                                                disabled={actionLoading}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm active:scale-90 disabled:opacity-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* EDIT MODAL */}
            {isEditModalOpen && editingAccount && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !actionLoading && setIsEditModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
                            <div>
                                <h2 className="font-black text-2xl uppercase tracking-tighter">Edit Account Details</h2>
                                <p className="text-slate-400 text-xs">{editingAccount.platformName}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Platform</label>
                                    <input type="text" value={editingAccount.platformName} onChange={(e) => setEditingAccount({...editingAccount, platformName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Username</label>
                                    <input type="text" value={editingAccount.username} onChange={(e) => setEditingAccount({...editingAccount, username: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 outline-none" />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Password</label>
                                    <input type="password" value={editingAccount.password} onChange={(e) => setEditingAccount({...editingAccount, password: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 outline-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Assigned Roles</label>
                                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    {roles.map(r => (
                                        <button key={r} onClick={() => handleRoleToggle(r, true)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${editingAccount.allowedRoles.includes(r) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300'}`}>
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Specific Users</label>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-h-60 overflow-y-auto custom-scrollbar" onMouseEnter={() => fetchUsers()}>
                                    {['Manager', 'TeamHead', 'User'].map(roleGroup => {
                                        const groupUsers = users.filter(u => u.role === roleGroup);
                                        if (groupUsers.length === 0) return null;
                                        return (
                                            <div key={roleGroup} className="mb-4 last:mb-0">
                                                <div className="px-2 py-1 text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 w-fit">
                                                    {roleGroup === 'User' ? 'Dept Leads' : roleGroup + 's'}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {groupUsers.map(user => {
                                                        const isSelected = editingAccount.allowedUsers.some(u => (typeof u === 'object' ? u._id : u) === user._id);
                                                        return (
                                                            <div key={user._id} onClick={() => handleUserToggle(user._id, true)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-indigo-100 border border-indigo-200 shadow-sm' : 'bg-white border border-slate-200 hover:border-indigo-300'}`}>
                                                                <div className={`w-4 h-4 rounded-full border-2 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 scale-110 shadow-indigo-100 shadow-sm' : 'bg-white border-slate-200'}`} />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-[11px] font-bold text-slate-700 truncate">{user.name}</div>
                                                                    <div className="text-[9px] text-slate-400 truncate">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
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

export default KHIAccountManagement;
