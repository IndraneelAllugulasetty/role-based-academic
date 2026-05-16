import api from './api';

// Dashboard & Stats
export const getAdminDashboardStats = async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
};

// Student Management
export const registerStudent = async (studentData) => {
    const response = await api.post('/admin/students/register', studentData);
    return response.data;
};

export const getAllStudents = async () => {
    const response = await api.get('/admin/students');
    return response.data;
};

export const getStudentById = async (id) => {
    const response = await api.get(`/admin/students/${id}`);
    return response.data;
};

export const updateStudent = async (id, studentData) => {
    const response = await api.put(`/admin/students/${id}`, studentData);
    return response.data;
};

export const deleteStudent = async (id) => {
    const response = await api.delete(`/admin/students/${id}`);
    return response.data;
};

// Teacher Management
export const registerTeacher = async (teacherData) => {
    const response = await api.post('/admin/teachers/register', teacherData);
    return response.data;
};

export const getAllTeachers = async () => {
    const response = await api.get('/admin/teachers');
    return response.data;
};

export const getTeacherById = async (id) => {
    const response = await api.get(`/admin/teachers/${id}`);
    return response.data;
};

export const updateTeacher = async (id, teacherData) => {
    const response = await api.put(`/admin/teachers/${id}`, teacherData);
    return response.data;
};

export const deleteTeacher = async (id) => {
    const response = await api.delete(`/admin/teachers/${id}`);
    return response.data;
};

// User & Notice Management
export const getAllUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

export const createNotice = async (noticeData) => {
    const response = await api.post('/admin/notices', noticeData);
    return response.data;
};

export const getAllNotices = async () => {
    const response = await api.get('/admin/notices');
    return response.data;
};

export const deleteNotice = async (id) => {
    const response = await api.delete(`/admin/notices/${id}`);
    return response.data;
};

// Admin Profile
export const getAdminProfile = async () => {
    const response = await api.get('/admin/profile');
    return response.data;
};

export const updateAdminProfile = async (profileData) => {
    const response = await api.put('/admin/profile', profileData);
    return response.data;
};
