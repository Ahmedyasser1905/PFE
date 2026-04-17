import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, ArrowLeft, Search, Filter } from 'lucide-react-native';
import { theme } from '../../../constants/theme';
import { ItemCard } from '../../../components/ItemCard';
import { BaseButton } from '../../../components/BaseButton';
const CONSTRUCTION_ITEMS = [
    { id: '1', title: 'Bأ©ton armأ©', price: '4500 DA/mآ³', description: 'Pour fondations et dalles' },
    { id: '2', title: 'Ciment gris', price: '850 DA/sac', description: 'Sac de 50kg CPJ-42.5' },
    { id: '3', title: 'Briques creuses', price: '45 DA/unitأ©', description: 'Format 12 trous standard' },
    { id: '4', title: 'Sable de carriأ¨re', price: '2200 DA/mآ³', description: 'Sable lavأ© pour mortier' },
    { id: '5', title: 'Gravier 15/25', price: '1800 DA/mآ³', description: 'Granulats pour bأ©ton' },
    { id: '6', title: 'Fer أ  bأ©ton 12mm', price: '1200 DA/barre', description: 'Barre de 12 mأ¨tres' },
    { id: '7', title: 'Plأ¢tre de finition', price: '600 DA/sac', description: 'Plأ¢tre de moulage' },
    { id: '8', title: 'Peinture blanche', price: '4200 DA/pot', description: 'Pot de 20kg vinylique' },
];
export default function ItemSelectionScreen() {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const router = useRouter();
    const toggleItem = (id: string) => {
        setSelectedItems(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };
    const handleNext = () => {
        if (selectedItems.length === 0) {
            alert('Veuillez sأ©lectionner au moins un أ©lأ©ment');
            return;
        }
        router.push('/create-estimate/summary');
    };
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Choisis les أ©lأ©ments</Text>
                <Pressable style={styles.iconBtn}>
                    <Search size={24} color={theme.colors.text} />
                </Pressable>
            </View>
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
                    {['Tout', 'Maأ§onnerie', 'Bأ©ton', 'Peinture', 'أ‰lectricitأ©', 'Plomberie'].map((cat, i) => (
                        <Pressable key={cat} style={[styles.categoryTag, i === 0 && styles.activeTag]}>
                            <Text style={[styles.categoryText, i === 0 && styles.activeTabText]}>{cat}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
            <FlatList
                data={CONSTRUCTION_ITEMS}
                renderItem={({ item }) => (
                    <ItemCard
                        title={item.title}
                        price={item.price}
                        description={item.description}
                        selected={selectedItems.includes(item.id)}
                        onToggle={() => toggleItem(item.id)}
                    />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
            <View style={styles.footer}>
                <View style={styles.summaryInfo}>
                    <Text style={styles.selectedCount}>{selectedItems.length} أ©lأ©ments sأ©lectionnأ©s</Text>
                </View>
                <BaseButton
                    title="Confirmer la sأ©lection"
                    onPress={handleNext}
                    icon={ChevronRight}
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
    iconBtn: {
        padding: 4,
    },
    filterContainer: {
        backgroundColor: 'white',
        paddingBottom: theme.spacing.md,
    },
    categories: {
        paddingHorizontal: theme.spacing.xl,
        gap: 12,
    },
    categoryTag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border + '50',
    },
    activeTag: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    activeTabText: {
        color: 'white',
    },
    listContent: {
        padding: theme.spacing.xl,
        paddingTop: theme.spacing.md,
    },
    footer: {
        backgroundColor: 'white',
        padding: theme.spacing.xl,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border + '30',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    summaryInfo: {
        marginBottom: theme.spacing.md,
    },
    selectedCount: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    confirmBtn: {
        height: 56,
        borderRadius: 28,
    },
});

