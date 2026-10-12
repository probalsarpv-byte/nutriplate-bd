import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Sun, Globe } from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';
import { radii, spacing } from '../../design-system/tokens/spacing';

interface PremiumHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const PremiumHeader: React.FC<PremiumHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  rightAction,
}) => {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme, language, setLanguage } = useThemeStore();

  const handleLanguageToggle = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>
        )}
        <View style={styles.titleColumn}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rightRow}>
        {rightAction ? (
          rightAction
        ) : (
          <>
            {/* Language Switcher Pill */}
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={handleLanguageToggle}
              activeOpacity={0.7}
            >
              <Text style={[styles.langText, { color: theme.primary }]}>
                {language === 'bn' ? 'বাং' : 'EN'}
              </Text>
            </TouchableOpacity>

            {/* Dark/Light Theme Switcher */}
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              {isDarkMode ? (
                <Sun size={18} color={theme.accent} />
              ) : (
                <Moon size={18} color={theme.primary} />
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: spacing.md,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
