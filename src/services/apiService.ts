import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Ensure we don't end up with //api or /api/api
const baseURL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            if (window.location.pathname.startsWith('/restaurant')) {
                window.location.href = '/restaurant/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
