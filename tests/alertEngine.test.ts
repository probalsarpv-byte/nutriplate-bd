import { evaluateFoodAlerts } from '../src/engines/pathology/alertEngine';
import { foodDatabaseAdapter } from '../src/database/adapters/FoodDatabaseAdapter';
import { UserHealthProfile } from '../src/types/user';

const BASE_USER: UserHealthProfile = {
  id: 'test_user',
  name: 'Test User',
  age: 35,
  sex: 'male',
  heightCm: 170,
  weightKg: 70,
  activityLevel: 'moderately_active',
  energyMode: 'maintenance',
  reductionDeficitPercent: 18,
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

describe('Pathology-Aware Functional Alert Engine', () => {
  test('flags high carbohydrate load for diabetic user without prohibiting rice', () => {
    // Rice BR-28 boiled: 01_0037. 250 grams -> ~60g carbs (> 45g threshold)
    const rice = foodDatabaseAdapter.getFoodByCode('01_0037')!;
    expect(rice).toBeDefined();

    const diabeticUser: UserHealthProfile = {
      ...BASE_USER,
      conditions: ['t2_diabetes'],
    };

    const alerts = evaluateFoodAlerts(rice, 250, diabeticUser);
    expect(alerts.length).toBeGreaterThan(0);
    const alert = alerts.find((a) => a.conditionId === 't2_diabetes');
    expect(alert).toBeDefined();
    expect(alert?.severity).toBe('moderate');
    // Ensure it contains portion guidance and does not prohibit food
    expect(alert?.guidance_bn).toContain('খাবারটি নিষিদ্ধ নয়');
  });

  test('triggers critical alert on food allergen match', () => {
    const shrimp = foodDatabaseAdapter.getAllFoods().find((f) => f.english.toLowerCase().includes('shrimp'));
    expect(shrimp).toBeDefined();
    if (shrimp) {
      const allergicUser: UserHealthProfile = {
        ...BASE_USER,
        allergens: ['shrimp'],
      };

      const alerts = evaluateFoodAlerts(shrimp, 100, allergicUser);
      const allergenAlert = alerts.find((a) => a.conditionId === 'food_allergies');
      expect(allergenAlert).toBeDefined();
      expect(allergenAlert?.severity).toBe('critical');
    }
  });

  test('flags gluten for celiac disease on wheat/ruti items', () => {
    const ruti = foodDatabaseAdapter.getFoodByCode('01_0042')!; // Ruti
    expect(ruti).toBeDefined();

    const celiacUser: UserHealthProfile = {
      ...BASE_USER,
      conditions: ['celiac'],
    };

    const alerts = evaluateFoodAlerts(ruti, 100, celiacUser);
    const celiacAlert = alerts.find((a) => a.conditionId === 'celiac');
    expect(celiacAlert).toBeDefined();
    expect(celiacAlert?.severity).toBe('critical');
  });

  test('suggests dietary calcium pairing for calcium-oxalate stone formers consuming spinach', () => {
    const spinach = foodDatabaseAdapter.getAllFoods().find((f) => f.english.toLowerCase().includes('spinach'));
    expect(spinach).toBeDefined();
    if (spinach) {
      const stoneUser: UserHealthProfile = {
        ...BASE_USER,
        conditions: ['kidney_stones'],
      };
      const alerts = evaluateFoodAlerts(spinach, 150, stoneUser);
      const stoneAlert = alerts.find((a) => a.conditionId === 'kidney_stones');
      expect(stoneAlert).toBeDefined();
      expect(stoneAlert?.guidance_bn).toContain('ক্যালসিয়ামের উৎস');
    }
  });
});
