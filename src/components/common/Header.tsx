import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, I18nManager } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { ArrowLeft, Bell, Settings, Search, LogOut } from 'lucide-react-native';
import { theme } from '~/constants/theme';
import { useUser } from '~/hooks/useUser';
import { useLanguage } from '~/context/LanguageContext';

const Header = () => {
  const { name, user } = useUser();
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();
  const segments = useSegments();

  const isArabic = language === 'ar';

  // Navigation Logic
  const isRoot = segments.length <= 1 || (segments[0] === '(dashboard)' && segments.length === 1);
  const showBack = !isRoot;
  
  // Custom Title Mapping
  const getHeaderTitle = () => {
    if (isRoot) return "BuildEst";
    
    if (segments.includes('projects')) {
       if (segments.includes('[id]')) return t('common.project_details');
       return t('navigation.projects');
    }
    if (segments.includes('calculations')) return t('common.calc_engine');
    if (segments.includes('estimation-history')) return t('navigation.history');
    if (segments.includes('all-calculations')) return t('common.all_activities');
    if (segments.includes('settings')) return t('navigation.settings');
    if (segments.includes('chat')) return t('navigation.chat');
    
    return "BuildEst";
  };

  if (!user) return null;

  return (
    <View style={[styles.headerContainer, isArabic && styles.rtlHeader]}>
      <View style={[styles.leftSection, isArabic && styles.rtlLeftSection]}>
        {showBack && (
          <TouchableOpacity 
            style={styles.actionCircle} 
            onPress={() => router.back()}
          >
            <ArrowLeft 
              size={20} 
              color={theme.colors.text} 
              style={{ transform: [{ scaleX: isArabic ? -1 : 1 }] }}
            />
          </TouchableOpacity>
        )}
        <View style={[styles.titleWrapper, isArabic && styles.rtlTitleWrapper]}>
          <Text style={[styles.appTitle, isArabic && styles.rtlText]}>{getHeaderTitle()}</Text>
          {isRoot && (
             <Text style={[styles.welcomeText, isArabic && styles.rtlText]}>
               {t('common.hello')}, {name.split(' ')[0]}
             </Text>
          )}
        </View>
      </View>

      <View style={[styles.rightSection, isArabic && styles.rtlRightSection]}>
        {isRoot && (
          <>
            <TouchableOpacity 
              style={styles.profileBadge}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 70,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rtlHeader: {
    flexDirection: 'row-reverse',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rtlLeftSection: {
    flexDirection: 'row-reverse',
  },
  titleWrapper: {
    justifyContent: 'center',
  },
  rtlTitleWrapper: {
    alignItems: 'flex-end',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  welcomeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: -2,
  },
  rtlText: {
    textAlign: 'right',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rtlRightSection: {
    flexDirection: 'row-reverse',
  },
  actionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  profileBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#EFF6FF',
  },
  avatarText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default memo(Header);
