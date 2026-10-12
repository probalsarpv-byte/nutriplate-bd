import { calculateRecipeNutrients, calculateFamilyPotPortions } from '../src/engines/recipes/recipeEngine';

describe('Recipe Lab & Family Pot Engine', () => {
  test('accurately aggregates recipe nutrients and calculates per-serving breakdown', () => {
    // Recipe: Khichuri with Rice (01_0037, 200g) and Moshur Dal (02_0007, 100g)
    const recipe = calculateRecipeNutrients({
      id: 'rec_01',
      name: 'ডাল-ভাত খিচুড়ি',
      category: 'Bangladeshi Traditional',
      ingredients: [
        {
          foodCode: '01_0037', // Rice BR-28 boiled
          rawWeightGrams: 200,
          unit: 'g',
          quantity: 200,
        },
        {
          foodCode: '02_0007', // Lentils raw
          rawWeightGrams: 100,
          unit: 'g',
          quantity: 100,
        },
      ],
      totalServings: 2,
    });

    expect(recipe.totalServings).toBe(2);
    expect(recipe.totalCalories).toBeGreaterThan(0);
    expect(recipe.perServingCalories).toBe(Math.round(recipe.totalCalories / 2));
    expect(recipe.perServingProtein).toBe(Number((recipe.totalProtein / 2).toFixed(1)));
  });

  test('calculates unequal household portions accurately in Family Pot', () => {
    const recipe = calculateRecipeNutrients({
      id: 'rec_02',
      name: 'ফ্যামিলি পট চিকেন ভুনা',
      category: 'Curry',
      ingredients: [
        {
          foodCode: '01_0037',
          rawWeightGrams: 500,
          unit: 'g',
          quantity: 500,
        },
      ],
      totalServings: 2,
      customCookedYieldGrams: 500,
    });

    // 2 family members: Father consumes 300g (60%), Child consumes 200g (40%)
    const allocation = calculateFamilyPotPortions({
      recipe,
      members: [
        { memberId: 'm1', memberName: 'বাবা', consumedWeightGrams: 300 },
        { memberId: 'm2', memberName: 'সন্তান', consumedWeightGrams: 200 },
      ],
    });

    expect(allocation.portions.length).toBe(2);
    expect(allocation.portions[0].percentageOfPot).toBe(60);
    expect(allocation.portions[1].percentageOfPot).toBe(40);
    expect(allocation.portions[0].calories + allocation.portions[1].calories).toBe(recipe.totalCalories);
  });
});
