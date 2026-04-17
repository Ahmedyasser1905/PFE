import React, { useEffect, useMemo, useState, useCallback } from 'react';
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

import { ProjectCard } from '~/components/projectscard';
import { estimationApi } from '~/api/api';

type FilterType = 'All' | 'Active' | 'Completed';

interface Project {
  _id: string;
  name: string;
  description?: string;
  status: 'Draft' | 'In Progress' | 'Completed' | 'On Hold';
  image?: string;
  location?: string;
  type: string;
  budget?: number;
  progress: number;
  deadline?: string;
  createdAt: string;
}

interface Stats {
  totalProjects: number;
  completedProjects: number;
  activeProjects: number;
  totalCalculations: number;
  totalCategories: number;
}

export default function HomePage() {
  const [filter, setFilter] = useState<FilterType>('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const projectsRes = await estimationApi.listProjects();
      
      // Using fallback stats until stats API is available on estimationApi
      const statsRes = { data: { totalProjects: projectsRes.length || 0, completedProjects: projectsRes.filter((p: any) => p.status === 'Completed').length || 0, activeProjects: projectsRes.filter((p: any) => p.status !== 'Completed').length || 0, totalCalculations: 0, totalCategories: 0 } };
      // estimationApi already unwraps the { status: 'ok', data: ... }
      const projectsArray = Array.isArray(projectsRes) ? projectsRes : (projectsRes?.projects || []);
      setProjects(projectsArray);
      setStats(statsRes.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to load data';
      setError(msg);
      console.error('[Dashboard] Error:', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const filteredProjects = useMemo(() => {
    if (filter === 'All') return projects;
    if (filter === 'Active') return projects.filter(p => p.status === 'In Progress' || p.status === 'Draft');
    return projects.filter(p => p.status === 'Completed');
  }, [filter, projects]);

  // Map to ProjectCard expected shape
  const mappedProjects = useMemo(() =>
    filteredProjects.map(p => ({
      id: p._id,
      title: p.name,
      description: p.description || '',
      status: (p.status === 'Completed' ? 'Completed' : 'Active') as 'Active' | 'Completed',
      image: p.image || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
      client: p.location || p.type,
      dueDate: p.deadline ? new Date(p.deadline).toLocaleDateString() : '-',
      uuid: `PRJ-${p._id.slice(-4).toUpperCase()}`,
    })),
  [filteredProjects]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={mappedProjects}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }

        ListHeaderComponent={
          <>
            {/* Error Banner */}
            {error && (
              <Pressable style={styles.errorBanner} onPress={fetchData}>
                <AlertCircle size={16} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.retryText}>Tap to retry</Text>
              </Pressable>
            )}

            {/* CREATE */}
            <Pressable style={styles.createCard} onPress={() => router.push('/projects/CreateProject')}>
              <Text style={styles.createTitle}>New Project</Text>
              <Text style={styles.createSub}>Create a new project</Text>
              <View style={styles.createBtn}>
                <Plus size={20} color="#2563eb" />
                <Text style={styles.createBtnText}>Create</Text>
              </View>
            </Pressable>

            {/* STATS — Now from API */}
            <View style={styles.stats}>
              <Stat icon={HardHat} label="Projects" value={String(stats?.totalProjects ?? 0)} color="#2563eb" />
              <Stat icon={CheckCircle2} label="Completed" value={String(stats?.completedProjects ?? 0)} color="#10b981" />
              <Stat icon={Building2} label="Categories" value={String(stats?.totalCategories ?? 0)} color="#db8a11" />
            </View>

            {/* FILTER */}
            <View style={styles.filterRow}>
              {(['All', 'Active', 'Completed'] as FilterType[]).map(f => (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[
                    styles.filterBtn,
                    filter === f && styles.filterActive
                  ]}
                >
                  <Text style={[
                    styles.filterText,
                    filter === f && styles.filterTextActive
                  ]}>
                    {f}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }

        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/projects/${item.id}`)}>
            <ProjectCard project={item} />
          </Pressable>
        )}

        ListEmptyComponent={
          <View style={styles.empty}>
            <FolderOpen size={40} color="#94a3b8" />
            <Text style={styles.emptyText}>
              {error ? 'Could not load projects' : 'No projects found'}
            </Text>
            {!error && (
              <Pressable
                style={styles.emptyCreateBtn}
                onPress={() => router.push('/projects/CreateProject')}
              >
                <Text style={styles.emptyCreateText}>Create your first project</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}

// Stat Component
const Stat = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Icon size={18} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  loadingText: { color: '#64748b', marginTop: 12, fontSize: 14 },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#dc2626', fontSize: 13, flex: 1 },
  retryText: { color: '#2563eb', fontSize: 12, fontWeight: '600' },

  createCard: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
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
  createBtnText: { color: '#2563eb', fontWeight: 'bold' },

  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    width: '30%',
  },
  statIcon: {
    width: 30,
    height: 30,
    padding: 6,
    borderRadius: 10,
    marginBottom: 6,
  },
  statValue: { fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: '#64748b' },

  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
  },
  filterActive: { backgroundColor: '#2563eb' },
  filterText: { color: '#334155' },
  filterTextActive: { color: '#fff' },

  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#64748b', marginTop: 10 },
  emptyCreateBtn: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyCreateText: { color: '#fff', fontWeight: '600' },
});