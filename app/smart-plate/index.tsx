import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Leaf, Fish, Wheat, Utensils } from 'lucide-react-native';
import { PremiumScreen } from '../../src/components/ui/PremiumScreen';
import { PremiumHeader } from '../../src/components/ui/PremiumHeader';
import { BentoCard } from '../../src/components/ui/BentoCard';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { useThemeStore } from '../../src/stores/themeStore';
import { useDiaryStore, getTodayDateString } from '../../src/stores/diaryStore';
import { useMealStore } from '../../src/stores/mealStore';
import { foodDatabaseAdapter } from '../../src/database/adapters/FoodDatabaseAdapter';
import { formatNumber } from '../../src/localization/formatters';
import { translations } from '../../src/localization/translations';
import { radii, spacing } from '../../src/design-system/tokens/spacing';

const VEGGIE_OPTIONS = [
  { name_bn: 'লাল শাক ভাজি', name_en: 'Red Amaranth Fry', grams: 150, kcal: 55, protein: 4.5, carb: 7.2, fat: 0.8 },
  { name_bn: 'পুঁই শাক চচ্চড়ি', name_en: 'Malabar Spinach', grams: 140, kcal: 62, protein: 3.8, carb: 8.5, fat: 1.2 },
  { name_bn: 'ফুলকপি ভাজি', name_en: 'Cauliflower Fry', grams: 130, kcal: 48, protein: 2.8, carb: 6.1, fat: 0.9 },
];

const PROTEIN_OPTIONS = [
  { name_bn: 'রুই মাছের তরকারি', name_en: 'Rohu Fish Curry', grams: 90, kcal: 115, protein: 16.2, carb: 1.5, fat: 4.8 },
  { name_bn: 'দেশি মুরগির মাংস', name_en: 'Chicken Curry', grams: 100, kcal: 142, protein: 22.4, carb: 0.8, fat: 5.2 },
  { name_bn: 'মসুর ডাল ঘন', name_en: 'Thick Lentil Dal', grams: 120, kcal: 116, protein: 7.8, carb: 15.6, fat: 2.5 },
];

const CARB_OPTIONS = [
  { name_bn: 'সিদ্ধ ভাত (BR-28)', name_en: 'Boiled Rice', grams: 180, kcal: 196, protein: 3.8, carb: 43.7, fat: 0.2 },
  { name_bn: 'আটার রুটি (হাতে তৈরি)', name_en: 'Handmade Ruti', grams: 90, kcal: 243, protein: 8.1, carb: 49.5, fat: 1.2 },
  { name_bn: 'লাল চালের ভাত', name_en: 'Brown Rice', grams: 180, kcal: 185, protein: 4.2, carb: 40.1, fat: 0.4 },
];

