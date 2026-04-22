import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    FileSpreadsheet, 
    CheckCircle, 
    AlertCircle, 
    CloudDownload, 
    Import,
    FileCheck,
    UserPlus
} from 'lucide-react';

const UploadEmployees = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('bulk'); // 'bulk' or 'single'
    const [departments, setDepartments] = useState([]);
    
    // Single employee form state
    const [employeeData, setEmployeeData] = useState({
        fullName: '',
        email: '',
        contactNo: '',
        domain: '',
        uniqueId: '',
        appliedDate: '',
        tenureMonths: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [formStatus, setFormStatus] = useState({ type: '', message: '' });

    // Fetch departments on component mount
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('/admin/all-departments');
                setDepartments(res.data);
            } catch (err) {
                console.error('Failed to fetch departments:', err);
            }
        };
        fetchDepartments();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setStatus({ type: '', message: '' });
        }
    };

    const handleImport = async (e) => {
        e.preventDefault();
        if (!file) {
            setStatus({ type: 'error', message: 'Please select a file to import' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await api.post('/admin/upload-employees', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setStatus({ type: 'success', message: res.data.msg || 'Data imported successfully' });
            setFile(null); 
            document.getElementById('file-upload').value = '';
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.msg || 'Import failed. Please check the file format.' });
        } finally {
            setLoading(false);
        }
    };

    // Handle single employee form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmployeeData(prev => ({ ...prev, [name]: value }));
        setFormStatus({ type: '', message: '' });
    };

    // Submit single employee
    const handleSingleSubmit = async (e) => {
        e.preventDefault();
        
        if (!employeeData.fullName || !employeeData.uniqueId) {
            setFormStatus({ type: 'error', message: 'Full Name and Unique ID are required' });
            return;
        }

        setSubmitting(true);
        setFormStatus({ type: '', message: '' });

        try {
            const res = await api.post('/admin/create-employee', employeeData);
            setFormStatus({ type: 'success', message: res.data.msg || 'Employee created successfully' });
            setEmployeeData({
                fullName: '',
                email: '',
                contactNo: '',
                domain: '',
                uniqueId: '',
                appliedDate: '',
                tenureMonths: ''
            });
        } catch (err) {
            setFormStatus({ type: 'error', message: err.response?.data?.msg || 'Failed to create employee' });
        } finally {
            setSubmitting(false);
        }
    };

    // Download excel template
    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/admin/download-template', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'interns_bulk_upload_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download template');
        }
    };

    return (
        /* Reduced top padding to pt-2 and removed large max-width constraints to eliminate extra side spacing */
        <div className="pt-2 px-4 md:px-6 w-full mx-auto space-y-6">
            
            {/* Header: Now aligns perfectly with the rest of the portal */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
                <p className="text-slate-500 text-xs font-normal">Bulk import employee records into the system</p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('bulk')}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                        activeTab === 'bulk' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    <CloudDownload className="w-4 h-4 inline mr-2" />
                    Bulk Import
                </button>
                <button
                    onClick={() => setActiveTab('single')}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                        activeTab === 'single' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    <UserPlus className="w-4 h-4 inline mr-2" />
                    Add Single Employee
                </button>
            </div>
            
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                {/* Header Bar */}
                <div className="bg-slate-900 p-5 px-8 flex items-center justify-between">
                    <h2 className="text-white text-sm font-bold flex items-center gap-2">
                        {activeTab === 'bulk' ? (
                            <><FileSpreadsheet className="w-4 h-4 text-indigo-400" /> Import Manager</>
                        ) : (
                            <><UserPlus className="w-4 h-4 text-indigo-400" /> Add Employee</>
                        )}
                    </h2>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {activeTab === 'bulk' ? 'Excel Support' : 'Single Entry'}
                    </span>
                </div>

                <div className="p-8 md:p-12">
                    {activeTab === 'bulk' ? (
                    <>
                        <div className="text-center mb-10">
                            <div className="mx-auto w-20 h-20 bg-indigo-50 flex items-center justify-center rounded-3xl mb-6 shadow-sm">
                                <CloudDownload className="w-10 h-10 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Import Excel File</h2>
                            <p className="text-sm text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">
                                Upload an excel file <span className="font-bold text-slate-700">(.xlsx)</span> containing employee records. 
                                Ensure your file includes the following columns:
                            </p>
                            
                            {/* Requirement Chips */}
                            <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-lg mx-auto">
                                {['Full Name', 'Email','Contact No.', 'Department', 'Unique ID', 'Joining Date', 'Duration (months)'].map((col) => (
                                    <span key={col} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold border border-slate-200">
                                        {col}
                                    </span>
                                ))}
                            </div>

                            {/* Download Template Link */}
                            <div className="mt-8">
                                <button 
                                    onClick={handleDownloadTemplate}
                                    type="button" 
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all border border-indigo-100 hover:border-indigo-200"
                                >
                                    <CloudDownload className="w-4 h-4" />
                                    Download Excel Template Format
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleImport} className="space-y-8">
                            <div className="flex justify-center">
                                <div className="w-full max-w-lg">
                                    <label 
                                        htmlFor="file-upload" 
                                        className={`group block w-full cursor-pointer flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed rounded-[2rem] transition-all duration-200 
                                            ${file 
                                                ? 'border-indigo-500 bg-indigo-50/30' 
                                                : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-white'
                                            }`}
                                    >
                                        <div className="space-y-3 text-center">
                                            {file ? (
                                                <div className="bg-indigo-600 p-3 rounded-2xl inline-block shadow-lg shadow-indigo-200 animate-in zoom-in">
                                                    <FileCheck className="h-8 w-8 text-white" />
                                                </div>
                                            ) : (
                                                <Import className="mx-auto h-10 w-10 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                            )}
                                            
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-sm font-bold ${file ? 'text-indigo-700' : 'text-slate-600'}`}>
                                                    {file ? file.name : "Choose a file to start"}
                                                </span>
                                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">
                                                    {file ? `${(file.size / 1024).toFixed(1)} KB` : ".xlsx up to 5MB"}
                                                </p>
                                            </div>
                                        </div>
                                        <input 
                                            id="file-upload" 
                                            name="file-upload" 
                                            type="file" 
                                            accept=".xlsx, .xls"
                                            className="sr-only" 
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                            </div>

                            {status.message && (
                                <div className={`p-4 px-6 rounded-2xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2 border ${
                                    status.type === 'success' 
                                        ? 'bg-green-50 text-green-700 border-green-100' 
                                        : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                    {status.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                    {status.message}
                                </div>
                            )}

                            <div className="flex justify-center pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !file}
                                    className={`w-full max-w-lg py-5 px-8 rounded-3xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] 
                                        ${loading || !file 
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 hover:shadow-indigo-200'
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Importing Data...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Import className="w-6 h-6" />
                                            <span>Import Data</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                    ) : (
                    <>
                        {/* Single Employee Form */}
                        <form onSubmit={handleSingleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={employeeData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Enter full name"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={employeeData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Enter email address"
                                    />
                                </div>

                                {/* Contact No. */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Contact No.
                                    </label>
                                    <input
                                        type="text"
                                        name="contactNo"
                                        value={employeeData.contactNo}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Enter contact number"
                                    />
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Department
                                    </label>
                                    <div className="max-h-40 overflow-y-auto">
                                        <select
                                            name="domain"
                                            value={employeeData.domain}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((dept) => (
                                                <option key={dept._id || dept.departmentName} value={dept.departmentName}>
                                                    {dept.departmentName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Unique ID */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Unique ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="uniqueId"
                                        value={employeeData.uniqueId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Enter unique ID"
                                    />
                                </div>

                                {/* Joining Date */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Joining Date
                                    </label>
                                    <input
                                        type="date"
                                        name="appliedDate"
                                        value={employeeData.appliedDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Duration (months) */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Duration (months)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        name="tenureMonths"
                                        value={employeeData.tenureMonths}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="e.g. 3"
                                    />
                                </div>
                            </div>

                            {formStatus.message && (
                                <div className={`p-4 px-6 rounded-2xl flex items-center gap-3 text-sm font-medium border ${
                                    formStatus.type === 'success' 
                                        ? 'bg-green-50 text-green-700 border-green-100' 
                                        : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                    {formStatus.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                    {formStatus.message}
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`py-4 px-8 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] 
                                        ${submitting 
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 hover:shadow-indigo-200'
                                        }`}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Creating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            <span>Add Employee</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                    )}
                </div>
            </div>
            
            {/* Contextual Note */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                    Note: To avoid errors, ensure all dates in your Excel file follow the YYYY-MM-DD format. The import process will automatically skip duplicate Unique IDs to prevent data redundancy. Department field accepts department name (not department ID).
                </p>
            </div>
        </div>
    );
};

export default UploadEmployees;