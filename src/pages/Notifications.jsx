import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Bell, CheckCircle2, AlertCircle, Info, Trash2, 
    CheckSquare, Clock, Loader2, ChevronRight, Inbox
} from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
            setMessage({ type: 'success', text: 'All notifications marked as read' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to mark all as read' });
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="text-green-600" size={20} />;
            case 'warning': return <AlertCircle className="text-orange-600" size={20} />;
            case 'error': return <AlertCircle className="text-red-600" size={20} />;
            default: return <Info className="text-blue-600" size={20} />;
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                        <p className="text-sm text-slate-500">Stay updated with the latest academic activities</p>
                    </div>
                </div>
                {notifications.length > 0 && (
                    <button 
                        onClick={markAllAsRead}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg transition-all"
                    >
                        <CheckSquare size={18} />
                        Mark all as read
                    </button>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
                            <Inbox size={40} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
                            <p className="text-slate-500">You don't have any new notifications at the moment.</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                className={`p-6 flex items-start gap-4 transition-all hover:bg-slate-50/80 group ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                    notif.type === 'success' ? 'bg-green-50' : 
                                    notif.type === 'warning' ? 'bg-orange-50' : 
                                    notif.type === 'error' ? 'bg-red-50' : 'bg-blue-50'
                                }`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className={`font-bold text-slate-900 ${!notif.is_read ? 'text-blue-900' : ''}`}>
                                                {notif.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                                {notif.message}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notif.is_read && (
                                                <button 
                                                    onClick={() => markAsRead(notif.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                                    title="Mark as read"
                                                >
                                                    <CheckSquare size={18} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => deleteNotification(notif.id)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                            <Clock size={14} />
                                            {new Date(notif.created_at).toLocaleString()}
                                        </span>
                                        {!notif.is_read && (
                                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
