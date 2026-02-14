import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ingredients: text("ingredients").array().notNull(), // Array of ingredient strings
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fat: integer("fat").notNull(),
  category: text("category").notNull(), // 'patient', 'weight_loss', 'weight_gain'
  dietType: text("diet_type").notNull().default('nonveg'), // 'veg', 'nonveg', 'egg'
  oilLevel: text("oil_level").notNull().default('medium'), // 'low', 'medium', 'high'
  nutrients: text("nutrients").array().notNull().default([]), // ['high_protein', 'iron_rich', etc]
  steps: text("steps").array().notNull(),
  imageUrl: text("image_url"),
});

// === BASE SCHEMAS ===
export const insertRecipeSchema = createInsertSchema(recipes);

// === EXPLICIT API CONTRACT TYPES ===
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;

// Request types
export type AnalyzeRequest = {
  diseases: string[];
  allergies: string[];
  avoidItems: string[];
  availableIngredients: string[];
  mode: 'patient' | 'weight_loss' | 'weight_gain';
  dietPreference: 'veg' | 'nonveg' | 'egg';
  nutrientDeficiencies: string[]; // ['protein', 'iron', etc]
  lowOilPreferred: boolean;
};

// Response types
export type RecipeMatch = Recipe & {
  matchPercentage: number;
};

export type AnalysisResponse = {
  safeRecipes: RecipeMatch[];
  restrictedIngredients: string[];
};
