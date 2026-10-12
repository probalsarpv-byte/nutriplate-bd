# NutriPlate BD — Functional Nutrition Tracker & Recipe Maker

**NutriPlate BD** is a premium, mobile-first Functional Nutrition Tracker and Recipe Maker designed for Bangladesh, built with **React Native**, **Expo SDK 52**, and **TypeScript**.

> **Product Philosophy:** *“Track What You Eat. Understand How It Fits Your Health.”*  
> **Absolute Restriction:** This application is strictly an analytical tracker and recipe calculator. It **never** acts as a prescriptive diet chart generator or automatic meal planner.

---

## Key Features

1. **Analytical Food Composition Engine:**
   - 381 national Bangladeshi foods from the *Food Composition Table for Bangladesh (2013)*, INFS/CARS, University of Dhaka.
   - 88 curated international foods from USDA FoodData Central.
   - Preserves laboratory nulls for unanalyzed micronutrients (never converts missing data to 0).
   - Real-time bilingual search (Bengali script, English, and Roman transliterations like *bhat, ruti, moshur dal*).
   - Authentic household portion conversions (cups, bowls, plates, tablespoons, pieces, grams).

2. **Metabolic & Macronutrient Engine:**
   - Validated BMR formulas: **Mifflin-St Jeor** & **Katch-McArdle** (when body fat % is available).
   - Activity-responsive TDEE multipliers with conservative 15–20% deficits and clinical safety floors.
   - Macro presets (Moderate, High Activity, Optional Low-Carb) and custom gram overrides.

3. **Pathology-Aware Clinical Safety Engine:**
   - Deterministic, evidence-graded rules for **Type 2 Diabetes, Hypertension, CKD, Calcium-Oxalate Stones, Gout, Celiac, Lactose Intolerance, and Food Allergies**.
   - Portion-aware contextual guidance without blanket bans on staple foods.

4. **Recipe Lab, Family Pot & Smart Plate:**
   - Calculate cooking retention, raw vs. cooked yields, and per-serving nutrients.
   - **Family Pot:** Allocate exact meal weights in grams for household members without blind equal divisions.
   - **Smart Plate:** Visual plate distribution (1/2 vegetables, 1/4 protein, 1/4 carbohydrates).

5. **Plant Diversity & Rainbow Index:**
   - Track weekly unique plant intake toward the 25-plant diversity milestone.

6. **Premium Mobile Design System:**
   - Bento-style dashboards, soft-neumorphic elevated surfaces, coordinated brand colors.
   - Custom Hind Siliguri Bengali typography with calibrated line heights to prevent conjunct clipping.
   - Reactive light and dark themes.

---

## Development & Testing Commands

```bash
# Start the Expo development server
npm start

# Run on Android emulator or connected device
npm run android

# Execute full automated Jest test suite (21 tests across 4 suites)
npm test -- --runInBand

# Run strict TypeScript typechecking
npm run typecheck

# Build installable Android APK with EAS
eas build --platform android --profile preview
```

---

## Project Structure

```
functional-nutrition-tracker/
├── app/                  # Expo Router v4 navigation & screen routes
│   ├── (tabs)/           # 5 Bottom Tabs (Home, Tracker, Recipes, Insights, Profile)
│   ├── food/search.tsx   # Bilingual food search & logging
│   ├── recipe/new.tsx    # Recipe builder & yield calculator
│   ├── family-pot/       # Family Pot unequal portion calculator
│   └── smart-plate/      # Visual Smart Plate builder
├── src/
│   ├── components/       # Reusable UI, food, and clinical alert components
│   ├── design-system/    # Colors, spacing, and typography tokens
│   ├── database/         # FoodDatabaseAdapter & analytical datasets
│   ├── engines/          # BMR, TDEE, macros, pathology alerts, and recipe engines
│   ├── stores/           # Zustand state management (theme, user, diary)
│   └── localization/     # Bengali & English dictionaries and formatters
├── tests/                # Automated Jest test suites
├── docs/                 # Audit, architecture, clinical rules, and progress docs
└── eas.json              # EAS Build configuration for Android APK
```
