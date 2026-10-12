import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search, X, Flame } from 'lucide-react-native';
import { PremiumScreen } from '../../src/components/ui/PremiumScreen';
import { PremiumHeader } from '../../src/components/ui/PremiumHeader';
import { FoodCard } from '../../src/components/food/FoodCard';
import { FoodQuantitySheet } from '../../src/components/food/FoodQuantitySheet';
import { useThemeStore } from '../../src/stores/themeStore';
import { useDiaryStore } from '../../src/stores/diaryStore';
import { foodDatabaseAdapter } from '../../src/database/adapters/FoodDatabaseAdapter';
import { FoodItem, FoodState } from '../../src/types/food';
import { MealType } from '../../src/types/diary';
import { translations } from '../../src/localization/translations';
import { radii, spacing } from '../../src/design-system/tokens/spacing';

export default function FoodSearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mealType = (params.mealType as MealType) || 'lunch';

  const { theme, language } = useThemeStore();
  const t = translations[language];
  const { addFoodEntry } = useDiaryStore();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStateFilter, setSelectedStateFilter] = useState<'ALL' | FoodState>('ALL');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantitySheetVisible, setQuantitySheetVisible] = useState(false);

  const categories = useMemo(() => {
    return foodDatabaseAdapter.getCategories();
  }, []);

  const searchResults = useMemo(() => {
    const stateArg = selectedStateFilter === 'ALL' ? undefined : selectedStateFilter;
    return foodDatabaseAdapter.searchFoods(query, selectedCategory, stateArg);
  }, [query, selectedCategory, selectedStateFilter]);

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setQuantitySheetVisible(true);
  };

  const handleConfirmLog = (res: { food: FoodItem; mealType: MealType; quantity: number; unit: any }) => {
    addFoodEntry({
      food: res.food,
      mealType: res.mealType,
      quantity: res.quantity,
      unit: res.unit,
    });
    router.back();
  };

  const stateFilters: Array<{ id: 'ALL' | FoodState; label_bn: string; label_en: string }> = [
    { id: 'ALL', label_bn: 'সব খাদ্য', label_en: 'All Foods' },
    { id: 'RAW', label_bn: 'কাঁচা (Raw)', label_en: 'Raw' },
    { id: 'COOKED', label_bn: 'রান্না করা (Cooked)', label_en: 'Cooked' },
    { id: 'PREPARED', label_bn: 'প্রস্তুত পদ (Prepared)', label_en: 'Prepared' },
  ];

  return (
    <PremiumScreen scrollable={false}>
      <PremiumHeader
        title={language === 'bn' ? 'খাবার অনুসন্ধান' : 'Food Search'}
        subtitle={language === 'bn' ? `মিল: ${mealType}` : `Meal: ${mealType}`}
        showBack
      />

      {/* Search Input Bar */}
      <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
        <Search size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={t.searchPlaceholder}
          placeholderTextColor={theme.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Food State Quick Filters (Raw / Cooked / Prepared) */}
      <View style={styles.stateFilterRow}>
        {stateFilters.map((sf) => {
          const isSelected = selectedStateFilter === sf.id;
          return (
            <TouchableOpacity
              key={sf.id}
              style={[
                styles.stateChip,
                {
                  backgroundColor: isSelected ? theme.primary : theme.surfaceMuted,
                  borderColor: isSelected ? theme.primary : theme.borderSubtle,
                },
              ]}
              onPress={() => setSelectedStateFilter(sf.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.stateChipText,
                  { color: isSelected ? theme.textInverse : theme.textSecondary },
                  isSelected && { fontWeight: '700' },
                ]}
              >
                {language === 'bn' ? sf.label_bn : sf.label_en}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: isSelected ? theme.accent : theme.surface,
                    borderColor: isSelected ? theme.accent : theme.borderSubtle,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.catName,
                    { color: isSelected ? '#FFFFFF' : theme.text },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Food Results List */}
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => <FoodCard food={item} onPress={handleFoodSelect} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {language === 'bn' ? 'কোনো খাবার খুঁজে পাওয়া যায়নি।' : 'No matching foods found.'}
            </Text>
          </View>
        }
      />

      {/* Interactive Quantity Sheet */}
      <FoodQuantitySheet
        food={selectedFood}
        visible={quantitySheetVisible}
        onClose={() => setQuantitySheetVisible(false)}
        onConfirm={handleConfirmLog}
        initialMealType={mealType}
      />
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.input,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  stateFilterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  stateChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  stateChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryContainer: {
    marginBottom: spacing.xs,
  },
  categoryScroll: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  catIcon: {
    fontSize: 14,
  },
  catName: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
