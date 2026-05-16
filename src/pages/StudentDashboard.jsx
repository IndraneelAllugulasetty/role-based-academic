import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, FileText, GraduationCap, TrendingUp, Sparkles, AlertCircle, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({ attendance: "0%", cgpa: "0.00" });
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, attRes, aiRes, statsRes, announcementsRes] = await Promise.all([
                    api.get('/student/profile'),
                    api.get('/student/attendance'),
                    api.get('/student/ai-analysis'),
                    api.get('/student/stats'),
                    api.get('/announcements')
                ]);
                setProfile(profileRes.data.data);
                setAttendance(attRes.data.data);
                setAiAnalysis(aiRes.data.data);
                if (statsRes.data.data) {
                    setDashboardStats(statsRes.data.data);
                }

                // Filter announcements for student
                const filtered = announcementsRes.data.data.filter(a => 
                    a.visibility_scope === 'all' || 
                    a.visibility_scope === 'student' || 
                    (a.visibility_scope === 'department' && a.department_id === profileRes.data.data.department_id)
                ).slice(0, 3);
                setAnnouncements(filtered);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const overallAttendance = dashboardStats?.attendance ? String(dashboardStats.attendance).replace('%', '') : '0';

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome, {profile?.name}</h1>
                    <p className="text-slate-500">Roll No: {profile?.student_roll_no} | {profile?.department_name} | Sem {profile?.semester_number}</p>
                </div>
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <TrendingUp size={18} />
                    <span className="font-semibold">CGPA: {dashboardStats?.cgpa || '0.00'}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/student/attendance" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Calendar size={20} />
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${overallAttendance < 75 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {overallAttendance < 75 ? 'Low' : 'Good'}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500">Overall Attendance</p>
                    <p className="text-2xl font-bold text-slate-900">{overallAttendance}%</p>
                </Link>
                <Link to="/student/marks" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-green-200 transition-all group">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-all">
                        <FileText size={20} />
                    </div>
                    <p className="text-sm text-slate-500">Internal Marks Avg</p>
                    <p className="text-2xl font-bold text-slate-900">82%</p>
                </Link>
                <Link to="/student/results" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-purple-200 transition-all group">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <GraduationCap size={20} />
                    </div>
                    <p className="text-sm text-slate-500">Last Sem SGPA</p>
                    <p className="text-2xl font-bold text-slate-900">8.2</p>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AI Insights Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles size={24} className="text-blue-200" />
                            <h3 className="text-lg font-bold">AI Academic Insights</h3>
                        </div>
                        {aiAnalysis ? (
                            <div className="space-y-4">
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                                    <p className="text-sm font-medium mb-1 text-blue-100">Performance Summary</p>
                                    <p className="text-sm">{aiAnalysis.summary}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Risk Level:</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${aiAnalysis.risk_category === 'High Risk' ? 'bg-red-400' : aiAnalysis.risk_category === 'Medium Risk' ? 'bg-orange-400' : 'bg-green-400'}`}>
                                        {aiAnalysis.risk_category}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-blue-100">Suggestions:</p>
                                    <ul className="text-sm space-y-1">
                                        {aiAnalysis.suggestions.map((s, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-blue-300 rounded-full shrink-0" />
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm opacity-80">Generating insights...</p>
                        )}
                    </div>
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl" />
                </div>

                {/* Recent Announcements */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Recent Announcements</h3>
                        <Link to="/student/announcements" className="text-sm text-blue-600 hover:underline">View All</Link>
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

                {/* Attendance Chart */}
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold mb-6">Subject-wise Attendance</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={attendance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="subject_code" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="present_count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
