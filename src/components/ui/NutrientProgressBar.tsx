import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { formatNumber } from '../../localization/formatters';
import { radii, spacing } from '../../design-system/tokens/spacing';

interface NutrientProgressBarProps {
  label: string;
  currentGrams: number;
  targetGrams: number;
  color: string;
  backgroundColor?: string;
  unit?: string;
}

export const NutrientProgressBar: React.FC<NutrientProgressBarProps> = ({
  label,
  currentGrams,
  targetGrams,
  color,
  backgroundColor,
  unit = 'g',
}) => {
  const { theme, language } = useThemeStore();

  const progress = targetGrams > 0 ? Math.min(1, Math.max(0, currentGrams / targetGrams)) : 0;
  const percentageDisplay = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <View style={styles.titleWithDot}>
          <View style={[styles.colorDot, { backgroundColor: color }]} />
          <Text style={[styles.labelText, { color: theme.text }]}>{label}</Text>
        </View>
        <Text style={[styles.valuesText, { color: theme.textSecondary }]}>
          <Text style={[styles.currentText, { color: theme.text }]}>
            {formatNumber(currentGrams, language, { maximumFractionDigits: 1 })}
          </Text>
          /{formatNumber(targetGrams, language, { maximumFractionDigits: 0 })}
          {unit}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: backgroundColor || theme.borderSubtle }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: `${percentageDisplay}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs + 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  titleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  valuesText: {
    fontSize: 12,
    fontWeight: '500',
  },
  currentText: {
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.sm,
  },
});
