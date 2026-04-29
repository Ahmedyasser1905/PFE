import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '~/constants/theme';
import { Logo } from '~/components/ui/Logo';
import { BaseInput } from '~/components/ui/BaseInput';
import { BaseButton } from '~/components/ui/BaseButton';
import { authApi } from '~/api/api';
import { useFeedback } from '~/context/FeedbackContext';
export default function VerifyOtpScreen() {
    const { email } = useLocalSearchParams();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { showFeedback } = useFeedback();
    const handleVerifyOtp = async () => {
        if (!otp) {
            showFeedback({ title: 'Error', message: 'Please enter the reset token', type: 'warning' });
            return;
        }
        try {
            setLoading(true);
            await authApi.verifyOtp(email as string, otp);
            router.push(`/reset-password?email=${encodeURIComponent(email as string)}&token=${encodeURIComponent(otp)}`);
        } catch (error: any) {
            console.error('Token verification failed:', error.response?.data?.message || error.message);
            showFeedback({
                title: 'Error',
                message: JSON.stringify(error?.response?.data || error?.message || 'Invalid or expired token'),
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
                        title="Back"
                        onPress={() => router.back()}
                        variant="ghost"
                        icon={ArrowLeft}
                        style={styles.backButton}
                    />
                    <View style={styles.header}>
                        <Logo size="md" />
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.title}>Verify Token</Text>
                        <Text style={styles.subtitle}>
                            Enter the reset token sent to {email}.
                        </Text>
                        <BaseInput
                            label="Reset Token"
                            placeholder="Enter your hex token"
                            icon={ShieldCheck}
                            value={otp}
                            onChangeText={setOtp}
                        />
                        <BaseButton
                            title="Verify Code"
                            onPress={handleVerifyOtp}
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

