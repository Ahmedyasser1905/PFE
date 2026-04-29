import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation,
  Platform, UIManager, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '~/context/LanguageContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_ITEMS = [
  {
    q: 'How do I create a new project?',
    a: 'From the Home tab, tap the "Create Project" card at the top. Fill in the project details including name, location, and budget, then tap Save.',
  },
  {
    q: 'How does the calculation engine work?',
    a: 'Navigate to the Calculations tab inside a project. Choose a category (e.g., Foundations), then a sub-category, enter your dimensions, and tap Calculate. Results are displayed immediately and can be saved to your project history.',
  },
  {
    q: 'Can I use the app offline?',
    a: 'Yes! Calculations and saved project data are stored locally on your device. You only need an internet connection to log in, sync projects, or use the AI assistant.',
  },
  {
    q: 'How do I change the app language?',
    a: 'Go to Settings → Language. You can switch between English and Arabic. The app will update immediately without needing to restart.',
  },
  {
    q: 'How do I reset my password?',
    a: 'On the login screen, tap "Forgot Password". Enter your email address, and you\'ll receive a 6-digit OTP code. Enter the code, then set your new password.',
  },
  {
    q: 'Are prices in the calculations accurate?',
    a: 'The calculations use reference unit prices based on Algerian market averages. They are meant for estimation only. Always consult local suppliers for current prices.',
  },
  {
    q: 'How do I delete a project?',
    a: 'Open the project, then tap the options menu (three dots) in the top right corner. You\'ll see a "Delete Project" option. This action is permanent.',
  },
  {
    q: 'What is a completed project?',
    a: 'When you mark a project as "Completed", all its calculations become read-only (locked). This preserves a final archive of the estimation for that project.',
  },
];

function AccordionItem({ item, index }: { item: typeof FAQ_ITEMS[0]; index: number }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  };

  return (
    <View style={[styles.accordionItem, index > 0 && styles.accordionBorder]}>
      <TouchableOpacity style={styles.accordionHeader} onPress={toggle} activeOpacity={0.7}>
        <View style={styles.accordionLeft}>
          <View style={styles.questionNum}>
            <Text style={styles.questionNumText}>{index + 1}</Text>
          </View>
          <Text style={styles.questionText}>{item.q}</Text>
        </View>
        {open
          ? <ChevronUp size={18} color="#2563EB" />
          : <ChevronDown size={18} color="#94A3B8" />
        }
      </TouchableOpacity>
      {open && (
        <View style={styles.accordionBody}>
          <Text style={styles.answerText}>{item.a}</Text>
        </View>
      )}
    </View>
  );
}

export default function HelpScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, isArabic && styles.rtlRow]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#0F172A" style={{ transform: [{ scaleX: isArabic ? -1 : 1 }] }} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <HelpCircle size={36} color="#2563EB" />
          </View>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>Find answers to common questions below, or reach out to our support team.</Text>
        </View>

        {/* FAQ */}
        <Text style={styles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.accordionCard}>
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} item={item} index={i} />
          ))}
        </View>

        {/* Contact */}
        <Text style={styles.sectionLabel}>CONTACT SUPPORT</Text>
        <View style={styles.contactCard}>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:support@buildest.dz')}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#EFF6FF' }]}>
              <Mail size={20} color="#2563EB" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email Us</Text>
              <Text style={styles.contactSub}>support@buildest.dz</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.contactDivider} />

          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('https://wa.me/213XXXXXXXXX')}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#ECFDF5' }]}>
              <MessageCircle size={20} color="#059669" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>WhatsApp</Text>
              <Text style={styles.contactSub}>Chat with support</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>BuildEst © 2024 — v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E2E8F0',
  },
  rtlRow: { flexDirection: 'row-reverse' },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A' },

  scroll: { padding: 20, paddingBottom: 60 },

  hero: { alignItems: 'center', marginBottom: 32 },
  heroIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  heroSub: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 21, paddingHorizontal: 10 },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#94A3B8',
    letterSpacing: 1.2, marginBottom: 12, marginLeft: 4,
  },

  accordionCard: {
    backgroundColor: '#fff', borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0',
    overflow: 'hidden', marginBottom: 24,
  },
  accordionItem: { padding: 0 },
  accordionBorder: { borderTopWidth: 1, borderColor: '#F1F5F9' },
  accordionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 16, gap: 12,
  },
  accordionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  questionNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  questionNumText: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
  questionText: { fontSize: 14, fontWeight: '700', color: '#0F172A', flex: 1, lineHeight: 20 },
  accordionBody: {
    paddingHorizontal: 18, paddingBottom: 18, paddingTop: 0,
    paddingLeft: 56,
  },
  answerText: { fontSize: 14, color: '#475569', lineHeight: 22 },

  contactCard: {
    backgroundColor: '#fff', borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0',
    overflow: 'hidden', marginBottom: 24,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  contactDivider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 18 },
  contactIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  contactSub: { fontSize: 13, color: '#64748B' },

  version: { textAlign: 'center', fontSize: 12, color: '#CBD5E1', fontWeight: '600', marginTop: 8 },
});
