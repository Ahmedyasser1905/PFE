/**
 * EstimationHistoryScreen — Shows ALL saved leaf calculations from the API.
 *
 * Data flow: API → useEstimationHistory → CalculationCard → UI
 *
 * When accessed from BottomNav (no projectId): shows all calculations across all projects.
 * When accessed from project detail (with projectId): shows only that project's calculations.
 *
 * All data is fetched from the backend. No hardcoded or mock data.
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FileText, TrendingUp } from 'lucide-react-native';
import { theme } from '~/constants/theme';
import { useEstimationHistory } from '~/hooks/useEstimationHistory';
import { CalculationCard, CalculationItem } from '~/components/features/calculations/CalculationCard';
import { EmptyState } from '~/components/ui/EmptyState';
import { estimationApi } from '~/api/api';
import { Skeleton } from '~/components/ui/Skeleton';

export default function EstimationHistoryScreen() {
  const router = useRouter();
  const { projectId, isReadOnly } = useLocalSearchParams<{ projectId?: string; isReadOnly?: string }>();
  const isLocked = isReadOnly === 'true';

  const { items, loading, totalCost, reload } = useEstimationHistory({ projectId });

  const handlePress = useCallback(
    (item: CalculationItem) => {
      router.push({
        pathname: '/(dashboard)/calculation-details/[id]',
        params: {
          id: item.id || item.projectDetailsId,
          projectId: item.projectId || projectId,
          isReadOnly: isLocked ? 'true' : 'false',
        },
      });
    },
    [router, projectId, isLocked]
  );

  const handleDelete = useCallback(
    (itemId: string) => {
      estimationApi
        .deleteLeaf(itemId)
        .then(() => reload())
        .catch((err: any) => console.error('Failed to delete leaf:', err));
    },
    [reload]
  );

  const renderItem = useCallback(
    ({ item }: { item: CalculationItem }) => (
      <CalculationCard
        item={item}
        onPress={handlePress}
        isReadOnly={isLocked}
        onDelete={isLocked ? undefined : handleDelete}
        showChevron={false}
      />
    ),
    [handlePress, isLocked, handleDelete]
  );

  const keyExtractor = useCallback(
    (item: CalculationItem, index: number) => item.id?.toString() || index.toString(),
    []
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.totalCard}>
          <Skeleton width={120} height={20} style={{ marginBottom: 8 }} />
          <Skeleton width={200} height={40} style={{ marginBottom: 8 }} />
          <Skeleton width={100} height={16} />
        </View>
        <View style={styles.listContent}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} width="100%" height={100} borderRadius={16} style={{ marginBottom: 12 }} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Total Cost Card */}
      <View style={styles.totalCard}>
        <View style={styles.totalHeader}>
          <TrendingUp size={20} color="#10B981" />
          <Text style={styles.totalLabel}>Total Estimated Cost</Text>
        </View>
        <Text style={styles.totalValue}>DZD {totalCost.toLocaleString()}</Text>
        <Text style={styles.totalCount}>
          {items.length} calculation{items.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} color="#CBD5E1" />}
          title="No calculations saved yet"
          description="Run a new calculation inside a project to see it here."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B', fontWeight: '600' },
  totalCard: {
    margin: 20,
    backgroundColor: '#ECFDF5',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  totalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#047857' },
  totalValue: { fontSize: 32, fontWeight: '900', color: '#064E3B' },
  totalCount: { fontSize: 12, fontWeight: '600', color: '#059669', marginTop: 4 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
});
