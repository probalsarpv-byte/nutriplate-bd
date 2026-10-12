import { MacroPreset } from '../../types/user';

export interface MacroSplit {
  carbPercent: number;
  proteinPercent: number;
  fatPercent: number;
  carbGrams: number;
  proteinGrams: number;
  fatGrams: number;
  carbKcal: number;
  proteinKcal: number;
  fatKcal: number;
  fibreTargetGrams: number;
  isValid: boolean;
  validationError?: string;
}

export const MACRO_PRESETS: Record<Exclude<MacroPreset, 'custom'>, { carb: number; protein: number; fat: number }> = {
  moderate: { carb: 45, protein: 25, fat: 30 },
  high_activity: { carb: 50, protein: 25, fat: 25 },
  low_carb: { carb: 25, protein: 25, fat: 50 },
};

/**
 * Calculates macronutrient gram targets from target calories and percentage/gram distributions.
 * Conversions: Carbohydrate 4 kcal/g, Protein 4 kcal/g, Fat 9 kcal/g.
 * Dietary fibre baseline recommendation: 14g per 1000 kcal (WHO / Institute of Medicine).
 */
export function calculateMacros(params: {
  targetCalories: number;
  preset: MacroPreset;
  customPercents?: { carb: number; protein: number; fat: number };
  customGrams?: { carb?: number | null; protein?: number | null; fat?: number | null };
}): MacroSplit {
  const { targetCalories, preset, customPercents, customGrams } = params;

  // Fibre target: approximately 14g per 1000 kcal, minimum 25g
  const fibreTarget = Math.max(25, Math.round((targetCalories / 1000) * 14));

  // If explicit custom grams are provided
  if (
    preset === 'custom' &&
    customGrams &&
    customGrams.carb !== undefined &&
    customGrams.protein !== undefined &&
    customGrams.fat !== undefined &&
    customGrams.carb !== null &&
    customGrams.protein !== null &&
    customGrams.fat !== null
  ) {
    const carbG = Number(customGrams.carb);
    const proteinG = Number(customGrams.protein);
    const fatG = Number(customGrams.fat);

    const carbKcal = Math.round(carbG * 4);
    const proteinKcal = Math.round(proteinG * 4);
    const fatKcal = Math.round(fatG * 9);
    const totalMacroKcal = carbKcal + proteinKcal + fatKcal;

    const carbPercent = totalMacroKcal > 0 ? Number(((carbKcal / totalMacroKcal) * 100).toFixed(1)) : 0;
    const proteinPercent = totalMacroKcal > 0 ? Number(((proteinKcal / totalMacroKcal) * 100).toFixed(1)) : 0;
    const fatPercent = totalMacroKcal > 0 ? Number(((fatKcal / totalMacroKcal) * 100).toFixed(1)) : 0;

    return {
      carbPercent,
      proteinPercent,
      fatPercent,
      carbGrams: Math.round(carbG),
      proteinGrams: Math.round(proteinG),
      fatGrams: Math.round(fatG),
      carbKcal,
      proteinKcal,
      fatKcal,
      fibreTargetGrams: fibreTarget,
      isValid: true,
    };
  }

  // Determine percentages
  let cp = 45;
  let pp = 25;
  let fp = 30;

  if (preset === 'custom' && customPercents) {
    cp = customPercents.carb;
    pp = customPercents.protein;
    fp = customPercents.fat;
  } else if (preset in MACRO_PRESETS) {
    const p = MACRO_PRESETS[preset as Exclude<MacroPreset, 'custom'>];
    cp = p.carb;
    pp = p.protein;
    fp = p.fat;
  }

  const sum = cp + pp + fp;
  const isValid = Math.abs(sum - 100) < 0.1;
  const validationError = isValid ? undefined : `Macro percentages must sum to 100% (currently ${sum}%).`;

  const carbKcal = Math.round(targetCalories * (cp / 100));
  const proteinKcal = Math.round(targetCalories * (pp / 100));
  const fatKcal = Math.round(targetCalories * (fp / 100));

  const carbGrams = Math.round(carbKcal / 4);
  const proteinGrams = Math.round(proteinKcal / 4);
  const fatGrams = Math.round(fatKcal / 9);

  return {
    carbPercent: cp,
    proteinPercent: pp,
    fatPercent: fp,
    carbGrams,
    proteinGrams,
    fatGrams,
    carbKcal,
    proteinKcal,
    fatKcal,
    fibreTargetGrams: fibreTarget,
    isValid,
    validationError,
  };
}
