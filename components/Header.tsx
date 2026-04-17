import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { Styles } from '~/constants/Styles';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';


const Header = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <View style={Styles.header}>
      <View>
        <Text style={Styles.greeting}>
          Hello, {user?.fullName?.split(' ')[0] || 'Engineer'}
        </Text>

        <Text style={Styles.subGreeting}>
          Here is the status of your projects today.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        
        {/* Logout */}
        <TouchableOpacity
          style={Styles.promoBtn}
          onPress={logout}
        >
          <LogOut size={22} color="#ef4444" />
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          style={Styles.profileBadge}
          onPress={() => router.push('/settings/profile')}
        >
          <View style={Styles.avatarPlaceholder}>
            <Text style={Styles.avatarText}>
              {user?.fullName?.charAt(0) || 'I'}
            </Text>
          </View>
        </TouchableOpacity>

      </View>
    </View>
  );
};

export default Header;