/**
 * BuildEst — Centralized Configuration Constants
 *
 * All magic strings, storage keys, enums, and app-level config live here.
 * Never write these inline in screens or services.
 */

// ─── Storage Keys ─────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  USER_LANGUAGE: 'userLanguage',
  CUSTOM_SERVER_URL: 'customServerUrl',
  ONBOARDING_COMPLETED: 'hasCompletedOnboarding_v6',
  CALCULATIONS: '@buildest_calculations',
  TRANSLATIONS: 'app_translations',
} as const;

// ─── App Config ───────────────────────────────────────────────────────────────

export const APP_CONFIG = {
  CURRENCY: 'DA',
  CURRENCY_LOCALE: 'fr-DZ',
  DEFAULT_LANGUAGE: 'en' as const,
  SUPPORTED_LANGUAGES: ['en', 'ar'] as const,
  API_TIMEOUT_MS: 15_000,
  NETWORK_RETRY_COUNT: 2,
  NETWORK_RETRY_DELAY_MS: 1_000,
} as const;

// ─── API URLs ─────────────────────────────────────────────────────────────────

export const API_URLS = (() => {
  const production = process.env.EXPO_PUBLIC_API_URL || 'https://your-backend-domain.com/api';
  const development = process.env.EXPO_PUBLIC_DEV_API_URL || '';

  // If the dev URL is not set, warn loudly in development mode so
  // "Network Error" problems are immediately traced to misconfiguration.
  if (__DEV__ && !development) {
    console.warn(
      '[Config] EXPO_PUBLIC_DEV_API_URL is not set in your .env file. ' +
      'Network requests will fail. Set it to your machine\'s local IP ' +
      '(e.g. http://192.168.x.x:5000/api) and restart Expo.'
    );
  }

  return {
    /**
     * PRODUCTION Cloud Backend URL
     * This handles users who build the APK/AAB or run in production mode.
     * Add the real domain to .env or keep the Vercel/Cloud URL here.
     */
    PRODUCTION: production,

    /**
     * DEVELOPMENT Backend URL
     * Automatically targets localhost or a specific IP in development mode.
     * If not set, falls back to localhost (works for emulators, NOT physical devices).
     */
    DEVELOPMENT: development || 'http://localhost:5000/api',
  };
})();

// ─── Project Enums ────────────────────────────────────────────────────────────

export const PROJECT_STATUS = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  COMPLETED: 'completed', // some API responses use lowercase
} as const;

export type ProjectStatusType = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

// ─── Budget Options ───────────────────────────────────────────────────────────

export const BUDGET_TYPE = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type BudgetType = typeof BUDGET_TYPE[keyof typeof BUDGET_TYPE];

export const BUDGET_OPTIONS = [
  { id: BUDGET_TYPE.LOW, label: 'Low Budget', subLabel: 'Cost-effective materials', value: 1 },
  { id: BUDGET_TYPE.MEDIUM, label: 'Medium Budget', subLabel: 'Balanced cost and quality', value: 2 },
  { id: BUDGET_TYPE.HIGH, label: 'High Budget', subLabel: 'Premium materials', value: 3 },
] as const;
