import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { 
    Download, CalendarDays, AlertCircle, 
    Building2, LayoutGrid, FileSpreadsheet, 
    ArrowRight, Loader2, ChevronDown, Calendar,
    RefreshCw, Users, CheckCircle, XCircle, Clock
} from 'lucide-react';

const AttendanceReport = () => {
    const [date, setDate] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [reportType, setReportType] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [departments, setDepartments] = useState([]);
    
    // New state for displaying attendance data
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [dataLoading, setDataLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Fetch departments from employees (same as Attendance Hub)
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await api.get('/admin/all-departments');
                setDepartments(response.data);
            } catch (err) {
                console.error('Failed to fetch departments:', err);
            }
        };
        fetchDepartments();
    }, []);

    // Fetch attendance data when filters change
    const fetchAttendanceData = useCallback(async () => {
        if (!year) return;
        
        setDataLoading(true);
        setError('');
        
        try {
            const params = new URLSearchParams();
            if (date) params.append('date', date);
            if (month) params.append('month', month);
            if (year) params.append('year', year);
            if (reportType === 'single' && selectedDepartment) {
                params.append('department', selectedDepartment);
            }
            
            const endpoint = `/admin/attendance-report/data?${params.toString()}`;
            const response = await api.get(endpoint);
            
            setReportData(response.data.employees || []);
            setSummary(response.data.summary);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch attendance data:', err);
            setError('Failed to load attendance data. Please try again.');
        } finally {
            setDataLoading(false);
        }
    }, [year, month, date, reportType, selectedDepartment]);

    // Auto-refresh when page becomes visible or when filters change
    useEffect(() => {
        if (year) {
            fetchAttendanceData();
        }
    }, [year, month, date, reportType, selectedDepartment, fetchAttendanceData]);

    // Auto-refresh when page becomes visible (e.g., after returning from MarkAttendance)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && year) {
                // Page became visible, refresh data
                fetchAttendanceData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Also refresh on focus
        const handleFocus = () => {
            if (year) {
                fetchAttendanceData();
            }
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [year, fetchAttendanceData]);

    const handleExport = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!year) {
            setError('Please at least select a Year');
            return;
        }
        if (reportType === 'single' && !selectedDepartment) {
            setError('Please select a department');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Construct query params dynamically based on what's filled
            const params = new URLSearchParams();
            if (date) params.append('date', date);
            if (month) params.append('month', month);
            if (year) params.append('year', year);
            
            const endpoint = reportType === 'all' 
                ? `/admin/attendance-report?${params.toString()}`
                : `/admin/attendance-report/department?name=${selectedDepartment}&${params.toString()}`;
            
            const response = await api.get(endpoint, { responseType: 'blob' });
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', `Attendance_Report_${selectedDepartment || 'All'}_${year}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Failed to export report. Please check data availability for the selected filters.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchAttendanceData();
    };

    return (
        <div className="pt-2 px-4 md:px-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Export</h1>
                <p className="text-slate-500 text-xs font-normal">Generate and export attendance data by department and timeframe</p>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-xl">
                                <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Total Interns</p>
                                <p className="text-xl font-bold text-slate-900">{summary.totalEmployees}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-xl">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Present/Completed</p>
                                <p className="text-xl font-bold text-slate-900">{summary.totalCompleted + summary.totalPresent}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-xl">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Absent</p>
                                <p className="text-xl font-bold text-slate-900">{summary.totalAbsent}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-xl">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Total Records</p>
                                <p className="text-xl font-bold text-slate-900">{summary.totalRecords}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Data Table */}
            {year && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 p-4 px-6 flex items-center justify-between">
                        <h2 className="text-white text-sm font-bold flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4 text-indigo-400" /> Attendance Data
                        </h2>
                        <div className="flex items-center gap-3">
                            {lastUpdated && (
                                <span className="text-[10px] text-slate-400">
                                    Updated: {lastUpdated.toLocaleTimeString()}
                                </span>
                            )}
                            <button
                                onClick={handleRefresh}
                                disabled={dataLoading}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Refresh data"
                            >
                                <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                    
                    {dataLoading ? (
                        <div className="py-12 text-center">
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                <div className="w-5 h-5 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Loading Data...</span>
                            </div>
                        </div>
                    ) : reportData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-100">
                                        <th className="py-3 px-4 text-xs font-extrabold text-indigo-700 uppercase tracking-wider">Intern</th>
                                        <th className="py-3 px-4 text-xs font-extrabold text-indigo-700 uppercase tracking-wider">Department</th>
                                        <th className="py-3 px-4 text-center text-xs font-extrabold text-indigo-700 uppercase tracking-wider">Working Days</th>
                                        <th className="py-3 px-4 text-center text-xs font-extrabold text-indigo-700 uppercase tracking-wider">Completed</th>
                                        <th className="py-3 px-4 text-center text-xs font-extrabold text-indigo-700 uppercase tracking-wider">Present</th>
                                        <th className="py-3 px-4 text-center text-xs font-extrabold text-indigo-700 uppercase tracking-wider">Absent</th>
                                        <th className="py-3 px-4 text-center text-xs font-extrabold text-indigo-700 uppercase tracking-wider">Incomplete</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-50">
                                    {reportData.map((emp) => (
                                        <tr key={emp._id} className="hover:bg-indigo-50/50 transition-colors">
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">{emp.name}</p>
                                                    <p className="text-xs text-slate-500">{emp.employee_id}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                                                    {emp.department}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="font-bold text-slate-700">{emp.totalWorkingDays}</span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                                                    {emp.tasksCompleted}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                                                    {emp.present}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold">
                                                    {emp.absent}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                                                    emp.incompleteDays > 0 
                                                        ? 'bg-amber-100 text-amber-700' 
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {emp.incompleteDays}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-xl border border-slate-200">
                                <span className="text-sm font-semibold text-slate-500">No attendance records found for the selected filters</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Export Configuration */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 p-4 px-6 flex items-center justify-between">
                    <h2 className="text-white text-sm font-bold flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-indigo-400" /> Report Configuration
                    </h2>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Excel Format</span>
                </div>

                <form onSubmit={handleExport} className="p-6 md:p-8 space-y-8">
                    {/* Report Type Toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                            onClick={() => setReportType('all')}
                            className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${reportType === 'all' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                        >
                            <div className={`p-3 rounded-xl ${reportType === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 shadow-sm'}`}>
                                <LayoutGrid className="w-5 h-5" />
                            </div>
                            <div>
                                <p className={`font-bold text-sm ${reportType === 'all' ? 'text-indigo-900' : 'text-slate-600'}`}> All Departments</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-tight font-normal">Bulk organizational data</p>
                            </div>
                        </div>

                        <div 
                            onClick={() => setReportType('single')}
                            className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${reportType === 'single' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                        >
                            <div className={`p-3 rounded-xl ${reportType === 'single' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 shadow-sm'}`}>
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className={`font-bold text-sm ${reportType === 'single' ? 'text-indigo-900' : 'text-slate-600'}`}> Specific Department</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-tight font-normal">Individual performance</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Date Select */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Specific Date (Optional)</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                <input 
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none text-slate-700 font-normal"
                                />
                            </div>
                        </div>

                        {/* Month Select */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Month</label>
                            <div className="relative">
                                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                <select 
                                    value={month} 
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none appearance-none text-slate-700 font-normal"
                                >
                                    <option value="">Select Month</option>
                                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                                        <option key={m} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Year Select */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Year</label>
                            <div className="relative">
                                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                <select 
                                    value={year} 
                                    onChange={(e) => setYear(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none appearance-none text-slate-700 font-normal"
                                >
                                    <option value="">Select Year</option>
                                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Choose Department Select */}
                        <div className={`space-y-2 transition-all ${reportType === 'single' ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Choose Department</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                <div className="max-h-40 overflow-y-auto">
                                    <select 
                                        value={selectedDepartment} 
                                        onChange={(e) => setSelectedDepartment(e.target.value)}
                                        disabled={reportType !== 'single'}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none appearance-none text-slate-700 font-normal"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => <option key={dept._id || dept.departmentName} value={dept.departmentName}>{dept.departmentName}</option>)}
                                    </select>
                                </div>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 text-sm font-normal border border-red-100 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            {error}
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 bg-indigo-600 text-white font-bold rounded-3xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-4 active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700 hover:shadow-indigo-200'}`}
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                            <span className="text-lg">Export Report (.xlsx)</span>
                            {!loading && <ArrowRight className="w-5 h-5 opacity-40" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttendanceReport;
