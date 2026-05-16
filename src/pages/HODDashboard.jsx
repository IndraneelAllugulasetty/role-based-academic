import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Users, UserCheck, BookOpen, AlertTriangle, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const HODDashboard = () => {
    const [stats, setStats] = useState({ students: 0, faculty: 0, subjects: 0 });
    const [announcements, setAnnouncements] = useState([]);
    const COLORS = ['#3b82f6', '#10b981', '#8b5cf6'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, announcementsRes] = await Promise.all([
                    api.get('/hod/stats'),
                    api.get('/announcements')
                ]);
                setStats(statsRes.data.data);
                
                // Filter announcements for HOD
                const filtered = announcementsRes.data.data.filter(a => 
                    a.visibility_scope === 'all' || 
                    a.visibility_scope === 'faculty' || 
                    (a.visibility_scope === 'department' && a.department_id === statsRes.data.data.department_id)
                ).slice(0, 3);
                setAnnouncements(filtered);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const chartData = [
        { name: 'Students', value: stats.students },
        { name: 'Faculty', value: stats.faculty },
        { name: 'Subjects', value: stats.subjects },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">HOD Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/hod/students" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Users size={20} />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+2 this week</span>
                    </div>
                    <p className="text-sm text-slate-500">Dept. Students</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.students}</p>
                </Link>
                <Link to="/hod/assignments" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-green-200 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                            <UserCheck size={20} />
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">Dept. Faculty</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.faculty}</p>
                </Link>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                            <BookOpen size={20} />
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">Dept. Subjects</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.subjects}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold mb-6">Department Composition</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Recent Announcements</h3>
                        <Link to="/hod/announcements" className="text-sm text-blue-600 hover:underline">View All</Link>
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

                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold mb-6">Attendance Alerts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                            <AlertTriangle size={24} />
                            <div>
                                <p className="font-medium">Low Attendance Warning</p>
                                <p className="text-sm opacity-80">12 students are below 75% attendance threshold.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-orange-50 text-orange-700 rounded-lg border border-orange-100">
                            <AlertTriangle size={24} />
                            <div>
                                <p className="font-medium">Performance Alert</p>
                                <p className="text-sm opacity-80">8 students scored below 40% in Internal 1.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HODDashboard;
