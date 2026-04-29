import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { theme } from '~/constants/theme';
import { Logo } from '~/components/ui/Logo';
import { BaseInput } from '~/components/ui/BaseInput';
import { BaseButton } from '~/components/ui/BaseButton';
import { authApi } from '~/api/api';
import { useFeedback } from '~/context/FeedbackContext';
export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { showFeedback } = useFeedback();
    const handleResetRequest = async () => {
        if (!email) {
            showFeedback({ title: 'Error', message: 'Please enter your email address', type: 'warning' });
            return;
        }
        try {
            setLoading(true);
            await authApi.forgotPassword(email);
            showFeedback({
                title: 'OTP Sent',
                message: 'A 6-digit verification code has been sent to your email.',
                type: 'success',
                onPrimary: () => router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
            });
        } catch (error: any) {
            console.error('Forgot password failed:', error.response?.data?.message || error.message);
            showFeedback({
                title: 'Error',
                message: JSON.stringify(error?.response?.data || error?.message || 'Something went wrong'),
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <BaseButton
                        title="Back to login"
                        onPress={() => router.back()}
                        variant="ghost"
                        icon={ArrowLeft}
                        style={styles.backButton}
                    />
                    <View style={styles.header}>
                        <Logo size="md" />
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.title}>Forgot password?</Text>
                        <Text style={styles.subtitle}>
                            Enter your email and we'll send you a link to reset your password.
                        </Text>
                        <BaseInput
                            label="Email Address"
                            placeholder="engineer@example.com"
                            icon={Mail}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <BaseButton
                            title="Send Reset Link"
                            onPress={handleResetRequest}
                            loading={loading}
                            style={styles.submitButton}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: theme.spacing.xl,
        paddingHorizontal: 0,
    },
    header: {
        marginBottom: theme.spacing.xxl,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        lineHeight: 24,
        marginBottom: theme.spacing.xl,
    },
    submitButton: {
        marginTop: theme.spacing.lg,
    },
});

