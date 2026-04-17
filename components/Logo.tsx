import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image } from 'react-native';
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
            case 'lg': return 80;
            default: return 48;
        }
    };
    const boxSize = getSize();
    const fontSize = size === 'sm' ? 18 : size === 'md' ? 24 : 32;
    return (
        <View style={[styles.container, style]}>
            <View style={[styles.box, { width: boxSize, height: boxSize, borderRadius: boxSize / 4 }]}>
                <Image 
                    source={require('../assets/icon.png')} 
                    style={{ width: '100%', height: '100%', borderRadius: boxSize / 4 }}
                    resizeMode="contain"
                />
            </View>
            {showText && (
                <Text style={[styles.text, { fontSize, color: size === 'lg' ? 'white' : theme.colors.text }]}>Buildest</Text>
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    box: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    text: {
        fontWeight: '900',
        letterSpacing: -1,
    },
});
