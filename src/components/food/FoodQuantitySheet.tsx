import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { X, Check, Flame, Info, CheckCircle2 } from 'lucide-react-native';
import { FoodItem, ServingPortion, FoodState } from '../../types/food';
import { MealType } from '../../types/diary';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';
import { foodDatabaseAdapter, STANDARD_PORTIONS } from '../../database/adapters/FoodDatabaseAdapter';
import { evaluateFoodAlerts } from '../../engines/pathology/alertEngine';
import { AlertCard } from '../alerts/AlertCard';
import { formatNumber } from '../../localization/formatters';
import { translations } from '../../localization/translations';
import { radii, spacing } from '../../design-system/tokens/spacing';

interface FoodQuantitySheetProps {
  food: FoodItem | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (params: {
    food: FoodItem;
    mealType: MealType;
    quantity: number;
    unit: any;
  }) => void;
  initialMealType?: MealType;
}

export const FoodQuantitySheet: React.FC<FoodQuantitySheetProps> = ({
  food,
  visible,
  onClose,
  onConfirm,
  initialMealType = 'lunch',
}) => {
  const { theme, language } = useThemeStore();
  const { profile } = useUserStore();
  const t = translations[language];

  // Active Food tracking (switches between raw, cooked, and prepared versions)
  const [activeFood, setActiveFood] = useState<FoodItem | null>(food);
  const [quantityStr, setQuantityStr] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState<string>('g');
  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialMealType);

  useEffect(() => {
    setActiveFood(food);
  }, [food]);

  const availableStates = useMemo<FoodState[]>(() => {
    if (!food) return [];
    return foodDatabaseAdapter.getAvailableStates(food);
  }, [food]);

  const portions = useMemo<ServingPortion[]>(() => {
    if (!activeFood) return [];
    return foodDatabaseAdapter.getServingPortions(activeFood);
  }, [activeFood]);

  // Set default unit when active food changes
  useEffect(() => {
    if (activeFood && portions.length > 0) {
      const defaultPortion = portions.length > 1 ? portions[1].unit : portions[0].unit;
      setSelectedUnit(defaultPortion);
      setQuantityStr('1');
    }
  }, [activeFood, portions]);

  const handleStateChange = (targetState: FoodState) => {
    if (!food || targetState === activeFood?.foodState) return;
    const paired = foodDatabaseAdapter.getPairedFood(food, targetState);
    if (paired) {
      setActiveFood(paired);
    }
  };

  const quantity = Math.max(0.1, parseFloat(quantityStr) || 1);
  const currentPortion = portions.find((p) => p.unit === selectedUnit) || { gramWeight: 100 };
  const totalGrams = Math.round(quantity * currentPortion.gramWeight);

  const liveNutrients = useMemo(() => {
    if (!activeFood) return null;
    return foodDatabaseAdapter.calculateNutrients(activeFood.code, totalGrams);
  }, [activeFood, totalGrams]);

  const activeAlerts = useMemo(() => {
    if (!activeFood || !profile) return [];
    return evaluateFoodAlerts(activeFood, totalGrams, profile);
  }, [activeFood, totalGrams, profile]);

  if (!activeFood) return null;

  const displayName = language === 'bn' 
    ? activeFood.bengali || activeFood.name_bn || activeFood.english 
    : activeFood.english || activeFood.name_en || activeFood.bengali;

  const handleConfirm = () => {
    onConfirm({
      food: activeFood,
      mealType: selectedMeal,
      quantity,
      unit: selectedUnit,
    });
    onClose();
  };

  const mealTypes: Array<{ id: MealType; label_bn: string; label_en: string }> = [
    { id: 'breakfast', label_bn: 'সকালের নাশতা', label_en: 'Breakfast' },
    { id: 'lunch', label_bn: 'দুপুরের খাবার', label_en: 'Lunch' },
    { id: 'snack', label_bn: 'বিকেলের নাশতা', label_en: 'Snack' },
    { id: 'dinner', label_bn: 'রাতের খাবার', label_en: 'Dinner' },
  ];

  const quickGramOptions = [100, 150, 200, 250, 300];

  const getStateLabel = (s: FoodState) => {
    if (s === 'RAW') return language === 'bn' ? 'কাঁচা (Raw)' : 'Raw';
    if (s === 'COOKED') return language === 'bn' ? 'রান্না করা (Cooked)' : 'Cooked';
    return language === 'bn' ? 'প্রস্তুত পদ (Prepared)' : 'Prepared Dish';
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.sheetContent, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.titleColumn}>
              <Text style={[styles.foodTitle, { color: theme.text }]} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={[styles.categorySubtitle, { color: theme.textSecondary }]}>
                {activeFood.category} • {activeFood.code}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Raw vs Cooked vs Prepared State Switcher */}
            {availableStates.length > 1 && (
              <View style={styles.stateSelectorWrapper}>
                <Text style={[styles.sectionLabel, { color: theme.text }]}>
                  {language === 'bn' ? 'খাদ্যের রূপ নির্বাচন (Food State):' : 'Select Food State:'}
                </Text>
                <View style={[styles.stateSegmentContainer, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle }]}>
                  {availableStates.map((s) => {
                    const isSelected = activeFood.foodState === s;
                    return (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.stateSegmentTab,
                          isSelected && { backgroundColor: theme.primary },
                        ]}
                        onPress={() => handleStateChange(s)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.stateSegmentText,
                            { color: isSelected ? theme.textInverse : theme.textSecondary },
                            isSelected && { fontWeight: '700' },
                          ]}
                        >
                          {getStateLabel(s)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Scientific Provenance Banner */}
            <View style={[styles.provenanceBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle }]}>
              <View style={styles.provenanceRow}>
                <Info size={14} color={theme.accent} />
                <Text style={[styles.provenanceText, { color: theme.textSecondary }]}>
                  {language === 'bn'
                    ? `পরিমাপের ভিত্তি: ১০০ গ্রাম ${activeFood.foodState === 'RAW' ? 'কাঁচা উপাদান' : 'রান্না করা খাদ্য'} অনুযায়ী বিশ্লেষণ`
                    : `Basis: Per 100g ${activeFood.foodState === 'RAW' ? 'raw ingredient' : 'cooked food'}`}
                </Text>
              </View>
              {activeFood.cookingYieldFactor && activeFood.cookingYieldFactor !== 1 ? (
                <Text style={[styles.yieldNoteText, { color: theme.textMuted }]}>
                  {language === 'bn'
                    ? `রন্ধন প্রসারণ গুণক: x${activeFood.cookingYieldFactor} (রান্না করার পর ওজন পরিবর্তন)`
                    : `Cooking Yield Factor: x${activeFood.cookingYieldFactor}`}
                </Text>
              ) : null}
            </View>

            {/* Meal Selector */}
            <Text style={[styles.sectionLabel, { color: theme.text, marginTop: spacing.sm }]}>
              {language === 'bn' ? 'খাবারের সময় (Meal)' : 'Meal Time'}
            </Text>
            <View style={styles.mealRow}>
              {mealTypes.map((m) => {
                const isSelected = selectedMeal === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.mealTab,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.surfaceMuted,
                        borderColor: isSelected ? theme.primary : theme.borderSubtle,
                      },
                    ]}
                    onPress={() => setSelectedMeal(m.id)}
                  >
                    <Text
                      style={[
                        styles.mealTabText,
                        { color: isSelected ? theme.textInverse : theme.text },
                      ]}
                    >
                      {language === 'bn' ? m.label_bn : m.label_en}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quantity Input & Unit Selector */}
            <Text style={[styles.sectionLabel, { color: theme.text, marginTop: spacing.md }]}>
              {t.portionSize}
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.quantityInput,
                  {
                    backgroundColor: theme.surfaceMuted,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                keyboardType="decimal-pad"
                value={quantityStr}
                onChangeText={setQuantityStr}
                selectTextOnFocus
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
                {portions.map((p) => {
                  const isUnitSelected = selectedUnit === p.unit;
                  return (
                    <TouchableOpacity
                      key={`${p.unit}_${p.gramWeight}`}
                      style={[
                        styles.unitPill,
                        {
                          backgroundColor: isUnitSelected ? theme.accent : theme.surfaceMuted,
                          borderColor: isUnitSelected ? theme.accent : theme.borderSubtle,
                        },
                      ]}
                      onPress={() => setSelectedUnit(p.unit)}
                    >
                      <Text
                        style={[
                          styles.unitPillText,
                          { color: isUnitSelected ? '#FFFFFF' : theme.text },
                        ]}
                      >
                        {language === 'bn' ? p.label_bn : p.label_en}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Quick Gram Shortcuts */}
            <View style={styles.quickGramRow}>
              <Text style={[styles.quickGramLabel, { color: theme.textMuted }]}>
                {language === 'bn' ? 'দ্রুত ওজন:' : 'Quick Grams:'}
              </Text>
              {quickGramOptions.map((gVal) => (
                <TouchableOpacity
                  key={gVal}
                  style={[
                    styles.quickGramChip,
                    {
                      backgroundColor: selectedUnit === 'g' && quantityStr === String(gVal) ? theme.primary : theme.surfaceMuted,
                      borderColor: theme.borderSubtle,
                    },
                  ]}
                  onPress={() => {
                    setSelectedUnit('g');
                    setQuantityStr(String(gVal));
                  }}
                >
                  <Text
                    style={[
                      styles.quickGramChipText,
                      { color: selectedUnit === 'g' && quantityStr === String(gVal) ? theme.textInverse : theme.text },
                    ]}
                  >
                    {formatNumber(gVal, language)}g
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Calculated Nutrients Preview Card */}
            {liveNutrients && (
              <View style={[styles.previewCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle }]}>
                <View style={styles.previewTop}>
                  <Text style={[styles.previewGrams, { color: theme.textSecondary }]}>
                    {language === 'bn' 
                      ? `মোট পরিমাপ: ${formatNumber(totalGrams, language)} গ্রাম (${activeFood.foodState === 'RAW' ? 'কাঁচা' : 'রান্না'})` 
                      : `Total: ${totalGrams}g (${activeFood.foodState === 'RAW' ? 'Raw' : 'Cooked'})`}
                  </Text>
                  <Text style={[styles.previewCalories, { color: theme.primary }]}>
                    {formatNumber(liveNutrients.energy_kcal, language)} {t.kcal}
                  </Text>
                </View>
                <View style={styles.previewMacrosRow}>
                  <Text style={[styles.macroItem, { color: theme.carb }]}>
                    {t.carbs}: {formatNumber(liveNutrients.carb_g, language)}g
                  </Text>
                  <Text style={[styles.macroItem, { color: theme.protein }]}>
                    {t.protein}: {formatNumber(liveNutrients.protein_g, language)}g
                  </Text>
                  <Text style={[styles.macroItem, { color: theme.fat }]}>
                    {t.fat}: {formatNumber(liveNutrients.fat_g, language)}g
                  </Text>
                  <Text style={[styles.macroItem, { color: theme.fibre }]}>
                    {t.fibre}: {formatNumber(liveNutrients.fibre_g, language)}g
                  </Text>
                </View>
              </View>
            )}

            {/* Active Clinical Safety Warnings */}
            {activeAlerts.length > 0 && (
              <View style={styles.alertsContainer}>
                <Text style={[styles.alertsHeader, { color: theme.criticalAlert }]}>
                  {t.clinicalAlerts} ({activeAlerts.length})
                </Text>
                {activeAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </View>
            )}
          </ScrollView>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: theme.primary }]}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Check size={18} color={theme.textInverse} />
            <Text style={[styles.confirmButtonText, { color: theme.textInverse }]}>
              {t.confirm} ({formatNumber(liveNutrients?.energy_kcal || 0, language)} {t.kcal})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    borderTopLeftRadius: radii.cardLarge,
    borderTopRightRadius: radii.cardLarge,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleColumn: {
    flex: 1,
  },
  foodTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  categorySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  bodyScroll: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  stateSelectorWrapper: {
    marginBottom: spacing.sm,
  },
  stateSegmentContainer: {
    flexDirection: 'row',
    borderRadius: radii.pill,
    padding: 3,
    borderWidth: 1,
  },
  stateSegmentTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateSegmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  provenanceBox: {
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  provenanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  provenanceText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  yieldNoteText: {
    fontSize: 10,
    marginTop: 4,
    marginLeft: 20,
  },
  mealRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  mealTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  mealTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityInput: {
    width: 70,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  unitScroll: {
    flex: 1,
  },
  unitPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  unitPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickGramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  quickGramLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickGramChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  quickGramChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  previewCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  previewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  previewGrams: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewCalories: {
    fontSize: 18,
    fontWeight: '800',
  },
  previewMacrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  macroItem: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertsContainer: {
    marginTop: spacing.md,
  },
  alertsHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radii.pill,
    gap: spacing.xs,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
