import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
    Settings as SettingsIcon, Lock, Bell, Eye, Shield, 
    Smartphone, Moon, Globe, Trash2, Save, Loader2,
    CheckCircle2, AlertCircle
} from 'lucide-react';

const Settings = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        try {
            setLoading(true);
            setMessage(null);
            await api.put('/auth/change-password', passwordData);
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error('Error changing password:', err);
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
        } finally {
            setLoading(false);
        }
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDeleteAccount = async () => {
        try {
            setLoading(true);
            await api.delete('/auth/delete-account');
            logout();
        } catch (err) {
            console.error('Error deleting account:', err);
            setMessage({ type: 'error', text: 'Failed to delete account.' });
            setShowDeleteConfirm(false);
        } finally {
            setLoading(false);
        }
    };

    const sections = [
        { id: 'account', name: 'Account Settings', icon: Lock },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'privacy', name: 'Privacy & Security', icon: Shield },
        { id: 'appearance', name: 'Appearance', icon: Moon },
    ];

    const [activeSection, setActiveSection] = useState('account');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:w-64 shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 space-y-1">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${
                                    activeSection === section.id 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <section.icon size={18} />
                                <span>{section.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-6">
                    {activeSection === 'account' && (
                        <div className="space-y-6">
                            {/* Password Change Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                            <Lock size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">Change Password</h3>
                                            <p className="text-xs text-slate-500">Update your account security</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                        {message && (
                                            <div className={`p-4 rounded-xl flex items-center gap-3 ${
                                                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                            }`}>
                                                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                                <p className="text-sm font-medium">{message.text}</p>
                                            </div>
                                        )}
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700">Current Password</label>
                                            <input 
                                                type="password" 
                                                required
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700">New Password</label>
                                            <input 
                                                type="password" 
                                                required
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                                            <input 
                                                type="password" 
                                                required
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                            Update Password
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-50 rounded-2xl border border-red-100 p-6 space-y-4">
                                <div className="flex items-center gap-3 text-red-600">
                                    <Trash2 size={24} />
                                    <h3 className="font-bold">Danger Zone</h3>
                                </div>
                                <p className="text-sm text-red-700">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                {!showDeleteConfirm ? (
                                    <button 
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                                    >
                                        Delete Account
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <p className="text-sm font-bold text-red-800">Are you absolutely sure?</p>
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={handleDeleteAccount}
                                                disabled={loading}
                                                className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Yes, Delete Everything"}
                                            </button>
                                            <button 
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-300 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
                            <h3 className="font-bold text-slate-900">Notification Preferences</h3>
                            <div className="space-y-4">
                                {[
                                    { title: 'Email Notifications', desc: 'Receive daily updates via email' },
                                    { title: 'Push Notifications', desc: 'Receive alerts on your device' },
                                    { title: 'Academic Alerts', desc: 'Get notified about marks and attendance' },
                                    { title: 'Event Reminders', desc: 'Reminders for upcoming college events' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <p className="font-bold text-slate-900">{item.title}</p>
                                            <p className="text-xs text-slate-500">{item.desc}</p>
                                        </div>
                                        <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'appearance' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
                            <h3 className="font-bold text-slate-900">Theme Settings</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { id: 'light', name: 'Light Mode', icon: Globe },
                                    { id: 'dark', name: 'Dark Mode', icon: Moon },
                                    { id: 'system', name: 'System Default', icon: Smartphone }
                                ].map((t) => (
                                    <button 
                                        key={t.id}
                                        onClick={() => handleThemeChange(t.id)}
                                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                                            theme === t.id 
                                            ? 'border-blue-600 bg-blue-50 text-blue-600' 
                                            : 'border-slate-100 hover:border-slate-200 text-slate-500'
                                        }`}
                                    >
                                        <t.icon size={32} />
                                        <span className="font-bold text-sm">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
