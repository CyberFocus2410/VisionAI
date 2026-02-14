import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { fetchRecipesFromFoodoscope, getRecipeDetails } from "./foodoscope";

// === STATIC DISEASE DATA ===
const DISEASES = [
  { id: "diabetes", name: "Diabetes", avoidIngredients: ["sugar", "honey", "jaggery", "white rice", "refined flour", "potato", "soda", "candy", "cake"] },
  { id: "hypertension", name: "Hypertension (High BP)", avoidIngredients: ["salt", "pickle", "processed meat", "canned soup", "salty snacks", "soy sauce"] },
  { id: "heart_disease", name: "Heart Disease", avoidIngredients: ["butter", "red meat", "fried food", "processed meat", "full fat dairy", "palm oil"] },
  { id: "thyroid", name: "Thyroid", avoidIngredients: ["soy", "cauliflower", "cabbage", "broccoli", "gluten", "sugar"] },
  { id: "asthma", name: "Asthma", avoidIngredients: ["sulfites", "wine", "dried fruit", "pickles", "shrimp", "processed potato"] },
  { id: "obesity", name: "Obesity", avoidIngredients: ["sugar", "fried food", "fast food", "soda", "ice cream", "cake", "pizza", "burger"] },
  { id: "anemia", name: "Anemia", avoidIngredients: ["tea", "coffee", "milk", "cheese", "yogurt"] },
  { id: "kidney_disease", name: "Kidney Disease", avoidIngredients: ["salt", "banana", "orange", "spinach", "tomato", "potato", "brown rice", "dairy"] },
  { id: "liver_disease", name: "Liver Disease", avoidIngredients: ["alcohol", "sugar", "fried food", "salt", "red meat", "white bread"] },
  { id: "pcos", name: "PCOS", avoidIngredients: ["sugar", "refined flour", "dairy", "fried food", "red meat", "soy"] },
  { id: "arthritis", name: "Arthritis", avoidIngredients: ["sugar", "red meat", "fried food", "refined grains", "dairy", "alcohol"] },
  { id: "gerd", name: "Acid Reflux (GERD)", avoidIngredients: ["spicy food", "citrus", "tomato", "chocolate", "mint", "fried food", "onion", "garlic", "coffee"] },
  { id: "high_cholesterol", name: "High Cholesterol", avoidIngredients: ["red meat", "butter", "cheese", "fried food", "processed meat", "fast food"] },
  { id: "fatty_liver", name: "Fatty Liver", avoidIngredients: ["alcohol", "sugar", "fried food", "white bread", "pasta", "rice"] },
  { id: "ibs", name: "IBS", avoidIngredients: ["gluten", "dairy", "onion", "garlic", "beans", "cabbage", "broccoli", "apple", "pear"] },
  { id: "lactose_intolerance", name: "Lactose Intolerance", avoidIngredients: ["milk", "cheese", "yogurt", "cream", "butter", "ice cream"] },
  { id: "gluten_sensitivity", name: "Gluten Sensitivity", avoidIngredients: ["wheat", "barley", "rye", "bread", "pasta", "beer", "soy sauce"] },
  { id: "migraine", name: "Migraine", avoidIngredients: ["aged cheese", "chocolate", "alcohol", "caffeine", "processed meat", "artificial sweeteners"] },
  { id: "gout", name: "Gout", avoidIngredients: ["red meat", "organ meat", "shellfish", "alcohol", "sugar", "fructose"] },
  { id: "osteoporosis", name: "Osteoporosis", avoidIngredients: ["salt", "caffeine", "alcohol", "soda"] },
  { id: "depression", name: "Depression", avoidIngredients: ["sugar", "processed food", "alcohol", "caffeine"] }
];

const DEFICIENCY_MAP: Record<string, string> = {
  "protein": "high_protein",
  "iron": "iron_rich",
  "calcium": "calcium_rich",
  "vitamin_d": "vitamin_d_rich",
  "vitamin_b12": "b12_rich",
  "fiber": "high_fiber"
};

