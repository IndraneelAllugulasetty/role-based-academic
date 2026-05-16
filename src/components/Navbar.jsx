import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, Settings, UserCircle, CheckCircle, Info, AlertCircle, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            const data = response.data.data;
            setNotifications(data.slice(0, 5)); // Show only latest 5
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Refresh every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return CheckCircle;
            case 'warning': return AlertCircle;
            case 'error': return AlertCircle;
            default: return Info;
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-30">
            <h2 className="text-lg font-semibold text-slate-800 capitalize">
                {user?.role} Portal
            </h2>
            <div className="flex items-center gap-6">
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-bold text-slate-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={markAllAsRead}
                                        className="text-xs text-blue-600 font-medium hover:underline"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">
                                        <Inbox className="mx-auto mb-2 opacity-20" size={32} />
                                        <p className="text-xs">No notifications</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => {
                                        const Icon = getIcon(notif.type);
                                        return (
                                            <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!notif.is_read ? 'bg-blue-50/30' : ''}`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                                    notif.type === 'info' ? 'bg-blue-50 text-blue-600' : 
                                                    notif.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                    <Icon size={18} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className={`text-sm font-bold text-slate-900 truncate ${!notif.is_read ? 'text-blue-900' : ''}`}>{notif.title}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-2">{new Date(notif.created_at).toLocaleDateString()}</p>
                                                </div>
                                                {!notif.is_read && (
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div className="p-3 text-center border-t border-slate-50">
                                <Link 
                                    to={`/${user?.role}/notifications`} 
                                    onClick={() => setShowNotifications(false)}
                                    className="text-sm text-slate-500 font-medium hover:text-slate-900"
                                >
                                    View all notifications
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button 
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-3 border-l pl-6 border-slate-200 group"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{user?.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showProfile ? 'bg-blue-600 text-white ring-4 ring-blue-50' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'}`}>
                            <User size={20} />
                        </div>
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-slate-50 bg-slate-50/50 sm:hidden">
                                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                            </div>
                            <div className="p-2">
                                <Link to={`/${user?.role}/profile`} className="flex items-center gap-3 p-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                    <UserCircle size={18} />
                                    <span className="text-sm font-medium">My Profile</span>
                                </Link>
                                <Link to={`/${user?.role}/settings`} className="flex items-center gap-3 p-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                    <Settings size={18} />
                                    <span className="text-sm font-medium">Settings</span>
                                </Link>
                            </div>
                            <div className="p-2 border-t border-slate-50">
                                <button 
                                    onClick={logout}
                                    className="flex items-center gap-3 p-2.5 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span className="text-sm font-medium">Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
