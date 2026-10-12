import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Plus, Check, Trash2 } from 'lucide-react-native';
import { PremiumScreen } from '../../src/components/ui/PremiumScreen';
import { PremiumHeader } from '../../src/components/ui/PremiumHeader';
import { BentoCard } from '../../src/components/ui/BentoCard';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { useThemeStore } from '../../src/stores/themeStore';
import { useDiaryStore, getTodayDateString } from '../../src/stores/diaryStore';
import { calculateRecipeNutrients, calculateFamilyPotPortions } from '../../src/engines/recipes/recipeEngine';
import { formatNumber } from '../../src/localization/formatters';
import { translations } from '../../src/localization/translations';
import { radii, spacing } from '../../src/design-system/tokens/spacing';

export default function FamilyPotScreen() {
  const router = useRouter();
  const { theme, language } = useThemeStore();
  const t = translations[language];
  const { addCustomEntry } = useDiaryStore();

  const [potWeightStr, setPotWeightStr] = useState('800');

  // Household members with their plate weights
  const [members, setMembers] = useState<Array<{ id: string; name: string; weightGrams: number }>>([
    { id: 'm1', name: 'বাবা (Father)', weightGrams: 350 },
    { id: 'm2', name: 'মা (Mother)', weightGrams: 250 },
    { id: 'm3', name: 'সন্তান (Child)', weightGrams: 200 },
  ]);

  const totalPotWeight = Math.max(1, parseInt(potWeightStr) || 800);

  // Sample base recipe (Lentil Khichuri with Rice & Dal)
  const baseRecipe = React.useMemo(() => {
    return calculateRecipeNutrients({
      id: 'family_pot_base',
      name: 'ফ্যামিলি পট খিচুড়ি',
      category: 'Family Meal',
      ingredients: [
        { foodCode: '01_0037', rawWeightGrams: 400, unit: 'g', quantity: 400 },
        { foodCode: '02_0007', rawWeightGrams: 200, unit: 'g', quantity: 200 },
      ],
      totalServings: 3,
      customCookedYieldGrams: totalPotWeight,
    });
  }, [totalPotWeight]);

  const allocation = React.useMemo(() => {
    return calculateFamilyPotPortions({
      recipe: baseRecipe,
      members: members.map((m) => ({
        memberId: m.id,
        memberName: m.name,
        consumedWeightGrams: m.weightGrams,
      })),
    });
  }, [baseRecipe, members]);

  const handleUpdateWeight = (index: number, valStr: string) => {
    const val = parseInt(valStr) || 0;
    const updated = [...members];
    updated[index].weightGrams = val;
    setMembers(updated);
  };

  const handleAddMember = () => {
    const nextId = `m_${Date.now()}`;
    const nextName = language === 'bn' ? `সদস্য ${members.length + 1}` : `Member ${members.length + 1}`;
    setMembers([...members, { id: nextId, name: nextName, weightGrams: 200 }]);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleLogUserPortion = () => {
    if (allocation.portions.length === 0) return;
    const userPortion = allocation.portions[0]; // first member is user
    addCustomEntry({
      foodCode: 'family_pot_khichuri',
      recipeId: baseRecipe.id,
      name_bn: `${baseRecipe.name} (${userPortion.consumedWeightGrams} গ্রাম)`,
      name_en: `${baseRecipe.name} (${userPortion.consumedWeightGrams}g)`,
      mealType: 'dinner',
      date: getTodayDateString(),
      quantity: 1,
      unit: 'plate',
      gramWeight: userPortion.consumedWeightGrams,
      foodState: 'PREPARED',
      preparationMethod: 'curry',
      nutrientBasis: 'per_100g_cooked',
      energy_kcal: userPortion.calories,
      carb_g: userPortion.carbs,
      protein_g: userPortion.protein,
      fat_g: userPortion.fat,
      fibre_g: 3.5,
      isPlant: true,
      plantCategory: 'whole_grain',
    });
    router.back();
  };

  return (
    <PremiumScreen>
      <PremiumHeader
        title={language === 'bn' ? 'ফ্যামিলি পট' : 'Family Pot'}
        subtitle={language === 'bn' ? 'অসম পারিবারিক বণ্টন ও সঠিক পুষ্টি' : 'Unequal Household Portion Nutrition'}
        showBack
      />

      {/* Pot Overview Card */}
      <BentoCard variant="elevated">
        <View style={styles.potHeaderRow}>
          <View style={[styles.potIcon, { backgroundColor: theme.fat + '26' }]}>
            <Users size={22} color={theme.fat} />
          </View>
          <View style={styles.potTitleCol}>
            <Text style={[styles.potTitle, { color: theme.text }]}>
              {baseRecipe.name}
            </Text>
            <Text style={[styles.potSub, { color: theme.textSecondary }]}>
              {language === 'bn' ? 'পাত্রের মোট ক্যালরি:' : 'Total Pot Calories:'} {formatNumber(baseRecipe.totalCalories, language)} {t.kcal}
            </Text>
          </View>
        </View>

        <Text style={[styles.inputLabel, { color: theme.text, marginTop: spacing.md }]}>
          {language === 'bn' ? 'রান্নার পর পুরো পাত্রের মোট ওজন (গ্রাম)' : 'Cooked Pot Total Weight (grams)'}
        </Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
          keyboardType="numeric"
          value={potWeightStr}
          onChangeText={setPotWeightStr}
        />
      </BentoCard>

      {/* Household Members Portions */}
      <SectionHeader
        title={language === 'bn' ? 'সদস্যদের প্লেটের ওজন ও বরাদ্দ' : 'Member Portions'}
        actionText={language === 'bn' ? '+ সদস্য যুক্ত করুন' : '+ Add Member'}
        onActionPress={handleAddMember}
      />

      {allocation.portions.map((item, index) => (
        <BentoCard key={item.memberId} style={styles.memberCard}>
          <View style={styles.memberTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.memberName, { color: theme.text }]}>{item.memberName}</Text>
              <Text style={[styles.memberPct, { color: theme.textSecondary }]}>
                {language === 'bn' ? `পাত্রের ${item.percentageOfPot}% অংশ` : `${item.percentageOfPot}% of pot`}
              </Text>
            </View>
            <View style={styles.weightInputBox}>
              <TextInput
                style={[styles.memberWeightInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
                keyboardType="numeric"
                value={String(members[index]?.weightGrams || '')}
                onChangeText={(v) => handleUpdateWeight(index, v)}
              />
              <Text style={[styles.gLabel, { color: theme.textSecondary }]}>g</Text>
              {members.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveMember(item.memberId)}
                  style={{ marginLeft: 6, padding: 4 }}
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color={theme.criticalAlert} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.memberMacroRow}>
            <Text style={[styles.macroPill, { color: theme.primary }]}>
              {formatNumber(item.calories, language)} {t.kcal}
            </Text>
            <Text style={[styles.macroPill, { color: theme.carb }]}>
              C: {formatNumber(item.carbs, language)}g
            </Text>
            <Text style={[styles.macroPill, { color: theme.protein }]}>
              P: {formatNumber(item.protein, language)}g
            </Text>
            <Text style={[styles.macroPill, { color: theme.fat }]}>
              F: {formatNumber(item.fat, language)}g
            </Text>
          </View>
        </BentoCard>
      ))}

      <PrimaryButton
        title={language === 'bn' ? 'আমার অংশে ট্র্যাকার লগ করুন' : 'Log My Portion to Diary'}
        onPress={handleLogUserPortion}
        icon={<Check size={18} color="#FFFFFF" />}
      />
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  potHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  potIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  potTitleCol: {
    flex: 1,
  },
  potTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  potSub: {
    fontSize: 12,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  textInput: {
    height: 46,
    borderRadius: radii.input,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    fontWeight: '700',
  },
  memberCard: {
    padding: spacing.md,
    marginBottom: spacing.xs + 2,
  },
  memberTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
  },
  memberPct: {
    fontSize: 11,
    marginTop: 2,
  },
  weightInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberWeightInput: {
    width: 65,
    height: 38,
    borderRadius: radii.sm,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  gLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  memberMacroRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#EAE6D9',
  },
  macroPill: {
    fontSize: 12,
    fontWeight: '600',
  },
});
