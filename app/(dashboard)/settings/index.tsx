import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    RefreshControl,
    Pressable,
    I18nManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    User,
    Lock,
    ChevronRight,
    LogOut,
    Bell,
    Globe,
    CircleHelp,
    FileText,
    ArrowLeft,
    Shield,
    Gavel,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '~/constants/theme';
import { useAuth } from '~/context/AuthContext';
import { useUser } from '~/hooks/useUser';
import { useLanguage } from '~/context/LanguageContext';

export default function ProfileSettings() {
    const router = useRouter();
    const { logout } = useAuth();
    const { name, email, fetchProfile } = useUser();
    const { t, language, setLanguage, isRTL } = useLanguage();

    const [refreshing, setRefreshing] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchProfile();
        } catch (error) {
            console.error(error);
        }
        setRefreshing(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/login?mode=form');
        } catch (error) {
            console.error(error);
        }
    };

    const handleLanguageChange = async (lang: 'en' | 'ar') => {
        try {
            await setLanguage(lang);
            setShowLanguageModal(false);
        } catch (error) {
            console.error(error);
        }
    };

    const menuItems = [
        { title: t('settings.personal_info'), icon: User, route: '/settings/personal-info' },
        { title: t('settings.notifications'), icon: Bell, route: null },
        { 
            title: t('settings.language'), 
            icon: Globe, 
            value: language === 'en' ? 'English' : 'العربية', 
            onPress: () => setShowLanguageModal(true) 
        },
        { title: t('settings.subscription'), icon: FileText, route: '/settings/subscription' },
        { title: t('settings.terms'), icon: Gavel, route: '/terms' },
        { title: t('settings.privacy'), icon: Shield, route: '/privacy' },
        { title: t('settings.help'), icon: CircleHelp, route: '/settings/help' },
    ];

    const isArabic = language === 'ar';

    return (
        <SafeAreaView style={[styles.container, isArabic && styles.rtlContainer]} edges={['top']}>
           

             

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Profile */}
                <View style={[styles.profile, isArabic && styles.rtlProfile]}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {name.charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.email}>{email}</Text>
                </View>

                {/* Menu */}
                <View style={styles.menu}>
                    {menuItems.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.menuItem, isArabic && styles.rtlMenuItem]}
                            onPress={() => {
                                if (item.onPress) item.onPress();
                                else if (item.route) router.push(item.route);
                            }}
                        >
                            <View style={[styles.menuLeft, isArabic && styles.rtlMenuLeft]}>
                                <View style={styles.iconBox}>
                                    <item.icon size={18} color="#0F172A" />
                                </View>
                                <Text style={[styles.menuText, isArabic && styles.rtlText]}>{item.title}</Text>
                            </View>

                            <View style={[styles.menuRight, isArabic && styles.rtlMenuRight]}>
                                {item.value && (
                                    <Text style={styles.value}>{item.value}</Text>
                                )}
                                <ChevronRight 
                                    size={18} 
                                    color="#94A3B8" 
                                    style={{ transform: [{ scaleX: isArabic ? -1 : 1 }] }}
                                />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity style={[styles.logout, isArabic && styles.rtlLogout]} onPress={handleLogout}>
                    <LogOut 
                        size={18} 
                        color="#EF4444" 
                        style={{ transform: [{ scaleX: isArabic ? -1 : 1 }] }}
                    />
                    <Text style={styles.logoutText}>{t('common.logout')}</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.version}>© 2024 BuildEst</Text>
                </View>
            </ScrollView>

            {/* Language Modal */}
            {showLanguageModal && (
                <View style={styles.modalOverlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowLanguageModal(false)} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('settings.choose_language')}</Text>
                        </View>
                        
                        <TouchableOpacity 
                            style={[styles.langOption, language === 'en' && styles.langOptionActive]}
                            onPress={() => handleLanguageChange('en')}
                        >
                            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>English</Text>
                            {language === 'en' && <View style={styles.checkDot} />}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.langOption, language === 'ar' && styles.langOptionActive]}
                            onPress={() => handleLanguageChange('ar')}
                        >
                            <Text style={[styles.langText, language === 'ar' && styles.langTextActive]}>العربية (Arabic)</Text>
                            {language === 'ar' && <View style={styles.checkDot} />}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.closeModalBtn}
                            onPress={() => setShowLanguageModal(false)}
                        >
                            <Text style={styles.closeModalText}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    rtlContainer: {
        // RTL specific styles if needed
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    rtlHeader: {
        flexDirection: 'row-reverse',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },

    profile: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
    rtlProfile: {
        // RTL specific profile styles
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '700',
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    email: {
        fontSize: 13,
        color: '#64748B',
    },

    menu: {
        marginTop: 10,
        backgroundColor: '#fff',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#F1F5F9',
    },
    rtlMenuItem: {
        flexDirection: 'row-reverse',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    rtlMenuLeft: {
        flexDirection: 'row-reverse',
    },
    iconBox: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
    },
    rtlText: {
        textAlign: 'right',
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    rtlMenuRight: {
        flexDirection: 'row-reverse',
    },
    value: {
        fontSize: 12,
        color: '#64748B',
    },

    logout: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        margin: 20,
        padding: 14,
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
    },
    rtlLogout: {
        flexDirection: 'row-reverse',
    },
    logoutText: {
        color: '#EF4444',
        fontWeight: '700',
    },

    footer: {
        alignItems: 'center',
        paddingBottom: 30,
        marginTop: 20,
    },
    version: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
    },

    // Modal Styles
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        marginBottom: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    langOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    langOptionActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#2563EB',
    },
    langText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    langTextActive: {
        color: '#2563EB',
    },
    checkDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2563EB',
    },
    closeModalBtn: {
        marginTop: 8,
        padding: 16,
        alignItems: 'center',
    },
    closeModalText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748B',
    },
});
