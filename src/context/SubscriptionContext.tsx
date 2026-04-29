/**
 * SubscriptionContext — Global subscription state provider.
 *
 * Makes subscription + usage data available to ANY screen via useSubscriptionContext().
 * Project screens can check `hasSubscription` / `isSubscriptionActive` before rendering actions.
 *
 * ARCHITECTURE:
 *  - Fetches subscription on mount (after auth)
 *  - Exposes: subscription, usage, hasSubscription, isSubscriptionActive, canCreateProject, refresh
 *  - Does NOT block UI — it provides data for components to decide
 */
import React, { createContext, useContext, useMemo } from 'react';
import { useSubscription } from '~/hooks/useSubscription';
import { useAuth } from './AuthContext';
import type { Subscription, Usage } from '~/api/types';

interface SubscriptionContextType {
  subscription: Subscription | null;
  usage: Usage | null;
  loading: boolean;
  error: string | null;
  hasSubscription: boolean;
  /** True if subscription exists AND status is 'active' */
  isSubscriptionActive: boolean;
  /** True if user can create more projects (under limit or unlimited) */
  canCreateProject: boolean;
  /** True if user can perform more calculations (under limit or unlimited) */
  canCalculate: boolean;
  refresh: () => Promise<void>;
  /** Increment usage locally after a calculation */
  incrementCalculationUsage: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  // Only fetch subscription data when user is authenticated
  const { subscription, usage, loading, error, hasSubscription, refresh, incrementCalculationUsage } = useSubscription();

  const isSubscriptionActive = useMemo(() => {
    if (!subscription) return false;
    return subscription.isActive;
  }, [subscription]);

  const canCreateProject = useMemo(() => {
    if (!subscription) return true; // allow if API fails or no sub info
    if (!subscription.isActive) return false; // block if inactive
    if (!usage) return true;

    const { used, limit } = usage.projectsLimit;
    if (limit === -1) return true;  // explicitly unlimited
    if (limit === 0) return true;   // unresolved from backend — allow by default
    return used < limit;
  }, [subscription, usage]);

  const canCalculate = useMemo(() => {
    if (!subscription) {
      console.log("[SubscriptionContext] No subscription -> ALLOW (fallback)");
      return true;
    }
    if (!subscription.isActive) {
      console.log("[SubscriptionContext] Subscription INACTIVE -> BLOCK");
      return false;
    }
    if (!usage) {
      console.log("[SubscriptionContext] No usage data -> ALLOW (fallback)");
      return true;
    }

    const { used, limit } = usage.leafCalculationsLimit;
    console.log("[SubscriptionContext] SUB:", subscription);
    console.log("[SubscriptionContext] USED:", used);
    console.log("[SubscriptionContext] MAX:", limit);

    if (limit === -1) {
      console.log("[SubscriptionContext] Limit is -1 -> UNLIMITED (ALLOW)");
      return true;
    }
    if (limit === 0) {
      console.log("[SubscriptionContext] Limit is 0 -> UNRESOLVED, defaulting to ALLOW");
      return true;
    }

    const isBlocked = used >= limit;
    console.log("[SubscriptionContext] BLOCKED:", isBlocked);
    return !isBlocked;
  }, [subscription, usage]);

  const value = useMemo(
    () => ({
      subscription,
      usage,
      loading,
      error,
      hasSubscription,
      isSubscriptionActive,
      canCreateProject,
      canCalculate,
      refresh,
      incrementCalculationUsage,
    }),
    [subscription, usage, loading, error, hasSubscription, isSubscriptionActive, canCreateProject, canCalculate, refresh, incrementCalculationUsage]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    // Graceful fallback — returns safe defaults if provider is missing
    return {
      subscription: null,
      usage: null,
      loading: false,
      error: null,
      hasSubscription: false,
      isSubscriptionActive: false,
      canCreateProject: true,
      canCalculate: true,
      refresh: async () => {},
      incrementCalculationUsage: () => {},
    };
  }
  return context;
};
