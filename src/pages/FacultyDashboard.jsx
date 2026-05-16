import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { BookOpen, Calendar, FileText, AlertCircle, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectsRes, announcementsRes] = await Promise.all([
                    api.get('/faculty/subjects'),
                    api.get('/announcements')
                ]);
                setSubjects(subjectsRes.data.data);
                
                // Filter announcements for faculty
                const filtered = announcementsRes.data.data.filter(a => 
                    a.visibility_scope === 'all' || 
                    a.visibility_scope === 'faculty' || 
                    (a.visibility_scope === 'department' && a.department_id === user.department_id)
                ).slice(0, 3);
                setAnnouncements(filtered);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.department_id]);

    const handleCreateClassroom = async (subject) => {
        try {
            const res = await api.post('/classroom/create', {
                name: `${subject.subject_code} - ${subject.subject_name}`,
                subject_id: subject.id,
                faculty_id: user.faculty_id, // Need to ensure user has faculty_id
                department_id: user.department_id,
                semester_id: subject.semester_id,
                section: 'All'
            });
            if (res.data.success) {
                // Refresh subjects
                const updatedSubjects = await api.get('/faculty/subjects');
                setSubjects(updatedSubjects.data.data);
            }
        } catch (error) {
            console.error('Error creating classroom:', error);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">Faculty Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/faculty/subjects" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all group">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <BookOpen size={20} />
                    </div>
                    <p className="text-sm text-slate-500">Assigned Subjects</p>
                    <p className="text-2xl font-bold text-slate-900">{subjects.length}</p>
                </Link>
                <Link to="/faculty/attendance" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-green-200 transition-all group">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-all">
                        <Calendar size={20} />
                    </div>
                    <p className="text-sm text-slate-500">Today's Classes</p>
                    <p className="text-2xl font-bold text-slate-900">2</p>
                </Link>
                <Link to="/faculty/marks" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-orange-200 transition-all group">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-all">
                        <FileText size={20} />
                    </div>
                    <p className="text-sm text-slate-500">Pending Marks</p>
                    <p className="text-2xl font-bold text-slate-900">1</p>
                </Link>
                <Link to="/faculty/classroom" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all group">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <BookOpen size={20} />
                    </div>
                    <p className="text-sm text-slate-500">Classrooms</p>
                    <p className="text-2xl font-bold text-slate-900">{subjects.filter(s => s.classroom_id).length}</p>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold mb-6">Assigned Subjects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subjects.map((subject) => (
                            <div key={subject.id} className="p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{subject.subject_code}</span>
                                    <span className="text-xs text-slate-400">Sem {subject.semester_number}</span>
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">{subject.subject_name}</h4>
                                <p className="text-sm text-slate-500 mb-4">{subject.credits} Credits</p>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <Link 
                                            to="/faculty/attendance" 
                                            className="flex-1 bg-white text-blue-600 border border-blue-100 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white transition-all text-center"
                                        >
                                            Attendance
                                        </Link>
                                        <Link 
                                            to="/faculty/marks" 
                                            className="flex-1 bg-white text-blue-600 border border-blue-100 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white transition-all text-center"
                                        >
                                            Marks
                                        </Link>
                                    </div>
                                    {subject.classroom_id ? (
                                        <Link 
                                            to={`/faculty/classroom/${subject.classroom_id}`}
                                            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all text-center"
                                        >
                                            Go to Classroom
                                        </Link>
                                    ) : (
                                        <button 
                                            onClick={() => handleCreateClassroom(subject)}
                                            className="w-full bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 hover:text-white transition-all text-center"
                                        >
                                            Create Classroom
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Recent Announcements</h3>
                        <Link to="/faculty/announcements" className="text-sm text-blue-600 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {announcements.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No recent announcements.</p>
                        ) : (
                            announcements.map((announcement) => (
                                <div key={announcement.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Bell size={14} className="text-blue-600" />
                                        <span className="text-xs font-medium text-slate-500">
                                            {new Date(announcement.publish_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-1">{announcement.title}</h4>
                                    <p className="text-xs text-slate-600 line-clamp-2">{announcement.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
