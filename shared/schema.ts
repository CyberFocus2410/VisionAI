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
  category: text("category").notNull(), // 'patient', 'weight_loss', 'weight_gain' (can be multiple, storing primary here or just tags)
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
  diseases: string[]; // List of disease IDs/names
  allergies: string[]; // List of specific ingredient names to avoid
  avoidItems: string[]; // User preference avoid list
  availableIngredients: string[]; // What user has at home
  mode: 'patient' | 'weight_loss' | 'weight_gain';
};

// Response types
export type RecipeMatch = Recipe & {
  matchPercentage: number;
  isSafe: boolean;
  reason?: string; // Why it might be unsafe (if we ever show unsafe ones, but per req we filter them)
};

export type AnalysisResponse = {
  safeRecipes: RecipeMatch[];
  restrictedIngredients: string[]; // Debug/Info: what ingredients were filtered out
};

// Disease Knowledge Base Types (Static data structure, but good to have typed)
export type DiseaseDefinition = {
  id: string;
  name: string;
  avoidIngredients: string[];
};
