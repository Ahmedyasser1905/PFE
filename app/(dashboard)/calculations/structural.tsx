import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Hammer, Calculator as CalcIcon, RefreshCcw, Weight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';
import { BaseInput } from '../../../components/BaseInput';
import { BaseButton } from '../../../components/BaseButton';
export default function StructuralCalculator() {
    const router = useRouter();
    const [sqm, setSqm] = useState('');
    const [result, setResult] = useState<number | null>(null);
    const calculate = () => {
        const area = parseFloat(sqm);
        if (area) {
            setResult(area * 78.5); 
        }
    };
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Structural Estimator</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.label}>Building Surface Area</Text>
                    <BaseInput
                        label="Total Area (mآ²)"
                        placeholder="0.00"
                        value={sqm}
                        onChangeText={setSqm}
                        icon={Weight}
                        keyboardType="numeric"
                    />
                    <BaseButton
                        title="Estimate Steel"
                        onPress={calculate}
                        icon={Hammer}
                        style={styles.calcBtn}
                    />
                </View>
                {result !== null && (
                    <View style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.resultLabel}>Estimated Rebar Weight</Text>
                            <TouchableOpacity onPress={() => setResult(null)}>
                                <RefreshCcw size={18} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.resultValue}>{result.toFixed(0)} kg</Text>
                        <View style={styles.divider} />
                        <Text style={styles.breakdownTitle}>Approximate Specs:</Text>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>12mm Bars (pcs)</Text>
                            <Text style={styles.breakdownValue}>{Math.ceil(result * 0.4 / 10)}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>10mm Bars (pcs)</Text>
                            <Text style={styles.breakdownValue}>{Math.ceil(result * 0.35 / 7)}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Total Cost (Est.)</Text>
                            <Text style={styles.breakdownValue}>${(result * 0.95).toFixed(2)}</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#eff6ff' },
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
    calcBtn: { marginTop: 12, backgroundColor: '#1e3a8a' },
    resultCard: {
        marginTop: 24,
        backgroundColor: '#1e3a8a',
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


