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

// Add a response interceptor to handle expired/invalid tokens
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Clear stale auth data from both storages
            const isAuthRequest = error.config?.url?.includes('/auth/');
            if (!isAuthRequest) {
                // Only auto-logout on non-auth endpoints
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                // Keep 'user' so AuthContext knows to redirect; it will be cleared on next load
                // Redirect to login page if not already there
                if (!window.location.pathname.includes('/login') &&
                    !window.location.pathname.includes('/verify-otp')) {
                    // Remove user data to force re-login
                    localStorage.removeItem('user');
                    sessionStorage.removeItem('user');
                    window.location.href = '/login';
                }
            }
        }
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

    // ── Milestone 2 additions ──
    toggleDevice: (deviceId) => api.patch(`/devices/${deviceId}/toggle`),
    getTotalPower: () => api.get('/devices/total-power'),
};

// IoT live reading services
export const iotApi = {
    getLiveReading: (deviceId) => api.get(`/iot/devices/${deviceId}/live`),
};

// Analytics services
export const analyticsApi = {
    getTotalLiveUsage: () => api.get('/analytics/total-live-usage'),
    getHourlyUsage: (date) => api.get('/analytics/hourly', { params: { date } }),
    getDailyUsage: (month) => api.get('/analytics/daily', { params: { month } }),
    getWeeklyUsage: (year) => api.get('/analytics/weekly', { params: { year } }),
    getMonthlyUsage: (year) => api.get('/analytics/monthly', { params: { year } }),
    getYearlyUsage: () => api.get('/analytics/yearly'),
    getSummaryAnalytics: (period) => api.get('/analytics/summary', { params: { period } }),
    getAdminGlobalAnalytics: (period) => api.get('/analytics/admin/global', { params: { period } }),
    getTechnicianDeviceHealth: () => api.get('/analytics/technician/device-health'),
};

// Usage Log services (Milestone 2 — /api/usage/* routes)
export const usageApi = {
    addLog: (deviceId, data) => api.post(`/usage/${deviceId}`, data),
    getLogs: (deviceId) => api.get(`/usage/${deviceId}`),
    getLogsByRange: (deviceId, from, to) =>
        api.get(`/usage/${deviceId}`, { params: { from, to } }),
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

// Automation services (Milestone 5)
export const automationApi = {
    getSchedules: () => api.get('/schedules'),
    createSchedule: (data) => api.post('/schedules', data),
    updateSchedule: (scheduleId, data) => api.put(`/schedules/${scheduleId}`, data),
    deleteSchedule: (scheduleId) => api.delete(`/schedules/${scheduleId}`),
    triggerSchedule: (scheduleId) => api.post(`/schedules/${scheduleId}/trigger`),
};

// Alert services (Milestone 5)
export const alertApi = {
    getAlerts: () => api.get('/alerts'),
    markAllRead: () => api.post('/alerts/mark-read'),
    getThreshold: () => api.get('/alerts/threshold'),
    setThreshold: (thresholdKwh, emailNotification = true) =>
        api.post('/alerts/threshold', { thresholdKwh, emailNotification }),
};

// Insight services (Milestone 5)
export const insightApi = {
    getInsights: () => api.get('/insights'),
};

export default api;
