import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldAlert } from 'lucide-react-native';
import { theme } from '~/constants/theme';

export default function ChangePassword() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backBtnAction}
                    activeOpacity={0.7}
                >
                    <View style={styles.backBtnIconBox}>
                        <ArrowLeft size={24} color={theme.colors.text} />
                    </View>
                </TouchableOpacity>
                <Text style={styles.titleText}>Security</Text>
                <View style={{ width: 80 }} />
            </View>
            
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <ShieldAlert size={48} color={theme.colors.error} />
                </View>
                <Text style={styles.infoTitle}>Feature Unavailable</Text>
                <Text style={styles.infoSubtitle}>
                    Changing your password from the dashboard is currently not supported.
                    Please log out and use the "Forgot Password" flow from the login screen.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    backBtnAction: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.border + '50', 
    },
    backBtnIconBox: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text,
        flex: 1,
        textAlign: 'center',
        marginRight: -20,
    },
    content: { 
        flex: 1,
        padding: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    infoTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.text, marginBottom: 12 },
    infoSubtitle: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 24 },
});


