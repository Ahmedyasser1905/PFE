import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';

// In development, the local IP is crucial for physical devices
// 192.168.1.9 is your computer's IP on the Wi-Fi.
// 10.0.2.2 is ONLY for the Android Emulator.
const getBaseUrl = () => {
    if (Platform.OS === 'web') return 'http://localhost:5000/api';

    // For physical devices (Android or iOS) on the same Wi-Fi
    // We'll use 192.168.1.9 which you confirmed is your IP.
    return 'http://192.168.1.9:5000/api';
};

const BASE_URL = getBaseUrl();
console.log(`[API] Configuration: ${BASE_URL} (Platform: ${Platform.OS})`);

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    async (config) => {
        try {
            console.log(`[API] => ${config.method?.toUpperCase()} ${config.url}`);
            const token = await storage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            // Silently fail for interceptor
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`[API] <= ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        const errorDetail = error.response?.data?.message || error.message;
        console.error(`[API] ERROR: ${errorDetail} (${error.config?.url})`);

        if (error.message === 'Network Error') {
            const advice = `Check if your phone can reach ${BASE_URL}. Your phone and PC must be on the SAME Wi-Fi network.`;
            return Promise.reject({ ...error, message: `Network Error: ${advice}` });
        }

        return Promise.reject(error);
    }
);

export const authApi = {
    login: (credentials: any) => api.post('/auth/login', credentials),
    register: (userData: any) => api.post('/auth/register', userData),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
    resetPasswordOtp: (data: any) => api.post('/auth/reset-password-otp', data),
};

export default api;
