export type Language = 'bn' | 'en';

export const translations = {
  bn: {
    // Navigation
    tabHome: 'হোম',
    tabTracker: 'ফুড ট্র্যাকার',
    tabRecipes: 'রেসিপি ল্যাব',
    tabInsights: 'ইনসাইটস',
    tabProfile: 'প্রোফাইল',

    // Dashboard Hero & Greeting
    greetingMorning: 'শুভ সকাল',
    greetingAfternoon: 'শুভ দুপুর',
    greetingEvening: 'শুভ সন্ধ্যা',
    energySummary: 'দৈনিক ক্যালরি স্থিতি',
    consumed: 'গ্রহণকৃত',
    target: 'লক্ষ্যমাত্রা',
    remaining: 'অবশিষ্ট',
    exceeded: 'অতিরিক্ত',
    calories: 'ক্যালরি',
    kcal: 'কিলোক্যালরি',

    // Macronutrients
    carbs: 'কার্বোহাইড্রেট',
    protein: 'প্রোটিন',
    fat: 'ফ্যাট',
    fibre: 'ডায়েটারি ফাইবার',
    netCarbs: 'অ্যাভেইলেবল কার্ব',

    // Quick Actions
    quickAddFood: 'খাবার যুক্ত করুন',
    quickCreateRecipe: 'নতুন রেসিপি',
    quickFamilyPot: 'ফ্যামিলি পট',
    quickSmartPlate: 'স্মার্ট প্লেট',
    quickInsights: 'বিশ্লেষণ দেখুন',

    // Plant Diversity
    plantDiversityTitle: 'সাপ্তাহিক উদ্ভিজ্জ বৈচিত্র্য',
    plantDiversitySub: 'অন্ত্রের সুস্বাস্থ্যের জন্য সপ্তাহে ২৫+ উদ্ভিদের লক্ষ্য',
    uniquePlants: 'অনন্য উদ্ভিদ',
    weeklyTarget: 'সাপ্তাহিক লক্ষ্য',
    milestoneAchieved: 'অভিনন্দন! বৈচিত্র্যের মাইলফলক পূর্ণ হয়েছে',

    // Health Summary & Functional Alerts
    clinicalAlerts: 'স্বাস্থ্য ও পুষ্টি সতর্কতা',
    noAlerts: 'বর্তমান খাদ্য তালিকায় কোনো দ্বন্দ্ব বা ঝুঁকি নেই',
    dataNotice: 'ডাটা নোটিশ',
    unverifiedNutrient: 'পরিমাপ অপর্যাপ্ত',
    evidenceGrade: 'প্রমাণ মান',

    // Meals
    breakfast: 'সকালের নাশতা',
    lunch: 'দুপুরের খাবার',
    snack: 'বিকেলের নাশতা',
    dinner: 'রাতের খাবার',

    // Food Search & Quantity
    searchPlaceholder: 'খাবারের নাম খুঁজুন (যেমন: ভাত, ডাল, রুই মাছ)...',
    portionSize: 'পরিমাণ ও পরিমাপ',
    gram: 'গ্রাম',
    ml: 'মিলি',
    cup: 'কাপ',
    piece: 'টি',
    tablespoon: 'টেবিল চামচ',
    teaspoon: 'চা চামচ',
    plate: 'প্লেট',
    bowl: 'বাটি',

    // Smart Meal Maker
    mealMakerTitle: 'স্মার্ট মিল মেকার',
    mealMakerSubtitle: 'নিজের খাবার তৈরি করুন',
    savedMeals: 'সংরক্ষিত মিলসমূহ',
    createNewMeal: 'নতুন মিল তৈরি করুন',
    mealName: 'মিলের নাম',
    mealCategory: 'মিলের বিভাগ',
    mealComposition: 'খাবারের উপাদানসমূহ',
    compareMeals: 'মিল তুলনা করুন',
    addSavedMeal: 'সংরক্ষিত মিল যোগ করুন',
    nutrientCompleteness: 'পুষ্টি উপাত্তের পূর্ণতা',
    notes: 'মন্তব্য (ঐচ্ছিক)',
    portionScale: 'পরিবেশন অনুপাত',
    duplicateMeal: 'কপি তৈরি করুন',
    deleteMeal: 'মিল মুছুন',
    editMeal: 'মিল সম্পাদনা',
    logToTracker: 'ট্র্যাকারে লগ করুন',

    // Actions & Common
    add: 'যুক্ত করুন',
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',
    confirm: 'নিশ্চিত করুন',
    viewAll: 'সব দেখুন',
    recentActivity: 'সাম্প্রতিক এন্ট্রি',
    today: 'আজ',
    yesterday: 'গতকাল',
    offlineMode: 'অফলাইন মোড চালু',
  },
  en: {
    // Navigation
    tabHome: 'Home',
    tabTracker: 'Tracker',
    tabRecipes: 'Recipe Lab',
    tabInsights: 'Insights',
    tabProfile: 'Profile',

    // Dashboard Hero & Greeting
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    energySummary: 'Daily Calorie Balance',
    consumed: 'Consumed',
    target: 'Target',
    remaining: 'Remaining',
    exceeded: 'Exceeded',
    calories: 'Calories',
    kcal: 'kcal',

    // Macronutrients
    carbs: 'Carbs',
    protein: 'Protein',
    fat: 'Fat',
    fibre: 'Dietary Fibre',
    netCarbs: 'Available Carbs',

    // Quick Actions
    quickAddFood: 'Log Food',
    quickCreateRecipe: 'Create Recipe',
    quickFamilyPot: 'Family Pot',
    quickSmartPlate: 'Smart Plate',
    quickInsights: 'Insights',

    // Plant Diversity
    plantDiversityTitle: 'Weekly Plant Diversity',
    plantDiversitySub: 'Target 25+ unique plants weekly for gut microbiome health',
    uniquePlants: 'Unique Plants',
    weeklyTarget: 'Weekly Goal',
    milestoneAchieved: 'Milestone reached! Excellent dietary diversity',

    // Health Summary & Functional Alerts
    clinicalAlerts: 'Health & Nutrient Alerts',
    noAlerts: 'No clinical food conflicts detected for today',
    dataNotice: 'Data Notice',
    unverifiedNutrient: 'Data unavailable',
    evidenceGrade: 'Evidence Grade',

    // Meals
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    snack: 'Snack',
    dinner: 'Dinner',

    // Food Search & Quantity
    searchPlaceholder: 'Search foods (e.g., Rice, Lentil, Rohu fish)...',
    portionSize: 'Portion & Units',
    gram: 'g',
    ml: 'ml',
    cup: 'cup',
    piece: 'pc',
    tablespoon: 'tbsp',
    teaspoon: 'tsp',
    plate: 'plate',
    bowl: 'bowl',

    // Smart Meal Maker
    mealMakerTitle: 'Smart Meal Maker',
    mealMakerSubtitle: 'Compose your custom meal',
    savedMeals: 'Saved Meals',
    createNewMeal: 'Create New Meal',
    mealName: 'Meal Name',
    mealCategory: 'Meal Category',
    mealComposition: 'Meal Composition',
    compareMeals: 'Compare Meals',
    addSavedMeal: 'Add Saved Meal',
    nutrientCompleteness: 'Nutrient Data Completeness',
    notes: 'Notes (Optional)',
    portionScale: 'Serving Portion Scale',
    duplicateMeal: 'Duplicate Meal',
    deleteMeal: 'Delete Meal',
    editMeal: 'Edit Meal',
    logToTracker: 'Log to Tracker',

    // Actions & Common
    add: 'Add',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    viewAll: 'View All',
    recentActivity: 'Recent Activity',
    today: 'Today',
    yesterday: 'Yesterday',
    offlineMode: 'Offline Mode Active',
  },
};
