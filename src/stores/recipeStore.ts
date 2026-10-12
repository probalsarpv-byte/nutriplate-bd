import { create } from 'zustand';
import { Recipe } from '../types/recipe';
import { calculateRecipeNutrients } from '../engines/recipes/recipeEngine';
import { foodDatabaseAdapter } from '../database/adapters/FoodDatabaseAdapter';

interface RecipeState {
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (id: string) => void;
  getRecipeById: (id: string) => Recipe | undefined;
}

const INITIAL_RECIPES: Recipe[] = [
  calculateRecipeNutrients({
    id: 'rec_khichuri_01',
    name: 'ডাল-চাল ভোজ্য খিচুড়ি',
    category: 'Bangladeshi Traditional',
    description: 'ঐতিহ্যবাহী ভুনা খিচুড়ি — সিদ্ধ চাল ও মসুর ডালের সুষম অনুপাত',
    ingredients: [
      { foodCode: '01_0037', rawWeightGrams: 200, unit: 'g', quantity: 200, preparationMethod: 'boiled' },
      { foodCode: '02_0007', rawWeightGrams: 100, unit: 'g', quantity: 100, preparationMethod: 'boiled' },
    ],
    totalServings: 3,
    customCookedYieldGrams: 750,
  }),
  calculateRecipeNutrients({
    id: 'rec_chicken_curry_02',
    name: 'দেশি মুরগির ঝোল কারি',
    category: 'Poultry Curry',
    description: 'কম তেল ও দেশি মসলায় রান্না করা প্রোটিন সমৃদ্ধ দেশি মুরগি',
    ingredients: [
      { foodCode: '10_0006', rawWeightGrams: 200, unit: 'g', quantity: 200, preparationMethod: 'curry' },
    ],
    totalServings: 3,
    customCookedYieldGrams: 650,
  }),
  calculateRecipeNutrients({
    id: 'rec_palong_dal_03',
    name: 'পালং শাক মিশ্রিত মসুর ডাল',
    category: 'Lentils & Greens',
    description: 'আয়রন ও আঁশ সমৃদ্ধ ঘন মসুর ডাল ও তাজা পালং শাক',
    ingredients: [
      { foodCode: '02_0007', rawWeightGrams: 100, unit: 'g', quantity: 100, preparationMethod: 'boiled' },
      { foodCode: '04_0016', rawWeightGrams: 150, unit: 'g', quantity: 150, preparationMethod: 'boiled' },
    ],
    totalServings: 2,
    customCookedYieldGrams: 450,
  }),
];

// Register recipes with Food Database Adapter as reusable PREPARED foods
INITIAL_RECIPES.forEach((rec) => {
  foodDatabaseAdapter.registerCustomRecipeAsFood(rec);
});

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: INITIAL_RECIPES,

  addRecipe: (recipe: Recipe) => {
    foodDatabaseAdapter.registerCustomRecipeAsFood(recipe);
    set((state) => ({
      recipes: [recipe, ...state.recipes],
    }));
  },

  removeRecipe: (id: string) =>
    set((state) => ({
      recipes: state.recipes.filter((r) => r.id !== id),
    })),

  getRecipeById: (id: string) => {
    return get().recipes.find((r) => r.id === id);
  },
}));
