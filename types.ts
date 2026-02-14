export type GoalCategory = 'disease' | 'weight-loss' | 'weight-gain' | 'recipe-discovery';

export interface UserProfile {
  primaryGoal: GoalCategory;
  conditions: string;
  diet: 'Veg' | 'Non-Veg' | 'Eggetarian';
  oilLevel: 'Low-Oily' | 'Medium' | 'High-Oily';
  allergies: string;
  nutrientFocus: string;
  availableIngredients: string;
  dailyGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface FlavorDBPairing {
  base: string;
  suggestion: string;
  reason: string;
}

export interface NutritionInfo {
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  micros: string;
}

export interface RecipeDetails {
  ingredients: { name: string; quantity: string }[];
  steps: string[];
  nutrition: NutritionInfo;
  safetyReasoning: string;
}

export interface Recipe {
  id: number;
  name: string;
  keyIngredients: string[];
  primaryBenefit: string;
  details: RecipeDetails;
}

export interface AnalysisResult {
  analysis: {
    avoid: string[];
    preferred: string[];
    medicalReasoning: string;
  };
  flavorDB: {
    suggestions: FlavorDBPairing[];
    expansionReasoning: string;
  };
  recipes: Recipe[];
}

export enum AppStep {
  LANDING = 'LANDING',
  INPUT = 'INPUT',
  PROCESSING = 'PROCESSING',
  SELECTION = 'SELECTION',
  DETAIL = 'DETAIL',
}