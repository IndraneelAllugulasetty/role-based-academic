import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Megaphone, Plus, Trash2, Calendar, 
    User, Globe, Building2, Users, 
    Loader2, CheckCircle2, AlertCircle, Send
} from 'lucide-react';

const AdminAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        visibility_scope: 'all',
        department_id: '',
        publish_date: new Date().toISOString().split('T')[0]
    });

    const fetchData = async () => {
        try {
            const [annRes, deptRes] = await Promise.all([
                api.get('/admin/notices'),
                api.get('/admin/departments')
            ]);
            setAnnouncements(annRes.data.data);
            setDepartments(deptRes.data.data);
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
            await api.post('/admin/notices', formData);
            setMessage({ type: 'success', text: 'Announcement posted successfully!' });
            setShowModal(false);
            setFormData({
                title: '',
                content: '',
                visibility_scope: 'all',
                department_id: '',
                publish_date: new Date().toISOString().split('T')[0]
            });
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to post announcement.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await api.delete(`/admin/notices/${id}`);
            setMessage({ type: 'success', text: 'Announcement deleted successfully!' });
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete announcement.' });
        } finally {
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const getScopeIcon = (scope) => {
        switch (scope) {
            case 'all': return <Globe size={14} />;
            case 'department': return <Building2 size={14} />;
            case 'faculty': return <Users size={14} />;
            case 'student': return <User size={14} />;
            default: return <Globe size={14} />;
        }
    };

    if (loading && announcements.length === 0) {
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
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
                        <p className="text-sm text-slate-500">Post and manage campus-wide notices</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold"
                >
                    <Plus size={20} />
                    <span>Post New Notice</span>
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {announcements.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-500">
                        No announcements posted yet.
                    </div>
                ) : (
                    announcements.map((ann) => (
                        <div key={ann.id} className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4 hover:border-blue-200 transition-all group">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                            ann.visibility_scope === 'all' ? 'bg-blue-50 text-blue-600' :
                                            ann.visibility_scope === 'department' ? 'bg-purple-50 text-purple-600' :
                                            ann.visibility_scope === 'faculty' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                                        }`}>
                                            {getScopeIcon(ann.visibility_scope)}
                                            {ann.visibility_scope}
                                        </span>
                                        {ann.department_name && (
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                • {ann.department_name}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{ann.title}</h3>
                                </div>
                                <button 
                                    onClick={() => handleDelete(ann.id)}
                                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">{ann.content}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                    <span className="flex items-center gap-1.5"><User size={14} /> {ann.creator_name}</span>
                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(ann.publish_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Post Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900">Post New Notice</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-all">
                                <Trash2 size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Enter notice title"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Content</label>
                                <textarea 
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32"
                                    placeholder="Enter notice content..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Visibility Scope</label>
                                    <select 
                                        value={formData.visibility_scope}
                                        onChange={(e) => setFormData({...formData, visibility_scope: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    >
                                        <option value="all">All</option>
                                        <option value="department">Department</option>
                                        <option value="faculty">Faculty Only</option>
                                        <option value="student">Students Only</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Publish Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={formData.publish_date}
                                        onChange={(e) => setFormData({...formData, publish_date: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            {formData.visibility_scope === 'department' && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Select Department</label>
                                    <select 
                                        required
                                        value={formData.department_id}
                                        onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    >
                                        <option value="">-- Select Department --</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                Post Announcement
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAnnouncements;
