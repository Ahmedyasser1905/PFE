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
} from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';

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
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {value ? labelExtractor(value) : placeholder}
        </Text>
        <ChevronDown size={20} color={value ? '#1e293b' : '#94a3b8'} />
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
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable onPress={closeModal} style={styles.closeButton}>
                <X size={24} color="#64748b" />
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
                    {isSelected && <Check size={20} color="#2563eb" />}
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
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '700',
    color: '#475569',
    fontSize: 14,
    marginLeft: 4,
  },
  dropdown: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownActive: {
    borderColor: '#2563eb',
    borderWidth: 2,
  },
  dropdownValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  optionRowSelected: {
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 16,
    color: '#334155',
  },
  optionTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
