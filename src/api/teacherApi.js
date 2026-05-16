import api from './api';

export const getTeacherDashboard = async () => {
    const response = await api.get('/teacher/dashboard');
    return response.data;
};

export const getTeacherProfile = async () => {
    const response = await api.get('/teacher/profile');
    return response.data;
};

export const updateTeacherProfile = async (profileData) => {
    const response = await api.put('/teacher/profile', profileData);
    return response.data;
};

export const getTeacherStudents = async () => {
    const response = await api.get('/teacher/students');
    return response.data;
};

export const getTeacherClasses = async () => {
    const response = await api.get('/teacher/classes');
    return response.data;
};

export const markAttendance = async (attendanceData) => {
    const response = await api.post('/teacher/attendance', attendanceData);
    return response.data;
};

export const getAttendanceRecords = async () => {
    const response = await api.get('/teacher/attendance');
    return response.data;
};

export const uploadMarks = async (marksData) => {
    const response = await api.post('/teacher/marks', marksData);
    return response.data;
};

export const getMarksRecords = async () => {
    const response = await api.get('/teacher/marks');
    return response.data;
};

export const getTeacherNotices = async () => {
    const response = await api.get('/teacher/notices');
    return response.data;
};
