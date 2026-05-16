import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Mail, Shield, Building, Hash, Calendar, Phone, MapPin, Edit2, Camera, Loader2, Save, X, GraduationCap, AlertCircle } from 'lucide-react';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dob: '',
        designation: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                let endpoint = '/auth/me';
                if (user?.role === 'student') endpoint = '/student/profile';
                if (user?.role === 'admin') endpoint = '/admin/profile';
                
                const res = await api.get(endpoint);
                const data = res.data.data || res.data;
                setProfileData(data);
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    dob: data.dob ? data.dob.split('T')[0] : '',
                    designation: data.designation || ''
                });
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile information.');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchProfile();
    }, [user]);

    const [updateError, setUpdateError] = useState(null);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setUpdateError(null);
            const res = await api.put('/auth/update-profile', formData);
            setProfileData(prev => ({ ...prev, ...formData }));
            updateUser(res.data.data);
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            setUpdateError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-medium">Loading your profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-100 p-6 rounded-xl text-center">
                <p className="text-red-600 font-medium">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    const displayData = profileData || user;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                    >
                        <Edit2 size={18} />
                        <span>Edit Profile</span>
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 transition-all"
                        >
                            <X size={18} />
                            <span>Cancel</span>
                        </button>
                        <button 
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            <span>Save Changes</span>
                        </button>
                    </div>
                )}
            </div>

            {updateError && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600">
                    <AlertCircle size={18} />
                    <p className="text-sm font-medium">{updateError}</p>
                </div>
            )}

            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="relative group">
                            <div className="w-32 h-32 bg-white rounded-2xl p-1 shadow-lg">
                                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden">
                                    {displayData?.avatar ? (
                                        <img src={displayData.avatar} alt={displayData.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={64} />
                                    )}
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {isEditing ? (
                            <input 
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="text-2xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <h2 className="text-2xl font-bold text-slate-900">{displayData?.name}</h2>
                        )}
                        <p className="text-slate-500 font-medium flex items-center gap-2">
                            <Shield size={16} className="text-blue-600" />
                            <span className="capitalize">{displayData?.role}</span>
                            {displayData?.department_name && (
                                <>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-slate-600">{displayData.department_name}</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <User size={20} className="text-blue-600" />
                        Personal Information
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                <Mail size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                                {isEditing ? (
                                    <input 
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full text-slate-900 font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-slate-900 font-medium">{displayData?.email}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                <Phone size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                                {isEditing ? (
                                    <input 
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full text-slate-900 font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-slate-900 font-medium">{displayData?.phone || 'Not provided'}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                <Calendar size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                                {isEditing ? (
                                    <input 
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                        className="w-full text-slate-900 font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-slate-900 font-medium">
                                        {displayData?.dob ? new Date(displayData.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not provided'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Academic/Professional Information */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <GraduationCap size={20} className="text-blue-600" />
                        {user?.role === 'student' ? 'Academic Details' : 'Professional Details'}
                    </h3>
                    <div className="space-y-4">
                        {user?.role === 'student' ? (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                        <Hash size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Roll Number</p>
                                        <p className="text-slate-900 font-medium">{displayData?.student_roll_no}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Semester</p>
                                        <p className="text-slate-900 font-medium">Semester {displayData?.semester_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                        <Building size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Batch Year</p>
                                        <p className="text-slate-900 font-medium">{displayData?.batch_year}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                        <Hash size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            {user?.role === 'admin' ? 'Admin ID' : 'Employee ID'}
                                        </p>
                                        <p className="text-slate-900 font-medium">
                                            {user?.role === 'admin' 
                                                ? `ADM-${String(displayData?.id).padStart(3, '0')}` 
                                                : (displayData?.faculty_employee_id || displayData?.id)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                        <Building size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</p>
                                        <p className="text-slate-900 font-medium">{displayData?.department_name || 'Administration'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                        <Shield size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Designation</p>
                                        {isEditing ? (
                                            <input 
                                                type="text"
                                                value={formData.designation}
                                                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                                                className="w-full text-slate-900 font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-slate-900 font-medium">
                                                {displayData?.designation || (user?.role === 'admin' ? 'System Administrator' : 'Staff')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
