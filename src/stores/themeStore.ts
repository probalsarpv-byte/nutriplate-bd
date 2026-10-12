import { create } from 'zustand';
import { lightTheme, darkTheme, ColorTheme } from '../design-system/tokens/colors';
import { Language } from '../localization/translations';

interface ThemeState {
  isDarkMode: boolean;
  theme: ColorTheme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: false,
  theme: lightTheme,
  language: 'bn',
  toggleTheme: () =>
    set((state) => {
      const nextDark = !state.isDarkMode;
      return {
        isDarkMode: nextDark,
        theme: nextDark ? darkTheme : lightTheme,
      };
    }),
  setLanguage: (lang: Language) => set({ language: lang }),
}));
