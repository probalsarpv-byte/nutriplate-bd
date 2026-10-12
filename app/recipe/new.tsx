import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Trash2, Check, ChefHat, Search, X } from 'lucide-react-native';
import { PremiumScreen } from '../../src/components/ui/PremiumScreen';
import { PremiumHeader } from '../../src/components/ui/PremiumHeader';
import { BentoCard } from '../../src/components/ui/BentoCard';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { useThemeStore } from '../../src/stores/themeStore';
import { foodDatabaseAdapter } from '../../src/database/adapters/FoodDatabaseAdapter';
import { calculateRecipeNutrients } from '../../src/engines/recipes/recipeEngine';
import { formatNumber } from '../../src/localization/formatters';
import { translations } from '../../src/localization/translations';
import { radii, spacing } from '../../src/design-system/tokens/spacing';
import { useRecipeStore } from '../../src/stores/recipeStore';
import { FoodItem } from '../../src/types/food';

export default function NewRecipeScreen() {
  const router = useRouter();
  const { theme, language } = useThemeStore();
  const t = translations[language];
  const { addRecipe } = useRecipeStore();

  const [recipeName, setRecipeName] = useState('');
  const [servingsStr, setServingsStr] = useState('4');
  const [cookedYieldStr, setCookedYieldStr] = useState('600');

  // Initial ingredients for builder
  const [ingredientsList, setIngredientsList] = useState<Array<{ foodCode: string; rawWeightGrams: number }>>([
    { foodCode: '01_0037', rawWeightGrams: 200 }, // Rice
    { foodCode: '02_0007', rawWeightGrams: 100 }, // Lentils
  ]);

  // Ingredient Picker Modal State
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [selectedGramsStr, setSelectedGramsStr] = useState('100');

  const servings = Math.max(1, parseInt(servingsStr) || 1);
  const cookedYield = Math.max(10, parseInt(cookedYieldStr) || 300);

  const calculated = useMemo(() => {
    return calculateRecipeNutrients({
      id: `rec_${Date.now()}`,
      name: recipeName || (language === 'bn' ? 'নতুন ঘরোয়া রেসিপি' : 'New Homemade Recipe'),
      category: 'Homemade',
      ingredients: ingredientsList.map((i) => ({
        foodCode: i.foodCode,
        rawWeightGrams: i.rawWeightGrams,
        unit: 'g',
        quantity: i.rawWeightGrams,
      })),
      totalServings: servings,
      customCookedYieldGrams: cookedYield,
    });
  }, [recipeName, ingredientsList, servings, cookedYield, language]);

  const pickerResults = useMemo(() => {
    return foodDatabaseAdapter.searchFoods(pickerQuery, 'all').slice(0, 30);
  }, [pickerQuery]);

  const handleSelectIngredient = (food: FoodItem) => {
    const rawGrams = Math.max(1, parseInt(selectedGramsStr) || 100);
    setIngredientsList([...ingredientsList, { foodCode: food.code, rawWeightGrams: rawGrams }]);
    setIsPickerVisible(false);
    setPickerQuery('');
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredientsList(ingredientsList.filter((_, idx) => idx !== index));
  };

  const handleSaveRecipe = () => {
    addRecipe(calculated);
    router.back();
  };

  return (
    <PremiumScreen>
      <PremiumHeader
        title={language === 'bn' ? 'রেসিপি প্রস্তুতকারক' : 'Recipe Builder'}
        subtitle={language === 'bn' ? 'প্রতি পরিবেশন পুষ্টি হিসাব' : 'Per-serving nutrition calculation'}
        showBack
      />

      {/* Recipe Meta Card */}
      <BentoCard>
        <Text style={[styles.fieldLabel, { color: theme.text }]}>
          {language === 'bn' ? 'রেসিপির নাম' : 'Recipe Name'}
        </Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
          placeholder={language === 'bn' ? 'যেমন: ভুনা খিচুড়ি বা মুরগির স্যুপ' : 'e.g. Lentil Rice or Chicken Soup'}
          placeholderTextColor={theme.textMuted}
          value={recipeName}
          onChangeText={setRecipeName}
        />

        <View style={styles.inputsRow}>
          <View style={styles.halfInput}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>
              {language === 'bn' ? 'পরিবেশন সংখ্যা' : 'Total Servings'}
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
              keyboardType="numeric"
              value={servingsStr}
              onChangeText={setServingsStr}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>
              {language === 'bn' ? 'রান্নার পর মোট ওজন (g)' : 'Cooked Yield (g)'}
            </Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
              keyboardType="numeric"
              value={cookedYieldStr}
              onChangeText={setCookedYieldStr}
            />
          </View>
        </View>
      </BentoCard>

      {/* Ingredients List */}
      <SectionHeader
        title={language === 'bn' ? 'উপাদান তালিকা (Ingredients)' : 'Ingredients'}
        actionText={language === 'bn' ? '+ উপাদান যুক্ত করুন' : '+ Add Item'}
        onActionPress={() => setIsPickerVisible(true)}
      />

      {ingredientsList.map((item, index) => {
        const food = foodDatabaseAdapter.getFoodByCode(item.foodCode);
        return (
          <BentoCard key={index} style={styles.ingredientCard}>
            <View style={styles.ingredientRow}>
              <View style={styles.ingredientLeft}>
                <Text style={[styles.ingredientName, { color: theme.text }]}>
                  {food ? (language === 'bn' ? food.bengali : food.english) : item.foodCode}
                </Text>
                <Text style={[styles.ingredientWeight, { color: theme.textSecondary }]}>
                  {item.rawWeightGrams} {language === 'bn' ? 'গ্রাম (কাঁচা)' : 'g (raw)'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveIngredient(index)}
                style={styles.trashBtn}
                activeOpacity={0.7}
              >
                <Trash2 size={16} color={theme.criticalAlert} />
              </TouchableOpacity>
            </View>
          </BentoCard>
        );
      })}

      {/* Per Serving Nutrition Output */}
      <BentoCard variant="elevated" style={styles.summaryCard}>
        <Text style={[styles.summaryTitle, { color: theme.text }]}>
          {language === 'bn' ? 'প্রতি পরিবেশন পুষ্টি মান (Per Serving)' : 'Per Serving Nutrition'}
        </Text>
        <Text style={[styles.servingSub, { color: theme.textSecondary }]}>
          {language === 'bn'
            ? `১ পরিবেশন = ${calculated.servingWeightGrams} গ্রাম (মোট ${servings} পরিবেশন)`
            : `1 serving = ${calculated.servingWeightGrams}g (${servings} servings total)`}
        </Text>

        <View style={styles.nutrientGrid}>
          <View style={styles.nutrientCell}>
            <Text style={[styles.cellVal, { color: theme.primary }]}>
              {formatNumber(calculated.perServingCalories, language)}
            </Text>
            <Text style={[styles.cellLabel, { color: theme.textSecondary }]}>{t.kcal}</Text>
          </View>
          <View style={styles.nutrientCell}>
            <Text style={[styles.cellVal, { color: theme.carb }]}>
              {formatNumber(calculated.perServingCarbs, language)}g
            </Text>
            <Text style={[styles.cellLabel, { color: theme.textSecondary }]}>{t.carbs}</Text>
          </View>
          <View style={styles.nutrientCell}>
            <Text style={[styles.cellVal, { color: theme.protein }]}>
              {formatNumber(calculated.perServingProtein, language)}g
            </Text>
            <Text style={[styles.cellLabel, { color: theme.textSecondary }]}>{t.protein}</Text>
          </View>
          <View style={styles.nutrientCell}>
            <Text style={[styles.cellVal, { color: theme.fat }]}>
              {formatNumber(calculated.perServingFat, language)}g
            </Text>
            <Text style={[styles.cellLabel, { color: theme.textSecondary }]}>{t.fat}</Text>
          </View>
        </View>
      </BentoCard>

      <PrimaryButton
        title={language === 'bn' ? 'রেসিপি সংরক্ষণ করুন' : 'Save Recipe'}
        onPress={handleSaveRecipe}
        icon={<Check size={18} color="#FFFFFF" />}
      />

      {/* Ingredient Picker Modal */}
      <Modal visible={isPickerVisible} transparent animationType="slide" onRequestClose={() => setIsPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {language === 'bn' ? 'উপাদান নির্বাচন করুন' : 'Select Ingredient'}
              </Text>
              <TouchableOpacity onPress={() => setIsPickerVisible(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Gram Weight Setting */}
            <View style={styles.gramsInputRow}>
              <Text style={[styles.gramsLabel, { color: theme.textSecondary }]}>
                {language === 'bn' ? 'কাঁচা ওজন (গ্রাম):' : 'Raw weight (g):'}
              </Text>
              <TextInput
                style={[styles.gramsInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
                keyboardType="numeric"
                value={selectedGramsStr}
                onChangeText={setSelectedGramsStr}
              />
            </View>

            {/* Search Box */}
            <View style={[styles.pickerSearch, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle }]}>
              <Search size={16} color={theme.textSecondary} />
              <TextInput
                style={[styles.pickerInput, { color: theme.text }]}
                placeholder={language === 'bn' ? 'খাবার খুঁজুন...' : 'Search food...'}
                placeholderTextColor={theme.textMuted}
                value={pickerQuery}
                onChangeText={setPickerQuery}
              />
            </View>

            {/* Foods List */}
            <FlatList
              data={pickerResults}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerItem, { borderBottomColor: theme.borderSubtle }]}
                  onPress={() => handleSelectIngredient(item)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pickerItemName, { color: theme.text }]}>
                      {language === 'bn' ? item.bengali : item.english}
                    </Text>
                    <Text style={[styles.pickerItemSub, { color: theme.textSecondary }]}>
                      {item.category} · {item.energy_kcal} kcal/100g
                    </Text>
                  </View>
                  <Plus size={18} color={theme.primary} />
                </TouchableOpacity>
              )}
              style={styles.pickerList}
            />
          </View>
        </View>
      </Modal>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  textInput: {
    height: 46,
    borderRadius: radii.input,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  halfInput: {
    flex: 1,
  },
  ingredientCard: {
    padding: spacing.md,
    marginBottom: spacing.xs + 2,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientLeft: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '700',
  },
  ingredientWeight: {
    fontSize: 12,
    marginTop: 2,
  },
  trashBtn: {
    padding: 6,
  },
  summaryCard: {
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  servingSub: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  nutrientGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutrientCell: {
    alignItems: 'center',
    flex: 1,
  },
  cellVal: {
    fontSize: 18,
    fontWeight: '700',
  },
  cellLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: radii.cardLarge,
    borderTopRightRadius: radii.cardLarge,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  gramsInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  gramsLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  gramsInput: {
    height: 38,
    width: 90,
    borderRadius: radii.input,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    fontSize: 14,
    textAlign: 'center',
  },
  pickerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.input,
    paddingHorizontal: spacing.md,
    height: 42,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pickerInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  pickerItemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  pickerItemSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
