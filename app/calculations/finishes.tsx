import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, PaintBucket, Grid3X3, Layers, Calculator as CalcIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { BaseInput } from '../../components/BaseInput';
import { BaseButton } from '../../components/BaseButton';

type FinishType = 'paint' | 'tiles' | 'plaster';

export default function FinishesCalculator() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<FinishType>('paint');
    const [area, setArea] = useState('');
    const [result, setResult] = useState<any>(null);

    const calculate = () => {
        const a = parseFloat(area);
        if (!a) return;

        if (activeTab === 'paint') {
            setResult({ quantity: a / 10, unit: 'Liters', sub: '2 Coats' });
        } else if (activeTab === 'tiles') {
            setResult({ quantity: Math.ceil(a * 1.1), unit: 'm²', sub: 'incl. 10% waste' });
        } else {
            setResult({ quantity: a * 20, unit: 'kg', sub: '12mm depth' });
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Finishing Calc</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.tabs}>
                {[
                    { id: 'paint', label: 'Paint', icon: PaintBucket },
                    { id: 'tiles', label: 'Tiles', icon: Grid3X3 },
                    { id: 'plaster', label: 'Plaster', icon: Layers },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                        onPress={() => { setActiveTab(tab.id as any); setResult(null); }}
                    >
                        <tab.icon size={18} color={activeTab === tab.id ? 'white' : theme.colors.textSecondary} />
                        <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.label}>Surface Area</Text>
                    <BaseInput
                        label="Total Area (m²)"
                        placeholder="0.00"
                        value={area}
                        onChangeText={setArea}
                        icon={CalcIcon}
                        keyboardType="numeric"
                    />
                    <BaseButton
                        title={`Calculate ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                        onPress={calculate}
                        style={styles.calcBtn}
                    />
                </View>

                {result && (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultLabel}>Required Material</Text>
                        <Text style={styles.resultValue}>{result.quantity.toFixed(1)} {result.unit}</Text>
                        <Text style={styles.resultSub}>{result.sub}</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
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
    activeTab: { backgroundColor: '#b91c1c' },
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
    label: { fontSize: 16, fontWeight: '700', marginBottom: 20 },
    calcBtn: { marginTop: 12, backgroundColor: '#b91c1c' },
    resultCard: {
        marginTop: 24,
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#b91c1c',
    },
    resultLabel: { color: theme.colors.textSecondary, fontWeight: '600', marginBottom: 8 },
    resultValue: { color: '#b91c1c', fontSize: 32, fontWeight: '800' },
    resultSub: { color: theme.colors.placeholder, marginTop: 4, fontWeight: '600' },
});

