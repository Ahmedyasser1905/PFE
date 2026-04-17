import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

// Types
type FilterType = 'All' | 'Active' | 'Completed';

interface FilterProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: FilterType[] = ['All', 'Active', 'Completed'];

export const Filter: React.FC<FilterProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  return (
    <View style={styles.container}>
      {filters.map((filter) => {
        const isActive = selectedFilter === filter;

        return (
          <Pressable
            key={filter}
            onPress={() => onFilterChange(filter)}
            style={styles.button}
          >
            <Text style={[styles.text, isActive && styles.activeText]}>
              {filter === 'All' ? 'All Projects' : filter}
            </Text>

            {/* ACTIVE UNDERLINE */}
            {isActive && <View style={styles.underline} />}
          </Pressable>
        );
      })}
    </View>
  );
};

// STYLES
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 20,
  },

  button: {
    paddingBottom: 10,
    position: 'relative',
  },

  text: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  activeText: {
    color: '#2563eb',
    fontWeight: '600',
  },

  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2563eb',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});