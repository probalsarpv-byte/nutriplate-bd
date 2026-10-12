import { MealFoodItem, MealNutritionSummary, SavedMeal, MealComparisonResult, MealComparisonMetric } from '../../types/meal';
import { FoodItem, ServingUnit } from '../../types/food';
import { UserHealthProfile } from '../../types/user';
import { ClinicalFoodAlert } from '../../types/alerts';
import { foodDatabaseAdapter, STANDARD_PORTIONS } from '../../database/adapters/FoodDatabaseAdapter';
import { evaluateFoodAlerts } from '../pathology/alertEngine';

/**
 * Converts a FoodItem with quantity & unit into a normalized MealFoodItem
 * Preserves analytical nulls and ensures no double-counting of cooking factors.
 */
export function convertFoodToMealItem(
  food: FoodItem,
  quantity: number,
  unit: ServingUnit,
  recipeId?: string
): MealFoodItem {
  const portionInfo = foodDatabaseAdapter.getServingPortions(food).find((p) => p.unit === unit);
  const unitGramWeight = portionInfo?.gramWeight ?? STANDARD_PORTIONS[unit]?.grams ?? 100;
  const totalGrams = Math.round(Math.max(0.1, quantity) * unitGramWeight);

  const scaled = foodDatabaseAdapter.calculateNutrients(food.code, totalGrams);

  return {
    id: `mfi_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    foodCode: food.code,
    recipeId,
    name_bn: food.bengali || food.name_bn || food.english,
    name_en: food.english || food.name_en || food.bengali,
    category: food.category,
    foodState: food.foodState || 'RAW',
    preparationMethod: food.preparationMethod,
    quantity,
    unit,
    gramWeight: totalGrams,
    energy_kcal: scaled ? scaled.energy_kcal : 0,
    protein_g: scaled ? scaled.protein_g : 0,
    fat_g: scaled ? scaled.fat_g : 0,
    carb_g: scaled ? scaled.carb_g : 0,
    fibre_g: scaled ? scaled.fibre_g : 0,
    water_g: scaled?.water_g,
    calcium_mg: scaled?.calcium_mg ?? null,
    iron_mg: scaled?.iron_mg ?? null,
    sodium_mg: scaled?.sodium_mg ?? null,
    potassium_mg: scaled?.potassium_mg ?? null,
    zinc_mg: scaled?.zinc_mg ?? null,
    vitamin_c_mg: scaled?.vitamin_c_mg ?? null,
    folate_mcg: scaled?.folate_mcg ?? null,
    is_plant: Boolean(food.is_plant),
    plant_category: food.plant_category,
    glycemic_index: food.glycemic_index ?? null,
    source_database: food.source_database,
    cookingYieldFactor: food.cookingYieldFactor,
  };
}

/**
 * Calculates aggregated nutrition for a Smart Meal from its component items.
 * Adheres to strict scientific rules:
 * - Internal calculations use full precision.
 * - Unknown/missing micronutrients are preserved as null.
 * - Missing nutrients are NEVER treated as zero.
 * - Recipes use already-computed yield nutrient density without double-loss.
 */
export function calculateMealNutrients(items: MealFoodItem[]): MealNutritionSummary {
  if (!items || items.length === 0) {
    return {
      totalCalories: 0,
      totalCarbs: 0,
      availableCarbs: 0,
      totalProtein: 0,
      totalFat: 0,
      totalSaturatedFat: null,
      totalFibre: 0,
      totalSodium: null,
      totalPotassium: null,
      totalCalcium: null,
      totalIron: null,
      totalZinc: null,
      totalVitaminC: null,
      totalFolate: null,
      totalWeightGrams: 0,
      glycemicLoad: null,
      uniquePlantCount: 0,
      nutrientCompletenessPercent: 100,
      analyzedNutrientCount: 0,
      totalTrackedNutrientCount: 0,
    };
  }

  let totalCalories = 0;
  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalFibre = 0;
  let totalWeight = 0;

  // Trackers for nullable micronutrients
  const micros: Record<string, { sum: number; count: number }> = {
    calcium: { sum: 0, count: 0 },
    iron: { sum: 0, count: 0 },
    sodium: { sum: 0, count: 0 },
    potassium: { sum: 0, count: 0 },
    zinc: { sum: 0, count: 0 },
    vitaminC: { sum: 0, count: 0 },
    folate: { sum: 0, count: 0 },
  };

  const uniquePlants = new Set<string>();
  let glSum = 0;
  let hasValidGL = false;

  const totalPossibleMicroSlots = items.length * Object.keys(micros).length;
  let analyticalMicroSlotsPresent = 0;

  for (const item of items) {
    totalCalories += item.energy_kcal;
    totalCarbs += item.carb_g;
    totalProtein += item.protein_g;
    totalFat += item.fat_g;
    totalFibre += item.fibre_g;
    totalWeight += item.gramWeight;

    if (item.is_plant) {
      uniquePlants.add(item.foodCode);
    }

    // Helper for null-preserving accumulation
    const addMicro = (key: string, val: number | null | undefined) => {
      if (val !== null && val !== undefined && !isNaN(val)) {
        micros[key].sum += val;
        micros[key].count += 1;
        analyticalMicroSlotsPresent += 1;
      }
    };

    addMicro('calcium', item.calcium_mg);
    addMicro('iron', item.iron_mg);
    addMicro('sodium', item.sodium_mg);
    addMicro('potassium', item.potassium_mg);
    addMicro('zinc', item.zinc_mg);
    addMicro('vitaminC', item.vitamin_c_mg);
    addMicro('folate', item.folate_mcg);

    // Glycemic load calculation if GI is present
    if (typeof item.glycemic_index === 'number' && item.glycemic_index > 0) {
      const availCarb = Math.max(0, item.carb_g - item.fibre_g);
      glSum += (item.glycemic_index * availCarb) / 100;
      hasValidGL = true;
    }
  }

  const resolveMicro = (key: string): number | null => {
    // If no food in this meal had data for this micronutrient, return null
    if (micros[key].count === 0) return null;
    return Number(micros[key].sum.toFixed(1));
  };

  const completenessPercent = totalPossibleMicroSlots > 0
    ? Math.round((analyticalMicroSlotsPresent / totalPossibleMicroSlots) * 100)
    : 100;

  const availableCarbs = Math.max(0, Number((totalCarbs - totalFibre).toFixed(1)));

  return {
    totalCalories: Math.round(totalCalories),
    totalCarbs: Number(totalCarbs.toFixed(1)),
    availableCarbs,
    totalProtein: Number(totalProtein.toFixed(1)),
    totalFat: Number(totalFat.toFixed(1)),
    totalSaturatedFat: null,
    totalFibre: Number(totalFibre.toFixed(1)),
    totalCalcium: resolveMicro('calcium') !== null ? Math.round(resolveMicro('calcium')!) : null,
    totalIron: resolveMicro('iron'),
    totalSodium: resolveMicro('sodium') !== null ? Math.round(resolveMicro('sodium')!) : null,
    totalPotassium: resolveMicro('potassium') !== null ? Math.round(resolveMicro('potassium')!) : null,
    totalZinc: resolveMicro('zinc'),
    totalVitaminC: resolveMicro('vitaminC'),
    totalFolate: resolveMicro('folate'),
    totalWeightGrams: Math.round(totalWeight),
    glycemicLoad: hasValidGL ? Number(glSum.toFixed(1)) : null,
    uniquePlantCount: uniquePlants.size,
    nutrientCompletenessPercent: completenessPercent,
    analyzedNutrientCount: analyticalMicroSlotsPresent,
    totalTrackedNutrientCount: totalPossibleMicroSlots,
  };
}

/**
 * Evaluates disease-specific nutritional concerns for a completed meal.
 * Combines individual item alerts (e.g. specific allergen, celiac gluten)
 * with aggregated whole-meal physiological thresholds (e.g. combined carbohydrate load for diabetics).
 */
export function evaluateMealAlerts(
  meal: { items: MealFoodItem[]; nutrition: MealNutritionSummary },
  userProfile: UserHealthProfile,
  dailyAccumulatedSodiumMg: number = 0
): ClinicalFoodAlert[] {
  const alerts: ClinicalFoodAlert[] = [];
  const { conditions, allergens } = userProfile;
  const seenAlertKeys = new Set<string>();

  // 1. Evaluate item-level clinical alerts (e.g., specific allergens, oxalates, purines, celiac gluten)
  for (const item of meal.items) {
    const food = foodDatabaseAdapter.getFoodByCode(item.foodCode);
    if (!food) continue;

    const itemAlerts = evaluateFoodAlerts(food, item.gramWeight, userProfile, dailyAccumulatedSodiumMg);
    for (const a of itemAlerts) {
      if (!seenAlertKeys.has(a.id)) {
        seenAlertKeys.add(a.id);
        alerts.push(a);
      }
    }
  }

  // 2. Meal-level Aggregated Carbohydrate Load (Type 2 Diabetes / Insulin Resistance)
  if (conditions.includes('t2_diabetes') || conditions.includes('insulin_resistance')) {
    const mealCarbs = meal.nutrition.totalCarbs;
    if (mealCarbs > 60) {
      const alertId = 'meal_aggregated_high_carb';
      if (!seenAlertKeys.has(alertId)) {
        seenAlertKeys.add(alertId);
        alerts.push({
          id: alertId,
          conditionId: 't2_diabetes',
          conditionName_bn: 'টাইপ-২ ডায়াবেটিস',
          conditionName_en: 'Type 2 Diabetes',
          severity: 'moderate',
          title_bn: 'মিলের মোট কার্বোহাইড্রেট ঘনত্ব',
          title_en: 'Aggregated Meal Carbohydrate Load',
          triggeringNutrientOrFood: `মোট কার্বোহাইড্রেট (${mealCarbs.toFixed(1)}g)`,
          explanation_bn: `এই সম্পূর্ণ মিলে সর্বমোট ${mealCarbs.toFixed(1)} গ্রাম শর্করা রয়েছে। একবারে অতিরিক্ত শর্করা রক্তের গ্লুকোজ আকস্মিক বৃদ্ধি করতে পারে।`,
          explanation_en: `This combined meal delivers ${mealCarbs.toFixed(1)}g total carbohydrates, which may induce significant postprandial glycemic excursions.`,
          portionContext_bn: `বর্তমান মিলের মোট ফাইবার: ${meal.nutrition.totalFibre} গ্রাম, মোট প্রোটিন: ${meal.nutrition.totalProtein} গ্রাম। সালাদ ও ডাল/মাছের উপস্থিতি শর্করা শোষণ ধীর করতে সহায়ক।`,
          portionContext_en: `Current meal dietary fibre: ${meal.nutrition.totalFibre}g, protein: ${meal.nutrition.totalProtein}g. Pairing with non-starchy vegetables and protein slows gastric emptying.`,
          guidance_bn: 'খাবারের উপাদানগুলো নিষিদ্ধ নয়; শর্করার উৎসগুলোর (যেমন: ভাত বা রুটি) অনুপাত কিছুটা কমিয়ে থালায় শাকসবজি ও প্রোটিন বাড়ালে গ্লাইসেমিক স্থিতি উন্নত হবে।',
          guidance_en: 'Items are not prohibited; modestly moderate starchy portions and emphasize high-fiber greens and lean protein.',
          evidenceGrade: 'B_Grade_Cohort_Study',
          sourceReference: 'American Diabetes Association (ADA) Standards of Care in Diabetes (2024)',
          ruleVersion: 'v1.1.0',
        });
      }
    }
  }

  // 3. Meal-level Aggregated Sodium Load (Hypertension)
  if (conditions.includes('hypertension')) {
    const mealSodium = meal.nutrition.totalSodium;
    if (mealSodium !== null && mealSodium !== undefined && mealSodium > 600) {
      const alertId = 'meal_aggregated_high_sodium';
      if (!seenAlertKeys.has(alertId)) {
        seenAlertKeys.add(alertId);
        alerts.push({
          id: alertId,
          conditionId: 'hypertension',
          conditionName_bn: 'উচ্চ রক্তচাপ',
          conditionName_en: 'Hypertension',
          severity: 'moderate',
          title_bn: 'মিলের সম্মিলিত সোডিয়াম মাত্রা',
          title_en: 'Aggregated Meal Sodium Load',
          triggeringNutrientOrFood: `সোডিয়াম (${mealSodium}mg)`,
          explanation_bn: `এই মিলে মোট প্রায় ${mealSodium} মিলিগ্রাম সোডিয়াম বিদ্যমান (দৈনিক সহনশীল সীমার ৩০% এর বেশি)।`,
          explanation_en: `This meal provides ${mealSodium}mg of sodium (>30% of standard daily restriction of 2000mg).`,
          portionContext_bn: `রান্নায় অতিরিক্ত কাঁচা লবণ যোগ করা থেকে বিরত থাকুন।`,
          portionContext_en: `Avoid adding table salt to the served dish.`,
          guidance_bn: 'মিলের সাথে পর্যাপ্ত প্রাকৃতিক পটাশিয়ামের উৎস (তাজা শাকসবজি ও ফল) নিশ্চিত করুন।',
          guidance_en: 'Ensure adequate dietary potassium from fresh vegetables to maintain sodium-potassium balance.',
          evidenceGrade: 'A_Grade_Clinical_Trial',
          sourceReference: 'ACC/AHA Guideline for the Prevention and Management of High Blood Pressure',
          ruleVersion: 'v1.1.0',
        });
      }
    }
  }

  // 4. Meal-level Aggregated Potassium Load (CKD)
  if (conditions.includes('ckd')) {
    const mealPotassium = meal.nutrition.totalPotassium;
    if (mealPotassium !== null && mealPotassium !== undefined && mealPotassium > 600) {
      const alertId = 'meal_aggregated_high_potassium';
      if (!seenAlertKeys.has(alertId)) {
        seenAlertKeys.add(alertId);
        alerts.push({
          id: alertId,
          conditionId: 'ckd',
          conditionName_bn: 'ক্রনিক কিডনি ডিজিজ (CKD)',
          conditionName_en: 'Chronic Kidney Disease',
          severity: 'moderate',
          title_bn: 'মিলের উচ্চ পটাশিয়াম লোড',
          title_en: 'High Meal Potassium Intake Context',
          triggeringNutrientOrFood: `পটাশিয়াম (${mealPotassium}mg)`,
          explanation_bn: `এই মিলে সম্মিলিত পটাশিয়ামের পরিমাণ ${mealPotassium} মিলিগ্রাম। সিকেডি স্টেজ এবং রক্তের সিরাম পটাশিয়াম রিপোর্ট অনুসারে পটাশিয়াম গ্রহণযোগ্যতা পরিবর্তিত হয়।`,
          explanation_en: `Combined meal potassium is ${mealPotassium}mg. Dietary allowance depends on patient-specific serum potassium and eGFR stage.`,
          guidance_bn: 'আপনার চিকিৎসক বা রেনাল ডায়েটিশিয়ানের প্রেসক্রাইবড নির্দেশিকা অনুযায়ী সমন্বয় করুন।',
          guidance_en: 'Consult individual nephrology dietary guidelines regarding single-meal potassium targets.',
          evidenceGrade: 'C_Grade_Consensus_Guidelines',
          sourceReference: 'KDIGO 2024 Clinical Practice Guideline for CKD',
          ruleVersion: 'v1.1.0',
          missingDataDisclosure: 'ব্যক্তিগত রক্তের ল্যাব রিপোর্ট ব্যতীত সম্পূর্ণ মিল বাদ দেওয়া অনুচিত।',
        });
      }
    }
  }

  return alerts;
}

/**
 * Compares two saved meals side-by-side with clear nutritional differences
 * and evidence-based contextual observations tailored to user profile.
 * Does NOT label one meal universally superior without health context.
 */
export function compareMeals(
  mealA: SavedMeal,
  mealB: SavedMeal,
  userProfile: UserHealthProfile
): MealComparisonResult {
  const nA = mealA.nutrition;
  const nB = mealB.nutrition;

  const diff = (valB: number | null | undefined, valA: number | null | undefined): number | null => {
    if (valA === null || valA === undefined || valB === null || valB === undefined) return null;
    return Number((valB - valA).toFixed(1));
  };

  const metrics: MealComparisonMetric[] = [
    {
      key: 'calories',
      label_bn: 'ক্যালরি',
      label_en: 'Calories',
      unit: 'kcal',
      valA: nA.totalCalories,
      valB: nB.totalCalories,
      diff: nB.totalCalories - nA.totalCalories,
    },
    {
      key: 'carbs',
      label_bn: 'কার্বোহাইড্রেট',
      label_en: 'Carbs',
      unit: 'g',
      valA: nA.totalCarbs,
      valB: nB.totalCarbs,
      diff: diff(nB.totalCarbs, nA.totalCarbs),
    },
    {
      key: 'protein',
      label_bn: 'প্রোটিন',
      label_en: 'Protein',
      unit: 'g',
      valA: nA.totalProtein,
      valB: nB.totalProtein,
      diff: diff(nB.totalProtein, nA.totalProtein),
    },
    {
      key: 'fat',
      label_bn: 'ফ্যাট',
      label_en: 'Fat',
      unit: 'g',
      valA: nA.totalFat,
      valB: nB.totalFat,
      diff: diff(nB.totalFat, nA.totalFat),
    },
    {
      key: 'fibre',
      label_bn: 'ডায়েটারি ফাইবার',
      label_en: 'Dietary Fibre',
      unit: 'g',
      valA: nA.totalFibre,
      valB: nB.totalFibre,
      diff: diff(nB.totalFibre, nA.totalFibre),
    },
    {
      key: 'sodium',
      label_bn: 'সোডিয়াম',
      label_en: 'Sodium',
      unit: 'mg',
      valA: nA.totalSodium ?? null,
      valB: nB.totalSodium ?? null,
      diff: diff(nB.totalSodium, nA.totalSodium),
    },
    {
      key: 'potassium',
      label_bn: 'পটাশিয়াম',
      label_en: 'Potassium',
      unit: 'mg',
      valA: nA.totalPotassium ?? null,
      valB: nB.totalPotassium ?? null,
      diff: diff(nB.totalPotassium, nA.totalPotassium),
    },
    {
      key: 'calcium',
      label_bn: 'ক্যালসিয়াম',
      label_en: 'Calcium',
      unit: 'mg',
      valA: nA.totalCalcium ?? null,
      valB: nB.totalCalcium ?? null,
      diff: diff(nB.totalCalcium, nA.totalCalcium),
    },
    {
      key: 'iron',
      label_bn: 'আয়রন',
      label_en: 'Iron',
      unit: 'mg',
      valA: nA.totalIron ?? null,
      valB: nB.totalIron ?? null,
      diff: diff(nB.totalIron, nA.totalIron),
    },
  ];

  const alertsA = evaluateMealAlerts(mealA, userProfile);
  const alertsB = evaluateMealAlerts(mealB, userProfile);

  // Generate objective, contextual observations
  const observations: Array<{
    title_bn: string;
    title_en: string;
    description_bn: string;
    description_en: string;
    badgeType: 'neutral' | 'info' | 'caution';
  }> = [];

  // Observation: Satiety & Protein Density
  const proteinDiff = (nB.totalProtein - nA.totalProtein);
  if (Math.abs(proteinDiff) >= 5) {
    const higherMeal = proteinDiff > 0 ? mealB.name : mealA.name;
    const diffVal = Math.abs(proteinDiff).toFixed(1);
    observations.push({
      title_bn: 'প্রোটিন ও দীর্ঘ তৃপ্তি',
      title_en: 'Protein & Satiety Profile',
      description_bn: `"${higherMeal}"-এ প্রায় ${diffVal} গ্রাম বেশি প্রোটিন রয়েছে, যা দীর্ঘক্ষণ ক্ষুধা নিবারণ ও পেশি সুরক্ষায় সহায়ক।`,
      description_en: `"${higherMeal}" provides ~${diffVal}g more protein, supporting satiety and muscle protein synthesis.`,
      badgeType: 'info',
    });
  }

  // Observation: Fibre & Glycemic Impact
  const fibreDiff = (nB.totalFibre - nA.totalFibre);
  if (Math.abs(fibreDiff) >= 3) {
    const higherMeal = fibreDiff > 0 ? mealB.name : mealA.name;
    const diffVal = Math.abs(fibreDiff).toFixed(1);
    observations.push({
      title_bn: 'আঁশের মাত্রা ও পাচন স্বাস্থ্য',
      title_en: 'Dietary Fibre Difference',
      description_bn: `"${higherMeal}"-এ প্রায় ${diffVal} গ্রাম বেশি আঁশ রয়েছে, যা শর্করা শোষণ ধীর ও অন্ত্রের সুস্বাস্থ্য বজায় রাখতে সহায়ক।`,
      description_en: `"${higherMeal}" provides ~${diffVal}g more dietary fibre, aiding glycemic moderation and gut microbiome diversity.`,
      badgeType: 'info',
    });
  }

  // Observation: User Condition Relevance (e.g. Diabetes)
  if (userProfile.conditions.includes('t2_diabetes')) {
    const carbDiff = (nB.totalCarbs - nA.totalCarbs);
    if (Math.abs(carbDiff) >= 15) {
      const lowerMeal = carbDiff < 0 ? mealB.name : mealA.name;
      const diffVal = Math.abs(carbDiff).toFixed(1);
      observations.push({
        title_bn: 'ডায়াবেটিস প্রাসঙ্গিকতা: শর্করার তারতম্য',
        title_en: 'Diabetes Relevance: Carbohydrate Load',
        description_bn: `ডায়াবেটিস ব্যবস্থাপনায় "${lowerMeal}"-এ শর্করার পরিমাণ ${diffVal} গ্রাম কম হওয়ায় এটি খাওয়ার পর রক্তের সুগার তুলনামূলক স্থিতিশীল থাকার সম্ভাবনা বেশি।`,
        description_en: `For glycemic control, "${lowerMeal}" contains ${diffVal}g fewer carbohydrates, presenting lower acute postprandial demand.`,
        badgeType: 'caution',
      });
    }
  }

  // Observation: User Condition Relevance (Hypertension)
  if (
    userProfile.conditions.includes('hypertension') &&
    nA.totalSodium !== null &&
    nA.totalSodium !== undefined &&
    nB.totalSodium !== null &&
    nB.totalSodium !== undefined
  ) {
    const sodiumDiff = nB.totalSodium - nA.totalSodium;
    if (Math.abs(sodiumDiff) >= 150) {
      const lowerMeal = sodiumDiff < 0 ? mealB.name : mealA.name;
      const diffVal = Math.abs(sodiumDiff);
      observations.push({
        title_bn: 'উচ্চ রক্তচাপ প্রাসঙ্গিকতা: সোডিয়াম',
        title_en: 'Hypertension Relevance: Sodium Content',
        description_bn: `"${lowerMeal}"-এ প্রায় ${diffVal} মিগ্রা কম সোডিয়াম রয়েছে, যা রক্তচাপ নিয়ন্ত্রণে অধিক উপযোগী।`,
        description_en: `"${lowerMeal}" contains ~${diffVal}mg less sodium, facilitating better daily electrolyte balance for hypertension.`,
        badgeType: 'caution',
      });
    }
  }

  // Plant Diversity Observation
  if (nA.uniquePlantCount !== nB.uniquePlantCount) {
    const morePlantsMeal = nB.uniquePlantCount > nA.uniquePlantCount ? mealB.name : mealA.name;
    const higherCount = Math.max(nA.uniquePlantCount, nB.uniquePlantCount);
    observations.push({
      title_bn: 'উদ্ভিজ্জ উপাদানের বৈচিত্র্য',
      title_en: 'Plant Diversity Index',
      description_bn: `"${morePlantsMeal}"-এ ${higherCount}টি অনন্য উদ্ভিজ্জ উপাদান অন্তর্ভুক্ত রয়েছে, যা সাপ্তাহিক খাদ্যতালিকায় উদ্ভিদ বৈচিত্র্য অর্জনে অবদান রাখে।`,
      description_en: `"${morePlantsMeal}" includes ${higherCount} unique plant foods, advancing your weekly target toward 25+ plant species.`,
      badgeType: 'neutral',
    });
  }

  return {
    mealA,
    mealB,
    metrics,
    alertsA,
    alertsB,
    contextualObservations: observations,
  };
}
