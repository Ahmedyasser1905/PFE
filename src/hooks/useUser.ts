import { useCallback } from 'react';
import { useAuth } from '~/context/AuthContext';
import { usersApi } from '~/api/api';
import { User } from '~/api/types';
import { logger } from '~/utils/errorHandler';

/**
 * Convenience hook that augments useAuth with helper methods for
 * the current user (derived name, profile fetch/update).
 */
export const useUser = () => {
  const { user, updateUser, loading: authLoading } = useAuth();

  const fetchProfile = useCallback(async (): Promise<User> => {
    try {
      const profile = await usersApi.getProfile();
      await updateUser(profile);
      return profile;
    } catch (error) {
      logger.error('useUser', 'Failed to fetch profile:', error);
      throw error;
    }
  }, [updateUser]);

  return {
    user,
    name: user?.name || user?.email?.split('@')[0] || 'User',
    email: user?.email,
    id: user?.id,
    loading: authLoading,
    fetchProfile,
  };
};
