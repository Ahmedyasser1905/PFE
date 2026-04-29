import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';

type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface AppFeedbackProps {
  visible: boolean;
  type?: FeedbackType;
  title: string;
  message?: string;
  loading?: boolean;
  primaryText?: string;
  secondaryText?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export const AppFeedback: React.FC<AppFeedbackProps> = ({
  visible,
  type = 'info',
  title,
  message,
  loading,
  primaryText,
  secondaryText,
  onPrimary,
  onSecondary,
}) => {
  const getColor = () => {
    switch (type) {
      case 'success':
        return '#16a34a';
      case 'error':
        return '#dc2626';
      case 'warning':
        return '#f59e0b';
      default:
        return '#2563eb';
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={[styles.title, { color: getColor() }]}>{title}</Text>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

          <View style={styles.actions}>
            {secondaryText && (
              <Pressable style={styles.secondaryBtn} onPress={onSecondary}>
                <Text style={styles.secondaryText}>{secondaryText}</Text>
              </Pressable>
            )}

            {primaryText && (
              <Pressable style={styles.primaryBtn} onPress={onPrimary}>
                <Text style={styles.primaryText}>{primaryText}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  message: {
    color: '#475569',
    fontSize: 15,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryText: {
    color: '#64748b',
    fontWeight: '600',
  },
});