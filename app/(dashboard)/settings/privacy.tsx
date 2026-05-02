import React from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield } from 'lucide-react-native';
import { theme } from '~/constants/theme';

/**
 * Dashboard-internal Privacy Policy.
 *
 * Lives inside the (dashboard) group on purpose: navigating to a sibling
 * group (`/privacy` at root) and using `router.back()` triggers a known
 * expo-router/React Navigation v7 bug where the dashboard's nested
 * NativeStackNavigator briefly receives `state: undefined` during the
 * back-transition reconciliation, throwing
 * `Cannot read property 'stale' of undefined`.
 *
 * Keeping every settings detail screen as a child of the dashboard's stack
 * keeps navigation within a single navigator and eliminates the crash.
 *
 * Back navigation is provided by the global Header; this screen renders no
 * header of its own.
 */
export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconCircle}>
          <Shield size={32} color={theme.colors.primary} />
        </View>

        <Text style={styles.lastUpdated}>Last Updated: May 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Data Collection</Text>
          <Text style={styles.text}>
            We collect information you provide directly to us, such as account details and project estimation data, to provide and improve our services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use of Information</Text>
          <Text style={styles.text}>
            Your estimation data is used only within the app for your projects. We do not sell or share your personal data with third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Local Storage</Text>
          <Text style={styles.text}>
            Some project data is stored locally on your device for offline access. You can clear this data through the application settings or by deleting the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Security</Text>
          <Text style={styles.text}>
            We take reasonable measures to protect your data from loss, theft, and unauthorized access.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background } as ViewStyle,
  content: { padding: theme.spacing.xl, alignItems: 'center' } as ViewStyle,
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  } as ViewStyle,
  lastUpdated: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 32,
  } as TextStyle,
  section: { width: '100%', marginBottom: 24 } as ViewStyle,
  sectionTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
    marginBottom: 8,
  } as TextStyle,
  text: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  } as TextStyle,
});
