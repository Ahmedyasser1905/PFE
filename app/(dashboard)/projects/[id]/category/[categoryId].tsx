import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  
  Platform,
  Dimensions,
  Keyboard,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Calculator, 
  ChevronDown, 
  Share2, 
  Printer,
  Bookmark,
  DollarSign,
  Sigma,
  Plus,
  LayoutGrid
} from 'lucide-react-native';
import { estimationApi } from '~/api/api';
import { theme } from '~/constants/theme';
import { useSubscriptionContext } from '~/context/SubscriptionContext';
import type { LeafDetail, CalculationResult, Formula, FieldDefinition, MaterialConfig, CalculateRequest, Category } from '~/api/types';
import { NativeSelect } from '~/components/ui/NativeSelect';
import { Skeleton } from '~/components/ui/Skeleton';
import { ErrorScreen } from '~/components/ui/ErrorScreen';
import { useFeedback } from '~/context/FeedbackContext';

const { width } = Dimensions.get('window');

export default function LeafCalculationScreen() {
  const router = useRouter();
  const { categoryId, id, title, editId } = useLocalSearchParams<{ categoryId: string; id: string; title: string; editId?: string }>();
  const { canCalculate, hasSubscription, incrementCalculationUsage } = useSubscriptionContext();
  const { showFeedback } = useFeedback();

  // ── State ────────────────────────────────────
  const [viewMode, setViewMode] = useState<'browse' | 'calculate'>('browse');
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [leaf, setLeaf] = useState<LeafDetail | null>(null);
  const [projectName, setProjectName] = useState<string>('PROJECT');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Selection
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<MaterialConfig | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Modal state for material configuration & formula selection
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Results
  const [results, setResults] = useState<CalculationResult | any>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Initialization ───────────────────────────
  const initCategory = useCallback(async () => {
    if (!categoryId) return;
    try {
      setLoading(true);
      setError(null);
      
      // Fetch project data — validate estimation row exists BEFORE allowing calculation
      if (id) {
        try {
          const projectData = await estimationApi.getProject(id);
          setProjectName(projectData?.name || 'PROJECT');

          // CRITICAL GUARD: If estimationId is null, the DB has no estimation row
          // for this project. saveLeaf will always 500 until this is fixed.
          // This happens when a project was created before the auto-estimation logic,
          // or when the image-upload fallback path skipped the estimation INSERT.
          if (!projectData?.estimationId) {
            throw new Error(
              'This project has no estimation record. ' +
              'Please delete it and create a new project to resolve the issue.'
            );
          }
        } catch (pErr: any) {
          // Re-throw our own typed error; swallow unrelated network errors
          if (pErr.message && pErr.message.includes('no estimation record')) throw pErr;
          console.warn('Failed to fetch project data:', pErr);
          setProjectName('PROJECT');
        }
      }

      // 1. Check if category has children (BRANCH)
      const children = await estimationApi.getCategoryChildren(categoryId).catch(() => []);
      
      if (children && children.length > 0) {
        setSubcategories(children);
        setViewMode('browse');
      } else {
        // 2. No children, assume LEAF
        try {
          const leafData = await estimationApi.getCategoryLeaf(categoryId);
          setLeaf(leafData);
          setViewMode('calculate');

          if (leafData?.formulas && leafData.formulas.length > 0) {
            setSelectedFormula(leafData.formulas[0]);
            const defaults: Record<string, string> = {};
            leafData.formulas[0].fields.forEach((f: FieldDefinition) => {
              defaults[f.fieldId] = (f.defaultValue ?? 0).toString();
            });
            setFieldValues(defaults);
          }
          if (leafData?.configs && leafData.configs.length > 0) {
            setSelectedConfig(leafData.configs[0]);
          }
        } catch (err: any) {
          throw new Error(`Category not found or invalid: ${err.message}`);
        }
      }
    } catch (err: any) {
      console.error('Init Category Error:', err);
      setError(err.message || 'Failed to load category details');
    } finally {
      setLoading(false);
    }
  }, [categoryId, id]);

  useEffect(() => {
    initCategory();
  }, [initCategory]);

  // ── Handlers ─────────────────────────────────
  // Store raw user input as-is (string). Normalization happens only at calculate time.
  const handleInputChange = useCallback((fieldId: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  // Material configuration selection handler
  const handleMaterialConfig = useCallback((config: MaterialConfig) => {
    setSelectedConfig(config);
    setShowConfigModal(false);
  }, []);

  // Formula selection handler — resets fields to new defaults
  const handleFormulaSelect = useCallback((formula: Formula) => {
    setSelectedFormula(formula);
    setShowFormulaModal(false);
    setResults(null);
    const defaults: Record<string, string> = {};
    formula.fields.forEach((f: FieldDefinition) => {
      defaults[f.fieldId] = (f.defaultValue ?? 0).toString();
    });
    setFieldValues(defaults);
  }, []);

  const handleCalculate = useCallback(async () => {
    if (!selectedFormula || !leaf || !id) return;
    
    // PRE-FLIGHT GUARD: Abort immediately if leaf or project state is inconsistent.
    // This is a secondary safety net — the primary guard is in initCategory.
    if (!leaf.categoryId) {
      showFeedback({ title: 'Error', message: 'Invalid category data. Please go back and try again.', type: 'error' });
      return;
    }
    
    // Subscription guard: warn if at calculation limit
    if (hasSubscription && !canCalculate) {
      showFeedback({
        title: 'Calculation Limit Reached',
        message: 'You have reached your plan\'s calculation limit. Please upgrade to perform more calculations.',
        type: 'warning'
      });
      return;
    }
    
    Keyboard.dismiss();
    try {
      setCalculating(true);
      
      // 1. SAFE INPUT MAPPING: Parse all defined fields for the selected formula, fallback to 0
      const numericFields: Record<string, number> = {};
      (selectedFormula.fields || []).forEach(field => {
        const rawValue = fieldValues[field.fieldId] || '';
        const normalized = rawValue.replace(/,/g, '.').trim();
        numericFields[field.fieldId] = parseFloat(normalized) || 0;
      });

      const calcPayload: CalculateRequest = {
        category_id: leaf.categoryId,
        selected_formula_id: selectedFormula.formulaId,
        selected_config_id: selectedConfig?.configId ?? null,
        field_values: numericFields,
      };

      // 2. RUN ENGINE: Stateless preview calculation
      const response = await estimationApi.calculatePreview(calcPayload);
      setResults(response);
      incrementCalculationUsage(); // Increment usage locally for real-time tracking

    } catch (err: any) {
      console.error('[LeafCalc] Handler Error:', err);
      showFeedback({
        title: 'Calculation Error',
        message: err.message || 'Failed to sync calculation with project.',
        type: 'error'
      });
    } finally {
      setCalculating(false);
    }
  }, [selectedFormula, leaf, selectedConfig, fieldValues, canCalculate, hasSubscription, incrementCalculationUsage, showFeedback]);

  const handleSave = useCallback(async () => {
    if (!selectedFormula || !leaf || !id || !results) {
      showFeedback({ title: 'Notice', message: 'Please calculate results first before saving.', type: 'info' });
      return;
    }

    try {
      setSaving(true);

      const numericFields: Record<string, number> = {};
      (selectedFormula.fields || []).forEach(field => {
        const rawValue = fieldValues[field.fieldId] || '';
        const normalized = rawValue.replace(/,/g, '.').trim();
        numericFields[field.fieldId] = parseFloat(normalized) || 0;
      });

      const resultObj: Record<string, number> = {};
      if (results.intermediateResults && results.intermediateResults.length > 0) {
        results.intermediateResults.forEach((item: any) => {
          const safeKey = item.outputKey || item.output_key;
          if (safeKey) resultObj[safeKey] = typeof item.value === 'number' ? item.value : 0;
        });
      } else if (results.results && typeof results.results === 'object') {
        Object.assign(resultObj, results.results);
      }

      const totalFromMaterials = (results.materialLines || []).reduce((sum, m) => sum + (m.subTotal || 0), 0);
      const leafTotal = results.totalCost > 0 ? results.totalCost : totalFromMaterials;
      resultObj['_computed_leaf_total'] = leafTotal;

      const formulaVersion = Number(selectedFormula.version ?? 1) || 1;
      const savePayload: any = {
        project_id: String(id || ''),
        category_id: String(leaf.categoryId || ''),
        selected_formula_id: String(selectedFormula.formulaId || ''),
        selected_config_id: selectedConfig?.configId ?? null,
        project_details_id: editId ?? null,
        field_values: numericFields,
        formula_version_snapshot: formulaVersion,
        results: Object.keys(resultObj).length > 0 ? resultObj : {},
        leaf_total: Number(leafTotal) || 0,
        material_lines: (results.materialLines || []).map((ml: any) => ({
          material_id: String(ml.materialId || ml.material_id || ''),
          material_name: String(ml.materialName || ml.material_name || 'Unknown Material'),
          material_type: String(ml.materialType || ml.material_type || 'PRIMARY'),
          quantity: Number(ml.quantity) || 0,
          applied_waste: Number(ml.appliedWaste ?? ml.applied_waste ?? 0),
          quantity_with_waste: Number(ml.quantityWithWaste ?? ml.quantity_with_waste ?? 0),
          unit_price_snapshot: Number(ml.unitPriceSnapshot ?? ml.unit_price_snapshot ?? 0),
          waste_factor_snapshot: Number(ml.wasteFactorSnapshot ?? ml.waste_factor_snapshot ?? 0),
          sub_total: Number(ml.subTotal ?? ml.sub_total ?? 0),
        })),
        timestamp: new Date().toISOString(),
        calculation_status: 'DONE',
      };

      await estimationApi.saveLeaf(savePayload);

      showFeedback({
        title: 'Success',
        message: 'Calculation saved successfully.',
        type: 'success',
      });
    } catch (err: any) {
      console.error('[LeafCalc] Save Error:', err);
      showFeedback({
        title: 'Save Error',
        message: err.message || 'Failed to save calculation.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  }, [selectedFormula, leaf, id, results, selectedConfig, editId, fieldValues, showFeedback]);

  // handleSave removed as it's merged into handleCalculate

  const handleReset = useCallback(() => {
    if (selectedFormula) {
      const defaults: Record<string, string> = {};
      selectedFormula.fields.forEach((f: FieldDefinition) => {
        defaults[f.fieldId] = (f.defaultValue ?? 0).toString();
      });
      setFieldValues(defaults);
      setResults(null);
    }
  }, [selectedFormula]);

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={100} height={20} />
      </View>
      <View style={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Skeleton width={48} height={48} borderRadius={24} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Skeleton width="60%" height={24} />
            <Skeleton width="40%" height={16} style={{ marginTop: 8 }} />
          </View>
        </View>
        <Skeleton width="100%" height={200} borderRadius={16} style={{ marginBottom: 20 }} />
        <Skeleton width="100%" height={150} borderRadius={16} style={{ marginBottom: 20 }} />
      </View>
    </SafeAreaView>
  );

  if (error) return (
    <ErrorScreen
      type={error.includes('estimation record') ? 'server' : 'unknown'}
      title="Calculation Error"
      message={error}
      onRetry={initCategory}
    />
  );

  const displayTitle = (title || leaf?.nameEn || 'Category').toString();
  const displayProjectName = (projectName || 'Project').toString();

  // ── BROWSE MODE (Subcategories) ─────────────────────────
  if (viewMode === 'browse') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => router.back()} style={styles.iconBtn}>
              <ArrowLeft size={24} color="#0F172A" />
            </Pressable>
            <View>
              <Text style={styles.headerTitle}>{displayTitle}</Text>
              <Text style={styles.headerSubtitle}>{displayProjectName}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.titleSection}>
            <View style={styles.titleIconBox}>
              <LayoutGrid size={24} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pageTitle}>{displayTitle}</Text>
              <Text style={styles.pageSubtitle}>Select a sub-category to continue</Text>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            {subcategories.map(sub => (
              <Pressable
                key={sub.categoryId}
                style={styles.subCatCard}
                onPress={() => router.push({
                  pathname: '/(dashboard)/projects/[id]/category/[categoryId]',
                  params: { id, categoryId: sub.categoryId, title: sub.nameEn }
                })}
              >
                <Text style={styles.subCatText}>{sub.nameEn}</Text>
                <ChevronDown style={{ transform: [{ rotate: '-90deg' }] }} size={20} color="#CBD5E1" />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── CALCULATE MODE (Leaf) ──────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={24} color="#0F172A" />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>{displayTitle}</Text>
            <Text style={styles.headerSubtitle}>{displayProjectName}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerActionBtn}><Share2 size={18} color="#64748B" /></Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* 2. Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleIconBox}>
            <Calculator size={24} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>{displayTitle}</Text>
            <Text style={styles.pageSubtitle} numberOfLines={2}>Structural quantities configuration for construction items.</Text>
          </View>
        </View>

        {/* 3. Input Dimensions Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Calculator size={16} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>INPUT DIMENSIONS</Text>
            </View>
            <Bookmark size={18} color="#CBD5E1" />
          </View>

          <View style={styles.cardBody}>
            {(selectedFormula?.fields || []).map((field) => (
              <View key={field.fieldId} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {(field.label || '').toUpperCase()} {field.unitSymbol ? `(${(field.unitSymbol || '').toUpperCase()})` : ''}
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={fieldValues[field.fieldId] || ''}
                    onChangeText={(v) => handleInputChange(field.fieldId, v)}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#94A3B8"
                  />
                  <Text style={styles.unitTag}>{(field.unitSymbol || '').toUpperCase()}</Text>
                </View>
              </View>
            ))}

            {leaf?.configs && leaf.configs.length > 0 && (
              <NativeSelect<MaterialConfig>
                label="MATERIAL CONFIGURATION"
                placeholder="Select Configuration"
                value={selectedConfig}
                options={leaf.configs}
                keyExtractor={(item) => item.configId}
                labelExtractor={(item) => item.name}
                onSelect={handleMaterialConfig}
              />
            )}

            <Pressable 
              style={[styles.calculateBtn, calculating && styles.btnDisabled]} 
              onPress={handleCalculate}
              disabled={calculating}
            >
              {calculating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Calculator size={20} color="#fff" />
                  <Text style={styles.calculateBtnText}>CALCULATE ESTIMATION</Text>
                </>
              )}
            </Pressable>

            <Pressable style={styles.resetLink} onPress={handleReset}>
              <Text style={styles.resetLinkText}>↺ RESET VALUES</Text>
            </Pressable>
          </View>
        </View>

        {/* 4. Results Card (Blue Style) */}
        <View style={[styles.card, styles.resultsCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={styles.readyDot} />
              <Text style={[styles.cardTitle, { color: '#fff' }]}>RESULTS</Text>
            </View>
            <View style={styles.readyBadge}>
              <Text style={styles.readyBadgeText}>{results ? 'READY' : 'PENDING'}</Text>
            </View>
          </View>

          <View style={styles.resultsGrid}>
            {(() => {
              try {
                if (!results) {
                  return <ResultItem label="PENDING" value="0.00" unit={selectedFormula?.outputUnitSymbol || ''} />;
                }

                const renderedItems = [];
                
                // 1. Intermediates
                const intermediates = results.intermediateResults || [];
                if (intermediates.length > 0) {
                  intermediates.forEach((r: any, idx: number) => {
                    const label = (
                      r?.outputLabel ?? r?.output_label ?? r?.label ?? r?.outputKey ?? r?.output_key ?? 'Result'
                    ).replace(/_/g, ' ').toUpperCase();
                    const value = typeof r?.value === 'number' ? r.value.toFixed(2) : '0.00';
                    const unit = r?.unitSymbol ?? r?.unit_symbol ?? '';
                    renderedItems.push(
                      <ResultItem
                        key={`int-${r?.outputKey || r?.output_key || idx}`}
                        label={label}
                        value={value}
                        unit={unit}
                      />
                    );
                  });
                } else {
                  // Fallback to basic results dict
                  const resObj = results.results || {};
                  Object.entries(resObj).forEach(([key, val]) => {
                    renderedItems.push(
                      <ResultItem
                        key={`res-${key}`}
                        label={(key || 'Result').replace(/_/g, ' ').toUpperCase()}
                        value={typeof val === 'number' ? (val as number).toFixed(2) : '0.00'}
                        unit={''}
                      />
                    );
                  });
                }

                // 2. Material Lines
                const materials = results.materialLines || [];
                if (materials.length > 0) {
                  renderedItems.push(
                    <View key="materials-section" style={styles.materialsSection}>
                      <Text style={styles.materialsHeader}>MATERIALS BREAKDOWN</Text>
                      {materials.map((m: any, idx: number) => {
                         const name = m.materialNameEn || m.materialName || 'Material';
                         const qty = typeof m.quantityWithWaste === 'number' ? m.quantityWithWaste.toFixed(2) : '0.00';
                         const unit = m.unitSymbol || '';
                         const cost = typeof m.subTotal === 'number' ? m.subTotal.toFixed(2) : '0.00';
                         return (
                           <View key={`mat-${idx}`} style={styles.materialRow}>
                             <View style={styles.materialInfo}>
                               <Text style={styles.materialName}>{name}</Text>
                               <Text style={styles.materialQty}>{qty} {unit}</Text>
                             </View>
                             <View style={styles.materialCostBox}>
                               <Text style={styles.materialCost}>{cost} DZD</Text>
                             </View>
                           </View>
                         );
                      })}
                    </View>
                  );
                }

                // 3. Total Cost
                if (results.totalCost != null) {
                  renderedItems.push(
                    <View key="total-cost" style={styles.totalCostDivider} />
                  );
                  renderedItems.push(
                    <ResultItem 
                      key="total-cost-item"
                      label="TOTAL ESTIMATED COST" 
                      value={results.totalCost.toFixed(2)} 
                      unit="DZD" 
                      isTotal
                    />
                  );
                }

                if (renderedItems.length === 0) {
                  return <ResultItem label="PENDING" value="0.00" unit={selectedFormula?.outputUnitSymbol || ''} />;
                }

                return renderedItems;
              } catch (err) {
                console.error('[LeafCalc] Error rendering results:', err);
                return <ResultItem label="ERROR" value="0.00" unit="" />;
              }
            })()}
          </View>
        </View>

        {results && (
          <Pressable 
            style={[styles.saveBtn, saving && styles.btnDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                <Bookmark size={20} color={theme.colors.primary} />
                <Text style={styles.saveBtnText}>SAVE TO PROJECT HISTORY</Text>
              </>
            )}
          </Pressable>
        )}

        {/* ── Cost Estimation Card removed as it's merged into the main flow ── */}

        {/* 6. Formulas Card */}
        {leaf?.formulas && leaf.formulas.length > 0 && (
          <NativeSelect<Formula>
            label="CALCULATION METHOD"
            placeholder="Select Formula"
            value={selectedFormula}
            options={leaf.formulas}
            keyExtractor={(item) => item.formulaId}
            labelExtractor={(item) => item.nameEn}
            onSelect={handleFormulaSelect}
          />
        )}
        
        {selectedFormula && (
          <View style={styles.formulaDisplay}>
            <Text style={styles.formulaDisplayText}>{selectedFormula.expression || 'V = L * W * H'}</Text>
          </View>
        )}

        {/* Footer Button removed as it's merged into CALCULATE ESTIMATION */}

        <View style={{ height: 40 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

// ── Components ───────────────────────────────

const ResultItem = ({ label, value, unit, isTotal }: { label: string; value: string; unit: string; isTotal?: boolean }) => (
  <View style={[styles.resultItem, isTotal && styles.resultItemTotal]}>
    <Text style={[styles.resultLabel, isTotal && styles.resultLabelTotal]}>{label}</Text>
    <View style={styles.resultValueRow}>
      <Text style={[styles.resultValue, isTotal && styles.resultValueTotal]}>{value}</Text>
      <Text style={[styles.resultUnit, isTotal && styles.resultUnitTotal]}>{unit}</Text>
    </View>
  </View>
);

// ── Styles ──────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerActionBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  scrollContent: { paddingHorizontal: 20 },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  titleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  pageSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },

  // Subcategory (Browse Mode)
  subCatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subCatText: { fontSize: 15, fontWeight: '700', color: '#0F172A' },

  // Card Base
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 12, fontWeight: '800', color: '#0F172A', letterSpacing: 1 },
  cardBody: { padding: 16 },

  // Inputs
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginBottom: 8, letterSpacing: 0.8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  textInput: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0F172A' },
  unitTag: { fontSize: 12, fontWeight: '800', color: '#CBD5E1' },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  dropdownText: { fontSize: 14, fontWeight: '600', color: '#334155' },

  calculateBtn: {
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  calculateBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  resetLink: { alignSelf: 'center', marginTop: 16, padding: 8 },
  resetLinkText: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5 },

  // Results (Blue Card)
  resultsCard: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  readyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  readyBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  readyBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  resultsGrid: { padding: 16, gap: 12 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    borderRadius: 12,
  },
  resultItemTotal: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)', // emerald green tint
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    paddingVertical: 20,
  },
  resultLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
  resultLabelTotal: { color: '#34D399', fontSize: 13, fontWeight: '900' }, // bright emerald
  resultValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  resultValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  resultValueTotal: { fontSize: 28, color: '#A7F3D0' }, // light emerald
  resultUnit: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  resultUnitTotal: { color: 'rgba(167, 243, 208, 0.7)' },
  
  // Materials Breakdown styles
  materialsSection: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    padding: 16,
  },
  materialsHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    marginBottom: 12,
  },
  materialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  materialInfo: { flex: 1 },
  materialName: { fontSize: 14, fontWeight: '700', color: '#E2E8F0', marginBottom: 4 },
  materialQty: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  materialCostBox: { alignItems: 'flex-end' },
  materialCost: { fontSize: 14, fontWeight: '800', color: '#fff' },
  totalCostDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },

  // Cost Estimation
  optionalBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  optionalBadgeText: { fontSize: 10, fontWeight: '800', color: '#64748B' },
  helperText: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 16 },
  outlineBtn: {
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  outlineBtnText: { color: '#2563EB', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },

  // Formulas
  formulaGroup: { gap: 8 },
  formulaLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },
  formulaDisplay: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  formulaDisplayText: { fontSize: 12, fontWeight: '700', color: '#2563EB', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  // Footer Save Btn
  saveBtn: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  saveBtnText: { color: theme.colors.primary, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  btnDisabled: { opacity: 0.5 },
});
