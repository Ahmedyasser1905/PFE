import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, I18nManager } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { LayoutDashboard, HardHat, MessageCircle, Settings, History, Users } from 'lucide-react-native';
import { theme } from '~/constants/theme';
import { useLanguage } from '~/context/LanguageContext';
import { useUser } from '~/hooks/useUser';

function BottomNav() {
  const router = useRouter();
  const segments = useSegments();
  const { t, language } = useLanguage();
  const { user } = useUser();

  const isArabic = language === 'ar';

  // Determine active tab
  const isDashboard = segments.length <= 1 || (segments.includes('(dashboard)') && segments.length === 1);
  const isProjects = segments.includes('projects');
  const isHistory = segments.includes('estimation-history');
  const isChat = segments.includes('chat');
  const isSettings = segments.includes('settings');
  const NavItem = ({ icon: Icon, label, active, onPress }: any) => (
    <TouchableOpacity 
      style={styles.navItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrapper, active && styles.activeIconWrapper]}>
        <Icon 
          size={22} 
          color={active ? theme.colors.primary : '#94A3B8'} 
          strokeWidth={active ? 2.5 : 2}
        />
      </View>
      <Text style={[styles.navLabel, active && styles.activeNavLabel]} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.navContainer}>
      <View style={styles.blurBackground} />
      <View style={[styles.navContent, isArabic && styles.rtlNavContent]}>
        <NavItem 
          icon={LayoutDashboard} 
          label={t('navigation.home')} 
          active={isDashboard} 
          onPress={() => router.push('/(dashboard)')} 
        />
        <NavItem 
          icon={HardHat} 
          label={t('navigation.projects')} 
          active={isProjects} 
          onPress={() => router.push('/projects')} 
        />
        <NavItem 
          icon={History} 
          label={t('navigation.history')} 
          active={isHistory} 
          onPress={() => router.push('/estimation-history')} 
        />
        <NavItem 
          icon={MessageCircle} 
          label={t('navigation.chat')} 
          active={isChat} 
          onPress={() => router.push('/chat')} 
        />
        <NavItem 
          icon={Settings} 
          label={t('navigation.settings')} 
          active={isSettings} 
          onPress={() => router.push('/settings')} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 96 : 76,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    ...theme.shadows.lg,
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  navContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 32 : 8,
  },
  rtlNavContent: {
    flexDirection: 'row-reverse',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 8,
  },
  iconWrapper: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginBottom: 4,
  },
  activeIconWrapper: {
    backgroundColor: theme.colors.primaryLight,
  },
  navLabel: {
    ...theme.typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  activeNavLabel: {
    color: theme.colors.primary,
  },
});

export default memo(BottomNav);
