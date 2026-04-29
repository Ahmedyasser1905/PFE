import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '~/constants/theme';
import { useUser } from '~/hooks/useUser';
import { useLanguage } from '~/context/LanguageContext';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { user, name, email } = useUser();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const initials = (name || 'U').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, isArabic && styles.rtlRow]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#0F172A" style={{ transform: [{ scaleX: isArabic ? -1 : 1 }] }} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.personal_info_title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {user?.avatarUrl ? (
              <Image 
                source={{ uri: user.avatarUrl }} 
                style={styles.avatarImage} 
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </View>
          <Text style={styles.avatarHint}>{t('settings.read_only')}</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isArabic && styles.rtlText]}>{t('settings.account_details')}</Text>

          {/* Name — read only */}
          <View style={styles.field}>
            <View style={[styles.fieldLabelRow, isArabic && styles.rtlRow]}>
              <User size={15} color="#64748B" />
              <Text style={styles.fieldLabel}>{t('settings.full_name')}</Text>
            </View>
            <View style={[styles.inputReadOnly, isArabic && styles.rtlRow]}>
              <Text style={[styles.inputReadOnlyText, isArabic && { textAlign: 'right' }]}>
                {name || '—'}
              </Text>
              <View style={styles.readOnlyBadge}>
                <Text style={styles.readOnlyBadgeText}>{t('settings.read_only')}</Text>
              </View>
            </View>
          </View>

          {/* Email — read only */}
          <View style={styles.field}>
            <View style={[styles.fieldLabelRow, isArabic && styles.rtlRow]}>
              <Mail size={15} color="#64748B" />
              <Text style={styles.fieldLabel}>{t('auth.email_label')}</Text>
            </View>
            <View style={[styles.inputReadOnly, isArabic && styles.rtlRow]}>
              <Text style={[styles.inputReadOnlyText, isArabic && { textAlign: 'right' }]}>
                {email || '—'}
              </Text>
              <View style={styles.readOnlyBadge}>
                <Text style={styles.readOnlyBadgeText}>{t('settings.read_only')}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  rtlRow: { flexDirection: 'row-reverse' },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  rtlText: { textAlign: 'right' },

  scroll: { padding: 20, paddingBottom: 60 },

  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarWrapper: { position: 'relative', marginBottom: 10 },
  avatarImage: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: '#2563EB',
  },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#93C5FD',
  },
  avatarInitials: { color: '#fff', fontSize: 36, fontWeight: '800' },
  avatarHint: { fontSize: 13, color: '#64748B', fontWeight: '500' },

  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 },

  field: { gap: 8 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#64748B' },

  inputReadOnly: {
    borderWidth: 1.5, borderColor: '#F1F5F9',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  inputReadOnlyText: { fontSize: 15, color: '#94A3B8', fontWeight: '500', flex: 1 },
  readOnlyBadge: {
    backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  readOnlyBadgeText: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
});
