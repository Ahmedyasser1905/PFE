import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { storage } from '~/utils/storage';
import { User } from '~/api/types';
import { authService } from '~/services/authService';
import { usersApi } from '~/api/api';
import { STORAGE_KEYS } from '~/constants/config';
import { logger, parseError } from '~/utils/errorHandler';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserInternal] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const setUser = (newUser: User | null) => {
    setUserInternal(prev => {
      console.log(`[AuthContext] setUser state transition: ${prev?.email || 'null'} -> ${newUser?.email || 'null'}`);
      return newUser;
    });
  };

  // ─── Initialization ────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      console.log('[AuthContext] Initializing auth state...');
      try {
        const token = await authService.getValidToken();
        const storedUser = await storage.getItem(STORAGE_KEYS.USER_DATA);
        
        console.log('[AuthContext] Stored data found:', { hasToken: !!token, hasUser: !!storedUser });

        if (token && storedUser) {
           try {
             const parsedUser = JSON.parse(storedUser);
             // Require both id and email — if missing the stored shape is stale/corrupt
             if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.email) {
               console.log('[AuthContext] Restoring user from storage:', parsedUser.email);
               setUser(parsedUser);
             } else {
               // Shape is invalid — clear the bad entry but keep the token so /me can still run
               console.warn('[AuthContext] Stored user is missing id or email — clearing stale data, will fetch fresh from /me');
               await storage.deleteItem(STORAGE_KEYS.USER_DATA);
             }
           } catch (parseErr) {
             console.error('[AuthContext] Failed to parse stored user JSON:', parseErr);
             await storage.deleteItem(STORAGE_KEYS.USER_DATA);
           }
           
           // Async check: verify profile session is still valid
           try {
             const freshProfile = await usersApi.getProfile();
             console.log('[AuthContext] Profile verified successfully');
             if (mounted) {
               await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(freshProfile));
               setUser(freshProfile);
             }
           } catch (e: any) {
             console.log('[AuthContext] Profile verification failed:', e.status);
             if (e.status === 401 || e.status === 404) {
               console.log('[AuthContext] Session invalid (401/404), clearing...');
               await authService.handleInvalidToken();
               if (mounted) setUser(null);
             }
           }
        } else {
           console.log('[AuthContext] No valid session found');
        }
      } catch (e: any) {
        console.error('[AuthContext] Initialization failed:', e);
        logger.error('Auth', 'Initialization failed:', parseError(e));
      } finally {
        if (mounted) {
           console.log('[AuthContext] Initialization complete, loading -> false');
           setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const login = useCallback(async (userData: User, accessToken: string, refreshToken?: string) => {
    if (!userData || !accessToken) {
      console.error('[AuthContext] Login failed: Missing user or token data');
      throw new Error('Invalid login response data');
    }

    console.log('[AuthContext] Login called for:', userData.email);
    setIsLoggingIn(true);
    
    const role = (userData.role || '').toLowerCase();
    console.log("FINAL ROLE:", role);

    if (role === 'admin') {
      console.error('[AuthContext] Admin login attempt blocked for:', userData.email);
      await logout();
      alert("This account is not allowed to access the application");
      setIsLoggingIn(false);
      throw new Error("Unauthorized role");
    }

    // Force role normalization to 'CLIENT'
    userData.role = 'CLIENT';
    
    try {
      // 1. Store tokens and data SECURELY (ensure no undefined)
      const tasks = [
        storage.setItem(STORAGE_KEYS.USER_TOKEN, accessToken),
        storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData)),
      ];

      if (refreshToken) {
        tasks.push(storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken));
      }

      await Promise.all(tasks);
      console.log('[AuthContext] Storage updated successfully');
      
      // 2. Setting user state internally FIRST
      setUser(userData);
      
      // 3. Attempt to get full profile if userData was partial
      try {
        console.log('[AuthContext] Fetching full profile...');
        const finalUser = await usersApi.getProfile();
        if (finalUser) {
          await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(finalUser));
          setUser(finalUser);
          console.log('[AuthContext] Full profile fetched and stored');
        }
      } catch (e) {
        console.warn('[AuthContext] Post-login profile fetch failed (using initial data):', e);
      }

    } catch (err) {
      console.error('[AuthContext] Login storage/state error:', err);
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.handleInvalidToken();
    setUser(null);
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    console.log('[AuthContext] updateUser called with:', updates);
    return new Promise<void>((resolve) => {
      setUserInternal((prev) => {
        if (!prev) {
          resolve();
          return prev;
        }
        const updated = { ...prev, ...updates };
        
        // Persist to storage immediately
        storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updated))
          .then(() => {
            console.log('[AuthContext] User data persisted to storage');
            resolve();
          })
          .catch((e) => {
            logger.error('Auth', 'Failed to persist user update:', e);
            resolve(); // Still resolve to avoid hanging, even if storage fails
          });
          
        return updated;
      });
    });
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, updateUser, isLoggingIn }),
    [user, loading, login, logout, updateUser, isLoggingIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
