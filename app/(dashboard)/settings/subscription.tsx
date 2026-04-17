import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Crown, Calendar, Users, Cpu, HeadphonesIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';

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

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function ActivePlanScreen() {
    const router = useRouter();

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
            >
                {/* ── Current Plan Card ── */}
                <View style={styles.planCard}>
                    {/* Top row: label + ACTIVE badge */}
                    <View style={styles.planTopRow}>
                        <Text style={styles.currentPlanLabel}>CURRENT PLAN</Text>
                        <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>ACTIVE</Text>
                        </View>
                    </View>

                    {/* Plan name */}
                    <Text style={styles.planName}>Pro Analytics Plus</Text>

                    {/* Description */}
                    <Text style={styles.planDesc}>
                        Full access to advanced construction analytics, real-time tracking, and
                        automated reporting tools.
                    </Text>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Billing info rows */}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoKey}>Billing Cycle</Text>
                        <View style={styles.infoRight}>
                            <Calendar size={14} color={theme.colors.textSecondary} style={{ marginRight: 5 }} />
                            <Text style={styles.infoValue}>Annual</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoKey}>Period</Text>
                        <Text style={[styles.infoValue, styles.infoValueBold]}>
                            Jan 01, 2024 – Jan 01, 2025
                        </Text>
                    </View>

                    {/* Switch Plan button — navigates to ChoosePlanScreen */}
                    <TouchableOpacity
                        style={styles.switchBtn}
                        activeOpacity={0.85}
                        onPress={() => router.push('/settings/plans')}
                    >
                        <Crown size={18} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.switchBtnText}>Switch Plan</Text>
                    </TouchableOpacity>


                </View>

                {/* ── Plan Limits ── */}
                <Text style={styles.sectionTitle}>PLAN LIMITS</Text>
                <View style={styles.tilesGrid}>
                    <StatTile
                        label="Projects Created"
                        value="3 / 20"
                        icon={<Crown size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />}
                    />
                    <StatTile
                        label="AI Requests Used"
                        value="45 / 500"
                        icon={<Cpu size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />}
                    />
                    <StatTile
                        label="Team Members"
                        value="25 Seats"
                        icon={<Users size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />}
                    />
                    <StatTile
                        label="Support"
                        value="Priority"
                        icon={<HeadphonesIcon size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />}
                    />
                </View>
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
        marginBottom: 16,
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
    cancelText: {
        color: '#ef4444',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    },

    // Limits section
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 1,
        marginBottom: 14,
    },
    tilesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
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
});
