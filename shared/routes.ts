
import { z } from 'zod';
import { analyzeRequestSchema, recipes, flavorCompounds } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  recipes: {
    search: {
      method: 'GET' as const,
      path: '/api/recipes/search' as const,
      input: z.object({
        q: z.string(),
      }),
      responses: {
        200: z.array(z.custom<typeof recipes.$inferSelect>()),
      },
    },
    getAll: { // For debugging or listing
        method: 'GET' as const,
        path: '/api/recipes' as const,
        responses: {
            200: z.array(z.custom<typeof recipes.$inferSelect>()),
        }
    }
  },
  analysis: {
    analyze: {
      method: 'POST' as const,
      path: '/api/analyze' as const,
      input: analyzeRequestSchema,
      responses: {
        200: z.custom<{
          recipe: typeof recipes.$inferSelect;
          harmonyScore: number;
          harmonyLabel: string;
          ingredientAnalysis: {
            ingredient: string;
            compoundCount: number;
            sharedCompounds: string[];
          }[];
          bridgeSuggestions: {
            name: string;
            sharedCount: number;
            compounds: string[];
          }[];
        }>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
