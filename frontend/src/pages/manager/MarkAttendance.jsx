import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import api from '../../services/api'; 
import { AuthContext } from '../../context/AuthContext'; 
import { Calendar, Building2, CheckCircle, AlertCircle, User, MessageSquare, Search, Mail, Hash, CheckSquare, Square } from 'lucide-react';

// Custom debounce hook for search optimization
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const MarkAttendance = () => {
    const { user } = useContext(AuthContext);

    const [employees, setEmployees] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState({});
    const [remarks, setRemarks] = useState({});
    const [taskDescriptions, setTaskDescriptions] = useState({});
    // Date is server-controlled for marking attendance (prevents manual changes)
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    const [selectedDomain, setSelectedDomain] = useState('All');
    const [domains, setDomains] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectEmployeesForEmail, setSelectEmployeesForEmail] = useState(false);
    const [selectedEmployeesForEmail, setSelectedEmployeesForEmail] = useState([]);

    // Debounce search term to avoid filtering on every keystroke
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch fresh manager data to get latest departments (in case admin updated them)
                let managerDepartments = [];
                if (user?.role !== 'TeamHead') {
                    try {
                        const managerRes = await api.get('/manager/me');
                        if (managerRes.data?.departments) {
                            managerDepartments = managerRes.data.departments;
                        }
                    } catch (err) {
                        managerDepartments = user?.departments || [];
                    }
                }
                
                // Use optimized combined endpoint to get employees and attendance records in one request
                const response = await api.get(`/attendance/attendance-data`);
                const employeesData = response.data.employees || [];
                const recordsData = response.data.attendanceRecords || {};
                
                setEmployees(employeesData);

                // Use manager's assigned departments
                if (managerDepartments.length > 0) {
                    setDomains(managerDepartments);
                } else {
                    // Fallback: extract from employees if no departments available
                    const uniqueDomains = [...new Set(employeesData.map(emp => emp.domain).filter(Boolean))];
                    setDomains(uniqueDomains);
                }

                // Build records map from the response
                const recordsMap = {};
                const tasksMap = {};
                
                Object.keys(recordsData).forEach(id => {
                    recordsMap[id] = recordsData[id].status;
                    tasksMap[id] = recordsData[id].taskDescription || '';
                });

                setAttendanceRecords(recordsMap);
                setTaskDescriptions(tasksMap);

            } catch (err) {
                console.error('Failed to fetch data', err);
                setError(err.response?.data?.message || 'Failed to load attendance data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.role]);

    const handleMarkStatus = async (employeeId, status) => {
        const emp = employees.find(e => e._id === employeeId);
        if (!emp || !emp.employee_id) return;

        // Optimistic update - update UI immediately before API call
        const previousStatus = attendanceRecords[emp.employee_id];
        setAttendanceRecords(prev => ({ ...prev, [emp.employee_id]: status }));

        try {
            await api.post('/attendance/mark', {
                employee_id: emp.employee_id,
                status: status,
                taskDescription: remarks[emp.employee_id] || ''
            });

            setStatusMsg({ type: 'success', text: `Marked ${emp.name} as ${status}` });
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 2000);

        } catch (err) {
            // Revert to previous status on failure
            setAttendanceRecords(prev => ({ ...prev, [emp.employee_id]: previousStatus }));
            setStatusMsg({ type: 'error', text: 'Failed to update status' });
        }
    };

    const handleSendEmails = async () => {
        try {
            const payload = {};
            // If select mode is enabled, include selected employee IDs
            if (selectEmployeesForEmail && selectedEmployeesForEmail.length > 0) {
                payload.employeeIds = selectedEmployeesForEmail;
            }
            await api.post('/attendance/send-emails', payload);
            setStatusMsg({ type: 'success', text: 'Attendance emails sent successfully' });
            // Clear selection after sending
            setSelectedEmployeesForEmail([]);
        } catch (err) {
            setStatusMsg({ type: 'error', text: 'Failed to send emails' });
        }
    };

    const handleCancel = () => {
        setRemarks({});
        setSearchTerm('');
        setSelectedDomain('All');
        setStatusMsg({ type: '', text: '' });
        setSelectEmployeesForEmail(false);
        setSelectedEmployeesForEmail([]);
    };

    // Toggle employee selection for email
    const toggleEmployeeForEmail = (employeeId) => {
        setSelectedEmployeesForEmail(prev => {
            if (prev.includes(employeeId)) {
                return prev.filter(id => id !== employeeId);
            } else {
                return [...prev, employeeId];
            }
        });
    };

    // Toggle select all employees for email
    const toggleSelectAllForEmail = () => {
        if (selectedEmployeesForEmail.length === filteredEmployees.length) {
            setSelectedEmployeesForEmail([]);
        } else {
            setSelectedEmployeesForEmail(filteredEmployees.map(emp => emp.employee_id));
        }
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesDomain = selectedDomain === 'All' || (emp.domain === selectedDomain);
            const matchesSearch = emp.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            return matchesDomain && matchesSearch;
        });
    }, [employees, selectedDomain, debouncedSearchTerm]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 font-sans antialiased ">
            <div className="max-w-7xl mx-auto">
                {/* Header Section with Enhanced Styling */}
                <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 shadow-lg">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full translate-y-12 -translate-x-12 blur-2xl"></div>
                
                    <div className="relative px-5 py-4 md:px-6 md:py-5">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Hub</h1>
                                <p className="text-indigo-100 text-sm font-medium max-w-2xl">Manage and monitor daily intern presence with ease</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg">
                                <span className="text-xs text-indigo-200 block uppercase tracking-wider font-bold mb-0.5">Selected Date</span>
                                <span className="text-white font-bold text-base flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-indigo-200" />
                                    {new Date(today).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-indigo-100/50 border border-indigo-100/50 overflow-hidden">
                    <div className="p-8">
                        {/* Enhanced Action Bar */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                            <div className="w-full md:w-auto">
                                {statusMsg.text && (
                                    <div className={`p-4 rounded-2xl flex items-center border-2 ${
                                        statusMsg.type === 'success' 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-lg shadow-emerald-100/50' 
                                            : 'bg-rose-50 text-rose-700 border-rose-200 shadow-lg shadow-rose-100/50'
                                    }`}>
                                        {statusMsg.type === 'success' 
                                            ? <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0"/> 
                                            : <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                        }
                                        <span className="text-sm font-semibold">{statusMsg.text}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={handleCancel} 
                                    className="w-full sm:w-auto group relative px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-lg transition-all duration-200 active:scale-95 overflow-hidden"
                                >
                                    <span className="relative z-10">Cancel</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                                <button 
                                    onClick={handleSendEmails} 
                                    disabled={selectEmployeesForEmail && selectedEmployeesForEmail.length === 0}
                                    className="w-full sm:w-auto group relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-600 hover:shadow-xl hover:shadow-indigo-200/50 transition-all duration-200 active:scale-95 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle className="w-5 h-5 group-hover:rotate-12 transition-transform flex-shrink-0" />
                                    <span className="text-sm">
                                        {selectEmployeesForEmail 
                                            ? `Mark & Send (${selectedEmployeesForEmail.length})`
                                            : 'Mark & Send Emails'
                                        }
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                </button>
                            </div>
                        </div>

                        {/* Enhanced Filters Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6 rounded-2xl border-2 border-indigo-100/50 shadow-inner">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider ml-1 flex items-center gap-1">
                                    <Search className="w-3.5 h-3.5" />
                                    Search Intern
                                </label>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="Filter by name..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                        className="block w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium outline-none transition-all group-focus-within:border-indigo-400 group-focus-within:shadow-lg group-focus-within:shadow-indigo-100 hover:border-indigo-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider ml-1 flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5" />
                                    Domain
                                </label>
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <div className="max-h-40 overflow-y-auto">
                                        <select 
                                            value={selectedDomain} 
                                            onChange={(e) => setSelectedDomain(e.target.value)} 
                                            className="block w-full pl-11 pr-10 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium appearance-none outline-none transition-all group-focus-within:border-indigo-400 group-focus-within:shadow-lg group-focus-within:shadow-indigo-100 hover:border-indigo-200 cursor-pointer"
                                        >
                                            <option value="All">All Domains</option>
                                            {domains.map(domain => (
                                                <option key={domain} value={domain}>{domain}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Select Employees Toggle */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider ml-1 flex items-center gap-1">
                                    <CheckSquare className="w-3.5 h-3.5" />
                                    Email Selection
                                </label>
                                <div className="relative group">
                                    <button
                                        onClick={() => {
                                            setSelectEmployeesForEmail(!selectEmployeesForEmail);
                                            if (selectEmployeesForEmail) {
                                                setSelectedEmployeesForEmail([]);
                                            }
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 border-2 rounded-xl text-sm font-medium transition-all ${
                                            selectEmployeesForEmail 
                                                ? 'bg-indigo-50 border-indigo-400 text-indigo-700' 
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'
                                        }`}
                                    >
                                        {selectEmployeesForEmail ? (
                                            <CheckCircle className="w-5 h-5 text-indigo-600" />
                                        ) : (
                                            <Square className="w-5 h-5 text-slate-400" />
                                        )}
                                        <span>{selectEmployeesForEmail ? 'Selecting employees for email' : 'Send to specific interns'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Table Styling */}
                        <div className="overflow-x-auto rounded-2xl border-2 border-indigo-100/50 bg-white shadow-xl shadow-indigo-100/20">
                            {loading ? (
                                <div className="py-32 text-center">
                                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                        <div className="w-5 h-5 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Loading Interns...</span>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="py-32 text-center">
                                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-50 rounded-xl border border-red-100">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <span className="text-sm font-semibold text-red-600">{error}</span>
                                    </div>
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : (
                                <>
                                {/* Mobile Card View - Visible on small screens */}
                                <div className="lg:hidden space-y-4">
                                    {filteredEmployees.map((emp, index) => {
                                        const status = attendanceRecords[emp.employee_id] || 'Absent';
                                        return (
                                            <div 
                                                key={emp._id} 
                                                className="bg-white rounded-2xl border-2 border-indigo-100 p-4 shadow-lg shadow-indigo-100/20"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                {/* Employee Info */}
                                                <div className="flex items-start gap-4 mb-4">
                                                    {selectEmployeesForEmail && (
                                                        <button
                                                            onClick={() => toggleEmployeeForEmail(emp.employee_id)}
                                                            className="flex-shrink-0 mt-1"
                                                        >
                                                            {selectedEmployeesForEmail.includes(emp.employee_id) ? (
                                                                <CheckCircle className="w-6 h-6 text-indigo-600" />
                                                            ) : (
                                                                <Square className="w-6 h-6 text-slate-400" />
                                                            )}
                                                        </button>
                                                    )}
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-indigo-600 border-2 border-indigo-200 flex-shrink-0">
                                                            <User size={22} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <span className="text-base font-bold text-slate-800 block truncate">{emp.name}</span>
                                                            <div className="flex flex-col gap-1 mt-1">
                                                                <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                                                                    <Hash size={12} className="text-indigo-500"/>
                                                                    {emp.employee_id}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                                                                    <Mail size={12}/>
                                                                    <span className="truncate">{emp.email}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Domain */}
                                                <div className="mb-4">
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                                                        {emp.domain || 'N/A'}
                                                    </span>
                                                </div>
                                                
                                                {/* Action Buttons */}
                                                <div className="flex gap-2 mb-4">
                                                    <button
                                                        onClick={() => handleMarkStatus(emp._id, 'Present')}
                                                        className={`flex-1 px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-100 border-2 ${
                                                            status === 'Present'
                                                                ? 'bg-green-500 text-white border-green-600 shadow-lg shadow-green-200 hover:bg-green-600'
                                                                : 'bg-white text-slate-500 border-slate-200 hover:border-green-400 hover:text-green-600 hover:bg-green-50 hover:shadow-md'
                                                        }`}
                                                    >
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleMarkStatus(emp._id, 'Absent')}
                                                        className={`flex-1 px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-100 border-2 ${
                                                            status === 'Absent'
                                                                ? 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-200 hover:bg-red-600'
                                                                : 'bg-white text-slate-500 border-slate-200 hover:border-red-400 hover:text-red-600 hover:bg-red-50 hover:shadow-md'
                                                        }`}
                                                    >
                                                        Absent
                                                    </button>
                                                </div>
                                                
                                                {/* Remarks */}
                                                <div>
                                                    <input
                                                        type="text"
                                                        value={remarks[emp.employee_id] || ''}
                                                        onChange={(e) =>
                                                            setRemarks(prev => ({
                                                                ...prev,
                                                                [emp.employee_id]: e.target.value
                                                            }))
                                                        }
                                                        placeholder="Add task note (optional)"
                                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* Desktop Table View - Visible on large screens */}
                                <div className="hidden lg:block overflow-x-auto rounded-2xl border-2 border-indigo-100/50 bg-white shadow-xl shadow-indigo-100/20">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-100">
                                                {selectEmployeesForEmail && (
                                                    <th className="py-4 px-4 text-xs font-extrabold text-indigo-700 uppercase tracking-wider text-center">
                                                        <button
                                                            onClick={toggleSelectAllForEmail}
                                                            className="inline-flex items-center justify-center hover:text-indigo-900"
                                                        >
                                                            {selectedEmployeesForEmail.length === filteredEmployees.length && filteredEmployees.length > 0 ? (
                                                                <CheckCircle className="w-5 h-5" />
                                                            ) : (
                                                                <Square className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    </th>
                                                )}
                                                <th className="py-4 px-6 text-xs font-extrabold text-indigo-700 uppercase tracking-wider">Intern Profile</th>
                                                <th className="py-4 px-6 text-xs font-extrabold text-indigo-700 uppercase tracking-wider">Domain</th>
                                                <th className="py-4 px-6 text-center text-xs font-extrabold text-indigo-700 uppercase tracking-wider">Action</th>
                                                <th className="py-4 px-6 text-xs font-extrabold text-indigo-700 uppercase tracking-wider">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-indigo-50">
                                            {filteredEmployees.map((emp, index) => {
                                                const status = attendanceRecords[emp.employee_id] || 'Absent';
                                                return (
                                                    <tr 
                                                        key={emp._id} 
                                                        className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent transition-all duration-200"
                                                        style={{ animationDelay: `${index * 50}ms` }}
                                                    >
                                                        {selectEmployeesForEmail && (
                                                            <td className="py-5 px-4 text-center">
                                                                <button
                                                                    onClick={() => toggleEmployeeForEmail(emp.employee_id)}
                                                                    className="inline-flex items-center justify-center hover:text-indigo-600"
                                                                >
                                                                    {selectedEmployeesForEmail.includes(emp.employee_id) ? (
                                                                        <CheckCircle className="w-5 h-5 text-indigo-600" />
                                                                    ) : (
                                                                        <Square className="w-5 h-5 text-slate-400" />
                                                                    )}
                                                                </button>
                                                            </td>
                                                        )}
                                                        <td className="py-5 px-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative">
                                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-indigo-600 border-2 border-indigo-200 group-hover:border-indigo-300 group-hover:scale-105 transition-all duration-200">
                                                                        <User size={22} />
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-base font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{emp.name}</span>
                                                                    <div className="flex flex-col gap-1 mt-1">
                                                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                                            <Hash size={12} className="text-indigo-500"/>
                                                                            <span className="whitespace-nowrap">{emp.employee_id}</span>
                                                                        </span>
                                                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                                            <Mail size={12}/>
                                                                            <span className="truncate">{emp.email}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-5 px-6">
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                                                                {emp.domain || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="py-5 px-6">
                                                            <div className="flex justify-center gap-3">
                                                                <button
                                                                    onClick={() => handleMarkStatus(emp._id, 'Present')}
                                                                    className={`px-5 py-2 text-xs font-extrabold rounded-xl transition-all duration-100 border-2 ${
                                                                        status === 'Present'
                                                                            ? 'bg-green-500 text-white border-green-600 shadow-lg shadow-green-200 hover:bg-green-600'
                                                                            : 'bg-white text-slate-500 border-slate-200 hover:border-green-400 hover:text-green-600 hover:bg-green-50 hover:shadow-md'
                                                                    }`}
                                                                >
                                                                    Present
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMarkStatus(emp._id, 'Absent')}
                                                                    className={`px-5 py-2 text-xs font-extrabold rounded-xl transition-all duration-100 border-2 ${
                                                                        status === 'Absent'
                                                                            ? 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-200 hover:bg-red-600'
                                                                            : 'bg-white text-slate-500 border-slate-200 hover:border-red-400 hover:text-red-600 hover:bg-red-50 hover:shadow-md'
                                                                    }`}
                                                                >
                                                                    Absent
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="w-full">
                                                                <input
                                                                    type="text"
                                                                    value={remarks[emp.employee_id] || ''}
                                                                    onChange={(e) =>
                                                                        setRemarks(prev => ({
                                                                            ...prev,
                                                                            [emp.employee_id]: e.target.value
                                                                        }))
                                                                    }
                                                                    placeholder="Add task note (optional)"
                                                                    className="
                                                                        w-full
                                                                        px-3 py-2
                                                                        bg-slate-50
                                                                        border border-slate-200
                                                                        rounded-lg
                                                                        text-sm
                                                                        text-slate-700
                                                                        placeholder:text-slate-400
                                                                        outline-none
                                                                        transition
                                                                        focus:bg-white
                                                                        focus:border-indigo-400
                                                                        focus:ring-2
                                                                        focus:ring-indigo-100
                                                                    "
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                               
                                {filteredEmployees.length > 0 && (
                                    <div className="flex items-center justify-between border-t border-indigo-100 bg-white px-4 py-3 sm:px-6">
                                        <div>
                                            <p className="text-xs text-slate-600">
                                                Showing all <span className="font-medium text-indigo-600">{filteredEmployees.length}</span> interns
                                            </p>
                                        </div>
                                    </div>
                                )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarkAttendance;
