import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, UserCheck, ShieldCheck, Edit2, X } from 'lucide-react';

const AdminHODs = () => {
    const [hods, setHods] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingHOD, setEditingHOD] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, deptsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/departments')
            ]);
            // Filter only HODs
            setHods(usersRes.data.data.filter(u => u.role === 'hod'));
            setDepartments(deptsRes.data.data);
        } catch (error) {
            console.error('Error fetching HODs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (hod) => {
        setEditingHOD({
            ...hod,
            department_id: hod.department_id || ''
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/admin/users/${editingHOD.id}`, editingHOD);
            await fetchData();
            setShowEditModal(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Update failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredHods = hods.filter(h => 
        (h.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (h.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage HODs</h1>
                    <p className="text-slate-500 text-sm">View and manage all Heads of Departments.</p>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Edit HOD</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 uppercase">Name</label>
                                <input 
                                    required 
                                    value={editingHOD.name} 
                                    onChange={(e) => setEditingHOD({...editingHOD, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 uppercase">Email</label>
                                <input 
                                    required 
                                    type="email"
                                    value={editingHOD.email} 
                                    onChange={(e) => setEditingHOD({...editingHOD, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 uppercase">Department</label>
                                <select 
                                    required 
                                    value={editingHOD.department_id} 
                                    onChange={(e) => setEditingHOD({...editingHOD, department_id: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 uppercase">Status</label>
                                <select 
                                    required 
                                    value={editingHOD.status} 
                                    onChange={(e) => setEditingHOD({...editingHOD, status: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                                <button disabled={submitting} type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                    {submitting ? 'Updating...' : 'Update HOD'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold">Email</th>
                                <th className="px-6 py-4 font-semibold">Department</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading HODs...</td></tr>
                            ) : filteredHods.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No HODs found.</td></tr>
                            ) : filteredHods.map((h) => (
                                <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <span>{h.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{h.email}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{h.department_name || 'Not Assigned'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${h.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {h.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => handleEditClick(h)}
                                            className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminHODs;
