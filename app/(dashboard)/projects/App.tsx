import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '~/constants/theme';
import BottomNav from '~/components/BottomNav';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable
} from 'react-native';

export default function App(): JSX.Element {
  const router = useRouter();

  return (
  
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>

        <ScrollView style={styles.main} contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.content}>

            {/* Title */}
            <Text style={styles.mainTitle}>Skyline Tower</Text>

            {/* Info */}
            <View style={styles.infoRow}>
              <Text style={styles.infoText}># 8f2d-4b9a</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.infoText}>👤 Alex Morgan</Text>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>ACTIVE</Text>
            </View>

            {/* Overview */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Project Overview</Text>
              <Text style={styles.cardText}>
                The Skyline Tower is a flagship mixed-use development. This 45-story structure incorporates sustainable building practices and premium architectural finishes.
              </Text>
            </View>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.smallLabel}>Total Calculations</Text>
                <Text style={styles.bigNumber}>142</Text>
              </View>
              <View style={styles.iconBox}>
                <Text>📊</Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.smallLabel}>Active Categories</Text>
                <Text style={styles.bigNumber}>3</Text>
              </View>
              <View style={styles.iconBox}>
                <Text>🔷</Text>
              </View>
            </View>

            {/* Categories Header */}
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <Text style={styles.link}>Manage All</Text>
            </View>

            {/* Category Card */}
            <Pressable style={styles.card} onPress={() => router.push('/projects/Categorie')}>
              <Text style={styles.topRight}>58 Calcs</Text>
              <View style={styles.iconLarge}><Text>🔨</Text></View>
              <Text style={styles.cardHeader}>Grand Travaux</Text>
              <Text style={styles.cardSub}>Major structural & foundation works</Text>
              <View style={styles.tags}>
                <Text style={styles.tag}>Excavation</Text>
                <Text style={styles.tag}>Foundations</Text>
              </View>
            </Pressable>

            <View style={styles.card}>
              <Text style={styles.topRight}>42 Calcs</Text>
              <View style={styles.iconLarge}><Text>🎨</Text></View>
              <Text style={styles.cardHeader}>Finition</Text>
              <Text style={styles.cardSub}>Finishing & surface works</Text>
              <View style={styles.tags}>
                <Text style={styles.tag}>Tiling</Text>
                <Text style={styles.tag}>Painting</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.topRight}>42 Calcs</Text>
              <View style={styles.iconLarge}><Text>🚪</Text></View>
              <Text style={styles.cardHeader}>Portes & Fenêtres</Text>
              <Text style={styles.cardSub}>Doors & windows</Text>
              <View style={styles.tags}>
                <Text style={styles.tag}>Windows</Text>
              </View>
            </View>

            {/* Activity */}
            <Text style={styles.sectionTitle}>History Calculation</Text>

            <View style={styles.activityBox}>
              <View style={styles.activityItem}>
                <View style={styles.activityLeft}>
                  <View style={styles.iconSmall}><Text>🔨</Text></View>
                  <View>
                    <Text style={styles.activityTitle}>Isolated Footing #12</Text>
                    <Text style={styles.activitySub}>2 mins ago • 3.75 m³</Text>
                  </View>
                </View>
                <Text>›</Text>
              </View>

              <View style={styles.activityItem}>
                <View style={styles.activityLeft}>
                  <View style={styles.iconSmall}><Text>🚪</Text></View>
                  <View>
                    <Text style={styles.activityTitle}>Main Entrance Glass</Text>
                    <Text style={styles.activitySub}>45 mins ago • 12.40 m²</Text>
                  </View>
                </View>
                <Text>›</Text>
              </View>

              <View style={styles.center}>
                <Text style={styles.link}>View all calculations ›</Text>
              </View>
            </View>

          </View>
             <View style={styles.floating}>
          <Pressable style={styles.fabPrimary}><Text style={{ color: '#fff' }}>＋</Text></Pressable>
          <Pressable style={styles.fab}><Text>✏️</Text></Pressable>
          <Pressable style={styles.fab}><Text>🔗</Text></Pressable>
        </View>
        </ScrollView>

  
     

      </View>
      
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mobileContainer: {
    width: '100%',
    maxWidth: 400,
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', gap: 10 },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: { color: '#fff', fontWeight: 'bold' },
  title: { marginLeft: 8, fontWeight: 'bold', fontSize: 16 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center'
  },
  main: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },

  breadcrumb: { flexDirection: 'row', gap: 5, marginBottom: 10 },
  breadcrumbText: { color: '#94a3b8' },
  breadcrumbActive: { fontWeight: 'bold' },

  mainTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { color: '#64748b' },
  dot: { color: '#ccc' },

  badge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
    alignSelf: 'flex-start'
  },
  badgeText: { color: '#15803d', fontWeight: 'bold', fontSize: 12 },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#eee'
  },
  cardTitle: { fontSize: 12, color: '#94a3b8', marginBottom: 6 },
  cardText: { color: '#475569' },

  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  smallLabel: { fontSize: 12, color: '#94a3b8' },
  bigNumber: { fontSize: 22, fontWeight: 'bold' },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center'
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    alignItems: 'center'
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  link: { color: '#2563eb', fontWeight: 'bold' },

  topRight: { position: 'absolute', right: 12, top: 12, fontSize: 10, color: '#94a3b8' },
  iconLarge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  cardHeader: { fontWeight: 'bold', fontSize: 16 },
  cardSub: { color: '#64748b', fontSize: 12, marginBottom: 10 },
  tags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 10
  },

  activityBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  activityLeft: { flexDirection: 'row', gap: 10 },
  activityTitle: { fontWeight: 'bold' },
  activitySub: { fontSize: 12, color: '#64748b' },

  iconSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fde68a',
    alignItems: 'center',
    justifyContent: 'center'
  },

  center: { alignItems: 'center', padding: 10 },

  floating: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 16,
    gap: 6
  },
  fabPrimary: {
    width: 40,
    height: 40,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fab: {
    width: 40,
    height: 40,
    backgroundColor: '#eee',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  }
});