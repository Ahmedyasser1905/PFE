import { View } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { theme } from '../../constants/theme';

export default function DashboardLayout() {
  const pathname = usePathname();
  const isChat = pathname.includes('/chat');

  return (
    <View style={{ flex: 1 }}>

      {/* Header */}
      {!isChat && <Header />}

      {/* Pages */}
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        />
      </View>

      {/* Bottom Navigation */}
      {!isChat && <BottomNav theme={theme} />}

    </View>
  );
}