import axios from "axios";

const API_KEY = process.env.FOODOSCOPE_API_KEY;
const BASE_URL = "https://api.foodoscope.com/v1";

export interface FoodoscopeRecipe {
  recipe_id: number;
  recipe_name: string;
  ingredients: string[];
  dietary_section: string;
  nutritional_data: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  instructions: string[];
  image_url?: string;
}

export async function fetchRecipesFromFoodoscope(query?: string): Promise<FoodoscopeRecipe[]> {
  if (!API_KEY) {
    console.error("FOODOSCOPE_API_KEY is missing");
    return [];
  }

  try {
    const response = await axios.get(`${BASE_URL}/recipe/search`, {
      headers: {
        "Authorization": API_KEY, // Changed from Bearer to direct key based on typical Foodoscope usage
        "Accept": "application/json"
      },
      params: {
        query: query || "healthy",
        pageSize: 20
      }
    });

    if (response.status !== 200) {
      console.warn(`Foodoscope API returned status ${response.status}`);
      return [];
    }

    // Handle potential direct response or nested recipes
    return response.data.recipes || response.data || [];
  } catch (error: any) {
    console.error("Foodoscope API error:", error.response?.status || error.message);
    return [];
  }
}

export async function getRecipeDetails(id: number): Promise<FoodoscopeRecipe | null> {
  if (!API_KEY) return null;

  try {
    const response = await axios.get(`${BASE_URL}/recipe/${id}`, {
      headers: {
        "Authorization": API_KEY,
        "Accept": "application/json"
      }
    });

    return response.data || null;
  } catch (error: any) {
    console.error(`Error fetching recipe ${id}:`, error.response?.status || error.message);
    return null;
  }
}
