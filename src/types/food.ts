export type FoodState = 'RAW' | 'COOKED' | 'PREPARED';

export type PreparationMethod = 
  | 'raw' 
  | 'boiled' 
  | 'steamed' 
  | 'fried' 
  | 'roasted' 
  | 'curry' 
  | 'baked';

export type NutrientBasis = 'per_100g_raw' | 'per_100g_cooked' | 'per_serving';

export type DataConfidence = 'analytical' | 'calculated_recipe' | 'estimated' | 'borrowed';

export interface NutrientsPer100g {
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
}

export interface NutrientRetentionFactors {
  vitamin_c?: number;
  thiamin?: number;
  folate?: number;
  potassium?: number;
}

export interface FoodItem {
  code: string;
  category: string;
  english: string;
  bengali: string;
  scientific?: string;
  bengali_roman?: string;
  name_bn?: string;
  name_en?: string;
  edible_portion: number;
  energy_kcal: number;
  energy_kj?: number;
  water_g?: number;
  protein_g: number;
  fat_g: number;
  carb_g: number;
  fibre_g: number;
  ash_g?: number;
  calcium_mg?: number | null;
  iron_mg?: number | null;
  magnesium_mg?: number | null;
  phosphorus_mg?: number | null;
  potassium_mg?: number | null;
  sodium_mg?: number | null;
  zinc_mg?: number | null;
  copper_mg?: number | null;
  vitamin_a_mcg?: number | null;
  retinol_mcg?: number | null;
  beta_carotene_mcg?: number | null;
  vitamin_d_mcg?: number | null;
  vitamin_e_mg?: number | null;
  thiamin_mg?: number | null;
  riboflavin_mg?: number | null;
  niacin_mg?: number | null;
  vitamin_b6_mg?: number | null;
  folate_mcg?: number | null;
  vitamin_c_mg?: number | null;
  
  // Structured Raw vs Cooked Architecture
  foodId?: string;
  foodNameBn?: string;
  foodNameEn?: string;
  foodState?: FoodState;
  preparationMethod?: PreparationMethod;
  nutrientBasis?: NutrientBasis;
  nutrientsPer100g?: NutrientsPer100g;
  sourceReference?: string;
  cookingYieldFactor?: number;
  nutrientRetentionFactors?: NutrientRetentionFactors;
  dataConfidence?: DataConfidence;
  pairedFoodCode?: string;
  availableStates?: FoodState[];

  // Provenance & Source Metadata
  source_database?: 'bangladesh_fct' | 'usda_global' | 'custom_user';
  source_pages?: number[];
  table_page?: number;
  is_plant?: boolean;
  plant_category?: PlantCategory;
  glycemic_index?: number | null;
  gi_rating?: 'low' | 'medium' | 'high' | null;
  fodmap_status?: string | null;
  purine_level?: 'low' | 'moderate' | 'high' | null;
  oxalate_status?: string | null;
  allergens?: string[];
}

export type PlantCategory = 
  | 'leafy_green'
  | 'cruciferous'
  | 'allium'
  | 'root_tuber'
  | 'legume'
  | 'whole_grain'
  | 'nut_seed'
  | 'fruit'
  | 'herb_spice'
  | 'other_vegetable';

export type ServingUnit = 
  | 'g'
  | 'ml'
  | 'piece'
  | 'cup'
  | 'bowl'
  | 'plate'
  | 'tablespoon'
  | 'teaspoon';

export interface ServingPortion {
  unit: ServingUnit;
  gramWeight: number;
  label_bn: string;
  label_en: string;
}

export interface FoodSearchResult {
  code: string;
  name_bn: string;
  name_en: string;
  roman?: string;
  category: string;
  energy_kcal: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
}
