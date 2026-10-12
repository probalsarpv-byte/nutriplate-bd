import bangladeshFoods from '../data/bangladesh-foods.json';
import globalFoodsData from '../data/global-foods.json';
import categoryDefs from '../data/categories.json';
import { FoodItem, ServingUnit, ServingPortion, FoodState, PreparationMethod, NutrientBasis, DataConfidence, NutrientsPer100g } from '../../types/food';
import { Recipe } from '../../types/recipe';

// Standard unit conversions for typical household measures in Bangladesh
export const STANDARD_PORTIONS: Record<ServingUnit, { grams: number; label_bn: string; label_en: string }> = {
  g: { grams: 1, label_bn: 'গ্রাম', label_en: 'g' },
  ml: { grams: 1, label_bn: 'মিলি', label_en: 'ml' },
  piece: { grams: 50, label_bn: 'টি / পিস', label_en: 'piece' },
  cup: { grams: 150, label_bn: 'কাপ (১৫০ গ্রাম)', label_en: 'cup (150g)' },
  bowl: { grams: 250, label_bn: 'বাটি (২৫০ গ্রাম)', label_en: 'bowl (250g)' },
  plate: { grams: 350, label_bn: 'প্লেট (৩৫০ গ্রাম)', label_en: 'plate (350g)' },
  tablespoon: { grams: 15, label_bn: 'টেবিল চামচ (১৫ গ্রাম)', label_en: 'tbsp (15g)' },
  teaspoon: { grams: 5, label_bn: 'চা চামচ (৫ গ্রাম)', label_en: 'tsp (5g)' },
};

/**
 * Analytical Raw-to-Cooked and Prepared Dish links based on University of Dhaka
 * INFS Food Composition Table for Bangladesh (2013).
 */
export interface RawCookedLink {
  rawCode: string;
  cookedCode: string;
  preparedCode?: string;
  cookingYieldFactor: number; // cookedWeight / rawWeight
  preparationMethod: PreparationMethod;
}

