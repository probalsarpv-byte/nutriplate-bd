import { FoodItem } from '../../types/food';
import { HealthConditionId, UserHealthProfile } from '../../types/user';
import { ClinicalFoodAlert, AlertSeverity, EvidenceGrade } from '../../types/alerts';

export function evaluateFoodAlerts(
  food: FoodItem,
  grams: number,
  userProfile: UserHealthProfile,
  dailyAccumulatedSodiumMg: number = 0
): ClinicalFoodAlert[] {
  const alerts: ClinicalFoodAlert[] = [];
  const { conditions, allergens } = userProfile;

  // 1. Critical Food Allergens Check
  if (allergens && allergens.length > 0) {
    const foodNameLower = (food.english + ' ' + (food.bengali_roman || '')).toLowerCase();
    for (const allergen of allergens) {
      if (foodNameLower.includes(allergen.toLowerCase())) {
        alerts.push({
          id: `allergen_${food.code}_${allergen}`,
          conditionId: 'food_allergies',
          conditionName_bn: 'খাদ্য অ্যালার্জি',
          conditionName_en: 'Food Allergy',
          severity: 'critical',
          title_bn: `সরাসরি অ্যালার্জেন ঝুঁকি: ${allergen}`,
          title_en: `Direct Allergen Risk: ${allergen}`,
          triggeringNutrientOrFood: allergen,
          explanation_bn: `আপনার চিহ্নিত অ্যালার্জেন (${allergen}) এই খাবারে বিদ্যমান রয়েছে। তীব্র অ্যালার্জিক রিঅ্যাকশনের ঝুঁকি রয়েছে।`,
          explanation_en: `Identified allergen (${allergen}) is present in this food. Exposure poses acute hypersensitivity risk.`,
          guidance_bn: 'এই খাদ্যটি পরিহার করুন এবং নিরাপদ বিকল্প বেছে নিন।',
          guidance_en: 'Strictly avoid this item and choose a validated safe alternative.',
          evidenceGrade: 'A_Grade_Clinical_Trial',
          sourceReference: 'WAO (World Allergy Organization) Guidelines on Food Allergy Assessment',
          ruleVersion: 'v1.0.0',
        });
      }
    }
  }

  // 2. Type 2 Diabetes / Insulin Resistance
  if (conditions.includes('t2_diabetes') || conditions.includes('insulin_resistance')) {
    const carbContribution = (food.carb_g * grams) / 100;
    if (carbContribution > 45) {
      alerts.push({
        id: `diabetes_high_carb_${food.code}`,
        conditionId: 't2_diabetes',
        conditionName_bn: 'টাইপ-২ ডায়াবেটিস',
        conditionName_en: 'Type 2 Diabetes',
        severity: 'moderate',
        title_bn: 'উচ্চ কার্বোহাইড্রেট ঘনত্ব ও রক্তের শর্করা',
        title_en: 'High Carbohydrate Load & Glycemic Impact',
        triggeringNutrientOrFood: `কার্বোহাইড্রেট (${carbContribution.toFixed(1)}g)`,
        explanation_bn: `এই পরিবেশনে কার্বোহাইড্রেটের পরিমাণ (${carbContribution.toFixed(1)} গ্রাম) উল্লেখযোগ্য। একবারে অধিক কার্ব খাবার পর রক্তে গ্লুকোজের আকস্মিক বৃদ্ধি (postprandial spike) ঘটাতে পারে।`,
        explanation_en: `This serving provides ${carbContribution.toFixed(1)}g of carbohydrates, which may contribute to acute postprandial glucose excursions.`,
        portionContext_bn: `বর্তমান পরিমাণ: ${grams} গ্রাম। শাকসবজি ও পর্যাপ্ত প্রোটিনের (যেমন: ডাল, মাছ) সাথে খেলে গ্লুকোজ শোষণ ধীরগতির হয়।`,
        portionContext_en: `Current portion: ${grams}g. Combining with non-starchy vegetables and protein slows carbohydrate absorption.`,
        guidance_bn: 'খাবারটি নিষিদ্ধ নয়; তবে পরিবেশন পরিমাণ নিয়ন্ত্রণ করুন এবং থালায় পর্যাপ্ত আঁশ ও প্রোটিনের অনুপাত বজায় রাখুন।',
        guidance_en: 'Food is not contraindicated; moderate portion size and pair with dietary fibre and protein.',
        evidenceGrade: 'B_Grade_Cohort_Study',
        sourceReference: 'American Diabetes Association (ADA) Standards of Care in Diabetes (2024)',
        ruleVersion: 'v1.0.0',
      });
    }
  }

  // 3. Hypertension (High Sodium)
  if (conditions.includes('hypertension')) {
    const sodiumMg = food.sodium_mg !== null && food.sodium_mg !== undefined ? (food.sodium_mg * grams) / 100 : null;
    if (sodiumMg !== null && sodiumMg > 400) {
      alerts.push({
        id: `hypertension_sodium_${food.code}`,
        conditionId: 'hypertension',
        conditionName_bn: 'উচ্চ রক্তচাপ',
        conditionName_en: 'Hypertension',
        severity: 'moderate',
        title_bn: 'উচ্চ সোডিয়াম উপস্থিতি',
        title_en: 'Elevated Sodium Content',
        triggeringNutrientOrFood: `সোডিয়াম (${sodiumMg.toFixed(0)}mg)`,
        explanation_bn: `এই একক পরিবেশনে প্রায় ${sodiumMg.toFixed(0)} মিলিগ্রাম সোডিয়াম রয়েছে, যা দৈনিক সহনশীল মাত্রার (২০০০ মিগ্রা) ২০% এর বেশি।`,
        explanation_en: `This single portion provides ${sodiumMg.toFixed(0)}mg of sodium (>20% of the recommended 2000mg daily ceiling).`,
        portionContext_bn: `দিনের অবশিষ্ট খাবারে অতিরিক্ত লবণ ও নোনতা স্ন্যাকস পরিহারের পরামর্শ দেওয়া হচ্ছে।`,
        portionContext_en: `Recommended to limit added salt and processed snacks for the remainder of the day.`,
        guidance_bn: 'পটাশিয়াম সমৃদ্ধ প্রাকৃতিক শাকসবজি ও পর্যাপ্ত পানি গ্রহণের মাধ্যমে ইলেক্ট্রোলাইট ভারসাম্য বজায় রাখুন।',
        guidance_en: 'Balance with dietary potassium from fresh greens and maintain adequate hydration.',
        evidenceGrade: 'A_Grade_Clinical_Trial',
        sourceReference: 'ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure',
        ruleVersion: 'v1.0.0',
      });
    }
  }

  // 4. Chronic Kidney Disease (CKD)
  if (conditions.includes('ckd')) {
    const potassiumMg = food.potassium_mg !== null && food.potassium_mg !== undefined ? (food.potassium_mg * grams) / 100 : null;
    if (potassiumMg !== null && potassiumMg > 350) {
      alerts.push({
        id: `ckd_potassium_${food.code}`,
        conditionId: 'ckd',
        conditionName_bn: 'ক্রনিক কিডনি ডিজিজ (CKD)',
        conditionName_en: 'Chronic Kidney Disease',
        severity: 'moderate',
        title_bn: 'পটাশিয়ামের মাত্রা ও কিডনি পর্যবেক্ষণ',
        title_en: 'High Potassium Content Context',
        triggeringNutrientOrFood: `পটাশিয়াম (${potassiumMg.toFixed(0)}mg)`,
        explanation_bn: `এই খাবারে উচ্চ পটাশিয়াম রয়েছে (${potassiumMg.toFixed(0)} মিগ্রা)। সিকেডি রোগীদের ক্ষেত্রে রক্তে পটাশিয়ামের মাত্রা (serum potassium) এবং সিকেডি স্টেজের ওপর ভিত্তি করে সীমাবদ্ধতা প্রযোজ্য।`,
        explanation_en: `Contains ${potassiumMg.toFixed(0)}mg potassium. Potassium restriction depends on individual serum electrolyte levels and CKD staging.`,
        guidance_bn: 'ল্যাব রিপোর্ট ও আপনার নেফ্রোলজিস্ট/ক্লিনিক্যাল ডায়েটিশিয়ানের নির্দেশিত দৈনিক পটাশিয়াম সীমা অনুসরণ করুন।',
        guidance_en: 'Refer to your recent serum lab results and individualized nephrology guidance before strict elimination.',
        evidenceGrade: 'C_Grade_Consensus_Guidelines',
        sourceReference: 'KDIGO 2024 Clinical Practice Guideline for the Management of Chronic Kidney Disease',
        ruleVersion: 'v1.0.0',
        missingDataDisclosure: 'ব্যক্তিগত রক্তের সিরাম পটাশিয়াম ডাটা ব্যতীত একক খাবার নিষিদ্ধ করা অনুচিত।',
      });
    }
  }

  // 5. Calcium-Oxalate Kidney Stones
  if (conditions.includes('kidney_stones')) {
    const nameLower = food.english.toLowerCase();
    if (nameLower.includes('spinach') || nameLower.includes('palong shak') || nameLower.includes('beetroot')) {
      alerts.push({
        id: `stones_oxalate_${food.code}`,
        conditionId: 'kidney_stones',
        conditionName_bn: 'ক্যালসিয়াম-অক্সালেট কিডনি পাথর',
        conditionName_en: 'Calcium Oxalate Nephrolithiasis',
        severity: 'moderate',
        title_bn: 'উচ্চ অক্সালেট উপাদান ও পেয়ারিং পরামর্শ',
        title_en: 'High Oxalate Food — Pairing Guidance',
        triggeringNutrientOrFood: 'ডায়েটারি অক্সালেট',
        explanation_bn: 'পালং শাক ও বিটরুটে উচ্চ মাত্রার অক্সালেট থাকে, যা সংবেদনশীল ব্যক্তিদের ক্ষেত্রে ক্যালসিয়াম-অক্সালেট ক্রিস্টাল তৈরির ঝুঁকি বৃদ্ধি করতে পারে।',
        explanation_en: 'Contains high soluble oxalates, which can increase urinary oxalate excretion in stone formers.',
        guidance_bn: 'খাবারটি খাবার সময় খাদ্যতালিকাগত ক্যালসিয়ামের উৎস (যেমন: টক দই বা পনির) সাথে খেলে পরিপাকতন্ত্রে অক্সালেট যুক্ত হয়ে শোষিত না হয়ে মলের সাথে বেরিয়ে যায়। প্রচুর পানি পান করুন।',
        guidance_en: 'Pair with a dietary calcium source (e.g. curd/yogurt) to bind oxalates in the intestine, and ensure copious hydration.',
        evidenceGrade: 'B_Grade_Cohort_Study',
        sourceReference: 'Oxalate Content of Food: A Tangled Web (Journal of Urology 2014)',
        ruleVersion: 'v1.0.0',
      });
    }
  }

  // 6. Gout / Hyperuricemia
  if (conditions.includes('gout')) {
    const nameLower = food.english.toLowerCase();
    if (nameLower.includes('liver') || nameLower.includes('kidney') || nameLower.includes('organ') || nameLower.includes('shutki')) {
      alerts.push({
        id: `gout_purine_${food.code}`,
        conditionId: 'gout',
        conditionName_bn: 'গাউট / হাইপারইউরিসেমিয়া',
        conditionName_en: 'Gout / Hyperuricemia',
        severity: 'moderate',
        title_bn: 'উচ্চ পিউরিন যুক্ত খাবার',
        title_en: 'High Purine Food Density',
        triggeringNutrientOrFood: 'পিউরিন',
        explanation_bn: 'কলিজা ও শুঁটকি জাতীয় খাবারে উচ্চমাত্রায় পিউরিন থাকে, যা বিপাকের পর রক্তে ইউরিক অ্যাসিড বৃদ্ধি করে গেঁটেবাতের ব্যথা সৃষ্টি করতে পারে।',
        explanation_en: 'Organ meats and concentrated dried fish are high in purines, accelerating uric acid synthesis.',
        guidance_bn: 'পরিবেশন সীমিত রাখুন এবং ইউরিক অ্যাসিড বৃদ্ধির সময়ে বিকল্প প্রোটিন উৎস (যেমন: ডিম, ডাল বা সাধারণ মাছ) প্রাধান্য দিন।',
        guidance_en: 'Limit serving sizes during symptomatic periods and choose lower purine protein sources.',
        evidenceGrade: 'B_Grade_Cohort_Study',
        sourceReference: 'ACR Guideline for the Management of Gout (2020)',
        ruleVersion: 'v1.0.0',
      });
    }
  }

  // 7. Celiac Disease
  if (conditions.includes('celiac')) {
    const nameLower = food.english.toLowerCase();
    if (nameLower.includes('wheat') || nameLower.includes('barley') || nameLower.includes('semolina') || nameLower.includes('ruti') || nameLower.includes('flour')) {
      alerts.push({
        id: `celiac_gluten_${food.code}`,
        conditionId: 'celiac',
        conditionName_bn: 'সিলিয়াক ডিজিজ',
        conditionName_en: 'Celiac Disease',
        severity: 'critical',
        title_bn: 'গ্লুটেন উপস্থিতি — সিলিয়াক ঝুঁকি',
        title_en: 'Gluten Present — Strict Celiac Contraindication',
        triggeringNutrientOrFood: 'গ্লুটেন (Gluten)',
        explanation_bn: 'গম, যব ও সুজিজাত খাবারে গ্লুটেন প্রোটিন থাকে, যা সিলিয়াক রোগীদের ক্ষুদ্রান্ত্রের মিউকোসা ধ্বংস করে পুষ্টি শোষণে তীব্র ব্যাঘাত ঘটায়।',
        explanation_en: 'Contains gluten proteins, which trigger autoimmune mucosal atrophy in individuals with celiac disease.',
        guidance_bn: 'সিলিয়াক নিশ্চিত রোগীদের জন্য গ্লুটেন সম্পূর্ণ বর্জনীয়। চাল, ভুট্টা বা লাল চালের বিকল্প নির্বাচন করুন।',
        guidance_en: 'Strict lifelong gluten-free diet required. Choose rice or corn-based alternatives.',
        evidenceGrade: 'A_Grade_Clinical_Trial',
        sourceReference: 'World Gastroenterology Organisation (WGO) Celiac Disease Guidelines',
        ruleVersion: 'v1.0.0',
      });
    }
  }

  // 8. Lactose Intolerance
  if (conditions.includes('lactose_intolerance')) {
    const categoryLower = food.category.toLowerCase();
    const nameLower = food.english.toLowerCase();
    if ((categoryLower.includes('milk') || nameLower.includes('milk')) && !nameLower.includes('soya') && !nameLower.includes('almond') && !nameLower.includes('curd') && !nameLower.includes('doi')) {
      alerts.push({
        id: `lactose_${food.code}`,
        conditionId: 'lactose_intolerance',
        conditionName_bn: 'ল্যাকটোজ অসহিষ্ণুতা',
        conditionName_en: 'Lactose Intolerance',
        severity: 'moderate',
        title_bn: 'ল্যাকটোজযুক্ত দুগ্ধজাত খাবার',
        title_en: 'Lactose Content Present',
        triggeringNutrientOrFood: 'ল্যাকটোজ',
        explanation_bn: 'গরু বা ছাগলের খাঁটি তরল দুধে ল্যাকটোজ সুগার থাকে, যা ল্যাকটেজ এনজাইমের স্বল্পতায় পেট ফাঁপা, গ্যাস ও ডায়রিয়া সৃষ্টি করতে পারে।',
        explanation_en: 'Whole mammalian milk contains lactose, which may provoke bloating, cramps, or osmotic diarrhea.',
        guidance_bn: 'ফার্মেন্টেড দুগ্ধজাত খাবার (যেমন: মিষ্টিহীন টক দই) সাধারণত ল্যাকটোজ-সংবেদনশীল ব্যক্তিরাও সহজে হজম করতে পারেন।',
        guidance_en: 'Fermented alternatives like unsweetened curd/yogurt have significantly lower lactose and are better tolerated.',
        evidenceGrade: 'B_Grade_Cohort_Study',
        sourceReference: 'NIH Consensus Development Conference on Lactose Intolerance and Health',
        ruleVersion: 'v1.0.0',
      });
    }
  }

  return alerts;
}
