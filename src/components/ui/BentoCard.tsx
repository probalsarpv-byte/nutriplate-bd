import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { radii, shadows, spacing } from '../../design-system/tokens/spacing';

interface BentoCardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'surface' | 'elevated' | 'muted' | 'glass';
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  style,
  variant = 'surface',
}) => {
  const { theme } = useThemeStore();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'elevated':
        return theme.surfaceElevated;
      case 'muted':
        return theme.surfaceMuted;
      case 'glass':
        return theme.glassBackground;
      default:
        return theme.surface;
    }
  };

  return (
    <View
      style={[
        styles.card,
        shadows.bento,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: theme.borderSubtle,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
});
