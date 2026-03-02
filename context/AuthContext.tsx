import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => Promise<void>;
    logout: () => Promise<void>;
    getInitialRoute: (role?: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            // Extra safe check for native modules in some environments
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            // Silently fail if storage is not available - memory state is enough
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData: User) => {
        try {
            setUser(userData);
            if (AsyncStorage) {
                await AsyncStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (e) {
            console.warn('Failed to persist user to storage', e);
        }
    };

    const logout = async () => {
        try {
            setUser(null);
            if (AsyncStorage) {
                await AsyncStorage.removeItem('user');
            }
        } catch (e) {
            console.warn('Failed to remove user from storage', e);
        }
    };

    const getInitialRoute = (role?: string) => {
        const userRole = role || user?.role;
        if (userRole) {
            return '/(dashboard)';
        }
        return '/';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, getInitialRoute }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
