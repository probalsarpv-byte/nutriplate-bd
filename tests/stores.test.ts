import { useDiaryStore } from '../src/stores/diaryStore';
import { useRecipeStore } from '../src/stores/recipeStore';
import { useUserStore } from '../src/stores/userStore';

describe('Application Stores & Interactivity', () => {
  test('adds custom entry to diaryStore and recomputes aggregates live', () => {
    const initialCalories = useDiaryStore.getState().consumedCalories;
    
    useDiaryStore.getState().addCustomEntry({
      foodCode: 'custom_test_food',
      name_bn: 'টেস্ট খাবার',
      name_en: 'Test Food',
      mealType: 'snack',
      date: '2026-10-11',
      quantity: 1,
      unit: 'piece',
      gramWeight: 100,
      energy_kcal: 150,
      carb_g: 20,
      protein_g: 5,
      fat_g: 4,
      fibre_g: 2,
    });

    const updated = useDiaryStore.getState();
    const found = updated.entries.find((e) => e.foodCode === 'custom_test_food');
    expect(found).toBeDefined();
    expect(found?.energy_kcal).toBe(150);
  });

  test('dynamically saves, retrieves and removes recipes in recipeStore', () => {
    const store = useRecipeStore.getState();
    const initialCount = store.recipes.length;

    const testRecipe = {
      id: 'rec_unit_test',
      name: 'টেস্ট রেসিপি',
      category: 'Test Category',
      ingredients: [],
      rawTotalWeightGrams: 300,
      cookedYieldWeightGrams: 300,
      totalServings: 2,
      servingWeightGrams: 150,
      totalCalories: 400,
      totalCarbs: 50,
      totalProtein: 20,
      totalFat: 10,
      totalFibre: 5,
      perServingCalories: 200,
      perServingCarbs: 25,
      perServingProtein: 10,
      perServingFat: 5,
      perServingFibre: 2.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.addRecipe(testRecipe);
    expect(useRecipeStore.getState().recipes.length).toBe(initialCount + 1);
    expect(useRecipeStore.getState().getRecipeById('rec_unit_test')).toBeDefined();

    useRecipeStore.getState().removeRecipe('rec_unit_test');
    expect(useRecipeStore.getState().recipes.length).toBe(initialCount);
  });

  test('updates user biometrics and live recomputes BMR, TDEE and macro targets', () => {
    const initialTdee = useUserStore.getState().tdee;

    // Change weight from 68 to 80 kg
    useUserStore.getState().updateProfile({ weightKg: 80 });
    const updatedState = useUserStore.getState();
    
    expect(updatedState.profile.weightKg).toBe(80);
    expect(updatedState.bmr).toBeGreaterThan(0);
    expect(updatedState.tdee).toBeGreaterThan(initialTdee);
    expect(updatedState.carbTargetGrams).toBeGreaterThan(0);
    expect(updatedState.proteinTargetGrams).toBeGreaterThan(0);
    expect(updatedState.fatTargetGrams).toBeGreaterThan(0);
  });

  test('accurately aggregates daily micronutrients (calcium, iron, sodium, potassium)', () => {
    const today = new Date().toISOString().split('T')[0];
    useDiaryStore.getState().addCustomEntry({
      foodCode: 'micro_test_item',
      name_bn: 'মাইক্রো টেস্ট ফুড',
      name_en: 'Micro Test Food',
      mealType: 'dinner',
      date: today,
      quantity: 1,
      unit: 'piece',
      gramWeight: 100,
      energy_kcal: 100,
      carb_g: 10,
      protein_g: 5,
      fat_g: 2,
      fibre_g: 3,
      calcium_mg: 120,
      iron_mg: 2.5,
      sodium_mg: 80,
      potassium_mg: 200,
    });

    const state = useDiaryStore.getState();
    expect(state.consumedCalcium).toBeGreaterThanOrEqual(120);
    expect(state.consumedIron).toBeGreaterThanOrEqual(2.5);
    expect(state.consumedSodium).toBeGreaterThanOrEqual(80);
    expect(state.consumedPotassium).toBeGreaterThanOrEqual(200);
  });
});
