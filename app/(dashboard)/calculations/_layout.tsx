import { Stack } from 'expo-router';

export default function CalculationsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="concrete" />
            <Stack.Screen name="foundation" />
            <Stack.Screen name="structural" />
            <Stack.Screen name="finishes" />
            <Stack.Screen name="openings" />
            <Stack.Screen name="interior" />
        </Stack>
    );
}
