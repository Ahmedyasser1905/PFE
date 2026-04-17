import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Layout, Smartphone, Calculator as CalcIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';
import { BaseInput } from '../../../components/BaseInput';
import { BaseButton } from '../../../components/BaseButton';
export default function InteriorCalculator() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'flooring' | 'ceiling'>('flooring');
    const [area, setArea] = useState('');
    const [result, setResult] = useState<any>(null);
    const calculate = () => {
        const a = parseFloat(area);
        if (!a) return;
        setResult({
            quantity: Math.ceil(a * 1.05),
            materials: activeTab === 'flooring' ? 'Vinyl/Parquet Planks' : 'Gypsum Boards'
        });
    };
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Interior Calc</Text>
                <View style={{ width: 40 }} />
            </View>
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'flooring' && styles.activeTab]}
                    onPress={() => setActiveTab('flooring')}
                >
                    <Text style={[styles.tabLabel, activeTab === 'flooring' && styles.activeTabLabel]}>Flooring</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'ceiling' && styles.activeTab]}
                    onPress={() => setActiveTab('ceiling')}
                >
                    <Text style={[styles.tabLabel, activeTab === 'ceiling' && styles.activeTabLabel]}>Ceiling</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <BaseInput
                        label="Room Surface Area (mآ²)"
                        placeholder="0.00"
                        value={area}
                        onChangeText={setArea}
                        icon={Layout}
                        keyboardType="numeric"
                    />
                    <BaseButton
                        title={`Calculate ${activeTab}`}
                        onPress={calculate}
                        style={styles.calcBtn}
                    />
                </View>
                {result && (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultLabel}>Required Inventory</Text>
                        <Text style={styles.resultValue}>{result.quantity} mآ²</Text>
                        <Text style={styles.resultSub}>{result.materials}</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f3ff' },
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
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
    },
    activeTab: { backgroundColor: '#7c3aed' },
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
    calcBtn: { marginTop: 12, backgroundColor: '#7c3aed' },
    resultCard: {
        marginTop: 24,
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#7c3aed',
    },
    resultLabel: { color: theme.colors.textSecondary, fontWeight: '600', marginBottom: 8 },
    resultValue: { color: '#7c3aed', fontSize: 32, fontWeight: '800' },
    resultSub: { color: theme.colors.placeholder, marginTop: 4, fontWeight: '600' },
});


