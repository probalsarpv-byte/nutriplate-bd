import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, Info, Activity, Flame, ShieldCheck } from 'lucide-react-native';
import { MealNutritionSummary } from '../../types/meal';
import { BentoCard } from '../ui/BentoCard';
import { useThemeStore } from '../../stores/themeStore';
import { formatNumber } from '../../localization/formatters';
import { radii, spacing } from '../../design-system/tokens/spacing';

interface LiveMealNutritionCardProps {
  nutrition: MealNutritionSummary;
}

export const LiveMealNutritionCard: React.FC<LiveMealNutritionCardProps> = ({ nutrition }) => {
  const { theme, language } = useThemeStore();
  const [showMicronutrients, setShowMicronutrients] = useState(false);

  const formatMicro = (val: number | null | undefined, unit: string): string => {
    if (val === null || val === undefined) {
      return language === 'bn' ? 'অপ্রাপ্য' : 'N/A';
    }
    return `${formatNumber(val, language)}${unit}`;
  };

  return (
    <BentoCard variant="elevated" style={styles.card}>
      {/* Top Banner: Calories & Total Weight */}
      <View style={styles.topRow}>
        <View>
          <View style={styles.liveTagRow}>
            <View style={[styles.liveDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.liveTagText, { color: theme.primary }]}>
              {language === 'bn' ? 'লাইভ পুষ্টি হিসাব' : 'Live Meal Nutrition'}
            </Text>
          </View>
          <Text style={[styles.totalKcal, { color: theme.text }]}>
            {formatNumber(nutrition.totalCalories, language)}{' '}
            <Text style={[styles.kcalUnit, { color: theme.textSecondary }]}>kcal</Text>
          </Text>
          <Text style={[styles.weightText, { color: theme.textSecondary }]}>
            {language === 'bn'
              ? `মোট ওজন: ${formatNumber(nutrition.totalWeightGrams, language)} গ্রাম`
              : `Total Weight: ${nutrition.totalWeightGrams}g`}
          </Text>
        </View>

        {/* Data Completeness Badge */}
        <View style={[styles.completenessBadge, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle }]}>
          <ShieldCheck size={14} color={theme.accent} />
          <Text style={[styles.completenessText, { color: theme.text }]}>
            {formatNumber(nutrition.nutrientCompletenessPercent, language)}%{' '}
            <Text style={{ fontSize: 9, color: theme.textSecondary }}>
              {language === 'bn' ? 'ডাটা পূর্ণতা' : 'Complete'}
            </Text>
          </Text>
          {nutrition.glycemicLoad !== null && (
            <Text style={[styles.glText, { color: theme.carb }]}>
              GL: {formatNumber(nutrition.glycemicLoad, language)}
            </Text>
          )}
        </View>
      </View>

      {/* Macronutrient Grid */}
      <View style={[styles.macroGrid, { borderTopColor: theme.borderSubtle, borderBottomColor: theme.borderSubtle }]}>
        <View style={styles.macroCell}>
          <Text style={[styles.macroVal, { color: theme.carb }]}>
            {formatNumber(nutrition.totalCarbs, language)}g
          </Text>
          <Text style={[styles.macroLbl, { color: theme.textSecondary }]}>
            {language === 'bn' ? 'কার্বোহাইড্রেট' : 'Carbs'}
          </Text>
          {nutrition.availableCarbs !== undefined && nutrition.availableCarbs !== null && (
            <Text style={[styles.netCarbSub, { color: theme.textMuted }]}>
              Avail: {formatNumber(nutrition.availableCarbs, language)}g
            </Text>
          )}
        </View>

        <View style={styles.macroCell}>
          <Text style={[styles.macroVal, { color: theme.protein }]}>
            {formatNumber(nutrition.totalProtein, language)}g
          </Text>
          <Text style={[styles.macroLbl, { color: theme.textSecondary }]}>
            {language === 'bn' ? 'প্রোটিন' : 'Protein'}
          </Text>
        </View>

        <View style={styles.macroCell}>
          <Text style={[styles.macroVal, { color: theme.fat }]}>
            {formatNumber(nutrition.totalFat, language)}g
          </Text>
          <Text style={[styles.macroLbl, { color: theme.textSecondary }]}>
            {language === 'bn' ? 'ফ্যাট' : 'Fat'}
          </Text>
        </View>

        <View style={styles.macroCell}>
          <Text style={[styles.macroVal, { color: theme.fibre }]}>
            {formatNumber(nutrition.totalFibre, language)}g
          </Text>
          <Text style={[styles.macroLbl, { color: theme.textSecondary }]}>
            {language === 'bn' ? 'ডায়েটারি আঁশ' : 'Dietary Fibre'}
          </Text>
        </View>
      </View>

      {/* Expandable Micronutrients Section */}
      <TouchableOpacity
        style={styles.expandHeader}
        onPress={() => setShowMicronutrients(!showMicronutrients)}
        activeOpacity={0.7}
      >
        <Text style={[styles.expandTitle, { color: theme.text }]}>
          {language === 'bn' ? 'অত্যাবশ্যকীয় মাইক্রোনিউট্রিয়েন্ট' : 'Essential Micronutrients'}
        </Text>
        {showMicronutrients ? (
          <ChevronUp size={18} color={theme.textSecondary} />
        ) : (
          <ChevronDown size={18} color={theme.textSecondary} />
        )}
      </TouchableOpacity>

      {showMicronutrients && (
        <View style={styles.microGrid}>
          <View style={styles.microRow}>
            <Text style={[styles.microName, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'ক্যালসিয়াম (Calcium)' : 'Calcium'}
            </Text>
            <Text style={[styles.microVal, { color: theme.text }]}>
              {formatMicro(nutrition.totalCalcium, ' mg')}
            </Text>
          </View>
          <View style={styles.microRow}>
            <Text style={[styles.microName, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'আয়রন (Iron)' : 'Iron'}
            </Text>
            <Text style={[styles.microVal, { color: theme.text }]}>
              {formatMicro(nutrition.totalIron, ' mg')}
            </Text>
          </View>
          <View style={styles.microRow}>
            <Text style={[styles.microName, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'সোডিয়াম (Sodium)' : 'Sodium'}
            </Text>
            <Text style={[styles.microVal, { color: theme.text }]}>
              {formatMicro(nutrition.totalSodium, ' mg')}
            </Text>
          </View>
          <View style={styles.microRow}>
            <Text style={[styles.microName, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'পটাশিয়াম (Potassium)' : 'Potassium'}
            </Text>
            <Text style={[styles.microVal, { color: theme.text }]}>
              {formatMicro(nutrition.totalPotassium, ' mg')}
            </Text>
          </View>
          <View style={styles.microRow}>
            <Text style={[styles.microName, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'জিঙ্ক (Zinc)' : 'Zinc'}
            </Text>
            <Text style={[styles.microVal, { color: theme.text }]}>
              {formatMicro(nutrition.totalZinc, ' mg')}
            </Text>
          </View>
          <View style={styles.microRow}>
            <Text style={[styles.microName, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'ভিটামিন সি (Vitamin C)' : 'Vitamin C'}
            </Text>
            <Text style={[styles.microVal, { color: theme.text }]}>
              {formatMicro(nutrition.totalVitaminC, ' mg')}
            </Text>
          </View>
          <View style={styles.microRow}>
            <Text style={[styles.microName, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'ফোলেট (Folate)' : 'Folate'}
            </Text>
            <Text style={[styles.microVal, { color: theme.text }]}>
              {formatMicro(nutrition.totalFolate, ' mcg')}
            </Text>
          </View>

          <View style={[styles.scientificNoticeBox, { backgroundColor: theme.surfaceMuted }]}>
            <Info size={13} color={theme.textMuted} />
            <Text style={[styles.scientificNoticeText, { color: theme.textMuted }]}>
              {language === 'bn'
                ? 'অনুপস্থিত বা অপরীক্ষিত পুষ্টি উপাত্ত কখনো শূন্য (০) হিসেবে গণ্য করা হয় না। প্রকৃত বৈজ্ঞানিক ডাটাবেজ মান বজায় রাখা হয়েছে।'
                : 'Unanalyzed micronutrients are preserved as missing rather than assumed zero.'}
            </Text>
          </View>
        </View>
      )}
    </BentoCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  liveTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  liveTagText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalKcal: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  kcalUnit: {
    fontSize: 15,
    fontWeight: '600',
  },
  weightText: {
    fontSize: 12,
    marginTop: 2,
  },
  completenessBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  completenessText: {
    fontSize: 12,
    fontWeight: '700',
  },
  glText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: spacing.xs,
  },
  macroCell: {
    alignItems: 'center',
    flex: 1,
  },
  macroVal: {
    fontSize: 16,
    fontWeight: '700',
  },
  macroLbl: {
    fontSize: 11,
    marginTop: 2,
  },
  netCarbSub: {
    fontSize: 9,
    marginTop: 1,
  },
  expandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  expandTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  microGrid: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  microRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  microName: {
    fontSize: 12,
  },
  microVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  scientificNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: spacing.xs + 2,
    borderRadius: radii.sm,
    marginTop: spacing.sm,
  },
  scientificNoticeText: {
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
});
