import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '~/constants/theme';
import { Logo } from '~/components/ui/Logo';
import { BaseInput } from '~/components/ui/BaseInput';
import { BaseButton } from '~/components/ui/BaseButton';
import { authApi } from '~/api/api';
import { useFeedback } from '~/context/FeedbackContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  keyboardView: {
    flex: 1,
  } as ViewStyle,
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  } as ViewStyle,
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: 0,
  } as ViewStyle,
  header: {
    marginBottom: theme.spacing.xxl,
  } as ViewStyle,
  content: {
    flex: 1,
  } as ViewStyle,
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: -1,
  } as TextStyle,
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  } as TextStyle,
  submitButton: {
    marginTop: theme.spacing.lg,
  } as ViewStyle,
});

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { showFeedback } = useFeedback();
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(auth)/forgot-password');
  }, [router]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otp) {
      showFeedback({ title: 'Error', message: 'Please enter the reset token', type: 'warning' });
      return;
    }
    try {
      setLoading(true);
      await authApi.verifyOtp(email as string, otp);
      router.push(
        `/reset-password?email=${encodeURIComponent(email as string)}&token=${encodeURIComponent(
          otp
        )}`
      );
    } catch (error: any) {
      console.error('Token verification failed:', error.response?.data?.message || error.message);
      showFeedback({
        title: 'Error',
        message: error?.response?.data?.message || error?.message || 'Invalid or expired token',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [otp, email, router, showFeedback]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <BaseButton
            title="Back"
            onPress={handleBack}
            variant="ghost"
            icon={ArrowLeft}
            style={styles.backButton}
            disabled={loading}
          />
          <View style={styles.header}>
            <Logo size="md" />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Verify Token</Text>
            <Text style={styles.subtitle}>Enter the reset token sent to {email}.</Text>
            <BaseInput
              label="Reset Token"
              placeholder="Enter your hex token"
              icon={ShieldCheck}
              value={otp}
              onChangeText={setOtp}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <BaseButton
              title="Verify Code"
              onPress={handleVerifyOtp}
              loading={loading}
              style={styles.submitButton}
              disabled={loading || !otp}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

