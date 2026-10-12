import { SavedMeal, MealCategory, MealFoodItem, MealNutritionSummary } from '../types/meal';

export const CURRENT_FOOD_DB_VERSION = 'v1.1.0_infs2013';
export const MEAL_SCHEMA_VERSION = 1;

/**
 * Storage interface for Saved Meals
 */
export interface IMealDatabase {
  init(): Promise<void>;
  saveMeal(meal: SavedMeal): Promise<void>;
  getMealById(id: string): Promise<SavedMeal | null>;
  getAllMeals(userId?: string): Promise<SavedMeal[]>;
  updateMeal(meal: SavedMeal): Promise<void>;
  deleteMeal(id: string): Promise<boolean>;
  checkVersionCompatibility(meal: SavedMeal): {
    isCompatible: boolean;
    requiresMigration: boolean;
    message_bn: string;
    message_en: string;
  };
}

/**
 * SQLite Meal Database implementation with migration-safe tables
 * and in-memory fallback for test runners / environments where native SQLite is unavailable.
 */
class MealDatabase implements IMealDatabase {
  private db: any = null;
  private isUsingFallback: boolean = false;
  private fallbackStore: Map<string, SavedMeal> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.seedDefaultMeals();
  }

  private seedDefaultMeals() {
    // Initial standard Bangladeshi balanced meals
    const defaultMeal1: SavedMeal = {
      id: 'meal_traditional_lunch_01',
      userId: 'usr_default_01',
      name: 'চিরাচরিত সুষম দুপুরের খাবার',
      category: 'lunch',
      notes: 'ভাত, ডাল, রুই মাছের তরকারি ও লাল শাকের সুষম সমন্বয়',
      foodDbVersion: CURRENT_FOOD_DB_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: 'mfi_init_1',
          foodCode: '01_0037', // Cooked Rice BR-28
          name_bn: 'চাল, সিদ্ধ (ভাত)',
          name_en: 'Rice, BR-28, boiled',
          category: 'Cereals and their products',
          foodState: 'COOKED',
          quantity: 1,
          unit: 'cup',
          gramWeight: 150,
          energy_kcal: 164,
          protein_g: 3.2,
          fat_g: 0.2,
          carb_g: 36.5,
          fibre_g: 1.7,
          calcium_mg: 7,
          iron_mg: 0.3,
          sodium_mg: 1,
          potassium_mg: 51,
          is_plant: true,
        },
        {
          id: 'mfi_init_2',
          foodCode: '02_0007', // Lentils
          name_bn: 'মসুর ডাল (রান্না)',
          name_en: 'Lentil soup (cooked)',
          category: 'Pulses, legumes and their products',
          foodState: 'COOKED',
          quantity: 1,
          unit: 'bowl',
          gramWeight: 150,
          energy_kcal: 145,
          protein_g: 9.8,
          fat_g: 3.2,
          carb_g: 19.5,
          fibre_g: 4.2,
          calcium_mg: 30,
          iron_mg: 3.8,
          sodium_mg: 8,
          potassium_mg: 310,
          is_plant: true,
        },
        {
          id: 'mfi_init_3',
          foodCode: 'PREP_ROHU_CURRY', // Rohu fish curry
          name_bn: 'রুই মাছের ঝোল (কারি)',
          name_en: 'Rohu Fish Curry',
          category: 'Fish, shellfish and their products',
          foodState: 'PREPARED',
          quantity: 1,
          unit: 'piece',
          gramWeight: 100,
          energy_kcal: 138,
          protein_g: 13.5,
          fat_g: 8.2,
          carb_g: 2.1,
          fibre_g: 0.6,
          calcium_mg: 125,
          iron_mg: 1.4,
          sodium_mg: 280,
          potassium_mg: 290,
          is_plant: false,
        },
        {
          id: 'mfi_init_4',
          foodCode: '04_0016', // Lal shak
          name_bn: 'লাল শাক (রান্না)',
          name_en: 'Red amaranth (cooked)',
          category: 'Vegetables and their products',
          foodState: 'COOKED',
          quantity: 1,
          unit: 'bowl',
          gramWeight: 100,
          energy_kcal: 35,
          protein_g: 3.2,
          fat_g: 0.4,
          carb_g: 5.2,
          fibre_g: 2.9,
          calcium_mg: 217,
          iron_mg: 3.5,
          sodium_mg: 18,
          potassium_mg: 283,
          is_plant: true,
        },
      ],
      nutrition: {
        totalCalories: 482,
        totalCarbs: 63.3,
        availableCarbs: 53.9,
        totalProtein: 29.7,
        totalFat: 12.0,
        totalFibre: 9.4,
        totalCalcium: 379,
        totalIron: 9.0,
        totalSodium: 307,
        totalPotassium: 934,
        totalZinc: null,
        totalVitaminC: null,
        totalFolate: null,
        totalWeightGrams: 500,
        glycemicLoad: null,
        uniquePlantCount: 3,
        nutrientCompletenessPercent: 71,
        analyzedNutrientCount: 20,
        totalTrackedNutrientCount: 28,
      },
    };

    const defaultMeal2: SavedMeal = {
      id: 'meal_breakfast_ruti_egg_02',
      userId: 'usr_default_01',
      name: 'সকালের আদর্শ নাশতা (রুটি-ডিম-সবজি)',
      category: 'breakfast',
      notes: '২টি আটার রুটি, ১টি সিদ্ধ ডিম ও ভাজি',
      foodDbVersion: CURRENT_FOOD_DB_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: 'mfi_init_5',
          foodCode: '01_0042', // Ruti
          name_bn: 'হাতে তৈরি আটার রুটি',
          name_en: 'Ruti (Handmade flatbread)',
          category: 'Cereals and their products',
          foodState: 'COOKED',
          quantity: 2,
          unit: 'piece',
          gramWeight: 80,
          energy_kcal: 216,
          protein_g: 7.2,
          fat_g: 1.1,
          carb_g: 44.0,
          fibre_g: 4.8,
          calcium_mg: 24,
          iron_mg: 2.4,
          sodium_mg: 4,
          potassium_mg: 130,
          is_plant: true,
        },
        {
          id: 'mfi_init_6',
          foodCode: '11_0005', // Boiled Egg
          name_bn: 'সিদ্ধ মুরগির ডিম',
          name_en: 'Egg, chicken, boiled',
          category: 'Eggs and their products',
          foodState: 'COOKED',
          quantity: 1,
          unit: 'piece',
          gramWeight: 50,
          energy_kcal: 77,
          protein_g: 6.3,
          fat_g: 5.3,
          carb_g: 0.6,
          fibre_g: 0,
          calcium_mg: 25,
          iron_mg: 0.9,
          sodium_mg: 62,
          potassium_mg: 63,
          is_plant: false,
        },
        {
          id: 'mfi_init_7',
          foodCode: '03_0033', // Begun Bhaja
          name_bn: 'বেগুন ভাজা',
          name_en: 'Fried Eggplant',
          category: 'Vegetables and their products',
          foodState: 'COOKED',
          quantity: 1,
          unit: 'piece',
          gramWeight: 75,
          energy_kcal: 78,
          protein_g: 1.4,
          fat_g: 6.2,
          carb_g: 4.9,
          fibre_g: 2.4,
          calcium_mg: 15,
          iron_mg: 0.8,
          sodium_mg: 120,
          potassium_mg: 158,
          is_plant: true,
        },
      ],
      nutrition: {
        totalCalories: 371,
        totalCarbs: 49.5,
        availableCarbs: 42.3,
        totalProtein: 14.9,
        totalFat: 12.6,
        totalFibre: 7.2,
        totalCalcium: 64,
        totalIron: 4.1,
        totalSodium: 186,
        totalPotassium: 351,
        totalZinc: null,
        totalVitaminC: null,
        totalFolate: null,
        totalWeightGrams: 205,
        glycemicLoad: null,
        uniquePlantCount: 2,
        nutrientCompletenessPercent: 71,
        analyzedNutrientCount: 15,
        totalTrackedNutrientCount: 21,
      },
    };

    this.fallbackStore.set(defaultMeal1.id, defaultMeal1);
    this.fallbackStore.set(defaultMeal2.id, defaultMeal2);
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Attempt to load expo-sqlite if available in the current environment
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const SQLite = require('expo-sqlite');
      if (SQLite && (SQLite as any).openDatabaseSync) {
        this.db = (SQLite as any).openDatabaseSync('nutriplate_bd.db');
        await this.runMigrations();
        this.isUsingFallback = false;
        this.isInitialized = true;
        return;
      }
    } catch (e) {
      // Native SQLite is not loaded in this environment (e.g. Node.js unit tests or web)
      // Fallback in-memory store remains fully active and consistent
      this.isUsingFallback = true;
      this.isInitialized = true;
    }

    this.isUsingFallback = true;
    this.loadFromWebStorage();
    this.isInitialized = true;
  }

  private loadFromWebStorage(): void {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const stored = window.localStorage.getItem('nutriplate_saved_meals_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach((m: SavedMeal) => {
              if (m && m.id) {
                this.fallbackStore.set(m.id, m);
              }
            });
          }
        }
      }
    } catch (e) {
      // Ignore in non-browser environments
    }
  }

  private persistToWebStorage(): void {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const allMeals = Array.from(this.fallbackStore.values());
        window.localStorage.setItem('nutriplate_saved_meals_v1', JSON.stringify(allMeals));
      }
    } catch (e) {
      // Ignore in non-browser environments
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) return;

    try {
      // 1. Create migrations tracking table
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY,
          applied_at TEXT NOT NULL
        );
      `);

      // 2. Create saved_meals table
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS saved_meals (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          notes TEXT,
          items_json TEXT NOT NULL,
          nutrition_json TEXT NOT NULL,
          db_version TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // 3. Create index for fast retrieval by user & category
      this.db.execSync(`
        CREATE INDEX IF NOT EXISTS idx_saved_meals_user ON saved_meals (user_id);
        CREATE INDEX IF NOT EXISTS idx_saved_meals_category ON saved_meals (category);
      `);

      // 4. Mark migration applied
      this.db.execSync(`
        INSERT OR IGNORE INTO schema_migrations (version, applied_at)
        VALUES (${MEAL_SCHEMA_VERSION}, '${new Date().toISOString()}');
      `);
    } catch (err) {
      console.warn('SQLite migration error, falling back to memory store:', err);
      this.isUsingFallback = true;
    }
  }

  public async saveMeal(meal: SavedMeal): Promise<void> {
    await this.init();

    // Always update fallback store
    this.fallbackStore.set(meal.id, { ...meal });
    this.persistToWebStorage();

    if (!this.isUsingFallback && this.db) {
      try {
        const stmt = this.db.prepareSync(`
          INSERT OR REPLACE INTO saved_meals (
            id, user_id, name, category, notes, items_json, nutrition_json, db_version, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.executeSync([
          meal.id,
          meal.userId,
          meal.name,
          meal.category,
          meal.notes || '',
          JSON.stringify(meal.items),
          JSON.stringify(meal.nutrition),
          meal.foodDbVersion,
          meal.createdAt,
          meal.updatedAt,
        ]);
      } catch (err) {
        console.warn('Failed to persist in SQLite, saved in memory:', err);
      }
    }
  }

  public async getMealById(id: string): Promise<SavedMeal | null> {
    await this.init();

    if (!this.isUsingFallback && this.db) {
      try {
        const row = this.db.getFirstSync(
          'SELECT * FROM saved_meals WHERE id = ?',
          [id]
        );
        if (row) {
          return this.mapRowToSavedMeal(row);
        }
      } catch (err) {
        console.warn('SQLite fetch error, falling back to memory store:', err);
      }
    }

    return this.fallbackStore.get(id) || null;
  }

  public async getAllMeals(userId: string = 'usr_default_01'): Promise<SavedMeal[]> {
    await this.init();

    if (!this.isUsingFallback && this.db) {
      try {
        const rows = this.db.getAllSync(
          'SELECT * FROM saved_meals WHERE user_id = ? ORDER BY updated_at DESC',
          [userId]
        );
        if (rows && rows.length > 0) {
          return rows.map((r: any) => this.mapRowToSavedMeal(r));
        }
      } catch (err) {
        console.warn('SQLite getAll error, falling back to memory store:', err);
      }
    }

    return Array.from(this.fallbackStore.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public async updateMeal(meal: SavedMeal): Promise<void> {
    const updatedMeal: SavedMeal = {
      ...meal,
      updatedAt: new Date().toISOString(),
    };
    await this.saveMeal(updatedMeal);
  }

  public async deleteMeal(id: string): Promise<boolean> {
    await this.init();
    const existed = this.fallbackStore.delete(id);
    this.persistToWebStorage();

    if (!this.isUsingFallback && this.db) {
      try {
        const stmt = this.db.prepareSync('DELETE FROM saved_meals WHERE id = ?');
        stmt.executeSync([id]);
        return true;
      } catch (err) {
        console.warn('SQLite delete error:', err);
      }
    }

    return existed;
  }

  /**
   * Evaluates if a saved meal has version mismatch with current food database
   */
  public checkVersionCompatibility(meal: SavedMeal): {
    isCompatible: boolean;
    requiresMigration: boolean;
    message_bn: string;
    message_en: string;
  } {
    if (meal.foodDbVersion === CURRENT_FOOD_DB_VERSION) {
      return {
        isCompatible: true,
        requiresMigration: false,
        message_bn: 'উপাত্ত বর্তমান সংস্করণের সাথে সম্পূর্ণ সামঞ্জস্যপূর্ণ।',
        message_en: 'Data is fully compatible with the current food database version.',
      };
    }

    return {
      isCompatible: false,
      requiresMigration: true,
      message_bn: `মিলটি তৈরি হয়েছিল সংস্করণ ${meal.foodDbVersion}-এ। বর্তমান সংস্করণের সাথে পুষ্টি মান পুনর্গণনা করা যেতে পারে।`,
      message_en: `Meal was authored in version ${meal.foodDbVersion}. Nutrient values can be recalculated against the active database.`,
    };
  }

  private mapRowToSavedMeal(row: any): SavedMeal {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      category: row.category as MealCategory,
      notes: row.notes,
      items: JSON.parse(row.items_json),
      nutrition: JSON.parse(row.nutrition_json),
      foodDbVersion: row.db_version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const mealDatabase = new MealDatabase();
