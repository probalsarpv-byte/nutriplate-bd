import { BiologicalSex } from '../../types/user';

export interface BMRCalculationResult {
  formula: 'Mifflin-St Jeor' | 'Katch-McArdle';
  bmrKcal: number;
  leanBodyMassKg?: number;
  notes: string;
}

/**
 * Calculates Basal Metabolic Rate (BMR) using scientifically validated formulas.
 * 
 * - Uses Katch-McArdle when reliable body-fat percentage is available.
 * - Defaults to Mifflin-St Jeor (1990 standard).
 */
export function calculateBMR(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: BiologicalSex;
  bodyFatPercent?: number | null;
}): BMRCalculationResult {
  const { weightKg, heightCm, age, sex, bodyFatPercent } = params;

  if (weightKg <= 0 || heightCm <= 0 || age <= 0) {
    throw new Error('Weight, height, and age must be positive values.');
  }

  // Katch-McArdle formula if body fat percentage is present and valid
  if (bodyFatPercent !== null && bodyFatPercent !== undefined && bodyFatPercent >= 4 && bodyFatPercent <= 65) {
    const lbmKg = weightKg * (1 - bodyFatPercent / 100);
    const bmr = 370 + 21.6 * lbmKg;
    return {
      formula: 'Katch-McArdle',
      bmrKcal: Math.round(bmr),
      leanBodyMassKg: Number(lbmKg.toFixed(1)),
      notes: 'Calculated using Katch-McArdle formula based on estimated lean body mass.',
    };
  }

  // Mifflin-St Jeor formula
  // Men: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
  // Women: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
  const sexConstant = sex === 'male' ? 5 : -161;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexConstant;

  return {
    formula: 'Mifflin-St Jeor',
    bmrKcal: Math.round(bmr),
    notes: 'Calculated using Mifflin-St Jeor equation (1990 validated standard).',
  };
}
