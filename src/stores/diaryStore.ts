import { create } from 'zustand';
import { LoggedFoodEntry, MealType } from '../types/diary';
import { FoodItem } from '../types/food';
import { foodDatabaseAdapter, STANDARD_PORTIONS } from '../database/adapters/FoodDatabaseAdapter';

interface DiaryState {
  selectedDate: string; // YYYY-MM-DD
  entries: LoggedFoodEntry[];
  
  // Computed Daily Aggregates
  consumedCalories: number;
  consumedCarbs: number;
  consumedProtein: number;
  consumedFat: number;
  consumedFibre: number;
  consumedCalcium: number;
  consumedIron: number;
  consumedSodium: number;
  consumedPotassium: number;
  weeklyUniquePlantsCount: number;

  // Actions
  setSelectedDate: (date: string) => void;
  addFoodEntry: (params: {
    food: FoodItem;
    mealType: MealType;
    quantity: number;
    unit: keyof typeof STANDARD_PORTIONS;
    date?: string;
  }) => void;
  addCustomEntry: (entry: Omit<LoggedFoodEntry, 'id'>) => void;
  removeFoodEntry: (id: string) => void;
}

// Format today's date YYYY-MM-DD
export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// Initial realistic Bangladeshi food entries for development milestone
const INITIAL_ENTRIES: LoggedFoodEntry[] = [
  {
    id: 'entry_01',
    foodCode: '01_0042', // Ruti
    name_bn: 'রুটি',
    name_en: 'Ruti (Handmade flatbread)',
    mealType: 'breakfast',
    date: getTodayDateString(),
    quantity: 2,
    unit: 'piece',
    gramWeight: 80,
    foodState: 'COOKED',
    preparationMethod: 'roasted',
    nutrientBasis: 'per_100g_cooked',
    energy_kcal: 216,
    protein_g: 7.2,
    fat_g: 1.1,
    carb_g: 44.0,
    fibre_g: 4.8,
    calcium_mg: 24,
    iron_mg: 2.4,
    sodium_mg: 4,
    potassium_mg: 130,
    isPlant: true,
    plantCategory: 'whole_grain',
  },
  {
    id: 'entry_02',
    foodCode: '02_0007', // Lentil (Moshur dal)
    name_bn: 'মসুর ডাল (রান্না)',
    name_en: 'Lentil soup (cooked)',
    mealType: 'breakfast',
    date: getTodayDateString(),
    quantity: 1,
    unit: 'bowl',
    gramWeight: 150,
    foodState: 'COOKED',
    preparationMethod: 'boiled',
    nutrientBasis: 'per_100g_cooked',
    energy_kcal: 145,
    protein_g: 9.8,
    fat_g: 3.2,
    carb_g: 19.5,
    fibre_g: 4.2,
    calcium_mg: 30,
    iron_mg: 3.8,
    sodium_mg: 8,
    potassium_mg: 310,
    isPlant: true,
    plantCategory: 'legume',
  },
  {
    id: 'entry_03',
    foodCode: '01_0037', // Rice BR-28 boiled without salt
    name_bn: 'চাল, সিদ্ধ (ভাত)',
    name_en: 'Rice, BR-28, boiled (cooked rice)',
    mealType: 'lunch',
    date: getTodayDateString(),
    quantity: 1,
    unit: 'plate',
    gramWeight: 250,
    foodState: 'COOKED',
    preparationMethod: 'boiled',
    nutrientBasis: 'per_100g_cooked',
    energy_kcal: 273,
    protein_g: 5.3,
    fat_g: 0.3,
    carb_g: 60.8,
    fibre_g: 2.8,
    calcium_mg: 12,
    iron_mg: 0.5,
    sodium_mg: 2,
    potassium_mg: 85,
    isPlant: true,
    plantCategory: 'whole_grain',
  },
  {
    id: 'entry_04',
    foodCode: '09_0059', // Rohu fish
    name_bn: 'রুই মাছের ঝোল',
    name_en: 'Rohu fish curry',
    mealType: 'lunch',
    date: getTodayDateString(),
    quantity: 1,
    unit: 'piece',
    gramWeight: 90,
    foodState: 'PREPARED',
    preparationMethod: 'curry',
    nutrientBasis: 'per_100g_cooked',
    energy_kcal: 115,
    protein_g: 16.2,
    fat_g: 4.5,
    carb_g: 0,
    fibre_g: 0,
    calcium_mg: 150,
    iron_mg: 1.2,
    sodium_mg: 55,
    potassium_mg: 280,
    isPlant: false,
  },
  {
    id: 'entry_05',
    foodCode: '04_0016', // Lal shak
    name_bn: 'লাল শাক (রান্না)',
    name_en: 'Red amaranth (cooked)',
    mealType: 'lunch',
    date: getTodayDateString(),
    quantity: 1,
    unit: 'bowl',
    gramWeight: 120,
    foodState: 'COOKED',
    preparationMethod: 'boiled',
    nutrientBasis: 'per_100g_cooked',
    energy_kcal: 42,
    protein_g: 3.8,
    fat_g: 0.5,
    carb_g: 6.2,
    fibre_g: 3.5,
    calcium_mg: 260,
    iron_mg: 4.2,
    sodium_mg: 22,
    potassium_mg: 340,
    isPlant: true,
    plantCategory: 'leafy_green',
  },
];

