import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { Logo } from '../components/Logo';
import { BaseInput } from '../components/BaseInput';
import { BaseButton } from '../components/BaseButton';

import { authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login, user, loading: authLoading, getInitialRoute } = useAuth();

    useEffect(() => {
        if (user && !authLoading) {
            router.replace(getInitialRoute());
        }
    }, [user, authLoading]);

    const handleRegister = async () => {
        // Validation
        if (!fullName || !email || !password) {
            alert('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (!agreed) {
            alert('You must agree to the Terms and Conditions');
            return;
        }

        try {
            setLoading(true);
            console.log('📤 Sending registration request to:', authApi.register);
            const response = await authApi.register({ fullName, email, password });
            console.log('✅ Registration success:', response.data);
            await login(response.data);
            alert('Account created successfully!');
            router.replace(getInitialRoute(response.data.role));
        } catch (error: any) {
            console.error('❌ Registration failed:', error.response?.data?.message || error.message);
            const errorMsg = error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'Request timed out' : error.message);
            alert('Registration failed: ' + errorMsg);
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
                        <Logo size="md" />
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>Create your account</Text>
                        <Text style={styles.subtitle}>
                            Start managing your construction projects today.
                        </Text>

                        <BaseInput
                            label="Full Name"
                            placeholder="John Doe"
                            icon={User}
                            value={fullName}
                            onChangeText={setFullName}
                        />

                        <BaseInput
                            label="Email Address"
                            placeholder="john@example.com"
                            icon={Mail}
                            value={email}
                            onChangeText={setEmail}
                        />

                        <BaseInput
                            label="Password"
                            placeholder="••••••••"
                            icon={Lock}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <BaseInput
                            label="Confirm Password"
                            placeholder="••••••••"
                            icon={Lock}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />

                        <Pressable
                            style={styles.agreeContainer}
                            onPress={() => setAgreed(!agreed)}
                        >
                            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                                {agreed && <View style={styles.checkboxInner} />}
                            </View>
                            <Text style={styles.agreeText}>
                                I agree to the <Text style={styles.linkTextInline}>Terms and Conditions</Text> and <Text style={styles.linkTextInline}>Privacy Policy</Text>.
                            </Text>
                        </Pressable>

                        <BaseButton
                            title="Create Account"
                            onPress={handleRegister}
                            loading={loading}
                            icon={ArrowRight}
                            style={styles.registerButton}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <Link href="/" asChild>
                                <Pressable>
                                    <Text style={styles.linkText}>Login</Text>
                                </Pressable>
                            </Link>
                        </View>
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
    header: {
        marginBottom: theme.spacing.xl,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        lineHeight: 24,
        marginBottom: theme.spacing.xl,
    },
    agreeContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.xl,
        gap: 10,
        marginTop: theme.spacing.sm,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10, // Rounded in image
        borderWidth: 2,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        borderColor: theme.colors.primary,
    },
    checkboxInner: {
        width: 10,
        height: 10,
        backgroundColor: theme.colors.primary,
        borderRadius: 5,
    },
    agreeText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        flex: 1,
        lineHeight: 20,
    },
    linkTextInline: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    registerButton: {
        marginBottom: theme.spacing.xl,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
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
});
