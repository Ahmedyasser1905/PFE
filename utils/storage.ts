import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

// In-memory fallback for environments where both AsyncStorage and SecureStore fail
const memoryStorage: Record<string, string> = {};

export const storage = {
    async setItem(key: string, value: string) {
        try {
            if (isWeb) {
                localStorage.setItem(key, value);
                return;
            }

            // Try SecureStore
            try {
                if (SecureStore && await SecureStore.isAvailableAsync()) {
                    await SecureStore.setItemAsync(key, value);
                    return;
                }
            } catch (e) { }

            // Try AsyncStorage
            try {
                if (AsyncStorage) {
                    await AsyncStorage.setItem(key, value);
                    return;
                }
            } catch (e) { }

            // Fallback
            memoryStorage[key] = value;
        } catch (e) {
            memoryStorage[key] = value;
        }
    },

    async getItem(key: string): Promise<string | null> {
        try {
            if (isWeb) {
                return localStorage.getItem(key);
            }

            // Try SecureStore
            try {
                if (SecureStore && await SecureStore.isAvailableAsync()) {
                    const val = await SecureStore.getItemAsync(key);
                    if (val !== null) return val;
                }
            } catch (e) { }

            // Try AsyncStorage
            try {
                if (AsyncStorage) {
                    const val = await AsyncStorage.getItem(key);
                    if (val !== null) return val;
                }
            } catch (e) { }

            return memoryStorage[key] || null;
        } catch (e) {
            return memoryStorage[key] || null;
        }
    },

    async deleteItem(key: string) {
        try {
            if (isWeb) {
                localStorage.removeItem(key);
                return;
            }

            try {
                if (SecureStore && await SecureStore.isAvailableAsync()) {
                    await SecureStore.deleteItemAsync(key);
                }
            } catch (e) { }

            try {
                if (AsyncStorage) {
                    await AsyncStorage.removeItem(key);
                }
            } catch (e) { }

            delete memoryStorage[key];
        } catch (e) {
            delete memoryStorage[key];
        }
    }
};
