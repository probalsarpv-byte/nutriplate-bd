import { Recipe, RecipeIngredient, FamilyPotAllocation, FamilyPotMemberPortion } from '../../types/recipe';
import { FoodItem } from '../../types/food';
import { foodDatabaseAdapter } from '../../database/adapters/FoodDatabaseAdapter';

export interface CookingRetentionAdjustment {
  method: 'raw' | 'boiled' | 'steamed' | 'fried' | 'roasted';
  waterYieldFactor: number; // e.g., 0.85 for frying/roasting (evaporation), 2.2 for rice boiling (water absorption)
  vitaminCRetention: number; // 0.0 to 1.0
  thiaminRetention: number;
}

export const PREPARATION_FACTORS: Record<string, CookingRetentionAdjustment> = {
  raw: { method: 'raw', waterYieldFactor: 1.0, vitaminCRetention: 1.0, thiaminRetention: 1.0 },
  boiled: { method: 'boiled', waterYieldFactor: 1.15, vitaminCRetention: 0.55, thiaminRetention: 0.70 },
  steamed: { method: 'steamed', waterYieldFactor: 0.95, vitaminCRetention: 0.80, thiaminRetention: 0.85 },
  fried: { method: 'fried', waterYieldFactor: 0.80, vitaminCRetention: 0.45, thiaminRetention: 0.65 },
  roasted: { method: 'roasted', waterYieldFactor: 0.75, vitaminCRetention: 0.50, thiaminRetention: 0.70 },
};

export function calculateRecipeNutrients(params: {
  id: string;
  name: string;
  category: string;
  description?: string;
  ingredients: Array<{
    foodCode: string;
    rawWeightGrams: number;
    unit: any;
    quantity: number;
    preparationMethod?: 'raw' | 'boiled' | 'steamed' | 'fried' | 'roasted' | 'curry' | 'baked';
  }>;
  totalServings: number;
  customCookedYieldGrams?: number | null;
}): Recipe {
  let totalCalories = 0;
  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalFibre = 0;
  let totalRawWeight = 0;

  const resolvedIngredients: RecipeIngredient[] = [];

  for (const ing of params.ingredients) {
    const food = foodDatabaseAdapter.getFoodByCode(ing.foodCode);
    if (!food) continue;

    const scaled = foodDatabaseAdapter.calculateNutrients(ing.foodCode, ing.rawWeightGrams);
    if (!scaled) continue;

    totalRawWeight += ing.rawWeightGrams;
    totalCalories += scaled.energy_kcal;
    totalCarbs += scaled.carb_g;
    totalProtein += scaled.protein_g;
    totalFat += scaled.fat_g;
    totalFibre += scaled.fibre_g;

    resolvedIngredients.push({
      id: `ing_${Math.random().toString(36).substr(2, 6)}`,
      foodCode: ing.foodCode,
      food,
      quantity: ing.quantity,
      unit: ing.unit,
      rawWeightGrams: ing.rawWeightGrams,
      preparationMethod: ing.preparationMethod || 'raw',
    });
  }

  const cookedYieldWeightGrams = params.customCookedYieldGrams && params.customCookedYieldGrams > 0
    ? params.customCookedYieldGrams
    : Math.round(totalRawWeight);

  const servings = Math.max(1, params.totalServings);
  const servingWeightGrams = Math.round(cookedYieldWeightGrams / servings);

  return {
    id: params.id,
    name: params.name,
    category: params.category,
    description: params.description,
    ingredients: resolvedIngredients,
    rawTotalWeightGrams: Math.round(totalRawWeight),
    cookedYieldWeightGrams,
    totalServings: servings,
    servingWeightGrams,
    totalCalories: Math.round(totalCalories),
    totalCarbs: Number(totalCarbs.toFixed(1)),
    totalProtein: Number(totalProtein.toFixed(1)),
    totalFat: Number(totalFat.toFixed(1)),
    totalFibre: Number(totalFibre.toFixed(1)),
    perServingCalories: Math.round(totalCalories / servings),
    perServingCarbs: Number((totalCarbs / servings).toFixed(1)),
    perServingProtein: Number((totalProtein / servings).toFixed(1)),
    perServingFat: Number((totalFat / servings).toFixed(1)),
    perServingFibre: Number((totalFibre / servings).toFixed(1)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Family Pot Calculator:
 * Allocates actual consumed cooked weight portions per family member instead of blind equal division.
 */
export function calculateFamilyPotPortions(params: {
  recipe: Recipe;
  members: Array<{ memberId: string; memberName: string; consumedWeightGrams: number }>;
}): FamilyPotAllocation {
  const { recipe, members } = params;
  const totalCookedWeight = recipe.cookedYieldWeightGrams;

  const portions: FamilyPotMemberPortion[] = members.map((m) => {
    const fraction = totalCookedWeight > 0 ? m.consumedWeightGrams / totalCookedWeight : 0;
    const percentageOfPot = Number((fraction * 100).toFixed(1));

    return {
      memberId: m.memberId,
      memberName: m.memberName,
      consumedWeightGrams: m.consumedWeightGrams,
      percentageOfPot,
      calories: Math.round(recipe.totalCalories * fraction),
      carbs: Number((recipe.totalCarbs * fraction).toFixed(1)),
      protein: Number((recipe.totalProtein * fraction).toFixed(1)),
      fat: Number((recipe.totalFat * fraction).toFixed(1)),
    };
  });

  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    cookedPotTotalWeightGrams: totalCookedWeight,
    portions,
  };
}
