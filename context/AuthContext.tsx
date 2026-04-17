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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const [storedUser, token] = await Promise.all([
                    storage.getItem('userData'),
                    storage.getItem('userToken'),
                ]);
                if (storedUser && token) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error('[Auth] Initialization error:', e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const login = async (userData: User, token: string) => {
        await Promise.all([
            storage.setItem('userData', JSON.stringify(userData)),
            storage.setItem('userToken', token),
        ]);
        setUser(userData);
    };

    const logout = async () => {
        await Promise.all([
            storage.deleteItem('userData'),
            storage.deleteItem('userToken'),
        ]);
        setUser(null);
    };

    const value = useMemo(
        () => ({
            user,
            loading,
            login,
            logout,
        }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
