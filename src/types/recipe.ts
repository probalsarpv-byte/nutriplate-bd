import { FoodItem, ServingUnit } from './food';

export interface RecipeIngredient {
  id: string;
  foodCode: string;
  food: FoodItem;
  quantity: number;
  unit: ServingUnit;
  rawWeightGrams: number;
  preparationMethod?: 'raw' | 'boiled' | 'steamed' | 'fried' | 'roasted' | 'curry' | 'baked';
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  description?: string;
  ingredients: RecipeIngredient[];
  rawTotalWeightGrams: number;
  cookedYieldWeightGrams: number;
  totalServings: number;
  servingWeightGrams: number;
  
  // Total nutrients calculated
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  totalFibre: number;
  
  // Nutrients per serving
  perServingCalories: number;
  perServingCarbs: number;
  perServingProtein: number;
  perServingFat: number;
  perServingFibre: number;
  
  glycemicLoad?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyPotMemberPortion {
  memberId: string;
  memberName: string;
  consumedWeightGrams: number;
  percentageOfPot: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export interface FamilyPotAllocation {
  recipeId: string;
  recipeName: string;
  cookedPotTotalWeightGrams: number;
  portions: FamilyPotMemberPortion[];
}

export interface SmartPlateItem {
  id: string;
  foodCode: string;
  food: FoodItem;
  quantity: number;
  unit: ServingUnit;
  gramWeight: number;
  plateSection: 'quarter_protein' | 'quarter_carbs' | 'half_vegetables';
}
