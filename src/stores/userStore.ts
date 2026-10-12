import { create } from 'zustand';
import { UserHealthProfile, HealthConditionId } from '../types/user';
import { calculateTDEE } from '../engines/energy/tdee';
import { calculateMacros } from '../engines/macros/macroCalculator';

interface UserState {
  profile: UserHealthProfile;
  calorieTarget: number;
  bmr: number;
  tdee: number;
  carbTargetGrams: number;
  proteinTargetGrams: number;
  fatTargetGrams: number;
  fibreTargetGrams: number;
  safetyWarnings: string[];
  
  updateProfile: (partial: Partial<UserHealthProfile>) => void;
  toggleCondition: (conditionId: HealthConditionId) => void;
}

const DEFAULT_PROFILE: UserHealthProfile = {
  id: 'usr_default_01',
  name: 'রাফি আহমেদ',
  age: 28,
  sex: 'male',
  heightCm: 172,
  weightKg: 68,
  bodyFatPercent: null,
  activityLevel: 'moderately_active',
  energyMode: 'maintenance',
  reductionDeficitPercent: 18,
  customCalorieTarget: null,
  macroPreset: 'moderate',
  carbPercent: 45,
  proteinPercent: 25,
  fatPercent: 30,
  conditions: [],
  allergens: [],
  language: 'bn',
  isDarkMode: false,
  onboardingCompleted: true,
};

function computeTargets(profile: UserHealthProfile) {
  const tdeeResult = calculateTDEE({
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    age: profile.age,
    sex: profile.sex,
    activityLevel: profile.activityLevel,
    energyMode: profile.energyMode,
    deficitPercent: profile.reductionDeficitPercent,
    customCalorieTarget: profile.customCalorieTarget,
    bodyFatPercent: profile.bodyFatPercent,
  });

  const macroResult = calculateMacros({
    targetCalories: tdeeResult.targetKcal,
    preset: profile.macroPreset,
    customPercents: {
      carb: profile.carbPercent,
      protein: profile.proteinPercent,
      fat: profile.fatPercent,
    },
    customGrams: {
      carb: profile.customCarbGrams,
      protein: profile.customProteinGrams,
      fat: profile.customFatGrams,
    },
  });

  return {
    bmr: tdeeResult.bmrResult.bmrKcal,
    tdee: tdeeResult.tdeeKcal,
    calorieTarget: tdeeResult.targetKcal,
    carbTargetGrams: macroResult.carbGrams,
    proteinTargetGrams: macroResult.proteinGrams,
    fatTargetGrams: macroResult.fatGrams,
    fibreTargetGrams: macroResult.fibreTargetGrams,
    safetyWarnings: tdeeResult.safetyWarnings,
  };
}

const initialTargets = computeTargets(DEFAULT_PROFILE);

export const useUserStore = create<UserState>((set) => ({
  profile: DEFAULT_PROFILE,
  ...initialTargets,

  updateProfile: (partial) =>
    set((state) => {
      const nextProfile = { ...state.profile, ...partial };
      const targets = computeTargets(nextProfile);
      return {
        profile: nextProfile,
        ...targets,
      };
    }),

  toggleCondition: (conditionId) =>
    set((state) => {
      const exists = state.profile.conditions.includes(conditionId);
      const updatedConditions = exists
        ? state.profile.conditions.filter((c) => c !== conditionId)
        : [...state.profile.conditions, conditionId];
      return {
        profile: {
          ...state.profile,
          conditions: updatedConditions,
        },
      };
    }),
}));
