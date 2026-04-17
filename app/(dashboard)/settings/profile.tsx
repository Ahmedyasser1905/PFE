import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    User,
    Mail,
    Lock,
    ChevronRight,
    LogOut,
    Bell,
    Globe,
    CircleHelp,
    FileText,
    Crown,
    ArrowLeft,
    Shield,
    Gavel
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
export default function ProfileSettings() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/login?mode=form');
        } catch (error) {
            console.error('[Settings] Logout error:', error);
        }
    };
    const menuItems = [
        { title: 'Personal Information', icon: User, route: null },
        { title: 'Notification Settings', icon: Bell, route: null },
        { title: 'App Language', icon: Globe, value: 'English', route: null },
        { title: 'Security & Password', icon: Lock, route: '/settings/password' },
        { title: 'Subscription Plan', icon: FileText, route: '/settings/subscription' },
        { title: 'Terms & Conditions', icon: Gavel, route: '/terms' },
        { title: 'Privacy Policy', icon: Shield, route: '/privacy' },
        { title: 'Help & Support', icon: CircleHelp, route: null },
    ];
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
                <Text style={styles.titleText}>Settings</Text>
                {}
                <View style={{ width: 80 }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'U'}</Text>
                        </View>
                        <TouchableOpacity style={styles.editAvatarBtn}>
                            <Text style={styles.editAvatarText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user?.fullName || 'User Name'}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                </View>
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={() => item.route && router.push(item.route)}
                        >
                            <View style={styles.menuLeft}>
                                <View style={[styles.iconBox, { backgroundColor: '#f1f5f9' }]}>
                                    <item.icon size={20} color={theme.colors.text} />
                                </View>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                            </View>
                            <View style={styles.menuRight}>
                                {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                                <ChevronRight size={18} color={theme.colors.border} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
                <View style={styles.footer}>
                    <Text style={styles.version}>BuildEst v1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 10 : 10,
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
    profileSection: {
        alignItems: 'center',
        paddingVertical: 32,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: 'white',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    editAvatarText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
    },
    userEmail: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    menuContainer: {
        paddingTop: theme.spacing.md,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuValue: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        margin: theme.spacing.xl,
        padding: theme.spacing.lg,
        borderRadius: 12,
        backgroundColor: '#fef2f2',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ef4444',
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    version: {
        fontSize: 12,
        color: theme.colors.placeholder,
        fontWeight: '600',
    },
});

