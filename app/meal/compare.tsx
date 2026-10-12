import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { GitCompare, ArrowRightLeft, ShieldAlert, CheckCircle2, ChevronRight, Info } from 'lucide-react-native';
import { PremiumScreen } from '../../src/components/ui/PremiumScreen';
import { PremiumHeader } from '../../src/components/ui/PremiumHeader';
import { BentoCard } from '../../src/components/ui/BentoCard';
import { AlertCard } from '../../src/components/alerts/AlertCard';
import { useThemeStore } from '../../src/stores/themeStore';
import { useUserStore } from '../../src/stores/userStore';
import { useMealStore } from '../../src/stores/mealStore';
import { compareMeals } from '../../src/engines/meal/mealEngine';
import { formatNumber } from '../../src/localization/formatters';
import { translations } from '../../src/localization/translations';
import { radii, spacing } from '../../src/design-system/tokens/spacing';

export default function MealComparisonScreen() {
  const router = useRouter();
  const { theme, language } = useThemeStore();
  const { profile } = useUserStore();
  const t = translations[language];

  const { savedMeals } = useMealStore();

  const [selectedMealAId, setSelectedMealAId] = useState<string>(
    savedMeals[0]?.id || ''
  );
  const [selectedMealBId, setSelectedMealBId] = useState<string>(
    savedMeals[1]?.id || savedMeals[0]?.id || ''
  );

  const mealA = useMemo(() => savedMeals.find((m) => m.id === selectedMealAId), [savedMeals, selectedMealAId]);
  const mealB = useMemo(() => savedMeals.find((m) => m.id === selectedMealBId), [savedMeals, selectedMealBId]);

  const comparison = useMemo(() => {
    if (!mealA || !mealB || !profile) return null;
    return compareMeals(mealA, mealB, profile);
  }, [mealA, mealB, profile]);

  if (savedMeals.length < 2) {
    return (
      <PremiumScreen>
        <PremiumHeader
          title={language === 'bn' ? 'মিল তুলনা' : 'Meal Comparison'}
          subtitle={language === 'bn' ? 'দুটি মিলের পুষ্টিগত তারতম্য বিশ্লেষণ' : 'Comparative Nutritional Analysis'}
          showBack
        />
        <BentoCard style={styles.insufficientCard}>
          <GitCompare size={36} color={theme.textMuted} />
          <Text style={[styles.insufficientTitle, { color: theme.text }]}>
            {language === 'bn' ? 'তুলনার জন্য অন্তত ২টি মিল প্রয়োজন' : 'At Least 2 Meals Required'}
          </Text>
          <Text style={[styles.insufficientSub, { color: theme.textSecondary }]}>
            {language === 'bn'
              ? 'তুলনা করতে প্রথমে স্মার্ট মিল মেকার ব্যবহার করে অন্তত দুটি ভিন্ন মিল সংরক্ষণ করুন।'
              : 'Please compose and save at least two custom meals to run side-by-side comparative analysis.'}
          </Text>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/meal/new')}
          >
            <Text style={[styles.createBtnText, { color: theme.textInverse }]}>
              {language === 'bn' ? 'নতুন মিল তৈরি করুন' : 'Create New Meal'}
            </Text>
          </TouchableOpacity>
        </BentoCard>
      </PremiumScreen>
    );
  }

  return (
    <PremiumScreen>
      <PremiumHeader
        title={language === 'bn' ? 'মিল তুলনা' : 'Meal Comparison'}
        subtitle={language === 'bn' ? 'দুটি মিলের পুষ্টিগত তারতম্য বিশ্লেষণ' : 'Side-by-side Nutritional Comparison'}
        showBack
      />

      {/* Selectors for Meal A and Meal B */}
      <BentoCard style={styles.selectorCard}>
        <View style={styles.selectorRow}>
          {/* Meal A Selector */}
          <View style={styles.selectorCol}>
            <Text style={[styles.colBadge, { color: theme.primary }]}>
              {language === 'bn' ? 'মিল (ক)' : 'Meal (A)'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerStrip}>
              {savedMeals.map((m) => {
                const isSelected = m.id === selectedMealAId;
                return (
                  <TouchableOpacity
                    key={`A_${m.id}`}
                    style={[
                      styles.pickChip,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.surfaceMuted,
                        borderColor: isSelected ? theme.primary : theme.borderSubtle,
                      },
                    ]}
                    onPress={() => setSelectedMealAId(m.id)}
                  >
                    <Text
                      style={[
                        styles.pickChipText,
                        { color: isSelected ? theme.textInverse : theme.text },
                        isSelected && { fontWeight: '700' },
                      ]}
                      numberOfLines={1}
                    >
                      {m.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Meal B Selector */}
          <View style={[styles.selectorCol, { marginTop: spacing.sm }]}>
            <Text style={[styles.colBadge, { color: theme.accent }]}>
              {language === 'bn' ? 'মিল (খ)' : 'Meal (B)'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerStrip}>
              {savedMeals.map((m) => {
                const isSelected = m.id === selectedMealBId;
                return (
                  <TouchableOpacity
                    key={`B_${m.id}`}
                    style={[
                      styles.pickChip,
                      {
                        backgroundColor: isSelected ? theme.accent : theme.surfaceMuted,
                        borderColor: isSelected ? theme.accent : theme.borderSubtle,
                      },
                    ]}
                    onPress={() => setSelectedMealBId(m.id)}
                  >
                    <Text
                      style={[
                        styles.pickChipText,
                        { color: isSelected ? '#FFFFFF' : theme.text },
                        isSelected && { fontWeight: '700' },
                      ]}
                      numberOfLines={1}
                    >
                      {m.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </BentoCard>

      {comparison && mealA && mealB && (
        <>
          {/* Side by Side Key Summary Cards */}
          <View style={styles.dualSummaryRow}>
            <View style={[styles.dualCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
              <Text style={[styles.dualCardTag, { color: theme.primary }]}>Meal A</Text>
              <Text style={[styles.dualCardName, { color: theme.text }]} numberOfLines={1}>
                {mealA.name}
              </Text>
              <Text style={[styles.dualCardKcal, { color: theme.primary }]}>
                {formatNumber(mealA.nutrition.totalCalories, language)} {t.kcal}
              </Text>
              <Text style={[styles.dualCardWeight, { color: theme.textSecondary }]}>
                {mealA.nutrition.totalWeightGrams}g · {mealA.items.length} items
              </Text>
            </View>

            <View style={[styles.dualCard, { backgroundColor: theme.surface, borderColor: theme.accent }]}>
              <Text style={[styles.dualCardTag, { color: theme.accent }]}>Meal B</Text>
              <Text style={[styles.dualCardName, { color: theme.text }]} numberOfLines={1}>
                {mealB.name}
              </Text>
              <Text style={[styles.dualCardKcal, { color: theme.accent }]}>
                {formatNumber(mealB.nutrition.totalCalories, language)} {t.kcal}
              </Text>
              <Text style={[styles.dualCardWeight, { color: theme.textSecondary }]}>
                {mealB.nutrition.totalWeightGrams}g · {mealB.items.length} items
              </Text>
            </View>
          </View>

          {/* Metrics Comparison Table */}
          <BentoCard style={styles.metricsCard}>
            <Text style={[styles.tableTitle, { color: theme.text }]}>
              {language === 'bn' ? 'পুষ্টি উপাত্তের তারতম্য সূচক' : 'Nutritional Difference Index'}
            </Text>

            <View style={[styles.tableHeader, { borderBottomColor: theme.borderSubtle }]}>
              <Text style={[styles.thCell, styles.thName, { color: theme.textSecondary }]}>
                {language === 'bn' ? 'উপাদান' : 'Nutrient'}
              </Text>
              <Text style={[styles.thCell, { color: theme.primary, textAlign: 'center' }]}>Meal A</Text>
              <Text style={[styles.thCell, { color: theme.accent, textAlign: 'center' }]}>Meal B</Text>
              <Text style={[styles.thCell, { color: theme.textSecondary, textAlign: 'right' }]}>Diff (B-A)</Text>
            </View>

            {comparison.metrics.map((metric) => {
              const diffText =
                metric.diff === null
                  ? 'N/A'
                  : metric.diff > 0
                  ? `+${formatNumber(metric.diff, language)}`
                  : `${formatNumber(metric.diff, language)}`;

              return (
                <View key={metric.key} style={[styles.tableRow, { borderBottomColor: theme.borderSubtle }]}>
                  <Text style={[styles.tdCell, styles.thName, { color: theme.text }]}>
                    {language === 'bn' ? metric.label_bn : metric.label_en}
                  </Text>
                  <Text style={[styles.tdCell, { color: theme.text, textAlign: 'center' }]}>
                    {metric.valA !== null ? `${formatNumber(metric.valA, language)}${metric.unit}` : 'N/A'}
                  </Text>
                  <Text style={[styles.tdCell, { color: theme.text, textAlign: 'center' }]}>
                    {metric.valB !== null ? `${formatNumber(metric.valB, language)}${metric.unit}` : 'N/A'}
                  </Text>
                  <Text
                    style={[
                      styles.tdCell,
                      {
                        textAlign: 'right',
                        fontWeight: '700',
                        color:
                          metric.diff === null
                            ? theme.textMuted
                            : metric.diff > 0
                            ? theme.primary
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    {diffText}
                  </Text>
                </View>
              );
            })}
          </BentoCard>

          {/* Contextual Health Observations (Non-Judgmental) */}
          {comparison.contextualObservations.length > 0 && (
            <BentoCard style={styles.observationsCard}>
              <View style={styles.obsHeader}>
                <Info size={17} color={theme.accent} />
                <Text style={[styles.obsHeaderTitle, { color: theme.text }]}>
                  {language === 'bn' ? 'স্বাস্থ্য প্রেক্ষাপট ও ক্লিনিক্যাল পর্যবেক্ষণ' : 'Contextual Health Observations'}
                </Text>
              </View>

              {comparison.contextualObservations.map((obs, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.obsItem,
                    { borderTopColor: theme.borderSubtle, borderTopWidth: idx > 0 ? 1 : 0 },
                  ]}
                >
                  <Text style={[styles.obsTitle, { color: theme.text }]}>
                    {language === 'bn' ? obs.title_bn : obs.title_en}
                  </Text>
                  <Text style={[styles.obsDesc, { color: theme.textSecondary }]}>
                    {language === 'bn' ? obs.description_bn : obs.description_en}
                  </Text>
                </View>
              ))}
            </BentoCard>
          )}

          {/* Comparative Disease Alerts */}
          {(comparison.alertsA.length > 0 || comparison.alertsB.length > 0) && (
            <BentoCard style={styles.alertsCompCard}>
              <View style={styles.obsHeader}>
                <ShieldAlert size={17} color={theme.criticalAlert} />
                <Text style={[styles.obsHeaderTitle, { color: theme.text }]}>
                  {language === 'bn' ? 'সতর্কতা তুলনা' : 'Pathology Alerts Comparison'}
                </Text>
              </View>

              {comparison.alertsA.length > 0 && (
                <View style={{ marginTop: spacing.xs }}>
                  <Text style={[styles.alertSubheading, { color: theme.primary }]}>
                    Meal A ({mealA.name}) — {comparison.alertsA.length} {language === 'bn' ? 'টি পর্যবেক্ষণ' : 'alert(s)'}
                  </Text>
                  {comparison.alertsA.map((a) => (
                    <AlertCard key={`a_${a.id}`} alert={a} />
                  ))}
                </View>
              )}

              {comparison.alertsB.length > 0 && (
                <View style={{ marginTop: spacing.sm }}>
                  <Text style={[styles.alertSubheading, { color: theme.accent }]}>
                    Meal B ({mealB.name}) — {comparison.alertsB.length} {language === 'bn' ? 'টি পর্যবেক্ষণ' : 'alert(s)'}
                  </Text>
                  {comparison.alertsB.map((b) => (
                    <AlertCard key={`b_${b.id}`} alert={b} />
                  ))}
                </View>
              )}
            </BentoCard>
          )}
        </>
      )}
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  insufficientCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  insufficientTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  insufficientSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  createBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  selectorCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  selectorRow: {
    gap: spacing.xs,
  },
  selectorCol: {
    width: '100%',
  },
  colBadge: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  pickerStrip: {
    flexDirection: 'row',
  },
  pickChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginRight: spacing.xs,
    maxWidth: 200,
  },
  pickChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dualSummaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dualCard: {
    flex: 1,
    borderRadius: radii.card,
    borderWidth: 1.5,
    padding: spacing.md,
  },
  dualCardTag: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dualCardName: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  dualCardKcal: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  dualCardWeight: {
    fontSize: 11,
    marginTop: 2,
  },
  metricsCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  thCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  thName: {
    flex: 1.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  tdCell: {
    flex: 1,
    fontSize: 12,
  },
  observationsCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  obsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  obsHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  obsItem: {
    paddingVertical: spacing.sm,
  },
  obsTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  obsDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  alertsCompCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  alertSubheading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
});
