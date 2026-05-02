import axios from 'axios';
import type { AuthResponse, User } from './types';
import { mapUserFromAPI } from './mappers';
import { detectBaseUrl } from '~/utils/network';

/**
 * A clean axios instance for auth-related calls (login, refresh, etc.)
 * This instance DOES NOT have interceptors to avoid infinite loops.
 */
const authClient = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Base URL Resolution ──────────────────────────────────────────────────────
// Shared with api.ts via the network utility — both axios instances always
// agree on which host they're talking to.
const getAuthBaseUrl = (): Promise<string> => detectBaseUrl();


// ─── Request Interceptor: ensure baseURL set before every request ────────────
authClient.interceptors.request.use(async (config) => {
    if (!config.baseURL) {
        config.baseURL = await getAuthBaseUrl();
    }
    console.log(`[AuthAPI] [${config.method?.toUpperCase()}] → ${config.baseURL}${config.url}`);
    return config;
});

// ─── Response Interceptor: Format errors neatly ──────────────────────────────
authClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const status = error.response?.status || 'Network Error';
        let errorMessage = error.response?.data?.error?.message || error.message || 'Unknown Auth Error';
        
        if (error.message === 'Network Error') {
            errorMessage = 'Could not reach the authentication server. Please check your internet connection.';
        }
        
        console.error(`[AuthAPI] ERROR: ${status} | ${errorMessage}`);
        
        return Promise.reject({
            status,
            message: errorMessage,
            data: error.response?.data
        });
    }
);

/**
 * Auth response shape from backend: { status: 'ok', data: { user, accessToken, refreshToken } }
 * The user object comes as RawUser (snake_case) and must be mapped to User (camelCase).
 */
interface RawAuthResponse {
    user: any; // Raw user from backend (snake_case fields)
    accessToken: string;
    refreshToken: string;
}

export const authApi = {
    login: async (credentials: { email: string; password: string }): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
        const res = await authClient.post('/login', credentials);
        const raw: RawAuthResponse = res.data.data;
        return {
            user: mapUserFromAPI(raw.user),
            accessToken: raw.accessToken,
            refreshToken: raw.refreshToken,
        };
    },

    register: async (userData: { name: string; email: string; password: string }): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
        const payload = { ...userData, role: 'client' };
        const res = await authClient.post('/register', payload);
        const raw: RawAuthResponse = res.data.data;
        return {
            user: mapUserFromAPI(raw.user),
            accessToken: raw.accessToken,
            refreshToken: raw.refreshToken,
        };
    },

    refreshToken: (token: string): Promise<{ accessToken: string }> =>
        authClient.put('/refresh', { refreshToken: token }).then(res => res.data.data),

    forgotPassword: (email: string) =>
        authClient.post('/forgot-password', { email }).then(res => res.data.data),

    verifyOtp: (email: string, token: string) =>
        authClient.get(`/verify-reset-token?token=${token}`).then(res => res.data.data),

    resetPassword: (data: { token: string; password: string }) =>
        authClient.post('/reset-password', { token: data.token, newPassword: data.password }).then(res => res.data.data),
};
