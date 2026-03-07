import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Plus,
    Search,
    Filter,
    Clock,
    MapPin,
    ChevronRight,
    MoreVertical,
    ArrowLeft
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

export default function MyProjects() {
    const router = useRouter();

    const projects = [
        {
            id: '1',
            name: 'Palm Residence',
            location: 'Dubai, UAE',
            progress: 65,
            status: 'On Track',
            date: 'Updated 2h ago',
        },
        {
            id: '2',
            name: 'Grand Avenue Mall',
            location: 'Abu Dhabi, UAE',
            progress: 30,
            status: 'Delayed',
            date: 'Updated 5h ago',
            warning: true,
        },
        {
            id: '3',
            name: 'Sunrise Villa',
            location: 'Sharjah, UAE',
            progress: 100,
            status: 'Completed',
            date: 'Completed Feb 20',
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.push('/')}
                    style={styles.backBtnVisible}
                    activeOpacity={0.8}
                >
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.titleText}>My Projects</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => router.push('/projects/create')}
                >
                    <Plus size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search size={20} color={theme.colors.textSecondary} />
                    <Text style={styles.searchText}>Search projects...</Text>
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter size={20} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                {projects.map((project) => (
                    <TouchableOpacity
                        key={project.id}
                        style={styles.projectCard}
                        onPress={() => router.push(`/projects/${project.id}`)}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.projectMain}>
                                <Text style={styles.projectName}>{project.name}</Text>
                                <View style={styles.locationRow}>
                                    <MapPin size={14} color={theme.colors.textSecondary} />
                                    <Text style={styles.locationText}>{project.location}</Text>
                                </View>
                            </View>
                            <TouchableOpacity>
                                <MoreVertical size={20} color={theme.colors.border} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.progressSection}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Progress</Text>
                                <Text style={styles.progressValue}>{project.progress}%</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        { width: `${project.progress}%`, backgroundColor: project.warning ? '#ef4444' : theme.colors.primary }
                                    ]}
                                />
                            </View>
                        </View>

                        <View style={styles.cardFooter}>
                            <View style={[styles.statusBadge, { backgroundColor: project.status === 'Completed' ? '#ecfdf5' : '#eff6ff' }]}>
                                <Text style={[styles.statusText, { color: project.status === 'Completed' ? '#10b981' : theme.colors.primary }]}>
                                    {project.status}
                                </Text>
                            </View>
                            <View style={styles.dateRow}>
                                <Clock size={12} color={theme.colors.placeholder} />
                                <Text style={styles.dateText}>{project.date}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
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
        paddingTop: 10,
        paddingBottom: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        zIndex: 100,
    },
    backBtnVisible: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.border + '50',
    },
    titleText: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    addBtn: {
        backgroundColor: theme.colors.primary,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 12,
    },
    searchText: {
        color: theme.colors.placeholder,
        fontSize: 15,
    },
    filterBtn: {
        backgroundColor: 'white',
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    listContent: {
        padding: theme.spacing.xl,
        gap: 16,
        paddingBottom: 40,
    },
    projectCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: theme.spacing.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    projectMain: {
        flex: 1,
    },
    projectName: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    locationText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    progressSection: {
        marginBottom: 20,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    progressValue: {
        fontSize: 14,
        color: theme.colors.text,
        fontWeight: '700',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: theme.colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
        color: theme.colors.placeholder,
        fontWeight: '500',
    },
});

