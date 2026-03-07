import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from '../utils/storage';

// REPLACE THIS with your final Vercel URL (e.g., https://buildest-server.vercel.app/api)
const PRODUCTION_URL = 'https://YOUR_PROJECT_NAME.vercel.app/api';

const getBaseUrl = async () => {
    // 1. Check for custom server URL (from the Globe icon modal)
    const customUrl = await storage.getItem('customServerUrl');
    if (customUrl) return customUrl;

    // 2. Use Production URL if set (not "YOUR_RENDER_URL")
    if (PRODUCTION_URL && !PRODUCTION_URL.includes('YOUR_RENDER_URL')) {
        return PRODUCTION_URL;
    }

    // 3. Fallback to Local/Dev
    if (Platform.OS === 'web') return 'http://localhost:5000/api';

    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(':')[0];

    if (localhost) {
        return `http://${localhost}:5000/api`;
    }

    return 'http://192.168.1.9:5000/api';
};

let BASE_URL = 'http://192.168.1.9:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to update base URL at runtime
export const updateApiBaseUrl = (newUrl: string) => {
    api.defaults.baseURL = newUrl;
    BASE_URL = newUrl;
    console.log(`[API] BaseURL updated to: ${newUrl}`);
};

// Initialize base URL
getBaseUrl().then(url => {
    updateApiBaseUrl(url);
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
