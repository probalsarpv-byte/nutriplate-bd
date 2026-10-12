import { ActivityLevel, EnergyMode, BiologicalSex } from '../../types/user';
import { calculateBMR, BMRCalculationResult } from './bmr';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  highly_active: 1.725,
  very_highly_active: 1.9,
};

export interface TDEECalculationResult {
  bmrResult: BMRCalculationResult;
  tdeeKcal: number;
  activityMultiplier: number;
  targetKcal: number;
  deficitKcal: number;
  deficitPercent: number;
  safetyWarnings: string[];
}

export function calculateTDEE(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: BiologicalSex;
  activityLevel: ActivityLevel;
  energyMode: EnergyMode;
  deficitPercent?: number; // e.g. 15 or 20
  customCalorieTarget?: number | null;
  bodyFatPercent?: number | null;
}): TDEECalculationResult {
  const bmrResult = calculateBMR({
    weightKg: params.weightKg,
    heightCm: params.heightCm,
    age: params.age,
    sex: params.sex,
    bodyFatPercent: params.bodyFatPercent,
  });

  const multiplier = ACTIVITY_MULTIPLIERS[params.activityLevel] || 1.2;
  const tdeeKcal = Math.round(bmrResult.bmrKcal * multiplier);

  let targetKcal = tdeeKcal;
  let deficitKcal = 0;
  let deficitPercent = 0;
  const safetyWarnings: string[] = [];

  if (params.energyMode === 'maintenance') {
    targetKcal = tdeeKcal;
    deficitKcal = 0;
    deficitPercent = 0;
  } else if (params.energyMode === 'reduction') {
    // 15% to 20% conservative starting deficit
    const chosenPercent = Math.min(25, Math.max(10, params.deficitPercent ?? 18));
    deficitPercent = chosenPercent;
    deficitKcal = Math.round(tdeeKcal * (chosenPercent / 100));
    targetKcal = Math.round(tdeeKcal - deficitKcal);
  } else if (params.energyMode === 'custom') {
    if (params.customCalorieTarget && params.customCalorieTarget > 0) {
      targetKcal = Math.round(params.customCalorieTarget);
      deficitKcal = Math.max(0, tdeeKcal - targetKcal);
      deficitPercent = Number(((deficitKcal / tdeeKcal) * 100).toFixed(1));
    }
  }

  // Safety checks
  const absoluteSafetyFloor = params.sex === 'female' ? 1200 : 1500;
  if (targetKcal < absoluteSafetyFloor) {
    safetyWarnings.push(
      `Calorie target of ${targetKcal} kcal is below the standard clinical conservative intake floor (${absoluteSafetyFloor} kcal) for ${params.sex === 'female' ? 'adult females' : 'adult males'}. Please consult a registered clinical dietitian.`
    );
  }

  if (deficitPercent > 25) {
    safetyWarnings.push(
      `A deficit exceeding 25% (${deficitPercent}%) may lead to lean tissue catabolism and nutrient inadequacy.`
    );
  }

  return {
    bmrResult,
    tdeeKcal,
    activityMultiplier: multiplier,
    targetKcal,
    deficitKcal,
    deficitPercent,
    safetyWarnings,
  };
}
