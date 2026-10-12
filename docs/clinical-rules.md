# NutriPlate BD — Clinical Safety Rules Architecture

## 1. Absolute Product Restrictions
**NutriPlate BD is NOT a diet chart generator.**
The application under no circumstances implements:
- Prescriptive meal scheduling
- 7-day automatic diet charts
- Weight gain planners
- Automated clinical prescriptions
- Unverified disease-curing claims

The engine acts strictly as an analytical mirror and clinical cross-check for meals already eaten or recipes the user intentionally prepares.

---

## 2. Evidence Grading Framework

Every clinical alert is assigned an explicit grade:
1. **Grade A (Clinical Trials / High Consensus):** Directly validated in randomized trials or consensus statements from major bodies (WHO, ADA, ACC/AHA, WAO).
2. **Grade B (Prospective Cohort Studies):** Strong epidemiological evidence (e.g., purines in hyperuricemia, oxalates in nephrolithiasis).
3. **Grade C (Consensus Guidelines):** Nephrology staging guidelines (KDIGO 2024), expert panels.
4. **Emerging / Educational:** Unverified or variable analytical data with explicit disclosure.

---

## 3. Implemented Clinical Condition Rules

### 1. Type 2 Diabetes & Insulin Resistance
- **Nutrient Trigger:** Carbohydrate density (> 45g per serving) and glycemic impact.
- **Portion Guidance:** Rice and starchy staples are NOT prohibited. The alert educates the user on portion moderation and pairing with dietary fibre (greens) and protein (fish/dal) to flatten postprandial glucose excursions.
- **Reference:** ADA Standards of Care in Diabetes (2024).

### 2. Hypertension
- **Nutrient Trigger:** Sodium (> 400 mg per serving).
- **Guidance:** Recommends moderating processed salt additions and balancing with dietary potassium from fresh vegetables.
- **Reference:** ACC/AHA Guideline for Prevention and Management of High Blood Pressure.

### 3. Chronic Kidney Disease (CKD)
- **Nutrient Trigger:** Potassium (> 350 mg per serving).
- **Guidance:** Emphasizes that potassium restrictions depend strictly on individual serum laboratory tests and CKD stage; does not universally eliminate nutritious vegetables without clinical laboratory context.
- **Reference:** KDIGO 2024 Clinical Practice Guideline for CKD.

### 4. Calcium-Oxalate Kidney Stones
- **Nutrient Trigger:** High-oxalate foods (spinach/palong shak, beetroot).
- **Guidance:** Recommends co-ingesting a dietary calcium source (e.g., curd/yogurt) so oxalates bind in the gut rather than concentrating in urine.
- **Reference:** Journal of Urology (2014) Oxalate Content of Food.

### 5. Gout / Hyperuricemia
- **Nutrient Trigger:** High-purine foods (organ meats, concentrated dried fish/shutki).
- **Guidance:** Recommends portion moderation during flare-ups and choosing lower-purine protein alternatives (eggs, lentils, fresh freshwater fish).
- **Reference:** ACR Guideline for Management of Gout (2020).

### 6. Celiac Disease
- **Nutrient Trigger:** Gluten-containing grains (wheat, barley, semolina).
- **Severity:** Critical. Lifelong exclusion required. Recommends safe local staples (rice, puffed rice, flattened rice).
- **Reference:** World Gastroenterology Organisation (WGO).

### 7. Lactose Intolerance
- **Nutrient Trigger:** Unfermented mammalian milk.
- **Guidance:** Explains lactase deficiency mechanics; suggests fermented options like plain tok doi (curd) which have substantially lower lactose.

### 8. Food Allergies
- **Severity:** Critical.
- **Matches:** Exact allergens against ingredient taxonomy. Exposure risk flags immediate avoidance.
- **Reference:** World Allergy Organization (WAO).
