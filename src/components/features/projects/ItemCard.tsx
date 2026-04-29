import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Check } from 'lucide-react-native';
import { theme } from '../../../constants/theme';
interface ItemCardProps {
    title: string;
    price: string;
    description?: string;
    selected?: boolean;
    onToggle: () => void;
    icon?: React.ReactNode;
}
export const ItemCard: React.FC<ItemCardProps> = ({ title, price, description, selected, onToggle, icon }) => {
    return (
        <TouchableOpacity 
            style={[styles.container, selected && styles.selectedContainer]} 
            onPress={onToggle}
            activeOpacity={0.7}
        >
            <View style={styles.iconWrapper}>
                {icon || <View style={styles.placeholderIcon} />}
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                {description && <Text style={styles.description} numberOfLines={1}>{description}</Text>}
                <Text style={styles.price}>{price}</Text>
            </View>
            <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                {selected && <Check color="white" size={12} strokeWidth={3} />}
            </View>
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: theme.spacing.md,
        borderRadius: 20,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border + '50',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    selectedContainer: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary + '05',
    },
    iconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 15,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    placeholderIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: theme.colors.border,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 2,
    },
    description: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
});


