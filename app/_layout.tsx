import 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments, Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from '../constants/theme';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutNav() {
    const { user, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(dashboard)';

        console.log('[RootLayout] Auth Check:', {
            authenticated: !!user,
            segment: segments[0] || '/',
            inAuthGroup
        });

        if (!user && inAuthGroup) {
            // Force redirect to login if user is null and in protected area
            console.log('[RootLayout] Access denied, replacing with login');
            router.replace('/');
        } else if (user && !inAuthGroup && (segments[0] === undefined || segments[0] === '')) {
            // Redirect to dashboard if logged in and on the login page
            console.log('[RootLayout] Authenticated, replacing with dashboard');
            router.replace('/(dashboard)');
        }
    }, [user, loading, segments, router]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
            }}
        />
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
