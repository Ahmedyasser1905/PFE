import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Box, Calculator as CalcIcon, RefreshCcw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';
import { BaseInput } from '../../../components/BaseInput';
import { BaseButton } from '../../../components/BaseButton';

export default function ConcreteCalculator() {
    const router = useRouter();
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [thickness, setThickness] = useState('');
    const [result, setResult] = useState<number | null>(null);

    const calculate = () => {
        const l = parseFloat(length);
        const w = parseFloat(width);
        const t = parseFloat(thickness);
        if (l && w && t) {
            setResult(l * w * t);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Concrete Calculator</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.label}>Slab Dimensions (m)</Text>
                    <BaseInput
                        label="Length"
                        placeholder="0.00"
                        value={length}
                        onChangeText={setLength}
                        icon={Box}
                        keyboardType="numeric"
                    />
                    <BaseInput
                        label="Width"
                        placeholder="0.00"
                        value={width}
                        onChangeText={setWidth}
                        icon={Box}
                        keyboardType="numeric"
                    />
                    <BaseInput
                        label="Thickness"
                        placeholder="0.00"
                        value={thickness}
                        onChangeText={setThickness}
                        icon={Box}
                        keyboardType="numeric"
                    />

                    <BaseButton
                        title="Calculate Volume"
                        onPress={calculate}
                        icon={CalcIcon}
                        style={styles.calcBtn}
                    />
                </View>

                {result !== null && (
                    <View style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.resultLabel}>Estimated Volume</Text>
                            <TouchableOpacity onPress={() => setResult(null)}>
                                <RefreshCcw size={18} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.resultValue}>{result.toFixed(2)} m³</Text>
                        <View style={styles.divider} />
                        <Text style={styles.breakdownTitle}>Approximate Mix (M25):</Text>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Cement (bags)</Text>
                            <Text style={styles.breakdownValue}>{(result * 8.5).toFixed(0)}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Sand (m³)</Text>
                            <Text style={styles.breakdownValue}>{(result * 0.45).toFixed(2)}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Aggregates (m³)</Text>
                            <Text style={styles.breakdownValue}>{(result * 0.9).toFixed(2)}</Text>
                        </View>
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
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backBtn: { width: 40 },
    title: { fontSize: 20, fontWeight: '800' },
    content: { padding: theme.spacing.xl },
    card: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    label: { fontSize: 16, fontWeight: '700', marginBottom: 20, color: theme.colors.textSecondary },
    calcBtn: { marginTop: 12 },
    resultCard: {
        marginTop: 24,
        backgroundColor: theme.colors.primary,
        padding: 24,
        borderRadius: 24,
    },
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    resultLabel: { color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
    resultValue: { color: 'white', fontSize: 36, fontWeight: '800' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 20 },
    breakdownTitle: { color: 'white', fontWeight: '700', marginBottom: 16 },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    breakdownLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
    breakdownValue: { color: 'white', fontWeight: '600', fontSize: 14 },
});
