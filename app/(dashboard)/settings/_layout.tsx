import { Stack } from 'expo-router';
export default function SettingsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="password" />
            <Stack.Screen name="plans" />
            <Stack.Screen name="subscription" />
        </Stack>
    );
}


