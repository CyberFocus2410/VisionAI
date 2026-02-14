import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

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
  const requiredNutrientTags = input.nutrientDeficiencies.map((d: string) => DEFICIENCY_MAP[d]).filter(Boolean);

  const safeRecipes = allRecipes
    .filter(recipe => {
      // 1. Diet Type Filter
      if (input.dietPreference === 'veg' && recipe.dietType !== 'veg') return false;
      if (input.dietPreference === 'egg' && (recipe.dietType === 'nonveg')) return false;
      
      // 2. Oil Level Filter
      if (input.lowOilPreferred && recipe.oilLevel !== 'low') return false;

      // 3. Safety Filter
      const hasUnsafeIngredient = recipe.ingredients.some((ing: string) => {
        const ingLower = ing.toLowerCase();
        for (const restricted of restrictedSet) {
          if (ingLower.includes(restricted) || restricted.includes(ingLower)) return true;
        }
        return false;
      });
      if (hasUnsafeIngredient) return false;

      // 4. Mode Filter
      if (input.mode === 'weight_loss') return recipe.calories < 600;
      if (input.mode === 'weight_gain') return recipe.calories > 400;

      return true;
    })
    .map(recipe => {
      // 5. Match Percentage & Nutrient Priority
      let matchCount = 0;
      recipe.ingredients.forEach((ing: string) => {
        const ingLower = ing.toLowerCase();
        for (const avail of availableIngredients) {
          if (ingLower.includes(avail) || avail.includes(ingLower)) {
            matchCount++;
            break;
          }
        }
      });
      const matchPercentage = Math.round((matchCount / recipe.ingredients.length) * 100);

      // Score for deficiency matching
      let deficiencyScore = 0;
      requiredNutrientTags.forEach((tag: string) => {
        if (recipe.nutrients.includes(tag)) deficiencyScore += 100;
      });

      return { ...recipe, matchPercentage, totalScore: matchPercentage + deficiencyScore };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  return { safeRecipes, restrictedIngredients: Array.from(restrictedSet) };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed data with new fields
  const existingRecipes = await storage.getRecipes();
  if (existingRecipes.length === 0) {
    const seedRecipes = [
      {
        name: "Grilled Chicken Salad",
        ingredients: ["chicken breast", "lettuce", "cucumber", "tomato", "olive oil", "lemon juice"],
        calories: 350, protein: 30, carbs: 10, fat: 15,
        category: "weight_loss", dietType: "nonveg", oilLevel: "low", nutrients: ["high_protein"],
        steps: ["Grill chicken", "Chop vegetables", "Mix everything", "Drizzle dressing"],
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
      },
      {
        name: "Quinoa Veggie Bowl",
        ingredients: ["quinoa", "spinach", "carrots", "chickpeas", "avocado"],
        calories: 450, protein: 15, carbs: 60, fat: 18,
        category: "patient", dietType: "veg", oilLevel: "low", nutrients: ["high_fiber", "iron_rich"],
        steps: ["Cook quinoa", "Steam veggies", "Slice avocado", "Assemble bowl"],
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd"
      },
      {
        name: "Lentil Soup",
        ingredients: ["lentils", "carrot", "onion", "celery", "vegetable broth", "turmeric"],
        calories: 300, protein: 18, carbs: 45, fat: 3,
        category: "patient", dietType: "veg", oilLevel: "low", nutrients: ["high_fiber", "iron_rich"],
        steps: ["Sauté veggies", "Add lentils and broth", "Simmer 30 mins"],
        imageUrl: "https://images.unsplash.com/photo-1547592166-23acbe3a624b"
      }
      // ... adding more variants to ensure diet diversity
    ];
    for (const r of seedRecipes) await storage.createRecipe(r);
  }

  app.get(api.diseases.list.path, (req, res) => res.json(DISEASES));
  app.get(api.recipes.list.path, async (req, res) => res.json(await storage.getRecipes()));
  app.get(api.recipes.get.path, async (req, res) => {
    const recipe = await storage.getRecipe(Number(req.params.id));
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  });

  app.post(api.recipes.analyze.path, async (req, res) => {
    const input = api.recipes.analyze.input.parse(req.body);
    const result = performAnalysis(input, await storage.getRecipes());
    res.json(result);
  });

  app.post(api.recipes.random.path, async (req, res) => {
    const input = api.recipes.random.input.parse(req.body);
    const { safeRecipes } = performAnalysis(input, await storage.getRecipes());
    if (safeRecipes.length === 0) return res.status(404).json({ message: "No safe recipes found" });
    const randomRecipe = safeRecipes[Math.floor(Math.random() * safeRecipes.length)];
    res.json(randomRecipe);
  });

  return httpServer;
}
