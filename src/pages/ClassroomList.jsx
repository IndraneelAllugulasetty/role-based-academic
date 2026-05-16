import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, Clock, ChevronRight, Loader2, Plus } from 'lucide-react';

const ClassroomList = () => {
    const { user } = useAuth();
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        subject_id: '',
        faculty_id: '',
        department_id: '',
        semester_id: '',
        section: ''
    });
    const [subjects, setSubjects] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const fetchData = async () => {
        try {
            let endpoint = '';
            if (user.role === 'student') endpoint = '/classroom/student';
            else if (user.role === 'faculty') endpoint = '/classroom/faculty';
            else if (user.role === 'admin') endpoint = '/classroom/all';
            else if (user.role === 'hod') endpoint = '/classroom/department';

            const response = await api.get(endpoint);
            setClassrooms(response.data.data);

            if (user.role === 'admin' || user.role === 'hod' || user.role === 'faculty') {
                const prefix = user.role === 'hod' ? '/hod' : user.role === 'faculty' ? '/faculty' : '/admin';
                const requests = [
                    api.get(user.role === 'faculty' ? '/faculty/all-subjects' : `${prefix}/subjects`),
                ];

                if (user.role === 'admin') {
                    requests.push(api.get('/admin/teachers'));
                    requests.push(api.get('/admin/departments'));
                    requests.push(api.get('/admin/semesters'));
                } else if (user.role === 'hod') {
                    requests.push(api.get('/hod/faculty'));
                    requests.push(api.get('/hod/departments'));
                    requests.push(api.get('/hod/semesters'));
                } else if (user.role === 'faculty') {
                    // Faculty might not have direct access to all depts/semesters via faculty prefix
                    // unless we add them. Let's check if they can use hod/admin ones.
                    // Based on routes, faculty can use /faculty/semesters
                    requests.push(api.get('/faculty/semesters'));
                }

                const results = await Promise.all(requests);
                setSubjects(results[0].data.data);
                
                if (user.role === 'admin') {
                    setFaculty(results[1].data.data);
                    setDepartments(results[2].data.data);
                    setSemesters(results[3].data.data);
                } else if (user.role === 'hod') {
                    setFaculty(results[1].data.data);
                    setDepartments(Array.isArray(results[2].data.data) ? results[2].data.data : [results[2].data.data]);
                    setSemesters(results[3].data.data);
                    setFormData(prev => ({ ...prev, department_id: user.department_id }));
                } else if (user.role === 'faculty') {
                    setSemesters(results[1].data.data);
                    setFormData(prev => ({
                        ...prev,
                        faculty_id: user.faculty_id,
                        department_id: user.department_id
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.role]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/classroom/create', formData);
            setShowModal(false);
            setFormData({ name: '', subject_id: '', faculty_id: '', department_id: '', semester_id: '', section: '' });
            fetchData();
        } catch (error) {
            console.error('Error creating classroom:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
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
                    <h1 className="text-2xl font-bold text-slate-900">Classrooms</h1>
                    <p className="text-slate-500">Access your course materials and assignments</p>
                </div>
                {(user.role === 'admin' || user.role === 'hod' || user.role === 'faculty') && (
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all"
                    >
                        <Plus size={20} />
                        <span>Create Classroom</span>
                    </button>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900">Create New Classroom</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-all">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Classroom Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. CS101 - Section A"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Department</label>
                                    <select 
                                        required
                                        disabled={user.role === 'faculty'}
                                        value={formData.department_id}
                                        onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                                    >
                                        <option value="">-- Select --</option>
                                        {user.role === 'faculty' ? (
                                            <option value={user.department_id}>{user.department_name}</option>
                                        ) : (
                                            departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Semester</label>
                                    <select 
                                        required
                                        disabled={user.role === 'faculty'}
                                        value={formData.semester_id}
                                        onChange={(e) => setFormData({...formData, semester_id: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                                    >
                                        <option value="">-- Select --</option>
                                        {user.role === 'faculty' ? (
                                            subjects.find(s => s.id == formData.subject_id) && (
                                                <option value={subjects.find(s => s.id == formData.subject_id).semester_id}>
                                                    Sem {subjects.find(s => s.id == formData.subject_id).semester_number}
                                                </option>
                                            )
                                        ) : (
                                            semesters.map(s => <option key={s.id} value={s.id}>Sem {s.semester_number}</option>)
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Subject</label>
                                    <select 
                                        required
                                        value={formData.subject_id}
                                        onChange={(e) => {
                                            const sub = subjects.find(s => s.id == e.target.value);
                                            setFormData({
                                                ...formData, 
                                                subject_id: e.target.value,
                                                semester_id: sub ? sub.semester_id : ''
                                            });
                                        }}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    >
                                        <option value="">-- Select --</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Faculty</label>
                                    <select 
                                        required
                                        disabled={user.role === 'faculty'}
                                        value={formData.faculty_id}
                                        onChange={(e) => setFormData({...formData, faculty_id: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                                    >
                                        <option value="">-- Select --</option>
                                        {user.role === 'faculty' ? (
                                            <option value={user.faculty_id}>{user.name}</option>
                                        ) : (
                                            faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Section (Optional)</label>
                                <input 
                                    type="text" 
                                    value={formData.section}
                                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. A"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                Create Classroom
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {classrooms.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Classrooms Found</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        You are not currently enrolled in any active classrooms. 
                        Please contact your department if you believe this is an error.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classrooms.map((classroom) => (
                        <Link 
                            key={classroom.id} 
                            to={`/${user.role}/classroom/${classroom.id}`}
                            className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all group"
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <BookOpen size={24} />
                                    </div>
                                    <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-all">
                                        {classroom.name}
                                    </h3>
                                    <p className="text-sm text-slate-500">{classroom.subject_code} - {classroom.subject_name}</p>
                                </div>
                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <User size={16} />
                                        <span>{user.role === 'student' ? classroom.faculty_name : `${classroom.department_name} - Sem ${classroom.semester_number}`}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock size={16} />
                                        <span>{classroom.section || 'All'}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassroomList;
