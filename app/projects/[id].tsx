import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Edit3,
    MapPin,
    Calendar,
    Clock,
    BarChart3,
    CheckCircle2,
    FileText,
    Calculator
} from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { BaseButton } from '../../components/BaseButton';

export default function ProjectDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const project = {
        name: 'Palm Residence',
        location: 'Dubai, UAE',
        type: 'Residential',
        startDate: 'Jan 10, 2026',
        deadline: 'Aug 20, 2026',
        progress: 65,
        summary: 'A luxury 15-story residential building featuring sustainable glass architecture and automated climate control.',
        stats: [
            { label: 'Budget Spent', value: '$1.2M', total: '$2.0M' },
            { label: 'Calculations', value: '24', total: 'Done' },
            { label: 'Team Members', value: '8', total: 'Engs' },
        ],
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Project Details</Text>
                <TouchableOpacity onPress={() => router.push(`/projects/edit/${id}`)}>
                    <Edit3 size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroSection}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.locationText}>{project.location} • {project.type}</Text>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Overall Completion</Text>
                            <Text style={styles.progressValue}>{project.progress}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${project.progress}%` }]} />
                        </View>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    {project.stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                            <Text style={styles.statMainValue}>{stat.value}</Text>
                            <Text style={styles.statSubValue}>{stat.total}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{project.summary}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Key Dates</Text>
                    <View style={styles.dateCard}>
                        <View style={styles.dateItem}>
                            <Calendar size={18} color={theme.colors.primary} />
                            <View>
                                <Text style={styles.dateLabel}>Start Date</Text>
                                <Text style={styles.dateValue}>{project.startDate}</Text>
                            </View>
                        </View>
                        <View style={styles.dateDivider} />
                        <View style={styles.dateItem}>
                            <Clock size={18} color="#ef4444" />
                            <View>
                                <Text style={styles.dateLabel}>Deadline</Text>
                                <Text style={styles.dateValue}>{project.deadline}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.actionsContainer}>
                    <BaseButton
                        title="Perform Calculation"
                        onPress={() => router.push('/calculations')}
                        icon={Calculator}
                        style={styles.actionBtn}
                    />
                    <BaseButton
                        title="View Documents"
                        variant="outline"
                        onPress={() => { }}
                        icon={FileText}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backBtn: { width: 40 },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    heroSection: {
        padding: theme.spacing.xl,
        backgroundColor: '#eff6ff',
        margin: theme.spacing.xl,
        borderRadius: 24,
    },
    projectName: {
        fontSize: 26,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 24,
    },
    locationText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    progressContainer: {
        marginTop: 10,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    progressLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    progressValue: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    progressBarBg: {
        height: 10,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 5,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 5,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.xl,
        gap: 12,
        marginBottom: theme.spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: theme.spacing.md,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statLabel: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    statMainValue: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.text,
    },
    statSubValue: {
        fontSize: 11,
        color: theme.colors.placeholder,
        marginTop: 2,
    },
    section: {
        paddingHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        lineHeight: 24,
    },
    dateCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
    dateItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dateDivider: {
        width: 1,
        height: 30,
        backgroundColor: theme.colors.border,
        marginHorizontal: 16,
    },
    dateLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text,
    },
    actionsContainer: {
        padding: theme.spacing.xl,
        gap: 12,
    },
    actionBtn: {
        marginBottom: 4,
    },
});
