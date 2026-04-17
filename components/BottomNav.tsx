import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, HardHat, Plus, MessageCircle, Settings } from 'lucide-react-native';
import { theme } from '~/constants/theme';

export default function BottomNav({ theme }: any) {
    const router = useRouter();

    return (
        <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
                <TrendingUp size={24} color={theme.colors.primary} />
                <Text style={[styles.navLabel, { color: theme.colors.primary }]}>Board</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/projects/project')}>
                <HardHat size={24} color={theme.colors.textSecondary} />
                <Text style={styles.navLabel}>Projects</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navItem, styles.navItemMain]}>
                <View style={styles.plusIconBox}>
                    <Plus size={28} color="white" />
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/chat')}>
                <MessageCircle size={24} color={theme.colors.textSecondary} />
                <Text style={styles.navLabel}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings/profile')}>
                <Settings size={24} color={theme.colors.textSecondary} />
                <Text style={styles.navLabel}>Settings</Text>
            </TouchableOpacity>
        </View>
    );
}


   const styles = StyleSheet.create({
       
       bottomNav: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        height: 75,
        backgroundColor: 'white',
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 15,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navItemMain: {
        marginTop: -35,
    },
    plusIconBox: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    navLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    logoutIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
    }
});