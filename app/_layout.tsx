import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, HindSiliguri_400Regular, HindSiliguri_500Medium, HindSiliguri_600SemiBold, HindSiliguri_700Bold } from '@expo-google-fonts/hind-siliguri';
import * as SplashScreen from 'expo-splash-screen';
import { useThemeStore } from '../src/stores/themeStore';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { theme, isDarkMode } = useThemeStore();

  const [fontsLoaded] = useFonts({
    HindSiliguri_400Regular,
    HindSiliguri_500Medium,
    HindSiliguri_600SemiBold,
    HindSiliguri_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="food/search" options={{ presentation: 'card' }} />
        <Stack.Screen name="recipe/new" options={{ presentation: 'card' }} />
        <Stack.Screen name="family-pot/index" options={{ presentation: 'card' }} />
        <Stack.Screen name="smart-plate/index" options={{ presentation: 'card' }} />
        <Stack.Screen name="meal/index" options={{ presentation: 'card' }} />
        <Stack.Screen name="meal/new" options={{ presentation: 'card' }} />
        <Stack.Screen name="meal/compare" options={{ presentation: 'card' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
