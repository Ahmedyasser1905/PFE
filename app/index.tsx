import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { Logo } from '../components/Logo';
import { BaseInput } from '../components/BaseInput';
import { BaseButton } from '../components/BaseButton';

import { authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, user, loading: authLoading, getInitialRoute } = useAuth();
    const router = useRouter();


    const handleLogin = async () => {
        console.log('[Login] handleLogin started', { email });
        if (!email || !password) {
            console.warn('[Login] Missing email or password');
            return;
        }

        try {
            setLoading(true);
            console.log('[Login] Calling authApi.login...');
            const response = await authApi.login({ email, password });
            console.log('[Login] Login success:', response.data);
            const { user, token } = response.data;
            await login(user, token);
            const initialRoute = getInitialRoute();
            console.log('[Login] Navigating to:', initialRoute);
            router.replace(initialRoute);
        } catch (error: any) {
            console.error('[Login] Login failed:', error.response?.data?.message || error.message);
            alert('Login failed: ' + (error.response?.data?.message || 'Server error'));
        } finally {
            setLoading(false);
            console.log('[Login] handleLogin finished');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Logo size="md" />
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>Welcome back</Text>
                        <Text style={styles.subtitle}>
                            Log in to manage your construction estimates and projects efficiently.
                        </Text>

                        <BaseInput
                            label="Email Address"
                            placeholder="engineer@example.com"
                            icon={Mail}
                            value={email}
                            onChangeText={setEmail}
                        />

                        <View style={styles.passwordContainer}>
                            <View style={styles.passwordHeader}>
                                <Text style={styles.label}>Password</Text>
                                <Link href="/forgot-password" asChild>
                                    <Pressable>
                                        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                                    </Pressable>
                                </Link>
                            </View>
                            <BaseInput
                                label="Password"
                                placeholder="••••••••"
                                icon={Lock}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <Pressable
                            style={styles.rememberContainer}
                            onPress={() => setRememberMe(!rememberMe)}
                        >
                            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                                {rememberMe && <View style={styles.checkboxInner} />}
                            </View>
                            <Text style={styles.rememberText}>Remember for 30 days</Text>
                        </Pressable>

                        <BaseButton
                            title="Log In"
                            onPress={handleLogin}
                            loading={loading}
                            icon={ArrowRight}
                            style={styles.loginButton}
                        />

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.divider} />
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <Link href="/register" asChild>
                                <Pressable>
                                    <Text style={styles.linkText}>Create an account</Text>
                                </Pressable>
                            </Link>
                        </View>
                    </View>

                    <View style={styles.bottomLinks}>
                        <Text style={styles.bottomLinkText}>Privacy Policy</Text>
                        <View style={styles.dot} />
                        <Text style={styles.bottomLinkText}>Terms of Service</Text>
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
        paddingTop: theme.spacing.xxl,
        paddingBottom: theme.spacing.xl,
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
    passwordContainer: {
        width: '100%',
    },
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        gap: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary,
    },
    checkboxInner: {
        width: 10,
        height: 10,
        backgroundColor: 'white',
        borderRadius: 2,
    },
    rememberText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    loginButton: {
        marginBottom: theme.spacing.xl,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        gap: 12,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.border,
    },
    dividerText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    footerText: {
        fontSize: 15,
        color: theme.colors.textSecondary,
    },
    linkText: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    bottomLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    bottomLinkText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.placeholder,
    },
});