function calculateAggregates(entries: LoggedFoodEntry[], currentDate: string) {
  const dayEntries = entries.filter((e) => e.date === currentDate);
  
  let calories = 0;
  let carbs = 0;
  let protein = 0;
  let fat = 0;
  let fibre = 0;
  let calcium = 0;
  let iron = 0;
  let sodium = 0;
  let potassium = 0;

  dayEntries.forEach((e) => {
    calories += e.energy_kcal;
    carbs += e.carb_g;
    protein += e.protein_g;
    fat += e.fat_g;
    fibre += e.fibre_g;
    calcium += e.calcium_mg || 0;
    iron += e.iron_mg || 0;
    sodium += e.sodium_mg || 0;
    potassium += e.potassium_mg || 0;
  });

  // Calculate unique plant species across entries
  const plantFoods = new Set<string>();
  entries.forEach((e) => {
    if (e.isPlant) {
      plantFoods.add(e.foodCode);
    }
  });

  return {
    consumedCalories: Math.round(calories),
    consumedCarbs: Number(carbs.toFixed(1)),
    consumedProtein: Number(protein.toFixed(1)),
    consumedFat: Number(fat.toFixed(1)),
    consumedFibre: Number(fibre.toFixed(1)),
    consumedCalcium: Math.round(calcium),
    consumedIron: Number(iron.toFixed(1)),
    consumedSodium: Math.round(sodium),
    consumedPotassium: Math.round(potassium),
    weeklyUniquePlantsCount: plantFoods.size,
  };
}

const today = getTodayDateString();
const initialAggregates = calculateAggregates(INITIAL_ENTRIES, today);

export const useDiaryStore = create<DiaryState>((set) => ({
  selectedDate: today,
  entries: INITIAL_ENTRIES,
  ...initialAggregates,

  setSelectedDate: (date: string) =>
    set((state) => ({
      selectedDate: date,
      ...calculateAggregates(state.entries, date),
    })),

  addFoodEntry: ({ food, mealType, quantity, unit, date }) =>
    set((state) => {
      const entryDate = date || state.selectedDate;
      const unitGrams = STANDARD_PORTIONS[unit]?.grams || 100;
      const totalGrams = unitGrams * quantity;

      const calculated = foodDatabaseAdapter.calculateNutrients(food.code, totalGrams);
      if (!calculated) return state;

      const newEntry: LoggedFoodEntry = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        foodCode: food.code,
        name_bn: food.bengali || food.name_bn || food.english,
        name_en: food.english || food.name_en || food.bengali,
        mealType,
        date: entryDate,
        quantity,
        unit,
        gramWeight: totalGrams,
        foodState: food.foodState || 'RAW',
        preparationMethod: food.preparationMethod || 'raw',
        nutrientBasis: food.nutrientBasis || (food.foodState === 'COOKED' ? 'per_100g_cooked' : 'per_100g_raw'),
        energy_kcal: calculated.energy_kcal,
        protein_g: calculated.protein_g,
        fat_g: calculated.fat_g,
        carb_g: calculated.carb_g,
        fibre_g: calculated.fibre_g,
        sodium_mg: calculated.sodium_mg,
        potassium_mg: calculated.potassium_mg,
        calcium_mg: calculated.calcium_mg,
        iron_mg: calculated.iron_mg,
        isPlant: food.is_plant,
        plantCategory: food.plant_category,
      };

      const updatedEntries = [newEntry, ...state.entries];
      return {
        entries: updatedEntries,
        ...calculateAggregates(updatedEntries, state.selectedDate),
      };
    }),

  addCustomEntry: (entry) =>
    set((state) => {
      const newEntry: LoggedFoodEntry = {
        ...entry,
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      };
      const updatedEntries = [newEntry, ...state.entries];
      return {
        entries: updatedEntries,
        ...calculateAggregates(updatedEntries, state.selectedDate),
      };
    }),

  removeFoodEntry: (id: string) =>
    set((state) => {
      const updatedEntries = state.entries.filter((e) => e.id !== id);
      return {
        entries: updatedEntries,
        ...calculateAggregates(updatedEntries, state.selectedDate),
      };
    }),
}));
