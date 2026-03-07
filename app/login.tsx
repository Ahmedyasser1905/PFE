import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight, Globe, Settings as SettingsIcon, X } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { Logo } from '../components/Logo';
import { BaseInput } from '../components/BaseInput';
import { BaseButton } from '../components/BaseButton';
import { Modal } from 'react-native';

import { authApi, updateApiBaseUrl } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [serverIp, setServerIp] = useState('');
    const { login, getInitialRoute } = useAuth();
    const router = useRouter();

    const handleSaveSettings = async () => {
        if (!serverIp) return;

        let formattedUrl = serverIp.trim();
        // Add http if missing
        if (!formattedUrl.startsWith('http')) {
            formattedUrl = `http://${formattedUrl}`;
        }
        // Add /api if missing
        if (!formattedUrl.endsWith('/api')) {
            formattedUrl = `${formattedUrl}/api`;
        }

        try {
            await storage.setItem('customServerUrl', formattedUrl);
            updateApiBaseUrl(formattedUrl);
            setShowSettings(false);
            alert('Server settings updated!');
        } catch (error) {
            alert('Failed to save settings');
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            return;
        }

        try {
            setLoading(true);
            const response = await authApi.login({ email, password });
            const { user, token } = response.data;
            await login(user, token);
            // After login, AuthContext/RootLayout will handle the redirect to index
            router.replace('/');
        } catch (error: any) {
            alert('Login failed: ' + (error.response?.data?.message || 'Server error'));
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
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Pressable
                            style={styles.settingsToggle}
                            onPress={() => setShowSettings(true)}
                        >
                            <Globe size={24} color={theme.colors.textSecondary} />
                        </Pressable>
                        {/* Logo removed per user request */}
                    </View>

                    {/* Server Settings Modal */}
                    <Modal
                        visible={showSettings}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setShowSettings(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Server Settings</Text>
                                    <Pressable onPress={() => setShowSettings(false)}>
                                        <X size={24} color={theme.colors.text} />
                                    </Pressable>
                                </View>

                                <Text style={styles.modalSubtitle}>
                                    Enter your computer's IP address (e.g. 192.168.1.9) or an ngrok URL.
                                </Text>

                                <BaseInput
                                    label="Server URL/IP"
                                    placeholder="192.168.1.9:5000"
                                    icon={SettingsIcon}
                                    value={serverIp}
                                    onChangeText={setServerIp}
                                    autoCapitalize="none"
                                />

                                <BaseButton
                                    title="Save & Refresh"
                                    onPress={handleSaveSettings}
                                    style={styles.modalButton}
                                />
                            </View>
                        </View>
                    </Modal>

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
                                <Text style={styles.label}></Text>
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
                        <Link href="/privacy" asChild>
                            <Pressable>
                                <Text style={styles.bottomLinkText}>Privacy Policy</Text>
                            </Pressable>
                        </Link>
                        <View style={styles.dot} />
                        <Link href="/terms" asChild>
                            <Pressable>
                                <Text style={styles.bottomLinkText}>Terms of Service</Text>
                            </Pressable>
                        </Link>
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
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    settingsToggle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.border + '30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: theme.spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
    },
    modalSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xl,
        lineHeight: 20,
    },
    modalButton: {
        marginTop: theme.spacing.md,
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

