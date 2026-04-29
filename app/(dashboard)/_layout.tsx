import React, { memo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import Header from '~/components/common/Header';
import BottomNav from '~/components/common/BottomNav';
import { theme } from '~/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardLayout() {
  return (
    <View style={styles.container}>
      <Header />
      
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'default',
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="projects" />
          <Stack.Screen name="estimation-history/index" />
          <Stack.Screen name="all-calculations/index" />
          <Stack.Screen name="calculation-details/[id]" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="settings" />
        </Stack>
      </View>
      
      <BottomNav />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 90 : 70, // Matches BottomNav height
  },
});
