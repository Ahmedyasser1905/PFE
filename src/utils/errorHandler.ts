/**
 * Centralized Error Handler
 *
 * Parses errors from API calls, network failures, and unknown sources
 * into a consistent, user-friendly string. Replaces scattered
 * `error.message || 'Unknown error'` patterns across the codebase.
 */

/**
 * Extracts a clean, user-readable message from any thrown value.
 * Handles Axios errors, plain Error objects, strings, and unknown types.
 */
export function parseError(error: unknown, fallback = 'An unexpected error occurred.'): string {
  if (!error) return fallback;

  // Axios-style error with response body (from our API interceptor which rejects `error.response?.data`)
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, any>;

    // Our API interceptor returns `error.response?.data` which may have `{ message }` or `{ error }`
    if (typeof e.message === 'string' && e.message.trim()) return e.message;
    if (typeof e.error === 'string' && e.error.trim()) return e.error;

    // Axios wrapper
    if (e.response?.data?.message) return e.response.data.message;
    if (e.response?.data?.error) return e.response.data.error;

    // Network-level string
    if (typeof e.code === 'string' && e.code === 'NETWORK_ERROR') return 'Network error. Check your connection.';
  }

  if (typeof error === 'string') return error;

  return fallback;
}

/**
 * Determines if an error is a transient network issue (no server response).
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as Record<string, any>;
  return (
    !e.status &&
    (e.message?.includes('Network request failed') ||
      e.message?.includes('network error') ||
      e.code === 'NETWORK_ERROR' ||
      e.code === 'ECONNREFUSED' ||
      e.code === 'ETIMEDOUT')
  );
}

/**
 * Structured logger — all application logs should go through here.
 * In production you could swap `console.*` for a remote logging service.
 */
export const logger = {
  info: (tag: string, message: string, data?: unknown) => {
    console.log(`[${tag}] ${message}`, data !== undefined ? data : '');
  },
  warn: (tag: string, message: string, data?: unknown) => {
    console.warn(`[${tag}] ${message}`, data !== undefined ? data : '');
  },
  error: (tag: string, message: string, error?: unknown) => {
    console.error(`[${tag}] ${message}`, error !== undefined ? error : '');
  },
};