export const RAW_COOKED_PAIRS: RawCookedLink[] = [
  // Cereals / Rice
  { rawCode: '01_0012', cookedCode: '01_0037', preparedCode: 'PREP_KHICHURI', cookingYieldFactor: 3.15, preparationMethod: 'boiled' },
  { rawCode: '01_0013', cookedCode: '01_0037', preparedCode: 'PREP_KHICHURI', cookingYieldFactor: 3.15, preparationMethod: 'boiled' },
  { rawCode: '01_0014', cookedCode: '01_0037', preparedCode: 'PREP_KHICHURI', cookingYieldFactor: 3.15, preparationMethod: 'boiled' },
  { rawCode: '01_0015', cookedCode: '01_0037', preparedCode: 'PREP_KHICHURI', cookingYieldFactor: 3.15, preparationMethod: 'boiled' },
  { rawCode: '01_0016', cookedCode: '01_0037', preparedCode: 'PREP_KHICHURI', cookingYieldFactor: 3.15, preparationMethod: 'boiled' },
  { rawCode: '01_0017', cookedCode: '01_0037', preparedCode: 'PREP_KHICHURI', cookingYieldFactor: 3.15, preparationMethod: 'boiled' },
  { rawCode: '01_0018', cookedCode: '01_0037', preparedCode: 'PREP_KHICHURI', cookingYieldFactor: 3.15, preparationMethod: 'boiled' },
  { rawCode: '01_0020', cookedCode: '01_0038', cookingYieldFactor: 3.11, preparationMethod: 'boiled' },
  { rawCode: '01_0021', cookedCode: '01_0039', cookingYieldFactor: 3.12, preparationMethod: 'boiled' },
  { rawCode: '01_0024', cookedCode: '01_0040', cookingYieldFactor: 3.12, preparationMethod: 'boiled' },
  { rawCode: '01_0025', cookedCode: '01_0041', cookingYieldFactor: 3.11, preparationMethod: 'boiled' },

  // Pulses / Legumes
  { rawCode: '02_0001', cookedCode: '02_0012', cookingYieldFactor: 1.95, preparationMethod: 'boiled' },
  { rawCode: '02_0002', cookedCode: '02_0012', cookingYieldFactor: 1.95, preparationMethod: 'boiled' },
  { rawCode: '02_0004', cookedCode: '02_0013', cookingYieldFactor: 2.16, preparationMethod: 'boiled' },
  { rawCode: '02_0005', cookedCode: '02_0014', cookingYieldFactor: 2.43, preparationMethod: 'boiled' },
  { rawCode: '02_0007', cookedCode: '02_0015', preparedCode: 'PREP_DAL_TARKA', cookingYieldFactor: 2.21, preparationMethod: 'boiled' },
  { rawCode: '02_0008', cookedCode: '02_0015', preparedCode: 'PREP_DAL_TARKA', cookingYieldFactor: 2.21, preparationMethod: 'boiled' },
  { rawCode: '02_0009', cookedCode: '02_0016', cookingYieldFactor: 1.85, preparationMethod: 'boiled' },

  // Vegetables
  { rawCode: '03_0005', cookedCode: '03_0033', preparedCode: 'PREP_BEGUN_BHAJA', cookingYieldFactor: 0.96, preparationMethod: 'boiled' },
  { rawCode: '03_0007', cookedCode: '03_0034', cookingYieldFactor: 0.98, preparationMethod: 'boiled' },
  { rawCode: '03_0008', cookedCode: '03_0035', cookingYieldFactor: 0.90, preparationMethod: 'boiled' },
  { rawCode: '03_0009', cookedCode: '03_0036', cookingYieldFactor: 0.89, preparationMethod: 'boiled' },
  { rawCode: '03_0011', cookedCode: '03_0037', cookingYieldFactor: 0.95, preparationMethod: 'boiled' },
  { rawCode: '03_0016', cookedCode: '03_0047', preparedCode: '03_0048', cookingYieldFactor: 0.71, preparationMethod: 'boiled' },
  { rawCode: '03_0018', cookedCode: '03_0038', cookingYieldFactor: 0.71, preparationMethod: 'boiled' },
  { rawCode: '03_0023', cookedCode: '03_0040', preparedCode: '03_0046', cookingYieldFactor: 0.97, preparationMethod: 'boiled' },
  { rawCode: '03_0017', cookedCode: '03_0041', cookingYieldFactor: 1.00, preparationMethod: 'boiled' },
  { rawCode: '03_0018', cookedCode: '03_0042', cookingYieldFactor: 0.84, preparationMethod: 'boiled' },
  { rawCode: '03_0019', cookedCode: '03_0043', cookingYieldFactor: 0.90, preparationMethod: 'boiled' },
  { rawCode: '03_0020', cookedCode: '03_0044', cookingYieldFactor: 0.67, preparationMethod: 'boiled' },
  { rawCode: '03_0028', cookedCode: '03_0045', cookingYieldFactor: 0.63, preparationMethod: 'boiled' },

  // Leafy Vegetables (Shak)
  { rawCode: '04_0016', cookedCode: '04_0032', cookingYieldFactor: 0.88, preparationMethod: 'boiled' },
  { rawCode: '04_0014', cookedCode: '04_0033', cookingYieldFactor: 0.70, preparationMethod: 'boiled' },
  { rawCode: '04_0015', cookedCode: '04_0034', cookingYieldFactor: 0.96, preparationMethod: 'boiled' },
  { rawCode: '04_0023', cookedCode: '04_0035', cookingYieldFactor: 0.55, preparationMethod: 'boiled' },

  // Roots & Tubers
  { rawCode: '05_0001', cookedCode: '05_0011', cookingYieldFactor: 0.84, preparationMethod: 'boiled' },
  { rawCode: '05_0002', cookedCode: '05_0012', preparedCode: 'PREP_ALU_BHORTA', cookingYieldFactor: 0.96, preparationMethod: 'boiled' },
  { rawCode: '05_0005', cookedCode: '05_0013', cookingYieldFactor: 0.95, preparationMethod: 'boiled' },
  { rawCode: '05_0006', cookedCode: '05_0014', cookingYieldFactor: 0.94, preparationMethod: 'boiled' },
  { rawCode: '05_0007', cookedCode: '05_0015', cookingYieldFactor: 0.96, preparationMethod: 'boiled' },
  { rawCode: '05_0008', cookedCode: '05_0016', cookingYieldFactor: 0.96, preparationMethod: 'boiled' },
  { rawCode: '05_0009', cookedCode: '05_0018', cookingYieldFactor: 1.00, preparationMethod: 'boiled' },

  // Eggs
  { rawCode: '11_0001', cookedCode: '11_0005', cookingYieldFactor: 0.91, preparationMethod: 'boiled' },
  { rawCode: '11_0002', cookedCode: '11_0006', cookingYieldFactor: 0.97, preparationMethod: 'boiled' },
  { rawCode: '11_0003', cookedCode: '11_0007', cookingYieldFactor: 0.86, preparationMethod: 'boiled' },

  // Fish & Poultry
  { rawCode: '09_0025', cookedCode: '09_0071', cookingYieldFactor: 0.87, preparationMethod: 'fried' },
  { rawCode: '09_0059', cookedCode: 'PREP_ROHU_CURRY', preparedCode: 'PREP_ROHU_CURRY', cookingYieldFactor: 0.85, preparationMethod: 'curry' },
  { rawCode: '09_0030', cookedCode: 'PREP_HILSA_BHAPA', preparedCode: 'PREP_HILSA_BHAPA', cookingYieldFactor: 0.85, preparationMethod: 'curry' },
  { rawCode: '10_0006', cookedCode: 'PREP_CHICKEN_CURRY', preparedCode: 'PREP_CHICKEN_CURRY', cookingYieldFactor: 0.80, preparationMethod: 'curry' },
  { rawCode: '10_0007', cookedCode: 'PREP_CHICKEN_CURRY', preparedCode: 'PREP_CHICKEN_CURRY', cookingYieldFactor: 0.80, preparationMethod: 'curry' },
  { rawCode: '10_0001', cookedCode: 'PREP_BEEF_BHUNA', preparedCode: 'PREP_BEEF_BHUNA', cookingYieldFactor: 0.78, preparationMethod: 'curry' },
];

