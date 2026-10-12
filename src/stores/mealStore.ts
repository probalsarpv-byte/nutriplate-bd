import { create } from 'zustand';
import { SavedMeal, MealCategory, MealFoodItem, MealNutritionSummary } from '../types/meal';
import { FoodItem, ServingUnit } from '../types/food';
import { MealType } from '../types/diary';
import { calculateMealNutrients, convertFoodToMealItem } from '../engines/meal/mealEngine';
import { mealDatabase, CURRENT_FOOD_DB_VERSION } from '../database/mealDatabase';
import { useDiaryStore, getTodayDateString } from './diaryStore';

interface MealDraft {
  id?: string; // If editing an existing meal
  name: string;
  category: MealCategory;
  notes?: string;
  items: MealFoodItem[];
}

interface MealStoreState {
  savedMeals: SavedMeal[];
  activeDraft: MealDraft;
  liveNutrition: MealNutritionSummary;
  isLogging: boolean;
  isLoading: boolean;

  // Actions
  loadSavedMeals: () => Promise<void>;
  initDraft: (initial?: Partial<SavedMeal>) => void;
  setDraftName: (name: string) => void;
  setDraftCategory: (category: MealCategory) => void;
  setDraftNotes: (notes: string) => void;
  addItem: (food: FoodItem, quantity: number, unit: ServingUnit, recipeId?: string) => void;
  updateItemQuantity: (itemId: string, quantity: number, unit: ServingUnit) => void;
  removeItem: (itemId: string) => void;
  replaceItem: (itemId: string, newFood: FoodItem, quantity: number, unit: ServingUnit) => void;
  clearDraft: () => void;
  saveDraft: (userId?: string, asNew?: boolean) => Promise<SavedMeal>;
  duplicateMeal: (mealId: string) => Promise<SavedMeal | null>;
  deleteMeal: (mealId: string) => Promise<boolean>;
  logMealToTracker: (params: {
    meal: SavedMeal;
    scaleFactor?: number;
    mealType?: MealType;
    date?: string;
  }) => Promise<boolean>;
}

const DEFAULT_DRAFT: MealDraft = {
  name: '',
  category: 'lunch',
  notes: '',
  items: [],
};

