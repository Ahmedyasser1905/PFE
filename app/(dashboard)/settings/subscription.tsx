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
import { ArrowLeft, Crown, Calendar, Cpu, BarChart3, Layers } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '~/constants/theme';
import { useSubscription } from '~/hooks/useSubscription';

// ─── Reusable stat tile ───────────────────────────────────────────────────────
type StatTileProps = {
    label: string;
    value: string;
    icon: React.ReactNode;
};

const StatTile: React.FC<StatTileProps> = ({ label, value, icon }) => (
    <View style={styles.tile}>
        <View style={styles.tileIconRow}>
            {icon}
            <Text style={styles.tileLabel}>{label}</Text>
        </View>
        <Text style={styles.tileValue}>{value}</Text>
    </View>
);

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
                <View style={[styles.usageFill, { width: `${pct}%` }, isHigh && styles.usageFillHigh]} />
            </View>
        </View>
    );
};

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function ActivePlanScreen() {
    const router = useRouter();
    const { subscription, usage, loading, error, hasSubscription, refresh } = useSubscription();

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={22} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Subscription</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading subscription...</Text>
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
                <Text style={styles.headerTitle}>My Subscription</Text>
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
                        <Crown size={48} color={theme.colors.muted} />
                        <Text style={styles.noSubTitle}>No Active Plan</Text>
                        <Text style={styles.noSubDesc}>
                            Subscribe to a plan to unlock projects, AI assistance, and estimation tools.
                        </Text>
                        <TouchableOpacity
                            style={styles.switchBtn}
                            activeOpacity={0.85}
                            onPress={() => router.push('/settings/plans')}
                        >
                            <Crown size={18} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.switchBtnText}>Choose a Plan</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* ── Current Plan Card ── */}
                        <View style={styles.planCard}>
                            <View style={styles.planTopRow}>
                                <Text style={styles.currentPlanLabel}>CURRENT PLAN</Text>
                                <View style={[
                                    styles.activeBadge,
                                    subscription?.subscriptionStatus !== 'ACTIVE' && styles.inactiveBadge
                                ]}>
                                    <Text style={[
                                        styles.activeBadgeText,
                                        subscription?.subscriptionStatus !== 'ACTIVE' && styles.inactiveBadgeText
                                    ]}>
                                        {subscription?.subscriptionStatus || 'UNKNOWN'}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.planName}>
                                {subscription?.planName || 'Unknown Plan'}
                            </Text>

                            {subscription?.planType && (
                                <Text style={styles.planDesc}>
                                    Plan Type: {subscription.planType}
                                </Text>
                            )}

                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <Text style={styles.infoKey}>Start Date</Text>
                                <View style={styles.infoRight}>
                                    <Calendar size={14} color={theme.colors.textSecondary} style={{ marginRight: 5 }} />
                                    <Text style={styles.infoValue}>{formatDate(subscription?.startDate || null)}</Text>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoKey}>End Date</Text>
                                <Text style={[styles.infoValue, styles.infoValueBold]}>
                                    {formatDate(subscription?.endDate || null)}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.switchBtn}
                                activeOpacity={0.85}
                                onPress={() => router.push('/settings/plans')}
                            >
                                <Crown size={18} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.switchBtnText}>Switch Plan</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ── Usage Section ── */}
                        {usage && (
                            <>
                                <Text style={styles.sectionTitle}>USAGE</Text>
                                <View style={styles.usageCard}>
                                    <UsageBar
                                        label="Projects"
                                        used={usage.projectsLimit.used}
                                        limit={usage.projectsLimit.limit}
                                        icon={<Crown size={14} color={theme.colors.primary} style={{ marginRight: 6 }} />}
                                    />
                                    <UsageBar
                                        label="AI Requests"
                                        used={usage.aiUsageLimit.used}
                                        limit={usage.aiUsageLimit.limit}
                                        icon={<Cpu size={14} color={theme.colors.primary} style={{ marginRight: 6 }} />}
                                    />
                                    <UsageBar
                                        label="Estimations"
                                        used={usage.leafCalculationsLimit.used}
                                        limit={usage.leafCalculationsLimit.limit}
                                        icon={<Layers size={14} color={theme.colors.primary} style={{ marginRight: 6 }} />}
                                    />
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
    },
    loadingText: {
        marginTop: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },

    // No subscription
    noSubCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
    },
    noSubTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
    },
    noSubDesc: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 8,
    },

    // Plan card
    planCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
        marginBottom: 32,
    },
    planTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    currentPlanLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: theme.colors.primary,
        letterSpacing: 0.8,
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
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    inactiveBadge: {
        backgroundColor: '#fef3c7',
    },
    inactiveBadgeText: {
        color: '#d97706',
    },
    planName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 8,
    },
    planDesc: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 21,
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoKey: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: theme.colors.text,
        fontWeight: '500',
    },
    infoValueBold: {
        fontWeight: '700',
    },
    switchBtn: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
    },
    switchBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },

    // Usage section
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 1,
        marginBottom: 14,
    },
    usageCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        gap: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
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
        fontWeight: '600',
        color: '#334155',
    },
    usageCount: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    usageTrack: {
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    usageFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 4,
    },
    usageFillHigh: {
        backgroundColor: '#f59e0b',
    },

    // Tiles
    tile: {
        width: '47.5%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    tileIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tileLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    tileValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0f172a',
    },

    // Error
    errorCard: {
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    errorText: {
        color: '#991b1b',
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },
});
