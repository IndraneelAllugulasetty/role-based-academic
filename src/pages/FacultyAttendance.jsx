import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Check, X, Save, AlertCircle } from 'lucide-react';

const FacultyAttendance = () => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedSection, setSelectedSection] = useState('All');
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const sections = ['All', 'A', 'B', 'C', 'D'];

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await api.get('/faculty/subjects');
                setSubjects(res.data.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchSubjects();
    }, []);

    const fetchStudents = async (subjectId, section) => {
        setLoading(true);
        try {
            const queryParams = section && section !== 'All' ? `?section=${section}` : '';
            const res = await api.get(`/faculty/students/${subjectId}${queryParams}`);
            setStudents(res.data.data);
            const initialAttendance = {};
            res.data.data.forEach(s => initialAttendance[s.id] = 'Present');
            setAttendance(initialAttendance);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectChange = (e) => {
        const id = e.target.value;
        setSelectedSubject(id);
        if (id) fetchStudents(id, selectedSection);
        else setStudents([]);
    };

    const handleSectionChange = (e) => {
        const section = e.target.value;
        setSelectedSection(section);
        if (selectedSubject) fetchStudents(selectedSubject, section);
    };

    const toggleStatus = (studentId) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const handleSubmit = async () => {
        if (!selectedSubject) return;
        setLoading(true);
        try {
            const attendanceData = Object.keys(attendance).map(id => ({
                student_id: id,
                status: attendance[id]
            }));
            await api.post('/faculty/attendance', {
                subject_id: selectedSubject,
                attendance_date: date,
                attendance_data: attendanceData
            });
            setMessage({ type: 'success', text: 'Attendance marked successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to mark attendance.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mark Attendance</h1>
                    <p className="text-slate-500 text-sm">Select a subject and date to mark student attendance.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Select Subject</label>
                        <select 
                            value={selectedSubject}
                            onChange={handleSubjectChange}
                            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Select Subject --</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Select Section</label>
                        <select 
                            value={selectedSection}
                            onChange={handleSectionChange}
                            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {sections.map(sec => (
                                <option key={sec} value={sec}>{sec}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Date</label>
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                        <span>{message.text}</span>
                    </div>
                )}

                {students.length > 0 && (
                    <div className="space-y-6">
                        <div className="overflow-hidden border border-slate-100 rounded-lg">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Roll No</th>
                                        <th className="px-6 py-4 font-semibold">Name</th>
                                        <th className="px-6 py-4 font-semibold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{student.student_roll_no}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{student.name}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <button 
                                                        onClick={() => toggleStatus(student.id)}
                                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                            attendance[student.id] === 'Present' 
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        {attendance[student.id] === 'Present' ? <Check size={14} /> : <X size={14} />}
                                                        {attendance[student.id]}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end">
                            <button 
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors disabled:opacity-50"
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Attendance'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyAttendance;
