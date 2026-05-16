import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, BookOpen, User } from 'lucide-react';
import api from '../api/axios';

const AdminDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [hods, setHods] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        hod_user_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log('AdminDepartments: Fetching departments and users...');
            const [deptsRes, usersRes] = await Promise.all([
                api.get('/admin/departments'),
                api.get('/admin/users')
            ]);
            console.log('AdminDepartments: Departments received:', deptsRes.data.data);
            console.log('AdminDepartments: Users received:', usersRes.data.data);
            setDepartments(deptsRes.data.data);
            // Filter users who are HODs or could be HODs
            setHods(usersRes.data.data.filter(u => u.role === 'hod' || u.role === 'faculty'));
        } catch (error) {
            console.error('Error fetching departments in AdminDepartments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (dept = null) => {
        if (dept) {
            setEditingDept(dept);
            setFormData({
                name: dept.name,
                code: dept.code,
                hod_user_id: dept.hod_user_id || ''
            });
        } else {
            setEditingDept(null);
            setFormData({
                name: '',
                code: '',
                hod_user_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting department form:', formData);
        setSubmitting(true);
        try {
            if (editingDept) {
                console.log('Updating department:', editingDept.id);
                await api.put(`/admin/departments/${editingDept.id}`, formData);
            } else {
                console.log('Creating new department');
                await api.post('/admin/departments', formData);
            }
            console.log('Department saved successfully');
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving department:', error);
            alert(error.response?.data?.message || error.message || 'Error saving department');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await api.delete(`/admin/departments/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting department');
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Manage Departments</h1>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Department</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept) => (
                        <div key={dept.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                    <BookOpen size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleOpenModal(dept)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(dept.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">{dept.name}</h3>
                            <p className="text-sm text-slate-500 font-mono mb-4">{dept.code}</p>
                            
                            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                <User size={16} className="text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-semibold">Head of Department</p>
                                    <p className="font-medium">{dept.hod_name || 'Not Assigned'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingDept ? 'Edit Department' : 'Add New Department'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. Computer Science and Engineering"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Department Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.code}
                                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                                    placeholder="e.g. CSE"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Head of Department (Optional)</label>
                                <select
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.hod_user_id}
                                    onChange={(e) => setFormData({...formData, hod_user_id: e.target.value})}
                                >
                                    <option value="">Select HOD</option>
                                    {hods.map(hod => (
                                        <option key={hod.id} value={hod.id}>{hod.name} ({hod.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : (editingDept ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDepartments;
