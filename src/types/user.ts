export type BiologicalSex = 'male' | 'female';

export type ActivityLevel = 
  | 'sedentary'          // 1.2
  | 'lightly_active'     // 1.375
  | 'moderately_active'  // 1.55
  | 'highly_active'      // 1.725
  | 'very_highly_active';// 1.9

export type EnergyMode = 'maintenance' | 'reduction' | 'custom';

export type MacroPreset = 'moderate' | 'high_activity' | 'low_carb' | 'custom';

export type HealthConditionId =
  | 't2_diabetes'
  | 'insulin_resistance'
  | 'hypertension'
  | 'dyslipidemia'
  | 'fatty_liver'
  | 'ckd'
  | 'kidney_stones'
  | 'gout'
  | 'hypothyroidism'
  | 'hashimotos'
  | 'ibs'
  | 'gerd'
  | 'celiac'
  | 'lactose_intolerance'
  | 'food_allergies'
  | 'histamine_intolerance';

export interface UserHealthProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  age: number;
  sex: BiologicalSex;
  heightCm: number;
  weightKg: number;
  bodyFatPercent?: number | null;
  activityLevel: ActivityLevel;
  energyMode: EnergyMode;
  reductionDeficitPercent: number; // typically 15-20%
  customCalorieTarget?: number | null;
  
  // Macronutrient Targets
  macroPreset: MacroPreset;
  carbPercent: number;
  proteinPercent: number;
  fatPercent: number;
  customCarbGrams?: number | null;
  customProteinGrams?: number | null;
  customFatGrams?: number | null;

  // Clinical & Pathological flags
  conditions: HealthConditionId[];
  allergens: string[];
  medications?: string[];

  // App Preferences
  language: 'bn' | 'en';
  isDarkMode: boolean;
  onboardingCompleted: boolean;
}
