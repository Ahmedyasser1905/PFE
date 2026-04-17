import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight, X } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { Logo } from '../../components/Logo';
import { BaseInput } from '../../components/BaseInput';
import { BaseButton } from '../../components/BaseButton';
import { authApi, updateApiBaseUrl } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
export default function LoginScreen() {
    const params = useLocalSearchParams();
    const [showLoginForm, setShowLoginForm] = useState(params.mode === 'form');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const handleLogin = async () => {
        if (!email || !password) return;
        try {
            setLoading(true);
            const response = await authApi.login({ email, password });
            const { user, token } = response.data;
            await login(user, token);
            router.replace('/');
        } catch (error: any) {
            alert('Login failed: ' + (error.response?.data?.message || 'Server error'));
        } finally {
            setLoading(false);
        }
    };
    if (!showLoginForm) {
        return (
            <>
                <StatusBar barStyle="light-content" />
                <View style={styles.landingContainer}>
                    <View style={styles.landingHeader}>
                        <Logo size="lg" style={styles.landingLogo} />
                        <View style={styles.landingContent}>
                            <Text style={styles.landingOverline}>Calculateur de construction</Text>
                            <Text style={styles.landingTitle}>The construction expert</Text>
                        </View>
                    </View>
                    <View style={styles.landingFooter}>
                        <BaseButton 
                            title="Get started" 
                            onPress={() => router.push('/register')}
                            style={styles.getStartedBtn}
                            textStyle={styles.getStartedBtnText}
                        />
                        <TouchableOpacity 
                            style={styles.loginLink}
                            onPress={() => setShowLoginForm(true)}
                        >
                            <Text style={styles.loginLinkText}>
                                Log in
                            </Text>
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
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Pressable onPress={() => setShowLoginForm(false)} style={styles.backBtn}>
                            <X size={24} color={theme.colors.text} />
                        </Pressable>
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
                            <BaseInput
                                label="Password"
                                placeholder="enter your password"
                                icon={Lock}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                            <Link href="/forgot-password" asChild>
                                <Pressable style={styles.forgotPasswordPressable}>
                                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                                </Pressable>
                            </Link>
                        </View>
                        <TouchableOpacity 
                            style={styles.rememberContainer}
                            onPress={() => setRememberMe(!rememberMe)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                                {rememberMe && <View style={styles.checkboxInner} />}
                            </View>
                            <Text style={styles.rememberText}>Remember for 30 days</Text>
                        </TouchableOpacity>
                         <BaseButton
                            title="Log In"
                            onPress={handleLogin}
                            loading={loading}
                            icon={ArrowRight}
                            style={styles.loginButton}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    landingContainer: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        justifyContent: 'space-between',
        padding: theme.spacing.xl,
    },
    landingHeader: {
        marginTop: 60,
    },
    landingLogo: {
        marginBottom: 40,
    },
    landingContent: {
        marginTop: 20,
    },
    landingOverline: {
        color: 'white',
        fontSize: 18,
        opacity: 0.8,
        fontWeight: '500',
    },
    landingTitle: {
        color: 'white',
        fontSize: 48,
        fontWeight: '900',
        lineHeight: 56,
        letterSpacing: -1.5,
        marginTop: 8,
    },
    landingFooter: {
        marginBottom: 40,
        gap: 20,
    },
    getStartedBtn: {
        backgroundColor: 'white',
        height: 60,
        borderRadius: 30,
    },
    getStartedBtnText: {
        color: theme.colors.primary,
        fontSize: 18,
        fontWeight: '800',
    },
    loginLink: {
        alignItems: 'center',
    },
    loginLinkText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    backBtn: {
        padding: 8,
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
        marginBottom: theme.spacing.xl,
    },
    forgotPasswordPressable: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    loginButton: {
        height: 56,
        borderRadius: 28,
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    checkboxActive: {
        borderColor: theme.colors.primary,
    },
    checkboxInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.primary,
    },
    rememberText: {
        marginLeft: 10,
        fontSize: 15,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
});
