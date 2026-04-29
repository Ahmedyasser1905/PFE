import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, TextInputProps } from 'react-native';
import { Eye, EyeOff, LucideIcon } from 'lucide-react-native';
import { theme } from '~/constants/theme';
interface BaseInputProps extends TextInputProps {
    label: string;
    icon?: LucideIcon;
    error?: string;
}
export const BaseInput: React.FC<BaseInputProps> = ({
    label,
    icon: Icon,
    error,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = props.secureTextEntry;
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.inputWrapper,
                    isFocused && styles.inputWrapperFocused,
                    error ? styles.inputWrapperError : null,
                ]}
            >
                {Icon && <Icon size={20} color={theme.colors.textSecondary} style={styles.icon} />}
                <TextInput
                    style={styles.input}
                    placeholderTextColor={theme.colors.placeholder}
                    {...props}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    secureTextEntry={isPassword && !showPassword}
                    autoCapitalize={props.autoCapitalize || "none"}
                />
                {isPassword && (
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        {showPassword ? (
                            <EyeOff size={20} color={theme.colors.textSecondary} />
                        ) : (
                            <Eye size={20} color={theme.colors.textSecondary} />
                        )}
                    </Pressable>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.roundness.md,
        paddingHorizontal: theme.spacing.md,
        height: 52,
    },
    inputWrapperFocused: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.background,
    },
    inputWrapperError: {
        borderColor: theme.colors.error,
    },
    icon: {
        marginRight: theme.spacing.sm,
    },
    input: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 16,
        height: '100%',
    },
    eyeIcon: {
        padding: theme.spacing.xs,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 4,
    },
});


