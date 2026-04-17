import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '../../constants/theme';
import { Logo } from '../../components/Logo';
import { BaseInput } from '../../components/BaseInput';
import { BaseButton } from '../../components/BaseButton';
import { authApi } from '../../api/api';
export default function ResetPasswordScreen() {
    const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const handleResetPassword = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        try {
            setLoading(true);
            await authApi.resetPasswordOtp({
                email: email as string,
                otp: otp as string,
                password
            });
            setSuccess(true);
        } catch (error: any) {
            console.error('Reset password failed:', error.response?.data?.message || error.message);
            Alert.alert('Error', error.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };
    if (success) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.successContent}>
                    <CheckCircle2 size={64} color={theme.colors.primary} />
                    <Text style={styles.title}>Password Reset</Text>
                    <Text style={styles.subtitle}>
                        Your password has been successfully reset. You can now log in with your new password.
                    </Text>
                    <BaseButton
                        title="Back to Login"
                        onPress={() => router.replace('/')}
                        style={styles.submitButton}
                    />
                </View>
            </SafeAreaView>
        );
    }
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
                        iconPosition="left"
                        style={styles.backButton}
                    />
                    <View style={styles.header}>
                        <Logo size="md" />
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.title}>New Password</Text>
                        <Text style={styles.subtitle}>
                            Please enter and confirm your new password below.
                        </Text>
                        <BaseInput
                            label="New Password"
                            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                            icon={Lock}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <BaseInput
                            label="Confirm New Password"
                            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                            icon={Lock}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                        <BaseButton
                            title="Reset Password"
                            onPress={handleResetPassword}
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
    successContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        textAlign: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.lg,
        letterSpacing: -1,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        lineHeight: 24,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    submitButton: {
        marginTop: theme.spacing.lg,
        width: '100%',
    },
});
