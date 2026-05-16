import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { BookOpen, Users, Save, Loader2, CheckCircle2, AlertCircle, Search, Filter } from 'lucide-react';

const FacultyMarks = () => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [assessmentType, setAssessmentType] = useState('Internal 1');
    const [maxMarks, setMaxMarks] = useState(20);
    const [marksData, setMarksData] = useState({});
    const [message, setMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [section, setSection] = useState('All');

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await api.get('/faculty/subjects');
                setSubjects(response.data.data);
                if (response.data.data.length > 0) {
                    setSelectedSubject(response.data.data[0].id);
                }
            } catch (error) {
                console.error('Error fetching subjects:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            const fetchStudents = async () => {
                setLoading(true);
                try {
                    const response = await api.get(`/faculty/students/${selectedSubject}?section=${section}`);
                    setStudents(response.data.data);
                    // Initialize marks data
                    const initialMarks = {};
                    response.data.data.forEach(s => {
                        initialMarks[s.id] = '';
                    });
                    setMarksData(initialMarks);
                } catch (error) {
                    console.error('Error fetching students:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchStudents();
        }
    }, [selectedSubject, section]);

    const handleMarkChange = (studentId, value) => {
        if (value === '' || (Number(value) >= 0 && Number(value) <= maxMarks)) {
            setMarksData({ ...marksData, [studentId]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                subject_id: selectedSubject,
                assessment_type: assessmentType,
                max_marks: maxMarks,
                marks_data: Object.entries(marksData)
                    .filter(([_, val]) => val !== '')
                    .map(([id, val]) => ({
                        student_id: id,
                        marks_obtained: Number(val)
                    }))
            };
            await api.post('/faculty/marks', payload);
            setMessage({ type: 'success', text: 'Internal marks saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save marks.' });
        } finally {
            setSaving(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.student_roll_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && subjects.length === 0) {
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
                    <h1 className="text-2xl font-bold text-slate-900">Internal Marks Entry</h1>
                    <p className="text-slate-500">Record assessment scores for your students</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                        <BookOpen size={18} className="text-slate-400" />
                        <select 
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="bg-transparent outline-none text-sm font-medium text-slate-700"
                        >
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                        <Filter size={18} className="text-slate-400" />
                        <select 
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            className="bg-transparent outline-none text-sm font-medium text-slate-700"
                        >
                            <option value="All">All Sections</option>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                            <option value="D">Section D</option>
                        </select>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Filter size={18} className="text-blue-600" />
                            Assessment Details
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assessment Type</label>
                                <select 
                                    value={assessmentType}
                                    onChange={(e) => setAssessmentType(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option>Internal 1</option>
                                    <option>Internal 2</option>
                                    <option>Assignment 1</option>
                                    <option>Assignment 2</option>
                                    <option>Quiz</option>
                                    <option>Lab Record</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Marks</label>
                                <input 
                                    type="number" 
                                    value={maxMarks}
                                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
                        <h3 className="font-bold mb-2">Pro Tip</h3>
                        <p className="text-sm opacity-90 leading-relaxed">
                            You can quickly enter marks and use the Tab key to move to the next student. 
                            Empty fields will not be saved.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by name or roll no..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-4 font-bold text-slate-700 text-sm">Student</th>
                                    <th className="p-4 font-bold text-slate-700 text-sm">Roll No</th>
                                    <th className="p-4 font-bold text-slate-700 text-sm">Section</th>
                                    <th className="p-4 font-bold text-slate-700 text-sm w-32 text-center">Marks Obtained</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center">
                                            <Loader2 className="animate-spin text-blue-600 mx-auto" size={24} />
                                        </td>
                                    </tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-slate-400">No students found.</td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-slate-900">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-600 text-sm font-mono">{student.student_roll_no}</td>
                                            <td className="p-4 text-slate-500 text-sm">{student.section}</td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <input 
                                                        type="number" 
                                                        value={marksData[student.id] || ''}
                                                        onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                        className="w-20 p-2 text-center bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                                        placeholder="-"
                                                    />
                                                    <span className="text-slate-400 text-xs">/ {maxMarks}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleSubmit}
                            disabled={saving || filteredStudents.length === 0}
                            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Save All Marks
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyMarks;
