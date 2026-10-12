import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { 
  User, 
  Activity, 
  Flame, 
  Heart, 
  ShieldCheck, 
  Check, 
  Moon, 
  Sun, 
  Globe 
} from 'lucide-react-native';
import { PremiumScreen } from '../../src/components/ui/PremiumScreen';
import { PremiumHeader } from '../../src/components/ui/PremiumHeader';
import { BentoCard } from '../../src/components/ui/BentoCard';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { useThemeStore } from '../../src/stores/themeStore';
import { useUserStore } from '../../src/stores/userStore';
import { formatNumber } from '../../src/localization/formatters';
import { translations } from '../../src/localization/translations';
import { HealthConditionId, ActivityLevel, EnergyMode } from '../../src/types/user';
import { radii, spacing } from '../../src/design-system/tokens/spacing';

export default function ProfileScreen() {
  const { theme, isDarkMode, toggleTheme, language, setLanguage } = useThemeStore();
  const t = translations[language];

  const { 
    profile, 
    updateProfile, 
    toggleCondition, 
    bmr, 
    tdee, 
    calorieTarget, 
    carbTargetGrams, 
    proteinTargetGrams, 
    fatTargetGrams,
    safetyWarnings 
  } = useUserStore();

  const healthConditionsList: Array<{ id: HealthConditionId; name_bn: string; name_en: string }> = [
    { id: 't2_diabetes', name_bn: 'টাইপ-২ ডায়াবেটিস', name_en: 'Type 2 Diabetes' },
    { id: 'hypertension', name_bn: 'উচ্চ রক্তচাপ (Hypertension)', name_en: 'Hypertension' },
    { id: 'ckd', name_bn: 'ক্রনিক কিডনি ডিজিজ (CKD)', name_en: 'Chronic Kidney Disease' },
    { id: 'kidney_stones', name_bn: 'ক্যালসিয়াম-অক্সালেট কিডনি পাথর', name_en: 'Kidney Stones' },
    { id: 'gout', name_bn: 'গাউট / ইউরিক অ্যাসিড', name_en: 'Gout / Hyperuricemia' },
    { id: 'celiac', name_bn: 'সিলিয়াক ডিজিজ (Celiac)', name_en: 'Celiac Disease' },
    { id: 'lactose_intolerance', name_bn: 'ল্যাকটোজ অসহিষ্ণুতা', name_en: 'Lactose Intolerance' },
    { id: 'food_allergies', name_bn: 'খাদ্য অ্যালার্জি (Allergy)', name_en: 'Food Allergy' },
  ];

  return (
    <PremiumScreen>
      <PremiumHeader
        title={t.tabProfile}
        subtitle={language === 'bn' ? 'শারীরিক মাপ ও ক্লিনিক্যাল প্রোফাইল' : 'Biometrics & Clinical Profile'}
      />

      {/* Biometrics & Energy Engine Readout */}
      <BentoCard variant="elevated">
        <View style={styles.profileHeaderRow}>
          <View style={[styles.avatarBox, { backgroundColor: theme.primaryLight + '26' }]}>
            <User size={24} color={theme.primary} />
          </View>
          <View style={styles.avatarTextColumn}>
            <Text style={[styles.userName, { color: theme.text }]}>{profile.name}</Text>
            <Text style={[styles.userMeta, { color: theme.textSecondary }]}>
              {profile.age} {language === 'bn' ? 'বছর' : 'yrs'} · {profile.sex === 'male' ? (language === 'bn' ? 'পুরুষ' : 'Male') : (language === 'bn' ? 'মহিলা' : 'Female')} · {profile.heightCm} cm · {profile.weightKg} kg
            </Text>
          </View>
        </View>

        {/* Metabolic Readout Box */}
        <View style={[styles.metabolicBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle }]}>
          <View style={styles.metabolicItem}>
            <Text style={[styles.metabolicLabel, { color: theme.textSecondary }]}>BMR (বেসাল)</Text>
            <Text style={[styles.metabolicVal, { color: theme.text }]}>
              {formatNumber(bmr, language)} {t.kcal}
            </Text>
          </View>
          <View style={styles.metabolicDivider} />
          <View style={styles.metabolicItem}>
            <Text style={[styles.metabolicLabel, { color: theme.textSecondary }]}>TDEE (মোট ব্যয়)</Text>
            <Text style={[styles.metabolicVal, { color: theme.text }]}>
              {formatNumber(tdee, language)} {t.kcal}
            </Text>
          </View>
          <View style={styles.metabolicDivider} />
          <View style={styles.metabolicItem}>
            <Text style={[styles.metabolicLabel, { color: theme.primary }]}>দৈনিক লক্ষ্য</Text>
            <Text style={[styles.metabolicVal, { color: theme.primary }]}>
              {formatNumber(calorieTarget, language)} {t.kcal}
            </Text>
          </View>
        </View>

        {/* Live Biometrics Input Row */}
        <View style={styles.biometricsInputRow}>
          <View style={styles.bioInputCol}>
            <Text style={[styles.bioInputLabel, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'ওজন (kg)' : 'Weight (kg)'}
            </Text>
            <TextInput
              style={[styles.bioTextInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
              keyboardType="numeric"
              value={String(profile.weightKg)}
              onChangeText={(v) => {
                const num = parseFloat(v) || profile.weightKg;
                if (num > 20 && num < 300) updateProfile({ weightKg: num });
              }}
            />
          </View>

          <View style={styles.bioInputCol}>
            <Text style={[styles.bioInputLabel, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'উচ্চতা (cm)' : 'Height (cm)'}
            </Text>
            <TextInput
              style={[styles.bioTextInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
              keyboardType="numeric"
              value={String(profile.heightCm)}
              onChangeText={(v) => {
                const num = parseFloat(v) || profile.heightCm;
                if (num > 50 && num < 250) updateProfile({ heightCm: num });
              }}
            />
          </View>

          <View style={styles.bioInputCol}>
            <Text style={[styles.bioInputLabel, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'বয়স' : 'Age'}
            </Text>
            <TextInput
              style={[styles.bioTextInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
              keyboardType="numeric"
              value={String(profile.age)}
              onChangeText={(v) => {
                const num = parseInt(v) || profile.age;
                if (num > 10 && num < 120) updateProfile({ age: num });
              }}
            />
          </View>
        </View>

        {safetyWarnings.length > 0 && (
          <View style={[styles.safetyWarningBox, { backgroundColor: theme.cautionAlertBg }]}>
            <Text style={[styles.safetyWarningText, { color: theme.cautionAlert }]}>
              {safetyWarnings[0]}
            </Text>
          </View>
        )}
      </BentoCard>

      {/* Activity Level Selector Card */}
      <BentoCard>
        <SectionHeader
          title={language === 'bn' ? 'দৈনন্দিন শারীরিক সক্রিয়তা' : 'Activity Level'}
        />
        <View style={styles.activityGrid}>
          {[
            { id: 'sedentary', label_bn: 'বসে কাজ (১.২x)', label_en: 'Sedentary (1.2x)' },
            { id: 'lightly_active', label_bn: 'হালকা সক্রিয় (১.৩৮x)', label_en: 'Lightly Active (1.38x)' },
            { id: 'moderately_active', label_bn: 'মাঝারি সক্রিয় (১.৫৫x)', label_en: 'Moderately Active (1.55x)' },
            { id: 'highly_active', label_bn: 'উচ্চ সক্রিয় (১.৭৩x)', label_en: 'Highly Active (1.73x)' },
          ].map((act) => {
            const isSelected = profile.activityLevel === act.id;
            return (
              <TouchableOpacity
                key={act.id}
                style={[
                  styles.activityPill,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surfaceMuted,
                    borderColor: isSelected ? theme.primary : theme.borderSubtle,
                  },
                ]}
                onPress={() => updateProfile({ activityLevel: act.id as ActivityLevel })}
                activeOpacity={0.7}
              >
                <Text style={[styles.activityPillText, { color: isSelected ? theme.textInverse : theme.text }]}>
                  {language === 'bn' ? act.label_bn : act.label_en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BentoCard>

      {/* Energy Goal Setting */}
      <BentoCard>
        <SectionHeader
          title={language === 'bn' ? 'ক্যালরি ও শক্তির মোড' : 'Energy Mode'}
        />
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[
              styles.modeTab,
              {
                backgroundColor: profile.energyMode === 'maintenance' ? theme.primary : theme.surfaceMuted,
                borderColor: profile.energyMode === 'maintenance' ? theme.primary : theme.borderSubtle,
              },
            ]}
            onPress={() => updateProfile({ energyMode: 'maintenance' })}
          >
            <Text
              style={[
                styles.modeTabText,
                { color: profile.energyMode === 'maintenance' ? theme.textInverse : theme.text },
              ]}
            >
              {language === 'bn' ? 'রক্ষণাবেক্ষণ (TDEE)' : 'Maintenance'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTab,
              {
                backgroundColor: profile.energyMode === 'reduction' ? theme.primary : theme.surfaceMuted,
                borderColor: profile.energyMode === 'reduction' ? theme.primary : theme.borderSubtle,
              },
            ]}
            onPress={() => updateProfile({ energyMode: 'reduction' })}
          >
            <Text
              style={[
                styles.modeTabText,
                { color: profile.energyMode === 'reduction' ? theme.textInverse : theme.text },
              ]}
            >
              {language === 'bn' ? 'পরিমিত ঘাটতি (১৮%)' : 'Deficit (18%)'}
            </Text>
          </TouchableOpacity>
        </View>
      </BentoCard>

      {/* Clinical Conditions Selector */}
      <BentoCard>
        <SectionHeader
          title={language === 'bn' ? 'ক্লিনিক্যাল স্বাস্থ্য প্রেক্ষিত' : 'Clinical Health Context'}
        />
        <Text style={[styles.conditionsExplainer, { color: theme.textSecondary }]}>
          {language === 'bn'
            ? 'চিহ্নিত শর্তানুযায়ী অ্যালার্ট ইঞ্জিন খাবার এন্ট্রির সময় সম্ভাব্য পুষ্টি দ্বন্দ্ব যাচাই করবে।'
            : 'Selected conditions activate evidence-graded nutrient cross-checks.'}
        </Text>

        <View style={styles.conditionsGrid}>
          {healthConditionsList.map((cond) => {
            const isSelected = profile.conditions.includes(cond.id);
            return (
              <TouchableOpacity
                key={cond.id}
                style={[
                  styles.conditionChip,
                  {
                    backgroundColor: isSelected ? theme.primaryLight + '26' : theme.surfaceMuted,
                    borderColor: isSelected ? theme.primary : theme.borderSubtle,
                  },
                ]}
                onPress={() => toggleCondition(cond.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkCircle, { backgroundColor: isSelected ? theme.primary : 'transparent', borderColor: theme.border }]}>
                  {isSelected && <Check size={12} color="#FFFFFF" />}
                </View>
                <Text
                  style={[
                    styles.conditionName,
                    { color: isSelected ? theme.primary : theme.text },
                  ]}
                >
                  {language === 'bn' ? cond.name_bn : cond.name_en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BentoCard>

      {/* Settings & Preferences */}
      <BentoCard>
        <SectionHeader
          title={language === 'bn' ? 'অ্যাপ সেটিংস' : 'App Settings'}
        />

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>
            {language === 'bn' ? 'ভাষা / Language' : 'Language'}
          </Text>
          <TouchableOpacity
            style={[styles.settingPill, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
            onPress={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
          >
            <Globe size={16} color={theme.primary} />
            <Text style={[styles.settingPillText, { color: theme.primary }]}>
              {language === 'bn' ? 'বাংলা (Bengali)' : 'English'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.settingRow, { marginTop: spacing.md }]}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>
            {language === 'bn' ? 'ডার্ক মোড' : 'Dark Mode'}
          </Text>
          <TouchableOpacity
            style={[styles.settingPill, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
            onPress={toggleTheme}
          >
            {isDarkMode ? <Sun size={16} color={theme.accent} /> : <Moon size={16} color={theme.primary} />}
            <Text style={[styles.settingPillText, { color: isDarkMode ? theme.accent : theme.primary }]}>
              {isDarkMode ? (language === 'bn' ? 'চালু' : 'On') : (language === 'bn' ? 'বন্ধ' : 'Off')}
            </Text>
          </TouchableOpacity>
        </View>
      </BentoCard>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextColumn: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  metabolicBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  metabolicItem: {
    alignItems: 'center',
    flex: 1,
  },
  metabolicLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  metabolicVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  metabolicDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#DFDACB',
  },
  safetyWarningBox: {
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  safetyWarningText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  modeTab: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  conditionsExplainer: {
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  conditionsGrid: {
    gap: spacing.xs + 2,
  },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionName: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  settingPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  biometricsInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  bioInputCol: {
    flex: 1,
  },
  bioInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  bioTextInput: {
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  activityGrid: {
    gap: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  activityPill: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  activityPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
