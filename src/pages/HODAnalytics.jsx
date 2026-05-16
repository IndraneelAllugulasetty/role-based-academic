import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, BookOpen, AlertCircle, Loader2, Download } from 'lucide-react';

const HODAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/hod/analytics');
                setStats(response.data.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Department Analytics</h1>
                    <p className="text-slate-500">Comprehensive performance and attendance insights</p>
                </div>
                <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all shadow-sm">
                    <Download size={18} />
                    <span>Export Report</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Avg. Attendance</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-bold text-slate-900">{stats?.avgAttendance || '82'}%</h3>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 mb-1">
                            <TrendingUp size={10} />
                            +2.4%
                        </span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Pass Percentage</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-bold text-slate-900">{stats?.passPercentage || '91'}%</h3>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 mb-1">
                            <TrendingUp size={10} />
                            +1.2%
                        </span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Active Classrooms</p>
                    <h3 className="text-3xl font-bold text-slate-900">{stats?.activeClassrooms || '24'}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 mb-1">Total Faculty</p>
                    <h3 className="text-3xl font-bold text-slate-900">{stats?.totalFaculty || '18'}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-600" />
                        Attendance Trends
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats?.attendanceTrend || [
                                { month: 'Jan', attendance: 85 },
                                { month: 'Feb', attendance: 88 },
                                { month: 'Mar', attendance: 82 },
                                { month: 'Apr', attendance: 86 },
                                { month: 'May', attendance: 90 },
                                { month: 'Jun', attendance: 84 },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                    itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                                />
                                <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6, strokeWidth: 0}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Users size={20} className="text-green-600" />
                        Student Distribution by Semester
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.semesterDistribution || [
                                { semester: 'Sem 1', students: 120 },
                                { semester: 'Sem 2', students: 115 },
                                { semester: 'Sem 3', students: 108 },
                                { semester: 'Sem 4', students: 112 },
                                { semester: 'Sem 5', students: 95 },
                                { semester: 'Sem 6', students: 98 },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="semester" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                />
                                <Bar dataKey="students" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <BookOpen size={20} className="text-purple-600" />
                        Subject Performance
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.subjectPerformance || [
                                        { name: 'Excellent', value: 35 },
                                        { name: 'Good', value: 45 },
                                        { name: 'Average', value: 15 },
                                        { name: 'Below Avg', value: 5 },
                                    ]}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {[0, 1, 2, 3].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <AlertCircle size={20} className="text-red-600" />
                        Critical Alerts
                    </h3>
                    <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
                        {[
                            { title: 'Low Attendance', desc: '12 students in Sem 4 are below 75%', severity: 'high' },
                            { title: 'Faculty Leave', desc: 'Dr. Sarah is on leave for 3 days', severity: 'medium' },
                            { title: 'Exam Schedule', desc: 'Internal 2 starts next week', severity: 'low' },
                            { title: 'Resource Shortage', desc: 'Lab 3 requires maintenance', severity: 'medium' },
                        ].map((alert, i) => (
                            <div key={i} className={`p-4 rounded-xl border flex items-start gap-4 ${
                                alert.severity === 'high' ? 'bg-red-50 border-red-100 text-red-700' :
                                alert.severity === 'medium' ? 'bg-orange-50 border-orange-100 text-orange-700' :
                                'bg-blue-50 border-blue-100 text-blue-700'
                            }`}>
                                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                                    alert.severity === 'high' ? 'bg-red-500' :
                                    alert.severity === 'medium' ? 'bg-orange-500' :
                                    'bg-blue-500'
                                }`} />
                                <div>
                                    <p className="font-bold text-sm">{alert.title}</p>
                                    <p className="text-xs opacity-80 mt-0.5">{alert.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HODAnalytics;
