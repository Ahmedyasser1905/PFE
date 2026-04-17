import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  
  ScrollView,
  Pressable
} from 'react-native';
import {
  BarChart3,
  Grid3X3,
  HardHat,
  Paintbrush,
  DoorOpen,
  ChevronRight,
  Plus,
  Link2,
  User,
} from 'lucide-react-native';

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // ✅ dynamic id

  const [project, setProject] = useState<any>(null);

  // ✅ FETCH PROJECT (replace with API)
  useEffect(() => {
    const data = {
      id,
      title: 'Dynamic Project',
      uuid: 'PRJ-001',
      client: 'Client Name',
      status: 'Active',
      description: 'Dynamic description from API',
      stats: {
        calculations: 142,
        categories: 3
      },
      categories: [
        {
          id: '1',
          name: 'Construction',
          icon: 'HardHat',
          color: '#fef3c7',
          iconColor: '#b45309',
          calculations: 58,
          tags: ['Excavation', 'Foundations']
        },
        {
          id: '2',
          name: 'Finishing',
          icon: 'Paintbrush',
          color: '#fce7f3',
          iconColor: '#be185d',
          calculations: 42,
          tags: ['Tiling', 'Painting']
        }
      ],
      activity: [
        {
          id: '1',
          title: 'Isolated Footing #12',
          sub: '2 mins ago • 3.75 m³',
          icon: 'HardHat'
        }
      ]
    };

    setProject(data);
  }, [id]);

  if (!project) return null;

  // 🔥 ICON SWITCH (dynamic)
  const getIcon = (name: string) => {
    switch (name) {
      case 'HardHat': return HardHat;
      case 'Paintbrush': return Paintbrush;
      case 'DoorOpen': return DoorOpen;
      default: return HardHat;
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.content}>

          {/* TITLE */}
          <Text style={styles.title}>{project.title}</Text>

          {/* INFO */}
          <View style={styles.infoRow}>
            <Text style={styles.infoText}># {project.uuid}</Text>
            <Text style={styles.dot}>•</Text>
            <View style={styles.infoUserRow}>
              <User size={14} color="#64748b" />
              <Text style={styles.infoText}>{project.client}</Text>
            </View>
          </View>

          {/* STATUS */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{project.status}</Text>
          </View>

          {/* DESCRIPTION */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Project Overview</Text>
            <Text>{project.description}</Text>
          </View>

          {/* STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text>{project.stats.calculations}</Text>
              <BarChart3 size={20} />
            </View>

            <View style={styles.statCard}>
              <Text>{project.stats.categories}</Text>
              <Grid3X3 size={20} />
            </View>
          </View>

          {/* CATEGORIES */}
          <Text style={styles.sectionTitle}>Categories</Text>

          {project.categories.map((cat: any) => {
            const Icon = getIcon(cat.icon);

            return (
              <Pressable
                key={cat.id}
                style={styles.categoryCard}
                onPress={() =>
                  router.push(`/projects//categorie/`)
                }
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                  <Icon size={22} color={cat.iconColor} />
                </View>

                <Text style={styles.categoryTitle}>{cat.name}</Text>

                <View style={styles.tagRow}>
                  {cat.tags.map((tag: string) => (
                    <Text key={tag} style={styles.tagChip}>{tag}</Text>
                  ))}
                </View>

                <Text style={styles.calcCount}>{cat.calculations} Calcs</Text>
              </Pressable>
            );
          })}

          {/* history*/}
          <Text style={styles.sectionTitle}>Historique Calculation</Text>

          <View style={styles.activityBox}>
            {project.activity.map((act: any) => {
              const Icon = getIcon(act.icon);

              return (
                <Pressable
                  key={act.id}
                  style={styles.activityItem}
                  onPress={() =>
                    router.push(`/projects/${project.id}/calculation/${act.id}`)
                  }
                >
                  <View style={styles.activityLeft}>
                    <View style={styles.activityIcon}>
                      <Icon size={16} />
                    </View>
                    <View>
                      <Text>{act.title}</Text>
                      <Text style={styles.activitySub}>{act.sub}</Text>
                    </View>
                  </View>

                  <ChevronRight size={16} />
                </Pressable>
              );
            })}
          </View>

       


           
         

        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

import { StyleSheet } from 'react-native';
import { theme } from '~/constants/theme';
import { moderateScale, verticalScale } from '~/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },

  content: {
    padding: theme.spacing.lg,
  },

  // TITLE
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: verticalScale(8),
  },

  // INFO
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },

  infoUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },

  infoText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
  },

  dot: {
    color: theme.colors.border,
  },

  // STATUS BADGE
  badge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.roundness.md,
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },

  badgeText: {
    color: '#15803d',
    fontWeight: '800',
    fontSize: theme.typography.small.fontSize,
  },

  // CARD
  card: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    borderRadius: theme.roundness.xxl,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  cardLabel: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  cardText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
  },

  // STATS
  statsRow: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },

  statCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.roundness.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  statLabel: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
  },

  statValue: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
  },

  // SECTION
  sectionTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },

  // CATEGORY CARD
  categoryCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    borderRadius: theme.roundness.xxl,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },

  categoryIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: theme.roundness.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },

  categoryTitle: {
    fontWeight: '700',
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },

  categorySub: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    marginBottom: theme.spacing.sm,
  },

  calcCount: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: theme.spacing.lg,
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.muted,
    fontWeight: '600',
  },

  // TAGS
  tagRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },

  tagChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: moderateScale(6),
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
  },

  // ACTIVITY
  activityBox: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.roundness.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },

  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },

  activityIcon: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: theme.roundness.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },

  activityTitle: {
    fontWeight: '700',
    color: theme.colors.text,
    fontSize: theme.typography.small.fontSize,
  },

  activitySub: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },

  // FLOATING BUTTONS
  floating: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xs,
    borderRadius: theme.roundness.xxl,
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xl,
    ...theme.shadows.md,
  },

  fabPrimary: {
    width: moderateScale(42),
    height: moderateScale(42),
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fab: {
    width: moderateScale(42),
    height: moderateScale(42),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});