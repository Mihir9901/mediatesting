import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Key, Loader2, AlertCircle, User, Lock, 
    Globe, Eye, EyeOff, Check, Copy, Info
} from 'lucide-react';

const ViewKHIAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({});
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyAccounts();
    }, []);

    const fetchMyAccounts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/khi-accounts/my-accounts');
            setAccounts(res.data);
        } catch (err) {
            setError('Failed to fetch assigned accounts');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setSuccess(`${field} copied to clipboard!`);
        setTimeout(() => setSuccess(''), 2000);
    };

    const togglePasswordVisibility = (id) => {
        setShowPassword(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Key className="absolute inset-0 m-auto w-5 h-5 text-indigo-600 animate-pulse" />
                </div>
                <p className="text-slate-500 font-medium animate-pulse">Unlocking your credentials...</p>
            </div>
        );
    }

    return (
        <div className="pt-2 px-4 md:px-6 max-w-6xl mx-auto space-y-6 font-sans">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        G-Accounts <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Authorized Access</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Below are the platform credentials assigned to your account.</p>
                </div>
                {success && (
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs font-bold animate-in fade-in zoom-in">
                        <Check className="w-4 h-4" /> {success}
                    </div>
                )}
            </header>

            {error && (
                <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-100 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
            )}

            {accounts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 text-center flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                        <Lock className="w-8 h-8 text-slate-300" />
                    </div>
                    <div>
                        <h2 className="text-slate-800 font-bold">No Accounts Assigned</h2>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">Your administrator hasn't shared any platform credentials with you yet.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map(acc => (
                        <div key={acc._id} className="group bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 overflow-hidden flex flex-col">
                            <div className="p-6 space-y-4 flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-slate-50">
                                            {acc.platformName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{acc.platformName}</h3>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Credential Set</span>
                                        </div>
                                    </div>
                                    <div className="bg-indigo-50 p-2 rounded-xl group-hover:scale-110 transition-transform">
                                        <Globe className="w-4 h-4 text-indigo-600" />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Login Identity</label>
                                        <div className="relative group/field">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover/field:text-indigo-500 transition-colors" />
                                            <div className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 truncate">
                                                {acc.username}
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(acc.username, 'Username')}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Security Key</label>
                                        <div className="relative group/field">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover/field:text-indigo-500 transition-colors" />
                                            <input 
                                                type={showPassword[acc._id] ? "text" : "password"}
                                                readOnly
                                                value={acc.password}
                                                className="w-full pl-9 pr-16 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono font-bold text-indigo-600 focus:outline-none"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                                                <button 
                                                    onClick={() => togglePasswordVisibility(acc._id)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                                                >
                                                    {showPassword[acc._id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                                <button 
                                                    onClick={() => copyToClipboard(acc.password, 'Password')}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {acc.apiDetails && (
                                    <div className="pt-2 border-t border-slate-50">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                                            <Info className="w-3 h-3" /> API & Extra Metadata
                                        </label>
                                        <div className="mt-1.5 p-3 bg-indigo-50/50 rounded-2xl text-[11px] text-slate-600 whitespace-pre-wrap font-medium border border-indigo-50">
                                            {acc.apiDetails}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Updated {new Date(acc.updatedAt).toLocaleDateString()}</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-[9px] font-black text-emerald-600 uppercase">Secure Connection</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <footer className="pt-10 pb-6 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Security Protocol v2.4 • Encrypted Channel Active</p>
            </footer>
        </div>
    );
};

export default ViewKHIAccounts;
