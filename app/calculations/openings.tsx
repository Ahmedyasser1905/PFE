import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, DoorOpen, LayoutPanelTop, Calculator as CalcIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { BaseInput } from '../../components/BaseInput';
import { BaseButton } from '../../components/BaseButton';

export default function OpeningsCalculator() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'doors' | 'windows'>('doors');
    const [count, setCount] = useState('');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
        const c = parseInt(count);
        if (!c) return;
        setResult({ total: c, cost: c * (activeTab === 'doors' ? 450 : 280) });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Openings Estimator</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'doors' && styles.activeTab]}
                    onPress={() => setActiveTab('doors')}
                >
                    <DoorOpen size={18} color={activeTab === 'doors' ? 'white' : theme.colors.textSecondary} />
                    <Text style={[styles.tabLabel, activeTab === 'doors' && styles.activeTabLabel]}>Doors</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'windows' && styles.activeTab]}
                    onPress={() => setActiveTab('windows')}
                >
                    <LayoutPanelTop size={18} color={activeTab === 'windows' ? 'white' : theme.colors.textSecondary} />
                    <Text style={[styles.tabLabel, activeTab === 'windows' && styles.activeTabLabel]}>Windows</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <BaseInput
                        label={`Number of ${activeTab}`}
                        placeholder="0"
                        value={count}
                        onChangeText={setCount}
                        icon={CalcIcon}
                        keyboardType="numeric"
                    />
                    <BaseButton
                        title="Estimate Cost"
                        onPress={calculate}
                        style={styles.calcBtn}
                    />
                </View>

                {result && (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultLabel}>Estimated Budget</Text>
                        <Text style={styles.resultValue}>${result.cost.toLocaleString()}</Text>
                        <Text style={styles.resultSub}>Based on standard dimensions</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdf4' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.xl,
        backgroundColor: 'white',
    },
    backBtn: { width: 40 },
    title: { fontSize: 20, fontWeight: '800' },
    tabs: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
    },
    activeTab: { backgroundColor: '#047857' },
    tabLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary },
    activeTabLabel: { color: 'white' },
    content: { padding: theme.spacing.xl },
    card: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    calcBtn: { marginTop: 12, backgroundColor: '#047857' },
    resultCard: {
        marginTop: 24,
        backgroundColor: '#047857',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
    },
    resultLabel: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 8 },
    resultValue: { color: 'white', fontSize: 32, fontWeight: '800' },
    resultSub: { color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: '600' },
});

