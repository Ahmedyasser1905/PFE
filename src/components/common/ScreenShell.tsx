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
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '~/constants/theme';

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
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <SafeAreaView style={[styles.container, style]} edges={['top']}>
      {showHeader && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <ArrowLeft size={22} color={theme.colors.text} />
          </TouchableOpacity>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
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
