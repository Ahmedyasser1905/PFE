/**
 * useEstimationHistory — Fetches ALL saved leaf calculations from the API.
 *
 * Data flow: API → Mapper → This Hook → UI
 *
 * When projectId is provided: fetches estimation for that single project.
 * When no projectId: fetches ALL projects, then ALL estimations, and flattens.
 *
 * Returns data shaped as CalculationItem[] for direct use with CalculationCard.
 */
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { estimationApi } from '~/api/api';
import type { CalculationItem } from '~/components/features/calculations/CalculationCard';
import { logger } from '~/utils/errorHandler';

interface UseEstimationHistoryOptions {
  /** If provided, only fetches estimations for this project */
  projectId?: string;
}

interface UseEstimationHistoryResult {
  items: CalculationItem[];
  loading: boolean;
  totalCost: number;
  reload: () => Promise<void>;
}

export function useEstimationHistory({
  projectId,
}: UseEstimationHistoryOptions = {}): UseEstimationHistoryResult {
  const [items, setItems] = useState<CalculationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRemote = useCallback(async () => {
    try {
      setLoading(true);
      const allItems: CalculationItem[] = [];

      if (projectId) {
        // ── Single project mode ──
        const estimation = await estimationApi.getProjectEstimation(projectId);
        if (estimation?.leafCalculations) {
          estimation.leafCalculations.forEach((leaf) => {
            allItems.push({
              id: leaf.projectDetailsId,
              categoryName: leaf.categoryName,
              formulaName: leaf.formulaName,
              totalCost: leaf.leafTotal,
              leafTotal: leaf.leafTotal,
              createdAt: leaf.createdAt,
              projectId,
              projectDetailsId: leaf.projectDetailsId,
              isLocal: false,
            });
          });
        }
      } else {
        // ── All projects mode ──
        const projects = await estimationApi.listProjects();

        const results = await Promise.allSettled(
          projects.map(async (project) => {
            const estimation = await estimationApi.getProjectEstimation(project.projectId);
            return { project, estimation };
          })
        );

        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.estimation) {
            const { project, estimation } = result.value;
            (estimation.leafCalculations || []).forEach((leaf) => {
              allItems.push({
                id: leaf.projectDetailsId,
                categoryName: leaf.categoryName,
                formulaName: leaf.formulaName,
                totalCost: leaf.leafTotal,
                leafTotal: leaf.leafTotal,
                createdAt: leaf.createdAt,
                projectId: project.projectId,
                projectDetailsId: leaf.projectDetailsId,
                isLocal: false,
              });
            });
          }
        });
      }

      // Sort by date descending
      allItems.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );

      setItems(allItems);
    } catch (e) {
      logger.error('useEstimationHistory', 'Failed to fetch remote estimations:', e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useFocusEffect(
    useCallback(() => {
      fetchRemote();
    }, [fetchRemote])
  );

  const totalCost = items.reduce(
    (sum, item) => sum + (Number(item.totalCost || item.leafTotal || 0) || 0),
    0
  );

  return { items, loading, totalCost, reload: fetchRemote };
}
