import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, Check, Sun, Sunrise, Sunset, Coffee, Scale, ShieldAlert } from 'lucide-react-native';
import { SavedMeal } from '../../types/meal';
import { MealType } from '../../types/diary';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';
import { useMealStore } from '../../stores/mealStore';
import { evaluateMealAlerts } from '../../engines/meal/mealEngine';
import { formatNumber } from '../../localization/formatters';
import { translations } from '../../localization/translations';
import { radii, spacing } from '../../design-system/tokens/spacing';

interface LogMealSheetProps {
  meal: SavedMeal | null;
  visible: boolean;
  onClose: () => void;
  onLogged?: () => void;
}

export const LogMealSheet: React.FC<LogMealSheetProps> = ({
  meal,
  visible,
  onClose,
  onLogged,
}) => {
  const { theme, language } = useThemeStore();
  const { profile } = useUserStore();
  const t = translations[language];
  const { logMealToTracker, isLogging } = useMealStore();

  const [scaleFactor, setScaleFactor] = useState<number>(1.0);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    (meal?.category === 'custom' ? 'lunch' : (meal?.category as MealType)) || 'lunch'
  );

  const scalePresets = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const mealTypes: Array<{ id: MealType; label_bn: string; label_en: string; icon: React.ReactNode }> = [
    { id: 'breakfast', label_bn: 'সকালের নাশতা', label_en: 'Breakfast', icon: <Sunrise size={16} color={theme.carb} /> },
    { id: 'lunch', label_bn: 'দুপুরের খাবার', label_en: 'Lunch', icon: <Sun size={16} color={theme.primary} /> },
    { id: 'snack', label_bn: 'বিকেলের নাশতা', label_en: 'Snack', icon: <Coffee size={16} color={theme.fat} /> },
    { id: 'dinner', label_bn: 'রাতের খাবার', label_en: 'Dinner', icon: <Sunset size={16} color={theme.accent} /> },
  ];

  const scaledNutrients = useMemo(() => {
    if (!meal) return null;
    return {
      calories: Math.round(meal.nutrition.totalCalories * scaleFactor),
      carbs: Number((meal.nutrition.totalCarbs * scaleFactor).toFixed(1)),
      protein: Number((meal.nutrition.totalProtein * scaleFactor).toFixed(1)),
      fat: Number((meal.nutrition.totalFat * scaleFactor).toFixed(1)),
      fibre: Number((meal.nutrition.totalFibre * scaleFactor).toFixed(1)),
      weight: Math.round(meal.nutrition.totalWeightGrams * scaleFactor),
    };
  }, [meal, scaleFactor]);

  const scaledAlerts = useMemo(() => {
    if (!meal || !profile) return [];
    // Scale items for alert engine
    const scaledItems = meal.items.map((it) => ({
      ...it,
      gramWeight: Math.round(it.gramWeight * scaleFactor),
      carb_g: Number((it.carb_g * scaleFactor).toFixed(1)),
      energy_kcal: Math.round(it.energy_kcal * scaleFactor),
    }));
    return evaluateMealAlerts(
      {
        items: scaledItems,
        nutrition: {
          ...meal.nutrition,
          totalCalories: Math.round(meal.nutrition.totalCalories * scaleFactor),
          totalCarbs: Number((meal.nutrition.totalCarbs * scaleFactor).toFixed(1)),
          totalProtein: Number((meal.nutrition.totalProtein * scaleFactor).toFixed(1)),
          totalFat: Number((meal.nutrition.totalFat * scaleFactor).toFixed(1)),
          totalFibre: Number((meal.nutrition.totalFibre * scaleFactor).toFixed(1)),
          totalSodium: meal.nutrition.totalSodium !== null && meal.nutrition.totalSodium !== undefined
            ? Math.round(meal.nutrition.totalSodium * scaleFactor)
            : null,
          totalPotassium: meal.nutrition.totalPotassium !== null && meal.nutrition.totalPotassium !== undefined
            ? Math.round(meal.nutrition.totalPotassium * scaleFactor)
            : null,
          totalWeightGrams: Math.round(meal.nutrition.totalWeightGrams * scaleFactor),
        },
      },
      profile
    );
  }, [meal, scaleFactor, profile]);

  if (!meal) return null;

  const handleConfirmLog = async () => {
    if (isLogging) return; // duplicate prevention
    const success = await logMealToTracker({
      meal,
      scaleFactor,
      mealType: selectedMealType,
    });
    if (success) {
      onClose();
      if (onLogged) onLogged();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContent, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                {meal.name}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {language === 'bn' ? 'সংরক্ষিত মিল সরাসরি ডায়েরিতে লগ করুন' : 'Log saved meal to daily food tracker'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {/* Meal Time Selector */}
            <Text style={[styles.sectionHeading, { color: theme.text }]}>
              {language === 'bn' ? 'খাবারের সময় (Meal Occasion)' : 'Meal Occasion'}
            </Text>
            <View style={styles.mealTypesRow}>
              {mealTypes.map((m) => {
                const isSelected = selectedMealType === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.mealTypeTab,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.surfaceMuted,
                        borderColor: isSelected ? theme.primary : theme.borderSubtle,
                      },
                    ]}
                    onPress={() => setSelectedMealType(m.id)}
                    activeOpacity={0.8}
                  >
                    {m.icon}
                    <Text
                      style={[
                        styles.mealTypeText,
                        { color: isSelected ? theme.textInverse : theme.text },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {language === 'bn' ? m.label_bn : m.label_en}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Portion Scale Factor Selector */}
            <View style={styles.scaleHeaderRow}>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>
                {language === 'bn' ? 'পরিবেশন অনুপাত (Portion Scale)' : 'Portion Scale'}
              </Text>
              <Text style={[styles.currentScaleText, { color: theme.primary }]}>
                {scaleFactor}x
              </Text>
            </View>

            <View style={styles.scalePresetsRow}>
              {scalePresets.map((sf) => {
                const isSelected = scaleFactor === sf;
                return (
                  <TouchableOpacity
                    key={sf}
                    style={[
                      styles.scaleChip,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.surfaceMuted,
                        borderColor: isSelected ? theme.primary : theme.borderSubtle,
                      },
                    ]}
                    onPress={() => setScaleFactor(sf)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.scaleChipText,
                        { color: isSelected ? theme.textInverse : theme.text },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {sf}x
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Scaled Nutrients Card */}
            {scaledNutrients && (
              <View style={[styles.nutrientsCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle }]}>
                <View style={styles.nutrientsTop}>
                  <Text style={[styles.nutrientsGrams, { color: theme.textSecondary }]}>
                    {language === 'bn'
                      ? `হিসাবকৃত মোট ওজন: ${formatNumber(scaledNutrients.weight, language)} গ্রাম`
                      : `Calculated Weight: ${scaledNutrients.weight}g`}
                  </Text>
                  <Text style={[styles.nutrientsKcal, { color: theme.primary }]}>
                    {formatNumber(scaledNutrients.calories, language)} {t.kcal}
                  </Text>
                </View>

                <View style={styles.macrosRow}>
                  <Text style={[styles.macroItem, { color: theme.carb }]}>
                    C: {formatNumber(scaledNutrients.carbs, language)}g
                  </Text>
                  <Text style={[styles.macroItem, { color: theme.protein }]}>
                    P: {formatNumber(scaledNutrients.protein, language)}g
                  </Text>
                  <Text style={[styles.macroItem, { color: theme.fat }]}>
                    F: {formatNumber(scaledNutrients.fat, language)}g
                  </Text>
                  <Text style={[styles.macroItem, { color: theme.fibre }]}>
                    Fibre: {formatNumber(scaledNutrients.fibre, language)}g
                  </Text>
                </View>
              </View>
            )}

            {/* Warnings if triggered at this scale */}
            {scaledAlerts.length > 0 && (
              <View style={[styles.warningBanner, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                <ShieldAlert size={16} color={theme.criticalAlert} />
                <Text style={[styles.warningText, { color: '#B91C1C' }]}>
                  {language === 'bn'
                    ? `সতর্কতা: এই মিলটি আপনার প্রোফাইলের জন্য ${scaledAlerts.length}টি ক্লিনিক্যাল পর্যবেক্ষণ সক্রিয় করেছে।`
                    : `Notice: This portion activates ${scaledAlerts.length} clinical observation(s).`}
                </Text>
              </View>
            )}

            {/* Components Summary */}
            <Text style={[styles.sectionHeading, { color: theme.text, marginTop: spacing.sm }]}>
              {language === 'bn' ? 'মিলের অন্তর্ভুক্ত পদসমূহ:' : 'Included Food Items:'}
            </Text>
            {meal.items.map((it) => (
              <View key={it.id} style={styles.itemRow}>
                <Text style={[styles.itName, { color: theme.text }]} numberOfLines={1}>
                  • {language === 'bn' ? it.name_bn : it.name_en}
                </Text>
                <Text style={[styles.itWeight, { color: theme.textSecondary }]}>
                  {formatNumber(Math.round(it.gramWeight * scaleFactor), language)}g
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              { backgroundColor: theme.primary, opacity: isLogging ? 0.6 : 1 },
            ]}
            onPress={handleConfirmLog}
            disabled={isLogging}
            activeOpacity={0.8}
          >
            <Check size={18} color={theme.textInverse} />
            <Text style={[styles.confirmBtnText, { color: theme.textInverse }]}>
              {language === 'bn'
                ? `ট্র্যাকারে যোগ করুন (${formatNumber(scaledNutrients?.calories || 0, language)} ক্যালরি)`
                : `Add to Daily Tracker (${scaledNutrients?.calories || 0} kcal)`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    borderTopLeftRadius: radii.cardLarge,
    borderTopRightRadius: radii.cardLarge,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  mealTypesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  mealTypeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scaleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  currentScaleText: {
    fontSize: 14,
    fontWeight: '800',
  },
  scalePresetsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  scaleChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  nutrientsCard: {
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  nutrientsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  nutrientsGrams: {
    fontSize: 12,
    fontWeight: '600',
  },
  nutrientsKcal: {
    fontSize: 18,
    fontWeight: '800',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  macroItem: {
    fontSize: 12,
    fontWeight: '700',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  itName: {
    fontSize: 12,
    flex: 1,
  },
  itWeight: {
    fontSize: 12,
    fontWeight: '600',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radii.pill,
    gap: spacing.xs,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
