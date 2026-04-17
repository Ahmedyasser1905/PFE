import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react-native';
import { theme } from '../../../constants/theme';
import { BaseInput } from '../../../components/BaseInput';
import { BaseButton } from '../../../components/BaseButton';
import { usersApi } from '../../../api/api';

export default function ChangePassword() {
    const router = useRouter();
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        // Client-side validation
        if (!currentPass) {
            Alert.alert('Error', 'Current password is required');
            return;
        }
        if (newPass.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters');
            return;
        }
        if (newPass !== confirmPass) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }
        if (currentPass === newPass) {
            Alert.alert('Error', 'New password must differ from current password');
            return;
        }

        setLoading(true);
        try {
            await usersApi.changePassword({
                currentPassword: currentPass,
                newPassword: newPass,
            });
            Alert.alert('Success', 'Password updated successfully', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'Failed to change password';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

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
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.iconHeader}>
                    <View style={styles.iconCircle}>
                        <ShieldCheck size={32} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.infoTitle}>Change Password</Text>
                    <Text style={styles.infoSubtitle}>Ensure your account stays secure with a strong password.</Text>
                </View>
                <BaseInput
                    label="Current Password"
                    secureTextEntry
                    icon={Lock}
                    value={currentPass}
                    onChangeText={setCurrentPass}
                />
                <View style={styles.divider} />
                <BaseInput
                    label="New Password"
                    secureTextEntry
                    icon={Lock}
                    value={newPass}
                    onChangeText={setNewPass}
                />
                <BaseInput
                    label="Confirm New Password"
                    secureTextEntry
                    icon={Lock}
                    value={confirmPass}
                    onChangeText={setConfirmPass}
                />
                <BaseButton
                    title={loading ? "Updating..." : "Update Password"}
                    onPress={handleChangePassword}
                    style={[styles.btn, loading && { opacity: 0.7 }]}
                    disabled={loading}
                />
            </ScrollView>
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
    content: { padding: theme.spacing.xl },
    iconHeader: { alignItems: 'center', marginBottom: 32 },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
    infoSubtitle: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 },
    divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 12 },
    btn: { marginTop: 24 }
});