function performAnalysis(input: any, allRecipes: any[]) {
  const restrictedSet = new Set<string>();
  input.diseases.forEach((dId: string) => {
    const disease = DISEASES.find(d => d.id === dId);
    if (disease) {
      disease.avoidIngredients.forEach(i => restrictedSet.add(i.toLowerCase()));
    }
  });
  input.allergies.forEach((a: string) => restrictedSet.add(a.toLowerCase().trim()));
  input.avoidItems.forEach((i: string) => restrictedSet.add(i.toLowerCase().trim()));

  const availableIngredients = new Set(input.availableIngredients.map((i: string) => i.toLowerCase().trim()));

  const safeRecipes = allRecipes
    .filter(recipe => {
      // 1. Safety Filter
      const hasUnsafeIngredient = (recipe.ingredients || []).some((ing: string) => {
        const ingLower = ing.toLowerCase();
        for (const restricted of restrictedSet) {
          if (ingLower.includes(restricted) || restricted.includes(ingLower)) return true;
        }
        return false;
      });
      if (hasUnsafeIngredient) return false;

      // 2. Mode Filter using nutrition
      const calories = recipe.nutritional_data?.calories || recipe.calories || 0;
      if (input.mode === 'weight_loss') return calories < 600;
      if (input.mode === 'weight_gain') return calories > 400;

      return true;
    })
    .map(recipe => {
      // 3. Match Percentage
      let matchCount = 0;
      const ingredients = recipe.ingredients || [];
      const totalRecipeIngredients = ingredients.length;
      ingredients.forEach((ing: string) => {
        const ingLower = ing.toLowerCase();
        for (const avail of availableIngredients) {
          if (ingLower.includes(avail) || avail.includes(ingLower)) {
            matchCount++;
            break;
          }
        }
      });
      const matchPercentage = totalRecipeIngredients > 0 
        ? Math.round((matchCount / totalRecipeIngredients) * 100)
        : 0;

      // Transform to client-side friendly format
      return {
        id: recipe.recipe_id || recipe.id,
        name: recipe.recipe_name || recipe.name,
        ingredients: recipe.ingredients,
        calories: recipe.nutritional_data?.calories || recipe.calories,
        protein: recipe.nutritional_data?.protein || recipe.protein,
        carbs: recipe.nutritional_data?.carbohydrates || recipe.carbs,
        fat: recipe.nutritional_data?.fat || recipe.fat,
        imageUrl: recipe.image_url || recipe.imageUrl,
        steps: recipe.instructions || recipe.steps,
        matchPercentage
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  return { safeRecipes, restrictedIngredients: Array.from(restrictedSet) };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.diseases.list.path, (req, res) => res.json(DISEASES));
  
  app.get(api.recipes.list.path, async (req, res) => {
    const recipes = await fetchRecipesFromFoodoscope();
    res.json(recipes.map(r => ({
      id: r.recipe_id,
      name: r.recipe_name,
      calories: r.nutritional_data.calories,
      protein: r.nutritional_data.protein,
      carbs: r.nutritional_data.carbohydrates,
      fat: r.nutritional_data.fat,
      imageUrl: r.image_url
    })));
  });

  app.get(api.recipes.get.path, async (req, res) => {
    const recipe = await getRecipeDetails(Number(req.params.id));
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json({
      id: recipe.recipe_id,
      name: recipe.recipe_name,
      ingredients: recipe.ingredients,
      calories: recipe.nutritional_data.calories,
      protein: recipe.nutritional_data.protein,
      carbs: recipe.nutritional_data.carbohydrates,
      fat: recipe.nutritional_data.fat,
      imageUrl: recipe.image_url,
      steps: recipe.instructions
    });
  });

  app.post(api.recipes.analyze.path, async (req, res) => {
    try {
      const input = api.recipes.analyze.input.parse(req.body);
      const liveRecipes = await fetchRecipesFromFoodoscope();
      const result = performAnalysis(input, liveRecipes);
      res.json(result);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(400).json({ message: "Invalid input or API error" });
    }
  });

  return httpServer;
}
