import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Compass } from 'lucide-react-native';
import { theme } from '../constants/theme';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    style?: ViewStyle;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, style }) => {
    const getSize = () => {
        switch (size) {
            case 'sm': return 32;
            case 'md': return 48;
            case 'lg': return 64;
            default: return 48;
        }
    };

    const boxSize = getSize();
    const iconSize = boxSize * 0.6;
    const fontSize = size === 'sm' ? 18 : size === 'md' ? 24 : 32;

    return (
        <View style={[styles.container, style]}>
            <View style={[styles.box, { width: boxSize, height: boxSize, borderRadius: boxSize / 4 }]}>
                <Compass color="white" size={iconSize} strokeWidth={2.5} />
            </View>
            {showText && (
                <Text style={[styles.text, { fontSize }]}>BuildEst</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    box: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.roundness.md,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    text: {
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: -0.5,
    },
});
