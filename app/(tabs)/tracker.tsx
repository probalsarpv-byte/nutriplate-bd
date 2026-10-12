import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Trash2, Calendar as CalendarIcon, Sunrise, Sun, Sunset, Coffee, ChevronLeft, ChevronRight, Utensils, X } from 'lucide-react-native';
import { PremiumScreen } from '../../src/components/ui/PremiumScreen';
import { PremiumHeader } from '../../src/components/ui/PremiumHeader';
import { BentoCard } from '../../src/components/ui/BentoCard';
import { LogMealSheet } from '../../src/components/meal/LogMealSheet';
import { useThemeStore } from '../../src/stores/themeStore';
import { useDiaryStore } from '../../src/stores/diaryStore';
import { useMealStore } from '../../src/stores/mealStore';
import { SavedMeal } from '../../src/types/meal';
import { formatNumber } from '../../src/localization/formatters';
import { translations } from '../../src/localization/translations';
import { MealType, LoggedFoodEntry } from '../../src/types/diary';
import { radii, spacing } from '../../src/design-system/tokens/spacing';

export default function TrackerScreen() {
  const router = useRouter();
  const { theme, language } = useThemeStore();
  const t = translations[language];

  const { entries, selectedDate, setSelectedDate, removeFoodEntry, consumedCalories } = useDiaryStore();
  const { savedMeals, loadSavedMeals } = useMealStore();

  const [isSavedMealPickerOpen, setIsSavedMealPickerOpen] = useState(false);
  const [selectedMealForLogging, setSelectedMealForLogging] = useState<SavedMeal | null>(null);

  useEffect(() => {
    loadSavedMeals();
  }, []);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const d = new Date();
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const meals: Array<{
    type: MealType;
    label_bn: string;
    label_en: string;
    icon: React.ReactNode;
  }> = [
    {
      type: 'breakfast',
      label_bn: 'সকালের নাশতা',
      label_en: 'Breakfast',
      icon: <Sunrise size={18} color={theme.carb} />,
    },
    {
      type: 'lunch',
      label_bn: 'দুপুরের খাবার',
      label_en: 'Lunch',
      icon: <Sun size={18} color={theme.primary} />,
    },
    {
      type: 'snack',
      label_bn: 'বিকেলের নাশতা',
      label_en: 'Snacks',
      icon: <Coffee size={18} color={theme.fat} />,
    },
    {
      type: 'dinner',
      label_bn: 'রাতের খাবার',
      label_en: 'Dinner',
      icon: <Sunset size={18} color={theme.accent} />,
    },
  ];

  return (
    <PremiumScreen>
      <PremiumHeader
        title={t.tabTracker}
        subtitle={`${language === 'bn' ? 'তারিখ:' : 'Date:'} ${selectedDate}`}
      />

      {/* Date Switcher Strip */}
      <View style={[styles.dateBar, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
        <TouchableOpacity
          onPress={handlePrevDay}
          style={[styles.dateNavBtn, { backgroundColor: theme.surfaceMuted }]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={18} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleToday} activeOpacity={0.7} style={styles.dateCenterRow}>
          <CalendarIcon size={16} color={theme.primary} />
          <Text style={[styles.dateText, { color: theme.text }]}>
            {selectedDate} {isToday ? (language === 'bn' ? '(আজ)' : '(Today)') : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNextDay}
          style={[styles.dateNavBtn, { backgroundColor: theme.surfaceMuted }]}
          activeOpacity={0.7}
        >
          <ChevronRight size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Add Saved Meal Quick Action */}
      <TouchableOpacity
        style={[styles.savedMealQuickBtn, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}
        onPress={() => setIsSavedMealPickerOpen(true)}
        activeOpacity={0.7}
      >
        <View style={styles.savedMealBtnLeft}>
          <View style={[styles.savedMealIconBox, { backgroundColor: theme.primaryLight + '26' }]}>
            <Utensils size={18} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.savedMealBtnTitle, { color: theme.text }]}>
              {t.addSavedMeal}
            </Text>
            <Text style={[styles.savedMealBtnSub, { color: theme.textSecondary }]}>
              {language === 'bn'
                ? 'সংরক্ষিত মিল এক ক্লিকে ডায়েরিতে যোগ করুন'
                : 'Log a pre-composed meal plate directly'}
            </Text>
          </View>
        </View>
        <Plus size={18} color={theme.primary} />
      </TouchableOpacity>

      {meals.map((meal) => {
        const mealEntries = entries.filter((e) => e.mealType === meal.type && e.date === selectedDate);
        const mealCalories = mealEntries.reduce((sum, e) => sum + e.energy_kcal, 0);

        return (
          <BentoCard key={meal.type} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <View style={styles.mealTitleRow}>
                {meal.icon}
                <Text style={[styles.mealLabel, { color: theme.text }]}>
                  {language === 'bn' ? meal.label_bn : meal.label_en}
                </Text>
              </View>
              <View style={styles.headerRight}>
                <Text style={[styles.mealKcal, { color: theme.primary }]}>
                  {formatNumber(mealCalories, language)} {t.kcal}
                </Text>
                <TouchableOpacity
                  style={[styles.addFoodBtn, { backgroundColor: theme.primary }]}
                  onPress={() => router.push(`/food/search?mealType=${meal.type}`)}
                  activeOpacity={0.7}
                >
                  <Plus size={16} color={theme.textInverse} />
                </TouchableOpacity>
              </View>
            </View>

            {mealEntries.length === 0 ? (
              <Text style={[styles.emptyMealText, { color: theme.textMuted }]}>
                {language === 'bn' ? 'কোনো খাবার যোগ করা হয়নি' : 'No food entries yet'}
              </Text>
            ) : (
              mealEntries.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.itemRow,
                    { borderTopColor: theme.borderSubtle },
                  ]}
                >
                  <View style={styles.itemInfo}>
                    <View style={styles.itemNameRow}>
                      <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>
                        {language === 'bn' ? item.name_bn : item.name_en}
                      </Text>
                      {item.foodState && (
                        <View
                          style={[
                            styles.entryStatePill,
                            {
                              backgroundColor:
                                item.foodState === 'COOKED'
                                  ? '#FFEDD5'
                                  : item.foodState === 'PREPARED'
                                  ? '#E0F2FE'
                                  : '#FEF3C7',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.entryStateText,
                              {
                                color:
                                  item.foodState === 'COOKED'
                                    ? '#C2410C'
                                    : item.foodState === 'PREPARED'
                                    ? '#0369A1'
                                    : '#B45309',
                              },
                            ]}
                          >
                            {item.foodState === 'COOKED'
                              ? language === 'bn'
                                ? 'রান্না'
                                : 'Cooked'
                              : item.foodState === 'PREPARED'
                              ? language === 'bn'
                                ? 'প্রস্তুত'
                                : 'Prep'
                              : language === 'bn'
                              ? 'কাঁচা'
                              : 'Raw'}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.itemSub, { color: theme.textSecondary }]}>
                      {item.quantity} {item.unit} ({item.gramWeight}g) · C:{item.carb_g}g P:{item.protein_g}g F:{item.fat_g}g
                    </Text>
                  </View>
                  <View style={styles.itemActions}>
                    <Text style={[styles.itemKcal, { color: theme.text }]}>
                      {formatNumber(item.energy_kcal, language)} {t.kcal}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeFoodEntry(item.id)}
                      style={styles.deleteBtn}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={16} color={theme.criticalAlert} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </BentoCard>
        );
      })}

      {/* Saved Meal Selector Modal */}
      <Modal
        visible={isSavedMealPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSavedMealPickerOpen(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerContent, { backgroundColor: theme.surface }]}>
            <View style={styles.pickerHeader}>
              <View>
                <Text style={[styles.pickerTitle, { color: theme.text }]}>
                  {t.addSavedMeal}
                </Text>
                <Text style={[styles.pickerSub, { color: theme.textSecondary }]}>
                  {language === 'bn' ? 'সংরক্ষিত মিল নির্বাচন করুন' : 'Select a saved meal to log'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsSavedMealPickerOpen(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.savedMealsList}>
              {savedMeals.length === 0 ? (
                <View style={styles.noSavedMealsBox}>
                  <Text style={[styles.noSavedMealsText, { color: theme.textMuted }]}>
                    {language === 'bn' ? 'কোনো সংরক্ষিত মিল নেই।' : 'No saved meals found.'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.createMealBtn, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      setIsSavedMealPickerOpen(false);
                      router.push('/meal/new');
                    }}
                  >
                    <Plus size={16} color={theme.textInverse} />
                    <Text style={[styles.createMealBtnText, { color: theme.textInverse }]}>
                      {t.createNewMeal}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                savedMeals.map((sm) => (
                  <TouchableOpacity
                    key={sm.id}
                    style={[styles.savedMealItemCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle }]}
                    onPress={() => {
                      setIsSavedMealPickerOpen(false);
                      setSelectedMealForLogging(sm);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.smName, { color: theme.text }]} numberOfLines={1}>
                        {sm.name}
                      </Text>
                      <Text style={[styles.smMeta, { color: theme.textSecondary }]}>
                        {sm.items.length} {language === 'bn' ? 'টি পদ' : 'items'} ({sm.nutrition.totalWeightGrams}g) · {sm.category}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.smKcal, { color: theme.primary }]}>
                        {formatNumber(sm.nutrition.totalCalories, language)} {t.kcal}
                      </Text>
                      <Text style={[styles.smMacros, { color: theme.textSecondary }]}>
                        C:{sm.nutrition.totalCarbs}g P:{sm.nutrition.totalProtein}g
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Log Meal Sheet with Portion Resizing & Duplicate Prevention */}
      <LogMealSheet
        meal={selectedMealForLogging}
        visible={!!selectedMealForLogging}
        onClose={() => setSelectedMealForLogging(null)}
        onLogged={() => setSelectedMealForLogging(null)}
      />
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  mealCard: {
    padding: spacing.md,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mealLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mealKcal: {
    fontSize: 14,
    fontWeight: '700',
  },
  addFoodBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMealText: {
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    marginTop: spacing.xs,
  },
  itemInfo: {
    flex: 1,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  entryStatePill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  entryStateText: {
    fontSize: 9,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 11,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemKcal: {
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  dateBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  dateNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
  },
  savedMealQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  savedMealBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  savedMealIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedMealBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  savedMealBtnSub: {
    fontSize: 11,
    marginTop: 2,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    borderTopLeftRadius: radii.cardLarge,
    borderTopRightRadius: radii.cardLarge,
    padding: spacing.lg,
    maxHeight: '75%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  pickerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  savedMealsList: {
    maxHeight: 380,
  },
  noSavedMealsBox: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  noSavedMealsText: {
    fontSize: 13,
  },
  createMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  createMealBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  savedMealItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    marginBottom: spacing.xs + 2,
  },
  smName: {
    fontSize: 14,
    fontWeight: '700',
  },
  smMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  smKcal: {
    fontSize: 14,
    fontWeight: '700',
  },
  smMacros: {
    fontSize: 10,
    marginTop: 2,
  },
});
