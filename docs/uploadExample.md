# Cloudinary Upload - React Native Example

This documentation shows how to integrate image selection and uploading into your React Native app using the newly created `/api/upload` endpoint.

## 1. Setup

Ensure you have your backend's network IP address. From your server logs, it's currently: `192.168.1.4`.

## 2. Implementation logic

```tsx
import React, { useState } from 'react';
import { View, Button, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const API_BASE_URL = "http://192.168.1.4:5000/api";

export const ImageUploadComponent = () => {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      // 1. Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "We need access to your photos to upload.");
        return;
      }

      // 2. Launch library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log("[ImagePicker] Result:", JSON.stringify(result, null, 2));

      // 3. Extract URI safely
      if (result && !result.canceled && result.assets && result.assets[0]?.uri) {
        const uri = result.assets[0].uri;
        
        // Ensure it's a valid local file path
        if (typeof uri === 'string' && uri.startsWith('file')) {
          console.log("[ImagePicker] Success! URI:", uri);
          setImage(uri);
        } else {
          throw new Error("Invalid image path received");
        }
      }
    } catch (error: any) {
      console.error("[ImagePicker] Fatal Error:", error);
      Alert.alert("Error", error.message || "Failed to pick image");
    }
  };

  const uploadImage = async () => {
    if (!image) return Alert.alert("Error", "Please select an image first");

    setUploading(true);
    try {
      const formData = new FormData();
      
      const filename = image.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      // @ts-ignore - FormData needs this structure in React Native
      formData.append('file', {
        uri: image,
        name: filename,
        type: type,
      });

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (result.status === 'ok') {
        Alert.alert("Success", "Image uploaded successfully!");
        console.log("Cloudinary URL:", result.data.url);
      } else {
        throw new Error(result.error?.message || "Upload failed");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Upload Error", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      
      {typeof image === 'string' && image.length > 0 ? (
        <Image 
          source={{ uri: image }} 
          style={{ width: 200, height: 200, marginVertical: 20, borderRadius: 10 }}
          onError={(e) => {
             console.error("[Image Preview] Failed:", e.nativeEvent.error);
             setImage(null);
             Alert.alert("Load Error", "Selected file could not be displayed.");
          }}
        />
      ) : (
        <View style={{ width: 200, height: 200, backgroundColor: '#eee', marginVertical: 20, justifyContent: 'center', alignItems: 'center' }}>
           <ActivityIndicator size="small" />
        </View>
      )}

      {uploading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Upload to Cloudinary" onPress={uploadImage} disabled={!image} />
      )}
    </View>
  );
};
```

## 3. Key Security Points
- This setup keeps the **Cloudinary API Secret** strictly on the backend.
- The frontend only talks to your own server.
- The backend validates the file type and size before sending it to Cloudinary.
