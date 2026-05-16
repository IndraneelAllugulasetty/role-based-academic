import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Users, BookOpen, UserCheck, Bell, Calendar, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ students: 0, faculty: 0, departments: 0 });
    const [announcements, setAnnouncements] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, annRes, eventRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/announcements'),
                    api.get('/events')
                ]);
                setStats(statsRes.data.data);
                setAnnouncements(annRes.data.data.slice(0, 3));
                setEvents(eventRes.data.data.slice(0, 3));
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const chartData = [
        { name: 'Students', count: stats.students },
        { name: 'Faculty', count: stats.faculty },
        { name: 'Departments', count: stats.departments },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/admin/students" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-blue-200 transition-all group">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Students</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.students}</p>
                    </div>
                </Link>
                <Link to="/admin/faculty" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-green-200 transition-all group">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Faculty</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.faculty}</p>
                    </div>
                </Link>
                <Link to="/admin/departments" className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-purple-200 transition-all group">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Departments</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.departments}</p>
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold mb-6">Institution Overview</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Announcements */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Recent Announcements</h3>
                        <Link to="/admin/announcements" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {announcements.map((ann) => (
                            <div key={ann.id} className="p-4 bg-slate-50 rounded-lg">
                                <h4 className="font-medium text-slate-900">{ann.title}</h4>
                                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{ann.content}</p>
                                <p className="text-xs text-slate-400 mt-2">{new Date(ann.publish_date).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Upcoming Events</h3>
                    <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-slate-400" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div key={event.id} className="border border-slate-100 p-4 rounded-lg hover:border-blue-200 transition-colors">
                            <div className="text-blue-600 font-bold mb-2">
                                {new Date(event.event_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </div>
                            <h4 className="font-medium text-slate-900">{event.title}</h4>
                            <p className="text-sm text-slate-500 mt-1">{event.location}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