// Ready-made composite Bangladeshi dishes
export const READY_MADE_DISHES: FoodItem[] = [
  {
    code: 'PREP_ROHU_CURRY',
    foodId: 'PREP_ROHU_CURRY',
    category: 'Fish, shellfish and their products',
    english: 'Rohu Fish Curry (Macher Jhol)',
    bengali: 'রুই মাছের ঝোল (কারি)',
    name_bn: 'রুই মাছের ঝোল (কারি)',
    name_en: 'Rohu Fish Curry',
    foodNameBn: 'রুই মাছের ঝোল (কারি)',
    foodNameEn: 'Rohu Fish Curry',
    edible_portion: 1,
    energy_kcal: 138,
    protein_g: 13.5,
    fat_g: 8.2,
    carb_g: 2.1,
    fibre_g: 0.6,
    calcium_mg: 125,
    iron_mg: 1.4,
    sodium_mg: 280,
    potassium_mg: 290,
    foodState: 'PREPARED',
    preparationMethod: 'curry',
    nutrientBasis: 'per_100g_cooked',
    sourceReference: 'NutriPlate BD Standard Recipe Formulation',
    dataConfidence: 'calculated_recipe',
    is_plant: false,
    pairedFoodCode: '09_0059',
    availableStates: ['RAW', 'PREPARED'],
  },
  {
    code: 'PREP_CHICKEN_CURRY',
    foodId: 'PREP_CHICKEN_CURRY',
    category: 'Meat, poultry and their products',
    english: 'Chicken Curry (Murgir Bhuna)',
    bengali: 'দেশি মুরগির ঝোল (কারি)',
    name_bn: 'দেশি মুরগির ঝোল (কারি)',
    name_en: 'Chicken Curry',
    foodNameBn: 'দেশি মুরগির ঝোল (কারি)',
    foodNameEn: 'Chicken Curry',
    edible_portion: 1,
    energy_kcal: 165,
    protein_g: 18.2,
    fat_g: 9.5,
    carb_g: 1.8,
    fibre_g: 0.4,
    calcium_mg: 18,
    iron_mg: 1.6,
    sodium_mg: 320,
    potassium_mg: 260,
    foodState: 'PREPARED',
    preparationMethod: 'curry',
    nutrientBasis: 'per_100g_cooked',
    sourceReference: 'NutriPlate BD Standard Recipe Formulation',
    dataConfidence: 'calculated_recipe',
    is_plant: false,
    pairedFoodCode: '10_0006',
    availableStates: ['RAW', 'PREPARED'],
  },
  {
    code: 'PREP_BEEF_BHUNA',
    foodId: 'PREP_BEEF_BHUNA',
    category: 'Meat, poultry and their products',
    english: 'Beef Bhuna (Gorur Bhuna)',
    bengali: 'গরুর মাংসের ভুনা',
    name_bn: 'গরুর মাংসের ভুনা',
    name_en: 'Beef Bhuna',
    foodNameBn: 'গরুর মাংসের ভুনা',
    foodNameEn: 'Beef Bhuna',
    edible_portion: 1,
    energy_kcal: 210,
    protein_g: 22.0,
    fat_g: 12.8,
    carb_g: 1.5,
    fibre_g: 0.3,
    calcium_mg: 20,
    iron_mg: 2.8,
    sodium_mg: 340,
    potassium_mg: 310,
    foodState: 'PREPARED',
    preparationMethod: 'curry',
    nutrientBasis: 'per_100g_cooked',
    sourceReference: 'NutriPlate BD Standard Recipe Formulation',
    dataConfidence: 'calculated_recipe',
    is_plant: false,
    pairedFoodCode: '10_0001',
    availableStates: ['RAW', 'PREPARED'],
  },
  {
    code: 'PREP_DAL_TARKA',
    foodId: 'PREP_DAL_TARKA',
    category: 'Pulses, legumes and their products',
    english: 'Cooked Lentil Soup (Moshur Dal Bagar)',
    bengali: 'মসুর ডাল বাগার / তরকা',
    name_bn: 'মসুর ডাল বাগার / তরকা',
    name_en: 'Lentil Soup with Tadka',
    foodNameBn: 'মসুর ডাল বাগার / তরকা',
    foodNameEn: 'Lentil Soup with Tadka',
    edible_portion: 1,
    energy_kcal: 88,
    protein_g: 4.8,
    fat_g: 3.2,
    carb_g: 10.5,
    fibre_g: 2.4,
    calcium_mg: 22,
    iron_mg: 1.9,
    sodium_mg: 190,
    potassium_mg: 220,
    foodState: 'PREPARED',
    preparationMethod: 'curry',
    nutrientBasis: 'per_100g_cooked',
    sourceReference: 'NutriPlate BD Standard Recipe Formulation',
    dataConfidence: 'calculated_recipe',
    is_plant: true,
    pairedFoodCode: '02_0007',
    availableStates: ['RAW', 'COOKED', 'PREPARED'],
  },
  {
    code: 'PREP_KHICHURI',
    foodId: 'PREP_KHICHURI',
    category: 'Cereals and their products',
    english: 'Bhuna Khichuri (Rice & Lentil Mix)',
    bengali: 'ডাল-চাল ভোজ্য ভুনা খিচুড়ি',
    name_bn: 'ডাল-চাল ভোজ্য ভুনা খিচুড়ি',
    name_en: 'Bhuna Khichuri',
    foodNameBn: 'ডাল-চাল ভোজ্য ভুনা খিচুড়ি',
    foodNameEn: 'Bhuna Khichuri',
    edible_portion: 1,
    energy_kcal: 142,
    protein_g: 4.2,
    fat_g: 4.1,
    carb_g: 22.0,
    fibre_g: 2.1,
    calcium_mg: 18,
    iron_mg: 1.3,
    sodium_mg: 210,
    potassium_mg: 140,
    foodState: 'PREPARED',
    preparationMethod: 'curry',
    nutrientBasis: 'per_100g_cooked',
    sourceReference: 'NutriPlate BD Standard Recipe Formulation',
    dataConfidence: 'calculated_recipe',
    is_plant: true,
    pairedFoodCode: '01_0012',
    availableStates: ['RAW', 'COOKED', 'PREPARED'],
  },
  {
    code: 'PREP_ALU_BHORTA',
    foodId: 'PREP_ALU_BHORTA',
    category: 'Starchy roots, tubers and their products',
    english: 'Mashed Potato (Alu Bhorta)',
    bengali: 'আলু ভর্তা (সরিষার তেল ও পেঁয়াজ সহ)',
    name_bn: 'আলু ভর্তা',
    name_en: 'Mashed Potato (Alu Bhorta)',
    foodNameBn: 'আলু ভর্তা',
    foodNameEn: 'Mashed Potato (Alu Bhorta)',
    edible_portion: 1,
    energy_kcal: 112,
    protein_g: 2.1,
    fat_g: 4.5,
    carb_g: 16.2,
    fibre_g: 1.8,
    calcium_mg: 14,
    iron_mg: 0.8,
    sodium_mg: 180,
    potassium_mg: 320,
    foodState: 'PREPARED',
    preparationMethod: 'boiled',
    nutrientBasis: 'per_100g_cooked',
    sourceReference: 'NutriPlate BD Standard Recipe Formulation',
    dataConfidence: 'calculated_recipe',
    is_plant: true,
    pairedFoodCode: '05_0002',
    availableStates: ['RAW', 'COOKED', 'PREPARED'],
  },
  {
    code: 'PREP_BEGUN_BHAJA',
    foodId: 'PREP_BEGUN_BHAJA',
    category: 'Vegetables and their products',
    english: 'Fried Eggplant (Begun Bhaja)',
    bengali: 'বেগুন ভাজা',
    name_bn: 'বেগুন ভাজা',
    name_en: 'Fried Eggplant (Begun Bhaja)',
    foodNameBn: 'বেগুন ভাজা',
    foodNameEn: 'Fried Eggplant (Begun Bhaja)',
    edible_portion: 1,
    energy_kcal: 104,
    protein_g: 1.8,
    fat_g: 8.2,
    carb_g: 6.5,
    fibre_g: 3.2,
    calcium_mg: 20,
    iron_mg: 1.1,
    sodium_mg: 160,
    potassium_mg: 210,
    foodState: 'PREPARED',
    preparationMethod: 'fried',
    nutrientBasis: 'per_100g_cooked',
    sourceReference: 'NutriPlate BD Standard Recipe Formulation',
    dataConfidence: 'calculated_recipe',
    is_plant: true,
    pairedFoodCode: '03_0003',
    availableStates: ['RAW', 'COOKED', 'PREPARED'],
  },
  {
    code: 'PREP_HILSA_BHAPA',
    foodId: 'PREP_HILSA_BHAPA',
    category: 'Fish, shellfish and their products',
    english: 'Mustard Hilsa / Steamed Hilsa (Shorshe Ilish)',
    bengali: 'সর্ষে ইলিশ / ভাপা ইলিশ',
    name_bn: 'সর্ষে ইলিশ',
    name_en: 'Mustard Hilsa Curry',
    foodNameBn: 'সর্ষে ইলিশ',
    foodNameEn: 'Mustard Hilsa Curry',
    edible_portion: 1,
    energy_kcal: 280,
    protein_g: 17.5,
    fat_g: 22.0,
    carb_g: 2.8,
    fibre_g: 0.9,
    calcium_mg: 160,
    iron_mg: 2.1,
    sodium_mg: 310,
    potassium_mg: 270,
    foodState: 'PREPARED',
    preparationMethod: 'curry',
    nutrientBasis: 'per_100g_cooked',
    sourceReference: 'NutriPlate BD Standard Recipe Formulation',
    dataConfidence: 'calculated_recipe',
    is_plant: false,
    pairedFoodCode: '09_0030',
    availableStates: ['RAW', 'PREPARED'],
  },
];

