// import React, { useState, useEffect, useRef } from 'react';
// import api from '../../services/api';
// import { 
//     UserRound, Plus, Loader2, AlertCircle, Mail, Lock, 
//     Building, Eye, EyeOff, Edit2, Check, ChevronDown, 
//     Users, ShieldCheck, X, Trash2
// } from 'lucide-react';

// const ManagerManagement = () => {
//     const [departments, setDepartments] = useState([]);

//     const [managers, setManagers] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [actionLoading, setActionLoading] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const [showDeptDropdown, setShowDeptDropdown] = useState(false);
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [editingManager, setEditingManager] = useState(null);
//     const dropdownRef = useRef(null);

//     const [formData, setFormData] = useState({
//         name: '', 
//         email: '', 
//         password: '', 
//         departments: [] 
//     });

//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');

//     // Fetch managers on component mount
//     useEffect(() => {
//         fetchManagers();
//         fetchDepartments();
//     }, []);

//     useEffect(() => {
//         const handleClick = (e) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//                 setShowDeptDropdown(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClick);
//         return () => document.removeEventListener('mousedown', handleClick);
//     }, []);

//     const fetchManagers = async () => {
//         setLoading(true);
//         try {
//             const res = await api.get('/admin/managers');
//             setManagers(res.data);
//             setError('');
//         } catch (err) {
//             console.error('Failed to fetch managers', err);
//             if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
//                 setError('Cannot connect to server. Please check if backend is running.');
//             } else {
//                 setError('Failed to fetch managers. Please try again.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchDepartments = async () => {
//         try {
//             const res = await api.get('/admin/all-departments');
//             setDepartments(res.data);
//         } catch (err) {
//             console.error('Failed to fetch departments', err);
//         }
//     };

//     const handleCreateSubmit = async (e) => {
//         e.preventDefault();
        
//         if (!formData.name || !formData.email || !formData.password || formData.departments.length === 0) {
//             setError('Please fill out all fields and assign at least one department.');
//             return;
//         }

//         setActionLoading(true);
//         setError('');
//         setSuccess('');

