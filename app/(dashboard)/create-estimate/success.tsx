import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckCircle, ArrowRight } from 'lucide-react-native';
import { theme } from '../../../constants/theme';
import { BaseButton } from '../../../components/BaseButton';
export default function SuccessScreen() {
    const router = useRouter();
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            })
        ]).start();
    }, []);
    const handleHome = () => {
        router.replace('/');
    };
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.content}>
                <Animated.View style={[styles.iconWrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.circle}>
                        <CheckCircle size={100} color="white" strokeWidth={1.5} />
                    </View>
                </Animated.View>
                <Animated.View style={[styles.textWrapper, { opacity: fadeAnim }]}>
                    <Text style={styles.title}>Congratulations!</Text>
                    <Text style={styles.subtitle}>
                        Your estimate has been created successfully. You can now view it in your dashboard.
                    </Text>
                </Animated.View>
            </View>
            <View style={styles.footer}>
                <BaseButton
                    title="Back to Dashboard"
                    onPress={handleHome}
                    icon={ArrowRight}
                    style={styles.homeBtn}
                />
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xxxl,
    },
    iconWrapper: {
        marginBottom: theme.spacing.xxxl,
    },
    circle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: theme.colors.success,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.success,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    textWrapper: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        padding: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    homeBtn: {
        height: 60,
        borderRadius: 30,
    },
});

