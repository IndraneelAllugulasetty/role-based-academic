import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { GraduationCap, Award, TrendingUp, BookOpen, Search, Filter } from 'lucide-react';

const StudentResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await api.get('/student/results');
                setResults(res.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const filteredResults = results.filter(record => {
        const matchesFilter = filter === 'All' || record.semester_number === parseInt(filter);
        const matchesSearch = record.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             record.subject_code.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const semesters = ['All', ...new Set(results.map(r => r.semester_number))];

    const sgpa = results.length > 0 
        ? (results.reduce((acc, curr) => acc + parseFloat(curr.grade_points), 0) / results.length).toFixed(2)
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Semester Results</h1>
                    <p className="text-slate-500">View your final grades and SGPA for each semester.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center font-bold">
                        {sgpa}
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Overall</p>
                        <p className="text-sm font-bold text-slate-900">SGPA</p>
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
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <select 
                            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            {semesters.map(sem => (
                                <option key={sem} value={sem}>{sem === 'All' ? 'All Semesters' : `Semester ${sem}`}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Semester</th>
                                <th className="px-6 py-4">Grade</th>
                                <th className="px-6 py-4">Grade Points</th>
                                <th className="px-6 py-4">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredResults.length > 0 ? (
                                filteredResults.map((record, index) => (
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
                                            <span className="text-sm font-medium text-slate-600">Semester {record.semester_number}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                                                ['A+', 'A', 'B+'].includes(record.grade) 
                                                ? 'bg-green-50 text-green-600' 
                                                : record.grade === 'F' 
                                                ? 'bg-red-50 text-red-600' 
                                                : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                {record.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-900">{record.grade_points}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                record.result_status === 'Pass' 
                                                ? 'bg-green-50 text-green-600' 
                                                : 'bg-red-50 text-red-600'
                                            }`}>
                                                {record.result_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        No result records found matching your criteria.
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

export default StudentResults;
