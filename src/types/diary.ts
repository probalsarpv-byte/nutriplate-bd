import { ServingUnit, FoodState, PreparationMethod, NutrientBasis } from './food';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface LoggedFoodEntry {
  id: string;
  foodCode: string;
  name_bn: string;
  name_en: string;
  mealType: MealType;
  date: string; // YYYY-MM-DD
  quantity: number;
  unit: ServingUnit;
  gramWeight: number;
  
  // Food State and Preparation Provenance
  foodState?: FoodState;
  preparationMethod?: PreparationMethod;
  nutrientBasis?: NutrientBasis;
  
  // Calculated Nutrients for this logged quantity
  energy_kcal: number;
  protein_g: number;
  fat_g: number;
  carb_g: number;
  fibre_g: number;
  sodium_mg?: number | null;
  potassium_mg?: number | null;
  calcium_mg?: number | null;
  iron_mg?: number | null;
  
  isPlant?: boolean;
  plantCategory?: string;
  recipeId?: string;
}

export interface DayNutritionSummary {
  date: string;
  totalCalories: number;
  targetCalories: number;
  totalCarbs: number;
  targetCarbs: number;
  totalProtein: number;
  targetProtein: number;
  totalFat: number;
  targetFat: number;
  totalFibre: number;
  targetFibre: number;
  uniquePlantsCount: number;
  entries: LoggedFoodEntry[];
}
