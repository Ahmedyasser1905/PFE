import 'react-native-gesture-handler';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useSegments, Slot, useRootNavigationState } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { theme } from '~/constants/theme';
import { AuthProvider, useAuth } from '~/context/AuthContext';
import { LanguageProvider, useLanguage } from '~/context/LanguageContext';
import { SubscriptionProvider } from '~/context/SubscriptionContext';
import { FeedbackProvider } from '~/context/FeedbackContext';
import { storage } from '~/utils/storage';
import { SplashScreenComponent } from '~/components/common/SplashScreenComponent';
import { STORAGE_KEYS } from '~/constants/config';

// Prevent the native splash screen from auto-hiding before we are ready
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const { user, loading: authLoading, isLoggingIn } = useAuth();
    const { language } = useLanguage();
    const segments = useSegments();
    const router = useRouter();
    const rootNavigationState = useRootNavigationState();

    const [isAppReady, setIsAppReady] = useState(false);
    const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    // Prevents multiple redirect loops during authentication state transitions
    const isNavigating = React.useRef(false);

    useEffect(() => {
        setIsMounted(true);
        async function hideNativeSplash() {
            try {
                await SplashScreen.hideAsync();
            } catch (e) {
                console.warn('[Layout] Native splash hide error:', e);
            }
        }
        hideNativeSplash();
    }, []);

    useEffect(() => {
        if (!isMounted || authLoading || isLoggingIn) return;
        if (!rootNavigationState?.key) return;

        const protectRoutes = async () => {
            // Guard: prevent navigation if a redirect is already in flight.
            // This prevents the 'stale' property crash on NativeStackNavigator.
            if (isNavigating.current) return;
            try {
                const inAuthGroup = segments[0] === '(auth)';
                const isRoot = !segments[0] || segments[0] === 'index';
                const hasCompletedOnboarding = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';

                console.log('[Layout] Protecting:', { 
                    segments, 
                    hasUser: !!user, 
                    inAuthGroup, 
                    isRoot, 
                    hasCompletedOnboarding 
                });

                // Defer all navigation by one JS tick to let the Navigator
                // fully hydrate its state before receiving a replace command.
                await new Promise<void>(resolve => setTimeout(resolve, 0));

                if (!user) {
                    if (!hasCompletedOnboarding && segments[0] !== 'onboarding') {
                        console.log('[Layout] Redirecting to onboarding');
                        isNavigating.current = true;
                        router.replace('/(auth)/onboarding');
                    } else if (hasCompletedOnboarding && !inAuthGroup) {
                        console.log('[Layout] Redirecting to login');
                        isNavigating.current = true;
                        router.replace('/(auth)/login');
                    }
                } else if (user) {
                    if (inAuthGroup || segments[0] === 'onboarding' || isRoot) {
                        console.log('[Layout] Redirecting to dashboard');
                        isNavigating.current = true;
                        router.replace('/(dashboard)');
                    }
                }

                if (!isAppReady) setIsAppReady(true);
            } catch (err) {
                console.error('[Layout] Protection logic error:', err);
                setIsAppReady(true); // Don't block app forever
            } finally {
                // Reset navigation lock after a short delay so the next
                // state change can trigger a redirect if needed.
                setTimeout(() => { isNavigating.current = false; }, 500);
            }
        };

        protectRoutes();
    }, [user, authLoading, segments, isMounted, rootNavigationState?.key]);

    const showContent = !authLoading && isAppReady && splashAnimationFinished;

    return (
        <View 
            style={{ flex: 1, backgroundColor: theme.colors.background }}
        >
            <Slot />

            {!splashAnimationFinished && (
                <View style={styles.splashOverlay}>
                    <SplashScreenComponent
                        onAnimationComplete={() => {
                            setSplashAnimationFinished(true);
                        }}
                    />
                </View>
            )}

            {!showContent && splashAnimationFinished && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={theme.colors.primary} size="large" />
                </View>
            )}
        </View>
    );
}

export default function Layout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <FeedbackProvider>
                <AuthProvider>
                    <LanguageProvider>
                        <SubscriptionProvider>
                            <RootLayoutNav />
                        </SubscriptionProvider>
                    </LanguageProvider>
                </AuthProvider>
            </FeedbackProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    splashOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#ffffff',
        zIndex: 9999,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
    }
});
