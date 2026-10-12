import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Plus, 
  Utensils, 
  ChefHat, 
  Users, 
  Disc, 
  Leaf, 
  Activity, 
  Flame, 
  AlertTriangle,
  ChevronRight,
  TrendingUp
} from 'lucide-react-native';
import { PremiumScreen } from '../../src/components/ui/PremiumScreen';
import { PremiumHeader } from '../../src/components/ui/PremiumHeader';
import { BentoCard } from '../../src/components/ui/BentoCard';
import { NutritionRing } from '../../src/components/ui/NutritionRing';
import { NutrientProgressBar } from '../../src/components/ui/NutrientProgressBar';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { useThemeStore } from '../../src/stores/themeStore';
import { useUserStore } from '../../src/stores/userStore';
import { useDiaryStore } from '../../src/stores/diaryStore';
import { formatNumber, formatEnergy } from '../../src/localization/formatters';
import { translations } from '../../src/localization/translations';
import { radii, spacing } from '../../src/design-system/tokens/spacing';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, language } = useThemeStore();
  const t = translations[language];

  const { profile, calorieTarget, carbTargetGrams, proteinTargetGrams, fatTargetGrams, fibreTargetGrams } = useUserStore();
  const { 
    consumedCalories, 
    consumedCarbs, 
    consumedProtein, 
    consumedFat, 
    consumedFibre, 
    weeklyUniquePlantsCount,
    entries 
  } = useDiaryStore();

  const plantMilestoneTarget = 25;
  const plantProgress = Math.min(1, weeklyUniquePlantsCount / plantMilestoneTarget);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.greetingMorning : hour < 17 ? t.greetingAfternoon : t.greetingEvening;

  return (
    <PremiumScreen>
      {/* Header */}
      <PremiumHeader
        title={`${greeting}, ${profile.name}`}
        subtitle={language === 'bn' ? 'আজকের পুষ্টি ও স্বাস্থ্য সমন্বয়' : "Today's Nutritional Balance"}
      />

      {/* 1. Hero Calorie Balance Card (Bento Master) */}
      <BentoCard variant="elevated" style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.heroTextColumn}>
            <View style={styles.badgeRow}>
              <View style={[styles.modeBadge, { backgroundColor: theme.primaryLight + '33' }]}>
                <Flame size={12} color={theme.primary} />
                <Text style={[styles.modeBadgeText, { color: theme.primary }]}>
                  {profile.energyMode === 'reduction'
                    ? (language === 'bn' ? 'পরিমিত ঘাটতি মোড' : 'Moderate Deficit')
                    : (language === 'bn' ? 'রক্ষণাবেক্ষণ মোড' : 'Maintenance')}
                </Text>
              </View>
            </View>

            <Text style={[styles.heroHeading, { color: theme.text }]}>
              {t.energySummary}
            </Text>

            <View style={styles.targetStatRow}>
              <View>
                <Text style={[styles.statSublabel, { color: theme.textSecondary }]}>
                  {t.target}
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatNumber(calorieTarget, language, { maximumFractionDigits: 0 })}
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: theme.borderSubtle }]} />

              <View>
                <Text style={[styles.statSublabel, { color: theme.textSecondary }]}>
                  {t.consumed}
                </Text>
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {formatNumber(consumedCalories, language, { maximumFractionDigits: 0 })}
                </Text>
              </View>
            </View>
          </View>

          {/* Circular SVG Nutrition Ring */}
          <NutritionRing
            current={consumedCalories}
            target={calorieTarget}
            size={135}
            strokeWidth={13}
          />
        </View>
      </BentoCard>

      {/* 2. Macronutrient Status Card */}
      <BentoCard>
        <SectionHeader
          title={language === 'bn' ? 'ম্যাক্রোনিউট্রিয়েন্ট বিভাজন' : 'Macronutrient Status'}
        />

        <NutrientProgressBar
          label={t.carbs}
          currentGrams={consumedCarbs}
          targetGrams={carbTargetGrams}
          color={theme.carb}
          backgroundColor={theme.carbLight}
        />

        <NutrientProgressBar
          label={t.protein}
          currentGrams={consumedProtein}
          targetGrams={proteinTargetGrams}
          color={theme.protein}
          backgroundColor={theme.proteinLight}
        />

        <NutrientProgressBar
          label={t.fat}
          currentGrams={consumedFat}
          targetGrams={fatTargetGrams}
          color={theme.fat}
          backgroundColor={theme.fatLight}
        />

        <NutrientProgressBar
          label={t.fibre}
          currentGrams={consumedFibre}
          targetGrams={fibreTargetGrams}
          color={theme.fibre}
          backgroundColor={theme.fibreLight}
        />
      </BentoCard>

      {/* 3. Smart Meal Maker Featured Banner */}
      <TouchableOpacity
        style={[styles.mealMakerBanner, { backgroundColor: theme.surface, borderColor: theme.primary }]}
        onPress={() => router.push('/meal')}
        activeOpacity={0.7}
      >
        <View style={styles.mealMakerLeft}>
          <View style={[styles.mealMakerIconBox, { backgroundColor: theme.primaryLight + '26' }]}>
            <Utensils size={20} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.mealMakerTitle, { color: theme.text }]}>
              {language === 'bn' ? 'স্মার্ট মিল মেকার' : 'Smart Meal Maker'}
            </Text>
            <Text style={[styles.mealMakerSub, { color: theme.textSecondary }]}>
              {language === 'bn'
                ? 'কাঁচা ও রান্না খাবার মিলিয়ে নিজের সুষম মিল তৈরি করুন'
                : 'Combine foods & recipes into a complete meal plate'}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color={theme.primary} />
      </TouchableOpacity>

      {/* 4. Quick Action Dock */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        {language === 'bn' ? 'অন্যান্য কর্মতালিকা' : 'Quick Actions'}
      </Text>
      <View style={styles.quickActionGrid}>
        <TouchableOpacity
          style={[styles.actionTile, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}
          onPress={() => router.push('/food/search')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: theme.primaryLight + '26' }]}>
            <Plus size={20} color={theme.primary} />
          </View>
          <Text style={[styles.actionLabel, { color: theme.text }]}>{t.quickAddFood}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionTile, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}
          onPress={() => router.push('/recipe/new')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: theme.accent + '26' }]}>
            <ChefHat size={20} color={theme.accent} />
          </View>
          <Text style={[styles.actionLabel, { color: theme.text }]}>{t.quickCreateRecipe}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionTile, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}
          onPress={() => router.push('/family-pot')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: theme.fat + '26' }]}>
            <Users size={20} color={theme.fat} />
          </View>
          <Text style={[styles.actionLabel, { color: theme.text }]}>{t.quickFamilyPot}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionTile, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}
          onPress={() => router.push('/smart-plate')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: theme.carb + '26' }]}>
            <Disc size={20} color={theme.carb} />
          </View>
          <Text style={[styles.actionLabel, { color: theme.text }]}>{t.quickSmartPlate}</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Plant Diversity & Rainbow Index Widget */}
      <BentoCard style={styles.diversityCard}>
        <View style={styles.diversityHeaderRow}>
          <View style={styles.diversityTitleWithIcon}>
            <View style={[styles.leafIconBox, { backgroundColor: theme.fibreLight }]}>
              <Leaf size={18} color={theme.fibre} />
            </View>
            <View>
              <Text style={[styles.diversityTitle, { color: theme.text }]}>
                {t.plantDiversityTitle}
              </Text>
              <Text style={[styles.diversitySubtitle, { color: theme.textSecondary }]}>
                {t.plantDiversitySub}
              </Text>
            </View>
          </View>
          <Text style={[styles.plantCounterText, { color: theme.fibre }]}>
            {formatNumber(weeklyUniquePlantsCount, language)}/{formatNumber(plantMilestoneTarget, language)}
          </Text>
        </View>

        <View style={[styles.diversityTrack, { backgroundColor: theme.borderSubtle }]}>
          <View
            style={[
              styles.diversityFill,
              {
                width: `${Math.round(plantProgress * 100)}%`,
                backgroundColor: theme.fibre,
              },
            ]}
          />
        </View>
      </BentoCard>

      {/* 5. Recent Logged Meals Activity */}
      <SectionHeader
        title={t.recentActivity}
        actionText={t.viewAll}
        onActionPress={() => router.push('/tracker')}
      />

      {entries.slice(0, 4).map((entry) => (
        <View
          key={entry.id}
          style={[
            styles.entryRow,
            { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
          ]}
        >
          <View style={styles.entryLeft}>
            <Text style={[styles.entryName, { color: theme.text }]}>
              {language === 'bn' ? entry.name_bn : entry.name_en}
            </Text>
            <Text style={[styles.entryMeta, { color: theme.textSecondary }]}>
              {entry.quantity} {entry.unit} ({entry.gramWeight}g) · {entry.mealType}
            </Text>
          </View>
          <View style={styles.entryRight}>
            <Text style={[styles.entryKcal, { color: theme.primary }]}>
              {formatNumber(entry.energy_kcal, language)} {t.kcal}
            </Text>
          </View>
        </View>
      ))}
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    padding: spacing.md + 4,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextColumn: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  targetStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statSublabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  mealMakerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1.5,
    marginTop: spacing.md,
  },
  mealMakerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  mealMakerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealMakerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  mealMakerSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  quickActionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  actionTile: {
    flex: 1,
    marginHorizontal: 3,
    borderRadius: radii.card,
    paddingVertical: spacing.md,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  diversityCard: {
    marginBottom: spacing.md,
  },
  diversityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  diversityTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  leafIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diversityTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  diversitySubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  plantCounterText: {
    fontSize: 15,
    fontWeight: '700',
  },
  diversityTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  diversityFill: {
    height: '100%',
    borderRadius: 3,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    marginVertical: spacing.xs,
  },
  entryLeft: {
    flex: 1,
  },
  entryName: {
    fontSize: 14,
    fontWeight: '700',
  },
  entryMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  entryRight: {
    alignItems: 'flex-end',
  },
  entryKcal: {
    fontSize: 14,
    fontWeight: '700',
  },
});
