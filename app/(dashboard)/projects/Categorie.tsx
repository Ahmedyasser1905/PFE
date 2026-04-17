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
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const API_BASE_URL = 'https://your-api.com'; // 🔁 Replace with your real base URL
const AUTH_TOKEN = 'your-token-here';        // 🔁 Replace with real token / AsyncStorage

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// ROOT category ID — the top-level parent whose children this screen shows.
// 🔁 Replace with the actual ROOT UUID from your backend,
//    or pass it via route params: const { parentId } = useLocalSearchParams();
const ROOT_CATEGORY_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type CategoryLevel = 'ROOT' | 'BRANCH' | 'LEAF';

interface Category {
  category_id: string;
  parent_id: string;
  category_level: CategoryLevel;
  name_en: string;
  name_ar: string;
  icon: string | null;
  sort_order: number;
}

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────
const fetchChildren = async (parentId: string): Promise<Category[]> => {
  const response = await apiClient.get(
    `/api/estimation/categories/${parentId}/children`
  );
  return response.data.data as Category[];
};

// ─────────────────────────────────────────────
// ICON MAPPER
// Maps backend icon string → Expo vector icon component
// Extend this map as your backend icon keys grow
// ─────────────────────────────────────────────
const ICON_SIZE = 22;
const ICON_COLOR = '#2B59C3';

const resolveIcon = (icon: string | null): React.ReactNode => {
  const map: Record<string, React.ReactNode> = {
    building:    <FontAwesome5 name="building"    size={ICON_SIZE} color={ICON_COLOR} />,
    foundation:  <MaterialIcons name="foundation" size={ICON_SIZE} color={ICON_COLOR} />,
    grid:        <FontAwesome5 name="th-large"    size={ICON_SIZE} color={ICON_COLOR} />,
    home:        <Feather name="home"             size={ICON_SIZE} color={ICON_COLOR} />,
    hammer:      <FontAwesome5 name="hammer"      size={ICON_SIZE} color={ICON_COLOR} />,
    tools:       <FontAwesome5 name="tools"       size={ICON_SIZE} color={ICON_COLOR} />,
    layers:      <Feather name="layers"           size={ICON_SIZE} color={ICON_COLOR} />,
    box:         <Feather name="box"              size={ICON_SIZE} color={ICON_COLOR} />,
    settings:    <Feather name="settings"         size={ICON_SIZE} color={ICON_COLOR} />,
    road:        <FontAwesome5 name="road"        size={ICON_SIZE} color={ICON_COLOR} />,
    water:       <FontAwesome5 name="water"       size={ICON_SIZE} color={ICON_COLOR} />,
    bolt:        <FontAwesome5 name="bolt"        size={ICON_SIZE} color={ICON_COLOR} />,
  };

  if (icon && map[icon]) return map[icon];

  // Fallback icon
  return <Feather name="grid" size={ICON_SIZE} color={ICON_COLOR} />;
};

// ─────────────────────────────────────────────
// LEVEL BADGE CONFIG
// ─────────────────────────────────────────────
const LEVEL_BADGE: Record<CategoryLevel, { label: string; bg: string; color: string }> = {
  ROOT:   { label: 'ROOT',   bg: '#FEF3C7', color: '#D97706' },
  BRANCH: { label: 'BRANCH', bg: '#EFF6FF', color: '#2563EB' },
  LEAF:   { label: 'LEAF',   bg: '#F0FDF4', color: '#16A34A' },
};

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

// ── Category Card ──────────────────────────────────────────────────────────
interface CategoryCardProps {
  item: Category;
  onPress: (item: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = React.memo(({ item, onPress }) => {
  const badge = LEVEL_BADGE[item.category_level];
  const isLeaf = item.category_level === 'LEAF';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(item)}
    >
      <View style={styles.cardRow}>
        {/* Icon */}
        <View style={styles.iconBox}>
          {resolveIcon(item.icon)}
        </View>

        {/* Text */}
        <View style={styles.cardContent}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name_en}
            </Text>
            {/* Level Badge */}
            <View style={[styles.levelBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.levelBadgeText, { color: badge.color }]}>
                {badge.label}
              </Text>
            </View>
          </View>

          {/* Arabic name */}
          <Text style={styles.cardArabic} numberOfLines={1}>
            {item.name_ar}
          </Text>
        </View>

        {/* Chevron */}
        <Feather
          name={isLeaf ? 'calculator' : 'chevron-right'}
          size={18}
          color={isLeaf ? '#16A34A' : '#94A3B8'}
        />
      </View>
    </Pressable>
  );
});

