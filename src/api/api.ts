import axios from 'axios';
import type {
  RawProject,
  RawCategory,
  RawCalculationResult,
  RawEstimationReport,
  RawLeafDetail,
  RawUser,
  RawSubscription,
  RawUsage,
  RawPlan,
  Project,
  Category,
  LeafDetail,
  CalculationResult,
  EstimationReport,
  User,
  Subscription,
  Usage,
  Plan,
  CalculateRequest,
  CreateProjectRequest,
  AIQuestion,
  AIExpertResponse,
  AIFAQResponse,
} from './types';
import { MOCK_CATEGORIES, MOCK_PROJECTS } from './mockData';
import {
  mapProjectFromAPI,
  mapProjectsFromAPI,
  mapCategoriesFromAPI,
  mapCategoryFromAPI,
  mapLeafDetailFromAPI,
  mapCalculationResultFromAPI,
  mapEstimationFromAPI,
  mapUserFromAPI,
  mapSubscriptionFromAPI,
  mapUsageFromAPI,
  mapPlansFromAPI,
  mapPlanFromAPI,
} from './mappers';
import { authService } from '~/services/authService';
import { logger } from '~/utils/errorHandler';
import { API_URLS, APP_CONFIG, STORAGE_KEYS } from '~/constants/config';
import { storage } from '~/utils/storage';

// Re-export authApi from its new location to maintain compatibility
export { authApi } from './authApi';

// ─── Base URL Resolution ──────────────────────────────────────────────────────

let resolvedBaseUrl: string | null = null;
let baseUrlPromise: Promise<string> | null = null;

const getBaseUrl = (): Promise<string> => {
    if (resolvedBaseUrl) return Promise.resolve(resolvedBaseUrl);
    if (baseUrlPromise) return baseUrlPromise;

    baseUrlPromise = (async () => {
        // 1. Check for user-saved custom URL (from settings screen)
        try {
            const customUrl = await storage.getItem(STORAGE_KEYS.CUSTOM_SERVER_URL);
            if (customUrl) {
                resolvedBaseUrl = customUrl;
                return customUrl;
            }
        } catch {}

        // 2. React Native Environment Resolution
        const url = __DEV__ ? API_URLS.DEVELOPMENT : API_URLS.PRODUCTION;

        console.log(`[API] Resolved baseURL (__DEV__=${__DEV__}):`, url);
        resolvedBaseUrl = url;
        return url;
    })();

    return baseUrlPromise;
};



// ─── Axios Instance ───────────────────────────────────────────────────────────

