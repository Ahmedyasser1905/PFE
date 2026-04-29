import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  HardHat,
  ChevronRight,
  FolderOpen,
  AlertCircle,
  BarChart3,
} from 'lucide-react-native';
import type { Project } from '~/api/types';
import { theme } from '~/constants/theme';
import { useProjects } from '~/hooks/useProjects';
import { formatCurrency, formatProjectId } from '~/utils/formatters';
import { Skeleton } from '~/components/ui/Skeleton';
import { EmptyState } from '~/components/ui/EmptyState';
import { ErrorScreen } from '~/components/ui/ErrorScreen';

type TabType = 'active' | 'completed';

export default function ProjectsScreen() {
  const router = useRouter();
  const { projects, loading, refreshing, error, refresh, refetch } = useProjects();
  const [activeTab, setActiveTab] = useState<TabType>('active');

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) => p.status === activeTab
      ),
    [projects, activeTab]
  );

  const keyExtractor = useCallback((item: Project) => item.projectId, []);

  const renderItem = useCallback(
    ({ item: project }: { item: Project }) => {
      const isCompleted = project.status === 'completed';
      return (
        <Pressable
          style={({ pressed }) => [styles.projectCard, pressed && styles.projectCardPressed]}
          onPress={() =>
            router.push({
              pathname: '/(dashboard)/projects/[id]/',
              params: { id: project.projectId },
            })
          }
        >
          <View style={styles.projectCardTop}>
            <View style={styles.iconBox}>
              <HardHat size={22} color={theme.colors.primary} />
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isCompleted ? theme.colors.success : theme.colors.primaryLight },
              ]}
            >
              <Text style={styles.statusText}>
                {project.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.projectName}>{project.name}</Text>
          {project.description ? (
            <Text style={styles.projectDesc} numberOfLines={2}>
              {project.description}
            </Text>
          ) : null}

          <View style={styles.projectStatsRow}>
            <View style={styles.projectStat}>
              <BarChart3 size={14} color={theme.colors.muted} />
              <Text style={styles.projectStatText}>
                {project.leafCount || 0} Estimations
              </Text>
            </View>
            {project.totalCost != null && !isNaN(Number(project.totalCost)) && (
              <Text style={styles.projectCost}>{formatCurrency(project.totalCost)}</Text>
            )}
          </View>

          <View style={styles.projectFooter}>
            <Text style={styles.projectId}>{formatProjectId(project.projectId)}</Text>
            <ChevronRight size={18} color={theme.colors.muted} />
          </View>
        </Pressable>
      );
    },
    [router]
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.scrollContent}>
          <View style={styles.filterTabs}>
            <Skeleton width="50%" height={40} borderRadius={8} />
            <Skeleton width="50%" height={40} borderRadius={8} />
          </View>
          {[1, 2, 3, 4].map((key) => (
            <View key={key} style={[styles.projectCard, { height: 160, marginBottom: 12 }]}>
               <View style={styles.projectCardTop}>
                 <Skeleton width={44} height={44} borderRadius={12} />
                 <Skeleton width={80} height={24} borderRadius={6} />
               </View>
               <Skeleton width="70%" height={20} style={{ marginBottom: 12 }} />
               <Skeleton width="100%" height={14} style={{ marginBottom: 6 }} />
               <Skeleton width="90%" height={14} style={{ marginBottom: 20 }} />
               <View style={styles.projectFooter}>
                 <Skeleton width={100} height={14} />
               </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          filtered.length === 0 && styles.scrollContentEmpty,
        ]}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListHeaderComponent={
          error ? (
            <ErrorScreen
              type={error.includes('Network') ? 'network' : 'unknown'}
              message={error}
              onRetry={refetch}
            />
          ) : (
            <View style={styles.filterTabs}>
              <Pressable
                style={[styles.filterTab, activeTab === 'active' && styles.filterTabActive]}
                onPress={() => setActiveTab('active')}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeTab === 'active' && styles.filterTabTextActive,
                  ]}
                >
                  Active
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.filterTab,
                  activeTab === 'completed' && styles.filterTabActive,
                ]}
                onPress={() => setActiveTab('completed')}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeTab === 'completed' && styles.filterTabTextActive,
                  ]}
                >
                  Completed
                </Text>
              </Pressable>
            </View>
          )
        }
        ListEmptyComponent={
          !error ? (
            <EmptyState
              title="No projects yet"
              description="Create your first project to get started with accurate estimations."
              actionLabel="Start First Project"
              onAction={() => router.push('/projects/create')}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  scrollContentEmpty: { flex: 1, justifyContent: 'center' },

  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterTabText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  filterTabTextActive: { color: theme.colors.primary },

  loadingText: { marginTop: 12, color: theme.colors.textSecondary, fontWeight: '500' },

  projectCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  projectCardPressed: { backgroundColor: theme.colors.surface, borderColor: '#BFDBFE' },
  projectCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: '#fff' },
  projectName: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  projectDesc: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  projectStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  projectStatText: { fontSize: 12, color: theme.colors.muted, fontWeight: '600' },
  projectCost: { fontSize: 14, fontWeight: '800', color: theme.colors.primary },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  projectId: { fontSize: 11, color: '#CBD5E1', fontWeight: '700', letterSpacing: 0.5 },

});
