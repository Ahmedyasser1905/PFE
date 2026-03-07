import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Plus,
    CheckCircle2,
    ChevronRight,
    HardHat,
    Calculator,
    Settings
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const stats = [
        { label: 'My Projects', value: '--', icon: HardHat, color: theme.colors.primary },
        { label: 'Calculations', value: '--', icon: Calculator, color: '#10b981' },
        { label: 'Tasks Done', value: '--', icon: CheckCircle2, color: '#6366f1' },
    ];

    const recentActivities: any[] = [];

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>{user?.role?.toUpperCase() || 'MEMBER'}</Text>
                    </View>
                    <Text style={styles.greeting}>Hello, {user?.fullName?.split(' ')[0] || 'Member'}</Text>
                    <Text style={styles.subGreeting}>Welcome back to your workspace.</Text>
                </View>
                <TouchableOpacity
                    style={styles.profileBadge}
                    onPress={() => router.push('/settings')}
                >
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'M'}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.iconBox, { backgroundColor: stat.color + '15' }]}>
                                <stat.icon size={20} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* New Project FAB or call to action could go here if needed, but for now we follow user request to keep bottom clean */}

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.activityList}>
                        {recentActivities.map((activity) => (
                            <TouchableOpacity key={activity.id} style={styles.activityItem}>
                                <View style={styles.activityInfo}>
                                    <Text style={styles.activityTitle}>{activity.title}</Text>
                                    <Text style={styles.activityProject}>{activity.project} • {activity.time}</Text>
                                </View>
                                <ChevronRight size={18} color={theme.colors.border} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
                    <HardHat size={24} color={theme.colors.primary} />
                    <Text style={[styles.navLabel, { color: theme.colors.primary }]}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/projects')}>
                    <CheckCircle2 size={24} color={theme.colors.textSecondary} />
                    <Text style={styles.navLabel}>Projects</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navItem, styles.navItemMain]} onPress={() => router.push('/projects/create')}>
                    <View style={styles.plusIconBox}>
                        <Plus size={28} color="white" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/calculations')}>
                    <Calculator size={24} color={theme.colors.textSecondary} />
                    <Text style={styles.navLabel}>Tools</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings')}>
                    <Settings size={24} color={theme.colors.textSecondary} />
                    <Text style={styles.navLabel}>Settings</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        paddingBottom: 100, // Account for bottom nav
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.xl,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerLeft: {
        flex: 1,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        height: 70,
        backgroundColor: 'white',
        borderRadius: 35,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navItemMain: {
        marginTop: -30,
    },
    plusIconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    navLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.text,
    },
    subGreeting: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    roleBadge: {
        backgroundColor: theme.colors.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    roleBadgeText: {
        color: theme.colors.primary,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    profileBadge: {
        padding: 2,
        borderRadius: 20,
        backgroundColor: theme.colors.border,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
    statsGrid: {
        flexDirection: 'row',
        padding: theme.spacing.xl,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: theme.spacing.lg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        marginTop: 2,
    },
    section: {
        paddingHorizontal: theme.spacing.xl,
        marginTop: theme.spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    viewAll: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    activityList: {
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
    activityProject: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
});

