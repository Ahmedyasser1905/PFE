import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  Dimensions,
  Animated,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { theme } from '~/constants/theme';

interface NativeSelectProps<T> {
  label: string;
  value: T | null;
  options: T[];
  keyExtractor: (item: T) => string;
  labelExtractor: (item: T) => string;
  onSelect: (item: T) => void;
  placeholder?: string;
  isActive?: boolean;
}

const { height } = Dimensions.get('window');

export function NativeSelect<T>({
  label,
  value,
  options,
  keyExtractor,
  labelExtractor,
  onSelect,
  placeholder = 'Select an option',
  isActive = false,
}: NativeSelectProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(height));

  const openModal = () => {
    setModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 12,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    closeModal();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.dropdown, isActive && styles.dropdownActive]}
        onPress={openModal}
      >
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder} numberOfLines={1}>
          {value ? labelExtractor(value) : placeholder}
        </Text>
        <ChevronDown size={18} color={value ? theme.colors.text : theme.colors.textMuted} />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={closeModal} />
          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.indicator} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable onPress={closeModal} style={styles.closeButton}>
                <X size={22} color={theme.colors.textMuted} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={keyExtractor}
              renderItem={({ item }) => {
                const isSelected = value && keyExtractor(value) === keyExtractor(item);
                return (
                  <Pressable
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {labelExtractor(item)}
                    </Text>
                    {isSelected && <Check size={20} color={theme.colors.primary} />}
                  </Pressable>
                );
              }}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  label: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.xs,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as TextStyle,
  dropdown: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.xs,
  } as ViewStyle,
  dropdownActive: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
  } as ViewStyle,
  dropdownValue: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
  } as TextStyle,
  dropdownPlaceholder: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  } as TextStyle,
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  } as ViewStyle,
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  } as ViewStyle,
  bottomSheet: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.roundness.xxl,
    borderTopRightRadius: theme.roundness.xxl,
    maxHeight: height * 0.7,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    ...theme.shadows.lg,
  } as ViewStyle,
  indicator: {
    width: 36,
    height: 4,
    backgroundColor: theme.colors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  } as ViewStyle,
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  } as ViewStyle,
  sheetTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
  } as TextStyle,
  closeButton: {
    padding: 4,
  } as ViewStyle,
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  } as ViewStyle,
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: theme.roundness.md,
    marginBottom: 4,
  } as ViewStyle,
  optionRowSelected: {
    backgroundColor: theme.colors.primaryLight,
  } as ViewStyle,
  optionText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
  } as TextStyle,
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  } as TextStyle,
});
