import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Plus,
  Save,
  Check,
  Search,
  X,
  ChefHat,
  Disc,
  Info,
  Calendar,
  Sparkles,
  ArrowLeft,
} from 'lucide-react-native';
import { PremiumScreen } from '../../src/components/ui/PremiumScreen';
import { PremiumHeader } from '../../src/components/ui/PremiumHeader';
import { BentoCard } from '../../src/components/ui/BentoCard';
import { MealFoodCard } from '../../src/components/meal/MealFoodCard';
import { LiveMealNutritionCard } from '../../src/components/meal/LiveMealNutritionCard';
import { MealAlertsSection } from '../../src/components/meal/MealAlertsSection';
import { LogMealSheet } from '../../src/components/meal/LogMealSheet';
import { FoodQuantitySheet } from '../../src/components/food/FoodQuantitySheet';
import { FoodCard } from '../../src/components/food/FoodCard';
import { useThemeStore } from '../../src/stores/themeStore';
import { useUserStore } from '../../src/stores/userStore';
import { useMealStore } from '../../src/stores/mealStore';
import { useRecipeStore } from '../../src/stores/recipeStore';
import { foodDatabaseAdapter } from '../../src/database/adapters/FoodDatabaseAdapter';
import { evaluateMealAlerts } from '../../src/engines/meal/mealEngine';
import { MealCategory, MealFoodItem, SavedMeal } from '../../src/types/meal';
import { FoodItem, FoodState, ServingUnit } from '../../src/types/food';
import { MealType } from '../../src/types/diary';
import { translations } from '../../src/localization/translations';
import { radii, spacing } from '../../src/design-system/tokens/spacing';

