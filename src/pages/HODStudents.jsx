import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Search, Filter, Loader2, User, Mail, Hash, BookOpen } from 'lucide-react';

const HODStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSemester, setFilterSemester] = useState('All');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await api.get('/hod/students');
                setStudents(response.data.data);
            } catch (error) {
                console.error('Error fetching students:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            student.student_roll_no.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSemester = filterSemester === 'All' || student.semester_number.toString() === filterSemester;
        return matchesSearch && matchesSemester;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Department Students</h1>
                    <p className="text-slate-500">View and manage students enrolled in your department</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all w-64 shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                        <Filter size={18} className="text-slate-400" />
                        <select 
                            value={filterSemester}
                            onChange={(e) => setFilterSemester(e.target.value)}
                            className="bg-transparent outline-none text-sm font-medium text-slate-700"
                        >
                            <option value="All">All Semesters</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <option key={sem} value={sem.toString()}>Semester {sem}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.length === 0 ? (
                    <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-500">
                        No students found matching your criteria.
                    </div>
                ) : (
                    filteredStudents.map((student) => (
                        <div key={student.id} className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <User size={24} />
                                </div>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">
                                    Sem {student.semester_number}
                                </span>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-all">
                                        {student.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                        <Mail size={14} />
                                        <span>{student.email}</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Hash size={14} />
                                        <span className="font-medium">{student.student_roll_no}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <BookOpen size={14} />
                                        <span>{student.section || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HODStudents;
