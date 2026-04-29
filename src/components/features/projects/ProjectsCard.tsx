import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, Building2, Calendar } from 'lucide-react-native';
import type { Project } from '~/api/types';
import { resolveImageUrl, FALLBACK_IMAGE } from '~/utils/imageResolver';

interface CardProps {
  project: Project;
}

export const ProjectCard: React.FC<CardProps> = ({ project }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const isActive = project.status === 'active';

  // resolveImageUrl now always returns a valid URL (absolute or FALLBACK_IMAGE)
  const finalUri = resolveImageUrl(project.imageUrl);
  
  if (__DEV__) {
    console.log(`[ProjectCard] "${project.name}" | imageUrl=${project.imageUrl} | resolved=${finalUri}`);
  }

  const clientName = 'BuildEst Client';
  const displayDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/projects/${project.projectId}`)}
    >
      
      {/* IMAGE */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: imageError ? FALLBACK_IMAGE : finalUri }} 
          style={styles.image} 
          resizeMode="cover"
          onError={() => {
            if (__DEV__) console.log("[ProjectCard] IMAGE LOAD ERROR:", finalUri);
            setImageError(true);
          }}
        />

        {/* STATUS BADGE */}
        <View
          style={[
            styles.badge,
            { backgroundColor: isActive ? '#3b82f6' : '#10b981' }
          ]}
        >
          {isActive ? (
            <>
              <View style={styles.dot} />
              <Text style={styles.badgeText}>ACTIVE</Text>
            </>
          ) : (
            <>
              <CheckCircle size={14} color="#fff" />
              <Text style={styles.badgeText}>COMPLETED</Text>
            </>
          )}
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{project.name}</Text>
          <Text style={styles.uuid}>ID: {project.projectId.slice(0, 8)}</Text>
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.description} numberOfLines={2}>
          {project.description || 'No description provided for this project.'}
        </Text>

        {/* FOOTER */}
        <View style={styles.footer}>
          
          <View style={styles.row}>
            <Building2 size={14} color="#94a3b8" />
            <Text style={styles.footerText}>{clientName}</Text>
          </View>

          <View style={styles.row}>
            <Calendar size={14} color="#94a3b8" />
            <Text style={styles.footerText}>Created {displayDate}</Text>
          </View>

        </View>
      </View>

    </Pressable>
  );
};

// STYLES
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  imageContainer: {
    height: 180,
    position: 'relative'
  },

  image: {
    width: '100%',
    height: '100%'
  },

  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },

  dot: {
    width: 6,
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3
  },

  content: {
    padding: 14
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1
  },

  uuid: {
    fontSize: 10,
    color: '#94a3b8',
    marginLeft: 8
  },

  description: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 18
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },

  footerText: {
    fontSize: 11,
    color: '#64748b'
  }
});