const api = axios.create({
    timeout: APP_CONFIG.API_TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// ─── Token Refresh Queue ──────────────────────────────────────────────────────
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.map((cb) => cb(token));
    refreshSubscribers = [];
};

api.interceptors.request.use(async (config) => {
    // 1. Ensure baseURL is ALWAYS present.
    // If not set on the instance yet, resolve it and set it as default.
    if (!api.defaults.baseURL) {
        api.defaults.baseURL = await getBaseUrl();
    }
    config.baseURL = api.defaults.baseURL;
    
    // 2. MANDATORY: ALWAYS fetch the latest accessToken from storage BEFORE every request.
    const token = await authService.getValidToken();
    
    if (token) {
        const authHeader = `Bearer ${token}`;
        
        if (__DEV__) {
            console.log(`[API] [${config.method?.toUpperCase()}] ${config.url} | Header: Bearer ${token.substring(0, 15)}...`);
        }
        
        // FORCE HEADER OVERWRITE: 
        // We set it on config.headers to ensure this specific request uses the fresh token.
        if (config.headers && typeof config.headers.set === 'function') {
            config.headers.set('Authorization', authHeader);
        } else {
            (config.headers as any).Authorization = authHeader;
        }
    } else {
        // Clean up Authorization header for public requests
        if (config.headers) {
            if (typeof config.headers.delete === 'function') {
                config.headers.delete('Authorization');
            } else {
                delete config.headers.Authorization;
            }
        }
    }
    
    console.log(`[API] [${config.method?.toUpperCase()}] → ${config.baseURL}${config.url}`);
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
    (response) => {
        // Unwrap { status: 'ok', data: ... } envelope (standard pattern)
        if (response.data && response.data.status === 'ok' && 'data' in response.data) {
            return response.data.data;
        }
        // Unwrap { success: true, data: ... } envelope (subscription endpoints use this)
        if (response.data && response.data.success === true && 'data' in response.data) {
            return response.data.data;
        }
        // Fallback: response already contains data directly
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // 1. Detect Auth Failure — only retry on 401 (token expired/invalid)
        // 403 = Forbidden (wrong role, no subscription) — DO NOT refresh, it won't help
        const errorCode = error.response?.data?.error?.code;
        const is401 = error.response?.status === 401;
        const isSubscriptionError = errorCode === 'NO_SUBSCRIPTION' || error.response?.status === 403;
        
        if (is401 && originalRequest && !originalRequest._retry) {
            
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token) => {
                        // CLEAN REBUILD: Reconstruct request to avoid Axios internal corruption
                        const retryConfig = {
                            ...originalRequest,
                            _retry: true,
                            baseURL: api.defaults.baseURL // Explicitly restore baseURL
                        };

                        // Inject the fresh token directly into the retried request
                        const authHeader = `Bearer ${token}`;
                        if (retryConfig.headers && typeof retryConfig.headers.set === 'function') {
                            retryConfig.headers.set('Authorization', authHeader);
                        } else {
                            retryConfig.headers = {
                                ...(retryConfig.headers || {}),
                                'Authorization': authHeader
                            };
                        }

                        resolve(api(retryConfig));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;
            
            return new Promise((resolve, reject) => {
                logger.info('API', `Auth failure (${error.response?.status}). Refreshing token...`);
                
                authService.refreshToken()
                    .then((newToken) => {
                        isRefreshing = false;
                        if (newToken) {
                            onTokenRefreshed(newToken);
                            
                            // CLEAN REBUILD: 
                            // Re-executing via api(config) will trigger the request interceptor,
                            // which will fetch the new token from storage and set the baseURL.
                            const retryConfig = {
                                ...originalRequest,
                                _retry: true,
                                baseURL: api.defaults.baseURL // Force consistency
                            };

                            // Use the fresh token for the immediate retry as well
                            const authHeader = `Bearer ${newToken}`;
                            if (retryConfig.headers && typeof retryConfig.headers.set === 'function') {
                                retryConfig.headers.set('Authorization', authHeader);
                            } else {
                                retryConfig.headers = {
                                    ...(retryConfig.headers || {}),
                                    'Authorization': authHeader
                                };
                            }

                            resolve(api(retryConfig));
                        } else {
                            throw new Error('Refresh failed - no token returned');
                        }
                    })
                    .catch(async (refreshError) => {
                        isRefreshing = false;
                        logger.error('API', 'Refresh flow failed definitively');
                        await authService.handleInvalidToken();
                        reject(error);
                    });
            });
        }

        // 2. Handle Non-Auth Errors
        const status = error.response?.status || 'Network Error';
        const method = originalRequest?.method?.toUpperCase() || 'UNKNOWN';
        const url = originalRequest?.url || 'unknown';
        
        if (status === 404) {
            console.log(`[API] 404 Not Found (Expected for new items): [${method}] ${url}`);
        } else {
            logger.error('API', `FAILURE [${method}] ${url} | Status: ${status}`);
        }

        let errorMessage = error.response?.data?.error?.message || error.message || 'Unknown network error';
        if (error.message === 'Network Error') {
            errorMessage = 'Could not reach the server. Please check your internet connection.';
        }

        const apiError = {
            status,
            message: errorMessage,
            code: errorCode,  // e.g. 'NO_SUBSCRIPTION', 'TOKEN_EXPIRED'
            data: error.response?.data,
            isServerError: status === 500 || status === 'Network Error' || !error.response,
            isSubscriptionError: isSubscriptionError ?? false,
        };

        return Promise.reject(apiError);
    }
);



// ─── Resilience Wrapper ───────────────────────────────────────────────────────

/**
 * Wraps an API call with an automatic fallback mechanism.
 * If the API fails with a server error, it returns the provided fallback data.
 */
async function withFallback<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        return await promise;
    } catch (error: any) {
        if (error.isServerError) {
            console.warn('[API] Server failure detected. Using fallback data.');
            return fallback;
        }
        throw error;
    }
}


// ─── Shared APIs ──────────────────────────────────────────────────────────────

export const usersApi = {
    getProfile: async (): Promise<User> => {
        const raw: RawUser = await api.get('/me');
        return mapUserFromAPI(raw);
    },
};