class FoodDatabaseAdapter {
  private foods: FoodItem[] = [];
  private categories: Array<{ id: string; name: string; icon: string }> = [];
  private customRecipeFoods: Map<string, FoodItem> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    // 1. Process 381 Bangladesh FCT foods
    const bdFoods: FoodItem[] = (bangladeshFoods as any[]).map((f) => {
      const isCooked = this.detectIsCooked(f);
      const isPrepared = this.detectIsPrepared(f);
      const state: FoodState = isPrepared ? 'PREPARED' : isCooked ? 'COOKED' : 'RAW';
      const prepMethod: PreparationMethod = this.detectPreparationMethod(f);
      const basis: NutrientBasis = state === 'RAW' ? 'per_100g_raw' : 'per_100g_cooked';

      const nutrients: NutrientsPer100g = {
        energy_kcal: f.energy_kcal ?? 0,
        protein_g: f.protein_g ?? 0,
        fat_g: f.fat_g ?? 0,
        carb_g: f.carb_g ?? 0,
        fibre_g: f.fibre_g ?? 0,
        water_g: f.water_g,
        calcium_mg: f.calcium_mg ?? null,
        iron_mg: f.iron_mg ?? null,
        sodium_mg: f.sodium_mg ?? null,
        potassium_mg: f.potassium_mg ?? null,
        zinc_mg: f.zinc_mg ?? null,
        vitamin_c_mg: f.vitamin_c_mg ?? null,
        folate_mcg: f.folate_mcg ?? null,
      };

      return {
        code: f.code,
        category: f.category,
        english: f.english || f.name_en || '',
        bengali: f.bengali || f.name_bn || '',
        scientific: f.scientific,
        bengali_roman: f.bengali_roman,
        name_bn: f.name_bn || f.bengali,
        name_en: f.name_en || f.english,
        foodId: f.code,
        foodNameBn: f.name_bn || f.bengali,
        foodNameEn: f.name_en || f.english,
        edible_portion: typeof f.edible_portion === 'number' ? f.edible_portion : 1,
        energy_kcal: f.energy_kcal ?? 0,
        energy_kj: f.energy_kj,
        water_g: f.water_g,
        protein_g: f.protein_g ?? 0,
        fat_g: f.fat_g ?? 0,
        carb_g: f.carb_g ?? 0,
        fibre_g: f.fibre_g ?? 0,
        ash_g: f.ash_g,
        calcium_mg: f.calcium_mg ?? null,
        iron_mg: f.iron_mg ?? null,
        magnesium_mg: f.magnesium_mg ?? null,
        phosphorus_mg: f.phosphorus_mg ?? null,
        potassium_mg: f.potassium_mg ?? null,
        sodium_mg: f.sodium_mg ?? null,
        zinc_mg: f.zinc_mg ?? null,
        copper_mg: f.copper_mg ?? null,
        vitamin_a_mcg: f.vitamin_a_mcg ?? null,
        retinol_mcg: f.retinol_mcg ?? null,
        beta_carotene_mcg: f.beta_carotene_mcg ?? null,
        vitamin_d_mcg: f.vitamin_d_mcg ?? null,
        vitamin_e_mg: f.vitamin_e_mg ?? null,
        thiamin_mg: f.thiamin_mg ?? null,
        riboflavin_mg: f.riboflavin_mg ?? null,
        niacin_mg: f.niacin_mg ?? null,
        vitamin_b6_mg: f.vitamin_b6_mg ?? null,
        folate_mcg: f.folate_mcg ?? null,
        vitamin_c_mg: f.vitamin_c_mg ?? null,
        source_database: 'bangladesh_fct',
        source_pages: f.source_pages,
        table_page: f.table_page,
        is_plant: this.detectPlantFood(f.category, f.english),

        // Structured Raw vs Cooked Architecture
        foodState: state,
        preparationMethod: prepMethod,
        nutrientBasis: basis,
        nutrientsPer100g: nutrients,
        sourceReference: 'INFS Food Composition Table for Bangladesh (2013)',
        dataConfidence: 'analytical' as DataConfidence,
      };
    });

