# Bangladesh Food Composition Database Audit

**Project:** NutriPlate BD (Functional Nutrition Tracker & Recipe Maker)  
**Audit Date:** October 2026  
**Primary Source Repository:** [bangladesh-food-composition-blogger](https://github.com/probalsarpv-byte/bangladesh-food-composition-blogger)  
**Primary Scientific Reference:** *Food Composition Table for Bangladesh (2013)*, Institute of Nutrition and Food Science (INFS) / Centre for Advanced Research in Sciences (CARS), University of Dhaka.  
**Secondary Reference:** USDA FoodData Central (curated layer for international foods commonly consumed in Bangladesh).

---

## 1. Executive Summary

A comprehensive forensic audit of the repository was completed prior to writing calculation code. The dataset contains **381 verified Bangladeshi food items** and **88 curated global food items**. 

### Critical Data Architecture Insights
1. **Basis:** All Bangladesh food values represent nutrient contents per **100 g edible portion** (edible portion coefficient provided in `edible_portion` from 0.0 to 1.0).
2. **Missing Nutrient Values Policy:** In accordance with clinical safety principles, **missing nutrients are stored as `null`, never converted to zero (`0`)**. A food with unanalyzed Vitamin D or Folate must explicitly indicate "Data unavailable" rather than implying zero content.
3. **Food Photography:** The repository contains zero physical photographic assets. As per product guidelines, the app uses **high-craft procedural graphic badges and category iconography**; we do not invent food photos or use misleading stock imagery.
4. **Bilingual Search:** The dataset provides Bengali script (`name_bn`, `bengali`), English name (`name_en`, `english`), and phonetic Romanized Bengali transliteration (`bengali_roman`, e.g. "Jaab, gota", "Bhat", "Moshur dal").

---

## 2. Directory Structure & Files Audited

| File / Entity | Records | Purpose in NutriPlate BD |
| :--- | :--- | :--- |
| `bangladesh-food-composition-blogger.js` | 381 foods | Main analytical dataset with 32 macro & micronutrient fields per 100g. |
| `food-search-index.json` | 381 items | Fast trie/prefix index mapping Bengali, English, Roman transliteration, and category. |
| `data/shuddho-global-foods-v1.json` | 88 items | USDA FDC curated layer for oats, chia, quinoa, almonds, olive oil, etc. |
| `CATEGORY_DEFS` | 17 categories | Standard food taxonomy matching national dietary patterns. |
| `HEALTH_LENSES` | 7 clinical tags | Scientific screening markers (Diabetes, Hypertension, CKD, Iron, etc.). |
| Evidence Layers | External URLs | University of Sydney GI, Monash FODMAP, USDA Purine (2025), Urology Oxalate (2014). |

---

## 3. Bangladesh Food Taxonomy & Distribution (381 Foods)

The 381 national items cover 15 distinct categories:
- **Fish, shellfish and their products:** 72 items (Highest representation; critical for protein, omega-3, calcium, iodine)
- **Vegetables and their products:** 48 items
- **Cereals and their products:** 43 items (Raw rice, parboiled, boiled varieties, ruti, semolina, flattened rice)
- **Fruits:** 43 items (Local seasonal fruits like amra, bael, jam, guava, jackfruit, mango)
- **Leafy vegetables (Shak):** 36 items (Palong shak, Lal shak, Dheki shak, Pui shak, Kochu shak)
- **Starchy roots, tubers and products:** 21 items (Alu, misti alu, ol kochu, mukhi)
- **Spices, condiments and herbs:** 20 items (Haldi, ada, roshun, morich, jeera)
- **Pulses, legumes and products (Dal):** 16 items (Moshur, moong, chhola, khesari, mashkalai)
- **Nuts, seeds and products:** 16 items (Chinabadam, tishi, tila, kaju)
- **Meat, poultry and products:** 16 items (Deshi chicken, broiler, beef, mutton, duck)
- **Milk and its products:** 13 items (Cow milk, goat milk, chhana, doi, ghee)
- **Fat and oils:** 12 items (Mustard oil, soybean oil, rice bran oil, butter)
- **Beverages:** 10 items (Cha, daab er pani, sugarcane juice)
- **Miscellaneous:** 8 items (Gur, chini, lobon)
- **Eggs and products:** 7 items (Hen egg, duck egg, quail egg)

---

## 4. Analytical Nutrient Fields (41 Fields)

| Category | Available Fields | Unit | Precision Note |
| :--- | :--- | :--- | :--- |
| **Identifiers** | `code`, `bengali`, `english`, `scientific`, `bengali_roman` | String | Preserved original INFS code (e.g. `01_0001`). |
| **Energy & Water** | `energy_kcal`, `energy_kj`, `water_g`, `ash_g`, `edible_portion` | kcal, kJ, g | Water content essential for raw-to-cooked yield calculations. |
| **Macronutrients** | `protein_g`, `fat_g`, `carb_g`, `fibre_g` | g | Validated per 100g edible portion. |
| **Minerals** | `calcium_mg`, `iron_mg`, `magnesium_mg`, `phosphorus_mg`, `potassium_mg`, `sodium_mg`, `zinc_mg`, `copper_mg` | mg | Directly available for mineral adequacy and clinical warnings. |
| **Vitamins** | `vitamin_a_mcg`, `retinol_mcg`, `beta_carotene_mcg`, `thiamin_mg`, `riboflavin_mg`, `niacin_mg`, `vitamin_b6_mg`, `folate_mcg`, `vitamin_c_mg`, `vitamin_d_mcg`, `vitamin_e_mg` | mcg / mg | High coverage in leafy greens, fish, dairy; unanalyzed values kept null. |

---

## 5. Raw vs. Cooked Distinctions & Conversion Handling

The dataset includes distinct laboratory entries for both raw and cooked preparations:
- e.g., `01_0037`: Rice BR-28 boiled without salt (`water_g`: 70.3, `energy_kcal`: 129, `carb_g`: 28.5)
- e.g., `01_0012`: Rice BR-28 parboiled milled raw (`water_g`: 12.8, `energy_kcal`: 349, `carb_g`: 77.2)

**Recipe Engine Principle:** 
The Recipe Lab and Family Pot will respect raw input measurements and apply weight-retention and water-absorption adjustments using the food's specific water content, rather than applying a universal cooking constant.

---

## 6. Adapter Architecture Plan

A dedicated `FoodDatabaseAdapter` is created in `src/database/adapters/FoodDatabaseAdapter.ts` to ensure UI components never depend on source column naming. It exposes:
- `search(query, language, categoryId)`
- `getByCode(code)`
- `calculateNutrients(code, grams)`
- `getClinicalMetadata(code)`

This maintains clean decoupling and zero data fabrication.
