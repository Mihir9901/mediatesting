import React from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = React.useContext(AuthContext);
    const navigate = useNavigate();

    return (
        /* Height aligned with Sidebar logo area (h-32) */
        <nav className="h-28 md:h-32 flex items-center justify-between px-5 sm:px-8 lg:px-10 bg-white/55 backdrop-blur-xl border-b border-slate-200/70 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar} 
                    className="lg:hidden p-3 text-slate-700 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
                >
                    <Menu className="w-6 h-6" />
                </button>
                
                {/* Updated Welcome Section */}
                <div className="hidden md:block">
                    <h2 className="text-xl font-bold text-slate-800">
                        Hi, <span className="text-indigo-700">{user?.name || 'User'}</span>
                    </h2>
                    {/* font-black removed to keep text normal weight */}
                    <p className="text-[11px] font-semibold text-slate-500">
                        {user?.role === 'Admin'
                          ? 'Manage people, teams and reporting'
                          : user?.role === 'TeamHead'
                            ? 'Mark attendance for your team'
                            : 'Track attendance and performance'}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                {/* Profile Widget */}
                <div className="flex items-center gap-3 bg-white p-2 pr-5 rounded-[1.5rem] shadow-sm border border-slate-200 group hover:border-indigo-200 transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/15">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-sm font-bold text-slate-800">{user?.name}</span>
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider opacity-80">{user?.role}</span>
                    </div>
                </div>

                {/* Logout Action */}
                <button 
                    onClick={() => { logout(); navigate('/'); }} 
                    className="p-3.5 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl shadow-sm border border-slate-200 transition-all active:scale-95"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;