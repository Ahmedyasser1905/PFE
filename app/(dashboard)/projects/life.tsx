import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';

// Mock data structure simulating backend response
const mockCalculationData = {
  id: '1',
  title: 'Isolated Footing',
  subtitle: 'Structural quantities configuration for RC footings',
  projectId: 'proj-001',
  category: 'Structural',
  inputs: {
    length: 2.5,
    width: 2.5,
    height: 0.6,
    concreteGrade: 'C25/30',
  },
  results: {
    concreteVolume: 3.75,
    surfaceArea: 6.25,
    excavation: 5.4,
    steelEstimate: 300.0,
  },
  costEstimation: {
    available: true,
    marketRate: 85.5,
  },
  formulas: {
    volumeMethod: 'Standard Volume (Prismatic)',
    volumeFormula: 'V = L × W × H',
    areaMethod: 'Standard Footprint Area',
    areaFormula: 'A = L × W',
  },
  status: 'calculated',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:35:00Z',
};

// Types
type InputDimensionsCardProps = {
  data: typeof mockCalculationData;
  onCalculate: () => void;
  onReset: () => void;
  formValues: {
    length: string;
    width: string;
    height: string;
    concreteGrade: string;
  };
  setFormValues: React.Dispatch<
    React.SetStateAction<{
      length: string;
      width: string;
      height: string;
      concreteGrade: string;
    }>
  >;
};

type ResultsCardProps = {
  data: typeof mockCalculationData;
  isCalculated: boolean;
};

type CostEstimationCardProps = {
  data: typeof mockCalculationData;
  onCalculateCosts: () => void;
};

type FormulasCardProps = {
  data: typeof mockCalculationData;
};

// Input Dimensions Card Component
const InputDimensionsCard: React.FC<InputDimensionsCardProps> = ({
  onCalculate,
  onReset,
  formValues,
  setFormValues,
}) => {
  return (
    <View style={stylesInputDimensionsCard.container}>
      <View style={stylesInputDimensionsCard.header}>
        <View style={stylesInputDimensionsCard.iconContainer}>
          <Text style={stylesInputDimensionsCard.icon}>📝</Text>
        </View>
        <Text style={stylesInputDimensionsCard.headerText}>INPUT DIMENSIONS</Text>
        <Pressable style={stylesInputDimensionsCard.settingsButton}>
          <Text style={stylesInputDimensionsCard.settingsIcon}>⚙️</Text>
        </Pressable>
      </View>

      <View style={stylesInputDimensionsCard.form}>
        <View style={stylesInputDimensionsCard.inputRow}>
          <Text style={stylesInputDimensionsCard.label}>LENGTH (L)</Text>
          <View style={stylesInputDimensionsCard.inputContainer}>
            <TextInput
              style={stylesInputDimensionsCard.input}
              value={formValues.length}
              onChangeText={(text: string) =>
                setFormValues((prev) => ({ ...prev, length: text }))
              }
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
            <Text style={stylesInputDimensionsCard.unit}>M</Text>
          </View>
        </View>

        <View style={stylesInputDimensionsCard.inputRow}>
          <Text style={stylesInputDimensionsCard.label}>WIDTH (W)</Text>
          <View style={stylesInputDimensionsCard.inputContainer}>
            <TextInput
              style={stylesInputDimensionsCard.input}
              value={formValues.width}
              onChangeText={(text: string) =>
                setFormValues((prev) => ({ ...prev, width: text }))
              }
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
            <Text style={stylesInputDimensionsCard.unit}>M</Text>
          </View>
        </View>

        <View style={stylesInputDimensionsCard.inputRow}>
          <Text style={stylesInputDimensionsCard.label}>HEIGHT (H)</Text>
          <View style={stylesInputDimensionsCard.inputContainer}>
            <TextInput
              style={stylesInputDimensionsCard.input}
              value={formValues.height}
              onChangeText={(text: string) =>
                setFormValues((prev) => ({ ...prev, height: text }))
              }
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
            <Text style={stylesInputDimensionsCard.unit}>M</Text>
          </View>
        </View>

        <View style={stylesInputDimensionsCard.inputRow}>
          <Text style={stylesInputDimensionsCard.label}>CONCRETE GRADE</Text>
          <View style={stylesInputDimensionsCard.dropdown}>
            <Text style={stylesInputDimensionsCard.dropdownText}>
              {formValues.concreteGrade} - Standard Structural
            </Text>
            <Text style={stylesInputDimensionsCard.dropdownIcon}>▼</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={stylesInputDimensionsCard.calculateButton}
        onPress={onCalculate}
      >
        <Text style={stylesInputDimensionsCard.calculateButtonIcon}>🧮</Text>
        <Text style={stylesInputDimensionsCard.calculateButtonText}>
          CALCULATE
        </Text>
      </Pressable>

      <Pressable style={stylesInputDimensionsCard.resetButton} onPress={onReset}>
        <Text style={stylesInputDimensionsCard.resetIcon}>⟲</Text>
        <Text style={stylesInputDimensionsCard.resetText}>RESET VALUES</Text>
      </Pressable>
    </View>
  );
};

