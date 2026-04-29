import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather, MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { estimationApi } from '~/api/api';
import { theme } from '~/constants/theme';
import type { Category, SavedLeafCalculation } from '~/api/types';
import { logger, parseError } from '~/utils/errorHandler';

// ─────────────────────────────────────────────
// ICON RESOLVER
// ─────────────────────────────────────────────
const ICON_SIZE = 24;
const ICON_COLOR = theme.colors.primary;

const resolveIcon = (icon: string | null): React.ReactNode => {
  const map: Record<string, React.ReactNode> = {
    building: <FontAwesome5 name="building" size={ICON_SIZE} color={ICON_COLOR} />,
    foundation: <MaterialIcons name="foundation" size={ICON_SIZE} color={ICON_COLOR} />,
    grid: <FontAwesome5 name="th-large" size={ICON_SIZE} color={ICON_COLOR} />,
    home: <Feather name="home" size={ICON_SIZE} color={ICON_COLOR} />,
    hammer: <FontAwesome5 name="hammer" size={ICON_SIZE} color={ICON_COLOR} />,
    tools: <FontAwesome5 name="tools" size={ICON_SIZE} color={ICON_COLOR} />,
    layers: <Feather name="layers" size={ICON_SIZE} color={ICON_COLOR} />,
    box: <Feather name="box" size={ICON_SIZE} color={ICON_COLOR} />,
    settings: <Feather name="settings" size={ICON_SIZE} color={ICON_COLOR} />,
    road: <FontAwesome5 name="road" size={ICON_SIZE} color={ICON_COLOR} />,
    water: <FontAwesome5 name="water" size={ICON_SIZE} color={ICON_COLOR} />,
    bolt: <FontAwesome5 name="bolt" size={ICON_SIZE} color={ICON_COLOR} />,
    blueprint: <Ionicons name="map-outline" size={ICON_SIZE} color={ICON_COLOR} />,
    crane: <FontAwesome5 name="truck-loading" size={ICON_SIZE} color={ICON_COLOR} />,
    wall: <MaterialIcons name="view-column" size={ICON_SIZE} color={ICON_COLOR} />,
    wood: <FontAwesome5 name="tree" size={ICON_SIZE} color={ICON_COLOR} />,
  };
  if (icon && map[icon]) return map[icon];
  return <Feather name="grid" size={ICON_SIZE} color={ICON_COLOR} />;
};

