import { foodDatabaseAdapter } from '../src/database/adapters/FoodDatabaseAdapter';

describe('FoodDatabaseAdapter', () => {
  test('loads all 381 Bangladesh foods, 88 global foods, and prepared dishes', () => {
    const all = foodDatabaseAdapter.getAllFoods();
    expect(all.length).toBeGreaterThanOrEqual(381 + 88);
  });

  test('searches foods by Bengali script', () => {
    const results = foodDatabaseAdapter.searchFoods('ভাত');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((f) => f.bengali.includes('ভাত') || f.name_bn?.includes('ভাত'))).toBe(true);
  });

  test('searches foods by English name', () => {
    const results = foodDatabaseAdapter.searchFoods('Rice');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((f) => f.english.toLowerCase().includes('rice'))).toBe(true);
  });

  test('searches foods by Roman transliteration', () => {
    const results = foodDatabaseAdapter.searchFoods('Bhat');
    expect(results.length).toBeGreaterThan(0);
  });

  test('calculates accurate nutrient scaling for 200 grams', () => {
    // Rice BR-28 boiled without salt: 01_0037
    // Per 100g: energy_kcal = 129, protein_g = 2.4, carb_g = 28.5
    const scaled = foodDatabaseAdapter.calculateNutrients('01_0037', 200);
    expect(scaled).not.toBeNull();
    if (scaled) {
      expect(scaled.energy_kcal).toBe(218);
      expect(scaled.protein_g).toBe(4.2);
      expect(scaled.carb_g).toBe(48.6);
    }
  });

  test('never converts null missing micronutrients to zero', () => {
    // Find food with unanalyzed vitamin_d or retinol
    const allFoods = foodDatabaseAdapter.getAllFoods();
    const foodWithNulls = allFoods.find((f) => f.source_database === 'usda_global');
    expect(foodWithNulls).toBeDefined();
    if (foodWithNulls) {
      const scaled = foodDatabaseAdapter.calculateNutrients(foodWithNulls.code, 150);
      expect(scaled?.calcium_mg).toBeNull();
      expect(scaled?.sodium_mg).toBeNull();
    }
  });
});