const stylesInputDimensionsCard = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    fontSize: 14,
  },
  headerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },
  settingsButton: {
    padding: 4,
  },
  settingsIcon: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  form: {
    gap: 16,
  },
  inputRow: {
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    padding: 0,
  },
  unit: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    marginLeft: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 44,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#6B7280',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 20,
    gap: 8,
  },
  calculateButtonIcon: {
    fontSize: 16,
  },
  calculateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    gap: 6,
  },
  resetIcon: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  resetText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
});

// Results Card Component
const ResultsCard: React.FC<ResultsCardProps> = ({ data, isCalculated }) => {
  if (!isCalculated) return null;

  return (
    <View style={stylesResultsCard.container}>
      <View style={stylesResultsCard.header}>
        <View style={stylesResultsCard.iconContainer}>
          <Text style={stylesResultsCard.icon}>📊</Text>
        </View>
        <Text style={stylesResultsCard.headerText}>RESULTS</Text>
        <View style={stylesResultsCard.statusBadge}>
          <Text style={stylesResultsCard.statusText}>READY</Text>
        </View>
      </View>

      <View style={stylesResultsCard.resultsList}>
        <View style={stylesResultsCard.resultItem}>
          <Text style={stylesResultsCard.resultLabel}>CONCRETE VOL.</Text>
          <View style={stylesResultsCard.resultValueContainer}>
            <Text style={stylesResultsCard.resultValue}>
              {data.results.concreteVolume.toFixed(2)}
            </Text>
            <Text style={stylesResultsCard.resultUnit}>m³</Text>
          </View>
        </View>

        <View style={stylesResultsCard.resultItem}>
          <Text style={stylesResultsCard.resultLabel}>SURFACE AREA</Text>
          <View style={stylesResultsCard.resultValueContainer}>
            <Text style={stylesResultsCard.resultValue}>
              {data.results.surfaceArea.toFixed(2)}
            </Text>
            <Text style={stylesResultsCard.resultUnit}>m²</Text>
          </View>
        </View>

        <View style={stylesResultsCard.resultItem}>
          <Text style={stylesResultsCard.resultLabel}>EXCAVATION</Text>
          <View style={stylesResultsCard.resultValueContainer}>
            <Text style={stylesResultsCard.resultValue}>
              {data.results.excavation.toFixed(2)}
            </Text>
            <Text style={stylesResultsCard.resultUnit}>m³</Text>
          </View>
        </View>

        <View style={stylesResultsCard.resultItem}>
          <Text style={stylesResultsCard.resultLabel}>STEEL (EST.)</Text>
          <View style={stylesResultsCard.resultValueContainer}>
            <Text style={stylesResultsCard.resultValue}>
              {data.results.steelEstimate.toFixed(2)}
            </Text>
            <Text style={stylesResultsCard.resultUnit}>kg</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const stylesResultsCard = StyleSheet.create({
  container: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    fontSize: 14,
  },
  headerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  resultsList: {
    gap: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
  resultValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 3,
  },
});

// Cost Estimation Card Component
const CostEstimationCard: React.FC<CostEstimationCardProps> = ({
  data,
  onCalculateCosts,
}) => {
  return (
    <View style={stylesCostEstimationCard.container}>
      <View style={stylesCostEstimationCard.header}>
        <View style={stylesCostEstimationCard.iconContainer}>
          <Text style={stylesCostEstimationCard.icon}>💰</Text>
        </View>
        <Text style={stylesCostEstimationCard.headerText}>COST ESTIMATION</Text>
        <View style={stylesCostEstimationCard.optionalBadge}>
          <Text style={stylesCostEstimationCard.optionalText}>OPTIONAL</Text>
        </View>
      </View>

      <Text style={stylesCostEstimationCard.description}>
        Get an automated cost estimate based on current market rates.
      </Text>

      <Pressable
        style={stylesCostEstimationCard.calculateButton}
        onPress={onCalculateCosts}
      >
        <Text style={stylesCostEstimationCard.calculateButtonIcon}>🧮</Text>
        <Text style={stylesCostEstimationCard.calculateButtonText}>
          CALCULATE COSTS
        </Text>
      </Pressable>
    </View>
  );
};

const stylesCostEstimationCard = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    fontSize: 14,
  },
  headerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },
  optionalBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  optionalText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    paddingVertical: 14,
    gap: 8,
  },
  calculateButtonIcon: {
    fontSize: 16,
  },
  calculateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
});

