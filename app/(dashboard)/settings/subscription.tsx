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
    ViewStyle,
    TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Crown, Calendar, Cpu, BarChart3, Layers } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '~/constants/theme';
import { useSubscription } from '~/hooks/useSubscription';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    } as ViewStyle,
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    } as TextStyle,
    scroll: {
        padding: theme.spacing.lg,
        paddingBottom: 80,
    } as ViewStyle,
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    loadingText: {
        marginTop: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    } as TextStyle,

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
    } as ViewStyle,
    noSubTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
    } as TextStyle,
    noSubDesc: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 8,
    } as TextStyle,

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
    } as ViewStyle,
    planTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    } as ViewStyle,
    currentPlanLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: theme.colors.primary,
        letterSpacing: 0.8,
    } as TextStyle,
    activeBadge: {
        backgroundColor: theme.colors.successLight,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    } as ViewStyle,
    activeBadgeText: {
        color: theme.colors.success,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    } as TextStyle,
    inactiveBadge: {
        backgroundColor: theme.colors.warningLight,
    } as ViewStyle,
    inactiveBadgeText: {
        color: theme.colors.warning,
    } as TextStyle,
    planName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 8,
    } as TextStyle,
    planDesc: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 21,
        marginBottom: 20,
    } as TextStyle,
    divider: {
        height: 1,
        backgroundColor: theme.colors.divider,
        marginBottom: 16,
    } as ViewStyle,
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    } as ViewStyle,
    infoRight: {
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,
    infoKey: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    } as TextStyle,
    infoValue: {
        fontSize: 14,
        color: theme.colors.text,
        fontWeight: '500',
    } as TextStyle,
    infoValueBold: {
        fontWeight: '700',
    } as TextStyle,
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
    } as ViewStyle,
    switchBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    } as TextStyle,

    // Usage section
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 1,
        marginBottom: 14,
    } as TextStyle,
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
    } as ViewStyle,
    usageRow: {
        gap: 8,
    } as ViewStyle,
    usageLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,
    usageLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    } as TextStyle,
    usageCount: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.primary,
    } as TextStyle,
    usageTrack: {
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
    } as ViewStyle,
    usageFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 4,
    } as ViewStyle,
    usageFillHigh: {
        backgroundColor: '#f59e0b',
    } as ViewStyle,

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
    } as ViewStyle,
    tileIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    } as ViewStyle,
    tileLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    } as TextStyle,
    tileValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0f172a',
    } as TextStyle,

    // Error
    errorCard: {
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#fee2e2',
    } as ViewStyle,
    errorText: {
        color: '#991b1b',
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    } as TextStyle,
});

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
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading subscription...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
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
                        <Crown size={48} color={theme.colors.textMuted} />
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
