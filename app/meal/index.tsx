import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, GitCompare, Trash2, Copy, Edit3, ArrowRight, Utensils, Calendar } from 'lucide-react-native';
import { PremiumScreen } from '../../src/components/ui/PremiumScreen';
import { PremiumHeader } from '../../src/components/ui/PremiumHeader';
import { BentoCard } from '../../src/components/ui/BentoCard';
import { LogMealSheet } from '../../src/components/meal/LogMealSheet';
import { useThemeStore } from '../../src/stores/themeStore';
import { useMealStore } from '../../src/stores/mealStore';
import { SavedMeal, MealCategory } from '../../src/types/meal';
import { formatNumber } from '../../src/localization/formatters';
import { translations } from '../../src/localization/translations';
import { radii, spacing } from '../../src/design-system/tokens/spacing';

export default function SavedMealsScreen() {
  const router = useRouter();
  const { theme, language } = useThemeStore();
  const t = translations[language];

  const { savedMeals, loadSavedMeals, duplicateMeal, deleteMeal, initDraft } = useMealStore();
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | MealCategory>('ALL');
  const [mealToLog, setMealToLog] = useState<SavedMeal | null>(null);

  useEffect(() => {
    loadSavedMeals();
  }, []);

  const categories: Array<{ id: 'ALL' | MealCategory; label_bn: string; label_en: string }> = [
    { id: 'ALL', label_bn: 'সব মিল', label_en: 'All Meals' },
    { id: 'breakfast', label_bn: 'সকালের নাশতা', label_en: 'Breakfast' },
    { id: 'lunch', label_bn: 'দুপুরের খাবার', label_en: 'Lunch' },
    { id: 'dinner', label_bn: 'রাতের খাবার', label_en: 'Dinner' },
    { id: 'snack', label_bn: 'বিকেলের নাশতা', label_en: 'Snacks' },
    { id: 'custom', label_bn: 'কাস্টম', label_en: 'Custom' },
  ];

  const filteredMeals = useMemo(() => {
    if (selectedCategory === 'ALL') return savedMeals;
    return savedMeals.filter((m) => m.category === selectedCategory);
  }, [savedMeals, selectedCategory]);

  const handleEditMeal = (meal: SavedMeal) => {
    initDraft(meal);
    router.push(`/meal/new?id=${meal.id}`);
  };

  const handleDuplicate = async (mealId: string) => {
    await duplicateMeal(mealId);
  };

  const handleDelete = (meal: SavedMeal) => {
    Alert.alert(
      language === 'bn' ? 'মিল মুছে ফেলুন' : 'Delete Meal',
      language === 'bn'
        ? `আপনি কি নিশ্চিতভাবে "${meal.name}" মুছে ফেলতে চান?`
        : `Are you sure you want to delete "${meal.name}"?`,
      [
        { text: language === 'bn' ? 'বাতিল' : 'Cancel', style: 'cancel' },
        {
          text: language === 'bn' ? 'মুছুন' : 'Delete',
          style: 'destructive',
          onPress: () => deleteMeal(meal.id),
        },
      ]
    );
  };

  return (
    <PremiumScreen>
      <PremiumHeader
        title={t.savedMeals}
        subtitle={language === 'bn' ? 'স্মার্ট মিল ও খাবার কম্বিনেশন লাইব্রেরি' : 'Smart Meal & Dish Combination Hub'}
        showBack
      />

      {/* Top Action Quick Buttons */}
      <View style={styles.topActionsRow}>
        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: theme.primary }]}
          onPress={() => {
            initDraft();
            router.push('/meal/new');
          }}
          activeOpacity={0.8}
        >
          <Plus size={18} color={theme.textInverse} />
          <Text style={[styles.primaryActionText, { color: theme.textInverse }]}>
            {t.createNewMeal}
          </Text>
        </TouchableOpacity>

        {savedMeals.length >= 2 && (
          <TouchableOpacity
            style={[styles.compareActionBtn, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}
            onPress={() => router.push('/meal/compare')}
            activeOpacity={0.8}
          >
            <GitCompare size={17} color={theme.accent} />
            <Text style={[styles.compareActionText, { color: theme.text }]}>
              {t.compareMeals}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {categories.map((c) => {
          const isSelected = selectedCategory === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? theme.primary : theme.surfaceMuted,
                  borderColor: isSelected ? theme.primary : theme.borderSubtle,
                },
              ]}
              onPress={() => setSelectedCategory(c.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: isSelected ? theme.textInverse : theme.textSecondary },
                  isSelected && { fontWeight: '700' },
                ]}
              >
                {language === 'bn' ? c.label_bn : c.label_en}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Meals List */}
      {filteredMeals.length === 0 ? (
        <BentoCard style={styles.emptyCard}>
          <Utensils size={36} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {language === 'bn' ? 'কোনো সংরক্ষিত মিল নেই' : 'No Saved Meals Found'}
          </Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
            {language === 'bn'
              ? 'বিভিন্ন কাঁচা ও রান্না করা খাবার অথবা ঘরোয়া রেসিপি একত্রিত করে আপনার নিজস্ব মিল তৈরি করুন।'
              : 'Combine raw and cooked foods or homemade recipes to compose your custom balanced meal.'}
          </Text>
          <TouchableOpacity
            style={[styles.emptyCreateBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              initDraft();
              router.push('/meal/new');
            }}
          >
            <Plus size={16} color={theme.textInverse} />
            <Text style={[styles.emptyCreateBtnText, { color: theme.textInverse }]}>
              {t.createNewMeal}
            </Text>
          </TouchableOpacity>
        </BentoCard>
      ) : (
        filteredMeals.map((meal) => (
          <BentoCard key={meal.id} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <View style={styles.mealTitleRow}>
                  <Text style={[styles.mealName, { color: theme.text }]} numberOfLines={1}>
                    {meal.name}
                  </Text>
                </View>
                <Text style={[styles.mealCategorySubtitle, { color: theme.textSecondary }]}>
                  {meal.category.toUpperCase()} • {meal.items.length}{' '}
                  {language === 'bn' ? 'টি উপাদান' : 'items'} ({meal.nutrition.totalWeightGrams}g)
                </Text>
              </View>

              <View style={styles.kcalBadge}>
                <Text style={[styles.kcalVal, { color: theme.primary }]}>
                  {formatNumber(meal.nutrition.totalCalories, language)}
                </Text>
                <Text style={[styles.kcalUnit, { color: theme.textSecondary }]}>{t.kcal}</Text>
              </View>
            </View>

            {/* Included Foods Summary Pill Strip */}
            <View style={styles.itemsSummaryRow}>
              {meal.items.slice(0, 3).map((it) => (
                <View
                  key={it.id}
                  style={[styles.itemSummaryPill, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle }]}
                >
                  <Text style={[styles.itemSummaryText, { color: theme.text }]} numberOfLines={1}>
                    {language === 'bn' ? it.name_bn : it.name_en} ({it.gramWeight}g)
                  </Text>
                </View>
              ))}
              {meal.items.length > 3 && (
                <View style={[styles.itemSummaryPill, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle }]}>
                  <Text style={[styles.itemSummaryText, { color: theme.textSecondary }]}>
                    +{meal.items.length - 3} {language === 'bn' ? 'আরও' : 'more'}
                  </Text>
                </View>
              )}
            </View>

            {/* Macros Row & Action Footer */}
            <View style={[styles.cardFooter, { borderTopColor: theme.borderSubtle }]}>
              <View style={styles.macrosStrip}>
                <Text style={[styles.macroPill, { color: theme.carb }]}>
                  C: {formatNumber(meal.nutrition.totalCarbs, language)}g
                </Text>
                <Text style={[styles.macroPill, { color: theme.protein }]}>
                  P: {formatNumber(meal.nutrition.totalProtein, language)}g
                </Text>
                <Text style={[styles.macroPill, { color: theme.fat }]}>
                  F: {formatNumber(meal.nutrition.totalFat, language)}g
                </Text>
                <Text style={[styles.macroPill, { color: theme.fibre }]}>
                  আঁশ: {formatNumber(meal.nutrition.totalFibre, language)}g
                </Text>
              </View>

              <View style={styles.actionsCluster}>
                <TouchableOpacity
                  style={[styles.logBtn, { backgroundColor: theme.primaryLight + '26', borderColor: theme.primary }]}
                  onPress={() => setMealToLog(meal)}
                  activeOpacity={0.7}
                >
                  <Plus size={14} color={theme.primary} />
                  <Text style={[styles.logBtnText, { color: theme.primary }]}>
                    {t.logToTracker}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconActionBtn, { borderColor: theme.borderSubtle }]}
                  onPress={() => handleEditMeal(meal)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Edit3 size={15} color={theme.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconActionBtn, { borderColor: theme.borderSubtle }]}
                  onPress={() => handleDuplicate(meal.id)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Copy size={15} color={theme.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconActionBtn, { borderColor: theme.borderSubtle }]}
                  onPress={() => handleDelete(meal)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={15} color={theme.criticalAlert} />
                </TouchableOpacity>
              </View>
            </View>
          </BentoCard>
        ))
      )}

      {/* Log Meal Modal Sheet */}
      <LogMealSheet
        meal={mealToLog}
        visible={!!mealToLog}
        onClose={() => setMealToLog(null)}
        onLogged={() => router.push('/tracker')}
      />
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  topActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radii.pill,
    gap: spacing.xs,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  compareActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    gap: 6,
  },
  compareActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryScroll: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radii.pill,
    marginTop: spacing.sm,
  },
  emptyCreateBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  mealCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
  },
  mealCategorySubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  kcalBadge: {
    alignItems: 'flex-end',
  },
  kcalVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  kcalUnit: {
    fontSize: 11,
  },
  itemsSummaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: spacing.xs + 2,
  },
  itemSummaryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    maxWidth: 160,
  },
  itemSummaryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  macrosStrip: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  macroPill: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  logBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconActionBtn: {
    padding: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
});