// Formulas Card Component
const FormulasCard: React.FC<FormulasCardProps> = ({ data }) => {
  return (
    <View style={stylesFormulasCard.container}>
      <View style={stylesFormulasCard.header}>
        <View style={stylesFormulasCard.iconContainer}>
          <Text style={stylesFormulasCard.icon}>📐</Text>
        </View>
        <Text style={stylesFormulasCard.headerText}>FORMULAS</Text>
      </View>

      <View style={stylesFormulasCard.formulaSection}>
        <Text style={stylesFormulasCard.sectionLabel}>VOLUME METHOD</Text>
        <View style={stylesFormulasCard.dropdown}>
          <Text style={stylesFormulasCard.dropdownText}>
            {data.formulas.volumeMethod}
          </Text>
          <Text style={stylesFormulasCard.dropdownIcon}>▼</Text>
        </View>
        <Text style={stylesFormulasCard.formulaText}>
          {data.formulas.volumeFormula}
        </Text>
      </View>

      <View style={stylesFormulasCard.formulaSection}>
        <Text style={stylesFormulasCard.sectionLabel}>AREA METHOD</Text>
        <View style={stylesFormulasCard.dropdown}>
          <Text style={stylesFormulasCard.dropdownText}>
            {data.formulas.areaMethod}
          </Text>
          <Text style={stylesFormulasCard.dropdownIcon}>▼</Text>
        </View>
        <Text style={stylesFormulasCard.formulaText}>
          {data.formulas.areaFormula}
        </Text>
      </View>
    </View>
  );
};

const stylesFormulasCard = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    fontSize: 14,
  },
  headerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },
  formulaSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 8,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#6B7280',
  },
  formulaText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});

// Add to BOM Button Component
const AddToBOMButton: React.FC = () => {
  return (
    <Pressable style={stylesAddToBOMButton.container}>
      <Text style={stylesAddToBOMButton.icon}>🔗</Text>
      <Text style={stylesAddToBOMButton.text}>ADD TO PROJECT BOM</Text>
    </Pressable>
  );
};

const stylesAddToBOMButton = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    paddingVertical: 16,
    marginBottom: 24,
    gap: 8,
  },
  icon: {
    fontSize: 16,
    color: '#6B7280',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
});

// Main Screen Component
const IsolatedFootingScreen: React.FC = () => {
  const [formValues, setFormValues] = useState({
    length: mockCalculationData.inputs.length.toFixed(2),
    width: mockCalculationData.inputs.width.toFixed(2),
    height: mockCalculationData.inputs.height.toFixed(2),
    concreteGrade: mockCalculationData.inputs.concreteGrade,
  });

  const [isCalculated, setIsCalculated] = useState(true);
  const [calculationData, setCalculationData] = useState(mockCalculationData);

  const handleCalculate = () => {
    // Simulate calculation logic
    const length = parseFloat(formValues.length) || 0;
    const width = parseFloat(formValues.width) || 0;
    const height = parseFloat(formValues.height) || 0;

    const volume = length * width * height;
    const area = length * width;
    const excavation = volume * 1.44; // Simulated excavation factor
    const steel = volume * 80; // Simulated steel factor

    setCalculationData({
      ...calculationData,
      results: {
        concreteVolume: volume,
        surfaceArea: area,
        excavation: excavation,
        steelEstimate: steel,
      },
      status: 'calculated',
      updatedAt: new Date().toISOString(),
    });

    setIsCalculated(true);
  };

  const handleReset = () => {
    setFormValues({
      length: '',
      width: '',
      height: '',
      concreteGrade: 'C25/30',
    });
    setIsCalculated(false);
  };

  const handleCalculateCosts = () => {
    // Placeholder for cost calculation
    console.log('Calculating costs...');
  };

  return (
    <ScrollView
      style={stylesIsolatedFootingScreen.container}
      contentContainerStyle={stylesIsolatedFootingScreen.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={stylesIsolatedFootingScreen.header}>
        <View style={stylesIsolatedFootingScreen.iconRow}>
          <View style={stylesIsolatedFootingScreen.categoryIcon}>
            <Text style={stylesIsolatedFootingScreen.categoryIconText}>🏗️</Text>
          </View>
        </View>
        <Text style={stylesIsolatedFootingScreen.title}>
          {calculationData.title}
        </Text>
        <Text style={stylesIsolatedFootingScreen.subtitle}>
          {calculationData.subtitle}
        </Text>
      </View>

      {/* Cards */}
      <InputDimensionsCard
        data={calculationData}
        onCalculate={handleCalculate}
        onReset={handleReset}
        formValues={formValues}
        setFormValues={setFormValues}
      />

      <ResultsCard data={calculationData} isCalculated={isCalculated} />

      <CostEstimationCard
        data={calculationData}
        onCalculateCosts={handleCalculateCosts}
      />

      <FormulasCard data={calculationData} />

      <AddToBOMButton />
    </ScrollView>
  );
};

const stylesIsolatedFootingScreen = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  iconRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconText: {
    fontSize: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default IsolatedFootingScreen;
