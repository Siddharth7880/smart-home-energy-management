import axios from 'axios';

// Use absolute URL in development for direct connection, relative path in production
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        // Check both storages: localStorage (rememberMe) then sessionStorage (session-only)
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        } else {
            // Fallback to user object in either storage
            const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user && user.accessToken) {
                        config.headers['Authorization'] = 'Bearer ' + user.accessToken;
                    }
                } catch (e) {
                    console.error('Error parsing user from storage:', e);
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth services
export const register = (userData) => {
    return api.post('/auth/signup', userData);
};

export const login = (credentials) => {
    return api.post('/auth/signin', credentials);
};

export const forgotPassword = (email) => {
    return api.post('/auth/forgot-password', { email });
};

export const resetPassword = (data) => {
    return api.post('/auth/reset-password', data);
};

export const verifyOtp = (email, otp) => {
    return api.post('/auth/verify-otp', { email, otp });
};

export const resendOtp = (email) => {
    return api.post('/auth/resend-otp', { email });
};

export const checkEmailExists = (email) => {
    return api.get(`/auth/check-email/${encodeURIComponent(email)}`);
};

// Test services
export const getPublicContent = () => api.get('/test/all');
export const getUserBoard = () => api.get('/test/user');
export const getTechBoard = () => api.get('/test/tech');
export const getAdminBoard = () => api.get('/test/admin');

// Admin services
export const adminApi = {
    getAllUsers: () => api.get('/admin/users'),
    getUserById: (userId) => api.get(`/admin/users/${userId}`),
    updateUserRoles: (userId, roles) => api.put(`/admin/users/${userId}/roles`, { roles }),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    getSystemStatistics: () => api.get('/admin/statistics'),
    getRoleDistribution: () => api.get('/admin/role-distribution'),
    getSystemSettings: () => api.get('/admin/settings'),
    updateSystemSettings: (settings) => api.put('/admin/settings', settings),
    deactivateUser: (userId) => api.post(`/admin/users/${userId}/deactivate`),
    reactivateUser: (userId) => api.post(`/admin/users/${userId}/reactivate`),
    resetUserPassword: (userId) => api.post(`/admin/users/${userId}/reset-password`),
};

// Device services (Homeowner)
export const deviceApi = {
    getDevices: () => api.get('/devices'),
    getDeviceById: (deviceId) => api.get(`/devices/${deviceId}`),
    createDevice: (deviceData) => api.post('/devices', deviceData),
    updateDevice: (deviceId, deviceData) => api.put(`/devices/${deviceId}`, deviceData),
    deleteDevice: (deviceId) => api.delete(`/devices/${deviceId}`),
    controlDevice: (deviceId, action) => api.post(`/devices/${deviceId}/control`, null, { params: { action } }),
    getDeviceStatus: (deviceId) => api.get(`/devices/${deviceId}/status`),
    getDeviceConsumption: (deviceId, period = 'daily') => api.get(`/devices/${deviceId}/consumption`, { params: { period } }),
    getConsumptionSummary: (period = 'monthly') => api.get('/devices/consumption/summary', { params: { period } }),

    // Energy Log endpoints
    addEnergyLog: (deviceId, logData) => api.post(`/devices/${deviceId}/logs`, logData),
    getDeviceEnergyLogs: (deviceId) => api.get(`/devices/${deviceId}/logs`),
    getDeviceEnergyLogsByDateRange: (deviceId, startTime, endTime) =>
        api.get(`/devices/${deviceId}/logs/range`, { params: { startTime, endTime } }),
    getDeviceAnalytics: (deviceId, period = 'monthly') =>
        api.get(`/devices/${deviceId}/analytics`, { params: { period } }),
    getAllDeviceEnergyLogs: (period = 'monthly') =>
        api.get('/devices/logs/all', { params: { period } }),
    deleteOldLogs: (beforeDate) =>
        api.delete('/devices/logs/old', { params: { beforeDate } }),
};

// Technician services
export const technicianApi = {
    getMyInstallations: () => api.get('/technician/installations'),
    getInstallationById: (installationId) => api.get(`/technician/installations/${installationId}`),
    createInstallation: (installationData) => api.post('/technician/installations', installationData),
    updateInstallationStatus: (installationId, status) => api.put(`/technician/installations/${installationId}/status`, null, { params: { status } }),
    addNotes: (installationId, notes) => api.post(`/technician/installations/${installationId}/notes`, null, { params: { notes } }),
    completeInstallation: (installationId) => api.post(`/technician/installations/${installationId}/complete`),
    getPendingInstallations: () => api.get('/technician/installations/status/pending'),
    assignInstallation: (installationId, technicianId) => api.post(`/technician/installations/${installationId}/assign`, null, { params: { technicianId } }),
    getMyMetrics: () => api.get('/technician/metrics/me'),
    getAllMetrics: () => api.get('/technician/metrics'),
};

export default api;
