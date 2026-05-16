import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, Users, BookOpen, Calendar, 
    Bell, MessageSquare, FileText, LogOut, GraduationCap, UserCheck, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const adminLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Students', path: '/admin/students', icon: Users },
        { name: 'Faculty', path: '/admin/faculty', icon: UserCheck },
        { name: 'HODs', path: '/admin/hods', icon: ShieldCheck },
        { name: 'Departments', path: '/admin/departments', icon: BookOpen },
        { name: 'Semesters', path: '/admin/semesters', icon: Calendar },
        { name: 'Announcements', path: '/admin/announcements', icon: Bell },
        { name: 'Notifications', path: '/admin/notifications', icon: Bell },
        { name: 'Classrooms', path: '/admin/classroom', icon: BookOpen },
    ];

    const hodLinks = [
        { name: 'Dashboard', path: '/hod/dashboard', icon: LayoutDashboard },
        { name: 'Classroom', path: '/hod/classroom', icon: BookOpen },
        { name: 'Notifications', path: '/hod/notifications', icon: Bell },
        { name: 'Faculty Assignment', path: '/hod/assignments', icon: UserCheck },
        { name: 'Department Students', path: '/hod/students', icon: Users },
        { name: 'Announcements', path: '/hod/announcements', icon: Bell },
        { name: 'Analytics', path: '/hod/analytics', icon: FileText },
    ];

    const facultyLinks = [
        { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
        { name: 'Classroom', path: '/faculty/classroom', icon: BookOpen },
        { name: 'Notifications', path: '/faculty/notifications', icon: Bell },
        { name: 'My Subjects', path: '/faculty/subjects', icon: BookOpen },
        { name: 'Attendance', path: '/faculty/attendance', icon: Calendar },
        { name: 'Announcements', path: '/faculty/announcements', icon: Bell },
        { name: 'Marks Entry', path: '/faculty/marks', icon: FileText },
    ];

    const studentLinks = [
        { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'Classroom', path: '/student/classroom', icon: BookOpen },
        { name: 'Notifications', path: '/student/notifications', icon: Bell },
        { name: 'Attendance', path: '/student/attendance', icon: Calendar },
        { name: 'Marks', path: '/student/marks', icon: FileText },
        { name: 'Results', path: '/student/results', icon: GraduationCap },
        { name: 'Feedback', path: '/student/feedback', icon: MessageSquare },
        { name: 'Announcements', path: '/student/announcements', icon: Bell },
    ];

    const links = user?.role === 'admin' ? adminLinks : 
                  user?.role === 'hod' ? hodLinks : 
                  user?.role === 'faculty' ? facultyLinks : studentLinks;

    return (
        <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
            <div className="p-6 text-xl font-bold border-b border-slate-800 flex items-center gap-2">
                <GraduationCap className="text-blue-400" />
                <span>Innovatrix</span>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) => 
                            `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <link.icon size={20} />
                        <span>{link.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <button 
                    onClick={logout}
                    className="flex items-center gap-3 p-3 w-full text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
