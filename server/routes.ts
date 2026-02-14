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
  { id: "anemia", name: "Anemia", avoidIngredients: ["tea", "coffee", "milk", "cheese", "yogurt"] }, // Block iron absorption
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === SEED DATA ===
  const existingRecipes = await storage.getRecipes();
  if (existingRecipes.length === 0) {
    console.log("Seeding recipes...");
    const seedRecipes = [
      {
        name: "Grilled Chicken Salad",
        ingredients: ["chicken breast", "lettuce", "cucumber", "tomato", "olive oil", "lemon juice"],
        calories: 350, protein: 30, carbs: 10, fat: 15,
        category: "weight_loss",
        steps: ["Grill chicken", "Chop vegetables", "Mix everything", "Drizzle dressing"],
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
      },
      {
        name: "Oatmeal with Berries",
        ingredients: ["oats", "water", "strawberries", "blueberries", "chia seeds"],
        calories: 300, protein: 10, carbs: 50, fat: 5,
        category: "weight_loss",
        steps: ["Boil water", "Add oats", "Cook for 5 mins", "Top with berries"],
        imageUrl: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf"
      },
      {
        name: "Quinoa Veggie Bowl",
        ingredients: ["quinoa", "spinach", "carrots", "chickpeas", "avocado"],
        calories: 450, protein: 15, carbs: 60, fat: 18,
        category: "patient",
        steps: ["Cook quinoa", "Steam veggies", "Slice avocado", "Assemble bowl"],
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd"
      },
      {
        name: "Salmon with Asparagus",
        ingredients: ["salmon", "asparagus", "olive oil", "garlic", "pepper"],
        calories: 500, protein: 40, carbs: 5, fat: 30,
        category: "weight_loss",
        steps: ["Season salmon", "Roast asparagus", "Bake salmon for 15 mins"],
        imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a7270028d"
      },
      {
        name: "Peanut Butter Banana Smoothie",
        ingredients: ["milk", "banana", "peanut butter", "protein powder", "oats"],
        calories: 700, protein: 35, carbs: 80, fat: 25,
        category: "weight_gain",
        steps: ["Blend all ingredients", "Serve chilled"],
        imageUrl: "https://images.unsplash.com/photo-1593094609558-a32af4099d77"
      },
      {
        name: "Lentil Soup",
        ingredients: ["lentils", "carrot", "onion", "celery", "vegetable broth", "turmeric"],
        calories: 300, protein: 18, carbs: 45, fat: 3,
        category: "patient",
        steps: ["Sauté veggies", "Add lentils and broth", "Simmer 30 mins"],
        imageUrl: "https://images.unsplash.com/photo-1547592166-23acbe3a624b"
      },
      {
        name: "Chicken Rice Bowl",
        ingredients: ["white rice", "chicken breast", "broccoli", "soy sauce", "sesame oil"],
        calories: 600, protein: 35, carbs: 80, fat: 10,
        category: "weight_gain",
        steps: ["Cook rice", "Stir fry chicken and broccoli", "Mix sauce", "Combine"],
        imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d"
      },
      {
        name: "Avocado Toast with Egg",
        ingredients: ["bread", "avocado", "egg", "pepper", "salt"],
        calories: 400, protein: 15, carbs: 30, fat: 20,
        category: "weight_gain",
        steps: ["Toast bread", "Mash avocado", "Fry egg", "Assemble"],
        imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414395d8"
      },
      {
        name: "Greek Salad",
        ingredients: ["cucumber", "tomato", "olive oil", "feta cheese", "olives"],
        calories: 350, protein: 8, carbs: 12, fat: 28,
        category: "patient",
        steps: ["Chop veggies", "Add cheese and olives", "Drizzle oil"],
        imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe"
      },
      {
        name: "Sweet Potato & Black Bean Tacos",
        ingredients: ["sweet potato", "black beans", "corn tortillas", "lime", "cilantro"],
        calories: 400, protein: 12, carbs: 70, fat: 5,
        category: "patient",
        steps: ["Roast sweet potato", "Warm beans", "Fill tortillas"],
        imageUrl: "https://images.unsplash.com/photo-1624300626530-8e7558646f27"
      },
      {
        name: "Mushroom Risotto",
        ingredients: ["arborio rice", "mushrooms", "parmesan cheese", "butter", "vegetable broth"],
        calories: 600, protein: 14, carbs: 65, fat: 25,
        category: "weight_gain",
        steps: ["Sauté mushrooms", "Cook rice slowly with broth", "Stir in cheese and butter"],
        imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371"
      }
    ];

    for (const r of seedRecipes) {
      await storage.createRecipe(r);
    }
  }

  // === API ROUTES ===

  app.get(api.diseases.list.path, (req, res) => {
    res.json(DISEASES);
  });

  app.get(api.recipes.list.path, async (req, res) => {
    const recipes = await storage.getRecipes();
    res.json(recipes);
  });

  app.get(api.recipes.get.path, async (req, res) => {
    const recipe = await storage.getRecipe(Number(req.params.id));
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  });

  app.post(api.recipes.analyze.path, async (req, res) => {
    try {
      const input = api.recipes.analyze.input.parse(req.body);
      
      // 1. Build Restricted Ingredient List
      const restrictedSet = new Set<string>();
      
      // Add disease restrictions
      input.diseases.forEach(dId => {
        const disease = DISEASES.find(d => d.id === dId);
        if (disease) {
          disease.avoidIngredients.forEach(i => restrictedSet.add(i.toLowerCase()));
        }
      });
      
      // Add allergies
      input.allergies.forEach(a => restrictedSet.add(a.toLowerCase().trim()));
      
      // Add avoid items
      input.avoidItems.forEach(i => restrictedSet.add(i.toLowerCase().trim()));

      const allRecipes = await storage.getRecipes();
      const availableIngredients = new Set(input.availableIngredients.map(i => i.toLowerCase().trim()));

      const safeRecipes = allRecipes
        .filter(recipe => {
          // 2. Filter Unsafe Recipes
          const hasUnsafeIngredient = recipe.ingredients.some(ing => {
            const ingLower = ing.toLowerCase();
            // Check exact or partial match against restricted list
            for (const restricted of restrictedSet) {
              if (ingLower.includes(restricted) || restricted.includes(ingLower)) {
                return true;
              }
            }
            return false;
          });
          return !hasUnsafeIngredient;
        })
        .filter(recipe => {
          // 3. Apply Nutrition Rules based on Mode
          if (input.mode === 'weight_loss') {
             // Example logic: Low calorie, high protein relative to cals
             return recipe.calories < 600; 
          } else if (input.mode === 'weight_gain') {
             // Example logic: High calorie
             return recipe.calories > 400;
          }
          return true; // Patient mode - just safety matters
        })
        .map(recipe => {
          // 4. Calculate Match Percentage
          // If user didn't provide any available ingredients, match is 0 (or we could default to 100 to show all)
          // Let's assume if availableIngredients is empty, we don't downrank? 
          // Requirement: "Recommend recipes where MOST ingredients match user input"
          
          if (availableIngredients.size === 0) {
            return { ...recipe, matchPercentage: 0 };
          }

          let matchCount = 0;
          recipe.ingredients.forEach(ing => {
            const ingLower = ing.toLowerCase();
            for (const avail of availableIngredients) {
              if (ingLower.includes(avail) || avail.includes(ingLower)) {
                matchCount++;
                break;
              }
            }
          });
          
          const matchPercentage = Math.round((matchCount / recipe.ingredients.length) * 100);
          return { ...recipe, matchPercentage };
        })
        .sort((a, b) => b.matchPercentage - a.matchPercentage); // 5. Rank by match %

      res.json({
        safeRecipes,
        restrictedIngredients: Array.from(restrictedSet)
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  return httpServer;
}
