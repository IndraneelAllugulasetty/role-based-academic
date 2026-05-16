import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react';

const StudentAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await api.get('/student/attendance');
                setAttendance(res.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const filteredAttendance = attendance.filter(record => {
        const matchesFilter = filter === 'All' || record.status === filter;
        const matchesSearch = record.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             record.subject_code.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = {
        total: attendance.length,
        present: attendance.filter(r => r.status === 'Present').length,
        absent: attendance.filter(r => r.status === 'Absent').length,
    };

    const percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Attendance</h1>
                    <p className="text-slate-500">Track your daily attendance across all subjects.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                            {percentage}%
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Overall</p>
                            <p className="text-sm font-bold text-slate-900">Attendance</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Classes</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Present</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.present}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Absent</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.absent}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Search by subject..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <select 
                            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAttendance.length > 0 ? (
                                filteredAttendance.map((record, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-slate-400" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {new Date(record.attendance_date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{record.subject_name}</p>
                                                <p className="text-xs text-slate-400">{record.subject_code}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                record.status === 'Present' 
                                                ? 'bg-green-50 text-green-600' 
                                                : 'bg-red-50 text-red-600'
                                            }`}>
                                                {record.status === 'Present' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                                        No attendance records found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendance;
