import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '~/constants/theme';
export default function PrivacyScreen() {
    const router = useRouter();
    const sections = [
        {
            title: '1. Information We Collect',
            content: 'We collect information you provide directly to us, such as when you create an account, create construction projects, and use our estimation tools. This includes your name, email, and project data.'
        },
        {
            title: '2. How We Use Your Data',
            content: 'We use your data to provide, maintain, and improve BuildEst services. Specifically, your project data is used to generate accurate estimates and technical reports using our calculation modules.'
        },
        {
            title: '3. Data Storage and Security',
            content: 'We implement robust security measures to protect your personal and project information. All data is encrypted during transmission and stored securely in our cloud infrastructure.'
        },
        {
            title: '4. AI and Data Processing',
            content: 'When you use our AI estimation features, anonymized project parameters may be processed to improve our mathematical models. We never share your personal identity with third-party AI services.'
        },
        {
            title: '5. Data Sharing',
            content: 'We do not sell your personal data. We may share information only with trusted service providers who help us operate our platform, such as hosting services or email providers.'
        },
        {
            title: '6. Your Rights',
            content: 'You have the right to access, update, or delete your account and project data at any time through your profile settings or by contacting our support team.'
        }
    ];
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Shield size={32} color="white" />
                    </View>
                    <Text style={styles.title}>Your Privacy at BuildEst</Text>
                    <Text style={styles.lastUpdated}>Last updated: March 7, 2026</Text>
                </View>
                {sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                ))}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        If you have any questions about how your data is handled, please contact our privacy officer at privacy@buildest.com
                    </Text>
                </View>
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
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 10 : 0,
        paddingBottom: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        paddingBottom: 40,
    },
    iconContainer: {
        alignItems: 'center',
        marginVertical: 32,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#10b981', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0f172a',
        textAlign: 'center',
    },
    lastUpdated: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e40af',
        marginBottom: 12,
    },
    sectionContent: {
        fontSize: 15,
        color: '#334155',
        lineHeight: 24,
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    }
});