// ─────────────────────────────────────────────
// COMPACT CATEGORY CARD (RESTORED STYLE)
// ─────────────────────────────────────────────
const CategoryCard: React.FC<{
  item: Category;
  onPress: (item: Category) => void;
  calcCount: number;
}> = React.memo(({ item, onPress, calcCount }) => {
  const isLeaf = item.categoryLevel === 'LEAF';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(item)}
    >
      <View style={styles.iconContainer}>
        {resolveIcon(item.icon)}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.nameEn}</Text>
        <Text style={styles.cardSubtitle}>{item.nameAr}</Text>
      </View>
      {isLeaf && (
        <View style={[styles.countBadge, calcCount > 0 ? styles.countBadgeActive : styles.countBadgeEmpty]}>
          <Text style={[styles.countText, calcCount > 0 ? styles.countTextActive : styles.countTextEmpty]}>
            {calcCount > 0 ? `${calcCount} Calcs` : 'None'}
          </Text>
        </View>
      )}
      <Feather name="chevron-right" size={20} color="#CBD5E1" />
    </Pressable>
  );
});

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────
export default function CategoriesScreen() {
  const router = useRouter();
  const { parentId, title, id } = useLocalSearchParams<{
    parentId: string;
    title: string;
    id: string;
  }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [estimations, setEstimations] = useState<SavedLeafCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else { setIsLoading(true); setError(null); }

      // 1. Fetch Categories (already mapped to clean types by API layer)
      let catData: Category[] = [];

      // If we have a title but no parentId, try to find the matching root category first
      if (title && !parentId) {
        const rootCats = await estimationApi.getCategories();
        const match = rootCats.find(c =>
          c.nameEn.toLowerCase() === title.toLowerCase() ||
          c.nameAr.toLowerCase() === title.toLowerCase()
        );

        if (match) {
          catData = await estimationApi.getCategoryChildren(match.categoryId);
        } else {
          catData = rootCats;
        }
      } else if (parentId) {
        catData = await estimationApi.getCategoryChildren(parentId);
      } else {
        catData = await estimationApi.getCategories();
      }

      // Filter out ROOT or null parent categories
      const filteredCategories = catData.filter(cat => {
        const level = (cat as any).category_level ?? cat.categoryLevel ?? (cat as any).level;
        const parent = (cat as any).parent_id ?? cat.parentId;
        return !(level === 'ROOT' || parent === null);
      });
      catData = filteredCategories;

      // 2. Fetch Project Estimations (for counts)
      const estData = id
        ? await estimationApi.getProjectEstimation(id).catch(() => null)
        : null;

      setCategories([...catData].sort((a, b) => a.sortOrder - b.sortOrder));
      if (estData && estData.leafCalculations) {
        setEstimations(estData.leafCalculations);
      }
      setError(null);
    } catch (err: any) {
      logger.error('[Categories]', 'Load error:', err);
      setError(parseError(err, 'Failed to sync with database'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [parentId, title, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // Utility to get calculation count for a leaf category
  const getCalcCount = useCallback((catId: string) => {
    return estimations.filter(est => est.categoryId === catId).length;
  }, [estimations]);

  const handleCategoryPress = useCallback(
    (item: Category) => {
      const level = (item.categoryLevel || '').toUpperCase();
      if (level === 'LEAF') {
        // Route to the full API-powered calculation engine
        router.push({
          pathname: `/projects/${id}/category/${item.categoryId}`,
          params: { id, categoryId: item.categoryId, title: item.nameEn }
        });
      } else {
        // Drill deeper into sub-categories
        router.push({
          pathname: `/projects/${id}/categories`,
          params: {
            id,
            parentId: item.categoryId,
            title: item.nameEn,
          },
        });
      }
    },
    [router, id]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Select Category</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchData(true)}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.titleSection}>
          <Text style={styles.breadcrumbTitle}>
            {title ? `Categories / ${title}` : 'Select Category'}
          </Text>
          <Text style={styles.subtitle}>
            Explore construction items and structural elements.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loaderText}>Syncing Database...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={40} color="#FCA5A5" />
            <Text style={styles.errorMsg}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={() => fetchData()}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="box" size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>No categories available</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {categories.map((cat) => (
              <CategoryCard
                key={cat.categoryId}
                item={cat}
                onPress={handleCategoryPress}
                calcCount={getCalcCount(cat.categoryId)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  backBtn: { padding: 4 },
  scrollContent: { padding: 20 },
  titleSection: { marginBottom: 24 },
  breadcrumbTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  list: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardPressed: { backgroundColor: '#F1F5F9', borderColor: theme.colors.primary },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  cardSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  countBadgeActive: { backgroundColor: '#E0F2FE' },
  countBadgeEmpty: { backgroundColor: '#F1F5F9' },
  countText: { fontSize: 10, fontWeight: '800' },
  countTextActive: { color: '#0369A1' },
  countTextEmpty: { color: '#94A3B8' },
  loader: { marginTop: 60, alignItems: 'center', gap: 12 },
  loaderText: { color: '#64748B', fontWeight: '600' },
  errorContainer: { marginTop: 60, alignItems: 'center', gap: 12 },
  errorMsg: { color: '#EF4444', textAlign: 'center', paddingHorizontal: 20 },
  retryBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryBtnText: { color: '#fff', fontWeight: '700' },
  emptyContainer: { marginTop: 60, alignItems: 'center', gap: 12 },
  emptyText: { color: '#94A3B8', fontWeight: '600' },
});
