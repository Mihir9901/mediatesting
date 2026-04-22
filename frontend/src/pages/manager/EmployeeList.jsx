import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Download, Calendar, Building2, RefreshCw } from 'lucide-react';

const EmployeeList = () => {
    const { user } = useContext(AuthContext);

    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [department, setDepartment] = useState('All');
    const [departments, setDepartments] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (user?.role === 'TeamHead') {
                    const reportRes = await api.get(
                        `/attendance/monthly-report?month=${month}&year=${year}`
                    );
                    const rows = reportRes.data.report || [];
                    setReportData(rows);
                    const uniq = [...new Set(rows.map((r) => r.department).filter(Boolean))];
                    setDepartments(uniq.length ? uniq : ['All']);
                } else {
                    const [managerRes, reportRes] = await Promise.all([
                        api.get('/manager/me'),
                        api.get(`/attendance/monthly-report?month=${month}&year=${year}`),
                    ]);
                    if (managerRes.data?.departments?.length > 0) {
                        setDepartments(managerRes.data.departments);
                    }
                    setReportData(reportRes.data.report || []);
                }
            } catch (err) {
                console.error('Failed to fetch data', err);
                setError(err.response?.data?.message || 'Failed to load report. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [month, year, refreshKey, user?.role]);

    // Memoize filtered data to prevent unnecessary recalculations
    const filteredData = useMemo(() => {
        if (department === 'All') return reportData;
        return reportData.filter(emp => emp.department === department);
    }, [reportData, department]);

    // Memoize download handler
    const handleDownload = useCallback(() => {
        const headers = [
            'Unique ID',
            'Name',
            'Department',
            'Intern Status',
            'Duration (months)',
            'Completed',
            'Present',
            'Absent',
            'Total Marked Days',
            'Joining Date',
        ];

        const rows = filteredData.map(emp => [
            emp.uniqueId,
            emp.name,
            emp.department,
            emp.tenureStatus || 'Active',
            emp.tenureMonths ?? '',
            emp.taskCompleted,
            emp.present ?? 0,
            emp.absent ?? 0,
            emp.totalMarkedDays ?? 0,
            emp.appliedDate ? new Date(emp.appliedDate).toLocaleDateString('en-GB') : 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.href = url;
        link.download = `attendance_report_${year}_${month}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [filteredData, year, month]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];

    return (

        <div className="p-4 max-w-7xl mx-auto">

            {/* Compact Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Monthly Attendance Report</h1>
                    <p className="text-xs text-slate-500">Overview of intern attendance and tasks</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition"
                        title="Refresh data"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                    >
                        <Download size={14} />
                        Export
                    </button>
                </div>
            </div>

            {/* Rectangle Box Card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100/50 border border-indigo-100/50 overflow-hidden">

                {/* Filters Section */}
                <div className="p-6 border-b border-indigo-100">
                    <div className="flex flex-wrap items-end gap-4">
                        {/* Month */}
                        <div className="w-36">
                            <label className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-2 flex items-center gap-1">
                                <Calendar size={12} />
                                Month
                            </label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
                            >
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Year */}
                        <div className="w-28">
                            <label className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-2 flex items-center gap-1">
                                <Calendar size={12} />
                                Year
                            </label>
                            <select
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        {/* Department */}
                        <div className="w-44">
                            <label className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-2 flex items-center gap-1">
                                <Building2 size={12} />
                                Department
                            </label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white max-h-32 overflow-y-auto"
                            >
                                <option value="All">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        {/* Record Count */}
                        <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl">
                            <span className="text-sm text-slate-600">Total:</span>
                            <span className="text-sm font-bold text-indigo-600">{filteredData.length}</span>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-16 text-center text-slate-500 text-sm">
                            Loading report...
                        </div>
                    ) : error ? (
                        <div className="py-16 text-center">
                            <p className="text-red-500 mb-3 text-sm">{error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-indigo-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold text-indigo-700 uppercase">
                                        Unique ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold text-indigo-700 uppercase">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold text-indigo-700 uppercase">
                                        Department
                                    </th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold text-indigo-700 uppercase">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-center text-[11px] font-bold text-indigo-700 uppercase">
                                        Duration
                                    </th>
                                    <th className="px-4 py-3 text-center text-[11px] font-bold text-indigo-700 uppercase">
                                        Completed
                                    </th>
                                    <th className="px-4 py-3 text-center text-[11px] font-bold text-indigo-700 uppercase">
                                        Present
                                    </th>
                                    <th className="px-4 py-3 text-center text-[11px] font-bold text-indigo-700 uppercase">
                                        Absent
                                    </th>
                                    <th className="px-4 py-3 text-center text-[11px] font-bold text-indigo-700 uppercase">
                                        Marked Days
                                    </th>
                                    <th className="px-4 py-3 text-center text-[11px] font-bold text-indigo-700 uppercase">
                                        Joining Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-50">
                                {filteredData.map(emp => (
                                    <tr key={emp.uniqueId} className="hover:bg-indigo-50/40">
                                        <td className="px-4 py-3 text-sm font-mono text-slate-600">
                                            {emp.uniqueId}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                                            {emp.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {emp.department}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                                                    (emp.tenureStatus || 'Active') === 'Completed'
                                                        ? 'bg-slate-200 text-slate-700'
                                                        : 'bg-emerald-100 text-emerald-700'
                                                }`}
                                            >
                                                {emp.tenureStatus || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm font-semibold text-slate-700 tabular-nums">
                                            {emp.tenureMonths ? `${emp.tenureMonths}m` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                                                {emp.taskCompleted}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                                                {emp.present ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex px-3 py-1 text-xs font-semibold bg-rose-100 text-rose-700 rounded-full">
                                                {emp.absent ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm font-semibold text-slate-700 tabular-nums">
                                            {emp.totalMarkedDays ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-slate-600">
                                            {emp.appliedDate ? new Date(emp.appliedDate).toLocaleDateString('en-GB') : 'N/A'}
                                        </td>
                                    </tr>
                                ))}

                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan="10" className="text-center py-10 text-sm text-slate-500">
                                            No records found for this month.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeList;
