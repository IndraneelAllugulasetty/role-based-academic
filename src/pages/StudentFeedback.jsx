import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Star, Loader2 } from 'lucide-react';

const StudentFeedback = () => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({
        faculty_id: '',
        rating: 5,
        comments: '',
        is_anonymous: false
    });

    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const res = await api.get('/student/faculty');
                setFaculty(res.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaculty();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.faculty_id) {
            setMessage({ type: 'error', text: 'Please select a faculty member.' });
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/student/feedback', formData);
            setMessage({ type: 'success', text: 'Feedback submitted successfully! Thank you for your input.' });
            setFormData({ faculty_id: '', rating: 5, comments: '', is_anonymous: false });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to submit feedback. Please try again later.' });
        } finally {
            setSubmitting(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Faculty Feedback</h1>
                <p className="text-slate-500">Your feedback helps us improve the quality of education and support.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Submit New Feedback</h2>
                            <p className="text-sm text-slate-500">Share your thoughts about your instructors</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {message && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Select Faculty</label>
                            <select 
                                required
                                value={formData.faculty_id}
                                onChange={(e) => setFormData({...formData, faculty_id: e.target.value})}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="">-- Choose Instructor --</option>
                                {faculty.map(f => (
                                    <option key={f.faculty_employee_id} value={f.faculty_employee_id}>
                                        {f.name} ({f.designation})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Rating (1-5 Stars)</label>
                            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({...formData, rating: star})}
                                        className={`transition-all ${formData.rating >= star ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-200'}`}
                                    >
                                        <Star size={28} fill={formData.rating >= star ? 'currentColor' : 'none'} />
                                    </button>
                                ))}
                                <span className="ml-2 font-bold text-slate-600">{formData.rating}/5</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Your Comments</label>
                        <textarea 
                            required
                            value={formData.comments}
                            onChange={(e) => setFormData({...formData, comments: e.target.value})}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-40 resize-none"
                            placeholder="What did you like? What could be improved? Be as specific as possible."
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <input 
                            type="checkbox"
                            id="anonymous"
                            checked={formData.is_anonymous}
                            onChange={(e) => setFormData({...formData, is_anonymous: e.target.checked})}
                            className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="anonymous" className="text-sm font-medium text-blue-900 cursor-pointer">
                            Submit anonymously (Your name will not be shown to the faculty)
                        </label>
                    </div>

                    <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        Submit Feedback
                    </button>
                </form>
            </div>

            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
                <AlertCircle className="text-amber-600 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-amber-900">Important Note</h4>
                    <p className="text-sm text-amber-800 opacity-80">
                        Feedback is used for constructive improvement. Please maintain professional language and be honest in your assessment. 
                        Anonymous feedback still follows institutional guidelines for conduct.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudentFeedback;
