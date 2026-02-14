
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === SEED DATA ===
  // In a real app this would be a script, but for this demo we'll init on start
  await seedData();

  // === API ROUTES ===

  // Search Recipes
  app.get(api.recipes.search.path, async (req, res) => {
    const q = req.query.q as string;
    const results = await storage.searchRecipes(q);
    res.json(results);
  });

  app.get(api.recipes.getAll.path, async (req, res) => {
      const results = await storage.getAllRecipes();
      res.json(results);
  });

  // Analyze Recipe
  app.post(api.analysis.analyze.path, async (req, res) => {
    try {
      const input = api.analysis.analyze.input.parse(req.body);
      const recipe = await storage.getRecipe(input.recipeId);

      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      // Filter out muted ingredient if any
      const activeIngredients = recipe.ingredients.filter(
        (ing) => !input.mutedIngredient || ing.toLowerCase() !== input.mutedIngredient.toLowerCase()
      );

      // Fetch flavor compounds for all active ingredients
      const compoundMap = new Map<string, string[]>(); // ingredient -> compounds
      for (const ing of activeIngredients) {
        const fc = await storage.getFlavorCompounds(ing);
        if (fc) {
          compoundMap.set(ing, fc.compounds);
        } else {
          compoundMap.set(ing, []); // No data found
        }
      }

      // Calculate Harmony Score
      // Formula: (Total shared flavor compounds across ingredient pairs) / (Total unique flavor compounds in recipe)
      const allCompounds = new Set<string>();
      let sharedCount = 0;

      // Collect all unique compounds
      for (const compounds of compoundMap.values()) {
        compounds.forEach(c => allCompounds.add(c));
      }

      // Count shared pairs
      const ingredientsList = Array.from(compoundMap.keys());
      const pairShared = new Set<string>(); // To track which compounds are shared

      for (let i = 0; i < ingredientsList.length; i++) {
        for (let j = i + 1; j < ingredientsList.length; j++) {
          const ingA = ingredientsList[i];
          const ingB = ingredientsList[j];
          const compoundsA = compoundMap.get(ingA) || [];
          const compoundsB = compoundMap.get(ingB) || [];

          // Find intersection
          const intersection = compoundsA.filter(c => compoundsB.includes(c));
          sharedCount += intersection.length;
        }
      }

      const totalUnique = allCompounds.size;
      const harmonyScore = totalUnique > 0 ? sharedCount / totalUnique : 0;
      
      let harmonyLabel = "Low Harmony";
      if (harmonyScore > 0.5) harmonyLabel = "High Harmony";
      else if (harmonyScore > 0.2) harmonyLabel = "Moderate Harmony";

      // Ingredient Analysis Data
      const ingredientAnalysis = ingredientsList.map(ing => {
        const compounds = compoundMap.get(ing) || [];
        const otherIngredients = ingredientsList.filter(i => i !== ing);
        const sharedWithOthers = new Set<string>();
        
        compounds.forEach(c => {
          // Check if this compound exists in any OTHER ingredient
          for (const other of otherIngredients) {
            if (compoundMap.get(other)?.includes(c)) {
              sharedWithOthers.add(c);
              break; 
            }
          }
        });

        return {
          ingredient: ing,
          compoundCount: compounds.length,
          sharedCompounds: Array.from(sharedWithOthers)
        };
      });

      // Molecular Bridge Suggestions
      // Find ingredients from FlavorDB that share compounds with the active ingredients
      // For simplicity in this demo, we'll scan all known ingredients in DB
      const allFlavorEntries = await storage.getAllFlavorCompounds();
      const suggestions = [];

      for (const entry of allFlavorEntries) {
        // Skip if already in recipe
        if (activeIngredients.some(i => i.toLowerCase() === entry.ingredient.toLowerCase())) continue;

        // Calculate overlap with current recipe's ALL compounds
        const entryCompounds = entry.compounds;
        const overlap = entryCompounds.filter(c => allCompounds.has(c));
        
        if (overlap.length > 0) {
          suggestions.push({
            name: entry.ingredient,
            sharedCount: overlap.length,
            compounds: overlap
          });
        }
      }

      // Sort by overlap count and take top 3
      const topSuggestions = suggestions
        .sort((a, b) => b.sharedCount - a.sharedCount)
        .slice(0, 3);

      res.json({
        recipe,
        harmonyScore,
        harmonyLabel,
        ingredientAnalysis,
        bridgeSuggestions: topSuggestions
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request" });
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}

async function seedData() {
  const recipes = await storage.getAllRecipes();
  if (recipes.length > 0) return;

  console.log("Seeding RecipeDB and FlavorDB...");

  // Seed FlavorDB (Ingredients & Compounds)
  // Real-ish data
  const flavorData = [
    { ingredient: "Chicken", compounds: ["glutamic_acid", "methional", "hexanal"] },
    { ingredient: "Lemon", compounds: ["limonene", "citral", "terpinene", "beta-pinene"] },
    { ingredient: "Garlic", compounds: ["allicin", "sulfur", "methional", "allyl_mercaptan"] },
    { ingredient: "Olive Oil", compounds: ["oleic_acid", "hexanal", "polyphenols"] },
    { ingredient: "Tomato", compounds: ["glutamic_acid", "furaneol", "hexanal", "beta-ionone"] },
    { ingredient: "Basil", compounds: ["estragole", "linalool", "eucalyptol", "beta-pinene"] },
    { ingredient: "Mozzarella", compounds: ["diacetyl", "methional", "butyric_acid"] },
    { ingredient: "Onion", compounds: ["sulfur", "dipropyl_disulfide", "quercetin", "allicin"] },
    { ingredient: "Ginger", compounds: ["gingerol", "limonene", "citral", "camphene"] },
    { ingredient: "Soy Sauce", compounds: ["glutamic_acid", "methional", "furan"] },
    { ingredient: "Honey", compounds: ["fructose", "glucose", "phenylacetaldehyde"] },
    { ingredient: "Cinnamon", compounds: ["cinnamaldehyde", "eugenol", "linalool"] },
    { ingredient: "Apple", compounds: ["farnesene", "acetaldehyde", "ester"] },
    { ingredient: "Pork", compounds: ["oleic_acid", "thiamine", "glutamic_acid"] },
    { ingredient: "Chocolate", compounds: ["theobromine", "pyrazine", "linalool", "vanillin"] },
    { ingredient: "Coffee", compounds: ["caffeine", "pyrazine", "methional", "guaiacol"] },
    { ingredient: "Vanilla", compounds: ["vanillin", "piperonal", "eugenol"] },
    { ingredient: "Strawberry", compounds: ["furaneol", "ethyl_butyrate", "linalool"] },
    { ingredient: "Mint", compounds: ["menthol", "carvone", "limonene"] },
    { ingredient: "Lime", compounds: ["limonene", "citral", "terpineol"] },
  ];

  for (const f of flavorData) {
    await storage.createFlavorCompound(f);
  }

  // Seed RecipeDB
  const recipeData = [
    { name: "Lemon Chicken", ingredients: ["Chicken", "Lemon", "Garlic", "Olive Oil"] },
    { name: "Caprese Salad", ingredients: ["Tomato", "Basil", "Mozzarella", "Olive Oil"] },
    { name: "Tomato Soup", ingredients: ["Tomato", "Onion", "Garlic", "Olive Oil"] },
    { name: "Ginger Tea", ingredients: ["Ginger", "Honey", "Lemon"] },
    { name: "Pork Roast", ingredients: ["Pork", "Garlic", "Onion", "Apple"] },
    { name: "Chocolate Lava Cake", ingredients: ["Chocolate", "Butter", "Sugar", "Eggs"] }, // Some ingredients missing from FlavorDB, that's fine/realistic
    { name: "Teriyaki Chicken", ingredients: ["Chicken", "Soy Sauce", "Ginger", "Garlic"] },
    { name: "Apple Pie", ingredients: ["Apple", "Cinnamon", "Sugar", "Butter"] },
    { name: "Mojito", ingredients: ["Lime", "Mint", "Sugar", "Rum"] },
    { name: "Garlic Bread", ingredients: ["Bread", "Garlic", "Butter", "Parsley"] },
    { name: "Strawberry Shortcake", ingredients: ["Strawberry", "Cream", "Biscuit", "Sugar"] },
    { name: "Coffee Cake", ingredients: ["Coffee", "Cinnamon", "Sugar", "Flour"] },
    { name: "Vanilla Ice Cream", ingredients: ["Vanilla", "Cream", "Sugar"] },
    { name: "Guacamole", ingredients: ["Avocado", "Lime", "Onion", "Cilantro"] },
    { name: "Bruschetta", ingredients: ["Tomato", "Basil", "Garlic", "Olive Oil", "Bread"] },
    { name: "Honey Glazed Ham", ingredients: ["Pork", "Honey", "Clove"] },
    { name: "Spicy Tofu", ingredients: ["Tofu", "Chili", "Soy Sauce", "Garlic"] },
    { name: "Roast Beef", ingredients: ["Beef", "Rosemary", "Garlic", "Pepper"] },
    { name: "Mushroom Risotto", ingredients: ["Mushroom", "Rice", "Onion", "Parmesan"] },
    { name: "Caesar Salad", ingredients: ["Lettuce", "Parmesan", "Croutons", "Lemon", "Garlic"] },
  ];

  for (const r of recipeData) {
    await storage.createRecipe(r);
  }
}
