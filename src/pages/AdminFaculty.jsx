import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Search, Edit2, Trash2, UserPlus, X } from 'lucide-react';

const AdminFaculty = () => {
    const [faculty, setFaculty] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        employee_id: '',
        department_id: '',
        designation: '',
        role: 'faculty'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [facultyRes, deptsRes] = await Promise.all([
                api.get('/admin/teachers'),
                api.get('/admin/departments')
            ]);
            setFaculty(facultyRes.data.data);
            setDepartments(deptsRes.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (f) => {
        setEditingId(f.id);
        setFormData({
            name: f.name || '',
            email: f.email || '',
            password: '', // Don't show password
            employee_id: f.faculty_employee_id || '',
            department_id: f.department_id || '',
            designation: f.designation || '',
            role: f.role || 'faculty'
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
        try {
            await api.delete(`/admin/teachers/${id}`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Deletion failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/admin/teachers/${editingId}`, formData);
            } else {
                await api.post('/admin/teachers/register', formData);
            }
            fetchData();
            setShowModal(false);
            setEditingId(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                employee_id: '',
                department_id: '',
                designation: '',
                role: 'faculty'
            });
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredFaculty = faculty.filter(f => 
        (f.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (f.faculty_employee_id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Faculty</h1>
                    <p className="text-slate-500 text-sm">View and manage all faculty members across departments.</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            name: '',
                            email: '',
                            password: '',
                            employee_id: '',
                            department_id: '',
                            designation: '',
                            role: 'faculty'
                        });
                        setShowModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <UserPlus size={18} />
                    <span>Register Faculty</span>
                </button>
            </div>

            {/* Registration/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Faculty' : 'Register New Faculty'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Full Name</label>
                                    <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Email Address</label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Password {editingId && '(Leave blank to keep current)'}</label>
                                    <input required={!editingId} type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Employee ID</label>
                                    <input required name="employee_id" value={formData.employee_id} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Department</label>
                                    <select required name="department_id" value={formData.department_id} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Role</label>
                                    <select required name="role" value={formData.role} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="faculty">Faculty</option>
                                        <option value="hod">HOD</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 uppercase">Designation</label>
                                    <input required name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Assistant Professor" />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                                <button disabled={submitting} type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                    {submitting ? 'Saving...' : (editingId ? 'Update Faculty' : 'Register Faculty')}
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
                            placeholder="Search by name or employee ID..."
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
                                <th className="px-6 py-4 font-semibold">Employee ID</th>
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold">Department</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Designation</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">Loading faculty...</td></tr>
                            ) : filteredFaculty.length === 0 ? (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">No faculty found.</td></tr>
                            ) : filteredFaculty.map((f) => (
                                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{f.faculty_employee_id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-900">{f.name}</span>
                                            <span className="text-xs text-slate-500">{f.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{f.department_name}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${f.role === 'hod' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {f.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{f.designation}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${f.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {f.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleEdit(f)}
                                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(f.id)}
                                                className="text-slate-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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

export default AdminFaculty;
