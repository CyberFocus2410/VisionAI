
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
// We will store recipes and flavor data in the database to act as the "RecipeDB" and "FlavorDB"
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ingredients: text("ingredients").array().notNull(), // Array of ingredient names
});

export const flavorCompounds = pgTable("flavor_compounds", {
  id: serial("id").primaryKey(),
  ingredient: text("ingredient").notNull().unique(),
  compounds: text("compounds").array().notNull(), // Array of chemical compound names
});

// === SCHEMAS ===
export const insertRecipeSchema = createInsertSchema(recipes).omit({ id: true });
export const insertFlavorCompoundSchema = createInsertSchema(flavorCompounds).omit({ id: true });

// === TYPES ===
export type Recipe = typeof recipes.$inferSelect;
export type FlavorCompound = typeof flavorCompounds.$inferSelect;

// === API TYPES ===

// Response for search
export type RecipeSearchResult = Recipe[];

// Request for analysis
export const analyzeRequestSchema = z.object({
  recipeId: z.number(),
  mutedIngredient: z.string().optional(),
});
export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

// Response for analysis
export interface IngredientAnalysis {
  ingredient: string;
  compoundCount: number;
  sharedCompounds: string[];
}

export interface BridgeSuggestion {
  name: string;
  sharedCount: number;
  compounds: string[];
}

export interface AnalysisResponse {
  recipe: Recipe;
  harmonyScore: number;
  harmonyLabel: "High Harmony" | "Moderate Harmony" | "Low Harmony";
  ingredientAnalysis: IngredientAnalysis[];
  bridgeSuggestions: BridgeSuggestion[];
}
