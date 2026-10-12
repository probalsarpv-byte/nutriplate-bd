# NutriPlate BD — Architecture Documentation

## 1. System Overview

NutriPlate BD is an offline-first, mobile-first Functional Nutrition Tracker and Recipe Maker built with:
- **Framework:** React Native + Expo SDK 52 + TypeScript (strict mode)
- **Navigation:** Expo Router v4 (5 primary tabs + nested modal flows)
- **State Management:** Zustand (reactive stores for theme, user biometrics, food diary, recipes)
- **Local Persistence & Data Layer:** Expo SQLite / SecureStore + FoodDatabaseAdapter
- **Styling:** Custom Design System Tokens (Light & Dark theme palettes, Hind Siliguri typography, 8-pt geometry)
- **Build Engine:** EAS Build (configured in `eas.json` for Android APK development and preview)

---

## 2. Directory Hierarchy

```
functional-nutrition-tracker/
├── app/
│   ├── _layout.tsx              # Root Layout, font preloading, safe area provider
│   ├── (tabs)/
│   │   ├── _layout.tsx          # 5-Tab bar (Home, Tracker, Recipes, Insights, Profile)
│   │   ├── index.tsx            # Home Dashboard (Bento, Energy Ring, Macros, Plants)
│   │   ├── tracker.tsx          # Food Tracker (Breakfast, Lunch, Dinner, Snack entries)
│   │   ├── recipes.tsx          # Recipe Lab Hub (Saved recipes, entry points)
│   │   ├── insights.tsx         # Nutrition Insights (Macro distribution, fiber, clinical alerts)
│   │   └── profile.tsx          # Profile & Biometrics (BMR/TDEE live readout, conditions, theme)
│   ├── food/
│   │   └── search.tsx           # Bilingual Search, category filters, FoodQuantitySheet
│   ├── recipe/
│   │   └── new.tsx              # Interactive Recipe Builder & per-serving calculations
│   ├── family-pot/
│   │   └── index.tsx            # Family Pot Unequal Portion Allocation Calculator
│   └── smart-plate/
│       └── index.tsx            # Visual Smart Plate Builder (1/2 greens, 1/4 protein, 1/4 carbs)
│
├── src/
│   ├── components/
│   │   ├── ui/                  # PremiumScreen, PremiumHeader, BentoCard, NutritionRing, NutrientProgressBar, PrimaryButton, SectionHeader
│   │   ├── food/                # FoodCard, FoodQuantitySheet
│   │   └── alerts/              # AlertCard
│   ├── design-system/
│   │   └── tokens/              # colors.ts, spacing.ts, typography.ts
│   ├── engines/
│   │   ├── energy/              # bmr.ts (Mifflin-St Jeor & Katch-McArdle), tdee.ts
│   │   ├── macros/              # macroCalculator.ts (Presets, 4/4/9 conversions, percentages)
│   │   ├── pathology/           # alertEngine.ts (Deterministic evidence-graded clinical rules)
│   │   └── recipes/             # recipeEngine.ts (Aggregation, yield, Family Pot allocations)
│   ├── database/
│   │   ├── adapters/            # FoodDatabaseAdapter.ts
│   │   └── data/                # bangladesh-foods.json (381 foods), global-foods.json (88 foods), categories.json, nutrients.json
│   ├── stores/                  # themeStore.ts, userStore.ts, diaryStore.ts
│   ├── types/                   # food.ts, user.ts, diary.ts, recipe.ts, alerts.ts
│   └── localization/            # translations.ts, formatters.ts
│
├── tests/                       # Automated Jest test suites (engines, foodAdapter, alertEngine, recipeEngine)
├── docs/                        # database-audit.md, architecture.md, clinical-rules.md, design-system.md, implementation-progress.md
├── app.json                     # Android bundle package com.nutriplate.bd
├── eas.json                     # Preview profile configured for installable Android APK
└── tsconfig.json                # Strict TypeScript configuration
```

---

## 3. Data Flow & Separation of Concerns

1. **Analytical Data Separation:** Raw food composition tables from the University of Dhaka INFS/CARS (2013) table and USDA FoodData Central are normalized in `src/database/adapters/FoodDatabaseAdapter.ts`. UI components never access raw JSON fields directly.
2. **Missing Nutrient Values:** Missing micronutrients are preserved as `null` rather than converted to `0`.
3. **Decoupled Engines:** BMR, TDEE, macro conversions, clinical alerts, and recipe yield adjustments reside in pure TypeScript modules in `src/engines/`, backed by unit tests.
4. **Theme & Localization:** Theme tokens and bilingual translations (Bengali and English) are decoupled from screens and reactive via Zustand stores.