    // 2. Process USDA Global Foods (88 items)
    const gfList = (globalFoodsData as any).foods || [];
    const gfMapped: FoodItem[] = gfList.map((g: any) => ({
      code: g.id,
      category: g.category || 'Global Foods',
      english: g.name_en,
      bengali: g.name_bn,
      bengali_roman: g.aliases ? g.aliases.join(', ') : '',
      name_bn: g.name_bn,
      name_en: g.name_en,
      foodId: g.id,
      foodNameBn: g.name_bn,
      foodNameEn: g.name_en,
      edible_portion: 1,
      energy_kcal: g.energy_kcal ?? 0,
      protein_g: g.protein_g ?? 0,
      fat_g: g.fat_g ?? 0,
      carb_g: g.carb_g ?? 0,
      fibre_g: g.fibre_g ?? 0,
      calcium_mg: null,
      iron_mg: null,
      sodium_mg: null,
      potassium_mg: null,
      source_database: 'usda_global',
      sourceReference: 'USDA FoodData Central',
      dataConfidence: 'estimated' as DataConfidence,
      is_plant: g.category === 'nuts_seeds' || g.category === 'fruits' || g.category === 'vegetables' || g.category === 'cereals',
      foodState: 'RAW' as FoodState,
      preparationMethod: 'raw' as PreparationMethod,
      nutrientBasis: 'per_100g_raw' as NutrientBasis,
      nutrientsPer100g: {
        energy_kcal: g.energy_kcal ?? 0,
        protein_g: g.protein_g ?? 0,
        fat_g: g.fat_g ?? 0,
        carb_g: g.carb_g ?? 0,
        fibre_g: g.fibre_g ?? 0,
      },
    }));

    // Combine base foods and ready-made dishes
    this.foods = [...bdFoods, ...gfMapped, ...READY_MADE_DISHES];
    this.categories = categoryDefs as any[];

