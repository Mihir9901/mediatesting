import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, UserRound, FileSpreadsheet, CalendarCheck, ClipboardList, UserCog, UserCheck, CalendarClock, Shield, Key } from 'lucide-react';
import graphuraLogo from '../assets/logos/nav-bar-graphura.jpeg';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user } = React.useContext(AuthContext);
    const location = useLocation();

    if (!user) return null;

    const links =
        user.role === 'Admin'
            ? [
                  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
                  { path: '/admin/managers', label: 'Managers', icon: UserRound },
                  { path: '/admin/team-heads', label: 'Team Heads', icon: UserCheck },
                  { path: '/admin/upload', label: 'Upload Interns', icon: Users },
                  { path: '/admin/interns', label: 'Intern Details', icon: UserCog },
                  { path: '/admin/edit-attendance', label: 'Edit Attendance', icon: CalendarClock },
                  { path: '/admin/report', label: 'Reports', icon: FileSpreadsheet },
                  { path: '/admin/login-logs', label: 'Login Logs', icon: Shield },
                  { path: '/admin/khi-accounts', label: 'G-Accounts', icon: Key },
              ]
            : user.role === 'TeamHead'
              ? [
                    { path: '/team-head', label: 'Dashboard', icon: LayoutDashboard },
                    { path: '/team-head/mark-attendance', label: 'Attendance', icon: CalendarCheck },
                    { path: '/team-head/employees', label: 'Reports', icon: ClipboardList },
                    { path: '/team-head/khi-accounts', label: 'G-Accounts', icon: Key },
                ]
              : [
                    { path: '/manager', label: 'Dashboard', icon: LayoutDashboard },
                    { path: '/manager/mark-attendance', label: 'Attendance', icon: CalendarCheck },
                    { path: '/manager/employees', label: 'Department', icon: ClipboardList },
                    ...(user.managerAccount
                        ? [
                            { path: '/manager/teams', label: 'Teams', icon: Users },
                            { path: '/manager/khi-accounts', label: 'G-Accounts', icon: Key },
                          ]
                        : []),
                ];

    return (
        <>
            {isOpen && (
              <div
                className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px] z-[70] lg:hidden"
                onClick={toggleSidebar}
              />
            )}
            <aside
              className={`fixed lg:static top-0 left-0 z-[80] w-[280px] h-full text-white transition-transform duration-300 ${
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
              }`}
            >
              <div className="h-full bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-r border-white/10 shadow-[24px_0_80px_-36px_rgba(15,23,42,0.9)]">
                <div className="absolute inset-0 opacity-[0.06] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" aria-hidden />
                <div className="flex flex-col h-full">
                    {/* LOGO AREA: Top of sidebar */}
                    <div className="relative p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-center">
                            <div className="bg-white/95 p-2.5 rounded-2xl shadow-lg shadow-black/25 ring-1 ring-white/15">
                                <img src={graphuraLogo} alt="Graphura" className="h-10 w-auto object-contain" />
                            </div>
                        </div>
                        <div className="h-px bg-white/10" />
                    </div>

                    {/* Scrollable links area (prevents overflow on small heights) */}
                    <nav className="sidebar-scroll relative flex-1 px-3 pr-2 pb-6 space-y-1.5 overflow-y-auto overscroll-contain">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                  key={link.path}
                                  to={link.path}
                                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                  className={`group relative flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-all ${
                                    isActive
                                      ? 'bg-white/12 text-white ring-1 ring-white/15 shadow-[0_10px_28px_-18px_rgba(99,102,241,0.8)]'
                                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                                  }`}
                                >
                                  <span
                                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full transition ${
                                      isActive ? 'bg-indigo-400' : 'bg-transparent'
                                    }`}
                                    aria-hidden
                                  />
                                  <div
                                    className={`p-2 rounded-xl transition ${
                                      isActive
                                        ? 'bg-indigo-500/20 text-indigo-200'
                                        : 'bg-white/5 text-slate-300 group-hover:bg-white/8 group-hover:text-white'
                                    }`}
                                  >
                                    <Icon className="h-4.5 w-4.5" />
                                  </div>
                                  <span className="truncate">{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
              </div>
            </aside>

            <style
              dangerouslySetInnerHTML={{
                __html: `
                  /* Premium, subtle scrollbar for sidebar only */
                  .sidebar-scroll { scrollbar-gutter: stable; scrollbar-width: thin; scrollbar-color: rgba(99,102,241,0.38) transparent; }
                  .sidebar-scroll::-webkit-scrollbar { width: 10px; }
                  .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
                  .sidebar-scroll::-webkit-scrollbar-thumb {
                    background: rgba(148,163,184,0.18);
                    border-radius: 999px;
                    border: 3px solid transparent;
                    background-clip: content-box;
                  }
                  .sidebar-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(99,102,241,0.28);
                    border: 3px solid transparent;
                    background-clip: content-box;
                  }
                `,
              }}
            />
        </>
    );
};
export default Sidebar;