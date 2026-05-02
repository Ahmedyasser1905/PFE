import React, { useMemo, useState, useCallback } from 'react';
import {
   View,
   Text,
   StyleSheet,
   Pressable,
   FlatList,
   ActivityIndicator,
   RefreshControl,
   ViewStyle,
   TextStyle,
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

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: theme.colors.background
   } as ViewStyle,
   content: {
      padding: theme.spacing.lg,
      paddingBottom: 40,
   } as ViewStyle,
   createCard: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.roundness.xxl,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
      ...theme.shadows.md,
   } as ViewStyle,
   rtlCreateCard: { alignItems: 'flex-end' } as ViewStyle,
   createTitle: {
      ...theme.typography.h2,
      color: theme.colors.white,
      marginBottom: 4,
   } as TextStyle,
   createSub: {
      ...theme.typography.body,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: theme.spacing.lg,
   } as TextStyle,
   createBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.roundness.lg,
      gap: theme.spacing.sm,
      alignSelf: 'flex-start',
      ...theme.shadows.sm,
   } as ViewStyle,
   rtlCreateBtn: { flexDirection: 'row-reverse' } as ViewStyle,
   createBtnText: {
      color: theme.colors.primary,
      fontWeight: '800',
      fontSize: 15,
   } as TextStyle,

   stats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.md,
   } as ViewStyle,
   rtlStats: { flexDirection: 'row-reverse' } as ViewStyle,

   statCard: {
      flex: 1,
      backgroundColor: theme.colors.white,
      padding: theme.spacing.md,
      borderRadius: theme.roundness.lg,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      ...theme.shadows.xs,
   } as ViewStyle,
   rtlStatCard: { alignItems: 'flex-end' } as ViewStyle,
   statIcon: {
      width: 36,
      height: 36,
      borderRadius: theme.roundness.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
   } as ViewStyle,
   statValue: {
      ...theme.typography.h3,
      color: theme.colors.text,
   } as TextStyle,
   statLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
   } as TextStyle,

   filterRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
   } as ViewStyle,
   rtlFilterRow: { flexDirection: 'row-reverse' } as ViewStyle,
   filterBtn: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
   } as ViewStyle,
   filterActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      ...theme.shadows.sm,
   } as ViewStyle,
   filterText: {
      ...theme.typography.small,
      fontWeight: '600',
      color: theme.colors.textSecondary,
   } as TextStyle,
   filterTextActive: {
      color: theme.colors.white,
   } as TextStyle,

   rtlText: { textAlign: 'right' } as TextStyle,
   errorText: {
      color: theme.colors.error,
      textAlign: 'center',
      marginVertical: 16,
      paddingHorizontal: 20,
   } as TextStyle,
   retryBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
   } as ViewStyle,
   retryBtnText: { color: '#fff', fontWeight: 'bold' } as TextStyle,
   mb20: { marginBottom: 20 } as ViewStyle,
   mb12: { marginBottom: 12 } as ViewStyle,
});

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
         .catch(() => { });
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
               <Skeleton width="100%" height={120} borderRadius={20} style={styles.mb20} />
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
                  <Skeleton key={i} width="100%" height={100} borderRadius={16} style={styles.mb12} />
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
               router.push('/settings/subscription');
            }}
         />
      </View>
   );
}