    // 3. Bidirectional linking between raw, cooked, and prepared dishes
    this.applyRawCookedPairings();
  }

  private detectIsCooked(f: any): boolean {
    const en = (f.english || '').toLowerCase();
    const bn = (f.bengali || '').toLowerCase();

    // Raw parboiled rice grains and raw foods explicitly marked "raw" or "কাঁচা"
    if (en.includes('raw') || bn.includes('কাঁচা')) {
      return false;
    }

    return (
      en.includes('boiled') ||
      en.includes('fry*') ||
      en.includes('fried') ||
      en.includes('baked') ||
      en.includes('roasted') ||
      en.includes('steamed') ||
      en.includes('cooked') ||
      bn.includes('লবণ ছাড়া') ||
      bn.includes('লবণ ছাড়া') ||
      bn.includes('ভাত') ||
      bn.includes('ভাজা') ||
      bn.includes('ভাজি')
    );
  }

  private detectIsPrepared(f: any): boolean {
    const en = (f.english || '').toLowerCase();
    const bn = (f.bengali || '').toLowerCase();
    return (
      en.includes('payesh') ||
      en.includes('fish ball') ||
      en.includes('curry') ||
      en.includes('khichuri') ||
      en.includes('bhorta') ||
      bn.includes('পায়েস') ||
      bn.includes('কোফতা') ||
      bn.includes('খিচুড়ি') ||
      bn.includes('ভর্তা')
    );
  }

  private detectPreparationMethod(f: any): PreparationMethod {
    const en = (f.english || '').toLowerCase();
    const bn = (f.bengali || '').toLowerCase();
    if (en.includes('boiled') || bn.includes('সিদ্ধ')) return 'boiled';
    if (en.includes('fry') || bn.includes('ভাজা') || bn.includes('ভাজি')) return 'fried';
    if (en.includes('steamed') || bn.includes('ভাপা')) return 'steamed';
    if (en.includes('roasted') || bn.includes('পোড়া')) return 'roasted';
    if (en.includes('curry') || bn.includes('ঝোল') || bn.includes('ভুনা')) return 'curry';
    if (en.includes('baked')) return 'baked';
    return 'raw';
  }

  private applyRawCookedPairings() {
    const foodMap = new Map<string, FoodItem>();
    this.foods.forEach((f) => foodMap.set(f.code, f));

    RAW_COOKED_PAIRS.forEach((pair) => {
      const rawItem = foodMap.get(pair.rawCode);
      const cookedItem = foodMap.get(pair.cookedCode);
      const preparedItem = pair.preparedCode ? foodMap.get(pair.preparedCode) : undefined;

      if (rawItem && cookedItem) {
        // Raw Item setup
        rawItem.pairedFoodCode = cookedItem.code;
        rawItem.cookingYieldFactor = pair.cookingYieldFactor;
        const rawStates: FoodState[] = ['RAW', 'COOKED'];
        if (preparedItem) rawStates.push('PREPARED');
        rawItem.availableStates = rawStates;

        // Cooked Item setup
        cookedItem.pairedFoodCode = rawItem.code;
        cookedItem.cookingYieldFactor = pair.cookingYieldFactor;
        const cookedStates: FoodState[] = ['RAW', 'COOKED'];
        if (preparedItem) cookedStates.push('PREPARED');
        cookedItem.availableStates = cookedStates;

        // Prepared Item setup if exists
        if (preparedItem) {
          preparedItem.pairedFoodCode = rawItem.code;
          preparedItem.availableStates = ['RAW', 'COOKED', 'PREPARED'];
        }
      }
    });
  }

  private detectPlantFood(category: string, englishName: string): boolean {
    const nonPlantCategories = [
      'Fish, shellfish and their products',
      'Meat, poultry and their products',
      'Eggs and their products',
      'Milk and its products',
      'Fat and oils',
    ];
    if (nonPlantCategories.includes(category)) {
      if (
        category === 'Fat and oils' &&
        (englishName.toLowerCase().includes('mustard') ||
          englishName.toLowerCase().includes('soybean') ||
          englishName.toLowerCase().includes('rice bran') ||
          englishName.toLowerCase().includes('sesame'))
      ) {
        return true; // plant based oil
      }
      return false;
    }
    return true;
  }

  public getAllFoods(): FoodItem[] {
    return [...this.foods, ...Array.from(this.customRecipeFoods.values())];
  }

  public getCategories(): Array<{ id: string; name: string; icon: string }> {
    return this.categories;
  }

  public getFoodByCode(code: string): FoodItem | undefined {
    if (this.customRecipeFoods.has(code)) {
      return this.customRecipeFoods.get(code);
    }
    return this.foods.find((f) => f.code === code);
  }

  /**
   * Bilingual search supporting Bengali, English, Roman transliteration, and category/state filters
   */
  public searchFoods(query: string, categoryFilter?: string, stateFilter?: FoodState): FoodItem[] {
    const q = query.trim().toLowerCase();
    let results = this.getAllFoods();

    if (stateFilter) {
      results = results.filter((f) => f.foodState === stateFilter);
    }

    if (categoryFilter && categoryFilter !== 'all') {
      results = results.filter((f) => {
        return f.category.toLowerCase().includes(categoryFilter.toLowerCase()) || f.code.startsWith(categoryFilter);
      });
    }

    if (!q) {
      return results.slice(0, 50);
    }

    return results
      .filter((f) => {
        const bnMatch = f.bengali?.toLowerCase().includes(q) || f.name_bn?.toLowerCase().includes(q) || f.foodNameBn?.toLowerCase().includes(q);
        const enMatch = f.english?.toLowerCase().includes(q) || f.name_en?.toLowerCase().includes(q) || f.foodNameEn?.toLowerCase().includes(q);
        const romanMatch = f.bengali_roman?.toLowerCase().includes(q);
        const codeMatch = f.code.toLowerCase().includes(q);
        return bnMatch || enMatch || romanMatch || codeMatch;
      })
      .slice(0, 50);
  }

  /**
   * Returns available states for a food item (RAW | COOKED | PREPARED)
   */
  public getAvailableStates(food: FoodItem): FoodState[] {
    if (food.availableStates && food.availableStates.length > 0) {
      return food.availableStates;
    }
    return [food.foodState || 'RAW'];
  }

  /**
   * Retrieves the paired food item corresponding to a target state (e.g. from Raw Rice to Boiled Rice)
   */
  public getPairedFood(food: FoodItem, targetState: FoodState): FoodItem | undefined {
    if (food.foodState === targetState) return food;

    // Check direct link in RAW_COOKED_PAIRS
    const link = RAW_COOKED_PAIRS.find(
      (p) =>
        p.rawCode === food.code ||
        p.cookedCode === food.code ||
        p.preparedCode === food.code
    );

    if (link) {
      if (targetState === 'RAW') {
        return this.getFoodByCode(link.rawCode);
      }
      if (targetState === 'COOKED') {
        return this.getFoodByCode(link.cookedCode);
      }
      if (targetState === 'PREPARED' && link.preparedCode) {
        return this.getFoodByCode(link.preparedCode);
      }
    }

    // Direct paired food code check
    if (food.pairedFoodCode) {
      const paired = this.getFoodByCode(food.pairedFoodCode);
      if (paired && paired.foodState === targetState) {
        return paired;
      }
    }

    return undefined;
  }

  /**
   * Registers a user-created recipe from Recipe Lab as a searchable, reusable PREPARED food
   */
  public registerCustomRecipeAsFood(recipe: Recipe): FoodItem {
    const cookedYield = recipe.cookedYieldWeightGrams > 0 ? recipe.cookedYieldWeightGrams : recipe.rawTotalWeightGrams;
    const ratioPer100g = 100 / (cookedYield || 100);

    const nutrientsPer100g: NutrientsPer100g = {
      energy_kcal: Math.round(recipe.totalCalories * ratioPer100g),
      protein_g: Number((recipe.totalProtein * ratioPer100g).toFixed(1)),
      fat_g: Number((recipe.totalFat * ratioPer100g).toFixed(1)),
      carb_g: Number((recipe.totalCarbs * ratioPer100g).toFixed(1)),
      fibre_g: Number((recipe.totalFibre * ratioPer100g).toFixed(1)),
    };

    const foodItem: FoodItem = {
      code: recipe.id,
      foodId: recipe.id,
      category: 'Custom Recipes',
      english: recipe.name,
      bengali: recipe.name,
      name_bn: recipe.name,
      name_en: recipe.name,
      foodNameBn: recipe.name,
      foodNameEn: recipe.name,
      edible_portion: 1,
      energy_kcal: nutrientsPer100g.energy_kcal,
      protein_g: nutrientsPer100g.protein_g,
      fat_g: nutrientsPer100g.fat_g,
      carb_g: nutrientsPer100g.carb_g,
      fibre_g: nutrientsPer100g.fibre_g,
      foodState: 'PREPARED',
      preparationMethod: 'curry',
      nutrientBasis: 'per_100g_cooked',
      nutrientsPer100g,
      source_database: 'custom_user',
      sourceReference: 'NutriPlate BD Recipe Lab (Calculated)',
      dataConfidence: 'calculated_recipe',
      cookingYieldFactor: Number((cookedYield / (recipe.rawTotalWeightGrams || 1)).toFixed(2)),
      is_plant: recipe.ingredients.every((i) => i.food.is_plant),
      availableStates: ['PREPARED'],
    };

    this.customRecipeFoods.set(recipe.id, foodItem);
    return foodItem;
  }

  /**
   * Calculates nutrient composition for a given food code and gram weight.
   * Preserves null values for unanalyzed micronutrients. Never assumes missing is 0.
   */
  public calculateNutrients(code: string, grams: number): FoodItem | null {
    const food = this.getFoodByCode(code);
    if (!food || grams <= 0) return null;

    const ratio = grams / 100;

    const scale = (val: number | null | undefined): number | null => {
      if (val === null || val === undefined) return null;
      return Number((val * ratio).toFixed(2));
    };

    return {
      ...food,
      energy_kcal: Math.round(food.energy_kcal * ratio),
      energy_kj: food.energy_kj ? Math.round(food.energy_kj * ratio) : undefined,
      protein_g: Number((food.protein_g * ratio).toFixed(1)),
      fat_g: Number((food.fat_g * ratio).toFixed(1)),
      carb_g: Number((food.carb_g * ratio).toFixed(1)),
      fibre_g: Number((food.fibre_g * ratio).toFixed(1)),
      water_g: food.water_g ? Number((food.water_g * ratio).toFixed(1)) : undefined,
      calcium_mg: scale(food.calcium_mg),
      iron_mg: scale(food.iron_mg),
      magnesium_mg: scale(food.magnesium_mg),
      phosphorus_mg: scale(food.phosphorus_mg),
      potassium_mg: scale(food.potassium_mg),
      sodium_mg: scale(food.sodium_mg),
      zinc_mg: scale(food.zinc_mg),
      vitamin_a_mcg: scale(food.vitamin_a_mcg),
      vitamin_c_mg: scale(food.vitamin_c_mg),
      vitamin_d_mcg: scale(food.vitamin_d_mcg),
      folate_mcg: scale(food.folate_mcg),
    };
  }

  /**
   * Provides available serving portions for a food item.
   */
  public getServingPortions(food: FoodItem): ServingPortion[] {
    const list: ServingPortion[] = [
      { unit: 'g', gramWeight: 1, label_bn: 'গ্রাম', label_en: 'g' },
    ];

    const category = food.category.toLowerCase();
    const name = food.english.toLowerCase();

    if (category.includes('cereal') || name.includes('rice') || name.includes('bhat') || name.includes('khichuri')) {
      if (food.foodState === 'RAW') {
        list.push(
          { unit: 'cup', gramWeight: 100, label_bn: '১ কাপ কাঁচা চাল (১০০ গ্রাম)', label_en: '1 Cup raw (100g)' },
          { unit: 'bowl', gramWeight: 200, label_bn: '১ বাটি কাঁচা চাল (২০০ গ্রাম)', label_en: '1 Bowl raw (200g)' },
          { unit: 'tablespoon', gramWeight: 15, label_bn: '১ টেবিল চামচ (১৫ গ্রাম)', label_en: '1 Tablespoon (15g)' }
        );
      } else {
        list.push(
          { unit: 'cup', gramWeight: 150, label_bn: '১ কাপ রান্না করা ভাত (১৫০ গ্রাম)', label_en: '1 Cup cooked (150g)' },
          { unit: 'plate', gramWeight: 300, label_bn: '১ মাঝারি প্লেট (৩০০ গ্রাম)', label_en: '1 Medium plate (300g)' },
          { unit: 'bowl', gramWeight: 200, label_bn: '১ বাটি (২০০ গ্রাম)', label_en: '1 Medium bowl (200g)' }
        );
      }
    } else if (category.includes('pulse') || category.includes('legume') || name.includes('dal')) {
      if (food.foodState === 'RAW') {
        list.push(
          { unit: 'cup', gramWeight: 100, label_bn: '১ কাপ কাঁচা ডাল (১০০ গ্রাম)', label_en: '1 Cup raw (100g)' },
          { unit: 'tablespoon', gramWeight: 15, label_bn: '১ টেবিল চামচ (১৫ গ্রাম)', label_en: '1 Tablespoon (15g)' }
        );
      } else {
        list.push(
          { unit: 'bowl', gramWeight: 150, label_bn: '১ বাটি ডাল (১৫০ গ্রাম)', label_en: '1 Bowl dal (150g)' },
          { unit: 'cup', gramWeight: 180, label_bn: '১ কাপ ডাল (১৮০ গ্রাম)', label_en: '1 Cup dal (180g)' },
          { unit: 'tablespoon', gramWeight: 20, label_bn: '১ টেবিল চামচ (২০ গ্রাম)', label_en: '1 Tablespoon (20g)' }
        );
      }
    } else if (category.includes('fish') || category.includes('meat') || category.includes('poultry')) {
      list.push(
        { unit: 'piece', gramWeight: 75, label_bn: '১ টুকরো / পিস (৭৫ গ্রাম)', label_en: '1 Piece (75g)' },
        { unit: 'piece', gramWeight: 100, label_bn: '১ বড় টুকরো (১০০ গ্রাম)', label_en: '1 Large piece (100g)' },
        { unit: 'bowl', gramWeight: 180, label_bn: '১ বাটি রান্না মাছ/মাংস (১৮০ গ্রাম)', label_en: '1 Bowl cooked (180g)' }
      );
    } else if (category.includes('egg')) {
      list.push(
        { unit: 'piece', gramWeight: 50, label_bn: '১টি সম্পূর্ণ ডিম (৫০ গ্রাম)', label_en: '1 Whole egg (50g)' }
      );
    } else if (category.includes('beverage') || category.includes('milk')) {
      list.push(
        { unit: 'ml', gramWeight: 1, label_bn: 'মিলি', label_en: 'ml' },
        { unit: 'cup', gramWeight: 200, label_bn: '১ কাপ / গ্লাস (২০০ মিলি)', label_en: '1 Cup / Glass (200ml)' }
      );
    } else {
      list.push(
        { unit: 'cup', gramWeight: 120, label_bn: '১ কাপ (১২০ গ্রাম)', label_en: '1 Cup (120g)' },
        { unit: 'bowl', gramWeight: 180, label_bn: '১ বাটি (১৮০ গ্রাম)', label_en: '1 Bowl (180g)' },
        { unit: 'tablespoon', gramWeight: 15, label_bn: '১ টেবিল চামচ (১৫ গ্রাম)', label_en: '1 Tablespoon (15g)' }
      );
    }

    return list;
  }
}

export const foodDatabaseAdapter = new FoodDatabaseAdapter();
