export interface ColorTheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  deepForest: string;
  accent: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // Macronutrient Brand Tokens
  carb: string;
  carbLight: string;
  protein: string;
  proteinLight: string;
  fat: string;
  fatLight: string;
  fibre: string;
  fibreLight: string;
  calories: string;
  caloriesLight: string;

  // Clinical Alert Severity Tokens
  criticalAlert: string;
  criticalAlertBg: string;
  criticalAlertBorder: string;
  cautionAlert: string;
  cautionAlertBg: string;
  cautionAlertBorder: string;
  infoAlert: string;
  infoAlertBg: string;
  infoAlertBorder: string;
  success: string;
  successBg: string;

  // Surfaces & Glassmorphism
  glassBackground: string;
  glassBorder: string;
  shadowColor: string;
}

export const lightTheme: ColorTheme = {
  primary: '#647D44',            // Primary Olive
  primaryLight: '#8CA767',
  primaryDark: '#4A5E32',
  deepForest: '#173C34',         // Deep Forest
  accent: '#16A085',             // Emerald Accent
  background: '#F7F6F0',         // Background Cream
  surface: '#FFFFFF',            // Soft Surface
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#EAE6D9',       // Warm Beige
  border: '#DFDACB',
  borderSubtle: '#EDEAE0',
  text: '#172A26',               // Main Text
  textSecondary: '#68766F',      // Secondary Text
  textMuted: '#8E9B95',
  textInverse: '#FFFFFF',

  // Macronutrients
  carb: '#E9A44C',
  carbLight: '#FCEFD8',
  protein: '#4F9F91',
  proteinLight: '#DEF1EE',
  fat: '#9878BF',
  fatLight: '#F0EAF8',
  fibre: '#2E856E',
  fibreLight: '#DEF5EE',
  calories: '#E27D60',
  caloriesLight: '#FDEAE4',

  // Clinical & Safety Alerts
  criticalAlert: '#CF4B4B',
  criticalAlertBg: '#FDF1F1',
  criticalAlertBorder: '#F7CECE',
  cautionAlert: '#E2A238',
  cautionAlertBg: '#FEF9EC',
  cautionAlertBorder: '#F9E5BA',
  infoAlert: '#4389C9',
  infoAlertBg: '#F0F6FC',
  infoAlertBorder: '#C8DEF4',
  success: '#2E7D32',
  successBg: '#EFF7F0',

  glassBackground: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',
  shadowColor: '#173C34',
};

export const darkTheme: ColorTheme = {
  primary: '#8CA767',
  primaryLight: '#A3BD82',
  primaryDark: '#647D44',
  deepForest: '#0E241F',
  accent: '#1ABC9C',
  background: '#0D1715',         // Deep Forest Charcoal
  surface: '#152420',
  surfaceElevated: '#1D312C',
  surfaceMuted: '#1E332D',
  border: '#27423B',
  borderSubtle: '#1C312C',
  text: '#F2F5F3',
  textSecondary: '#9CB0A7',
  textMuted: '#6E8178',
  textInverse: '#0D1715',

  // Macronutrients (vibrant yet restrained for dark background)
  carb: '#F0B264',
  carbLight: '#3D2D18',
  protein: '#63B3A6',
  proteinLight: '#183832',
  fat: '#AC91D1',
  fatLight: '#322345',
  fibre: '#44A58B',
  fibreLight: '#17382F',
  calories: '#EB947A',
  caloriesLight: '#42241C',

  // Clinical & Safety Alerts
  criticalAlert: '#E56565',
  criticalAlertBg: '#2E1515',
  criticalAlertBorder: '#5C2424',
  cautionAlert: '#F0B34E',
  cautionAlertBg: '#2D2211',
  cautionAlertBorder: '#5B4219',
  infoAlert: '#5B9DD9',
  infoAlertBg: '#152433',
  infoAlertBorder: '#234463',
  success: '#43A047',
  successBg: '#132C15',

  glassBackground: 'rgba(21, 36, 32, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  shadowColor: '#000000',
};
