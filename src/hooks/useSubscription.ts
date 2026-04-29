/**
 * useSubscription — Fetches live subscription and usage data from the backend.
 *
 * Replaces all hardcoded subscription data in the settings screens.
 * Uses the same architecture as useProjects: fetch on mount + pull-to-refresh.
 */
import { useState, useEffect, useCallback } from 'react';
import { subscriptionApi } from '~/api/api';
import type { Subscription, Usage } from '~/api/types';
import { parseError } from '~/utils/errorHandler';

interface UseSubscriptionResult {
  subscription: Subscription | null;
  usage: Usage | null;
  loading: boolean;
  error: string | null;
  hasSubscription: boolean;
  refresh: () => Promise<void>;
  incrementCalculationUsage: () => void;
}

import { useAuth } from '~/context/AuthContext';

export function useSubscription(): UseSubscriptionResult {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setUsage(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      // Fetch subscription first — usage endpoint requires active subscription
      const subData = await subscriptionApi.getMine();
      setSubscription(subData);

      // Only fetch usage if subscription exists
      try {
        const usageData = await subscriptionApi.getUsage();
        
        // Patch usage limits using features_snapshot values.
        // The server sends limits as strings ("10", "15") in features_snapshot.
        // The usage endpoint may return 0 for limits — override from features_snapshot.
        const features = subData?.features;
        if (features && typeof features === 'object' && Object.keys(features).length > 0) {
          const resolveLimit = (key: string, currentLimit: number): number => {
            const val = features[key];
            if (val === undefined || val === null) return currentLimit;
            if (val === 'unlimited' || val === -1) return -1;
            const parsed = parseInt(String(val), 10);
            return isNaN(parsed) ? currentLimit : parsed;
          };

          usageData.projectsLimit.limit = resolveLimit('projects_limit', usageData.projectsLimit.limit);
          usageData.aiUsageLimit.limit = resolveLimit('ai_usage_limit', usageData.aiUsageLimit.limit);

          // Try all known key names for leaf/estimation limit
          let estLimit = usageData.leafCalculationsLimit.limit;
          for (const key of ['leaf_calculations_limit', 'estimations_limit', 'estimation_limit', 'calculations_limit']) {
            const resolved = resolveLimit(key, -999);
            if (resolved !== -999) { estLimit = resolved; break; }
          }
          usageData.leafCalculationsLimit.limit = estLimit;
        }

        setUsage(usageData);
      } catch {
        // Usage may fail if subscription is inactive — not a critical error
        setUsage(null);
      }
    } catch (err: any) {
      // 404 = no subscription is valid state, not an error
      const status = err?.status || err?.response?.status;
      if (status === 404) {
        setSubscription(null);
        setUsage(null);
      } else {
        // On network error or 500, KEEP last known subscription (do not set to null or FREE)
        setError(parseError(err, 'Failed to load subscription info'));
        console.warn('[useSubscription] Error fetching, keeping last known state.', err);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const incrementCalculationUsage = useCallback(() => {
    setUsage((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        leafCalculationsLimit: {
          ...prev.leafCalculationsLimit,
          used: prev.leafCalculationsLimit.used + 1,
        },
      };
    });
  }, []);

  return {
    subscription,
    usage,
    loading,
    error,
    hasSubscription: !!subscription,
    refresh: fetchData,
    incrementCalculationUsage,
  };
}
