import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from '../utils/storage';

// ─── Base URL Resolution ──────────────────────────────────────────────────────

const PRODUCTION_URL = 'https://buildest-server.vercel.app/api';

const getBaseUrl = async (): Promise<string> => {
    try {
        const customUrl = await storage.getItem('customServerUrl');
        if (customUrl) return customUrl;
    } catch(e) {}

    // IMPORTANT: Only force Production URL if the app is bundled for production.
    if (!__DEV__ && PRODUCTION_URL && !PRODUCTION_URL.includes('YOUR_RENDER_URL')) {
        return PRODUCTION_URL;
    }

    if (Platform.OS === 'web') return 'http://localhost:5000/api';

    // Android Emulator
    if (Platform.OS === 'android' && !Constants.isDevice) {
        return 'http://10.0.2.2:5000/api';
    }

    // iOS Simulator
    if (Platform.OS === 'ios' && !Constants.isDevice) {
        return 'http://localhost:5000/api';
    }

    // Physical Device via Expo Host
    const debuggerHost = Constants.expoConfig?.hostUri;
    const resolvedIp = debuggerHost?.split(':')[0];
    if (resolvedIp) {
        return `http://${resolvedIp}:5000/api`;
    }

    // Explicit User Wi-Fi Fallback
    return 'http://192.168.1.4:5000/api';
};

// ─── Axios Instance ───────────────────────────────────────────────────────────

let BASE_URL = 'http://192.168.1.9:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const updateApiBaseUrl = (newUrl: string) => {
    api.defaults.baseURL = newUrl;
    BASE_URL = newUrl;
    console.log(`[API] BaseURL updated to: ${newUrl}`);
};

getBaseUrl().then(url => {
    updateApiBaseUrl(url);
});

// ─── Interceptors ─────────────────────────────────────────────────────────────

api.interceptors.request.use(
    async (config) => {
        try {
            const token = await storage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            // Silently fail — token injection is best-effort
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        // Automatically unwrap { status: 'ok', data: ... } if it exists
        if (response.data && response.data.status === 'ok' && 'data' in response.data) {
            return response.data.data;
        }
        return response;
    },
    async (error) => {
        const config = error.config as any;
        const errorDetail = error.response?.data?.message || error.message;
        const status = error.response?.status;
        const configUrl = config?.url || '';
        
        console.error(`[API] HTTP ${status || 'Err'} - ${errorDetail} (${configUrl})`);

        // RESILIENCY 1: Setup retry parameters
        if (config && !config._retryCount) {
            config._retryCount = 0;
            config._maxRetries = 2; // Allow up to 2 extra retries
            config._retryDelay = 1500;
        }

        const isNetworkError = error.message === 'Network Error' || error.code === 'ECONNABORTED' || status >= 500;

        // RESILIENCY 2: Intercept network drops and Auto-Retry
        if (isNetworkError && config && config._retryCount < config._maxRetries) {
            config._retryCount += 1;
            console.warn(`[API] Connection unstable. Retrying request (${config._retryCount}/${config._maxRetries})...`);
            
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, config._retryDelay * config._retryCount));
            return api(config);
        }

        // RESILIENCY 3: Gracefully swallow list 404s
        if (status === 404 && configUrl.includes('/projects') && config?.method === 'get') {
            return Promise.resolve([]); 
        }

        // Final failure handling formatting
        if (isNetworkError) {
            const advice = Platform.OS === 'android' ? 'Ensure backend is running locally and CORS is disabled.' : `Check if backend is hosted on ${BASE_URL}.`;
            return Promise.reject({ 
                ...error, 
                message: `Server Unreachable. ${advice}` 
            });
        }

        return Promise.reject(error.response?.data || error);
    }
);

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface ProjectData {
    name: string;
    description?: string;
    budget_type?: 'ESTIMATED' | 'FIXED';
    total_budget?: number;
}

export interface CalculatePayload {
    category_id: string;
    selected_formula_id: string;
    field_values: Record<string, any>;
}

export interface SaveLeafPayload extends CalculatePayload {
    project_id: string;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
    login: (credentials: { email: string; password: string }) =>
        api.post('/auth/login', credentials),

    register: (userData: { fullName: string; email: string; password: string }) =>
        api.post('/auth/register', userData),

    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }),

    verifyOtp: (email: string, otp: string) =>
        api.post('/auth/verify-otp', { email, otp }),

    resetPasswordOtp: (data: { email: string; otp: string; password: string }) =>
        api.post('/auth/reset-password-otp', data),
};

// ─── Users API ────────────────────────────────────────────────────────────────

export const usersApi = {
    getProfile: () =>
        api.get('/users/me'),

    updateProfile: (data: { fullName?: string; avatar?: string }) =>
        api.put('/users/me', data),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        api.put('/users/me/password', data),
};

// ─── Chat API ─────────────────────────────────────────────────────────────────

export const chatApi = {
    sendMessage: (message: string, sessionId?: string) =>
        api.post('/chat', { message, sessionId }),

    getHistory: (sessionId?: string) =>
        api.get('/chat/history', { params: sessionId ? { sessionId } : {} }),

    clearHistory: (sessionId?: string) =>
        api.delete('/chat/history', { params: sessionId ? { sessionId } : {} }),
};

// ─── Estimation API (Contract Aligned) ────────────────────────────────────────

export const estimationApi = {
    // Health
    getHealth: () => 
        api.get('/estimation/health'),

    // Categories
    getCategories: () =>
        api.get('/estimation/categories'),
        
    getCategoryChildren: (id: string) =>
        api.get(`/estimation/categories/${id}/children`),
        
    getCategoryLeaf: (id: string) =>
        api.get(`/estimation/categories/${id}/leaf`),

    // Projects
    listProjects: () =>
        api.get('/estimation/projects'),

    getProject: (id: string) =>
        api.get(`/estimation/projects/${id}`),

    createProject: (data: ProjectData) =>
        api.post('/estimation/projects', data),

    getProjectEstimation: (id: string) =>
        api.get(`/estimation/projects/${id}/estimation`),

    // Calculators
    calculatePreview: (data: CalculatePayload) =>
        api.post('/estimation/calculate', data),

    saveLeaf: (data: SaveLeafPayload) =>
        api.post('/estimation/save-leaf', data),

    deleteLeaf: (project_id: string, leaf_id: string) =>
        api.delete('/estimation/leaf', { data: { project_id, leaf_id } })
};

export default api;
