// styles/globalStyles.ts
import { StyleSheet } from 'react-native';
import { theme } from '~/constants/theme';

export const Styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.xl,
        backgroundColor: 'white',
    },
    scrollContent: {
        paddingBottom: 120,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '900',
        color: theme.colors.text,
        letterSpacing: -0.5,
    },
    subGreeting: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    profileBadge: {
        padding: 3,
        borderRadius: 22,
        backgroundColor: theme.colors.border + '50',
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 16,
    },
    promoBtn: {
        padding: 8,
        backgroundColor: theme.colors.error + '20',
        borderRadius: theme.roundness.md,
    },
}); 
