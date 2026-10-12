# NutriPlate BD — Design System & Visual Tokens

## 1. Brand Color System

### Light Theme
- **Primary Olive:** `#647D44` (Primary actions, brand identity)
- **Deep Forest:** `#173C34` (Headers, brand contrast, active accents)
- **Emerald Accent:** `#16A085` (Success, plant highlights, links)
- **Background Cream:** `#F7F6F0` (Earthy, serene canvas)
- **Warm Beige:** `#EAE6D9` (Secondary surfaces, dividers)
- **Main Text:** `#172A26` (High readability, deep slate forest)
- **Secondary Text:** `#68766F` (Subtitles, metadata)
- **Soft Surface:** `#FFFFFF` (Card background, inputs)

### Macronutrient Color Palette
- **Carbohydrates:** `#E9A44C` (Warm Amber)
- **Protein:** `#4F9F91` (Teal Green)
- **Fats:** `#9878BF` (Soft Lavender/Purple)
- **Dietary Fibre:** `#2E856E` (Deep Emerald Leaf)
- **Energy (kcal):** `#E27D60` (Coral Amber)

### Clinical Severity Alert Colors
- **Critical Alert:** `#CF4B4B` (Background: `#FDF1F1`, Border: `#F7CECE`)
- **Caution / Moderate:** `#E2A238` (Background: `#FEF9EC`, Border: `#F9E5BA`)
- **Information / Neutral:** `#4389C9` (Background: `#F0F6FC`, Border: `#C8DEF4`)

---

## 2. Typography & Bengali Optimization

- **Bengali Primary Font:** Hind Siliguri (weights: Regular 400, Medium 500, SemiBold 600, Bold 700).
- **Line Height:** Specially calibrated to +4px over English line heights to prevent Bengali vowel signs (যেমন: হ্রস্ব-ই কার, দীর্ঘ-উ কার, র-ফলা) from clipping.
- **Numerals:** Full bilingual support for Bengali numerals (`০-৯`) and English digits (`0-9`).

---

## 3. Geometry & Spacing Grid

- **Base Grid:** 8-point system (`xxs`: 2, `xs`: 4, `sm`: 8, `md`: 12, `lg`: 16, `xl`: 20, `xxl`: 24, `hero`: 40).
- **Card Radii:** 20px (Card default), 24px (Large modals & bottom sheets).
- **Input Radii:** 14px (Comfortable touch target).
- **Shadows:** Controlled soft-neumorphic elevation with deep forest tint (`#173C34`, opacity 0.05 to 0.08).
