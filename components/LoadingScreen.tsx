import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ActivityIndicator } from 'react-native';
import { Compass } from 'lucide-react-native';
import { theme } from '../constants/theme';
export const LoadingScreen = () => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const textAnim = useRef(new Animated.Value(20)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
        Animated.parallel([
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 1000,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.timing(textAnim, {
                toValue: 0,
                duration: 1000,
                delay: 200,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);
    return (
        <View style={styles.container}>
            {}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        marginBottom: 80,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoBox: {
        width: 100,
        height: 100,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    brandName: {
        fontSize: 42,
        fontWeight: '900',
        color: '#111827',
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 16,
        color: '#4b5563',
        marginTop: 4,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    footer: {
        position: 'absolute',
        bottom: 60,
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
