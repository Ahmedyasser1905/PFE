/**
 * ScreenShell — Standard screen wrapper used by all detail/secondary screens.
 *
 * Provides:
 *  - SafeAreaView (top edge only for screens with custom headers)
 *  - Consistent background color
 *  - Optional header with back button, title, and right action
 *
 * Eliminates the duplicated header pattern copy-pasted in:
 *  - calculation-details/[id].tsx
 *  - estimation-history/index.tsx
 *  - projects/[id]/categories.tsx
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '~/constants/theme';
import BackButton from './BackButton';

interface ScreenShellProps {
  title?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
  /** If true (default), renders the header bar */
  showHeader?: boolean;
}

export const ScreenShell: React.FC<ScreenShellProps> = ({
  title,
  onBack,
  rightAction,
  children,
  style,
  showHeader = true,
}) => {
  return (
    <SafeAreaView style={[styles.container, style]} edges={['top']}>
      {showHeader && (
        <View style={styles.header}>
          <BackButton onPress={onBack} />
          {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : <View style={{ flex: 1 }} />}
          <View style={styles.rightSlot}>{rightAction ?? null}</View>
        </View>
      )}
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  rightSlot: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
