import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, ViewStyle, TextStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { theme } from '../constants/theme';
interface BaseButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    style?: ViewStyle;
    textStyle?: TextStyle;
}
export const BaseButton: React.FC<BaseButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'right',
    style,
    textStyle,
}) => {
    const getButtonStyle = () => {
        switch (variant) {
            case 'outline':
                return styles.outlineButton;
            case 'secondary':
                return styles.secondaryButton;
            case 'ghost':
                return styles.ghostButton;
            default:
                return styles.primaryButton;
        }
    };
    const getTextStyle = () => {
        switch (variant) {
            case 'outline':
                return styles.outlineText;
            case 'secondary':
                return styles.secondaryText;
            case 'ghost':
                return styles.ghostText;
            default:
                return styles.primaryText;
        }
    };
    return (
        <TouchableOpacity
            style={[styles.baseButton, getButtonStyle(), style, (disabled || loading) && styles.disabledButton]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? 'white' : theme.colors.primary} />
            ) : (
                <View style={styles.content}>
                    {Icon && iconPosition === 'left' && <Icon size={20} color={getTextStyle().color} style={styles.iconLeft} />}
                    <Text style={[styles.baseText, getTextStyle(), textStyle]}>{title}</Text>
                    {Icon && iconPosition === 'right' && <Icon size={20} color={getTextStyle().color} style={styles.iconRight} />}
                </View>
            )}
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    baseButton: {
        height: 52,
        borderRadius: theme.roundness.md,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: theme.spacing.lg,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
        backgroundColor: theme.colors.surface,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    ghostButton: {
        backgroundColor: 'transparent',
    },
    disabledButton: {
        opacity: 0.6,
    },
    baseText: {
        fontSize: 16,
        fontWeight: '700',
    },
    primaryText: {
        color: 'white',
    },
    secondaryText: {
        color: theme.colors.text,
    },
    outlineText: {
        color: theme.colors.primary,
    },
    ghostText: {
        color: theme.colors.primary,
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
});
