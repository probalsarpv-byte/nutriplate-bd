import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useThemeStore } from '../../stores/themeStore';
import { formatNumber } from '../../localization/formatters';
import { translations } from '../../localization/translations';

interface NutritionRingProps {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

export const NutritionRing: React.FC<NutritionRingProps> = ({
  current,
  target,
  size = 150,
  strokeWidth = 14,
}) => {
  const { theme, language } = useThemeStore();
  const t = translations[language];

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const percentage = target > 0 ? Math.min(1, Math.max(0, current / target)) : 0;
  const strokeDashoffset = circumference - circumference * percentage;
  
  const remaining = Math.max(0, target - current);
  const isExceeded = current > target;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background Track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.borderSubtle}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Active Animated Ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isExceeded ? theme.cautionAlert : theme.primary}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
      <View style={styles.centerTextContainer}>
        <Text style={[styles.consumedNumber, { color: theme.text }]}>
          {formatNumber(current, language, { maximumFractionDigits: 0 })}
        </Text>
        <Text style={[styles.labelKcal, { color: theme.textSecondary }]}>
          {t.kcal}
        </Text>
        <Text style={[styles.statusSubtext, { color: isExceeded ? theme.criticalAlert : theme.accent }]}>
          {isExceeded
            ? `${t.exceeded} +${formatNumber(current - target, language)}`
            : `${t.remaining} ${formatNumber(remaining, language)}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consumedNumber: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  labelKcal: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: -2,
  },
  statusSubtext: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
});