export const chatApi = {
    getRecommendedQuestions: (location: string): Promise<{ questions: AIQuestion[] }> =>
        api.post('/ai/questions', { display_location: location }),
    sendMessage: (message: string): Promise<AIExpertResponse> =>
        api.post('/ai/expert', { user_message: message }),
    getFAQAnswer: (questionId: number, language: string = 'en'): Promise<AIFAQResponse> =>
        api.post(`/ai/faq/${questionId}`, { language }),
};

export const estimationApi = {
    // ── Categories ────────────────────────────────────────────────────────────
    getCategories: async (): Promise<Category[]> => {
        const raw = await withFallback<RawCategory[]>(api.get('/categories'), MOCK_CATEGORIES);
        return mapCategoriesFromAPI(raw);
    },
    getCategoryChildren: async (id: string): Promise<Category[]> => {
        const raw: RawCategory[] = await api.get(`/categories/${id}/children`);
        return mapCategoriesFromAPI(raw);
    },
    getCategoryLeaf: async (id: string): Promise<LeafDetail> => {
        const raw: RawLeafDetail = await api.get(`/categories/${id}/leaf`);
        return mapLeafDetailFromAPI(raw);
    },

 // ── Projects ──────────────────────────────────────────────────────────────
listProjects: async (): Promise<Project[]> => {
    const raw = await withFallback<RawProject[]>(api.get('/projects'), MOCK_PROJECTS);
    return mapProjectsFromAPI(raw);
},

uploadProjectImage: async (formData: FormData) => {
    const response = await api.post('/projects/upload-image', formData);
    return response.data;
},

getProject: async (id: string): Promise<Project> => {
    const raw: RawProject = await api.get(`/projects/${id}`);
    return mapProjectFromAPI(raw);
},

createProject: async (data: CreateProjectRequest | FormData): Promise<Project> => {
    let raw: RawProject;
    if (data instanceof FormData) {
        raw = await api.post('/projects', data);
    } else {
        raw = await api.post('/projects', data);
    }
    return mapProjectFromAPI(raw);
},

    // ── Estimation ────────────────────────────────────────────────────────────
    getProjectEstimation: async (id: string): Promise<EstimationReport | null> => {
        try {
            const raw: RawEstimationReport = await api.get(`/projects/${id}/estimation`);
            return mapEstimationFromAPI(raw);
        } catch {
            return null;
        }
    },

    // ── Calculation ───────────────────────────────────────────────────────────
    calculatePreview: async (data: CalculateRequest): Promise<CalculationResult> => {
        const raw: RawCalculationResult = await api.post('/calculate', data);
        return mapCalculationResultFromAPI(raw);
    },

    // ── Leaf operations (payloads stay snake_case to match backend schema) ───
    saveLeaf: (data: any) => api.post('/estimation/save-leaf', data),
    deleteLeaf: (projectDetailsId: string) => api.delete('/estimation/leaf', { data: { project_details_id: projectDetailsId } }),

    // ── Export ─────────────────────────────────────────────────────────────
    exportProject: async (id: string): Promise<{ success: boolean; message?: string }> => {
        return api.get(`/projects/${id}/export`);
    },
};

// ─── Subscription APIs ────────────────────────────────────────────────────────

export const subscriptionApi = {
    getMine: async (): Promise<Subscription> => {
        const raw: RawSubscription = await api.get('/subscriptions/me');
        return mapSubscriptionFromAPI(raw);
    },
    getUsage: async (): Promise<Usage> => {
        const raw: RawUsage = await api.get('/subscriptions/me/usage');
        return mapUsageFromAPI(raw);
    },
    create: async (planId: string): Promise<any> => {
        try {
            return await api.post('/subscriptions', { planId });
        } catch (err: any) {
            if (err?.status === 409 || err?.response?.status === 409) {
                console.log("[SubscriptionAPI] 409 Conflict: Subscription exists, returning existing subscription.");
                return await subscriptionApi.getMine();
            }
            throw err;
        }
    },
    switchPlan: (planId: string): Promise<any> =>
        api.patch('/subscriptions/switch', { newPlanId: planId }),
};

// ─── Plans APIs ───────────────────────────────────────────────────────────────

export const plansApi = {
    getAll: async (): Promise<Plan[]> => {
        const raw: RawPlan[] = await api.get('/plans');
        return mapPlansFromAPI(raw);
    },
    getFeatures: async (id: string): Promise<any> => {
        return api.get(`/plans/${id}`);
    },
};

export default api;
