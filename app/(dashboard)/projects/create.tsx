import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, ArrowLeft } from 'lucide-react-native';
import { estimationApi } from '~/api/api';
import { BUDGET_OPTIONS } from '~/constants/config';
import { useSubscriptionContext } from '~/context/SubscriptionContext';
import { NativeSelect } from '~/components/ui/NativeSelect';
import { AppFeedback } from '~/components/ui/AppFeedback';

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

const budgets: Budget[] = [...BUDGET_OPTIONS];

export default function CreateProject() {
  const router = useRouter();
  const { canCreateProject } = useSubscriptionContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(budgets[1]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [feedback, setFeedback] = useState<any>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  // 📸 IMAGE PICKER
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        setFeedback({
          visible: true,
          type: 'error',
          title: 'Permission Denied',
          message: 'Gallery permission is required.',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        console.log('[IMAGE PICKER] Image selected:', result.assets[0].uri);
        setImage(result.assets[0].uri);
        setUploadedImageUrl(null);
        await uploadImageToServer(result.assets[0].uri);
      }
    } catch (error) {
      console.log('[IMAGE PICKER] Error:', error);
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Image Error',
        message: 'Failed to pick image',
      });
    }
  };

  // 🖼️ UPLOAD IMAGE TO SERVER
  const uploadImageToServer = async (imageUri: string) => {
    try {
      setUploadingImage(true);
      console.log('[IMAGE UPLOAD] Starting upload:', imageUri);

      const formData = new FormData();
      const filename = imageUri.split('/').pop() || `project-${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: mimeType,
      } as any);

      console.log('[IMAGE UPLOAD] Sending to server:', { filename, mimeType });

      // Use the correct API method
      const uploadResponse = await estimationApi.uploadProjectImage(formData);

      console.log('[IMAGE UPLOAD] Response:', uploadResponse);

      if (uploadResponse?.imageUrl || uploadResponse?.url || uploadResponse?.image) {
        const imageUrl = uploadResponse.imageUrl || uploadResponse.url || uploadResponse.image;
        setUploadedImageUrl(imageUrl);
        console.log('[IMAGE UPLOAD] Success:', imageUrl);

        setFeedback({
          visible: true,
          type: 'success',
          title: 'Image Uploaded',
          message: 'Project image uploaded successfully',
          primaryText: 'OK',
          onPrimary: () => setFeedback({ visible: false }),
        });
      } else {
        console.log('[IMAGE UPLOAD] No URL in response, using local URI');
        setUploadedImageUrl(imageUri);
        setFeedback({
          visible: true,
          type: 'success',
          title: 'Image Ready',
          message: 'Image selected and ready to upload with project',
          primaryText: 'OK',
          onPrimary: () => setFeedback({ visible: false }),
        });
      }
    } catch (error: any) {
      console.log('[IMAGE UPLOAD] Error:', error);
      // Don't block project creation if image upload fails
      setUploadedImageUrl(imageUri);
      setFeedback({
        visible: true,
        type: 'warning',
        title: 'Image Upload Info',
        message: 'Image will be uploaded with project. You can continue.',
        primaryText: 'OK',
        onPrimary: () => setFeedback({ visible: false }),
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // 🚀 CREATE PROJECT
  const handleCreate = async () => {
    if (!name.trim()) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Missing Field',
        message: 'Project name is required',
        primaryText: 'OK',
        onPrimary: () => setFeedback({ visible: false }),
      });
      return;
    }

    if (!type) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Missing Field',
        message: 'Select a project type',
        primaryText: 'OK',
        onPrimary: () => setFeedback({ visible: false }),
      });
      return;
    }

    if (!canCreateProject) {
      setFeedback({
        visible: true,
        type: 'warning',
        title: 'Limit Reached',
        message: 'You reached your current plan limit.',
        primaryText: 'Check Subscription',
        secondaryText: 'Later',
        onPrimary: () => {
          setFeedback({ visible: false });
          router.push('/(dashboard)/settings/subscription');
        },
        onSecondary: () => setFeedback({ visible: false }),
      });
      return;
    }

    setLoading(true);

    try {
      const combinedDescription = [
        `Type: ${type}`,
        location ? `Location: ${location}` : '',
        description ? `\n---\n${description}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const budgetType = selectedBudget?.id || 'MEDIUM';

      console.log('[CREATE PROJECT] Sending payload');
      console.log('[CREATE PROJECT] Image URL:', uploadedImageUrl || image);

      let payload: any = {
        name: name.trim(),
        description: combinedDescription,
        budget_type: budgetType,
      };

      // Include image if available (either uploaded URL or local URI)
      if (uploadedImageUrl || image) {
        payload.image = uploadedImageUrl || image;
      }

      console.log('[CREATE PROJECT] Payload:', payload);

      const response = await estimationApi.createProject(payload);

      console.log('[CREATE PROJECT] Response:', response);

      setFeedback({
        visible: true,
        type: 'success',
        title: 'Project Created',
        message: 'Your project has been created successfully.',
        primaryText: 'Go to Projects',
        onPrimary: () => {
          setFeedback({ visible: false });
          console.log('[NAVIGATION] Redirecting to /(dashboard)/projects');
          router.replace('/(dashboard)/projects');
        },
      });

    } catch (error: any) {
      console.log('[CREATE PROJECT] Error:', error);

      setFeedback({
        visible: true,
        type: 'error',
        title: 'Creation Failed',
        message: error?.message || 'Something went wrong',
        primaryText: 'OK',
        onPrimary: () => setFeedback({ visible: false }),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} />
        </Pressable>
        <Text style={styles.title}>New Project</Text>
      </View>

      <Pressable
        style={[styles.imagePicker, uploadingImage && styles.imagePickerDisabled]}
        onPress={pickImage}
        disabled={uploadingImage}
      >
        {uploadingImage ? (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.uploadingText}>Uploading image...</Text>
          </View>
        ) : image ? (
          <>
            <Image
              source={{ uri: image }}
              style={styles.image}
              onError={(e) => {
                console.error('[Image] Render Error:', e.nativeEvent.error);
                setImage(null);
              }}
            />
            {uploadedImageUrl && (
              <View style={styles.uploadedBadge}>
                <Text style={styles.uploadedBadgeText}>✓ Ready</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholder}>
            <Camera size={32} color="#94a3b8" />
            <Text style={styles.placeholderText}>Add Image</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Project Name"
          placeholderTextColor="#cbd5e1"
          value={name}
          onChangeText={setName}
          editable={!loading && !uploadingImage}
        />

        <NativeSelect
          label="Type"
          value={type}
          options={PROJECT_TYPES}
          keyExtractor={(i) => i}
          labelExtractor={(i) => i}
          onSelect={setType}
        />

        <TextInput
          style={styles.input}
          placeholder="Location"
          placeholderTextColor="#cbd5e1"
          value={location}
          onChangeText={setLocation}
          editable={!loading && !uploadingImage}
        />

        <NativeSelect
          label="Budget"
          value={selectedBudget}
          options={budgets}
          keyExtractor={(i) => i.id}
          labelExtractor={(i) => i.label}
          onSelect={setSelectedBudget}
        />

        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Description"
          placeholderTextColor="#cbd5e1"
          value={description}
          onChangeText={setDescription}
          multiline
          editable={!loading && !uploadingImage}
        />

        <Pressable
          style={[styles.button, (loading || uploadingImage) && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={loading || uploadingImage}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>
              {uploadingImage ? 'Uploading...' : 'Create Project'}
            </Text>
          )}
        </Pressable>
      </View>

      <AppFeedback {...feedback} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  header: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    alignItems: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },

  imagePicker: {
    height: 180,
    margin: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },

  imagePickerDisabled: {
    opacity: 0.6,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  uploadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },

  uploadingText: {
    color: '#64748b',
    fontWeight: '600',
    marginTop: 10,
  },

  uploadedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  uploadedBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  placeholder: {
    alignItems: 'center',
    gap: 8,
  },

  placeholderText: {
    color: '#94a3b8',
    fontWeight: '600',
  },

  form: {
    padding: 16,
  },

  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#0f172a',
  },

  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});