export const useMealStore = create<MealStoreState>((set, get) => ({
  savedMeals: [],
  activeDraft: DEFAULT_DRAFT,
  liveNutrition: calculateMealNutrients([]),
  isLogging: false,
  isLoading: false,

  loadSavedMeals: async () => {
    set({ isLoading: true });
    try {
      await mealDatabase.init();
      const meals = await mealDatabase.getAllMeals();
      set({ savedMeals: meals, isLoading: false });
    } catch (err) {
      console.warn('Failed to load saved meals:', err);
      set({ isLoading: false });
    }
  },

  initDraft: (initial) => {
    const items = initial?.items ? [...initial.items] : [];
    const draft: MealDraft = {
      id: initial?.id,
      name: initial?.name || '',
      category: initial?.category || 'lunch',
      notes: initial?.notes || '',
      items,
    };
    set({
      activeDraft: draft,
      liveNutrition: calculateMealNutrients(items),
    });
  },

  setDraftName: (name: string) =>
    set((state) => ({
      activeDraft: { ...state.activeDraft, name },
    })),

  setDraftCategory: (category: MealCategory) =>
    set((state) => ({
      activeDraft: { ...state.activeDraft, category },
    })),

  setDraftNotes: (notes: string) =>
    set((state) => ({
      activeDraft: { ...state.activeDraft, notes },
    })),

  addItem: (food: FoodItem, quantity: number, unit: ServingUnit, recipeId?: string) => {
    const newItem = convertFoodToMealItem(food, quantity, unit, recipeId);
    set((state) => {
      const updatedItems = [...state.activeDraft.items, newItem];
      return {
        activeDraft: { ...state.activeDraft, items: updatedItems },
        liveNutrition: calculateMealNutrients(updatedItems),
      };
    });
  },

  updateItemQuantity: (itemId: string, quantity: number, unit: ServingUnit) => {
    set((state) => {
      const updatedItems = state.activeDraft.items.map((item) => {
        if (item.id === itemId) {
          // Recreate with updated quantity
          const dummyFood: FoodItem = {
            code: item.foodCode,
            category: item.category,
            english: item.name_en,
            bengali: item.name_bn,
            name_en: item.name_en,
            name_bn: item.name_bn,
            edible_portion: 1,
            energy_kcal: Math.round((item.energy_kcal / (item.gramWeight || 1)) * 100),
            protein_g: Number(((item.protein_g / (item.gramWeight || 1)) * 100).toFixed(1)),
            fat_g: Number(((item.fat_g / (item.gramWeight || 1)) * 100).toFixed(1)),
            carb_g: Number(((item.carb_g / (item.gramWeight || 1)) * 100).toFixed(1)),
            fibre_g: Number(((item.fibre_g / (item.gramWeight || 1)) * 100).toFixed(1)),
            calcium_mg: item.calcium_mg !== null && item.calcium_mg !== undefined ? (item.calcium_mg / (item.gramWeight || 1)) * 100 : null,
            iron_mg: item.iron_mg !== null && item.iron_mg !== undefined ? (item.iron_mg / (item.gramWeight || 1)) * 100 : null,
            sodium_mg: item.sodium_mg !== null && item.sodium_mg !== undefined ? (item.sodium_mg / (item.gramWeight || 1)) * 100 : null,
            potassium_mg: item.potassium_mg !== null && item.potassium_mg !== undefined ? (item.potassium_mg / (item.gramWeight || 1)) * 100 : null,
            zinc_mg: item.zinc_mg !== null && item.zinc_mg !== undefined ? (item.zinc_mg / (item.gramWeight || 1)) * 100 : null,
            vitamin_c_mg: item.vitamin_c_mg !== null && item.vitamin_c_mg !== undefined ? (item.vitamin_c_mg / (item.gramWeight || 1)) * 100 : null,
            folate_mcg: item.folate_mcg !== null && item.folate_mcg !== undefined ? (item.folate_mcg / (item.gramWeight || 1)) * 100 : null,
            foodState: item.foodState,
            preparationMethod: item.preparationMethod,
            is_plant: item.is_plant,
            plant_category: item.plant_category,
            glycemic_index: item.glycemic_index,
          };
          const recomputed = convertFoodToMealItem(dummyFood, quantity, unit, item.recipeId);
          return { ...recomputed, id: item.id };
        }
        return item;
      });

      return {
        activeDraft: { ...state.activeDraft, items: updatedItems },
        liveNutrition: calculateMealNutrients(updatedItems),
      };
    });
  },

  removeItem: (itemId: string) => {
    set((state) => {
      const updatedItems = state.activeDraft.items.filter((item) => item.id !== itemId);
      return {
        activeDraft: { ...state.activeDraft, items: updatedItems },
        liveNutrition: calculateMealNutrients(updatedItems),
      };
    });
  },

  replaceItem: (itemId: string, newFood: FoodItem, quantity: number, unit: ServingUnit) => {
    const newItem = convertFoodToMealItem(newFood, quantity, unit);
    set((state) => {
      const updatedItems = state.activeDraft.items.map((item) =>
        item.id === itemId ? { ...newItem, id: itemId } : item
      );
      return {
        activeDraft: { ...state.activeDraft, items: updatedItems },
        liveNutrition: calculateMealNutrients(updatedItems),
      };
    });
  },

  clearDraft: () => {
    set({
      activeDraft: DEFAULT_DRAFT,
      liveNutrition: calculateMealNutrients([]),
    });
  },

  saveDraft: async (userId: string = 'usr_default_01', asNew: boolean = false) => {
    const state = get();
    const { activeDraft, liveNutrition } = state;
    const now = new Date().toISOString();

    const mealId = (asNew || !activeDraft.id)
      ? `meal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
      : activeDraft.id;
    const savedMeal: SavedMeal = {
      id: mealId,
      userId,
      name: activeDraft.name.trim() || 'আমার কাস্টম মিল (My Meal)',
      category: activeDraft.category,
      notes: activeDraft.notes,
      items: activeDraft.items,
      nutrition: liveNutrition,
      foodDbVersion: CURRENT_FOOD_DB_VERSION,
      createdAt: now,
      updatedAt: now,
    };

    await mealDatabase.saveMeal(savedMeal);
    await get().loadSavedMeals();
    return savedMeal;
  },

  duplicateMeal: async (mealId: string) => {
    const original = await mealDatabase.getMealById(mealId);
    if (!original) return null;

    const dupMeal: SavedMeal = {
      ...original,
      id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: `${original.name} (কপি)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await mealDatabase.saveMeal(dupMeal);
    await get().loadSavedMeals();
    return dupMeal;
  },

  deleteMeal: async (mealId: string) => {
    const success = await mealDatabase.deleteMeal(mealId);
    if (success) {
      await get().loadSavedMeals();
    }
    return success;
  },

  logMealToTracker: async ({ meal, scaleFactor = 1.0, mealType, date }) => {
    const state = get();
    if (state.isLogging) {
      // Prevent duplicate log execution from repeated rapid button taps
      return false;
    }

    set({ isLogging: true });

    try {
      const logDate = date || getTodayDateString();
      const resolvedMealType: MealType =
        mealType || (meal.category === 'custom' ? 'lunch' : (meal.category as MealType));

      const scaledKcal = Math.round(meal.nutrition.totalCalories * scaleFactor);
      const scaledCarbs = Number((meal.nutrition.totalCarbs * scaleFactor).toFixed(1));
      const scaledProtein = Number((meal.nutrition.totalProtein * scaleFactor).toFixed(1));
      const scaledFat = Number((meal.nutrition.totalFat * scaleFactor).toFixed(1));
      const scaledFibre = Number((meal.nutrition.totalFibre * scaleFactor).toFixed(1));
      const scaledWeight = Math.round(meal.nutrition.totalWeightGrams * scaleFactor);

      const scaledSodium = meal.nutrition.totalSodium !== null && meal.nutrition.totalSodium !== undefined
        ? Math.round(meal.nutrition.totalSodium * scaleFactor)
        : null;
      const scaledPotassium = meal.nutrition.totalPotassium !== null && meal.nutrition.totalPotassium !== undefined
        ? Math.round(meal.nutrition.totalPotassium * scaleFactor)
        : null;
      const scaledCalcium = meal.nutrition.totalCalcium !== null && meal.nutrition.totalCalcium !== undefined
        ? Math.round(meal.nutrition.totalCalcium * scaleFactor)
        : null;
      const scaledIron = meal.nutrition.totalIron !== null && meal.nutrition.totalIron !== undefined
        ? Number((meal.nutrition.totalIron * scaleFactor).toFixed(1))
        : null;

      // Single composite logged food entry preserving historical snapshot at logging time
      // Does not double count individual components
      useDiaryStore.getState().addCustomEntry({
        foodCode: meal.id,
        recipeId: meal.id,
        name_bn: `${meal.name}${scaleFactor !== 1 ? ` (${scaleFactor}x)` : ''}`,
        name_en: `${meal.name}${scaleFactor !== 1 ? ` (${scaleFactor}x)` : ''}`,
        mealType: resolvedMealType,
        date: logDate,
        quantity: scaleFactor,
        unit: 'plate',
        gramWeight: scaledWeight,
        foodState: 'PREPARED',
        preparationMethod: 'curry',
        nutrientBasis: 'per_serving',
        energy_kcal: scaledKcal,
        carb_g: scaledCarbs,
        protein_g: scaledProtein,
        fat_g: scaledFat,
        fibre_g: scaledFibre,
        sodium_mg: scaledSodium,
        potassium_mg: scaledPotassium,
        calcium_mg: scaledCalcium,
        iron_mg: scaledIron,
        isPlant: meal.items.some((i) => i.is_plant),
        plantCategory: 'other_vegetable',
      });

      set({ isLogging: false });
      return true;
    } catch (e) {
      console.warn('Failed to log meal:', e);
      set({ isLogging: false });
      return false;
    }
  },
}));