// ── Skeleton Loader ────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonIcon} />
    <View style={styles.skeletonContent}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
    </View>
  </View>
);

const LoadingSkeleton: React.FC = () => (
  <View style={{ gap: 12 }}>
    {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
  </View>
);

// ── Empty State ────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ isFiltered: boolean; onClear: () => void }> = ({
  isFiltered,
  onClear,
}) => (
  <View style={styles.emptyContainer}>
    <Feather name="inbox" size={40} color="#CBD5E1" />
    <Text style={styles.emptyTitle}>
      {isFiltered ? 'No results found' : 'No categories available'}
    </Text>
    <Text style={styles.emptySubtitle}>
      {isFiltered
        ? 'Try a different search term.'
        : 'There are no subcategories under this section yet.'}
    </Text>
    {isFiltered && (
      <Pressable style={styles.clearButton} onPress={onClear}>
        <Text style={styles.clearButtonText}>CLEAR SEARCH</Text>
      </Pressable>
    )}
  </View>
);

// ── Error View ─────────────────────────────────────────────────────────────
const ErrorView: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <View style={styles.emptyContainer}>
    <Feather name="alert-circle" size={40} color="#FCA5A5" />
    <Text style={styles.emptyTitle}>Something went wrong</Text>
    <Text style={styles.emptySubtitle}>{message}</Text>
    <Pressable style={styles.retryButton} onPress={onRetry}>
      <Feather name="refresh-cw" size={14} color="#FFFFFF" />
      <Text style={styles.retryButtonText}>TRY AGAIN</Text>
    </Pressable>
  </View>
);

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────
export default function CategoriesScreen(): JSX.Element {
  const router = useRouter();

  // 🔁 Uncomment if parentId is passed via route params:
  // const { parentId } = useLocalSearchParams<{ parentId: string }>();
  // const resolvedParentId = parentId ?? ROOT_CATEGORY_ID;
  const resolvedParentId = ROOT_CATEGORY_ID;

  // ── State ────────────────────────────────────
  const [categories, setCategories]   = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading]     = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // ── Fetch ────────────────────────────────────
  const loadCategories = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else { setIsLoading(true); setError(null); }

      const data = await fetchChildren(resolvedParentId);

      // Sort by sort_order from API
      const sorted = [...data].sort((a, b) => a.sort_order - b.sort_order);
      setCategories(sorted);
      setError(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        'Failed to load categories.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [resolvedParentId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ── Filtered List ─────────────────────────────
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(
      (cat) =>
        cat.name_en.toLowerCase().includes(q) ||
        cat.name_ar.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  // ── Navigation ────────────────────────────────
  const handleCategoryPress = useCallback(
    (item: Category) => {
      if (item.category_level === 'LEAF') {
        // Navigate to the leaf calculation screen
        // 🔁 Adjust route name to match your file-based routing
        router.push({
          pathname: '/projects/calculation',
          params: { categoryId: item.category_id, title: item.name_en },
        });
      } else {
        // Navigate deeper into the tree (BRANCH)
        router.push({
          pathname: '/projects/categories',
          params: { parentId: item.category_id, title: item.name_en },
        });
      }
    },
    [router]
  );

  const handleClearSearch = useCallback(() => setSearchQuery(''), []);

  // ── Summary counts ────────────────────────────
  const leafCount   = useMemo(() => categories.filter(c => c.category_level === 'LEAF').length,   [categories]);
  const branchCount = useMemo(() => categories.filter(c => c.category_level === 'BRANCH').length, [categories]);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadCategories(true)}
            tintColor="#2B59C3"
            colors={['#2B59C3']}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerIconWrap}>
              <Feather name="layers" size={20} color="#2B59C3" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Grand Travaux</Text>
              <Text style={styles.subtitle}>
                Management of heavy structural works, foundations, and core
                building components.
              </Text>
            </View>
          </View>

          {/* ── Summary Pills (only when data loaded) ── */}
          {!isLoading && !error && categories.length > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryPill}>
                <Text style={styles.summaryPillCount}>{categories.length}</Text>
                <Text style={styles.summaryPillLabel}>Total</Text>
              </View>
              {branchCount > 0 && (
                <View style={[styles.summaryPill, styles.summaryPillBlue]}>
                  <Text style={[styles.summaryPillCount, { color: '#2563EB' }]}>
                    {branchCount}
                  </Text>
                  <Text style={[styles.summaryPillLabel, { color: '#2563EB' }]}>
                    Branches
                  </Text>
                </View>
              )}
              {leafCount > 0 && (
                <View style={[styles.summaryPill, styles.summaryPillGreen]}>
                  <Text style={[styles.summaryPillCount, { color: '#16A34A' }]}>
                    {leafCount}
                  </Text>
                  <Text style={[styles.summaryPillLabel, { color: '#16A34A' }]}>
                    Calculable
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ── Search ── */}
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            placeholder="Search categories..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.input}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={handleClearSearch} hitSlop={8}>
              <Feather name="x" size={16} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        {/* ── Active filter label ── */}
        {searchQuery.trim().length > 0 && (
          <Text style={styles.filterLabel}>
            {filteredCategories.length} result
            {filteredCategories.length !== 1 ? 's' : ''} for "
            <Text style={styles.filterQuery}>{searchQuery}</Text>"
          </Text>
        )}

        {/* ── Content Area ── */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorView message={error} onRetry={() => loadCategories()} />
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            isFiltered={searchQuery.trim().length > 0}
            onClear={handleClearSearch}
          />
        ) : (
          <View style={styles.listContainer}>
            {filteredCategories.map((cat) => (
              <CategoryCard
                key={cat.category_id}
                item={cat}
                onPress={handleCategoryPress}
              />
            ))}
          </View>
        )}

        {/* ── Footer hint ── */}
        {!isLoading && !error && filteredCategories.length > 0 && (
          <View style={styles.footerHint}>
            <Feather name="info" size={12} color="#94A3B8" />
            <Text style={styles.footerHintText}>
              Tap{' '}
              <Text style={{ color: '#16A34A', fontWeight: '600' }}>LEAF</Text>{' '}
              categories to open the calculator.{' '}
              <Text style={{ color: '#2563EB', fontWeight: '600' }}>BRANCH</Text>{' '}
              categories drill deeper.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  // ── Header ──────────────────────────────────
  headerBlock: {
    marginBottom: 16,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },

  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  headerTextWrap: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },

  // ── Summary Pills ────────────────────────────
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },

  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  summaryPillBlue: {
    backgroundColor: '#EFF6FF',
  },

  summaryPillGreen: {
    backgroundColor: '#F0FDF4',
  },

  summaryPillCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },

  summaryPillLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },

  // ── Search ───────────────────────────────────
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    gap: 8,
  },

  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },

  filterLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
    marginLeft: 2,
  },

  filterQuery: {
    color: '#2B59C3',
    fontWeight: '600',
  },

  // ── List ─────────────────────────────────────
  listContainer: {
    gap: 10,
  },

  // ── Card ─────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  cardPressed: {
    backgroundColor: '#F8FAFC',
    borderColor: '#BFDBFE',
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  iconBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 10,
  },

  cardContent: {
    flex: 1,
    gap: 4,
  },

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },

  cardArabic: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'left',
  },

  // ── Level Badge ──────────────────────────────
  levelBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },

  levelBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // ── Skeleton ─────────────────────────────────
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },

  skeletonContent: {
    flex: 1,
    gap: 8,
  },

  skeletonLine: {
    height: 13,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    width: '75%',
  },

  skeletonLineShort: {
    width: '45%',
    backgroundColor: '#F1F5F9',
  },

  // ── Empty / Error ────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },

  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },

  clearButton: {
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  clearButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2B59C3',
    letterSpacing: 0.5,
  },

  retryButton: {
    marginTop: 8,
    backgroundColor: '#2B59C3',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  retryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // ── Footer Hint ──────────────────────────────
  footerHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 20,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  footerHintText: {
    flex: 1,
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 17,
  },

  // ��─ Misc (kept from original) ────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});