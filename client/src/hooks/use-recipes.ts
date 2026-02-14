import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { AnalyzeRequest } from "@shared/schema";

// Helper to handle API errors and parsing
async function fetchAndParse<T>(
  url: string,
  schema: Zod.ZodSchema<T>,
  method: string = 'GET',
  body?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`);
  }
  const data = await res.json();
  return schema.parse(data);
}

// === RECIPES ===

export function useRecipes() {
  return useQuery({
    queryKey: [api.recipes.getAll.path],
    queryFn: () => fetchAndParse(api.recipes.getAll.path, api.recipes.getAll.responses[200]),
  });
}

export function useSearchRecipes(query: string) {
  return useQuery({
    queryKey: [api.recipes.search.path, query],
    queryFn: () => {
      const url = `${api.recipes.search.path}?q=${encodeURIComponent(query)}`;
      return fetchAndParse(url, api.recipes.search.responses[200]);
    },
    enabled: query.length > 0,
  });
}

// === ANALYSIS ===

export function useAnalyzeRecipe() {
  return useMutation({
    mutationFn: (data: AnalyzeRequest) => {
      // Input validation before sending
      const validatedInput = api.analysis.analyze.input.parse(data);
      
      return fetchAndParse(
        api.analysis.analyze.path,
        api.analysis.analyze.responses[200],
        'POST',
        validatedInput
      );
    },
  });
}
