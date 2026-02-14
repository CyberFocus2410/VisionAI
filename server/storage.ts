
import { db } from "./db";
import {
  recipes,
  flavorCompounds,
  type Recipe,
  type FlavorCompound,
  type InsertRecipe,
} from "@shared/schema";
import { eq, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // RecipeDB
  searchRecipes(query: string): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  getAllRecipes(): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;

  // FlavorDB
  getFlavorCompounds(ingredient: string): Promise<FlavorCompound | undefined>;
  getAllFlavorCompounds(): Promise<FlavorCompound[]>;
  createFlavorCompound(fc: { ingredient: string, compounds: string[] }): Promise<FlavorCompound>;
}

export class DatabaseStorage implements IStorage {
  async searchRecipes(query: string): Promise<Recipe[]> {
    if (!query) return [];
    // Simple case-insensitive fuzzy match
    return await db
      .select()
      .from(recipes)
      .where(ilike(recipes.name, `%${query}%`))
      .limit(10);
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe;
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes);
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db.insert(recipes).values(recipe).returning();
    return newRecipe;
  }

  async getFlavorCompounds(ingredient: string): Promise<FlavorCompound | undefined> {
    // Case insensitive lookup for ingredients
    const [fc] = await db
      .select()
      .from(flavorCompounds)
      .where(ilike(flavorCompounds.ingredient, ingredient));
    return fc;
  }

  async getAllFlavorCompounds(): Promise<FlavorCompound[]> {
    return await db.select().from(flavorCompounds);
  }

  async createFlavorCompound(fc: { ingredient: string, compounds: string[] }): Promise<FlavorCompound> {
     // Check if exists first to avoid dupes during seeding
     const existing = await this.getFlavorCompounds(fc.ingredient);
     if (existing) return existing;

    const [newFc] = await db.insert(flavorCompounds).values(fc).returning();
    return newFc;
  }
}

export const storage = new DatabaseStorage();
