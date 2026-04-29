import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './errorHandler';

/**
 * Enhanced storage utility.
 * Simple wrapper around AsyncStorage.
 */
export const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      logger.error('Storage', `SetItem failed for ${key}:`, e);
      throw e;
    }
  },

  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      logger.error('Storage', `GetItem failed for ${key}:`, e);
      return null;
    }
  },

  deleteItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      logger.error('Storage', `DeleteItem failed for ${key}:`, e);
      throw e;
    }
  },

  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      logger.error('Storage', 'Clear failed:', e);
      throw e;
    }
  },
};
