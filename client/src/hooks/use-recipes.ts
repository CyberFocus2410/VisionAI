import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Types derived from the API definition
type AnalyzeInput = z.infer<typeof api.recipes.analyze.input>;
type AnalyzeResponse = z.infer<typeof api.recipes.analyze.responses[200]>;
type DiseaseListResponse = z.infer<typeof api.diseases.list.responses[200]>;

export function useDiseases() {
  return useQuery({
    queryKey: [api.diseases.list.path],
    queryFn: async () => {
      const res = await fetch(api.diseases.list.path);
      if (!res.ok) throw new Error("Failed to fetch diseases");
      return api.diseases.list.responses[200].parse(await res.json());
    },
  });
}

export function useAnalyzeRecipes() {
  return useMutation({
    mutationFn: async (data: AnalyzeInput) => {
      const res = await fetch(api.recipes.analyze.path, {
        method: api.recipes.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Analysis failed");
      }
      
      return api.recipes.analyze.responses[200].parse(await res.json());
    },
  });
}

export function useRecipe(id: number) {
  return useQuery({
    queryKey: [api.recipes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.recipes.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch recipe");
      return api.recipes.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
