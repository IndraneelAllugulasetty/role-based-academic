import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
    Megaphone, Calendar, User, Globe, 
    Building2, Users, Loader2, Inbox, Clock
} from 'lucide-react';

const Announcements = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAnnouncements = async () => {
        try {
            const response = await api.get('/announcements');
            // Filter based on visibility_scope and department_id
            const filtered = response.data.data.filter(ann => {
                if (ann.visibility_scope === 'all') return true;
                if (ann.visibility_scope === 'department' && ann.department_id === user.department_id) return true;
                if (ann.visibility_scope === 'faculty' && (user.role === 'faculty' || user.role === 'hod' || user.role === 'admin')) return true;
                if (ann.visibility_scope === 'student' && (user.role === 'student' || user.role === 'admin')) return true;
                return false;
            });
            setAnnouncements(filtered);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const getScopeIcon = (scope) => {
        switch (scope) {
            case 'all': return <Globe size={14} />;
            case 'department': return <Building2 size={14} />;
            case 'faculty': return <Users size={14} />;
            case 'student': return <User size={14} />;
            default: return <Globe size={14} />;
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
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Megaphone size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
                    <p className="text-sm text-slate-500">Stay informed with the latest campus news and updates</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {announcements.length === 0 ? (
                    <div className="bg-white p-20 rounded-3xl border border-slate-100 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
                            <Inbox size={40} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">No announcements yet</h3>
                            <p className="text-slate-500">Check back later for new updates from the campus.</p>
                        </div>
                    </div>
                ) : (
                    announcements.map((ann) => (
                        <div key={ann.id} className="bg-white p-8 rounded-3xl border border-slate-100 space-y-4 hover:border-blue-200 transition-all group shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
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
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{ann.title}</h3>
                                </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                        <User size={14} className="text-slate-500" /> 
                                        {ann.creator_name || 'Administrator'}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                        <Clock size={14} className="text-slate-500" /> 
                                        {new Date(ann.publish_date).toLocaleDateString(undefined, { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Announcements;
