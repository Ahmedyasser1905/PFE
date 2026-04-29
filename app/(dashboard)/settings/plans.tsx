import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Crown, Calendar, Cpu, BarChart3, Layers, Check, CreditCard, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '~/constants/theme';
import { useSubscriptionContext } from '~/context/SubscriptionContext';
import { useLanguage } from '~/context/LanguageContext';

// ─── Usage progress bar ──────────────────────────────────────────────────────
const UsageBar: React.FC<{ used: number; limit: number; label: string; icon: React.ReactNode }> = ({ used, limit, label, icon }) => {
    const pct = limit <= 0 ? 0 : Math.min((used / limit) * 100, 100);
    const isHigh = pct > 80;

    return (
        <View style={styles.usageRow}>
            <View style={styles.usageLabelRow}>
                {icon}
                <Text style={styles.usageLabel}>{label}</Text>
                <Text style={styles.usageCount}>{used} / {limit === -1 ? '∞' : limit}</Text>
            </View>
            <View style={styles.usageTrack}>
                <View style={[styles.usageFill, { width: `${pct}%` as any }, isHigh && styles.usageFillHigh]} />
            </View>
        </View>
    );
};

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function ActivePlanScreen() {
    const router = useRouter();
    const { t, isRTL } = useLanguage();
    const { subscription, usage, loading, error, hasSubscription, refresh } = useSubscriptionContext();

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusText = (status: string) => {
        const s = status.toUpperCase();
        if (s === 'ACTIVE') return t('sub.active');
        if (s === 'INACTIVE') return t('sub.inactive');
        if (s === 'EXPIRED') return t('sub.expired');
        return status;
    };

    if (loading && !subscription) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={22} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('sub.title')}</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>{t('sub.loading')}</Text>
                </View>
            </SafeAreaView>
        );
    }
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backBtn}
                    activeOpacity={0.7}
                >
                    <ArrowLeft size={22} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('sub.title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.colors.primary} />
                }
            >
                {!hasSubscription ? (
                    /* ── No Subscription State ── */
                    <View style={styles.noSubCard}>
                        <View style={styles.noSubIconCircle}>
                            <Crown size={48} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.noSubTitle}>{t('sub.no_active_plan')}</Text>
                        <Text style={styles.noSubDesc}>
                            {t('sub.no_active_desc')}
                        </Text>
                        <TouchableOpacity
                            style={styles.switchBtn}
                            activeOpacity={0.85}
                            onPress={() => router.push('/settings/plans')}
                        >
                            <Crown size={18} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.switchBtnText}>{t('sub.choose_plan')}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* ── Current Plan Card ── */}
                        <View style={styles.planCard}>
                            <View style={styles.planTopRow}>
                                <Text style={styles.currentPlanLabel}>{t('sub.current_plan')}</Text>
                                <View style={[
                                    styles.activeBadge,
                                    subscription?.subscriptionStatus !== 'ACTIVE' && styles.inactiveBadge
                                ]}>
                                    <Text style={[
                                        styles.activeBadgeText,
                                        subscription?.subscriptionStatus !== 'ACTIVE' && styles.inactiveBadgeText
                                    ]}>
                                        {getStatusText(subscription?.subscriptionStatus || 'UNKNOWN')}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.planName}>
                                {subscription?.planName || 'Unknown Plan'}
                            </Text>

                            <View style={styles.priceRow}>
                                <Text style={styles.priceValue}>
                                    {(subscription as any)?.price !== undefined ? `${(subscription as any).price} DA` : '—'}
                                </Text>
                                <Text style={styles.pricePeriod}>
                                    / {(subscription as any)?.billingCycle || 'month'}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.infoGrid}>
                                <View style={styles.infoItem}>
                                    <Calendar size={16} color={theme.colors.textSecondary} />
                                    <View>
                                        <Text style={styles.infoLabel}>{t('sub.start_date')}</Text>
                                        <Text style={styles.infoValue}>{formatDate(subscription?.startDate || null)}</Text>
                                    </View>
                                </View>
                                <View style={styles.infoItem}>
                                    <Calendar size={16} color={theme.colors.primary} />
                                    <View>
                                        <Text style={styles.infoLabel}>{t('sub.end_date')}</Text>
                                        <Text style={[styles.infoValue, { fontWeight: '700', color: theme.colors.primary }]}>
                                            {formatDate(subscription?.endDate || null)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.switchBtn}
                                activeOpacity={0.85}
                                onPress={() => router.push('/settings/plans')}
                            >
                                <Zap size={18} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.switchBtnText}>{t('sub.switch_plan')}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ── Usage Section ── */}
                        {usage && (
                            <>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>{t('sub.usage')}</Text>
                                    <BarChart3 size={16} color="#94a3b8" />
                                </View>
                                <View style={styles.usageCard}>
                                    <UsageBar
                                        label={t('sub.projects')}
                                        used={usage.projectsLimit.used}
                                        limit={usage.projectsLimit.limit}
                                        icon={<Layers size={14} color={theme.colors.primary} style={{ marginRight: 6 }} />}
                                    />
                                    <UsageBar
                                        label={t('sub.ai_requests')}
                                        used={usage.aiUsageLimit.used}
                                        limit={usage.aiUsageLimit.limit}
                                        icon={<Cpu size={14} color={theme.colors.primary} style={{ marginRight: 6 }} />}
                                    />
                                    <UsageBar
                                        label={t('sub.estimations')}
                                        used={usage.leafCalculationsLimit.used}
                                        limit={usage.leafCalculationsLimit.limit}
                                        icon={<BarChart3 size={14} color={theme.colors.primary} style={{ marginRight: 6 }} />}
                                    />
                                </View>

                                </>
                        )}

                        {/* ── Features List ── */}
                        {subscription?.features && Object.keys(subscription.features).length > 0 && (
                            <>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>{t('sub.features')}</Text>
                                    <Check size={16} color="#94a3b8" />
                                </View>
                                <View style={styles.featuresCard}>
                                    {Object.entries(subscription.features).map(([key, val]) => {
                                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                        const displayVal = val === -1 || val === 'unlimited' ? '∞' : val === true ? '' : String(val);
                                        
                                        return (
                                            <View key={key} style={styles.featureItem}>
                                                <View style={styles.featureIconBox}>
                                                    <Check size={12} color="white" strokeWidth={3} />
                                                </View>
                                                <Text style={styles.featureLabel}>{label}</Text>
                                                {displayVal !== '' && (
                                                    <Text style={styles.featureValue}>{displayVal}</Text>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            </>
                        )}
                    </>
                )}

                {error && (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
        paddingBottom: 14,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    scroll: {
        padding: theme.spacing.lg,
        paddingBottom: 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    loadingText: {
        marginTop: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },

    // No subscription
    noSubCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 4,
        marginTop: 20,
    },
    noSubIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    noSubTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 8,
    },
    noSubDesc: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 24,
    },

    // Plan card
    planCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 4,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    planTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    currentPlanLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: theme.colors.primary,
        letterSpacing: 1,
    },
    activeBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    activeBadgeText: {
        color: '#16a34a',
        fontSize: 11,
        fontWeight: '900',
    },
    inactiveBadge: {
        backgroundColor: '#fee2e2',
    },
    inactiveBadgeText: {
        color: '#ef4444',
    },
    planName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    priceValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
    },
    pricePeriod: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 20,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 10,
    },
    infoItem: {
        flex: 1,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
    },
    infoLabel: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 13,
        color: '#334155',
        fontWeight: '700',
    },
    switchBtn: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    switchBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },

    // Sections
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '900',
        color: '#64748b',
        letterSpacing: 1,
    },
    usageCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        gap: 18,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    featuresCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        gap: 14,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureIconBox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureLabel: {
        flex: 1,
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    featureValue: {
        fontSize: 13,
        fontWeight: '800',
        color: theme.colors.primary,
        backgroundColor: '#eff6ff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        overflow: 'hidden',
    },
    usageRow: {
        gap: 8,
    },
    usageLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    usageLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        color: '#334155',
    },
    usageCount: {
        fontSize: 13,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    usageTrack: {
        height: 6,
        backgroundColor: '#f1f5f9',
        borderRadius: 3,
        overflow: 'hidden',
    },
    usageFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 3,
    },
    usageFillHigh: {
        backgroundColor: '#f59e0b',
    },

    // Error
    errorCard: {
        backgroundColor: '#fef2f2',
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    errorText: {
        color: '#991b1b',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
});