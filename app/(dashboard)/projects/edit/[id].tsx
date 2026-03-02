import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Building2, MapPin, Briefcase, Calendar } from 'lucide-react-native';
import { theme } from '../../../../constants/theme';
import { BaseInput } from '../../../../components/BaseInput';
import { BaseButton } from '../../../../components/BaseButton';

export default function EditProject() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Mock initial data
    const [name, setName] = useState('Palm Residence');
    const [location, setLocation] = useState('Dubai, UAE');

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Edit Project</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <BaseInput
                    label="Project Name"
                    value={name}
                    onChangeText={setName}
                    icon={Building2}
                />
                <BaseInput
                    label="Location"
                    value={location}
                    onChangeText={setLocation}
                    icon={MapPin}
                />
                <BaseInput
                    label="Project Type"
                    placeholder="Residential"
                    value={''}
                    onChangeText={() => { }}
                    icon={Briefcase}
                />

                <BaseButton
                    title="Save Changes"
                    onPress={() => router.back()}
                    style={styles.saveBtn}
                />

                <TouchableOpacity style={styles.deleteBtn}>
                    <Text style={styles.deleteText}>Archive Project</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backBtn: { width: 40 },
    title: { fontSize: 20, fontWeight: '800' },
    content: { padding: theme.spacing.xl },
    saveBtn: { marginTop: 24 },
    deleteBtn: { marginTop: 32, alignItems: 'center' },
    deleteText: { color: '#ef4444', fontWeight: '600', fontSize: 15 }
});
