import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image
} from 'react-native';
import { CheckCircle, Building2, Calendar } from 'lucide-react-native';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed';
  image: string;
  client: string;
  dueDate: string;
  uuid: string;
}

interface CardProps {
  project: Project;
}

export const ProjectCard: React.FC<CardProps> = ({ project }) => {
  const isActive = project.status === 'Active';

  return (
    <View style={styles.card}>
      
      {/* IMAGE */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: project.image }} style={styles.image} />

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
          <Text style={styles.title}>{project.title}</Text>
          <Text style={styles.uuid}>UUID: {project.uuid}</Text>
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.description}>
          {project.description}
        </Text>

        {/* FOOTER */}
        <View style={styles.footer}>
          
          <View style={styles.row}>
            <Building2 size={14} color="#94a3b8" />
            <Text style={styles.footerText}>{project.client}</Text>
          </View>

          <View style={styles.row}>
            <Calendar size={14} color="#94a3b8" />
            <Text style={styles.footerText}>Due {project.dueDate}</Text>
          </View>

        </View>
      </View>

    </View>
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
    marginBottom: 12
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