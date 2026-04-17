import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Building2,
    PaintBucket,
    DoorOpen,
    Layout,
    ChevronRight,
    Calculator,
    HardHat,
    Layers,
    Sparkles,
    ArrowLeft
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';
const CATEGORIES = [
    {
        id: 'structural',
        title: 'Grands Travaux',
        icon: HardHat,
        color: '#1e40af',
        items: [
            { name: 'Concrete Calculator', route: '/calculations/concrete' },
            { name: 'Foundation Calculator', route: '/calculations/foundation' },
            { name: 'Structural Materials', route: '/calculations/structural' },
        ]
    },
    {
        id: 'finishes',
        title: 'Travaux de Finitions',
        icon: PaintBucket,
        color: '#b91c1c',
        items: [
            { name: 'Paint & Plaster', route: '/calculations/finishes' },
            { name: 'Tiles & Ceramics', route: '/calculations/finishes' },
        ]
    },
    {
        id: 'openings',
        title: 'Portes et Fenأھtres',
        icon: DoorOpen,
        color: '#047857',
        items: [
            { name: 'Doors Estimation', route: '/calculations/openings' },
            { name: 'Windows Estimation', route: '/calculations/openings' },
        ]
    },
    {
        id: 'interior',
        title: 'Amأ©nagement Intأ©rieur',
        icon: Layout,
        color: '#7c3aed',
        items: [
            { name: 'Flooring Calculator', route: '/calculations/interior' },
            { name: 'Ceiling Materials', route: '/calculations/interior' },
        ]
    }
];
export default function CalculationsLauncher() {
    const router = useRouter();
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
                <Text style={styles.titleText}>Calculations</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {CATEGORIES.map((category) => (
                    <View key={category.id} style={styles.categorySection}>
                        <View style={styles.categoryHeader}>
                            <View style={[styles.iconCircle, { backgroundColor: category.color + '15' }]}>
                                <category.icon size={20} color={category.color} />
                            </View>
                            <Text style={styles.categoryTitle}>{category.title}</Text>
                        </View>
                        <View style={styles.itemsGrid}>
                            {category.items.map((item, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.calcItem}
                                    onPress={() => router.push(item.route as any)}
                                >
                                    <View style={styles.itemLeft}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                    </View>
                                    <ChevronRight size={18} color={theme.colors.border} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
                <TouchableOpacity style={styles.aiBanner}>
                    <View style={styles.aiInfo}>
                        <View style={styles.sparkleBox}>
                            <Sparkles size={20} color="white" />
                        </View>
                        <View>
                            <Text style={styles.aiTitle}>AI Blueprint Analysis</Text>
                            <Text style={styles.aiSubtitle}>Upload floor plans for auto-takeoff</Text>
                        </View>
                    </View>
                    <View style={styles.proBadge}>
                        <Text style={styles.proText}>PRO</Text>
                    </View>
                </TouchableOpacity>
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
        textAlign: 'center',
        flex: 1,
        marginLeft: -20,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    content: {
        padding: theme.spacing.xl,
        paddingBottom: 40,
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    itemsGrid: {
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    calcItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    aiBanner: {
        marginTop: 12,
        backgroundColor: theme.colors.primary,
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    aiInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    sparkleBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    aiTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: 'white',
    },
    aiSubtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    proBadge: {
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    proText: {
        fontSize: 11,
        fontWeight: '900',
        color: theme.colors.primary,
    }
});


