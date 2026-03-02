import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react-native';
import { theme } from '../../../constants/theme';
import { BaseInput } from '../../../components/BaseInput';
import { BaseButton } from '../../../components/BaseButton';

export default function ChangePassword() {
    const router = useRouter();
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Security</Text>
                <View style={{ width: 40 }} />
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
                    title="Update Password"
                    onPress={() => router.back()}
                    style={styles.btn}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backBtn: { width: 40 },
    title: { fontSize: 20, fontWeight: '800' },
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
