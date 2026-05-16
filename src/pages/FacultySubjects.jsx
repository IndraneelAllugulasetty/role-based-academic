import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    BookOpen, Plus, Trash2, Calendar, 
    GraduationCap, Layers, Loader2, 
    CheckCircle2, AlertCircle, Send,
    BookMarked, Hash, Award
} from 'lucide-react';

const FacultySubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({
        subject_name: '',
        subject_code: '',
        semester_id: '',
        credits: 4
    });

    const fetchData = async () => {
        try {
            const [subRes, semRes] = await Promise.all([
                api.get('/faculty/subjects'),
                api.get('/faculty/semesters')
            ]);
            setSubjects(subRes.data.data);
            setSemesters(semRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/faculty/subjects', formData);
            setMessage({ type: 'success', text: 'Subject added successfully!' });
            setShowModal(false);
            setFormData({
                subject_name: '',
                subject_code: '',
                semester_id: '',
                credits: 4
            });
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to add subject.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (loading && subjects.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Subjects</h1>
                        <p className="text-sm text-slate-500">Manage and add subjects you teach</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold"
                >
                    <Plus size={20} />
                    <span>Add New Subject</span>
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.length === 0 ? (
                    <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-500">
                        No subjects assigned or added yet.
                    </div>
                ) : (
                    subjects.map((sub) => (
                        <div key={sub.id} className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4 hover:border-indigo-200 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-full -mr-12 -mt-12 group-hover:bg-indigo-100 transition-all" />
                            
                            <div className="space-y-3 relative">
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                        Semester {sub.semester_number}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                        <Award size={14} /> {sub.credits} Credits
                                    </span>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{sub.subject_name}</h3>
                                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-1 uppercase tracking-widest">
                                        <Hash size={12} /> {sub.subject_code}
                                    </p>
                                </div>

                                <div className="pt-4 flex items-center gap-4 text-xs text-slate-500 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center">
                                            <GraduationCap size={12} />
                                        </div>
                                        <span>Academic Year: {sub.academic_year || '2023-24'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900">Add New Subject</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-all">
                                <Trash2 size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Subject Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.subject_name}
                                    onChange={(e) => setFormData({...formData, subject_name: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="e.g. Advanced Mathematics"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Subject Code</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.subject_code}
                                    onChange={(e) => setFormData({...formData, subject_code: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="e.g. MATH101"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Semester</label>
                                    <select 
                                        required
                                        value={formData.semester_id}
                                        onChange={(e) => setFormData({...formData, semester_id: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    >
                                        <option value="">-- Select Semester --</option>
                                        {semesters.map(s => (
                                            <option key={s.id} value={s.id}>Sem {s.semester_number} ({s.academic_year})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Credits</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="1"
                                        max="10"
                                        value={formData.credits}
                                        onChange={(e) => setFormData({...formData, credits: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <BookMarked size={20} />}
                                Add Subject
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultySubjects;
