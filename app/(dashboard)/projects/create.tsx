import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    X,
    MapPin,
    Briefcase,
    Calendar,
    Building2,
    FileText
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../../constants/theme';
import { BaseInput } from '../../../components/BaseInput';
import { BaseButton } from '../../../components/BaseButton';

export default function CreateProject() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [location, setLocation] = useState('');
    const [budget, setBudget] = useState('');
    const [deadline, setDeadline] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <X size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>New Project</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    <BaseInput
                        label="Project Name"
                        placeholder="e.g. Modern Villa"
                        icon={Building2}
                        value={name}
                        onChangeText={setName}
                    />
                    <BaseInput
                        label="Project Type"
                        placeholder="e.g. Residential"
                        icon={Briefcase}
                        value={type}
                        onChangeText={setType}
                    />
                    <BaseInput
                        label="Location"
                        placeholder="City, Country"
                        icon={MapPin}
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Estimations</Text>
                    <BaseInput
                        label="Budget Estimate (USD)"
                        placeholder="0.00"
                        icon={FileText}
                        value={budget}
                        onChangeText={setBudget}
                    />
                    <BaseInput
                        label="Project Deadline"
                        placeholder="DD/MM/YYYY"
                        icon={Calendar}
                        value={deadline}
                        onChangeText={setDeadline}
                    />
                </View>

                <View style={styles.optionsSection}>
                    <View style={styles.optionRow}>
                        <View>
                            <Text style={styles.optionTitle}>Public Project</Text>
                            <Text style={styles.optionSubtitle}>Allow others to view project stats.</Text>
                        </View>
                        <Switch
                            value={isPublic}
                            onValueChange={setIsPublic}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        />
                    </View>
                </View>

                <BaseButton
                    title="Create Project"
                    onPress={() => router.back()}
                    style={styles.submitBtn}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    closeBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
    },
    content: {
        padding: theme.spacing.xl,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    optionsSection: {
        paddingVertical: theme.spacing.lg,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.xxl,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    optionSubtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    submitBtn: {
        marginTop: theme.spacing.xl,
        marginBottom: 40,
    },
});
