import axios from 'axios';

// Create a reusable axios instance
const api = axios.create({
    baseURL: "/api",
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add JWT token automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
