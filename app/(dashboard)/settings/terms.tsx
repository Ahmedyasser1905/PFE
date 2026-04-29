import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText, Shield, Gavel } from 'lucide-react-native';
import { theme } from '~/constants/theme';
import { useLanguage } from '~/context/LanguageContext';

export default function TermsScreen() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.terms') || 'Terms of Service'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconCircle}>
          <Gavel size={32} color={theme.colors.primary} />
        </View>

        <Text style={styles.lastUpdated}>Last Updated: May 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing and using BuildEst, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use of Services</Text>
          <Text style={styles.text}>
            BuildEst is a construction estimation tool. Calculations provided are estimates based on user input and standard formulas. Users are responsible for verifying all final quantities.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Account Security</Text>
          <Text style={styles.text}>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Limitation of Liability</Text>
          <Text style={styles.text}>
            BuildEst is not liable for any construction errors, financial losses, or project delays resulting from the use of our estimation tools.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#0F172A' },
  content: { padding: 24, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  lastUpdated: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginBottom: 32 },
  section: { width: '100%', marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  text: { fontSize: 14, color: '#64748B', lineHeight: 22 },
});
