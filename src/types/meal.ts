import { FoodItem, FoodState, PreparationMethod, ServingUnit, PlantCategory } from './food';
import { ClinicalFoodAlert } from './alerts';

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'custom';

export interface MealFoodItem {
  id: string; // unique item instance id e.g. 'mfi_1234'
  foodCode: string;
  recipeId?: string; // set if food item was derived from Recipe Lab / Family Pot
  name_bn: string;
  name_en: string;
  category: string;
  foodState: FoodState;
  preparationMethod?: PreparationMethod;
  quantity: number;
  unit: ServingUnit;
  gramWeight: number; // normalized consumed grams
  
  // Nutrients for this item's consumed grams
  energy_kcal: number;
  protein_g: number;
  fat_g: number;
  carb_g: number;
  fibre_g: number;
  water_g?: number;
  calcium_mg?: number | null;
  iron_mg?: number | null;
  sodium_mg?: number | null;
  potassium_mg?: number | null;
  zinc_mg?: number | null;
  vitamin_c_mg?: number | null;
  folate_mcg?: number | null;
  saturated_fat_g?: number | null;
  
  is_plant: boolean;
  plant_category?: PlantCategory;
  glycemic_index?: number | null;
  source_database?: string;
  cookingYieldFactor?: number;
}

export interface MealNutritionSummary {
  totalCalories: number;
  totalCarbs: number;
  availableCarbs?: number | null;
  totalProtein: number;
  totalFat: number;
  totalSaturatedFat?: number | null;
  totalFibre: number;
  totalSodium?: number | null;
  totalPotassium?: number | null;
  totalCalcium?: number | null;
  totalIron?: number | null;
  totalZinc?: number | null;
  totalVitaminC?: number | null;
  totalFolate?: number | null;
  totalWeightGrams: number;
  glycemicLoad?: number | null;
  uniquePlantCount: number;
  
  // Data completeness metadata
  nutrientCompletenessPercent: number; // 0-100% of analyzed nutrients present
  analyzedNutrientCount: number;
  totalTrackedNutrientCount: number;
}

export interface SavedMeal {
  id: string; // stable UUID/ID
  userId: string;
  name: string;
  category: MealCategory;
  notes?: string;
  items: MealFoodItem[];
  nutrition: MealNutritionSummary;
  foodDbVersion: string; // e.g. 'v1.1.0_infs2013'
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface MealComparisonMetric {
  key: string;
  label_bn: string;
  label_en: string;
  unit: string;
  valA: number | null;
  valB: number | null;
  diff: number | null; // valB - valA
}

export interface MealComparisonResult {
  mealA: SavedMeal;
  mealB: SavedMeal;
  metrics: MealComparisonMetric[];
  alertsA: ClinicalFoodAlert[];
  alertsB: ClinicalFoodAlert[];
  contextualObservations: Array<{
    title_bn: string;
    title_en: string;
    description_bn: string;
    description_en: string;
    badgeType: 'neutral' | 'info' | 'caution';
  }>;
}
