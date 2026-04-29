/**
 * ProjectDetailScreen — UI layer only (thin screen).
 *
 * All business logic lives in:
 *  - hooks/useProjectDetail.ts  (fetch, mutations, derived data)
 *  - hooks/useLocalCalculations.ts  (offline storage)
 *
 * Completed projects are fully read-only:
 *  - No "Start Calculation" section
 *  - No "Recent Activity" section
 *  - Only shows Restore/Delete buttons
 *  - Lock banner displayed prominently
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import {
  HardHat,
  Paintbrush,
  DoorOpen,
  LayoutGrid,
  Grid3X3,
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  AlertCircle,
  ChevronRight,
  Lock,
  FileDown,
  Trash2,
} from 'lucide-react-native';
import { theme } from '~/constants/theme';
import { useProjectDetail } from '~/hooks/useProjectDetail';
import { useLocalCalculations } from '~/hooks/useLocalCalculations';
import { CalculationCard, CalculationItem } from '~/components/features/calculations/CalculationCard';
import { estimationApi } from '~/api/api';
import { ErrorScreen } from '~/components/ui/ErrorScreen';
import { EmptyState } from '~/components/ui/EmptyState';
import { useFeedback } from '~/context/FeedbackContext';

// ─── Icon helpers ─────────────────────────────────────────────────────────────
const getCategoryIcon = (name: string) => {
  const low = (name || '').toLowerCase();
  if (low.includes('grand') || low.includes('struct') || low.includes('gros')) return HardHat;
  if (low.includes('finit') || low.includes('paint') || low.includes('decor')) return Paintbrush;
  if (low.includes('door') || low.includes('window') || low.includes('porte')) return DoorOpen;
  return LayoutGrid;
};

const getCategoryColor = (name: string): [string, string] => {
  const low = (name || '').toLowerCase();
  if (low.includes('grand') || low.includes('struct') || low.includes('gros')) return ['#2563EB', '#EFF6FF'];
  if (low.includes('finit') || low.includes('paint')) return ['#16A34A', '#F0FDF4'];
  if (low.includes('door') || low.includes('window') || low.includes('porte')) return ['#6366F1', '#F5F3FF'];
  return ['#0EA5E9', '#F0F9FF'];
};


// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Local offline calculations
  const { calculations: localCalculations } = useLocalCalculations({ projectId: id });

  // All business logic
  const {
    project,
    loading,
    refreshing,
    error,
    isCompleted,
    categoryGroups,
    rootCategories,
    recentCalculations,
    calculatedTotal,
    projectIdShort,
    fetchData,
    onRefresh
  } = useProjectDetail(id as string, localCalculations);

  const { showFeedback } = useFeedback();

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // ─── Export PDF handler ──────────────────────────────────────────────────────
  const handleExportPDF = useCallback(async () => {
    if (!id) return;
    showFeedback({
      title: 'Export Report',
      message: 'Generate and send a PDF report for this project?',
      type: 'info',
      primaryText: 'Export',
      secondaryText: 'Cancel',
      onPrimary: async () => {
        try {
          const result = await estimationApi.exportProject(id);
          showFeedback({ title: 'Success', message: result?.message || 'PDF report has been sent to your email.', type: 'success' });
        } catch (err: any) {
          showFeedback({ title: 'Export Failed', message: JSON.stringify(err?.response?.data || err?.message || 'Could not generate report. Make sure the project has saved calculations.'), type: 'error' });
        }
      },
    });
  }, [id, showFeedback]);

  // ─── Delete leaf handler ────────────────────────────────────────────────────
  const handleDeleteLeaf = useCallback((projectDetailsId: string, categoryName: string) => {
    if (isCompleted) return;
    showFeedback({
      title: 'Delete Calculation',
      message: `Remove the "${categoryName}" calculation from this project?`,
      type: 'warning',
      primaryText: 'Delete',
      secondaryText: 'Cancel',
      onPrimary: async () => {
        try {
          await estimationApi.deleteLeaf(projectDetailsId);
          fetchData(); // Refresh to reflect changes
        } catch (err: any) {
          showFeedback({ title: 'Error', message: JSON.stringify(err?.response?.data || err?.message || 'Failed to delete calculation.'), type: 'error' });
        }
      },
    });
  }, [isCompleted, fetchData, showFeedback]);

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────
  if (error || !project) {
    return (
      <ErrorScreen
        type={error?.includes('Network') ? 'network' : 'unknown'}
        message={error || 'Project not found'}
        onRetry={fetchData}
      />
    );
  }

  const totalCost = calculatedTotal.toLocaleString();
  const leafCount = categoryGroups.reduce((s, g) => s + g.count, 0);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.content}>

          {/* ── Title + Status ── */}
          <Text style={styles.title}>{project.name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>📋 {projectIdShort}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={[styles.metaText, isCompleted && styles.metaCompleted]}>
              {isCompleted ? 'COMPLETED' : 'ACTIVE'}
            </Text>
          </View>

          {/* ── Lock Banner (read-only guard) ── */}
          {isCompleted && (
            <View style={styles.lockBanner}>
              <Lock size={16} color="#B91C1C" />
              <Text style={styles.lockBannerText}>
                This project is completed and locked — no modifications allowed.
              </Text>
            </View>
          )}

          {/* ── Budget Card ── */}
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <TrendingUp size={18} color="#10B981" />
              <Text style={styles.budgetTitle}>BUDGET OVERVIEW</Text>
            </View>
            <View style={styles.budgetContent}>
              <View>
                <Text style={styles.budgetMainValue}>DZD {totalCost}</Text>
                <Text style={styles.budgetSubText}>Cumulative Project Cost</Text>
              </View>
              <View style={styles.budgetIconCircle}>
                <DollarSign size={24} color="#059669" />
              </View>
            </View>
          </View>

          {/* ── Description ── */}
          {!!project.description && (
            <View style={styles.overviewCard}>
              <Text style={styles.overviewLabel}>PROJECT OVERVIEW</Text>
              <Text style={styles.overviewText}>{project.description}</Text>
            </View>
          )}

          {/* ── Stats ── */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View>
                <Text style={styles.statLabel}>Total Calculations</Text>
                <Text style={styles.statValue}>{leafCount}</Text>
              </View>
              <Grid3X3 size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.statCard}>
              <View>
                <Text style={styles.statLabel}>Active Categories</Text>
                <Text style={styles.statValue}>{categoryGroups.length}</Text>
              </View>
              <BarChart3 size={22} color={theme.colors.primary} />
            </View>
          </View>

          {/* ── Quick Category Shortcuts (ACTIVE only) ── */}
          {!isCompleted && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Start Calculation</Text>
              </View>
              <View style={styles.mainCategoriesRow}>
                {rootCategories.map((cat) => {
                  const Icon = getCategoryIcon(cat.nameEn);
                  const [color, bg] = getCategoryColor(cat.nameEn);
                  return (
                    <Pressable
                      key={cat.categoryId}
                      style={styles.mainCatCard}
                      onPress={() =>
                        router.push({
                          pathname: '/(dashboard)/projects/[id]/category/[categoryId]',
                          params: { id, categoryId: cat.categoryId },
                        })
                      }
                    >
                      <View style={[styles.mainCatIcon, { backgroundColor: bg }]}>
                        <Icon size={24} color={color} />
                      </View>
                      <Text style={styles.mainCatText} numberOfLines={1}>{cat.nameEn}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* ── Saved Calculations (Category Groups) ── */}
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Saved Calculations</Text>
          </View>

          {categoryGroups.length === 0 ? (
            <EmptyState
              icon={<LayoutGrid size={48} color="#94a3b8" />}
              title="No calculations yet"
              description={isCompleted ? "This project has no saved calculations." : "Select a category above to start your first estimation."}
            />
          ) : (
            categoryGroups.map((group, idx) => {
              const Icon = getCategoryIcon(group.name);
              const [iconColor, iconBg] = getCategoryColor(group.name);
              const tags = Array.from(
                new Set(group.leaves.flatMap((l) => [l.formulaName, l.configName].filter(Boolean)))
              ).slice(0, 2) as string[];

              return (
                <Pressable
                  key={`cat-${idx}`}
                  style={styles.categoryCard}
                  onPress={() =>
                    router.push({
                      pathname: '/(dashboard)/estimation-history/',
                      params: { projectId: id, isReadOnly: isCompleted ? 'true' : 'false' },
                    })
                  }
                >
                  <View style={styles.categoryCardTop}>
                    <View style={[styles.categoryIcon, { backgroundColor: iconBg }]}>
                      <Icon size={22} color={iconColor} />
                    </View>
                    <Text style={styles.categoryCalcCount}>{group.count} CALCS</Text>
                  </View>
                  <Text style={styles.categoryTitle}>{group.name}</Text>
                  <Text style={styles.categorySub} numberOfLines={1}>
                    {group.leaves.map((l) => l.formulaName).filter(Boolean).slice(0, 2).join(', ') ||
                      'Estimation data'}
                  </Text>
                  {tags.length > 0 && (
                    <View style={styles.tagsRow}>
                      {tags.map((tag, ti) => (
                        <View key={ti} style={styles.tag}>
                          <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })
          )}

          {/* View All / Estimation History buttons (ACTIVE only) */}
          {!isCompleted && (
            <Pressable
              style={styles.viewAllBtn}
              onPress={() =>
                router.push({
                  pathname: '/(dashboard)/all-calculations/',
                  params: { projectId: id },
                })
              }
            >
              <Text style={styles.viewAllText}>View all activity →</Text>
            </Pressable>
          )}

          {/* ── Export PDF Button ── */}
          <TouchableOpacity
            style={[styles.exportBtn]}
            onPress={handleExportPDF}
            activeOpacity={0.8}
          >
            <FileDown size={20} color={theme.colors.primary} />
            <Text style={styles.exportBtnText}>Export PDF Report</Text>
          </TouchableOpacity>

          <Pressable
            style={[styles.viewAllBtn, { marginTop: 8, backgroundColor: '#EFF6FF', borderWidth: 0 }]}
            onPress={() =>
              router.push({
                pathname: '/(dashboard)/estimation-history/',
                params: { projectId: id, isReadOnly: isCompleted ? 'true' : 'false' },
              })
            }
          >
            <Text style={[styles.viewAllText, { color: theme.colors.primary, fontWeight: '700' }]}>
              View Detailed Estimation History →
            </Text>
          </Pressable>

          {/* ── Recent Activity (ACTIVE only) ── */}
          {!isCompleted && recentCalculations.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>
                Recent Activity
              </Text>
              {recentCalculations.map((calc, idx) => (
                <View key={calc.id || `recent-${idx}`} style={styles.recentItemWrapper}>
                  <CalculationCard
                    item={calc as CalculationItem}
                    isReadOnly={isCompleted}
                    onPress={(c) =>
                      router.push({
                        pathname: '/(dashboard)/calculation-details/[id]',
                        params: { id: c.id || (c as any).projectDetailsId, projectId: id },
                      })
                    }
                  />
                  {!isCompleted && calc.projectDetailsId && (
                    <TouchableOpacity
                      style={styles.deleteLeafBtn}
                      onPress={() => handleDeleteLeaf(calc.projectDetailsId!, calc.categoryName || 'Calculation')}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <Pressable
                style={styles.viewAllBtn}
                onPress={() =>
                  router.push({ pathname: '/(dashboard)/all-calculations/', params: { projectId: id } })
                }
              >
                <Text style={styles.viewAllText}>View all activity →</Text>
              </Pressable>
            </>
          )}

          {/* Action Buttons removed because they are not supported by the backend API contract */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: theme.colors.textSecondary, fontWeight: '500' },

  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginBottom: 8, letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  metaText: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  metaDot: { color: '#CBD5E1' },
  metaCompleted: { color: '#10B981', fontWeight: '700' },

  lockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 20,
  },
  lockBannerText: { color: '#991B1B', fontSize: 13, fontWeight: '600', flex: 1 },

  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  budgetHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  budgetTitle: { fontSize: 12, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  budgetContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetMainValue: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  budgetSubText: { fontSize: 13, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
  budgetIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },

  overviewCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  overviewLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 8 },
  overviewText: { color: '#334155', fontSize: 14, lineHeight: 22 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  statLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  statValue: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginTop: 2 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },

  mainCategoriesRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  mainCatCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 12,
  },
  mainCatIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  mainCatText: { fontSize: 13, fontWeight: '700', color: '#0F172A', textAlign: 'center' },

  categoryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  categoryCalcCount: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },
  categoryTitle: { fontWeight: '700', fontSize: 17, color: '#0F172A', marginBottom: 4 },
  categorySub: { color: '#64748B', fontSize: 13, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', gap: 8 },
  tag: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  tagText: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 0.5 },

  viewAllBtn: { marginTop: 12, alignItems: 'center', paddingVertical: 12 },
  viewAllText: { color: theme.colors.primary, fontWeight: '700', fontSize: 14 },

  actionBtn: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 20,
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 12,
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  exportBtnText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  recentItemWrapper: {
    position: 'relative',
  },
  deleteLeafBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
