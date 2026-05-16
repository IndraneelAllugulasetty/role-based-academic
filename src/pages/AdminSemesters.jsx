import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import api from '../api/axios';

const AdminSemesters = () => {
    const [semesters, setSemesters] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSem, setEditingSem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        semester_number: '',
        academic_year: '',
        is_active: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log('AdminSemesters: Fetching semesters...');
            const res = await api.get('/admin/semesters');
            console.log('AdminSemesters: Semesters received:', res.data.data);
            setSemesters(res.data.data);
        } catch (error) {
            console.error('Error fetching semesters in AdminSemesters:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (sem = null) => {
        if (sem) {
            setEditingSem(sem);
            setFormData({
                semester_number: sem.semester_number,
                academic_year: sem.academic_year,
                is_active: sem.is_active === 1 || sem.is_active === true
            });
        } else {
            setEditingSem(null);
            setFormData({
                semester_number: '',
                academic_year: '',
                is_active: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting semester form:', formData);
        setSubmitting(true);
        try {
            if (editingSem) {
                console.log('Updating semester:', editingSem.id);
                await api.put(`/admin/semesters/${editingSem.id}`, formData);
            } else {
                console.log('Creating new semester');
                await api.post('/admin/semesters', formData);
            }
            console.log('Semester saved successfully');
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving semester:', error);
            alert(error.response?.data?.message || error.message || 'Error saving semester');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this semester?')) {
            try {
                await api.delete(`/admin/semesters/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting semester');
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Manage Semesters</h1>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add Semester</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {semesters.map((sem) => (
                        <div key={sem.id} className={`bg-white p-6 rounded-xl shadow-sm border ${sem.is_active ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200'} hover:shadow-md transition-shadow`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg ${sem.is_active ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                    <Calendar size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleOpenModal(sem)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(sem.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1">Semester {sem.semester_number}</h3>
                            <p className="text-sm text-slate-500 mb-4">{sem.academic_year}</p>
                            
                            <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full w-fit ${sem.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                {sem.is_active ? (
                                    <><CheckCircle2 size={14} /> <span>Active</span></>
                                ) : (
                                    <><XCircle size={14} /> <span>Inactive</span></>
                                )}
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
                                {editingSem ? 'Edit Semester' : 'Add New Semester'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Semester Number</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="8"
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.semester_number}
                                    onChange={(e) => setFormData({...formData, semester_number: e.target.value})}
                                    placeholder="e.g. 1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.academic_year}
                                    onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                                    placeholder="e.g. 2023-24"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Set as Active Semester</label>
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
                                    {submitting ? 'Saving...' : (editingSem ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSemesters;
