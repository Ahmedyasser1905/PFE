import React from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { theme } from '../../../constants/theme';
const { width, height } = Dimensions.get('window');
interface OnboardingCardProps {
    title: string;
    subtitle: string;
    illustration?: React.ReactNode;
    textColor?: string;
}
export const OnboardingCard: React.FC<OnboardingCardProps> = ({ title, subtitle, illustration, textColor = 'white' }) => {
    return (
        <View style={styles.container}>
            <View style={styles.illustrationContent}>
                {illustration}
            </View>
            <View style={styles.textContent}>
                <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                <Text style={[styles.subtitle, { color: textColor, opacity: 0.8 }]}>{subtitle}</Text>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        width,
        flex: 1,
        padding: theme.spacing.xl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    illustrationContent: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    textContent: {
        flex: 0.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: theme.spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: theme.spacing.xl,
    },
});



