import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { storage } from '../utils/storage';

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
    login: (userData: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    getInitialRoute: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const storedUser = await storage.getItem('userData');
                const token = await storage.getItem('userToken');

                if (storedUser && token) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('[AuthContext] Error loading initial auth data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const login = useMemo(() => async (userData: User, token: string) => {
        try {
            await storage.setItem('userData', JSON.stringify(userData));
            await storage.setItem('userToken', token);
            setUser(userData);
        } catch (error) {
            console.error('[AuthContext] Login persistence failed:', error);
        }
    }, [setUser]);

    const logout = useMemo(() => async () => {
        console.log('[AuthContext] Logging out...');
        try {
            // Clear storage FIRST to prevent race conditions on reload
            await storage.deleteItem('userData');
            await storage.deleteItem('userToken');

            // Then update state to trigger UI changes
            setUser(null);
            console.log('[AuthContext] Logout complete (state cleared)');
        } catch (error) {
            console.error('[AuthContext] Logout failed to clear storage:', error);
        }
    }, [setUser]);

    const getInitialRoute = useMemo(() => () => {
        return '/(dashboard)';
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        login,
        logout,
        getInitialRoute
    }), [user, loading, login, logout, getInitialRoute]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
