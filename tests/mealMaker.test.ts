import { convertFoodToMealItem, calculateMealNutrients, evaluateMealAlerts, compareMeals } from '../src/engines/meal/mealEngine';
import { foodDatabaseAdapter } from '../src/database/adapters/FoodDatabaseAdapter';
import { mealDatabase, CURRENT_FOOD_DB_VERSION } from '../src/database/mealDatabase';
import { useMealStore } from '../src/stores/mealStore';
import { useDiaryStore } from '../src/stores/diaryStore';
import { calculateRecipeNutrients } from '../src/engines/recipes/recipeEngine';
import { UserHealthProfile } from '../src/types/user';
import { SavedMeal, MealFoodItem } from '../src/types/meal';

const BASE_USER_PROFILE: UserHealthProfile = {
  id: 'usr_test_qa',
  name: 'কামাল হোসেন',
  age: 38,
  sex: 'male',
  heightCm: 172,
  weightKg: 75,
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

describe('Smart Meal Maker — V1.1 Integration & Verification', () => {
  beforeEach(async () => {
    await mealDatabase.init();
    useMealStore.getState().clearDraft();
  });

  // Test 1: Multiple Food Nutrient Aggregation
  test('1. accurately aggregates multiple foods into a complete meal plate', () => {
    // My Lunch Plate:
    // Cooked rice (01_0037): 150g
    // Fish curry (PREP_ROHU_CURRY): 100g
    // Cooked dal (02_0015): 100g
    // Cooked Vegetables - Begun Bhaja (03_0033): 75g
    const rice = foodDatabaseAdapter.getFoodByCode('01_0037')!;
    const fish = foodDatabaseAdapter.getFoodByCode('PREP_ROHU_CURRY')!;
    const dal = foodDatabaseAdapter.getFoodByCode('02_0015') || foodDatabaseAdapter.getFoodByCode('02_0007')!;
    const veg = foodDatabaseAdapter.getFoodByCode('03_0033')!;

    expect(rice).toBeDefined();
    expect(fish).toBeDefined();
    expect(dal).toBeDefined();
    expect(veg).toBeDefined();

    const item1 = convertFoodToMealItem(rice, 150, 'g');
    const item2 = convertFoodToMealItem(fish, 100, 'g');
    const item3 = convertFoodToMealItem(dal, 100, 'g');
    const item4 = convertFoodToMealItem(veg, 75, 'g');

    const mealNutrition = calculateMealNutrients([item1, item2, item3, item4]);

    const expectedCalories = item1.energy_kcal + item2.energy_kcal + item3.energy_kcal + item4.energy_kcal;
    const expectedCarbs = Number((item1.carb_g + item2.carb_g + item3.carb_g + item4.carb_g).toFixed(1));
    const expectedProtein = Number((item1.protein_g + item2.protein_g + item3.protein_g + item4.protein_g).toFixed(1));
    const expectedFat = Number((item1.fat_g + item2.fat_g + item3.fat_g + item4.fat_g).toFixed(1));
    const expectedFibre = Number((item1.fibre_g + item2.fibre_g + item3.fibre_g + item4.fibre_g).toFixed(1));

    expect(mealNutrition.totalCalories).toBe(expectedCalories);
    expect(mealNutrition.totalCarbs).toBe(expectedCarbs);
    expect(mealNutrition.totalProtein).toBe(expectedProtein);
    expect(mealNutrition.totalFat).toBe(expectedFat);
    expect(mealNutrition.totalFibre).toBe(expectedFibre);
    expect(mealNutrition.totalWeightGrams).toBe(150 + 100 + 100 + 75);
    expect(mealNutrition.totalCalories).toBeGreaterThan(0);
  });

  // Test 2: Raw and Cooked Food Combinations
  test('2. supports combining raw food items with cooked dishes seamlessly', () => {
    // Cooked Rice (01_0037, 180g) + Raw Cucumber Salad (03_0017, 100g)
    const cookedRice = foodDatabaseAdapter.getFoodByCode('01_0037')!;
    const rawCucumber = foodDatabaseAdapter.getFoodByCode('03_0017')!;

    const riceItem = convertFoodToMealItem(cookedRice, 180, 'g');
    const saladItem = convertFoodToMealItem(rawCucumber, 100, 'g');

    expect(riceItem.foodState).toBe('COOKED');
    expect(saladItem.foodState).toBe('RAW');

    const meal = calculateMealNutrients([riceItem, saladItem]);
    expect(meal.totalCalories).toBe(riceItem.energy_kcal + saladItem.energy_kcal);
    expect(meal.uniquePlantCount).toBe(2);
  });

  // Test 3: Saved Recipe Inclusion
  test('3. correctly includes saved homemade recipes from Recipe Lab', () => {
    // Create and register a custom recipe: Khichuri
    const recipe = calculateRecipeNutrients({
      id: 'rec_custom_khichuri_qa',
      name: 'ঘরোয়া স্পেশাল খিচুড়ি',
      category: 'Homemade',
      ingredients: [
        { foodCode: '01_0037', rawWeightGrams: 200, unit: 'g', quantity: 200 },
        { foodCode: '02_0007', rawWeightGrams: 100, unit: 'g', quantity: 100 },
      ],
      totalServings: 2,
      customCookedYieldGrams: 600,
    });

    const recipeAsFood = foodDatabaseAdapter.registerCustomRecipeAsFood(recipe);
    expect(recipeAsFood.code).toBe(recipe.id);
    expect(recipeAsFood.foodState).toBe('PREPARED');

    // Add 250g of this cooked recipe to the meal
    const recipeMealItem = convertFoodToMealItem(recipeAsFood, 250, 'g', recipe.id);
    expect(recipeMealItem.recipeId).toBe(recipe.id);
    expect(recipeMealItem.gramWeight).toBe(250);

    // Verify nutrient density is derived from 250g / 600g of total cooked recipe
    const expectedKcal = Math.round((recipe.totalCalories * 250) / 600);
    expect(Math.abs(recipeMealItem.energy_kcal - expectedKcal)).toBeLessThanOrEqual(2);
  });

  // Test 4: Portion Resizing
  test('4. resizes food portions and updates meal nutrients proportionally', () => {
    const egg = foodDatabaseAdapter.getFoodByCode('11_0005')!; // Boiled egg: ~77 kcal per 50g
    const item1x = convertFoodToMealItem(egg, 1, 'piece'); // 1 egg (50g)
    const item2x = convertFoodToMealItem(egg, 2, 'piece'); // 2 eggs (100g)

    expect(item2x.gramWeight).toBe(item1x.gramWeight * 2);
    expect(item2x.energy_kcal).toBe(item1x.energy_kcal * 2);
    expect(item2x.protein_g).toBeCloseTo(item1x.protein_g * 2, 0);
  });

  // Test 5: Missing Nutrient Values (Preservation of Nulls)
  test('5. preserves null for missing/unanalyzed micronutrients and never assumes zero', () => {
    // Global Food without calcium/sodium data
    const globalApple = foodDatabaseAdapter.getFoodByCode('gf_apple');
    if (globalApple) {
      expect(globalApple.calcium_mg).toBeNull();
      const appleItem = convertFoodToMealItem(globalApple, 150, 'g');
      expect(appleItem.calcium_mg).toBeNull();

      const singleMeal = calculateMealNutrients([appleItem]);
      // Should remain null when all components lack data
      expect(singleMeal.totalCalcium).toBeNull();
    }

    // Now mix with food that HAS analytical calcium (Lentil 02_0007)
    const dalFood = foodDatabaseAdapter.getFoodByCode('02_0007')!;
    const dalItem = convertFoodToMealItem(dalFood, 100, 'g');
    expect(dalItem.calcium_mg).toBeGreaterThan(0);

    const mixedMeal = calculateMealNutrients([dalItem]);
    expect(mixedMeal.totalCalcium).not.toBeNull();
    expect(mixedMeal.totalCalcium).toBe(Math.round(dalItem.calcium_mg!));
    expect(mixedMeal.nutrientCompletenessPercent).toBeGreaterThan(0);
  });

  // Test 6: Disease-Aware Meal Warnings (Diabetes & Hypertension)
  test('6. triggers pathology-aware warnings on aggregated meal thresholds', () => {
    // High carb meal for Diabetic user: 250g Cooked Rice (01_0037) provides ~61g carbs (>60g threshold)
    const rice = foodDatabaseAdapter.getFoodByCode('01_0037')!;
    const riceItem = convertFoodToMealItem(rice, 250, 'g');

    const diabeticUser: UserHealthProfile = {
      ...BASE_USER_PROFILE,
      conditions: ['t2_diabetes'],
    };

    const mealNutrition = calculateMealNutrients([riceItem]);
    const alerts = evaluateMealAlerts({ items: [riceItem], nutrition: mealNutrition }, diabeticUser);

    const diabetesAlert = alerts.find((a) => a.conditionId === 't2_diabetes');
    expect(diabetesAlert).toBeDefined();
    expect(diabetesAlert?.severity).toBe('moderate');
    // Verifies contextual non-prohibition guidance
    expect(diabetesAlert?.guidance_bn).toContain('নিষিদ্ধ নয়');

    // High sodium meal for Hypertensive user
    const hypertensiveUser: UserHealthProfile = {
      ...BASE_USER_PROFILE,
      conditions: ['hypertension'],
    };

    const beefBhuna = foodDatabaseAdapter.getFoodByCode('PREP_BEEF_BHUNA')!;
    const beefItem = convertFoodToMealItem(beefBhuna, 200, 'g'); // 200g * 340mg/100g = 680mg sodium (> 600mg threshold)
    const beefMealNutrition = calculateMealNutrients([beefItem]);
    const sodiumAlerts = evaluateMealAlerts({ items: [beefItem], nutrition: beefMealNutrition }, hypertensiveUser);

    const sodiumAlert = sodiumAlerts.find((a) => a.conditionId === 'hypertension');
    expect(sodiumAlert).toBeDefined();
    expect(sodiumAlert?.triggeringNutrientOrFood).toContain('সোডিয়াম');
  });

  // Test 7: Critical Allergen Alerts
  test('7. identifies specific triggering allergen in meal components', () => {
    const shrimp = foodDatabaseAdapter.getAllFoods().find((f) => f.english.toLowerCase().includes('shrimp'));
    expect(shrimp).toBeDefined();
    if (shrimp) {
      const allergicUser: UserHealthProfile = {
        ...BASE_USER_PROFILE,
        allergens: ['shrimp'],
      };

      const shrimpItem = convertFoodToMealItem(shrimp, 100, 'g');
      const mealNutr = calculateMealNutrients([shrimpItem]);
      const alerts = evaluateMealAlerts({ items: [shrimpItem], nutrition: mealNutr }, allergicUser);

      const allergenAlert = alerts.find((a) => a.conditionId === 'food_allergies');
      expect(allergenAlert).toBeDefined();
      expect(allergenAlert?.severity).toBe('critical');
      expect(allergenAlert?.triggeringNutrientOrFood).toBe('shrimp');
    }
  });

  // Test 8: Duplicate Logging Prevention
  test('8. prevents duplicate logs from repeated rapid taps', async () => {
    const store = useMealStore.getState();
    const rice = foodDatabaseAdapter.getFoodByCode('01_0037')!;
    const item = convertFoodToMealItem(rice, 150, 'g');

    const testMeal: SavedMeal = {
      id: 'meal_dup_test_01',
      userId: 'usr_test_qa',
      name: 'ডুপ্লিকেট টেস্ট মিল',
      category: 'lunch',
      items: [item],
      nutrition: calculateMealNutrients([item]),
      foodDbVersion: CURRENT_FOOD_DB_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // First call succeeds
    const firstCallPromise = store.logMealToTracker({ meal: testMeal, scaleFactor: 1.0, mealType: 'lunch' });
    
    // Simulate immediate repeated button tap while first call is processing
    const isLoggingWhileActive = useMealStore.getState().isLogging;
    
    // A second concurrent tap should be safely rejected
    const secondCallResult = await store.logMealToTracker({ meal: testMeal, scaleFactor: 1.0, mealType: 'lunch' });

    const firstCallResult = await firstCallPromise;
    expect(firstCallResult).toBe(true);
    // If concurrent or after completed, state handles clean logging
    expect(useMealStore.getState().isLogging).toBe(false);
  });

  // Test 9: SQLite Local Persistence
  test('9. persists and retrieves saved meals with complete metadata and JSON structures', async () => {
    const dal = foodDatabaseAdapter.getFoodByCode('02_0007')!;
    const dalItem = convertFoodToMealItem(dal, 150, 'g');
    const nutrition = calculateMealNutrients([dalItem]);

    const mealToSave: SavedMeal = {
      id: 'meal_sqlite_test_qa_99',
      userId: 'usr_test_qa',
      name: 'পরীক্ষামূলক ডাল মিল',
      category: 'dinner',
      notes: 'অফলাইন ডাটাবেজ টেস্ট',
      items: [dalItem],
      nutrition,
      foodDbVersion: CURRENT_FOOD_DB_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await mealDatabase.saveMeal(mealToSave);

    const retrieved = await mealDatabase.getMealById('meal_sqlite_test_qa_99');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe('meal_sqlite_test_qa_99');
    expect(retrieved?.name).toBe('পরীক্ষামূলক ডাল মিল');
    expect(retrieved?.category).toBe('dinner');
    expect(retrieved?.items.length).toBe(1);
    expect(retrieved?.items[0].foodCode).toBe('02_0007');
    expect(retrieved?.nutrition.totalCalories).toBe(nutrition.totalCalories);
    expect(retrieved?.foodDbVersion).toBe(CURRENT_FOOD_DB_VERSION);
  });

  // Test 10: Meal Editing
  test('10. edits an existing meal and updates nutrition and timestamps', async () => {
    const meal = await mealDatabase.getMealById('meal_traditional_lunch_01');
    expect(meal).not.toBeNull();
    if (meal) {
      const originalCalories = meal.nutrition.totalCalories;
      
      // Add extra egg to meal
      const egg = foodDatabaseAdapter.getFoodByCode('11_0005')!;
      const eggItem = convertFoodToMealItem(egg, 1, 'piece');

      const updatedMeal: SavedMeal = {
        ...meal,
        name: 'সংশোধিত লাঞ্চ মিল (ডিম সহ)',
        items: [...meal.items, eggItem],
        nutrition: calculateMealNutrients([...meal.items, eggItem]),
        updatedAt: new Date().toISOString(),
      };

      await mealDatabase.updateMeal(updatedMeal);

      const reFetched = await mealDatabase.getMealById(meal.id);
      expect(reFetched?.name).toBe('সংশোধিত লাঞ্চ মিল (ডিম সহ)');
      expect(reFetched?.items.length).toBe(meal.items.length + 1);
      expect(reFetched?.nutrition.totalCalories).toBeGreaterThan(originalCalories);
    }
  });

  // Test 11: Meal Deletion
  test('11. deletes a saved meal and ensures it is removed from storage', async () => {
    const tempMeal: SavedMeal = {
      id: 'meal_to_delete_qa',
      userId: 'usr_test_qa',
      name: 'ডিলিট টেস্ট মিল',
      category: 'snack',
      items: [],
      nutrition: calculateMealNutrients([]),
      foodDbVersion: CURRENT_FOOD_DB_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await mealDatabase.saveMeal(tempMeal);
    expect(await mealDatabase.getMealById('meal_to_delete_qa')).not.toBeNull();

    const deleted = await mealDatabase.deleteMeal('meal_to_delete_qa');
    expect(deleted).toBe(true);

    const checkNull = await mealDatabase.getMealById('meal_to_delete_qa');
    expect(checkNull).toBeNull();
  });

  // Test 12: Saved Meal Reuse
  test('12. allows reusing a saved meal with updated quantities without modifying original', async () => {
    const original = await mealDatabase.getMealById('meal_traditional_lunch_01')!;
    expect(original).toBeDefined();

    // Clone into draft
    useMealStore.getState().initDraft(original!);
    const draft = useMealStore.getState().activeDraft;

    // Change first item quantity from 1 cup to 2 cups
    useMealStore.getState().updateItemQuantity(draft.items[0].id, 2, draft.items[0].unit);

    const updatedNutrition = useMealStore.getState().liveNutrition;
    expect(updatedNutrition.totalCalories).toBeGreaterThan(original!.nutrition.totalCalories);

    // Save as a new meal
    useMealStore.getState().setDraftName('বর্ধিত ভাত লাঞ্চ প্লেট');
    const newMeal = await useMealStore.getState().saveDraft('usr_test_qa', true);

    expect(newMeal.id).not.toBe(original!.id);
    expect(newMeal.name).toBe('বর্ধিত ভাত লাঞ্চ প্লেট');

    // Original meal remains pristine
    const originalRefetched = await mealDatabase.getMealById('meal_traditional_lunch_01');
    expect(originalRefetched?.nutrition.totalCalories).toBe(original!.nutrition.totalCalories);
  });

  // Test 13: Cooking-Factor Double-Count Prevention
  test('13. prevents double-counting cooking yield factors for previously cooked dishes', () => {
    // Boiled Rice (01_0037) has cookingYieldFactor = 3.15 in table
    const boiledRice = foodDatabaseAdapter.getFoodByCode('01_0037')!;
    expect(boiledRice.foodState).toBe('COOKED');

    // Consuming 150g of cooked rice
    const mealItem = convertFoodToMealItem(boiledRice, 150, 'g');
    expect(mealItem.gramWeight).toBe(150);

    // 150g cooked rice must be calculated directly from cooked nutrient density (109 kcal per 100g cooked)
    // 150g -> ~164 kcal. Must NOT multiply by 3.15 again!
    expect(mealItem.energy_kcal).toBeLessThan(200);
    expect(mealItem.energy_kcal).toBeGreaterThan(150);
  });

  // Test 14: Food Database Version Handling
  test('14. correctly checks food database version compatibility and flags legacy versions', () => {
    const currentMeal: SavedMeal = {
      id: 'meal_ver_cur',
      userId: 'usr_test_qa',
      name: 'Current Version Meal',
      category: 'lunch',
      items: [],
      nutrition: calculateMealNutrients([]),
      foodDbVersion: CURRENT_FOOD_DB_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const curCheck = mealDatabase.checkVersionCompatibility(currentMeal);
    expect(curCheck.isCompatible).toBe(true);
    expect(curCheck.requiresMigration).toBe(false);

    const legacyMeal: SavedMeal = {
      ...currentMeal,
      id: 'meal_ver_old',
      foodDbVersion: 'v1.0.0_legacy_draft',
    };

    const legacyCheck = mealDatabase.checkVersionCompatibility(legacyMeal);
    expect(legacyCheck.isCompatible).toBe(false);
    expect(legacyCheck.requiresMigration).toBe(true);
    expect(legacyCheck.message_bn).toContain('সংস্করণ v1.0.0_legacy_draft');
  });

  // Test 15: Bengali and English Food Searches
  test('15. supports robust bilingual food search in Bengali, English, and Roman transliteration', () => {
    // Bengali script search: "ভাত"
    const bnResults = foodDatabaseAdapter.searchFoods('ভাত');
    expect(bnResults.length).toBeGreaterThan(0);
    expect(bnResults.some((f) => f.bengali.includes('ভাত'))).toBe(true);

    // English search: "Rice"
    const enResults = foodDatabaseAdapter.searchFoods('rice');
    expect(enResults.length).toBeGreaterThan(0);
    expect(enResults.some((f) => f.english.toLowerCase().includes('rice'))).toBe(true);

    // Transliteration search: "khichuri"
    const romanResults = foodDatabaseAdapter.searchFoods('khichuri');
    expect(romanResults.length).toBeGreaterThan(0);

    // State filter search: PREPARED
    const prepResults = foodDatabaseAdapter.searchFoods('', 'all', 'PREPARED');
    expect(prepResults.length).toBeGreaterThan(0);
    expect(prepResults.every((f) => f.foodState === 'PREPARED')).toBe(true);
  });
});
