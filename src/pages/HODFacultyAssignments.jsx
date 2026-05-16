import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserCheck, BookOpen, Plus, Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

const HODFacultyAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ faculty_id: '', subject_id: '' });
    const [message, setMessage] = useState(null);

    const fetchData = async () => {
        try {
            const [facRes, subRes] = await Promise.all([
                api.get('/hod/faculty'),
                api.get('/hod/subjects')
            ]);
            setFaculty(facRes.data.data);
            setSubjects(subRes.data.data);
            
            // We need an endpoint to get current assignments
            // For now, let's assume we can fetch them or we'll add a route
            const assignRes = await api.get('/hod/faculty-assignments'); 
            setAssignments(assignRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/hod/assign-subject', formData);
            setMessage({ type: 'success', text: 'Faculty assigned to subject successfully!' });
            setShowModal(false);
            setFormData({ faculty_id: '', subject_id: '' });
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to assign faculty.' });
        } finally {
            setLoading(false);
        }
    };

    if (loading && assignments.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Faculty Assignments</h1>
                    <p className="text-slate-500">Assign faculty members to department subjects</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md"
                >
                    <Plus size={20} />
                    <span>Assign Subject</span>
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-4 font-bold text-slate-700 text-sm">Faculty Name</th>
                            <th className="p-4 font-bold text-slate-700 text-sm">Employee ID</th>
                            <th className="p-4 font-bold text-slate-700 text-sm">Subject</th>
                            <th className="p-4 font-bold text-slate-700 text-sm">Subject Code</th>
                            <th className="p-4 font-bold text-slate-700 text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {assignments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-400">No assignments found.</td>
                            </tr>
                        ) : (
                            assignments.map((assignment) => (
                                <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                                                {assignment.faculty_name?.charAt(0)}
                                            </div>
                                            <span className="font-medium text-slate-900">{assignment.faculty_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 text-sm">{assignment.faculty_employee_id}</td>
                                    <td className="p-4 text-slate-900 font-medium">{assignment.subject_name}</td>
                                    <td className="p-4 text-slate-500 text-sm">{assignment.subject_code}</td>
                                    <td className="p-4">
                                        <button className="text-slate-400 hover:text-red-600 transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900">Assign Subject</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-all">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleAssign} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Select Faculty</label>
                                <select 
                                    required
                                    value={formData.faculty_id}
                                    onChange={(e) => setFormData({...formData, faculty_id: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="">-- Select Faculty --</option>
                                    {faculty.map(f => <option key={f.id} value={f.id}>{f.name} ({f.faculty_employee_id})</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Select Subject</label>
                                <select 
                                    required
                                    value={formData.subject_id}
                                    onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="">-- Select Subject --</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>)}
                                </select>
                            </div>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <UserCheck size={20} />}
                                Confirm Assignment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HODFacultyAssignments;
