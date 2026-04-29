import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import {
  Plus,
  CheckCircle2,
  HardHat,
  Building2,
  FolderOpen,
  AlertCircle,
} from 'lucide-react-native';

import { ProjectCard } from '~/components/features/projects/ProjectsCard';
import type { Project } from '~/api/types';
import { useLanguage } from '~/context/LanguageContext';
import { useProjects } from '~/hooks/useProjects';
import { useSubscriptionContext } from '~/context/SubscriptionContext';
import { estimationApi } from '~/api/api';
import { theme } from '~/constants/theme';
import { Skeleton } from '~/components/ui/Skeleton';
import { EmptyState } from '~/components/ui/EmptyState';
import { ErrorScreen } from '~/components/ui/ErrorScreen';
import { PremiumModal } from '~/components/ui/PremiumModal';

type FilterType = 'All' | 'Active' | 'Completed';
const FILTERS: FilterType[] = ['All', 'Active', 'Completed'];

// ─── Stat Sub-Component ───────────────────────────────────────────────────────

interface StatProps {
  icon: any;
  label: string;
  value: number;
  color: string;
  isArabic?: boolean;
}

const Stat = React.memo<StatProps>(({ icon: Icon, label, value, color, isArabic }) => (
  <View style={[styles.statCard, isArabic && styles.rtlStatCard]}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Icon size={18} color={color} />
    </View>
    <Text style={[styles.statValue, isArabic && styles.rtlText]}>{value}</Text>
    <Text style={[styles.statLabel, isArabic && styles.rtlText]}>{label}</Text>
  </View>
));

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomePage() {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const { projects, loading, refreshing, error, refresh } = useProjects();
  const { canCreateProject, hasSubscription, isSubscriptionActive } = useSubscriptionContext();

  const [filter, setFilter] = useState<FilterType>('All');
  const [categoryCount, setCategoryCount] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Fetch category count independently (doesn't affect project state)
  React.useEffect(() => {
    estimationApi
      .getCategories()
      .then((cats) => setCategoryCount(Array.isArray(cats) ? cats.length : 0))
      .catch(() => {});
  }, []);

  const filteredProjects = useMemo<Project[]>(() => {
    if (filter === 'All') return projects;
    return projects.filter((p) => {
      if (filter === 'Active') return p.status === 'active';
      if (filter === 'Completed') return p.status === 'completed';
      return true;
    });
  }, [projects, filter]);

  const stats = useMemo(
    () => ({
      total: projects.length,
      completed: projects.filter((p) => p.status === 'completed').length,
      categories: categoryCount,
    }),
    [projects, categoryCount]
  );

  const handleSetFilter = useCallback((f: FilterType) => setFilter(f), []);

  const renderItem = useCallback(
    ({ item }: { item: Project }) => <ProjectCard project={item} />,
    []
  );

  const keyExtractor = useCallback((item: Project) => item.projectId, []);

  // Show skeleton only on initial load, not on refresh
  if (loading && !refreshing && projects.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton width="100%" height={120} borderRadius={20} style={{ marginBottom: 20 }} />
          <View style={styles.stats}>
            <Skeleton width="30%" height={80} borderRadius={16} />
            <Skeleton width="30%" height={80} borderRadius={16} />
            <Skeleton width="30%" height={80} borderRadius={16} />
          </View>
          <View style={styles.filterRow}>
            <Skeleton width={80} height={32} borderRadius={10} />
            <Skeleton width={80} height={32} borderRadius={10} />
            <Skeleton width={80} height={32} borderRadius={10} />
          </View>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} width="100%" height={100} borderRadius={16} style={{ marginBottom: 12 }} />
          ))}
        </View>
      </View>
    );
  }

  if (error && projects.length === 0) {
    return (
      <ErrorScreen
        type={error.includes('Network') ? 'network' : 'unknown'}
        message={error}
        onRetry={() => refresh()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProjects}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            <Pressable
              style={[styles.createCard, isArabic && styles.rtlCreateCard]}
              onPress={() => {
                if (hasSubscription && !canCreateProject) {
                  setShowPremiumModal(true);
                  return;
                }
                router.push('/projects/create');
              }}
            >
              <Text style={[styles.createTitle, isArabic && styles.rtlText]}>
                {t('home.new_project')}
              </Text>
              <Text style={[styles.createSub, isArabic && styles.rtlText]}>
                {t('home.start_estimation')}
              </Text>
              <View style={[styles.createBtn, isArabic && styles.rtlCreateBtn]}>
                <Plus size={20} color={theme.colors.primary} />
                <Text style={styles.createBtnText}>{t('home.create')}</Text>
              </View>
            </Pressable>

            <View style={[styles.stats, isArabic && styles.rtlStats]}>
              <Stat
                icon={HardHat}
                label={t('dashboard.projects_stat')}
                value={stats.total}
                color={theme.colors.primary}
                isArabic={isArabic}
              />
              <Stat
                icon={CheckCircle2}
                label={t('dashboard.completed_stat')}
                value={stats.completed}
                color={theme.colors.success}
                isArabic={isArabic}
              />
              <Stat
                icon={Building2}
                label={t('dashboard.categories_stat')}
                value={stats.categories}
                color={theme.colors.warning}
                isArabic={isArabic}
              />
            </View>

            <View style={[styles.filterRow, isArabic && styles.rtlFilterRow]}>
              {FILTERS.map((f) => (
                <Pressable
                  key={f}
                  onPress={() => handleSetFilter(f)}
                  style={[styles.filterBtn, filter === f && styles.filterActive]}
                >
                  <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                    {t(`dashboard.${f.toLowerCase()}_filter`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title={t('dashboard.no_projects_found')}
            description={t('home.start_estimation')}
            actionLabel={t('home.new_project')}
            onAction={() => router.push('/projects/create')}
          />
        }
      />
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={() => {
          setShowPremiumModal(false);
          router.push('/settings');
        }}
        title={t('dashboard.limit_title')}
        description={t('dashboard.limit_message')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  content: { padding: theme.spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  createCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  rtlCreateCard: { alignItems: 'flex-end' },
  createTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  createSub: { color: '#dbeafe', marginBottom: 10 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 10,
    gap: 5,
    width: 100,
  },
  rtlCreateBtn: { flexDirection: 'row-reverse' },
  createBtnText: { color: theme.colors.primary, fontWeight: 'bold' },

  stats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  rtlStats: { flexDirection: 'row-reverse' },

  statCard: { backgroundColor: '#fff', padding: 12, borderRadius: 16, width: '30%' },
  rtlStatCard: { alignItems: 'flex-end' },
  statIcon: { width: 30, height: 30, padding: 6, borderRadius: 10, marginBottom: 6 },
  statValue: { fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: theme.colors.textSecondary },

  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  rtlFilterRow: { flexDirection: 'row-reverse' },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
  },
  filterActive: { backgroundColor: theme.colors.primary },
  filterText: { color: '#334155' },
  filterTextActive: { color: '#fff' },

  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: theme.colors.textSecondary, marginTop: 10 },

  loadingText: { marginTop: 12, color: theme.colors.textSecondary },
  rtlText: { textAlign: 'right' },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  retryBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: { color: '#fff', fontWeight: 'bold' },
});