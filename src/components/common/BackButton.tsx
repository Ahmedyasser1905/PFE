/**
 * BackButton — single source of truth for the "go back" affordance.
 *
 * Behaviour:
 *  - If a parent navigator can pop, it pops (`router.back()`).
 *  - Otherwise it routes to `fallbackHref` (default `'/'`) — never a no-op,
 *    never a crash on the root route.
 *  - Auto-flips the icon for RTL languages (Arabic).
 *  - Accepts an `onPress` override so screens with unsaved-changes prompts
 *    or custom guards can wrap the navigation in their own logic without
 *    re-implementing the visuals.
 *
 * Visuals:
 *  - 44×44 hit area (matches Apple HIG / Material guidelines).
 *  - Theme tokens only — no hard-coded colors.
 *  - Two style variants:
 *      'circle' (default) — pill button on a surface background.
 *      'plain'            — bare icon, for transparent / hero headers.
 */
import React, { memo, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { theme } from '~/constants/theme';
import { useLanguage } from '~/context/LanguageContext';

export interface BackButtonProps {
  /** Override the default `router.back()` behaviour. */
  onPress?: () => void;
  /** Where to navigate when there is nothing to pop. Defaults to '/'. */
  fallbackHref?: Href;
  /** Visual treatment. Defaults to 'circle'. */
  variant?: 'circle' | 'plain';
  /** Icon size. Defaults to 22. */
  size?: number;
  /** Icon color. Defaults to `theme.colors.text`. */
  color?: string;
  /** Accessibility label override. */
  accessibilityLabel?: string;
  /** Extra container style. */
  style?: ViewStyle;
  /** Disable the button. */
  disabled?: boolean;
}

const BackButtonImpl: React.FC<BackButtonProps> = ({
  onPress,
  fallbackHref = '/',
  variant = 'circle',
  size = 22,
  color = theme.colors.text,
  accessibilityLabel = 'Go back',
  style,
  disabled,
}) => {
  const router = useRouter();
  const { isRTL } = useLanguage();

  const handlePress = useCallback(() => {
    if (onPress) return onPress();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackHref as any);
    }
  }, [onPress, router, fallbackHref]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        variant === 'circle' ? styles.circle : styles.plain,
        disabled && styles.disabled,
        style,
      ]}
    >
      <ArrowLeft
        size={size}
        color={color}
        strokeWidth={2.5}
        // RN's I18nManager will mirror layout for RTL but Lucide icons render
        // as SVG and aren't auto-flipped. We flip the chevron manually so the
        // arrow always points to the "previous" reading direction.
        style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plain: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});

export const BackButton = memo(BackButtonImpl);
export default BackButton;
