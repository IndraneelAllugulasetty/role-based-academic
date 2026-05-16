import api from './api';

export const getStudentDashboard = async () => {
    const response = await api.get('/student/dashboard');
    return response.data;
};

export const getStudentProfile = async () => {
    const response = await api.get('/student/profile');
    return response.data;
};

export const updateStudentProfile = async (profileData) => {
    const response = await api.put('/student/profile', profileData);
    return response.data;
};

export const getStudentAttendance = async () => {
    const response = await api.get('/student/attendance');
    return response.data;
};

export const getStudentMarks = async () => {
    const response = await api.get('/student/marks');
    return response.data;
};

export const getStudentCourses = async () => {
    const response = await api.get('/student/courses');
    return response.data;
};

export const getStudentNotices = async () => {
    const response = await api.get('/student/notices');
    return response.data;
};

export const getStudentTimetable = async () => {
    const response = await api.get('/student/timetable');
    return response.data;
};
