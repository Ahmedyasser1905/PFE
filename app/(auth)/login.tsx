import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight, X } from 'lucide-react-native';
import { theme } from '~/constants/theme';
import { Logo } from '~/components/ui/Logo';
import { BaseInput } from '~/components/ui/BaseInput';
import { BaseButton } from '~/components/ui/BaseButton';
import { useAuth } from '~/context/AuthContext';
import { authApi } from '~/api/api';
import { parseError } from '~/utils/errorHandler';
import { useLanguage } from '~/context/LanguageContext';
import { useFeedback } from '~/context/FeedbackContext';

const styles = StyleSheet.create({
  landingContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'space-between',
    padding: theme.spacing.xl,
  } as ViewStyle,
  rtlItems: { alignItems: 'flex-end' } as ViewStyle,
  rtlText: { textAlign: 'right' } as TextStyle,
  rtlRow: { flexDirection: 'row-reverse' } as ViewStyle,
  rtlForgot: { alignSelf: 'flex-start' } as ViewStyle,
  landingHeader: {
    marginTop: 80,
  } as ViewStyle,
  landingLogo: {
    marginBottom: theme.spacing.xxxl,
  } as ViewStyle,
  landingContent: {
    marginTop: theme.spacing.xl,
  } as ViewStyle,
  landingOverline: {
    ...theme.typography.h4,
    color: theme.colors.white,
    opacity: 0.8,
    fontWeight: '600',
  } as TextStyle,
  landingTitle: {
    ...theme.typography.h1,
    fontSize: 44,
    color: theme.colors.white,
    marginTop: theme.spacing.sm,
    lineHeight: 52,
  } as TextStyle,
  landingFooter: {
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  } as ViewStyle,
  getStartedBtn: {
    backgroundColor: theme.colors.white,
    height: 64,
    borderRadius: theme.roundness.full,
    ...theme.shadows.md,
  } as ViewStyle,
  getStartedBtnText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '800',
  } as TextStyle,
  loginLink: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  } as ViewStyle,
  loginLinkText: {
    color: theme.colors.white,
    ...theme.typography.bodyBold,
  } as TextStyle,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  } as ViewStyle,
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  content: {
    flex: 1,
  } as ViewStyle,
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxl,
  } as TextStyle,
  passwordContainer: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  forgotPasswordPressable: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.sm,
  } as ViewStyle,
  forgotPasswordText: {
    ...theme.typography.small,
    fontWeight: '700',
    color: theme.colors.primary,
  } as TextStyle,
  loginButton: {
    height: 56,
    borderRadius: theme.roundness.xl,
    marginTop: theme.spacing.lg,
    ...theme.shadows.sm,
  } as ViewStyle,
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  } as ViewStyle,
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.roundness.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  } as ViewStyle,
  checkboxActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: theme.colors.white,
  } as ViewStyle,
  rememberText: {
    marginLeft: theme.spacing.md,
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
  } as TextStyle,
});

export default function LoginScreen() {
  const params = useLocalSearchParams();
  const [showLoginForm, setShowLoginForm] = useState(params.mode === 'form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const router = useRouter();
  const { showFeedback } = useFeedback();

  useEffect(() => {
    if (user && !authLoading) {
      router.replace('/(dashboard)');
    }
  }, [user, authLoading, router]);

  const handleGoToRegister = useCallback(() => {
    router.push('/register');
  }, [router]);

  const handleShowLoginForm = useCallback(() => {
    setShowLoginForm(true);
  }, []);

  const handleBackPress = useCallback(() => {
    setShowLoginForm(false);
  }, []);

  const handleRememberMeToggle = useCallback(() => {
    setRememberMe((prev) => !prev);
  }, []);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      showFeedback({
        title: t('common.error'),
        message: t('auth.email_password_required') || 'Please enter email and password',
        type: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.login({
        email,
        password,
      });

      if (!response || !response.accessToken || !response.user) {
        throw new Error('Server returned an invalid response structure');
      }

      await login(response.user, response.accessToken, response.refreshToken);
      router.replace('/(dashboard)');
    } catch (error: any) {
      console.error('[Login] Error:', error);
      showFeedback({
        title: t('common.error'),
        message: parseError(error, 'Server error'),
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [email, password, login, router, showFeedback, t]);

  if (!showLoginForm) {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <View style={styles.landingContainer}>
          <View style={styles.landingHeader}>
            <Logo size="lg" style={styles.landingLogo} />
            <View style={[styles.landingContent, isArabic && styles.rtlItems]}>
              <Text style={[styles.landingOverline, isArabic && styles.rtlText]}>
                {t('auth.landing_overline')}
              </Text>
              <Text style={[styles.landingTitle, isArabic && styles.rtlText]}>
                {t('auth.landing_title')}
              </Text>
            </View>
          </View>
          <View style={styles.landingFooter}>
            <BaseButton
              title={t('auth.get_started')}
              onPress={handleGoToRegister}
              style={styles.getStartedBtn}
              textStyle={styles.getStartedBtnText}
            />
            <TouchableOpacity style={styles.loginLink} onPress={handleShowLoginForm}>
              <Text style={styles.loginLinkText}>{t('auth.login_link')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable onPress={handleBackPress} style={styles.backBtn} disabled={loading}>
              <X size={24} color={theme.colors.text} />
            </Pressable>
          </View>
          <View style={[styles.content, isArabic && styles.rtlItems]}>
            <Text style={[styles.title, isArabic && styles.rtlText]}>
              {t('auth.welcome_back')}
            </Text>
            <Text style={[styles.subtitle, isArabic && styles.rtlText]}>
              {t('auth.login_desc')}
            </Text>
            <BaseInput
              label={t('auth.email_label')}
              placeholder={t('auth.email_placeholder')}
              icon={Mail}
              value={email}
              onChangeText={setEmail}
              style={isArabic && styles.rtlText}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <View style={styles.passwordContainer}>
              <BaseInput
                label={t('auth.password_label')}
                placeholder={t('auth.password_placeholder')}
                icon={Lock}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={isArabic && styles.rtlText}
                editable={!loading}
                autoComplete="password"
              />
              <Link href="/forgot-password" asChild>
                <Pressable
                  style={[styles.forgotPasswordPressable, isArabic && styles.rtlForgot]}
                  disabled={loading}
                >
                  <Text style={styles.forgotPasswordText}>{t('auth.forgot_password')}</Text>
                </Pressable>
              </Link>
            </View>
            <TouchableOpacity
              style={[styles.rememberContainer, isArabic && styles.rtlRow]}
              onPress={handleRememberMeToggle}
              activeOpacity={0.7}
              disabled={loading}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <View style={styles.checkboxInner} />}
              </View>
              <Text style={[styles.rememberText, isArabic && styles.rtlText]}>
                {t('auth.remember_me')}
              </Text>
            </TouchableOpacity>
            <BaseButton
              title={t('auth.login_btn')}
              onPress={handleLogin}
              loading={loading}
              icon={ArrowRight}
              style={[styles.loginButton, isArabic && styles.rtlRow]}
              disabled={loading || !email || !password}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}