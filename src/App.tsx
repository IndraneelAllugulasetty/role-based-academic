import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminFaculty from './pages/AdminFaculty';
import AdminDepartments from './pages/AdminDepartments';
import AdminSemesters from './pages/AdminSemesters';
import AdminHODs from './pages/AdminHODs';
import HODDashboard from './pages/HODDashboard';
import HODFacultyAssignments from './pages/HODFacultyAssignments';
import HODStudents from './pages/HODStudents';
import HODAnalytics from './pages/HODAnalytics';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminAnnouncements from './pages/AdminAnnouncements';
import Announcements from './pages/Announcements';
import FacultySubjects from './pages/FacultySubjects';
import FacultyAttendance from './pages/FacultyAttendance';
import FacultyMarks from './pages/FacultyMarks';
import StudentDashboard from './pages/StudentDashboard';
import StudentAttendance from './pages/StudentAttendance';
import StudentMarks from './pages/StudentMarks';
import StudentResults from './pages/StudentResults';
import StudentFeedback from './pages/StudentFeedback';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import ClassroomList from './pages/ClassroomList';
import ClassroomDetail from './pages/ClassroomDetail';

const PlaceholderPage = ({ title }) => (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold">?</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 max-w-md">
            This page is currently under development as part of the academic management system. 
            Check back soon for full functionality!
        </p>
    </div>
);

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Navigate to="/login" />} />
                        
                        {/* Admin Routes */}
                        <Route path="admin/dashboard" element={<AdminDashboard />} />
                        <Route path="admin/students" element={<AdminStudents />} />
                        <Route path="admin/faculty" element={<AdminFaculty />} />
                        <Route path="admin/hods" element={<AdminHODs />} />
                        <Route path="admin/departments" element={<AdminDepartments />} />
                        <Route path="admin/semesters" element={<AdminSemesters />} />
                        <Route path="admin/announcements" element={<AdminAnnouncements />} />
                        <Route path="admin/classroom" element={<ClassroomList />} />
                        <Route path="admin/classroom/:id" element={<ClassroomDetail />} />
                        <Route path="admin/notifications" element={<Notifications />} />
                        <Route path="admin/profile" element={<Profile />} />
                        <Route path="admin/settings" element={<Settings />} />
                        
                        {/* HOD Routes */}
                        <Route path="hod/dashboard" element={<HODDashboard />} />
                        <Route path="hod/classroom" element={<ClassroomList />} />
                        <Route path="hod/classroom/:id" element={<ClassroomDetail />} />
                        <Route path="hod/assignments" element={<HODFacultyAssignments />} />
                        <Route path="hod/students" element={<HODStudents />} />
                        <Route path="hod/analytics" element={<HODAnalytics />} />
                        <Route path="hod/announcements" element={<Announcements />} />
                        <Route path="hod/notifications" element={<Notifications />} />
                        <Route path="hod/profile" element={<Profile />} />
                        <Route path="hod/settings" element={<Settings />} />
                        
                        {/* Faculty Routes */}
                        <Route path="faculty/dashboard" element={<FacultyDashboard />} />
                        <Route path="faculty/classroom" element={<ClassroomList />} />
                        <Route path="faculty/classroom/:id" element={<ClassroomDetail />} />
                        <Route path="faculty/subjects" element={<FacultySubjects />} />
                        <Route path="faculty/attendance" element={<FacultyAttendance />} />
                        <Route path="faculty/marks" element={<FacultyMarks />} />
                        <Route path="faculty/announcements" element={<Announcements />} />
                        <Route path="faculty/notifications" element={<Notifications />} />
                        <Route path="faculty/profile" element={<Profile />} />
                        <Route path="faculty/settings" element={<Settings />} />
                        
                        {/* Student Routes */}
                        <Route path="student/dashboard" element={<StudentDashboard />} />
                        <Route path="student/classroom" element={<ClassroomList />} />
                        <Route path="student/classroom/:id" element={<ClassroomDetail />} />
                        <Route path="student/attendance" element={<StudentAttendance />} />
                        <Route path="student/marks" element={<StudentMarks />} />
                        <Route path="student/results" element={<StudentResults />} />
                        <Route path="student/feedback" element={<StudentFeedback />} />
                        <Route path="student/announcements" element={<Announcements />} />
                        <Route path="student/notifications" element={<Notifications />} />
                        <Route path="student/profile" element={<Profile />} />
                        <Route path="student/settings" element={<Settings />} />
                    </Route>
                    
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