export default function SmartPlateScreen() {
  const router = useRouter();
  const { theme, language } = useThemeStore();
  const t = translations[language];
  const { addCustomEntry } = useDiaryStore();

  const [selectedVeggie, setSelectedVeggie] = useState(VEGGIE_OPTIONS[0]);
  const [selectedProtein, setSelectedProtein] = useState(PROTEIN_OPTIONS[0]);
  const [selectedCarb, setSelectedCarb] = useState(CARB_OPTIONS[0]);

  const totalPlateCalories = selectedVeggie.kcal + selectedProtein.kcal + selectedCarb.kcal;

  const handleTransferToDiary = () => {
    addCustomEntry({
      foodCode: 'smart_plate_combo',
      name_bn: `স্মার্ট প্লেট (${selectedVeggie.name_bn} + ${selectedProtein.name_bn} + ${selectedCarb.name_bn})`,
      name_en: `Smart Plate (${selectedVeggie.name_en} + ${selectedProtein.name_en} + ${selectedCarb.name_en})`,
      mealType: 'lunch',
      date: getTodayDateString(),
      quantity: 1,
      unit: 'plate',
      gramWeight: selectedVeggie.grams + selectedProtein.grams + selectedCarb.grams,
      energy_kcal: totalPlateCalories,
      carb_g: Number((selectedVeggie.carb + selectedProtein.carb + selectedCarb.carb).toFixed(1)),
      protein_g: Number((selectedVeggie.protein + selectedProtein.protein + selectedCarb.protein).toFixed(1)),
      fat_g: Number((selectedVeggie.fat + selectedProtein.fat + selectedCarb.fat).toFixed(1)),
      fibre_g: 4.8,
      calcium_mg: 290,
      iron_mg: 5.4,
      sodium_mg: 75,
      potassium_mg: 450,
      isPlant: true,
      plantCategory: 'leafy_green',
    });
    router.back();
  };

  const handleTransferToMealMaker = () => {
    const { initDraft, addItem } = useMealStore.getState();
    initDraft({
      name: language === 'bn' ? 'স্মার্ট প্লেট সুষম মিল' : 'Smart Balanced Plate Meal',
      category: 'lunch',
      notes: language === 'bn'
        ? 'স্মার্ট প্লেট থেকে স্থানান্তরিত: ১/২ শাকসবজি, ১/৪ আমিষ ও ১/৪ শর্করা'
        : 'Transferred from Smart Plate: 1/2 veggies, 1/4 protein, 1/4 carbs',
    });

    const vFood = foodDatabaseAdapter.getAllFoods().find(
      (f) => f.english.toLowerCase().includes('amaranth') || f.bengali.includes('শাক')
    );
    const pFood = foodDatabaseAdapter.getFoodByCode('PREP_ROHU_CURRY') || foodDatabaseAdapter.getAllFoods().find((f) => f.code.includes('09_'));
    const cFood = foodDatabaseAdapter.getFoodByCode('01_0037');

    if (vFood) addItem(vFood, selectedVeggie.grams, 'g');
    if (pFood) addItem(pFood, selectedProtein.grams, 'g');
    if (cFood) addItem(cFood, selectedCarb.grams, 'g');

    router.push('/meal/new');
  };

  return (
    <PremiumScreen>
      <PremiumHeader
        title={language === 'bn' ? 'স্মার্ট প্লেট বিল্ডার' : 'Smart Plate Builder'}
        subtitle={language === 'bn' ? 'সুস্থ জীবনের জন্য আদর্শ থালা বিন্যাস' : 'Visual Balanced Plate Composition'}
        showBack
      />

      {/* Visual Plate Representation */}
      <BentoCard variant="elevated" style={styles.plateCard}>
        <View style={styles.plateVisualCircle}>
          {/* Half Vegetables Section (Left) */}
          <View style={[styles.plateHalfLeft, { backgroundColor: theme.fibreLight }]}>
            <Leaf size={24} color={theme.fibre} />
            <Text style={[styles.plateSectionTitle, { color: theme.fibre }]}>
              ১/২ শাকসবজি
            </Text>
            <Text style={[styles.plateItemName, { color: theme.text }]}>
              {language === 'bn' ? selectedVeggie.name_bn : selectedVeggie.name_en}
            </Text>
            <Text style={[styles.plateItemMeta, { color: theme.textSecondary }]}>
              {selectedVeggie.grams}g · {selectedVeggie.kcal} kcal
            </Text>
          </View>

          {/* Right Column: 1/4 Protein (Top-Right) & 1/4 Carbs (Bottom-Right) */}
          <View style={styles.plateHalfRight}>
            <View style={[styles.plateQuarterTop, { backgroundColor: theme.proteinLight }]}>
              <Fish size={18} color={theme.protein} />
              <Text style={[styles.quarterTitle, { color: theme.protein }]}>
                ১/৪ আমিষ
              </Text>
              <Text style={[styles.plateItemName, { color: theme.text }]} numberOfLines={1}>
                {language === 'bn' ? selectedProtein.name_bn : selectedProtein.name_en}
              </Text>
              <Text style={[styles.plateItemMeta, { color: theme.textSecondary }]}>
                {selectedProtein.grams}g · {selectedProtein.kcal} kcal
              </Text>
            </View>

            <View style={[styles.plateQuarterBottom, { backgroundColor: theme.carbLight }]}>
              <Wheat size={18} color={theme.carb} />
              <Text style={[styles.quarterTitle, { color: theme.carb }]}>
                ১/৪ শর্করা
              </Text>
              <Text style={[styles.plateItemName, { color: theme.text }]} numberOfLines={1}>
                {language === 'bn' ? selectedCarb.name_bn : selectedCarb.name_en}
              </Text>
              <Text style={[styles.plateItemMeta, { color: theme.textSecondary }]}>
                {selectedCarb.grams}g · {selectedCarb.kcal} kcal
              </Text>
            </View>
          </View>
        </View>

        {/* Total Plate Energy */}
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
            {language === 'bn' ? 'প্লেটের মোট ক্যালরি:' : 'Total Plate Calories:'}
          </Text>
          <Text style={[styles.totalKcal, { color: theme.primary }]}>
            {formatNumber(totalPlateCalories, language)} {t.kcal}
          </Text>
        </View>
      </BentoCard>

      {/* Component Customizer Selectors */}
      <BentoCard>
        <Text style={[styles.selectorSectionTitle, { color: theme.text }]}>
          {language === 'bn' ? 'উপাদান পরিবর্তন করুন' : 'Customize Plate Items'}
        </Text>

        {/* Veggie Choices */}
        <Text style={[styles.subSelectorLabel, { color: theme.fibre }]}>
          {language === 'bn' ? '১/২ শাকসবজি (Vegetables)' : '1/2 Vegetables'}
        </Text>
        <View style={styles.chipRow}>
          {VEGGIE_OPTIONS.map((item) => {
            const isSelected = selectedVeggie.name_bn === item.name_bn;
            return (
              <TouchableOpacity
                key={item.name_bn}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: isSelected ? theme.fibreLight : theme.surfaceMuted,
                    borderColor: isSelected ? theme.fibre : theme.borderSubtle,
                  },
                ]}
                onPress={() => setSelectedVeggie(item)}
              >
                <Text style={[styles.optionChipText, { color: isSelected ? theme.fibre : theme.text }]}>
                  {language === 'bn' ? item.name_bn : item.name_en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Protein Choices */}
        <Text style={[styles.subSelectorLabel, { color: theme.protein, marginTop: spacing.sm }]}>
          {language === 'bn' ? '১/৪ আমিষ (Protein)' : '1/4 Protein'}
        </Text>
        <View style={styles.chipRow}>
          {PROTEIN_OPTIONS.map((item) => {
            const isSelected = selectedProtein.name_bn === item.name_bn;
            return (
              <TouchableOpacity
                key={item.name_bn}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: isSelected ? theme.proteinLight : theme.surfaceMuted,
                    borderColor: isSelected ? theme.protein : theme.borderSubtle,
                  },
                ]}
                onPress={() => setSelectedProtein(item)}
              >
                <Text style={[styles.optionChipText, { color: isSelected ? theme.protein : theme.text }]}>
                  {language === 'bn' ? item.name_bn : item.name_en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Carb Choices */}
        <Text style={[styles.subSelectorLabel, { color: theme.carb, marginTop: spacing.sm }]}>
          {language === 'bn' ? '১/৪ শর্করা (Carbohydrates)' : '1/4 Carbohydrates'}
        </Text>
        <View style={styles.chipRow}>
          {CARB_OPTIONS.map((item) => {
            const isSelected = selectedCarb.name_bn === item.name_bn;
            return (
              <TouchableOpacity
                key={item.name_bn}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: isSelected ? theme.carbLight : theme.surfaceMuted,
                    borderColor: isSelected ? theme.carb : theme.borderSubtle,
                  },
                ]}
                onPress={() => setSelectedCarb(item)}
              >
                <Text style={[styles.optionChipText, { color: isSelected ? theme.carb : theme.text }]}>
                  {language === 'bn' ? item.name_bn : item.name_en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BentoCard>

      {/* Guidelines Box */}
      <BentoCard>
        <Text style={[styles.guideTitle, { color: theme.text }]}>
          {language === 'bn' ? 'স্মার্ট প্লেট নির্দেশিকা' : 'Smart Plate Principle'}
        </Text>
        <Text style={[styles.guideBody, { color: theme.textSecondary }]}>
          {language === 'bn'
            ? 'থালায় অর্ধেক অংশ শাকসবজি ও সালাদ রাখলে পর্যাপ্ত ডায়েটারি ফাইবার পাওয়া যায়, যা শর্করার শোষণ ধীর করে রক্তে সুগার নিয়ন্ত্রণে রাখে।'
            : 'Devoting half of your plate to colorful vegetables provides essential fiber that moderates postprandial blood sugar spikes.'}
        </Text>
      </BentoCard>

      <TouchableOpacity
        style={[styles.transferMealMakerBtn, { backgroundColor: theme.surface, borderColor: theme.primary }]}
        onPress={handleTransferToMealMaker}
        activeOpacity={0.8}
      >
        <Utensils size={18} color={theme.primary} />
        <Text style={[styles.transferMealMakerText, { color: theme.primary }]}>
          {language === 'bn' ? 'স্মার্ট মিল মেকারে রূপান্তর করুন' : 'Open in Smart Meal Maker'}
        </Text>
      </TouchableOpacity>

      <PrimaryButton
        title={language === 'bn' ? 'প্লেট থেকে সরাসরি ট্র্যাকার লগ করুন' : 'Transfer Plate to Diary'}
        onPress={handleTransferToDiary}
        icon={<Check size={18} color="#FFFFFF" />}
      />
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  plateCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  plateVisualCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 4,
    borderColor: '#DFDACB',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  plateHalfLeft: {
    width: '50%',
    height: '100%',
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 2,
    borderRightColor: '#DFDACB',
  },
  plateSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  plateItemName: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  plateItemMeta: {
    fontSize: 10,
    marginTop: 2,
  },
  plateHalfRight: {
    width: '50%',
    height: '100%',
  },
  plateQuarterTop: {
    height: '50%',
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#DFDACB',
  },
  quarterTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  plateQuarterBottom: {
    height: '50%',
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalKcal: {
    fontSize: 18,
    fontWeight: '700',
  },
  selectorSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subSelectorLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  optionChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  guideBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  transferMealMakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 14,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
  },
  transferMealMakerText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
