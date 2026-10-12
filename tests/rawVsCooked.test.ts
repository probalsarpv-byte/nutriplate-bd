import { foodDatabaseAdapter } from '../src/database/adapters/FoodDatabaseAdapter';
import { calculateRecipeNutrients, calculateFamilyPotPortions } from '../src/engines/recipes/recipeEngine';
import { evaluateFoodAlerts } from '../src/engines/pathology/alertEngine';
import { useDiaryStore } from '../src/stores/diaryStore';
import { useRecipeStore } from '../src/stores/recipeStore';
import { UserHealthProfile } from '../src/types/user';

describe('Raw vs Cooked Food Tracking Audit & Engine Tests', () => {
  describe('1. Food Database Architecture & Analytical Data Integrity', () => {
    test('raw rice and cooked rice have distinct analytical nutrient profiles from INFS DU 2013', () => {
      const rawRice = foodDatabaseAdapter.getFoodByCode('01_0012');
      const cookedRice = foodDatabaseAdapter.getFoodByCode('01_0037');

      expect(rawRice).toBeDefined();
      expect(cookedRice).toBeDefined();

      // Raw rice is ~344 kcal/100g with high starch concentration
      expect(rawRice?.energy_kcal).toBe(344);
      expect(rawRice?.foodState).toBe('RAW');
      expect(rawRice?.nutrientBasis).toBe('per_100g_raw');
      expect(rawRice?.dataConfidence).toBe('analytical');

      // Cooked rice (boiled without salt) is 109 kcal/100g due to water absorption
      expect(cookedRice?.energy_kcal).toBe(109);
      expect(cookedRice?.foodState).toBe('COOKED');
      expect(cookedRice?.preparationMethod).toBe('boiled');
      expect(cookedRice?.nutrientBasis).toBe('per_100g_cooked');
      expect(cookedRice?.dataConfidence).toBe('analytical');

      // Calorie ratio matches expected cooking yield factor (~3.15x weight expansion)
      const ratio = rawRice!.energy_kcal / cookedRice!.energy_kcal;
      expect(ratio).toBeCloseTo(3.15, 1);
    });

    test('bidirectional pairing links raw rice to boiled rice and vice-versa', () => {
      const rawRice = foodDatabaseAdapter.getFoodByCode('01_0012')!;
      const cookedRice = foodDatabaseAdapter.getFoodByCode('01_0037')!;

      // From raw, get paired cooked food
      const pairedCooked = foodDatabaseAdapter.getPairedFood(rawRice, 'COOKED');
      expect(pairedCooked).toBeDefined();
      expect(pairedCooked?.code).toBe('01_0037');
      expect(pairedCooked?.foodState).toBe('COOKED');

      // From cooked, get paired raw food
      const pairedRaw = foodDatabaseAdapter.getPairedFood(cookedRice, 'RAW');
      expect(pairedRaw).toBeDefined();
      expect(pairedRaw?.code).toBe('01_0012');
      expect(pairedRaw?.foodState).toBe('RAW');
    });

    test('raw lentils and cooked dal have independent analytical profiles', () => {
      const rawLentil = foodDatabaseAdapter.getFoodByCode('02_0008')!;
      const cookedDal = foodDatabaseAdapter.getFoodByCode('02_0015')!;

      expect(rawLentil.foodState).toBe('RAW');
      expect(rawLentil.energy_kcal).toBe(317);
      expect(rawLentil.protein_g).toBe(27.7);

      expect(cookedDal.foodState).toBe('COOKED');
      expect(cookedDal.energy_kcal).toBe(155);
      expect(cookedDal.protein_g).toBe(13.6);
      expect(cookedDal.preparationMethod).toBe('boiled');
    });

    test('raw vegetables vs fried preparation accurately reflects oil absorption and sodium addition', () => {
      // Bitter gourd raw vs fried
      const rawKorola = foodDatabaseAdapter.getFoodByCode('03_0016')!;
      const friedKorola = foodDatabaseAdapter.getFoodByCode('03_0048')!;

      expect(rawKorola.foodState).toBe('RAW');
      expect(rawKorola.energy_kcal).toBe(31);
      expect(rawKorola.fat_g).toBe(0.3);

      // Fried korola has high fat and added salt from analytical preparation
      expect(friedKorola.foodState).toBe('COOKED');
      expect(friedKorola.preparationMethod).toBe('fried');
      expect(friedKorola.energy_kcal).toBe(130);
      expect(friedKorola.fat_g).toBe(9.1);
      expect(friedKorola.sodium_mg).toBe(469);
    });

    test('preserves missing micronutrients as null rather than fabricated zeros', () => {
      const cookedRice = foodDatabaseAdapter.getFoodByCode('01_0037')!;
      const scaled = foodDatabaseAdapter.calculateNutrients(cookedRice.code, 200);

      // If nutrient is null in source table, must remain null after scaling
      if (cookedRice.vitamin_d_mcg === null) {
        expect(scaled?.vitamin_d_mcg).toBeNull();
      }
    });
  });

  describe('2. Custom Recipe Engine & Cooked Yield Calculations', () => {
    test('calculates custom recipe cooked weight, per-100g nutrients, and portion scaling', () => {
      const recipe = calculateRecipeNutrients({
        id: 'test_recipe_khichuri',
        name: 'পরীক্ষামূলক ভুনা খিচুড়ি',
        category: 'Rice Dishes',
        ingredients: [
          { foodCode: '01_0037', rawWeightGrams: 200, unit: 'g', quantity: 200 }, // cooked rice: 218 kcal
          { foodCode: '02_0007', rawWeightGrams: 100, unit: 'g', quantity: 100 }, // raw lentil: 343 kcal
        ],
        totalServings: 3,
        customCookedYieldGrams: 600, // Water added during cooking
      });

      expect(recipe.cookedYieldWeightGrams).toBe(600);
      expect(recipe.totalServings).toBe(3);
      expect(recipe.servingWeightGrams).toBe(200);

      // Total raw ingredients weight
      expect(recipe.rawTotalWeightGrams).toBe(300);

      // Total calories = ~218 + 343 = 561 kcal
      expect(recipe.totalCalories).toBeGreaterThan(500);

      // Per serving = total / 3
      expect(recipe.perServingCalories).toBe(Math.round(recipe.totalCalories / 3));
    });

    test('registers custom recipe into FoodDatabaseAdapter as searchable PREPARED food', () => {
      const recipe = calculateRecipeNutrients({
        id: 'user_rec_dim_khichuri',
        name: 'ডিম খিচুড়ি স্পেশাল',
        category: 'Homemade',
        ingredients: [
          { foodCode: '01_0037', rawWeightGrams: 250, unit: 'g', quantity: 250 },
        ],
        totalServings: 2,
        customCookedYieldGrams: 500,
      });

      const registeredFood = foodDatabaseAdapter.registerCustomRecipeAsFood(recipe);
      expect(registeredFood).toBeDefined();
      expect(registeredFood.code).toBe('user_rec_dim_khichuri');
      expect(registeredFood.foodState).toBe('PREPARED');
      expect(registeredFood.nutrientBasis).toBe('per_100g_cooked');
      expect(registeredFood.dataConfidence).toBe('calculated_recipe');

      // Immediately searchable in FoodDatabaseAdapter
      const searchFound = foodDatabaseAdapter.searchFoods('ডিম খিচুড়ি');
      expect(searchFound.some((f) => f.code === 'user_rec_dim_khichuri')).toBe(true);

      // Retrieve by code
      const retrieved = foodDatabaseAdapter.getFoodByCode('user_rec_dim_khichuri');
      expect(retrieved).toBeDefined();
      expect(retrieved?.energy_kcal).toBe(Math.round(recipe.totalCalories * (100 / 500)));
    });
  });

  describe('3. Family Pot & Exact Consumed Portion Allocation', () => {
    test('allocates accurate nutrition based on individual plate weight without double counting', () => {
      const recipe = calculateRecipeNutrients({
        id: 'family_pot_test',
        name: 'ঘরোয়া মুরগির পোলাও',
        category: 'Family Meal',
        ingredients: [
          { foodCode: '01_0037', rawWeightGrams: 300, unit: 'g', quantity: 300 },
        ],
        totalServings: 3,
        customCookedYieldGrams: 600,
      });

      const allocation = calculateFamilyPotPortions({
        recipe,
        members: [
          { memberId: 'm1', memberName: 'বাবা', consumedWeightGrams: 300 }, // 50% of pot
          { memberId: 'm2', memberName: 'মা', consumedWeightGrams: 200 },   // 33.3% of pot
          { memberId: 'm3', memberName: 'সন্তান', consumedWeightGrams: 100 }, // 16.7% of pot
        ],
      });

      expect(allocation.portions.length).toBe(3);
      expect(allocation.portions[0].percentageOfPot).toBe(50);
      expect(allocation.portions[0].calories).toBe(Math.round(recipe.totalCalories * 0.5));

      // Sum of calories matches total pot calories within rounding tolerance
      const sumCalories = allocation.portions.reduce((sum, p) => sum + p.calories, 0);
      expect(Math.abs(sumCalories - recipe.totalCalories)).toBeLessThanOrEqual(2);
    });
  });

  describe('4. Food Tracker Diary Logging & State Badging', () => {
    test('logs arbitrary consumed gram weight (150g or 250g) of custom cooked dish with correct basis', () => {
      const diary = useDiaryStore.getState();
      const initialEntryCount = diary.entries.length;

      // User consumes 150g of prepared dish
      diary.addCustomEntry({
        foodCode: 'custom_cooked_dish_01',
        name_bn: 'ঘরোয়া রান্না খিচুড়ি (১৫০ গ্রাম)',
        name_en: 'Homemade Khichuri (150g)',
        mealType: 'lunch',
        date: '2026-10-12',
        quantity: 1,
        unit: 'g',
        gramWeight: 150,
        foodState: 'PREPARED',
        preparationMethod: 'curry',
        nutrientBasis: 'per_100g_cooked',
        energy_kcal: 213,
        carb_g: 33.0,
        protein_g: 6.3,
        fat_g: 6.1,
        fibre_g: 3.2,
      });

      const updatedEntries = useDiaryStore.getState().entries;
      expect(updatedEntries.length).toBe(initialEntryCount + 1);

      const logged = updatedEntries[0];
      expect(logged.foodState).toBe('PREPARED');
      expect(logged.nutrientBasis).toBe('per_100g_cooked');
      expect(logged.gramWeight).toBe(150);
      expect(logged.energy_kcal).toBe(213);
    });
  });

  describe('5. Disease-Aware Clinical Alerts on Cooked Portions & Preparation', () => {
    const diabeticUser: UserHealthProfile = {
      id: 'usr_test_1',
      name: 'Rahim',
      age: 45,
      sex: 'male',
      heightCm: 170,
      weightKg: 75,
      activityLevel: 'lightly_active',
      energyMode: 'maintenance',
      reductionDeficitPercent: 18,
      macroPreset: 'moderate',
      carbPercent: 45,
      proteinPercent: 25,
      fatPercent: 30,
      conditions: ['t2_diabetes'],
      allergens: [],
      language: 'bn',
      isDarkMode: false,
      onboardingCompleted: true,
    };

    const hypertensiveUser: UserHealthProfile = {
      id: 'usr_test_2',
      name: 'Fatema',
      age: 50,
      sex: 'female',
      heightCm: 160,
      weightKg: 68,
      activityLevel: 'lightly_active',
      energyMode: 'maintenance',
      reductionDeficitPercent: 18,
      macroPreset: 'moderate',
      carbPercent: 45,
      proteinPercent: 25,
      fatPercent: 30,
      conditions: ['hypertension'],
      allergens: [],
      language: 'bn',
      isDarkMode: false,
      onboardingCompleted: true,
    };

    test('150g cooked rice does not trigger acute spike alert (>45g carb), whereas 150g raw rice does', () => {
      const cookedRice = foodDatabaseAdapter.getFoodByCode('01_0037')!; // 24.3g carb / 100g
      const rawRice = foodDatabaseAdapter.getFoodByCode('01_0012')!;    // 77.2g carb / 100g

      // 150g cooked rice = 36.5g carb (below 45g threshold)
      const cookedAlerts = evaluateFoodAlerts(cookedRice, 150, diabeticUser);
      const hasCarbSpikeCooked = cookedAlerts.some((a) => a.id.includes('diabetes_high_carb'));
      expect(hasCarbSpikeCooked).toBe(false);

      // 150g raw rice = 115.8g carb (drastically exceeds 45g threshold)
      const rawAlerts = evaluateFoodAlerts(rawRice, 150, diabeticUser);
      const hasCarbSpikeRaw = rawAlerts.some((a) => a.id.includes('diabetes_high_carb'));
      expect(hasCarbSpikeRaw).toBe(true);
    });

    test('fried bitter gourd triggers sodium alert for hypertensive user, while raw bitter gourd does not', () => {
      const rawKorola = foodDatabaseAdapter.getFoodByCode('03_0011')!; // 4mg sodium / 100g
      const friedKorola = foodDatabaseAdapter.getFoodByCode('03_0048')!; // 469mg sodium / 100g

      // 100g raw bitter gourd does not trigger sodium alert
      const rawAlerts = evaluateFoodAlerts(rawKorola, 100, hypertensiveUser);
      expect(rawAlerts.some((a) => a.id.includes('hypertension_sodium'))).toBe(false);

      // 100g fried bitter gourd provides 469mg sodium (>400mg threshold)
      const friedAlerts = evaluateFoodAlerts(friedKorola, 100, hypertensiveUser);
      expect(friedAlerts.some((a) => a.id.includes('hypertension_sodium'))).toBe(true);
    });
  });
});
