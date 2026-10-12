import { calculateBMR } from '../src/engines/energy/bmr';
import { calculateTDEE } from '../src/engines/energy/tdee';
import { calculateMacros } from '../src/engines/macros/macroCalculator';

describe('Energy and Metabolic Engines', () => {
  test('calculates BMR accurately for males using Mifflin-St Jeor', () => {
    // 70kg, 175cm, 30 years, male: 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75 -> 1649
    const result = calculateBMR({
      weightKg: 70,
      heightCm: 175,
      age: 30,
      sex: 'male',
    });
    expect(result.formula).toBe('Mifflin-St Jeor');
    expect(result.bmrKcal).toBe(1649);
  });

  test('calculates BMR accurately for females using Mifflin-St Jeor', () => {
    // 60kg, 160cm, 28 years, female: 10*60 + 6.25*160 - 5*28 - 161 = 600 + 1000 - 140 - 161 = 1299
    const result = calculateBMR({
      weightKg: 60,
      heightCm: 160,
      age: 28,
      sex: 'female',
    });
    expect(result.formula).toBe('Mifflin-St Jeor');
    expect(result.bmrKcal).toBe(1299);
  });

  test('calculates BMR using Katch-McArdle when body fat % is present', () => {
    // 70kg, 20% body fat: LBM = 70 * 0.8 = 56kg. BMR = 370 + 21.6 * 56 = 370 + 1209.6 = 1579.6 -> 1580
    const result = calculateBMR({
      weightKg: 70,
      heightCm: 175,
      age: 30,
      sex: 'male',
      bodyFatPercent: 20,
    });
    expect(result.formula).toBe('Katch-McArdle');
    expect(result.bmrKcal).toBe(1580);
    expect(result.leanBodyMassKg).toBe(56);
  });

  test('calculates TDEE with moderate activity multiplier', () => {
    // BMR 1649, moderate = 1.55 multiplier -> 2555.95 -> 2556
    const tdeeResult = calculateTDEE({
      weightKg: 70,
      heightCm: 175,
      age: 30,
      sex: 'male',
      activityLevel: 'moderately_active',
      energyMode: 'maintenance',
    });
    expect(tdeeResult.tdeeKcal).toBe(2556);
    expect(tdeeResult.targetKcal).toBe(2556);
    expect(tdeeResult.deficitKcal).toBe(0);
  });

  test('applies conservative 18% deficit in weight reduction mode with safety warnings', () => {
    const tdeeResult = calculateTDEE({
      weightKg: 70,
      heightCm: 175,
      age: 30,
      sex: 'male',
      activityLevel: 'sedentary',
      energyMode: 'reduction',
      deficitPercent: 18,
    });
    // BMR = 1649 * 1.2 = 1978.8 -> 1979
    // 18% of 1979 = 356.22 -> 356
    // target = 1623
    expect(tdeeResult.tdeeKcal).toBe(1979);
    expect(tdeeResult.deficitPercent).toBe(18);
    expect(tdeeResult.targetKcal).toBe(1623);
  });

  test('flags safety warnings if caloric intake drops below clinical safety floor', () => {
    const extremeResult = calculateTDEE({
      weightKg: 45,
      heightCm: 150,
      age: 40,
      sex: 'female',
      activityLevel: 'sedentary',
      energyMode: 'custom',
      customCalorieTarget: 950,
    });
    expect(extremeResult.safetyWarnings.length).toBeGreaterThan(0);
    expect(extremeResult.safetyWarnings[0]).toContain('below the standard clinical conservative intake floor');
  });
});

describe('Macronutrient Calculation Engine', () => {
  test('calculates moderate preset macros (45/25/30)', () => {
    const macros = calculateMacros({
      targetCalories: 2000,
      preset: 'moderate',
    });
    expect(macros.isValid).toBe(true);
    // Carbs: 2000 * 0.45 = 900 kcal / 4 = 225g
    // Protein: 2000 * 0.25 = 500 kcal / 4 = 125g
    // Fat: 2000 * 0.30 = 600 kcal / 9 = 67g
    expect(macros.carbGrams).toBe(225);
    expect(macros.proteinGrams).toBe(125);
    expect(macros.fatGrams).toBe(67);
    expect(macros.fibreTargetGrams).toBe(28); // 14g per 1000 kcal
  });

  test('validates macro percentage sums to 100%', () => {
    const invalidMacros = calculateMacros({
      targetCalories: 2000,
      preset: 'custom',
      customPercents: { carb: 50, protein: 30, fat: 30 }, // 110%
    });
    expect(invalidMacros.isValid).toBe(false);
    expect(invalidMacros.validationError).toBeDefined();
  });

  test('supports explicit custom grams overrides', () => {
    const customGrams = calculateMacros({
      targetCalories: 2000,
      preset: 'custom',
      customGrams: { carb: 200, protein: 140, fat: 65 },
    });
    expect(customGrams.isValid).toBe(true);
    expect(customGrams.carbGrams).toBe(200);
    expect(customGrams.proteinGrams).toBe(140);
    expect(customGrams.fatGrams).toBe(65);
    // Kcal: 200*4 (800) + 140*4 (560) + 65*9 (585) = 1945
    expect(customGrams.carbKcal).toBe(800);
    expect(customGrams.proteinKcal).toBe(560);
    expect(customGrams.fatKcal).toBe(585);
  });
});
