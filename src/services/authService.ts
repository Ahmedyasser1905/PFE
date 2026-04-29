import { logger } from '~/utils/errorHandler';
import { storage } from '~/utils/storage';
import { STORAGE_KEYS } from '~/constants/config';
import { authApi } from '~/api/authApi';

/**
 * Token management service using Local Storage (JWT).
 * Strictly manages accessToken and refreshToken separation.
 */
export const authService = {
  /**
   * Retrieves the current access token from storage.
   * ALWAYS reads from storage to avoid stale in-memory values.
   */
  getValidToken: async (): Promise<string | null> => {
    try {
      return await storage.getItem(STORAGE_KEYS.USER_TOKEN);
    } catch (e) {
      logger.error('AuthService', 'Error reading token:', e);
      return null;
    }
  },

  /**
   * Refreshes the access token using the refresh token from storage.
   * This is the ONLY place where refreshToken should be used.
   */
  refreshToken: async (): Promise<string | null> => {
    try {
      const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        logger.warn('AuthService', 'No refresh token found in storage');
        return null;
      }

      logger.info('AuthService', 'Attempting to refresh token...');
      // refreshToken is passed as payload to the /refresh endpoint
      const response = await authApi.refreshToken(refreshToken);
      
      if (response && response.accessToken) {
        // Immediately persist the fresh accessToken
        await storage.setItem(STORAGE_KEYS.USER_TOKEN, response.accessToken);
        logger.info('AuthService', 'Token refreshed successfully and stored');
        return response.accessToken;
      }
      
      logger.error('AuthService', 'Refresh failed - no accessToken in response');
      return null;
    } catch (e) {
      logger.warn('AuthService', 'Token refresh failed - session likely expired');
      return null;
    }
  },

  /**
   * Clears all locally persisted auth data on definitive auth failure.
   */
  handleInvalidToken: async () => {
    logger.warn('AuthService', 'Clearing all session data due to invalid/expired tokens');
    try {
      await Promise.all([
        storage.deleteItem(STORAGE_KEYS.USER_TOKEN),
        storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
        storage.deleteItem(STORAGE_KEYS.USER_DATA),
      ]);
      console.log('[AuthService] Session data cleared successfully');
    } catch (e) {
      logger.error('AuthService', 'Session cleanup error:', e);
    }
  },
};

