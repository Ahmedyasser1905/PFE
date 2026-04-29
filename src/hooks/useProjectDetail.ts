/**
 * useProjectDetail — Extracts all business logic from the project detail screen.
 *
 * Handles: data fetching, status mutations (finish/restore/delete),
 * derived data computation (categoryGroups, recentActivity, totals).
 *
 * ARCHITECTURE NOTE: This hook ONLY receives and returns clean domain types.
 * The API layer (api/api.ts) handles all mapping from raw backend responses.
 */
import { useState, useCallback, useMemo } from 'react';

import { useRouter } from 'expo-router';
import { estimationApi } from '~/api/api';
import type { Project, EstimationReport, SavedLeafCalculation, Category } from '~/api/types';
import { parseError } from '~/utils/errorHandler';
import { useLanguage } from '~/context/LanguageContext';

export interface LeafEntry {
  id: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  formulaName?: string;
  configName?: string;
  createdAt?: string;
  totalCost?: number;
  leafTotal?: number;
  result?: number;
  type?: string;
  subCategory?: string;
  isLocal?: boolean;
  projectDetailsId?: string;
}

export interface CategoryGroup {
  name: string;
  count: number;
  leaves: LeafEntry[];
  categoryId?: string; // The category_id for navigating into children
}

interface UseProjectDetailResult {
  project: Project | null;
  estimation: EstimationReport | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isCompleted: boolean;
  savedLeaves: LeafEntry[];
  categoryGroups: CategoryGroup[];
  rootCategories: Category[];
  recentCalculations: LeafEntry[];
  calculatedTotal: number;
  projectIdShort: string;
  fetchData: () => Promise<void>;
  onRefresh: () => void;
}

/**
 * Maps a SavedLeafCalculation (clean domain type) to a LeafEntry for UI consumption.
 */
function mapSavedLeafToEntry(leaf: SavedLeafCalculation): LeafEntry {
  return {
    id: leaf.projectDetailsId,
    categoryId: leaf.categoryId,
    categoryName: leaf.categoryName,
    formulaName: leaf.formulaName,
    configName: leaf.configName || undefined,
    createdAt: leaf.createdAt,
    totalCost: leaf.leafTotal,
    leafTotal: leaf.leafTotal,
    projectDetailsId: leaf.projectDetailsId,
  };
}

export function useProjectDetail(
  id: string | undefined,
  localCalculations: LeafEntry[]
): UseProjectDetailResult {
  const router = useRouter();
  const { t } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);
  const [estimation, setEstimation] = useState<EstimationReport | null>(null);
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const [projData, estData, categoriesData] = await Promise.all([
        estimationApi.getProject(id),
        estimationApi.getProjectEstimation(id),
        estimationApi.getCategories()
      ]);
      setProject(projData);
      setEstimation(estData);
      
      // /categories returns ROOT-level entries — use them directly as "Start Calculation" shortcuts.
      // Previously this was filtering them OUT (wrong logic), leaving the shortcuts section empty.
      setRootCategories(categoriesData || []);
    } catch (err) {
      setError(parseError(err, t('projects.error_loading')));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const isCompleted = useMemo(
    () => project?.status === 'completed',
    [project]
  );

  // ─── Derived: merge remote leaves + local offline calculations ──────────────
  const savedLeaves = useMemo<LeafEntry[]>(() => {
    const remoteLeaves: LeafEntry[] = (estimation?.leafCalculations ?? []).map(mapSavedLeafToEntry);
    const mappedLocal: LeafEntry[] = localCalculations.map((c) => ({
      id: c.id,
      categoryName: c.category
        ? c.category.charAt(0).toUpperCase() + c.category.slice(1)
        : 'Estimation',
      formulaName: c.type || c.category,
      configName: c.subCategory || 'Local',
      createdAt: c.createdAt,
      totalCost: c.result,
      isLocal: true,
    }));
    return [...remoteLeaves, ...mappedLocal];
  }, [estimation, localCalculations]);

  const categoryGroups = useMemo<CategoryGroup[]>(() => {
    const map = new Map<string, CategoryGroup>();
    savedLeaves.forEach((leaf) => {
      const key = leaf.categoryId || leaf.categoryName || 'unknown';
      if (!map.has(key)) {
        map.set(key, {
          name: leaf.categoryName || t('common.unknown'),
          count: 0,
          leaves: [],
          categoryId: leaf.categoryId,
        });
      }
      const entry = map.get(key)!;
      entry.count += 1;
      entry.leaves.push(leaf);
    });
    return Array.from(map.values());
  }, [savedLeaves]);

  const recentCalculations = useMemo<LeafEntry[]>(
    () =>
      [...savedLeaves]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        )
        .slice(0, 5),
    [savedLeaves]
  );

  /**
   * Budget total — source of truth priority:
   *   1. estimation.totalBudget — server-persisted running total (most authoritative)
   *   2. project.totalCost     — snapshot at last save (also server-sourced)
   *   3. Sum of leaf entries   — local fallback only when above are unavailable/zero
   *
   * Bug fixed: the previous code summed leaf entries, which zeroed out when the
   * estimation fetch failed silently (catch → null), discarding the server total.
   */
  const calculatedTotal = useMemo(() => {
    const serverTotal = Number(estimation?.totalBudget ?? 0);
    const projectTotal = Number(project?.totalCost ?? 0);
    const leafSum = savedLeaves.reduce(
      (sum, leaf) => sum + (Number(leaf.totalCost ?? leaf.leafTotal) || 0),
      0
    );
    // The backend `estimation.total_budget` strictly sums material lines (`estimation_detail_material`).
    // If a project contains purely computational formulas (no materials), the server total will be lower
    // than the actual cost. `leafSum` includes the correctly mapped JSON result values, so we take the max.
    return Math.max(serverTotal, projectTotal, leafSum);
  }, [estimation, project, savedLeaves]);

  const projectIdShort = useMemo(
    () => ((project?.projectId ?? '').split('-')[0] ?? '').toUpperCase(),
    [project]
  );

  // ─── Mutations ───────────────────────────────────────────────────────────────

  return {
    project,
    estimation,
    loading,
    refreshing,
    error,
    isCompleted,
    savedLeaves,
    categoryGroups,
    rootCategories,
    recentCalculations,
    calculatedTotal,
    projectIdShort,
    fetchData,
    onRefresh,
  };
}