//         try {
//             const res = await api.post('/admin/create-manager', formData);
//             setManagers([res.data, ...managers]);
//             setFormData({ name: '', email: '', password: '', departments: [] });
//             setSuccess('Manager created successfully!');
//             setTimeout(() => setSuccess(''), 3000);
//         } catch (err) {
//             console.error('Create manager error:', err.response || err);
//             setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     const toggleManagerStatus = async (id) => {
//         try {
//             setActionLoading(true);
//             const res = await api.patch(`/admin/managers/${id}/toggle`);
//             setManagers(managers.map(m => 
//                 m._id === id ? { ...m, isActive: res.data.isActive } : m
//             ));
//             setSuccess(`Manager ${res.data.isActive ? 'activated' : 'deactivated'} successfully!`);
//             setTimeout(() => setSuccess(''), 3000);
//         } catch (err) {
//             console.error('Failed to toggle status', err);
//             if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
//                 setError('Cannot connect to server. Please check if backend is running.');
//             } else {
//                 setError('Failed to update manager status.');
//             }
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     const deleteManager = async (id) => {
//         if (!window.confirm("Are you sure you want to delete this manager?")) return;
        
//         try {
//             setActionLoading(true);
//             await api.delete(`/admin/managers/${id}`);
//             setManagers(managers.filter(m => m._id !== id));
//             setSuccess('Manager deleted successfully!');
//             setTimeout(() => setSuccess(''), 3000);
//         } catch (err) {
//             console.error('Failed to delete manager', err);
//             if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
//                 setError('Cannot connect to server. Please check if backend is running.');
//             } else {
//                 setError('Failed to delete manager.');
//             }
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     const updateManager = async () => {
//         if (!editingManager) return;
        
//         setActionLoading(true);
//         setError('');
        
//         try {
//             const updateData = {
//                 name: editingManager.name,
//                 email: editingManager.email,
//                 departments: editingManager.departments,
//                 isActive: editingManager.isActive
//                 // Password field removed - no password update in edit
//             };
            
//             const res = await api.put(`/admin/managers/${editingManager._id}`, updateData);
            
//             // Update the managers list with the updated manager
//             setManagers(managers.map(m => 
//                 m._id === editingManager._id ? res.data : m
//             ));
            
//             // Close modal and clear editing state
//             setIsEditModalOpen(false);
//             setEditingManager(null);
            
//             // Show success message
//             setSuccess('Manager updated successfully!');
            
//             // Clear success message after 3 seconds
//             setTimeout(() => setSuccess(''), 3000);
            
//         } catch (err) {
//             console.error('Failed to update manager:', err);
            
//             // Show error message
//             if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
//                 setError('Cannot connect to server. Please check if backend is running.');
//             } else {
//                 setError(err.response?.data?.message || 'Failed to update manager');
//             }
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     const handleDepartmentToggle = (dept, isEditing = false) => {
//         if (isEditing) {
//             // For edit modal
//             const currentDepts = editingManager.departments || [];
//             if (currentDepts.includes(dept)) {
//                 setEditingManager({
//                     ...editingManager,
//                     departments: currentDepts.filter(d => d !== dept)
//                 });
//             } else {
//                 setEditingManager({
//                     ...editingManager,
//                     departments: [...currentDepts, dept]
//                 });
//             }
//         } else {
//             // For create form
//             if (formData.departments.includes(dept)) {
//                 setFormData({
//                     ...formData,
//                     departments: formData.departments.filter(d => d !== dept)
//                 });
//             } else {
//                 setFormData({
//                     ...formData,
//                     departments: [...formData.departments, dept]
//                 });
//             }
//         }
//     };

//     return (
//         <div className="pt-2 px-4 md:px-6 max-w-6xl mx-auto space-y-6 font-sans">
//             <header className="flex items-center gap-4 py-2">
//                 <div>
//                     <h1 className="text-2xl font-bold text-slate-900 leading-tight">Manager Portal</h1>
//                     <p className="text-sm text-slate-500">Configure Access & Permissions</p>
//                 </div>
//             </header>

//             {/* Success/Error Messages */}
//             {success && (
//                 <div className="bg-green-50 text-green-700 p-4 rounded-2xl border border-green-200 flex items-center gap-3 animate-in slide-in-from-top-2">
//                     <Check className="w-5 h-5" />
//                     {success}
//                 </div>
//             )}

//             {error && (
//                 <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 flex items-center gap-3 animate-in slide-in-from-top-2">
//                     <AlertCircle className="w-5 h-5" />
//                     {error}
//                 </div>
//             )}

//             {/* CREATE FORM */}
//             <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-visible">
//                 <div className="bg-slate-900 p-5 rounded-t-3xl">
//                     <h2 className="text-white font-bold flex items-center gap-2">
//                         <Plus className="w-5 h-5 text-indigo-400" /> Register New Manager
//                     </h2>
//                 </div>

//                 <form onSubmit={handleCreateSubmit} className="p-8 space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="space-y-2">
//                             <label className="text-sm font-medium text-slate-700">Full Name</label>
//                             <div className="relative">
//                                 <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                                 <input 
//                                     type="text" 
//                                     required 
//                                     className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
//                                     placeholder="Enter name" 
//                                     value={formData.name} 
//                                     onChange={(e) => setFormData({...formData, name: e.target.value})} 
//                                     disabled={actionLoading}
//                                 />
//                             </div>
//                         </div>
//                         <div className="space-y-2">
//                             <label className="text-sm font-medium text-slate-700">Email Address</label>
//                             <div className="relative">
//                                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                                 <input 
//                                     type="email" 
//                                     required 
//                                     className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
//                                     placeholder="manager@company.com" 
//                                     value={formData.email} 
//                                     onChange={(e) => setFormData({...formData, email: e.target.value})} 
//                                     disabled={actionLoading}
//                                 />
//                             </div>
//                         </div>

//                         <div className="space-y-2 relative" ref={dropdownRef}>
//                             <label className="text-sm font-medium text-slate-700">Department Access</label>
//                             <div 
//                                 onClick={() => !actionLoading && setShowDeptDropdown(!showDeptDropdown)} 
//                                 className={`w-full min-h-[50px] relative bg-slate-50 border border-slate-200 rounded-xl cursor-pointer flex flex-wrap items-start pt-3 pb-2 pl-12 pr-10 gap-2 ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                             >
//                                 <Building className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
//                                 {formData.departments.length === 0 ? (
//                                     <span className="text-slate-400 text-sm mt-0.5">Select domains...</span>
//                                 ) : (
//                                     formData.departments.map(dept => (
//                                         <span key={dept} className="bg-indigo-600 text-white pl-2 pr-1 py-1 rounded-lg text-xs flex items-center gap-1 leading-none shadow-sm">
//                                             {dept}
//                                             <X className="w-3 h-3 cursor-pointer hover:bg-white/20 rounded" onClick={(e) => { 
//                                                 e.stopPropagation(); 
//                                                 if (!actionLoading) {
//                                                     setFormData({
//                                                         ...formData, 
//                                                         departments: formData.departments.filter(d => d !== dept)
//                                                     });
//                                                 }
//                                             }} />
//                                         </span>
//                                     ))
//                                 )}
//                                 <ChevronDown className="absolute right-3 top-4 w-5 h-5 text-slate-400" />
//                             </div>
//                             {showDeptDropdown && !actionLoading && (
//                                 <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-2">
//                                     {departments.map(dept => (
//                                         <div 
//                                             key={dept._id || dept.departmentName} 
//                                             onClick={() => handleDepartmentToggle(dept.departmentName, false)} 
//                                             className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer"
//                                         >
//                                             <div className={`w-4 h-4 border rounded ${formData.departments.includes(dept.departmentName) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
//                                                 {formData.departments.includes(dept.departmentName) && <Check className="w-3 h-3 text-white" />}
//                                             </div>
//                                             <span className="text-sm text-slate-700">{dept.departmentName}</span>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>

//                         <div className="space-y-2">
//                             <label className="text-sm font-medium text-slate-700">Password</label>
//                             <div className="relative">
//                                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                                 <input 
//                                     type={showPassword ? "text" : "password"} 
//                                     required 
//                                     className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
//                                     placeholder="••••••••" 
//                                     value={formData.password} 
//                                     onChange={(e) => setFormData({...formData, password: e.target.value})} 
//                                     disabled={actionLoading}
//                                 />
//                                 <button 
//                                     type="button" 
//                                     onClick={() => setShowPassword(!showPassword)} 
//                                     className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
//                                     disabled={actionLoading}
//                                 >
//                                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     <button 
//                         type="submit" 
//                         disabled={actionLoading} 
//                         className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
//                         {actionLoading ? 'Creating Account...' : 'Finalize & Create Account'}
//                     </button>
//                 </form>
//             </section>

//             {/* MANAGER LIST */}
//             <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
//                 <div className="p-6 border-b border-slate-100 bg-slate-50/50">
//                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
//                         <Users className="w-5 h-5 text-indigo-600" /> Registered Managers
//                     </h3>
//                 </div>
//                 <div className="overflow-x-auto">
//                     {loading ? (
//                         <div className="p-12 text-center">
//                             <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
//                         </div>
//                     ) : (
//                         <table className="w-full text-left">
//                             <thead>
//                                 <tr className="bg-slate-50/20 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
//                                     <th className="p-6">Manager Info</th>
//                                     <th className="p-6">Assigned Departments</th>
//                                     <th className="p-6 text-center">Status</th>
//                                     <th className="p-6 text-center">Action</th>
//                                     <th className="p-6 text-right">Remove</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-100">
//                                 {managers.map(m => (
//                                     <tr key={m._id} className="hover:bg-slate-50/50 transition-colors">
//                                         <td className="p-6">
//                                             <div className="flex items-center gap-4">
//                                                 <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">
//                                                     {m.name?.charAt(0) || 'M'}
//                                                 </div>
//                                                 <div>
//                                                     <div className="text-sm font-bold text-slate-800">{m.name}</div>
//                                                     <div className="text-xs text-slate-500">{m.email}</div>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="p-6">
//                                             <div className="flex flex-wrap gap-2 max-w-[280px]">
//                                                 {m.departments?.map(dept => (
//                                                     <span key={dept} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-medium border border-indigo-100">
//                                                         {dept}
//                                                     </span>
//                                                 ))}
//                                             </div>
//                                         </td>
//                                         <td className="p-6">
//                                             <div className="flex flex-col items-center justify-center gap-1.5">
//                                                 <button 
//                                                     onClick={() => toggleManagerStatus(m._id)}
//                                                     disabled={actionLoading}
//                                                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out outline-none focus:ring-0 ${m.isActive ? 'bg-green-500' : 'bg-slate-300'} ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                                                 >
//                                                     <span 
//                                                         className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${m.isActive ? 'translate-x-5' : 'translate-x-1'}`} 
//                                                     />
//                                                 </button>
//                                                 <span className={`text-[9px] font-black uppercase tracking-tighter ${m.isActive ? 'text-green-600' : 'text-slate-400'}`}>
//                                                     {m.isActive ? 'Active' : 'Inactive'}
//                                                 </span>
//                                             </div>
//                                         </td>
//                                         <td className="p-6 text-center">
//                                             <button 
//                                                 onClick={() => { 
//                                                     setEditingManager({
//                                                         ...m,
//                                                         departments: m.departments || []
//                                                     }); 
//                                                     setIsEditModalOpen(true); 
//                                                 }} 
//                                                 disabled={actionLoading}
//                                                 className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all border border-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
//                                             >
//                                                 <div className="flex items-center gap-2">
//                                                     <Edit2 className="w-3.5 h-3.5" />
//                                                     Edit
//                                                 </div>
//                                             </button>
//                                         </td>
//                                         <td className="p-6 text-right">
//                                             <button 
//                                                 onClick={() => deleteManager(m._id)} 
//                                                 disabled={actionLoading}
//                                                 className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
//                                             >
//                                                 <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     )}
//                 </div>
//             </section>

//             {/* Edit Modal - With editable name and email */}
//             {isEditModalOpen && editingManager && (
//                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//                     <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !actionLoading && setIsEditModalOpen(false)}></div>
//                     <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
//                         <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
//                             <h2 className="font-bold text-lg">Edit Manager: {editingManager.name}</h2>
//                             <button 
//                                 onClick={() => !actionLoading && setIsEditModalOpen(false)} 
//                                 disabled={actionLoading}
//                                 className="p-2 hover:bg-white/10 rounded-full disabled:opacity-50"
//                             >
//                                 <X className="w-5 h-5" />
//                             </button>
//                         </div>
//                         <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
//                                     <input
//                                         type="text"
//                                         value={editingManager.name || ''}
//                                         onChange={(e) => setEditingManager({
//                                             ...editingManager, 
//                                             name: e.target.value
//                                         })}
//                                         disabled={actionLoading}
//                                         className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none disabled:bg-slate-50"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
//                                     <input
//                                         type="email"
//                                         value={editingManager.email || ''}
//                                         onChange={(e) => setEditingManager({
//                                             ...editingManager, 
//                                             email: e.target.value
//                                         })}
//                                         disabled={actionLoading}
//                                         className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none disabled:bg-slate-50"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Password field completely removed */}

//                             <div className="space-y-3">
//                                 <label className="block text-sm font-medium text-slate-700">Current Department Access</label>
//                                 <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl min-h-[60px]">
//                                     {editingManager.departments && editingManager.departments.length > 0 ? (
//                                         editingManager.departments.map(dept => (
//                                             <span key={dept} className="bg-indigo-600 text-white pl-3 pr-1 py-1.5 rounded-xl text-sm flex items-center gap-2 shadow-sm">
//                                                 {dept}
//                                                 <button 
//                                                     onClick={() => {
//                                                         if (!actionLoading) {
//                                                             setEditingManager({
//                                                                 ...editingManager,
//                                                                 departments: editingManager.departments.filter(d => d !== dept)
//                                                             });
//                                                         }
//                                                     }} 
//                                                     disabled={actionLoading}
//                                                     className="p-1 hover:bg-white/20 rounded-md disabled:opacity-50"
//                                                 >
//                                                     <X className="w-3 h-3" />
//                                                 </button>
//                                             </span>
//                                         ))
//                                     ) : (
//                                         <p className="text-sm text-slate-400 w-full text-center">No departments assigned</p>
//                                     )}
//                                 </div>
//                             </div>

//                             <div className="space-y-3 border-t border-slate-100 pt-6">
//                                 <label className="block text-sm font-medium text-slate-700">Available Departments</label>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl">
//                                     {departments
//                                         .filter(dept => !editingManager.departments?.includes(dept.departmentName))
//                                         .map(dept => (
//                                             <div 
//                                                 key={dept._id || dept.departmentName} 
//                                                 onClick={() => {
//                                                     if (!actionLoading) {
//                                                         setEditingManager({
//                                                             ...editingManager,
//                                                             departments: [...(editingManager.departments || []), dept.departmentName]
//                                                         });
//                                                     }
//                                                 }} 
//                                                 className={`flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 rounded-xl cursor-pointer group transition-colors ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                                             >
//                                                 <span className="text-sm text-slate-600 group-hover:text-indigo-700">{dept.departmentName}</span>
//                                                 <Plus className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
//                                             </div>
//                                         ))
//                                     }
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="p-6 bg-slate-50 flex gap-3 justify-end border-t border-slate-200">
//                             <button 
//                                 onClick={() => {
//                                     setIsEditModalOpen(false);
//                                     setEditingManager(null);
//                                 }} 
//                                 disabled={actionLoading}
//                                 className={`px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 transition-all ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                             >
//                                 Cancel
//                             </button>
//                             <button 
//                                 onClick={updateManager} 
//                                 disabled={actionLoading}
//                                 className={`px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg active:scale-95 transition-all flex items-center gap-2 ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
//                             >
//                                 {actionLoading ? (
//                                     <>
//                                         <Loader2 className="w-4 h-4 animate-spin" />
//                                         Saving...
//                                     </>
//                                 ) : (
//                                     'Save Changes'
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ManagerManagement;


import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
  UserRound,
  Plus,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  Building,
  Eye,
  EyeOff,
  Edit2,
  Check,
  ChevronDown,
  Users,
  ShieldCheck,
  X,
  Trash2,
  Sparkles,
  Briefcase,
} from 'lucide-react';

const ManagerManagement = () => {
  const [departments, setDepartments] = useState([]);

  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    departments: [],
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchManagers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDeptDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/managers');
      setManagers(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch managers', err);
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError('Failed to fetch managers. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/all-departments');
      console.log(res.data)
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || formData.departments.length === 0) {
      setError('Please fill out all fields and assign at least one department.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/admin/create-manager', formData);
      setManagers([res.data, ...managers]);
      setFormData({ name: '', email: '', password: '', departments: [] });
      setSuccess('Manager created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Create manager error:', err.response || err);
      setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleManagerStatus = async (id) => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/admin/managers/${id}/toggle`);
      setManagers(managers.map((m) => (m._id === id ? { ...m, isActive: res.data.isActive } : m)));
      setSuccess(`Manager ${res.data.isActive ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to toggle status', err);
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError('Failed to update manager status.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const deleteManager = async (id) => {
    if (!window.confirm('Are you sure you want to delete this manager?')) return;

    try {
      setActionLoading(true);
      await api.delete(`/admin/managers/${id}`);
      setManagers(managers.filter((m) => m._id !== id));
      setSuccess('Manager deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to delete manager', err);
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError('Failed to delete manager.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const updateManager = async () => {
    if (!editingManager) return;

    setActionLoading(true);
    setError('');

    try {
      const updateData = {
        name: editingManager.name,
        email: editingManager.email,
        departments: editingManager.departments,
        isActive: editingManager.isActive,
      };

      const res = await api.put(`/admin/managers/${editingManager._id}`, updateData);

      setManagers(managers.map((m) => (m._id === editingManager._id ? res.data : m)));
      setIsEditModalOpen(false);
      setEditingManager(null);
      setSuccess('Manager updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update manager:', err);
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError(err.response?.data?.message || 'Failed to update manager');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDepartmentToggle = (dept, isEditing = false) => {
    if (isEditing) {
      const currentDepts = editingManager.departments || [];
      if (currentDepts.includes(dept)) {
        setEditingManager({
          ...editingManager,
          departments: currentDepts.filter((d) => d !== dept),
        });
      } else {
        setEditingManager({
          ...editingManager,
          departments: [...currentDepts, dept],
        });
      }
    } else {
      if (formData.departments.includes(dept)) {
        setFormData({
          ...formData,
          departments: formData.departments.filter((d) => d !== dept),
        });
      } else {
        setFormData({
          ...formData,
          departments: [...formData.departments, dept],
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-6 md:px-8 py-7 shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_35%)]" />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-200">
                Admin Console
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-black text-white tracking-tight">
                Manager Portal
              </h1>
              <p className="mt-2 text-sm font-medium text-indigo-100">
                Configure access, departments, and permissions for managers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white">
                <p className="text-xs font-semibold text-indigo-100">Total Managers</p>
                <p className="text-2xl font-black">{managers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 flex items-center gap-3 text-sm font-semibold">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 flex items-center gap-3 text-sm font-semibold">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Create Form */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-visible">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Register New Manager</h2>
                <p className="text-sm text-slate-500">Create and assign secure manager access</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Full Name" icon={UserRound}>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={actionLoading}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-50"
                />
              </Field>

              <Field label="Email Address" icon={Mail}>
                <input
                  type="email"
                  required
                  placeholder="manager@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={actionLoading}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-50"
                />
              </Field>

              <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-sm font-semibold text-slate-700">Department Access</label>
                <div
                  onClick={() => !actionLoading && setShowDeptDropdown(!showDeptDropdown)}
                  className={`w-full min-h-[54px] relative rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer flex flex-wrap items-start pt-3 pb-2 pl-12 pr-10 gap-2 ${
                    actionLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Building className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                  {formData.departments.length === 0 ? (
                    <span className="text-slate-400 text-sm mt-0.5">Select departments...</span>
                  ) : (
                    formData.departments.map((dept) => (
                      <span
                        key={dept}
                        className="bg-indigo-600 text-white pl-2 pr-1 py-1 rounded-lg text-xs flex items-center gap-1"
                      >
                        {dept}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!actionLoading) {
                              setFormData({
                                ...formData,
                                departments: formData.departments.filter((d) => d !== dept),
                              });
                            }
                          }}
                        />
                      </span>
                    ))
                  )}
                  <ChevronDown className="absolute right-3 top-4 w-5 h-5 text-slate-400" />
                </div>

                {showDeptDropdown && !actionLoading && (
                  <div className="absolute z-50 w-full mt-2 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 max-h-60 overflow-y-auto">
                    {departments.map((dept) => (
                      <div
                        key={dept._id || dept.departmentName}
                        onClick={() => handleDepartmentToggle(dept.departmentName, false)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer"
                      >
                        <div
                          className={`w-4 h-4 rounded border ${
                            formData.departments.includes(dept.departmentName)
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {formData.departments.includes(dept.departmentName) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm text-slate-700">{dept.departmentName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Field label="Password" icon={Lock}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={actionLoading}
                  className="w-full pl-12 pr-12 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </Field>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white py-4 font-bold text-base shadow-lg shadow-indigo-100 transition flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {actionLoading ? 'Creating Account...' : 'Finalize & Create Account'}
            </button>
          </form>
        </section>

        {/* Manager List */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Registered Managers</h3>
                <p className="text-sm text-slate-500">Manage access and department assignments</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] uppercase tracking-widest text-slate-400 bg-slate-50">
                    <th className="p-5 text-left">Manager Info</th>
                    <th className="p-5 text-left">Assigned Departments</th>
                    <th className="p-5 text-center">Status</th>
                    <th className="p-5 text-center">Action</th>
                    <th className="p-5 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {managers.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                            {m.name?.charAt(0) || 'M'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{m.name}</p>
                            <p className="text-xs text-slate-500">{m.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="flex flex-wrap gap-2 max-w-[320px]">
                          {m.departments?.map((dept) => (
                            <span
                              key={dept}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                            >
                              {dept}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            onClick={() => toggleManagerStatus(m._id)}
                            disabled={actionLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                              m.isActive ? 'bg-green-500' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 rounded-full bg-white transition ${
                                m.isActive ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[10px] font-black uppercase ${
                              m.isActive ? 'text-green-600' : 'text-slate-400'
                            }`}
                          >
                            {m.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      <td className="p-5 text-center">
                        <button
                          onClick={() => {
                            setEditingManager({
                              ...m,
                              departments: m.departments || [],
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white text-xs font-bold transition"
                        >
                          <div className="flex items-center gap-2">
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </div>
                        </button>
                      </td>

                      <td className="p-5 text-right">
                        <button
                          onClick={() => deleteManager(m._id)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {isEditModalOpen && editingManager && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !actionLoading && setIsEditModalOpen(false)}
            />
            <div className="relative w-full max-w-2xl rounded-[2rem] bg-white shadow-2xl overflow-hidden">
              <div className="bg-slate-900 px-6 py-5 flex items-center justify-between text-white">
                <h2 className="font-bold text-lg">Edit Manager: {editingManager.name}</h2>
                <button
                  onClick={() => !actionLoading && setIsEditModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SimpleInput
                    label="Name"
                    value={editingManager.name || ''}
                    onChange={(e) =>
                      setEditingManager({
                        ...editingManager,
                        name: e.target.value,
                      })
                    }
                  />
                  <SimpleInput
                    label="Email"
                    value={editingManager.email || ''}
                    onChange={(e) =>
                      setEditingManager({
                        ...editingManager,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Current Department Access</label>
                  <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-50 min-h-[60px]">
                    {editingManager.departments?.length ? (
                      editingManager.departments.map((dept) => (
                        <span
                          key={dept}
                          className="bg-indigo-600 text-white pl-3 pr-1 py-1.5 rounded-xl text-sm flex items-center gap-2"
                        >
                          {dept}
                          <button
                            onClick={() =>
                              !actionLoading &&
                              setEditingManager({
                                ...editingManager,
                                departments: editingManager.departments.filter((d) => d !== dept),
                              })
                            }
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 w-full text-center">No departments assigned</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-6">
                  <label className="block text-sm font-semibold text-slate-700">Available Departments</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-2xl border border-slate-200">
                    {departments
                      .filter((dept) => !editingManager.departments?.includes(dept.departmentName))
                      .map((dept) => (
                        <div
                          key={dept._id || dept.departmentName}
                          onClick={() =>
                            !actionLoading &&
                            setEditingManager({
                              ...editingManager,
                              departments: [...(editingManager.departments || []), dept.departmentName],
                            })
                          }
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 cursor-pointer"
                        >
                          <span className="text-sm text-slate-600">{dept.departmentName}</span>
                          <Plus className="w-4 h-4 text-slate-400" />
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingManager(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={updateManager}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function Field({ label, icon: Icon, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        {children}
      </div>
    </div>
  );
}

function SimpleInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-50"
      />
    </div>
  );
}

export default ManagerManagement;