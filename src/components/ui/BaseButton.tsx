import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { theme } from '~/constants/theme';
interface BaseButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
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
        height: 54,
        borderRadius: theme.roundness.lg,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: theme.spacing.lg,
    } as ViewStyle,
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    primaryButton: {
        backgroundColor: theme.colors.primary,
        ...theme.shadows.sm,
    } as ViewStyle,
    secondaryButton: {
        backgroundColor: theme.colors.surface,
    } as ViewStyle,
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.border,
    } as ViewStyle,
    ghostButton: {
        backgroundColor: 'transparent',
    } as ViewStyle,
    disabledButton: {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    } as ViewStyle,
    baseText: {
        ...theme.typography.bodyBold,
        letterSpacing: 0.2,
    } as TextStyle,
    primaryText: {
        color: theme.colors.white,
    } as TextStyle,
    secondaryText: {
        color: theme.colors.text,
    } as TextStyle,
    outlineText: {
        color: theme.colors.textSecondary,
    } as TextStyle,
    ghostText: {
        color: theme.colors.primary,
    } as TextStyle,
    iconLeft: {
        marginRight: 10,
    } as ViewStyle,
    iconRight: {
        marginLeft: 10,
    } as ViewStyle,
});


