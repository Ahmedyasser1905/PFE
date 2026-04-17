import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, ChevronRight, Info } from 'lucide-react-native';
import { theme } from '../../../constants/theme';
import { BaseButton } from '../../../components/BaseButton';
export default function SummaryScreen() {
    const router = useRouter();
    const summaryData = {
        projectName: 'Maison de campagne',
        totalArea: '120 mآ²',
        itemsCount: 4,
        subtotal: '450,000 DA',
        tax: '85,500 DA',
        total: '535,500 DA',
    };
    const handleConfirm = () => {
        router.push('/create-estimate/success');
    };
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Estimate Total</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.summaryCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Summary</Text>
                        <Text style={styles.projectName}>{summaryData.projectName}</Text>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Area</Text>
                            <Text style={styles.statValue}>{summaryData.totalArea}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Items</Text>
                            <Text style={styles.statValue}>{summaryData.itemsCount}</Text>
                        </View>
                    </View>
                    <View style={styles.breakdownContainer}>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Subtotal</Text>
                            <Text style={styles.breakdownValue}>{summaryData.subtotal}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Tax (19%)</Text>
                            <Text style={styles.breakdownValue}>{summaryData.tax}</Text>
                        </View>
                        <View style={[styles.breakdownRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Estimate</Text>
                            <Text style={styles.totalValue}>{summaryData.total}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.infoBox}>
                    <Info size={20} color={theme.colors.primary} />
                    <Text style={styles.infoText}>
                        This estimate is based on average current market prices in Algeria. Actual prices may vary.
                    </Text>
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <BaseButton
                    title="Confirm Estimate"
                    onPress={handleConfirm}
                    icon={CheckCircle2}
                    style={styles.confirmBtn}
                />
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        backgroundColor: 'white',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text,
    },
    scrollContent: {
        padding: theme.spacing.xl,
    },
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: theme.spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        marginBottom: theme.spacing.xl,
    },
    cardHeader: {
        marginBottom: theme.spacing.xl,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    projectName: {
        fontSize: 24,
        fontWeight: '900',
        color: theme.colors.text,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text,
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: theme.colors.border,
    },
    breakdownContainer: {
        gap: 16,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    breakdownLabel: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    breakdownValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    totalRow: {
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border + '50',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    totalValue: {
        fontSize: 22,
        fontWeight: '900',
        color: theme.colors.primary,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primary + '10',
        padding: theme.spacing.lg,
        borderRadius: 16,
        gap: 12,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.primaryDark,
        lineHeight: 18,
    },
    footer: {
        padding: theme.spacing.xl,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border + '30',
    },
    confirmBtn: {
        height: 60,
        borderRadius: 30,
    },
});

