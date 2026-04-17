import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, ArrowLeft } from 'lucide-react-native';
import { estimationApi } from '~/api/api';

interface Budget {
  id: string;
  label: string;
  value: number;
}

const PROJECT_TYPES = [
  'Résidentiel',
  'Commercial',
  'Industriel',
  'Infrastructure',
  'Rénovation',
  'Autre',
];

const budgets: Budget[] = [
  { id: '1', label: '< 10M DA', value: 10000000 },
  { id: '2', label: '10M - 50M DA', value: 50000000 },
  { id: '3', label: '50M - 100M DA', value: 100000000 },
  { id: '4', label: '100M+ DA', value: 200000000 },
];

export default function CreateProject() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [openBudget, setOpenBudget] = useState(false);
  const [openType, setOpenType] = useState(false);
  const [loading, setLoading] = useState(false);

  // 📸 Pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 🚀 CREATE PROJECT — using the API client
  const handleCreate = async () => {
    // Client-side validation
    if (!name.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }
    if (!type) {
      Alert.alert('Error', 'Please select a project type');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        type,
        budget: selectedBudget?.value,
      };

      const data = await estimationApi.createProject(payload);
      const projectId = data._id;

      Alert.alert('Success', 'Project created successfully!', [
        { text: 'OK', onPress: () => router.push(`/projects/${projectId}`) },
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to create project';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Back button */}
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <ArrowLeft size={24} color="#0f172a" />
        <Text style={styles.backText}>Create Project</Text>
      </Pressable>

      {/* IMAGE */}
      <Pressable style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Camera size={32} color="#94a3b8" />
            <Text style={styles.imagePlaceholderText}>Add Photo</Text>
          </View>
        )}
      </Pressable>

      {/* NAME */}
      <Text style={styles.label}>Project Name *</Text>
      <TextInput
        placeholder="e.g. Villa El Achour"
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholderTextColor="#94a3b8"
      />

      {/* TYPE */}
      <Text style={styles.label}>Project Type *</Text>
      <Pressable
        style={styles.dropdown}
        onPress={() => { setOpenType(!openType); setOpenBudget(false); }}
      >
        <Text style={type ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {type || 'Select Type'}
        </Text>
      </Pressable>
      {openType && (
        <View style={styles.dropdownList}>
          {PROJECT_TYPES.map(t => (
            <Pressable
              key={t}
              style={[styles.dropdownItem, t === type && styles.dropdownItemActive]}
              onPress={() => { setType(t); setOpenType(false); }}
            >
              <Text style={t === type ? styles.dropdownItemTextActive : undefined}>{t}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* LOCATION */}
      <Text style={styles.label}>Location</Text>
      <TextInput
        placeholder="e.g. Alger, Hydra"
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholderTextColor="#94a3b8"
      />

      {/* DESCRIPTION */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        placeholder="Describe your project..."
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholderTextColor="#94a3b8"
      />

      {/* BUDGET */}
      <Text style={styles.label}>Budget</Text>
      <Pressable
        style={styles.dropdown}
        onPress={() => { setOpenBudget(!openBudget); setOpenType(false); }}
      >
        <Text style={selectedBudget ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {selectedBudget ? selectedBudget.label : 'Select Budget'}
        </Text>
      </Pressable>
      {openBudget && (
        <View style={styles.dropdownList}>
          {budgets.map(b => (
            <Pressable
              key={b.id}
              style={[styles.dropdownItem, b.id === selectedBudget?.id && styles.dropdownItemActive]}
              onPress={() => { setSelectedBudget(b); setOpenBudget(false); }}
            >
              <Text style={b.id === selectedBudget?.id ? styles.dropdownItemTextActive : undefined}>
                {b.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* CREATE BUTTON */}
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Project</Text>
        )}
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  imagePicker: {
    height: 180,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    color: '#334155',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 15,
    color: '#0f172a',
  },
  dropdown: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dropdownValue: {
    fontSize: 15,
    color: '#0f172a',
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: '#94a3b8',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dropdownItemActive: {
    backgroundColor: '#eff6ff',
  },
  dropdownItemTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});