import React, { ReactNode } from 'react';
import { View, StyleSheet, StatusBar, ViewStyle, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../stores/themeStore';

interface PremiumScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const PremiumScreen: React.FC<PremiumScreenProps> = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
}) => {
  const { theme, isDarkMode } = useThemeStore();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }, style]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.staticContent, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 96,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
