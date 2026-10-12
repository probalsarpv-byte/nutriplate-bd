import { TextStyle, Platform } from 'react-native';

export const fontFamilies = {
  bengali: {
    regular: 'HindSiliguri_400Regular',
    medium: 'HindSiliguri_500Medium',
    semiBold: 'HindSiliguri_600SemiBold',
    bold: 'HindSiliguri_700Bold',
  },
  system: {
    regular: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }),
    medium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'sans-serif-medium' }),
    semiBold: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'sans-serif-medium' }),
    bold: Platform.select({ ios: 'System', android: 'sans-serif-bold', default: 'sans-serif' }),
  },
};

export const typography: Record<string, TextStyle> = {
  displayLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headline: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  titleLarge: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  metricLarge: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  metricMedium: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  metricSmall: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
};
