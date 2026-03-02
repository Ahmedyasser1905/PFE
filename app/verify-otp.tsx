import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '../constants/theme';
import { Logo } from '../components/Logo';
import { BaseInput } from '../components/BaseInput';
import { BaseButton } from '../components/BaseButton';
import { authApi } from '../api/api';

export default function VerifyOtpScreen() {
    const { email } = useLocalSearchParams();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setLoading(true);
            await authApi.verifyOtp(email as string, otp);
            router.push({
                pathname: '/reset-password',
                params: { email, otp }
            });
        } catch (error: any) {
            console.error('OTP verification failed:', error.response?.data?.message || error.message);
            Alert.alert('Error', error.response?.data?.message || 'Invalid or expired OTP');
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
                        <Text style={styles.title}>Verify OTP</Text>
                        <Text style={styles.subtitle}>
                            Enter the 6-digit code sent to {email}.
                        </Text>

                        <BaseInput
                            label="Verification Code"
                            placeholder="123456"
                            icon={ShieldCheck}
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
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
