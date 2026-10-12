import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, ChefHat, Users, Disc, ChevronRight, Trash2, X, Check, Utensils } from 'lucide-react-native';
import { PremiumScreen } from '../../src/components/ui/PremiumScreen';
import { PremiumHeader } from '../../src/components/ui/PremiumHeader';
import { BentoCard } from '../../src/components/ui/BentoCard';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { useThemeStore } from '../../src/stores/themeStore';
import { useRecipeStore } from '../../src/stores/recipeStore';
import { useDiaryStore, getTodayDateString } from '../../src/stores/diaryStore';
import { Recipe } from '../../src/types/recipe';
import { MealType } from '../../src/types/diary';
import { formatNumber } from '../../src/localization/formatters';
import { translations } from '../../src/localization/translations';
import { radii, spacing } from '../../src/design-system/tokens/spacing';

export default function RecipesScreen() {
  const router = useRouter();
  const { theme, language } = useThemeStore();
  const t = translations[language];

  const { recipes, removeRecipe } = useRecipeStore();
  const { addCustomEntry } = useDiaryStore();

  // Recipe Portion Logging Modal state
  const [selectedRecipeToLog, setSelectedRecipeToLog] = useState<Recipe | null>(null);
  const [logWeightStr, setLogWeightStr] = useState('150');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');

  const handleOpenLogModal = (recipe: Recipe) => {
    setSelectedRecipeToLog(recipe);
    // default to 1 standard serving or 150g
    const defaultGrams = Math.round(recipe.cookedYieldWeightGrams / recipe.totalServings) || 150;
    setLogWeightStr(String(defaultGrams));
  };

  const consumedGrams = Math.max(1, parseInt(logWeightStr) || 150);

  const calculatedNutrients = React.useMemo(() => {
    if (!selectedRecipeToLog) return null;
    const totalYield = selectedRecipeToLog.cookedYieldWeightGrams || 1;
    const fraction = consumedGrams / totalYield;
    return {
      calories: Math.round(selectedRecipeToLog.totalCalories * fraction),
      carbs: Number((selectedRecipeToLog.totalCarbs * fraction).toFixed(1)),
      protein: Number((selectedRecipeToLog.totalProtein * fraction).toFixed(1)),
      fat: Number((selectedRecipeToLog.totalFat * fraction).toFixed(1)),
      fibre: Number((selectedRecipeToLog.totalFibre * fraction).toFixed(1)),
    };
  }, [selectedRecipeToLog, consumedGrams]);

  const handleConfirmLogRecipe = () => {
    if (!selectedRecipeToLog || !calculatedNutrients) return;

    addCustomEntry({
      foodCode: selectedRecipeToLog.id,
      recipeId: selectedRecipeToLog.id,
      name_bn: `${selectedRecipeToLog.name} (${consumedGrams} গ্রাম)`,
      name_en: `${selectedRecipeToLog.name} (${consumedGrams}g)`,
      mealType: selectedMeal,
      date: getTodayDateString(),
      quantity: 1,
      unit: 'g',
      gramWeight: consumedGrams,
      foodState: 'PREPARED',
      preparationMethod: 'curry',
      nutrientBasis: 'per_100g_cooked',
      energy_kcal: calculatedNutrients.calories,
      carb_g: calculatedNutrients.carbs,
      protein_g: calculatedNutrients.protein,
      fat_g: calculatedNutrients.fat,
      fibre_g: calculatedNutrients.fibre,
      isPlant: selectedRecipeToLog.ingredients.every((i) => i.food.is_plant),
    });

    setSelectedRecipeToLog(null);
    router.push('/tracker');
  };

  const mealTypes: Array<{ id: MealType; label_bn: string; label_en: string }> = [
    { id: 'breakfast', label_bn: 'সকালের নাশতা', label_en: 'Breakfast' },
    { id: 'lunch', label_bn: 'দুপুরের খাবার', label_en: 'Lunch' },
    { id: 'snack', label_bn: 'বিকেলের নাশতা', label_en: 'Snack' },
    { id: 'dinner', label_bn: 'রাতের খাবার', label_en: 'Dinner' },
  ];

  return (
    <PremiumScreen>
      <PremiumHeader
        title={t.tabRecipes}
        subtitle={language === 'bn' ? 'ব্যক্তিগত রেসিপি ও ফ্যামিলি পট পুষ্টি গণনা' : 'Personal Recipes & Family Pot Calculation'}
      />

      {/* Action Banners */}
      <View style={styles.actionBannerGrid}>
        <TouchableOpacity
          style={[styles.bannerCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}
          onPress={() => router.push('/recipe/new')}
          activeOpacity={0.7}
        >
          <View style={[styles.bannerIcon, { backgroundColor: theme.primaryLight + '26' }]}>
            <ChefHat size={22} color={theme.primary} />
          </View>
          <Text style={[styles.bannerTitle, { color: theme.text }]}>
            {language === 'bn' ? 'নতুন রেসিপি তৈরি' : 'New Recipe'}
          </Text>
          <Text style={[styles.bannerSub, { color: theme.textSecondary }]}>
            {language === 'bn' ? 'উপাদান যুক্ত করুন ও প্রতি পরিবেশন পুষ্টি জানুন' : 'Calculate nutrition per serving'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bannerCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}
          onPress={() => router.push('/family-pot')}
          activeOpacity={0.7}
        >
          <View style={[styles.bannerIcon, { backgroundColor: theme.fat + '26' }]}>
            <Users size={22} color={theme.fat} />
          </View>
          <Text style={[styles.bannerTitle, { color: theme.text }]}>
            {language === 'bn' ? 'ফ্যামিলি পট' : 'Family Pot'}
          </Text>
          <Text style={[styles.bannerSub, { color: theme.textSecondary }]}>
            {language === 'bn' ? 'পরিবারের সদস্যদের প্লেটের গ্রাম অনুসারে বণ্টন' : 'Allocate actual portions in grams'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Smart Meal Maker Banner */}
      <TouchableOpacity
        style={[styles.smartPlateBanner, { backgroundColor: theme.surface, borderColor: theme.primary, marginBottom: spacing.sm }]}
        onPress={() => router.push('/meal')}
        activeOpacity={0.7}
      >
        <View style={styles.smartPlateLeft}>
          <View style={[styles.plateIconBox, { backgroundColor: theme.primaryLight + '26' }]}>
            <Utensils size={22} color={theme.primary} />
          </View>
          <View style={styles.plateTextColumn}>
            <Text style={[styles.smartPlateTitle, { color: theme.text }]}>
              {language === 'bn' ? 'স্মার্ট মিল মেকার' : 'Smart Meal Maker'}
            </Text>
            <Text style={[styles.smartPlateSub, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'সংরক্ষিত রেসিপি ও খাবার দিয়ে সম্পূর্ণ মিল তৈরি' : 'Combine foods & recipes into a complete meal'}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={theme.primary} />
      </TouchableOpacity>

      {/* Smart Plate Builder Banner */}
      <TouchableOpacity
        style={[styles.smartPlateBanner, { backgroundColor: theme.surface, borderColor: theme.accent }]}
        onPress={() => router.push('/smart-plate')}
        activeOpacity={0.7}
      >
        <View style={styles.smartPlateLeft}>
          <View style={[styles.plateIconBox, { backgroundColor: theme.accent + '26' }]}>
            <Disc size={22} color={theme.accent} />
          </View>
          <View style={styles.plateTextColumn}>
            <Text style={[styles.smartPlateTitle, { color: theme.text }]}>
              {language === 'bn' ? 'স্মার্ট প্লেট ভিজ্যুয়ালাইজার' : 'Smart Plate Visualizer'}
            </Text>
            <Text style={[styles.smartPlateSub, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'থালায় শর্করা, আমিষ ও শাকসবজির সুষম অনুপাত' : 'Visual plate distribution for meal balance'}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={theme.accent} />
      </TouchableOpacity>

      {/* Saved Recipes List */}
      <SectionHeader
        title={language === 'bn' ? 'সংরক্ষিত রেসিপিসমূহ' : 'Saved Recipes'}
      />

      {recipes.map((r) => (
        <BentoCard key={r.id} style={styles.recipeCard}>
          <View style={styles.recipeHeader}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Text style={[styles.recipeName, { color: theme.text }]}>{r.name}</Text>
              <Text style={[styles.recipeCategory, { color: theme.textSecondary }]}>
                {r.category} · {formatNumber(r.totalServings, language)} {language === 'bn' ? 'পরিবেশন' : 'servings'} ({r.cookedYieldWeightGrams}g রান্না)
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.recipeKcal, { color: theme.primary }]}>
                {formatNumber(r.perServingCalories, language)} {t.kcal}
                <Text style={[styles.perServText, { color: theme.textMuted }]}>/serv</Text>
              </Text>
            </View>
          </View>

          <View style={styles.recipeFooterRow}>
            <View style={styles.recipeMacroRow}>
              <Text style={[styles.macroPill, { color: theme.carb }]}>
                C: {formatNumber(r.perServingCarbs, language)}g
              </Text>
              <Text style={[styles.macroPill, { color: theme.protein }]}>
                P: {formatNumber(r.perServingProtein, language)}g
              </Text>
              <Text style={[styles.macroPill, { color: theme.fat }]}>
                F: {formatNumber(r.perServingFat, language)}g
              </Text>
            </View>

            <View style={styles.cardBtnGroup}>
              <TouchableOpacity
                style={[
                  styles.logRecipeBtn,
                  { backgroundColor: theme.primaryLight + '26', borderColor: theme.primary },
                ]}
                onPress={() => handleOpenLogModal(r)}
                activeOpacity={0.7}
              >
                <Plus size={14} color={theme.primary} />
                <Text style={[styles.logBtnText, { color: theme.primary }]}>
                  {language === 'bn' ? 'ডায়েরিতে যোগ' : 'Log Portion'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteBtn, { borderColor: theme.borderSubtle }]}
                onPress={() => removeRecipe(r.id)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Trash2 size={16} color={theme.criticalAlert} />
              </TouchableOpacity>
            </View>
          </View>
        </BentoCard>
      ))}

      {/* Recipe Custom Portion Logging Modal */}
      {selectedRecipeToLog && (
        <Modal
          visible={!!selectedRecipeToLog}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedRecipeToLog(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: theme.text }]} numberOfLines={1}>
                    {selectedRecipeToLog.name}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                    {language === 'bn'
                      ? `রান্না করা মোট ওজন: ${selectedRecipeToLog.cookedYieldWeightGrams} গ্রাম`
                      : `Total Cooked Yield: ${selectedRecipeToLog.cookedYieldWeightGrams}g`}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedRecipeToLog(null)}>
                  <X size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Meal Type Selector */}
                <Text style={[styles.modalSectionLabel, { color: theme.text }]}>
                  {language === 'bn' ? 'খাবারের সময়:' : 'Meal Time:'}
                </Text>
                <View style={styles.modalMealRow}>
                  {mealTypes.map((m) => {
                    const isSelected = selectedMeal === m.id;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        style={[
                          styles.modalMealTab,
                          {
                            backgroundColor: isSelected ? theme.primary : theme.surfaceMuted,
                            borderColor: isSelected ? theme.primary : theme.borderSubtle,
                          },
                        ]}
                        onPress={() => setSelectedMeal(m.id)}
                      >
                        <Text
                          style={[
                            styles.modalMealTabText,
                            { color: isSelected ? theme.textInverse : theme.text },
                          ]}
                        >
                          {language === 'bn' ? m.label_bn : m.label_en}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Gram Weight Input */}
                <Text style={[styles.modalSectionLabel, { color: theme.text, marginTop: spacing.sm }]}>
                  {language === 'bn' ? 'খাওয়া অংশের ওজন (গ্রাম):' : 'Consumed Cooked Weight (g):'}
                </Text>
                <View style={styles.weightInputRow}>
                  <TextInput
                    style={[
                      styles.weightInput,
                      { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border },
                    ]}
                    keyboardType="numeric"
                    value={logWeightStr}
                    onChangeText={setLogWeightStr}
                  />
                  <Text style={[styles.weightUnitText, { color: theme.textSecondary }]}>
                    {language === 'bn' ? 'গ্রাম রান্না খাবার' : 'grams cooked'}
                  </Text>
                </View>

                {/* Quick Presets */}
                <View style={styles.presetRow}>
                  {[
                    Math.round(selectedRecipeToLog.cookedYieldWeightGrams / selectedRecipeToLog.totalServings),
                    150,
                    200,
                    250,
                    300,
                  ].map((presetGrams, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor: consumedGrams === presetGrams ? theme.primary : theme.surfaceMuted,
                          borderColor: theme.borderSubtle,
                        },
                      ]}
                      onPress={() => setLogWeightStr(String(presetGrams))}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          { color: consumedGrams === presetGrams ? theme.textInverse : theme.text },
                        ]}
                      >
                        {formatNumber(presetGrams, language)}g
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Calculated Nutrients for this custom weight */}
                {calculatedNutrients && (
                  <View style={[styles.calculatedCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle }]}>
                    <View style={styles.calcTop}>
                      <Text style={[styles.calcWeightText, { color: theme.textSecondary }]}>
                        {language === 'bn' ? `${formatNumber(consumedGrams, language)} গ্রাম পদের পুষ্টি:` : `Nutrients for ${consumedGrams}g:`}
                      </Text>
                      <Text style={[styles.calcCalories, { color: theme.primary }]}>
                        {formatNumber(calculatedNutrients.calories, language)} {t.kcal}
                      </Text>
                    </View>
                    <View style={styles.calcMacrosRow}>
                      <Text style={[styles.calcMacroItem, { color: theme.carb }]}>
                        C: {formatNumber(calculatedNutrients.carbs, language)}g
                      </Text>
                      <Text style={[styles.calcMacroItem, { color: theme.protein }]}>
                        P: {formatNumber(calculatedNutrients.protein, language)}g
                      </Text>
                      <Text style={[styles.calcMacroItem, { color: theme.fat }]}>
                        F: {formatNumber(calculatedNutrients.fat, language)}g
                      </Text>
                      <Text style={[styles.calcMacroItem, { color: theme.fibre }]}>
                        Fibre: {formatNumber(calculatedNutrients.fibre, language)}g
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Confirm Log Button */}
              <TouchableOpacity
                style={[styles.confirmLogBtn, { backgroundColor: theme.primary }]}
                onPress={handleConfirmLogRecipe}
                activeOpacity={0.8}
              >
                <Check size={18} color={theme.textInverse} />
                <Text style={[styles.confirmLogBtnText, { color: theme.textInverse }]}>
                  {language === 'bn' ? `ডায়েরিতে যোগ করুন (${formatNumber(calculatedNutrients?.calories || 0, language)} ক্যালোরি)` : `Add to Diary (${calculatedNutrients?.calories || 0} kcal)`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  actionBannerGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  bannerCard: {
    flex: 1,
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
  },
  bannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  smartPlateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  smartPlateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  plateIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateTextColumn: {
    flex: 1,
  },
  smartPlateTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  smartPlateSub: {
    fontSize: 11,
    marginTop: 2,
  },
  recipeCard: {
    marginBottom: spacing.sm,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '700',
  },
  recipeCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  recipeKcal: {
    fontSize: 16,
    fontWeight: '800',
  },
  perServText: {
    fontSize: 11,
    fontWeight: 'normal',
  },
  recipeFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.1)',
  },
  recipeMacroRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  macroPill: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logRecipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  logBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: radii.cardLarge,
    borderTopRightRadius: radii.cardLarge,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  modalMealRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  modalMealTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  modalMealTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  weightInput: {
    width: 100,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  weightUnitText: {
    fontSize: 13,
  },
  presetRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  calculatedCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  calcTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  calcWeightText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calcCalories: {
    fontSize: 18,
    fontWeight: '800',
  },
  calcMacrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calcMacroItem: {
    fontSize: 12,
    fontWeight: '700',
  },
  confirmLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radii.pill,
    gap: spacing.xs,
  },
  confirmLogBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
