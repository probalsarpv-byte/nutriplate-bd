import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../../stores/themeStore';
import { radii, spacing } from '../../design-system/tokens/spacing';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'critical';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  style,
  textStyle,
  disabled = false,
}) => {
  const { theme } = useThemeStore();

  const handlePress = () => {
    if (disabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Haptics optional fallback
    }
    onPress();
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.borderSubtle;
    switch (variant) {
      case 'secondary':
        return theme.surfaceMuted;
      case 'outline':
        return 'transparent';
      case 'critical':
        return theme.criticalAlert;
      default:
        return theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textMuted;
    switch (variant) {
      case 'secondary':
        return theme.text;
      case 'outline':
        return theme.primary;
      case 'critical':
        return '#FFFFFF';
      default:
        return theme.textInverse;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: variant === 'outline' ? theme.primary : 'transparent',
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon ? <>{icon}</> : null}
      <Text style={[styles.title, { color: getTextColor() }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.card,
    gap: spacing.sm,
    minHeight: 50,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
