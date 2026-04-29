import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BUDGET_OPTIONS, BudgetType } from '~/constants/config';
import { theme } from '~/constants/theme';

interface Props {
  selected: BudgetType | null;
  onSelect: (category: BudgetType) => void;
}

export default function BudgetCategorySelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {BUDGET_OPTIONS.map((option) => {
        const isSelected = selected === option.id;
        return (
          <Pressable
            key={option.id}
            style={[
              styles.chip,
              isSelected && styles.chipSelected
            ]}
            onPress={() => onSelect(option.id as BudgetType)}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {option.label}
            </Text>
            <Text style={[styles.subLabel, isSelected && styles.subLabelSelected]}>
              {option.subLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  chip: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  chipSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    elevation: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  labelSelected: {
    color: '#2563eb',
  },
  subLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
  },
  subLabelSelected: {
    color: '#60a5fa',
  },
});
