import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { theme } from '../constants/theme';
import { AuthProvider } from '../context/AuthContext';

export default function Layout() {
    return (
        <AuthProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.background },
                }}
            />
        </AuthProvider>
    );
}
