import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldAlert, Info, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { PremiumScreen } from '../../src/components/ui/PremiumScreen';
import { PremiumHeader } from '../../src/components/ui/PremiumHeader';
import { BentoCard } from '../../src/components/ui/BentoCard';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { NutrientProgressBar } from '../../src/components/ui/NutrientProgressBar';
import { AlertCard } from '../../src/components/alerts/AlertCard';
import { useThemeStore } from '../../src/stores/themeStore';
import { useUserStore } from '../../src/stores/userStore';
import { useDiaryStore } from '../../src/stores/diaryStore';
import { foodDatabaseAdapter } from '../../src/database/adapters/FoodDatabaseAdapter';
import { evaluateFoodAlerts } from '../../src/engines/pathology/alertEngine';
import { ClinicalFoodAlert } from '../../src/types/alerts';
import { formatNumber } from '../../src/localization/formatters';
import { translations } from '../../src/localization/translations';
import { radii, spacing } from '../../src/design-system/tokens/spacing';

export default function InsightsScreen() {
  const { theme, language } = useThemeStore();
  const t = translations[language];

  const { profile, calorieTarget } = useUserStore();
  const { 
    consumedCalories, 
    consumedCarbs, 
    consumedProtein, 
    consumedFat, 
    consumedFibre, 
    consumedCalcium,
    consumedIron,
    consumedSodium,
    consumedPotassium,
    weeklyUniquePlantsCount,
    entries 
  } = useDiaryStore();

  // Aggregate today's active clinical alerts across all logged foods
  const activeAlerts = React.useMemo<ClinicalFoodAlert[]>(() => {
    const list: ClinicalFoodAlert[] = [];
    const seenIds = new Set<string>();

    entries.forEach((entry) => {
      const food = foodDatabaseAdapter.getFoodByCode(entry.foodCode);
      if (food) {
        const itemAlerts = evaluateFoodAlerts(food, entry.gramWeight, profile);
        itemAlerts.forEach((a: ClinicalFoodAlert) => {
          if (!seenIds.has(a.id)) {
            seenIds.add(a.id);
            list.push(a);
          }
        });
      }
    });
    return list;
  }, [entries, profile]);

  const totalMacroKcal = consumedCarbs * 4 + consumedProtein * 4 + consumedFat * 9;
  const carbPercent = totalMacroKcal > 0 ? Math.round(((consumedCarbs * 4) / totalMacroKcal) * 100) : 0;
  const proteinPercent = totalMacroKcal > 0 ? Math.round(((consumedProtein * 4) / totalMacroKcal) * 100) : 0;
  const fatPercent = totalMacroKcal > 0 ? Math.round(((consumedFat * 9) / totalMacroKcal) * 100) : 0;

  return (
    <PremiumScreen>
      <PremiumHeader
        title={t.tabInsights}
        subtitle={language === 'bn' ? 'দৈনিক পুষ্টি মান ও ক্লিনিক্যাল পর্যবেক্ষণ' : 'Nutrient Adequacy & Clinical Observations'}
      />

      {/* Energy & Macro Percentage Distribution */}
      <BentoCard>
        <SectionHeader
          title={language === 'bn' ? 'শক্তি বণ্টন ও ম্যাক্রো অনুপাত' : 'Energy & Macro Distribution'}
        />
        <View style={styles.macroRatioBar}>
          <View style={[styles.macroSegment, { flex: carbPercent || 1, backgroundColor: theme.carb }]} />
          <View style={[styles.macroSegment, { flex: proteinPercent || 1, backgroundColor: theme.protein }]} />
          <View style={[styles.macroSegment, { flex: fatPercent || 1, backgroundColor: theme.fat }]} />
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.carb }]} />
            <Text style={[styles.legendText, { color: theme.text }]}>
              {t.carbs} {formatNumber(carbPercent, language)}%
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.protein }]} />
            <Text style={[styles.legendText, { color: theme.text }]}>
              {t.protein} {formatNumber(proteinPercent, language)}%
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.fat }]} />
            <Text style={[styles.legendText, { color: theme.text }]}>
              {t.fat} {formatNumber(fatPercent, language)}%
            </Text>
          </View>
        </View>
      </BentoCard>

      {/* Dietary Fibre & Plant Diversity */}
      <BentoCard>
        <SectionHeader
          title={language === 'bn' ? 'ডায়েটারি ফাইবার ও মাইক্রোবায়োম' : 'Dietary Fibre & Gut Microbiome'}
        />
        <NutrientProgressBar
          label={t.fibre}
          currentGrams={consumedFibre}
          targetGrams={28}
          color={theme.fibre}
          backgroundColor={theme.fibreLight}
        />
        <Text style={[styles.fibreNote, { color: theme.textSecondary }]}>
          {language === 'bn'
            ? 'প্রতি ১০০০ ক্যালরির জন্য প্রায় ১৪ গ্রাম আঁশ গ্রহণ পরিপাকতন্ত্র ও গ্লুকোজ নিয়ন্ত্রণের জন্য সহায়ক।'
            : 'Aiming for 14g fibre per 1000 kcal supports glycemic control and healthy digestion.'}
        </Text>
      </BentoCard>

      {/* Micronutrient Adequacy Card */}
      <BentoCard>
        <SectionHeader
          title={language === 'bn' ? 'মাইক্রোনিউট্রিয়েন্ট ও খনিজ লবণ' : 'Micronutrient Adequacy'}
        />
        <View style={styles.microGrid}>
          <View style={styles.microCell}>
            <Text style={[styles.microVal, { color: theme.text }]}>
              {formatNumber(consumedCalcium, language, { maximumFractionDigits: 0 })}
            </Text>
            <Text style={[styles.microLabel, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'ক্যালসিয়াম (mg)' : 'Calcium (mg)'}
            </Text>
            <Text style={[styles.microRda, { color: theme.textMuted }]}>RDA: 1000</Text>
          </View>

          <View style={styles.microCell}>
            <Text style={[styles.microVal, { color: theme.text }]}>
              {formatNumber(consumedIron, language, { maximumFractionDigits: 1 })}
            </Text>
            <Text style={[styles.microLabel, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'আয়রন (mg)' : 'Iron (mg)'}
            </Text>
            <Text style={[styles.microRda, { color: theme.textMuted }]}>RDA: 18</Text>
          </View>

          <View style={styles.microCell}>
            <Text style={[styles.microVal, { color: theme.text }]}>
              {formatNumber(consumedSodium, language, { maximumFractionDigits: 0 })}
            </Text>
            <Text style={[styles.microLabel, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'সোডিয়াম (mg)' : 'Sodium (mg)'}
            </Text>
            <Text style={[styles.microRda, { color: theme.textMuted }]}>Max: 2000</Text>
          </View>
        </View>
      </BentoCard>

      {/* Pathology-Aware Alerts Section */}
      <SectionHeader
        title={t.clinicalAlerts}
      />

      {activeAlerts.length === 0 ? (
        <BentoCard style={styles.noAlertsCard}>
          <CheckCircle2 size={24} color={theme.accent} />
          <Text style={[styles.noAlertsText, { color: theme.text }]}>
            {t.noAlerts}
          </Text>
        </BentoCard>
      ) : (
        activeAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))
      )}

      {/* Scientific Transparency Disclaimer */}
      <View style={[styles.disclaimerBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle }]}>
        <Info size={16} color={theme.textMuted} />
        <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
          {language === 'bn'
            ? 'এই বিশ্লেষণ বাংলাদেশ ফুড কম্পোজিশন টেবিল (INFS, ঢা.বি ২০১৩) এর রাসায়নিক বিশ্লেষণের ওপর নির্ভরশীল। এটি চিকিৎসকের প্রত্যক্ষ ব্যবস্থাপত্র নয়।'
            : 'Analyses are based on the Food Composition Table for Bangladesh (2013, INFS/CARS, University of Dhaka). Not a medical prescription.'}
        </Text>
      </View>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  macroRatioBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  macroSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fibreNote: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  noAlertsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  noAlertsText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  microGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  microCell: {
    alignItems: 'center',
    flex: 1,
  },
  microVal: {
    fontSize: 18,
    fontWeight: '700',
  },
  microLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  microRda: {
    fontSize: 10,
    marginTop: 2,
  },
});
