import 'react-native-gesture-handler';
import { View, StyleSheet } from 'react-native';
import { useRouter, useSegments, Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { theme } from '../constants/theme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { SplashScreenComponent } from '../components/SplashScreenComponent';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const { user, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        async function hideNative() {
            try {
                await SplashScreen.hideAsync();
            } catch (e) {
                console.warn('[Layout] Error hiding native splash:', e);
            }
        }
        hideNative();
    }, []);

    useEffect(() => {
        // Wait until mounted to prevent "Attempted to navigate before mounting"
        if (!isMounted || loading) return;

        const initializeApp = async () => {
            try {
                const hasCompletedValue = await storage.getItem('hasCompletedOnboarding_v6');
                const hasCompleted = hasCompletedValue === 'true';
                
                // If the app is using groupings (e.g. (auth)), segments[0] is '(auth)'
                const segment = segments[0] || '';
                const isAuthRoute = segment === '(auth)' || [
                    'login', 'register', 'forgot-password', 'verify-otp', 'reset-password'
                ].includes(segment);
                
                const isOnboardingRoute = segment === 'onboarding';

                if (!user) {
                    if (!hasCompleted && !isOnboardingRoute) {
                        router.replace('/(auth)/onboarding');
                    } else if (hasCompleted && !isAuthRoute) {
                        router.replace('/(auth)/login');
                    }
                } else if (isAuthRoute || isOnboardingRoute) {
                    // Redirect authenticated users trying to access auth/onboarding to dashboard
                    router.replace('/(dashboard)');
                }
            } catch (err) {
                console.error('[Layout] Critical initialization error:', err);
            }
        };

        initializeApp();
    }, [user, loading, isMounted, segments, router]);

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Slot />
            
            {loading && splashAnimationFinished && <LoadingOverlay />}
            
            {!splashAnimationFinished && (
                <View
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: '#ffffff',
                        zIndex: 9999,
                    }}
                >
                    <SplashScreenComponent
                        onAnimationComplete={() => {
                            console.log('[Layout] Custom splash animation complete.');
                            setSplashAnimationFinished(true);
                        }}
                    />
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
