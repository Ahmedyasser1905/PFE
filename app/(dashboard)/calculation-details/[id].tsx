/**
 * CalculationDetailsScreen — Shows full breakdown of a single leaf calculation.
 *
 * Data flow:
 *  1. Try local storage (offline calculations)
 *  2. If not found locally → fetch from API via project estimation
 *  3. Resolve field UUIDs → human-readable labels via category leaf endpoint
 *  4. Display: inputs (labeled), results, material lines, total cost
 *
 * ALL data is API-driven. No hardcoded values.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2, Calculator, Target, Component, Calendar, Package, Layers } from 'lucide-react-native';
import { theme } from '~/constants/theme';
import { ScreenShell } from '~/components/common/ScreenShell';
import { getLocalCalculationById, LocalCalculation } from '~/hooks/useLocalCalculations';
import { storage } from '~/utils/storage';
import { STORAGE_KEYS } from '~/constants/config';
import { estimationApi } from '~/api/api';
import type { MaterialLine } from '~/api/types';
import { useLanguage } from '~/context/LanguageContext';
import { Skeleton } from '~/components/ui/Skeleton';
import { EmptyState } from '~/components/ui/EmptyState';
import { ErrorScreen } from '~/components/ui/ErrorScreen';
import { useFeedback } from '~/context/FeedbackContext';

// Resolved input with human-readable label (instead of raw UUID key)
interface ResolvedInput {
  label: string;
  value: number;
  unitSymbol: string;
}

export default function CalculationDetailsScreen() {
  const router = useRouter();
  const { id, projectId, isReadOnly } = useLocalSearchParams<{ id: string; projectId?: string; isReadOnly?: string }>();
  const { language } = useLanguage();
  const isLocked = isReadOnly === 'true';

  const [calc, setCalc] = useState<LocalCalculation | null>(null);
  const [resolvedInputs, setResolvedInputs] = useState<ResolvedInput[]>([]);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showFeedback } = useFeedback();

  // ── Load calculation data ──────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);

      // 1. Try local storage first
      const localCalc = await getLocalCalculationById(id);
      if (localCalc) {
        setCalc(localCalc);
        setLoading(false);
        return;
      }

      // 2. Fallback: fetch from API via project estimation
      if (projectId) {
        try {
          const report = await estimationApi.getProjectEstimation(projectId);
          const remoteLeaf = report?.leafCalculations?.find(l => l.projectDetailsId === id);
          if (remoteLeaf) {
            setCalc({
              id: remoteLeaf.projectDetailsId,
              projectId: projectId,
              category: remoteLeaf.categoryName,
              categoryId: remoteLeaf.categoryId,
              subCategory: remoteLeaf.configName || undefined,
              type: remoteLeaf.formulaName,
              selectedFormulaId: remoteLeaf.selectedFormulaId,
              inputs: remoteLeaf.fieldValues || {},
              results: remoteLeaf.results || {},
              result: remoteLeaf.leafTotal,
              createdAt: remoteLeaf.createdAt,
              isLocal: false,
              materialLines: remoteLeaf.materialLines,
            });
          }
        } catch (err) {
          console.warn('Failed to fetch remote calculation details:', err);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [id, projectId]);

  // ── Resolve field UUID keys → human-readable labels ────────────────────────
  useEffect(() => {
    if (!calc || !calc.inputs || Object.keys(calc.inputs).length === 0) {
      setResolvedInputs([]);
      return;
    }

    // If the keys already look like labels (not UUIDs), use them directly
    const firstKey = Object.keys(calc.inputs)[0];
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(firstKey);

    if (!isUUID) {
      // Keys are already human-readable (local calculations)
      setResolvedInputs(
        Object.entries(calc.inputs).map(([key, val]) => ({
          label: key.replace(/_/g, ' '),
          value: Number(val),
          unitSymbol: '',
        }))
      );
      return;
    }

    // Keys are UUIDs → fetch category leaf to resolve labels
    if (!calc.categoryId) {
      // No categoryId available — show keys as-is
      setResolvedInputs(
        Object.entries(calc.inputs).map(([key, val]) => ({
          label: key.substring(0, 8) + '…',
          value: Number(val),
          unitSymbol: '',
        }))
      );
      return;
    }

    setLoadingLabels(true);
    estimationApi
      .getCategoryLeaf(calc.categoryId)
      .then((leafDetail) => {
        // Find the matching formula to get field definitions
        const formula = calc.selectedFormulaId
          ? leafDetail.formulas.find((f) => f.formulaId === calc.selectedFormulaId)
          : leafDetail.formulas[0];

        if (!formula) {
          // Formula not found — show raw keys
          setResolvedInputs(
            Object.entries(calc.inputs).map(([key, val]) => ({
              label: key.substring(0, 8) + '…',
              value: Number(val),
              unitSymbol: '',
            }))
          );
          return;
        }

        // Build field_id → { label, unitSymbol } lookup
        const fieldMap = new Map<string, { label: string; unitSymbol: string }>();
        formula.fields.forEach((f) => {
          fieldMap.set(f.fieldId, { label: f.label, unitSymbol: f.unitSymbol });
        });

        // Resolve each input
        const resolved: ResolvedInput[] = Object.entries(calc.inputs).map(([fieldId, val]) => {
          const meta = fieldMap.get(fieldId);
          return {
            label: meta?.label || fieldId.substring(0, 8) + '…',
            value: Number(val),
            unitSymbol: meta?.unitSymbol || '',
          };
        });

        setResolvedInputs(resolved);
      })
      .catch((err) => {
        console.warn('Failed to resolve field labels:', err);
        // Fallback: show raw keys
        setResolvedInputs(
          Object.entries(calc.inputs).map(([key, val]) => ({
            label: key.substring(0, 8) + '…',
            value: Number(val),
            unitSymbol: '',
          }))
        );
      })
      .finally(() => setLoadingLabels(false));
  }, [calc]);

  // ── Delete handler ─────────────────────────────────────────────────────────
  const confirmDelete = useCallback(() => {
    if (!calc) return;

    showFeedback({
      title: 'Delete Calculation',
      message: 'Remove this record?',
      type: 'warning',
      primaryText: 'Delete',
      secondaryText: 'Cancel',
      onPrimary: async () => {
        if (calc.isLocal) {
          // Delete from local storage
          const raw = await storage.getItem(STORAGE_KEYS.CALCULATIONS);
          if (raw) {
            const list = JSON.parse(raw);
            await storage.setItem(
              STORAGE_KEYS.CALCULATIONS,
              JSON.stringify(list.filter((x: any) => x.id !== id))
            );
          }
        } else if (id) {
          // Delete from backend
          try {
            await estimationApi.deleteLeaf(id);
          } catch (err: any) {
            showFeedback({
              title: 'Error',
              message: JSON.stringify(err?.response?.data || err?.message || 'Failed to delete from server.'),
              type: 'error',
            });
            return;
          }
        }
        router.back();
      },
    });
  }, [id, calc, router, showFeedback]);

  const title = calc ? (calc.type || calc.subCategory || calc.category || 'Calculation') : '';
  const materialLines: MaterialLine[] = calc?.materialLines || [];

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <ScreenShell title="Calculation Details">
        <View style={styles.content}>
          <Skeleton width="100%" height={180} borderRadius={24} />
          <Skeleton width="100%" height={200} borderRadius={20} />
          <Skeleton width="100%" height={150} borderRadius={20} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      title="Calculation Details"
      rightAction={
        !isLocked && calc ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        ) : undefined
      }
    >
      {!calc ? (
        <EmptyState
          icon={<Calculator size={48} color="#94a3b8" />}
          title="Calculation Not Found"
          description="This calculation may have been removed or is no longer available."
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* ── Title Card ── */}
          <View style={styles.titleCard}>
            <View style={styles.iconCircle}>
              <Calculator size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.titleName}>
              {title.replace(/_/g, ' ').toUpperCase()}
            </Text>
            {!!calc.category && calc.category !== title && (
              <Text style={styles.categoryBadge}>{calc.category}</Text>
            )}
            <View style={styles.dateRow}>
              <Calendar size={14} color="#94A3B8" />
              <Text style={styles.titleDate}>
                {new Date(calc.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* ── Input Parameters ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Component size={18} color="#64748B" />
              <Text style={styles.sectionTitle}>Input Parameters</Text>
            </View>
            <View style={styles.card}>
              {loadingLabels ? (
                <View style={styles.labelLoadingRow}>
                  <Skeleton width="100%" height={20} style={{ marginBottom: 10 }} />
                  <Skeleton width="100%" height={20} style={{ marginBottom: 10 }} />
                  <Skeleton width="100%" height={20} />
                </View>
              ) : resolvedInputs.length > 0 ? (
                resolvedInputs.map((input, idx) => (
                  <View style={styles.row} key={idx}>
                    <Text style={styles.rowLabel}>{input.label.toUpperCase()}</Text>
                    <Text style={styles.rowValue}>
                      {input.value}{input.unitSymbol ? ` ${input.unitSymbol}` : ''}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No input parameters recorded.</Text>
              )}
            </View>
          </View>

          {/* ── Calculated Results ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={18} color="#10B981" />
              <Text style={styles.sectionTitle}>Calculated Results</Text>
            </View>
            <View style={styles.card}>
              {calc.results && Object.keys(calc.results).length > 0 ? (
                Object.entries(calc.results).map(([key, val]) => (
                  <View style={styles.row} key={key}>
                    <Text style={styles.rowLabel}>
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.rowValue}>
                      {Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>ESTIMATED COST</Text>
                  <Text style={styles.rowValue}>
                    {Number(calc.result).toLocaleString()} DZD
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Material Breakdown (from API) ── */}
          {materialLines.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Package size={18} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Material Breakdown</Text>
              </View>
              <View style={styles.card}>
                {materialLines.map((ml, idx) => {
                  const displayName = language === 'ar' 
                    ? (ml.materialNameAr || ml.materialName) 
                    : (ml.materialNameEn || ml.materialName);
                  return (
                  <View style={styles.materialRow} key={ml.materialId || idx}>
                    <View style={styles.materialInfo}>
                      <View style={styles.materialNameRow}>
                        <Text style={styles.materialName}>{displayName}</Text>
                        <View style={[
                          styles.materialTypeBadge,
                          ml.materialType === 'PRIMARY' ? styles.primaryBadge : styles.accessoryBadge
                        ]}>
                          <Text style={[
                            styles.materialTypeText,
                            ml.materialType === 'PRIMARY' ? styles.primaryText : styles.accessoryText
                          ]}>
                            {ml.materialType}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.materialDetail}>
                        {ml.quantityWithWaste.toFixed(2)} {ml.unitSymbol || 'unit'} × {ml.unitPriceSnapshot.toLocaleString()} DZD
                      </Text>
                      {ml.appliedWaste > 0 && (
                        <Text style={styles.wasteText}>
                          Waste: {(ml.appliedWaste * 100).toFixed(1)}% ({ml.quantity.toFixed(2)} → {ml.quantityWithWaste.toFixed(2)})
                        </Text>
                      )}
                    </View>
                    <Text style={styles.materialCost}>
                      {ml.subTotal.toLocaleString()} DZD
                    </Text>
                  </View>
                )})}
              </View>
            </View>
          )}

          {/* ── Summary Highlight ── */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Final Estimation</Text>
            <Text style={styles.summaryValue}>DZD {Number(calc.result).toLocaleString()}</Text>
            {materialLines.length > 0 && (
              <Text style={styles.summaryMeta}>
                {materialLines.length} material{materialLines.length > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { textAlign: 'center', marginTop: 12, color: '#64748B', fontSize: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#94A3B8', marginTop: 4, textAlign: 'center' },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 20, gap: 24 },
  titleCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  titleName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 6,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titleDate: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },

  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#475569', letterSpacing: 0.3 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  rowLabel: { fontSize: 13, color: '#64748B', fontWeight: '700', flex: 1 },
  rowValue: { fontSize: 15, color: '#1E293B', fontWeight: '700' },
  noDataText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingVertical: 12 },

  // Label loading
  labelLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, justifyContent: 'center' },
  labelLoadingText: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },

  // Material lines
  materialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  materialInfo: { flex: 1, marginRight: 12 },
  materialNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  materialName: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  materialTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  primaryBadge: { backgroundColor: '#EFF6FF' },
  accessoryBadge: { backgroundColor: '#FFF7ED' },
  materialTypeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  primaryText: { color: theme.colors.primary },
  accessoryText: { color: '#D97706' },
  materialDetail: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  wasteText: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginTop: 2 },
  materialCost: { fontSize: 15, fontWeight: '800', color: '#1E293B' },

  // Summary
  summaryCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  summaryValue: { color: '#fff', fontSize: 28, fontWeight: '900' },
  summaryMeta: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', marginTop: 4 },
});
