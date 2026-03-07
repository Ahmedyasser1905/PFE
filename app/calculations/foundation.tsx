import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Ruler, Calculator as CalcIcon, RefreshCcw, Landmark } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { BaseInput } from '../../components/BaseInput';
import { BaseButton } from '../../components/BaseButton';

export default function FoundationCalculator() {
    const router = useRouter();
    const [depth, setDepth] = useState('');
    const [perimeter, setPerimeter] = useState('');
    const [width, setWidth] = useState('');
    const [result, setResult] = useState<number | null>(null);

    const calculate = () => {
        const d = parseFloat(depth);
        const p = parseFloat(perimeter);
        const w = parseFloat(width);
        if (d && p && w) {
            setResult(d * p * w);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Foundation Calc</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.label}>Excavation Details (m)</Text>
                    <BaseInput
                        label="Total Perimeter"
                        placeholder="0.00"
                        value={perimeter}
                        onChangeText={setPerimeter}
                        icon={Ruler}
                        keyboardType="numeric"
                    />
                    <BaseInput
                        label="Footing Width"
                        placeholder="0.00"
                        value={width}
                        onChangeText={setWidth}
                        icon={Landmark}
                        keyboardType="numeric"
                    />
                    <BaseInput
                        label="Depth"
                        placeholder="0.00"
                        value={depth}
                        onChangeText={setDepth}
                        icon={Ruler}
                        keyboardType="numeric"
                    />

                    <BaseButton
                        title="Estimate Excavation"
                        onPress={calculate}
                        icon={CalcIcon}
                        style={styles.calcBtn}
                    />
                </View>

                {result !== null && (
                    <View style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.resultLabel}>Soil Volume to Remove</Text>
                            <TouchableOpacity onPress={() => setResult(null)}>
                                <RefreshCcw size={18} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.resultValue}>{result.toFixed(2)} m³</Text>
                        <View style={styles.divider} />
                        <Text style={styles.breakdownTitle}>Estimated Logistics:</Text>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Dumping Truck Trips</Text>
                            <Text style={styles.breakdownValue}>{Math.ceil(result / 10)}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Man Hours (Approx.)</Text>
                            <Text style={styles.breakdownValue}>{(result * 0.8).toFixed(1)} h</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fdf2f8' }, // Slight pink tint for foundation
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
    calcBtn: { marginTop: 12, backgroundColor: '#db2777' }, // Custom color for foundation
    resultCard: {
        marginTop: 24,
        backgroundColor: '#db2777',
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

