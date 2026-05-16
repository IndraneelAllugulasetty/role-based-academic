import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileText, TrendingUp, AlertCircle, Search, Filter, BookOpen } from 'lucide-react';

const StudentMarks = () => {
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchMarks = async () => {
            try {
                const res = await api.get('/student/marks');
                setMarks(res.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchMarks();
    }, []);

    const filteredMarks = marks.filter(record => {
        const matchesFilter = filter === 'All' || record.exam_type === filter;
        const matchesSearch = record.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             record.subject_code.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const examTypes = ['All', ...new Set(marks.map(m => m.exam_type))];

    const averagePercentage = marks.length > 0 
        ? (marks.reduce((acc, curr) => acc + (curr.marks_obtained / curr.max_marks), 0) / marks.length * 100).toFixed(1)
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Internal Marks</h1>
                    <p className="text-slate-500">View your performance in internal assessments and mid-terms.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold">
                        {averagePercentage}%
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Average</p>
                        <p className="text-sm font-bold text-slate-900">Performance</p>
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
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <select 
                            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            {examTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Assessment Type</th>
                                <th className="px-6 py-4">Marks Obtained</th>
                                <th className="px-6 py-4">Max Marks</th>
                                <th className="px-6 py-4">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredMarks.length > 0 ? (
                                filteredMarks.map((record, index) => {
                                    const percent = ((record.marks_obtained / record.max_marks) * 100).toFixed(1);
                                    return (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center">
                                                        <BookOpen size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{record.subject_name}</p>
                                                        <p className="text-xs text-slate-400">{record.subject_code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-600">{record.exam_type}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-900">{record.marks_obtained}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-500">{record.max_marks}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                                                        <div 
                                                            className={`h-full rounded-full ${percent < 40 ? 'bg-red-500' : percent < 75 ? 'bg-orange-500' : 'bg-green-500'}`}
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs font-bold ${percent < 40 ? 'text-red-600' : percent < 75 ? 'text-orange-600' : 'text-green-600'}`}>
                                                        {percent}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        No marks records found matching your criteria.
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

export default StudentMarks;
