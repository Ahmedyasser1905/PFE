import 'react-native-gesture-handler';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments, Stack, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { theme } from '../constants/theme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const { user, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        if (loading || !navigationState?.key) return;

        const segment = segments[0];
        const isLoginPage = segment === 'login';
        const isRegisterPage = segment === 'register';
        const isForgotPassword = segment === 'forgot-password';
        const isVerifyOtp = segment === 'verify-otp';
        const isResetPassword = segment === 'reset-password';
        const isTerms = segment === 'terms';
        const isPrivacy = segment === 'privacy';

        const isAuthPage = isLoginPage || isRegisterPage || isForgotPassword || isVerifyOtp || isResetPassword || isTerms || isPrivacy;

        if (!user && !isAuthPage) {
            router.replace('/login');
        } else if (user && isAuthPage && !isTerms && !isPrivacy) {
            router.replace('/');
        } else {
            // Instant hide once we are where we need to be
            SplashScreen.hideAsync();
        }
    }, [user, loading, segments, router, navigationState?.key]);

    // Anti-flicker logic: show LoadingScreen overlay until the route matches the auth state
    const segment = segments[0];
    const isAuthPage = ['login', 'register', 'forgot-password', 'verify-otp', 'reset-password', 'terms', 'privacy'].includes(segment);
    const shouldRedirect = (!user && !isAuthPage) || (user && isAuthPage && !['terms', 'privacy'].includes(segment));

    const showOverlay = loading || !navigationState?.key || shouldRedirect;

    return (
        <View style={{ flex: 1 }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.background },
                }}
            />
            {showOverlay && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999
                }}>
                    <LoadingScreen />
                </View>
            )}
        </View>
    );
}

export default function Layout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <RootLayoutNav />
            </AuthProvider>
        </GestureHandlerRootView>
    );
}