export default function SmartMealMakerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editMealId = params.id as string | undefined;
  const source = params.source as string | undefined;

  const { theme, language } = useThemeStore();
  const { profile } = useUserStore();
  const t = translations[language];

  const {
    activeDraft,
    liveNutrition,
    setDraftName,
    setDraftCategory,
    setDraftNotes,
    addItem,
    updateItemQuantity,
    removeItem,
    saveDraft,
    initDraft,
    savedMeals,
  } = useMealStore();

  const { recipes } = useRecipeStore();

  // Search & Picker Modal State
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState<'ALL' | FoodState | 'RECIPES'>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Quantity Sheet for selected food
  const [foodForQuantity, setFoodForQuantity] = useState<FoodItem | null>(null);
  const [isQuantitySheetVisible, setIsQuantitySheetVisible] = useState(false);

  // Edit item quantity modal
  const [editingItem, setEditingItem] = useState<MealFoodItem | null>(null);
  const [editQtyStr, setEditQtyStr] = useState('1');

  // Log to tracker sheet
  const [isLogSheetVisible, setIsLogSheetVisible] = useState(false);
  const [savedMealForLog, setSavedMealForLog] = useState<SavedMeal | null>(null);

  // Initialize draft when screen loads
  useEffect(() => {
    if (editMealId) {
      const existing = savedMeals.find((m) => m.id === editMealId);
      if (existing) {
        initDraft(existing);
      }
    } else if (source === 'smart_plate') {
      // Prefilled from Smart Plate visualizer: Rice + Fish Curry + Greens
      const rice = foodDatabaseAdapter.getFoodByCode('01_0037');
      const rohu = foodDatabaseAdapter.getFoodByCode('PREP_ROHU_CURRY');
      const shak = foodDatabaseAdapter.getFoodByCode('04_0016');

      initDraft({
        name: language === 'bn' ? 'স্মার্ট প্লেট লাঞ্চ থালি' : 'Smart Balanced Plate',
        category: 'lunch',
        notes: language === 'bn' ? '১/২ শাকসবজি, ১/৪ আমিষ ও ১/৪ শর্করা' : '1/2 greens, 1/4 protein, 1/4 carbs',
      });

      if (rice) addItem(rice, 180, 'g');
      if (rohu) addItem(rohu, 100, 'g');
      if (shak) addItem(shak, 150, 'g');
    } else if (params.recipeId) {
      const rec = recipes.find((r) => r.id === params.recipeId);
      if (rec) {
        initDraft({
          name: language === 'bn' ? `${rec.name} মিল` : `${rec.name} Meal`,
          category: 'lunch',
          notes: language === 'bn' ? `রেসিপি ল্যাব থেকে তৈরি: ${rec.name}` : `Created from Recipe Lab: ${rec.name}`,
        });
        const food = foodDatabaseAdapter.registerCustomRecipeAsFood(rec);
        const singleServingGrams = Math.round(rec.cookedYieldWeightGrams / (rec.totalServings || 1)) || 150;
        addItem(food, singleServingGrams, 'g');
      }
    }
  }, [editMealId, source, params.recipeId]);

  // Compute live functional alerts against active meal
  const liveAlerts = useMemo(() => {
    if (!profile) return [];
    return evaluateMealAlerts(
      { items: activeDraft.items, nutrition: liveNutrition },
      profile
    );
  }, [activeDraft.items, liveNutrition, profile]);

  // Food search results
  const searchResults = useMemo(() => {
    if (selectedStateFilter === 'RECIPES') {
      // Search custom homemade recipes
      const q = searchQuery.toLowerCase().trim();
      return recipes
        .filter((r) => !q || r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
        .map((r) => foodDatabaseAdapter.registerCustomRecipeAsFood(r));
    }

    const stateArg = selectedStateFilter === 'ALL' ? undefined : selectedStateFilter;
    return foodDatabaseAdapter.searchFoods(searchQuery, selectedCategoryFilter, stateArg);
  }, [searchQuery, selectedStateFilter, selectedCategoryFilter, recipes]);

  const categories = useMemo(() => {
    return foodDatabaseAdapter.getCategories();
  }, []);

  const mealCategories: Array<{ id: MealCategory; label_bn: string; label_en: string }> = [
    { id: 'breakfast', label_bn: 'সকালের নাশতা', label_en: 'Breakfast' },
    { id: 'lunch', label_bn: 'দুপুরের খাবার', label_en: 'Lunch' },
    { id: 'dinner', label_bn: 'রাতের খাবার', label_en: 'Dinner' },
    { id: 'snack', label_bn: 'বিকেলের নাশতা', label_en: 'Snack' },
    { id: 'custom', label_bn: 'কাস্টম মিল', label_en: 'Custom' },
  ];

  const handleSelectFoodFromSearch = (food: FoodItem) => {
    setFoodForQuantity(food);
    setIsQuantitySheetVisible(true);
  };

  const handleConfirmAddFood = (res: { food: FoodItem; mealType: MealType; quantity: number; unit: any }) => {
    addItem(res.food, res.quantity, res.unit);
    setIsQuantitySheetVisible(false);
    setIsSearchModalVisible(false);
    setSearchQuery('');
  };

  const handleSaveMealAction = async () => {
    if (activeDraft.items.length === 0) {
      Alert.alert(
        language === 'bn' ? 'খাবার অনুপস্থিত' : 'No Foods Added',
        language === 'bn'
          ? 'সংরক্ষণের পূর্বে অনুগ্রহ করে অন্তত একটি খাবার বা রেসিপি যুক্ত করুন।'
          : 'Please add at least one food or recipe item before saving.'
      );
      return;
    }

    const saved = await saveDraft(profile.id);
    Alert.alert(
      language === 'bn' ? 'সফলভাবে সংরক্ষিত' : 'Meal Saved',
      language === 'bn'
        ? `"${saved.name}" আপনার মিল লাইব্রেরিতে সংরক্ষিত হয়েছে।`
        : `"${saved.name}" has been saved to your Meal Library.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleOpenLogTracker = async () => {
    if (activeDraft.items.length === 0) {
      Alert.alert(
        language === 'bn' ? 'খাবার অনুপস্থিত' : 'No Foods Added',
        language === 'bn'
          ? 'ডায়েরিতে যুক্ত করার পূর্বে খাবার বা পদ নির্বাচন করুন।'
          : 'Please add items before logging to tracker.'
      );
      return;
    }

    const currentMeal: SavedMeal = {
      id: activeDraft.id || `meal_quick_${Date.now()}`,
      userId: profile.id,
      name: activeDraft.name || (language === 'bn' ? 'আমার খাবার প্লেট' : 'My Meal Plate'),
      category: activeDraft.category,
      notes: activeDraft.notes,
      items: activeDraft.items,
      nutrition: liveNutrition,
      foodDbVersion: 'v1.1.0_infs2013',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedMealForLog(currentMeal);
    setIsLogSheetVisible(true);
  };

  const handleStartEditItem = (item: MealFoodItem) => {
    setEditingItem(item);
    setEditQtyStr(String(item.quantity));
  };

  const handleConfirmEditItem = () => {
    if (!editingItem) return;
    const newQty = Math.max(0.1, parseFloat(editQtyStr) || 1);
    updateItemQuantity(editingItem.id, newQty, editingItem.unit);
    setEditingItem(null);
  };

  return (
    <PremiumScreen>
      <PremiumHeader
        title={t.mealMakerTitle}
        subtitle={language === 'bn' ? 'নিজের খাবার তৈরি করুন' : 'Compose your custom meal'}
        showBack
        rightAction={
          <TouchableOpacity
            style={[styles.headerSaveBtn, { backgroundColor: theme.primary }]}
            onPress={handleSaveMealAction}
            activeOpacity={0.8}
          >
            <Save size={16} color={theme.textInverse} />
            <Text style={[styles.headerSaveText, { color: theme.textInverse }]}>
              {t.save}
            </Text>
          </TouchableOpacity>
        }
      />

      {/* 1. Meal Information Card */}
      <BentoCard style={styles.infoCard}>
        <Text style={[styles.fieldLabel, { color: theme.text }]}>
          {t.mealName}
        </Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
          placeholder={language === 'bn' ? 'যেমন: আমার দুপুরের খাবার থালি' : 'e.g. My Lunch Plate'}
          placeholderTextColor={theme.textMuted}
          value={activeDraft.name}
          onChangeText={setDraftName}
        />

        <Text style={[styles.fieldLabel, { color: theme.text, marginTop: spacing.xs }]}>
          {t.mealCategory}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {mealCategories.map((mc) => {
            const isSelected = activeDraft.category === mc.id;
            return (
              <TouchableOpacity
                key={mc.id}
                style={[
                  styles.categoryTab,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surfaceMuted,
                    borderColor: isSelected ? theme.primary : theme.borderSubtle,
                  },
                ]}
                onPress={() => setDraftCategory(mc.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    { color: isSelected ? theme.textInverse : theme.text },
                    isSelected && { fontWeight: '700' },
                  ]}
                >
                  {language === 'bn' ? mc.label_bn : mc.label_en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.fieldLabel, { color: theme.text, marginTop: spacing.sm }]}>
          {t.notes}
        </Text>
        <TextInput
          style={[styles.textInput, styles.notesInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
          placeholder={language === 'bn' ? 'ঐচ্ছিক স্বাস্থ্য নোট বা খাবার সংক্রান্ত মন্তব্য...' : 'Optional notes...'}
          placeholderTextColor={theme.textMuted}
          value={activeDraft.notes || ''}
          onChangeText={setDraftNotes}
          multiline
        />
      </BentoCard>

      {/* 2. Live Nutrition Summary */}
      <LiveMealNutritionCard nutrition={liveNutrition} />

      {/* 3. Meal Composition Items */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t.mealComposition} ({activeDraft.items.length})
        </Text>
        <TouchableOpacity
          style={[styles.addFoodPillBtn, { backgroundColor: theme.primaryLight + '26', borderColor: theme.primary }]}
          onPress={() => setIsSearchModalVisible(true)}
          activeOpacity={0.7}
        >
          <Plus size={15} color={theme.primary} />
          <Text style={[styles.addFoodPillText, { color: theme.primary }]}>
            {language === 'bn' ? '+ খাবার যোগ করুন' : '+ Add Food'}
          </Text>
        </TouchableOpacity>
      </View>

      {activeDraft.items.length === 0 ? (
        <BentoCard style={styles.emptyItemsCard}>
          <Text style={[styles.emptyItemsTitle, { color: theme.text }]}>
            {language === 'bn' ? 'থালায় কোনো খাবার নেই' : 'No Foods in This Meal'}
          </Text>
          <Text style={[styles.emptyItemsSubtitle, { color: theme.textSecondary }]}>
            {language === 'bn'
              ? 'নিচের বোতাম চেপে কাঁচা খাদ্য, রান্না করা খাবার বা ঘরোয়া রেসিপি থেকে পদ নির্বাচন করুন।'
              : 'Tap Add Food below to add raw, cooked foods or homemade recipes.'}
          </Text>
          <TouchableOpacity
            style={[styles.emptyAddBtn, { backgroundColor: theme.primary }]}
            onPress={() => setIsSearchModalVisible(true)}
            activeOpacity={0.8}
          >
            <Plus size={16} color={theme.textInverse} />
            <Text style={[styles.emptyAddBtnText, { color: theme.textInverse }]}>
              {language === 'bn' ? 'খাবার অনুসন্ধান করুন' : 'Search Foods'}
            </Text>
          </TouchableOpacity>
        </BentoCard>
      ) : (
        activeDraft.items.map((item) => (
          <MealFoodCard
            key={item.id}
            item={item}
            onEdit={handleStartEditItem}
            onRemove={removeItem}
          />
        ))
      )}

      {/* 4. Functional Nutrition & Disease Alert Section */}
      <MealAlertsSection alerts={liveAlerts} />

      {/* 5. Sticky Bottom Action Dock */}
      <View style={[styles.bottomDock, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
        <TouchableOpacity
          style={[styles.dockAddBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle }]}
          onPress={() => setIsSearchModalVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={18} color={theme.text} />
          <Text style={[styles.dockAddText, { color: theme.text }]}>
            {language === 'bn' ? 'খাবার যোগ' : 'Add Food'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dockSaveBtn, { backgroundColor: theme.surface, borderColor: theme.primary }]}
          onPress={handleSaveMealAction}
          activeOpacity={0.8}
        >
          <Save size={18} color={theme.primary} />
          <Text style={[styles.dockSaveText, { color: theme.primary }]}>
            {t.save}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dockLogBtn, { backgroundColor: theme.primary }]}
          onPress={handleOpenLogTracker}
          activeOpacity={0.8}
        >
          <Check size={18} color={theme.textInverse} />
          <Text style={[styles.dockLogText, { color: theme.textInverse }]}>
            {language === 'bn' ? 'লগ করুন' : 'Log'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Food Search & Selection Modal */}
      <Modal visible={isSearchModalVisible} animationType="slide" onRequestClose={() => setIsSearchModalVisible(false)}>
        <View style={[styles.searchModalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.searchModalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.borderSubtle }]}>
            <View style={styles.modalTitleRow}>
              <TouchableOpacity onPress={() => setIsSearchModalVisible(false)} style={styles.backBtn}>
                <ArrowLeft size={22} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitleText, { color: theme.text }]}>
                {language === 'bn' ? 'মিলে খাবার যোগ করুন' : 'Add Food to Meal'}
              </Text>
            </View>

            {/* Search Input Bar */}
            <View style={[styles.searchBox, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderSubtle }]}>
              <Search size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder={t.searchPlaceholder}
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={18} color={theme.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* State & Source Filters */}
            <View style={styles.stateFiltersStrip}>
              {[
                { id: 'ALL', label_bn: 'সব খাদ্য', label_en: 'All Foods' },
                { id: 'RAW', label_bn: 'কাঁচা (Raw)', label_en: 'Raw' },
                { id: 'COOKED', label_bn: 'রান্না (Cooked)', label_en: 'Cooked' },
                { id: 'PREPARED', label_bn: 'প্রস্তুত পদ', label_en: 'Prepared' },
                { id: 'RECIPES', label_bn: 'ঘরোয়া রেসিপি', label_en: 'Recipes' },
              ].map((sf: any) => {
                const isSelected = selectedStateFilter === sf.id;
                return (
                  <TouchableOpacity
                    key={sf.id}
                    style={[
                      styles.stateFilterChip,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.surfaceMuted,
                        borderColor: isSelected ? theme.primary : theme.borderSubtle,
                      },
                    ]}
                    onPress={() => setSelectedStateFilter(sf.id)}
                  >
                    <Text
                      style={[
                        styles.stateFilterText,
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

            {/* Categories horizontal bar */}
            {selectedStateFilter !== 'RECIPES' && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerCatScroll}>
                {categories.map((cat) => {
                  const isSelected = selectedCategoryFilter === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.pickerCatChip,
                        {
                          backgroundColor: isSelected ? theme.accent : theme.surfaceMuted,
                          borderColor: isSelected ? theme.accent : theme.borderSubtle,
                        },
                      ]}
                      onPress={() => setSelectedCategoryFilter(cat.id)}
                    >
                      <Text style={styles.pickerCatIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.pickerCatText,
                          { color: isSelected ? '#FFFFFF' : theme.text },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Search Results List */}
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => <FoodCard food={item} onPress={handleSelectFoodFromSearch} />}
            contentContainerStyle={styles.resultsListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyResultsBox}>
                <Text style={[styles.emptyResultsText, { color: theme.textMuted }]}>
                  {language === 'bn' ? 'কোনো খাবার পাওয়া যায়নি।' : 'No matching foods found.'}
                </Text>
              </View>
            }
          />
        </View>

        {/* Quantity Sheet inside Search Modal */}
        <FoodQuantitySheet
          food={foodForQuantity}
          visible={isQuantitySheetVisible}
          onClose={() => setIsQuantitySheetVisible(false)}
          onConfirm={handleConfirmAddFood}
          initialMealType={activeDraft.category === 'custom' ? 'lunch' : (activeDraft.category as MealType)}
        />
      </Modal>

      {/* Edit Food Item Quantity Modal */}
      {editingItem && (
        <Modal visible={!!editingItem} transparent animationType="fade" onRequestClose={() => setEditingItem(null)}>
          <View style={styles.editOverlay}>
            <View style={[styles.editCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.editTitle, { color: theme.text }]}>
                {language === 'bn' ? 'পরিমাণ পরিবর্তন করুন' : 'Edit Item Quantity'}
              </Text>
              <Text style={[styles.editSubtitle, { color: theme.textSecondary }]}>
                {language === 'bn' ? editingItem.name_bn : editingItem.name_en}
              </Text>

              <View style={styles.editInputRow}>
                <TextInput
                  style={[styles.editInput, { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border }]}
                  keyboardType="decimal-pad"
                  value={editQtyStr}
                  onChangeText={setEditQtyStr}
                  autoFocus
                  selectTextOnFocus
                />
                <Text style={[styles.editUnit, { color: theme.textSecondary }]}>
                  {editingItem.unit}
                </Text>
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.editCancelBtn, { borderColor: theme.borderSubtle }]}
                  onPress={() => setEditingItem(null)}
                >
                  <Text style={[styles.editCancelText, { color: theme.textSecondary }]}>
                    {t.cancel}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.editSaveBtn, { backgroundColor: theme.primary }]}
                  onPress={handleConfirmEditItem}
                >
                  <Text style={[styles.editSaveText, { color: theme.textInverse }]}>
                    {t.confirm}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Log Meal Sheet */}
      <LogMealSheet
        meal={savedMealForLog}
        visible={isLogSheetVisible}
        onClose={() => setIsLogSheetVisible(false)}
        onLogged={() => router.push('/tracker')}
      />
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  headerSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  headerSaveText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  textInput: {
    height: 44,
    borderRadius: radii.input,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  notesInput: {
    height: 60,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  categoryScroll: {
    gap: spacing.xs,
    paddingVertical: 4,
    marginBottom: spacing.xs,
  },
  categoryTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  addFoodPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  addFoodPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyItemsCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: 6,
  },
  emptyItemsTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyItemsSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
  },
  emptyAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomDock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    marginVertical: spacing.md,
  },
  dockAddBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    gap: 4,
  },
  dockAddText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dockSaveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    gap: 4,
  },
  dockSaveText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dockLogBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radii.pill,
    gap: 4,
  },
  dockLogText: {
    fontSize: 13,
    fontWeight: '700',
  },
  searchModalContainer: {
    flex: 1,
  },
  searchModalHeader: {
    paddingTop: 48,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  backBtn: {
    padding: 4,
  },
  modalTitleText: {
    fontSize: 17,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.input,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  stateFiltersStrip: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 4,
  },
  stateFilterChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateFilterText: {
    fontSize: 10,
    fontWeight: '600',
  },
  pickerCatScroll: {
    gap: 6,
    paddingVertical: 4,
  },
  pickerCatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  pickerCatIcon: {
    fontSize: 12,
  },
  pickerCatText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resultsListContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  emptyResultsBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyResultsText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  editOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  editCard: {
    width: '100%',
    borderRadius: radii.cardLarge,
    padding: spacing.lg,
  },
  editTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  editSubtitle: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  editInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  editInput: {
    flex: 1,
    height: 46,
    borderRadius: radii.md,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  editUnit: {
    fontSize: 15,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
  },
  editCancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  editSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  editSaveText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
