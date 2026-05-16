import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
    FileText, Download, Clock, Plus, Loader2, 
    CheckCircle2, AlertCircle, Send, Trash2, 
    Calendar, User, BookOpen, ChevronRight, Users, TrendingUp, BarChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as ReBarChart, Bar } from 'recharts';

const ClassroomDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [details, setDetails] = useState({ materials: [], assignments: [] });
    const [students, setStudents] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('materials');
    const [showPostModal, setShowPostModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [postType, setPostType] = useState('material'); // 'material' or 'assignment'
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file_url: '',
        file_type: 'PDF',
        due_date: '',
        max_marks: 100
    });
    const [submissionData, setSubmissionData] = useState({
        submission_text: '',
        file_url: ''
    });
    const [message, setMessage] = useState(null);

    const fetchDetails = async () => {
        try {
            const response = await api.get(`/classroom/${id}/details`);
            setDetails(response.data.data);
            
            if (user.role !== 'student') {
                const studentsRes = await api.get(`/classroom/${id}/students`);
                setStudents(studentsRes.data.data);
            }
            
            const analyticsRes = await api.get(`/classroom/${id}/analytics`);
            setAnalytics(analyticsRes.data.data);
        } catch (error) {
            console.error('Error fetching classroom details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const handlePost = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = postType === 'material' ? '/classroom/post-material' : '/classroom/post-assignment';
            await api.post(endpoint, { ...formData, classroom_id: id });
            setMessage({ type: 'success', text: `${postType === 'material' ? 'Material' : 'Assignment'} posted successfully!` });
            setShowPostModal(false);
            setFormData({ title: '', description: '', file_url: '', file_type: 'PDF', due_date: '', max_marks: 100 });
            fetchDetails();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to post content.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAssignment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/classroom/submit-assignment', {
                ...submissionData,
                assignment_id: selectedAssignment.id
            });
            setMessage({ type: 'success', text: 'Assignment submitted successfully!' });
            setShowSubmitModal(false);
            setSubmissionData({ submission_text: '', file_url: '' });
            fetchDetails();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to submit assignment.' });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !details.materials.length && !details.assignments.length) {
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
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Classroom Content</h1>
                        <p className="text-sm text-slate-500">Manage and access course resources</p>
                    </div>
                </div>
                {(user.role === 'faculty' || user.role === 'hod' || user.role === 'admin') && (
                    <div className="flex gap-3">
                        <button 
                            onClick={() => { setPostType('material'); setShowPostModal(true); }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md"
                        >
                            <Plus size={18} />
                            <span>Post Material</span>
                        </button>
                        <button 
                            onClick={() => { setPostType('assignment'); setShowPostModal(true); }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md"
                        >
                            <Plus size={18} />
                            <span>Post Assignment</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
                <button 
                    onClick={() => setActiveTab('materials')}
                    className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'materials' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Study Materials
                </button>
                <button 
                    onClick={() => setActiveTab('assignments')}
                    className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'assignments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Assignments
                </button>
                {user.role !== 'student' && (
                    <button 
                        onClick={() => setActiveTab('students')}
                        className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'students' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Students
                    </button>
                )}
                <button 
                    onClick={() => setActiveTab('analytics')}
                    className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    {user.role === 'student' ? 'My Performance' : 'Analytics'}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            {activeTab === 'materials' ? (
                <div className="grid grid-cols-1 gap-4">
                    {details.materials.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-500">
                            No materials posted yet.
                        </div>
                    ) : (
                        details.materials.map((material) => (
                            <div key={material.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-blue-200 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{material.title}</h3>
                                        <p className="text-sm text-slate-500">{material.description}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(material.created_at).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><FileText size={12} /> {material.file_type}</span>
                                        </div>
                                    </div>
                                </div>
                                <a 
                                    href={material.file_url || '#'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                >
                                    <Download size={20} />
                                </a>
                            </div>
                        ))
                    )}
                </div>
            ) : activeTab === 'assignments' ? (
                <div className="grid grid-cols-1 gap-4">
                    {details.assignments.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-500">
                            No assignments posted yet.
                        </div>
                    ) : (
                        details.assignments.map((assignment) => (
                            <div key={assignment.id} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 hover:border-indigo-200 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{assignment.title}</h3>
                                            <p className="text-sm text-slate-500">{assignment.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Due Date</p>
                                        <p className="text-sm font-bold text-red-600 flex items-center gap-1 justify-end">
                                            <Clock size={14} />
                                            {new Date(assignment.due_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span className="bg-slate-100 px-2 py-1 rounded-md font-bold">Max Marks: {assignment.max_marks}</span>
                                        {assignment.file_url && (
                                            <a href={assignment.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                <Download size={14} /> View Attachment
                                            </a>
                                        )}
                                    </div>
                                    {user.role === 'student' && (
                                        <button 
                                            onClick={() => { setSelectedAssignment(assignment); setShowSubmitModal(true); }}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                                        >
                                            <Send size={16} />
                                            Submit Assignment
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : activeTab === 'students' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((student) => (
                        <div key={student.id} className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{student.name}</h3>
                                    <p className="text-xs text-slate-500">{student.student_roll_no}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    {user.role === 'student' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-blue-600" />
                                    My Attendance
                                </h3>
                                <div className="flex items-center justify-center py-8">
                                    <div className="relative w-32 h-32">
                                        <svg className="w-full h-full" viewBox="0 0 36 36">
                                            <path className="text-slate-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                            <path className="text-blue-600" strokeDasharray={`${analytics?.attendancePercentage || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-bold text-slate-900">{analytics?.attendancePercentage || 0}%</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">Present</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4 text-center border-t border-slate-50 pt-4">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Total Classes</p>
                                        <p className="text-lg font-bold text-slate-900">{analytics?.totalClasses || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold">Attended</p>
                                        <p className="text-lg font-bold text-blue-600">{analytics?.presentClasses || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <BarChart size={20} className="text-green-600" />
                                    Internal Marks
                                </h3>
                                <div className="space-y-4">
                                    {analytics?.marks?.length === 0 ? (
                                        <p className="text-center text-slate-400 py-8">No marks recorded yet.</p>
                                    ) : (
                                        analytics?.marks?.map((m, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                <span className="font-medium text-slate-700">{m.assessment_type}</span>
                                                <span className="font-bold text-slate-900">{m.marks_obtained} / {m.max_marks}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-blue-600" />
                                    Attendance Trend
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analytics?.attendanceTrend}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Users size={20} className="text-green-600" />
                                    Class Overview
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-4 bg-blue-50 rounded-2xl text-center">
                                        <p className="text-xs text-blue-600 font-bold uppercase mb-1">Avg. Attendance</p>
                                        <p className="text-3xl font-bold text-blue-700">{analytics?.avgAttendance}%</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-2xl text-center">
                                        <p className="text-xs text-green-600 font-bold uppercase mb-1">Submissions</p>
                                        <p className="text-3xl font-bold text-green-700">{analytics?.submissionRate}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Submit Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900">Submit Assignment</h3>
                            <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600 transition-all">
                                <Trash2 size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitAssignment} className="p-6 space-y-4">
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <p className="text-xs font-bold text-blue-600 uppercase mb-1">Assignment</p>
                                <p className="font-bold text-slate-900">{selectedAssignment?.title}</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Submission Text / Notes</label>
                                <textarea 
                                    value={submissionData.submission_text}
                                    onChange={(e) => setSubmissionData({...submissionData, submission_text: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32"
                                    placeholder="Add any notes for your submission..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">File URL (Google Drive/Dropbox link)</label>
                                <input 
                                    type="text" 
                                    value={submissionData.file_url}
                                    onChange={(e) => setSubmissionData({...submissionData, file_url: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="https://..."
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                Submit Now
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Post Modal */}
            {showPostModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900">Post {postType === 'material' ? 'Study Material' : 'Assignment'}</h3>
                            <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600 transition-all">
                                <Trash2 size={24} />
                            </button>
                        </div>
                        <form onSubmit={handlePost} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Enter title"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Description</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24"
                                    placeholder="Enter description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">File URL</label>
                                    <input 
                                        type="text" 
                                        value={formData.file_url}
                                        onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">{postType === 'material' ? 'File Type' : 'Max Marks'}</label>
                                    {postType === 'material' ? (
                                        <select 
                                            value={formData.file_type}
                                            onChange={(e) => setFormData({...formData, file_type: e.target.value})}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        >
                                            <option>PDF</option>
                                            <option>DOCX</option>
                                            <option>PPTX</option>
                                            <option>Video</option>
                                            <option>Link</option>
                                        </select>
                                    ) : (
                                        <input 
                                            type="number" 
                                            value={formData.max_marks}
                                            onChange={(e) => setFormData({...formData, max_marks: e.target.value})}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    )}
                                </div>
                            </div>
                            {postType === 'assignment' && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Due Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            )}
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                Post {postType === 'material' ? 'Material' : 'Assignment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassroomDetail;
