import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Zap, Compass } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';
const PLANS = [
    {
        id: 'normal',
        name: 'Normal User',
        displayName: 'Free',
        price: 'Free',
        period: '',
        description: 'Perfect for independent contractors.',
        buttonText: 'Select Normal',
        features: [
            'Up to 3 projects',
            'Main modules access',
            '20 AI requests per day',
            'PDF export',
        ],
        color: theme.colors.primary,
        isFree: true,
    },
    {
        id: 'company',
        name: 'Company',
        displayName: '$99',
        price: '$99',
        period: '/month',
        description: 'For growing teams and enterprises.',
        buttonText: 'Select Company',
        features: [
            'Unlimited projects',
            'Main modules access',
            'Unlimited AI requests',
            'PDF export',
            'External services access',
        ],
        color: theme.colors.primary,
        recommended: true,
    }
];
const COMPARISON_FEATURES = [
    { name: 'Project Creation', normal: 'Up to 3 projects', company: 'Unlimited' },
    { name: 'Main Modules Access', normal: true, company: true },
    { name: 'AI Usage', normal: '20 requests/day', company: 'Unlimited', companySpecial: true },
    { name: 'PDF Export', normal: true, company: true },
    { name: 'External Services', normal: false, company: true },
];
export default function PlansScreen() {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscription Plans</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.intro}>
                    <Text style={styles.title}>Choose Your Plan to Start Building</Text>
                    <Text style={styles.subtitle}>Select the plan that best fits your construction and estimation needs.</Text>
                </View>
                {PLANS.map((plan) => (
                    <View key={plan.id} style={[styles.planCard, plan.recommended && styles.recommendedCard]}>
                        <View style={styles.planHeaderRow}>
                            <View>
                                <Text style={styles.planLabel}>{plan.name}</Text>
                                <Text style={styles.planDesc}>{plan.description}</Text>
                            </View>
                            {plan.recommended && (
                                <View style={styles.recommendedBadge}>
                                    <View style={styles.recommendedBadgeInner}>
                                        <Text style={styles.recommendedText}>RECOMMENDED</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                        <View style={styles.priceSection}>
                            <Text style={styles.price}>{plan.displayName}</Text>
                            {plan.period ? <Text style={styles.period}>{plan.period}</Text> : null}
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.planBtn,
                                plan.isFree ? styles.freeBtn : styles.companyBtn
                            ]}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.planBtnText,
                                plan.isFree ? styles.freeBtnText : styles.companyBtnText
                            ]}>
                                {plan.buttonText}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.featuresList}>
                            {plan.features.map((feature, idx) => (
                                <View key={idx} style={styles.featureItem}>
                                    {feature.includes('AI requests') && plan.id === 'company' ? (
                                        <Zap size={18} color="#f59e0b" fill="#f59e0b" />
                                    ) : feature.includes('External services') ? (
                                        <Compass size={18} color={theme.colors.primary} />
                                    ) : (
                                        <View style={styles.iconCircle}>
                                            <Check size={12} color={theme.colors.primary} strokeWidth={3} />
                                        </View>
                                    )}
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
                <View style={styles.comparisonSection}>
                    <Text style={styles.comparisonTitle}>Compare Plan Features</Text>
                    <View style={styles.table}>
                        {}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.columnHeader, { flex: 1.5, textAlign: 'left' }]}>Features</Text>
                            <Text style={styles.columnHeader}>Normal User</Text>
                            <Text style={[styles.columnHeader, { color: theme.colors.primary }]}>Company</Text>
                        </View>
                        {}
                        {COMPARISON_FEATURES.map((feature, index) => (
                            <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.alternateRow]}>
                                <Text style={[styles.featureName, { flex: 1.5 }]}>{feature.name}</Text>
                                <View style={styles.cell}>
                                    {typeof feature.normal === 'string' ? (
                                        <Text style={styles.cellText}>{feature.normal}</Text>
                                    ) : feature.normal ? (
                                        <Check size={18} color={theme.colors.primary} />
                                    ) : (
                                        <View style={styles.dash} />
                                    )}
                                </View>
                                <View style={styles.compCell}>
                                    {typeof feature.company === 'string' ? (
                                        <View style={styles.companyStringCell}>
                                            {feature.companySpecial && <Zap size={14} color="#f59e0b" fill="#f59e0b" style={{ marginRight: 4 }} />}
                                            <Text style={[styles.cellText, { fontWeight: '700', color: feature.companySpecial ? '#f59e0b' : theme.colors.text }]}>
                                                {feature.company}
                                            </Text>
                                        </View>
                                    ) : feature.company ? (
                                        <Check size={18} color={theme.colors.primary} />
                                    ) : (
                                        <View style={styles.dash} />
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 10 : 0,
        paddingBottom: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        paddingBottom: 80,
    },
    intro: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: '#0f172a',
        textAlign: 'center',
        lineHeight: 42,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 14,
        paddingHorizontal: 25,
        lineHeight: 24,
    },
    planCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    recommendedCard: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    planHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    recommendedBadge: {
        backgroundColor: '#ffedd5',
        borderRadius: 8,
        padding: 1,
    },
    recommendedBadgeInner: {
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    recommendedText: {
        color: '#f97316',
        fontSize: 10,
        fontWeight: '900',
    },
    planLabel: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e40af',
        marginBottom: 6,
    },
    planDesc: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 28,
    },
    price: {
        fontSize: 54,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -1,
    },
    period: {
        fontSize: 18,
        color: '#64748b',
        marginLeft: 4,
        fontWeight: '500',
    },
    planBtn: {
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    freeBtn: {
        backgroundColor: '#eff6ff',
    },
    companyBtn: {
        backgroundColor: theme.colors.primary,
    },
    planBtnText: {
        fontSize: 16,
        fontWeight: '700',
    },
    freeBtnText: {
        color: theme.colors.primary,
    },
    companyBtnText: {
        color: 'white',
    },
    featuresList: {
        gap: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureText: {
        fontSize: 15,
        color: '#334155',
        fontWeight: '500',
    },
    comparisonSection: {
        marginTop: 40,
    },
    comparisonTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 28,
    },
    table: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    columnHeader: {
        flex: 1,
        fontSize: 14,
        fontWeight: '800',
        color: '#475569',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    alternateRow: {
        backgroundColor: '#fbfcfe',
    },
    featureName: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        color: '#334155',
    },
    cell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compCell: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eff6ff50',
    },
    cellText: {
        fontSize: 13,
        color: '#64748b',
        textAlign: 'center',
    },
    companyStringCell: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dash: {
        width: 12,
        height: 2,
        backgroundColor: '#cbd5e1',
        borderRadius: 1,
    }
});

