import { z } from 'zod';
import { recipes } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  recipes: {
    list: {
      method: 'GET' as const,
      path: '/api/recipes' as const,
      responses: {
        200: z.array(z.custom<typeof recipes.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/recipes/:id' as const,
      responses: {
        200: z.custom<typeof recipes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    analyze: {
      method: 'POST' as const,
      path: '/api/analyze' as const,
      input: z.object({
        diseases: z.array(z.string()),
        allergies: z.array(z.string()),
        avoidItems: z.array(z.string()),
        availableIngredients: z.array(z.string()),
        mode: z.enum(['patient', 'weight_loss', 'weight_gain']),
      }),
      responses: {
        200: z.object({
          safeRecipes: z.array(z.custom<typeof recipes.$inferSelect & { matchPercentage: number }>()),
          restrictedIngredients: z.array(z.string()),
        }),
        400: errorSchemas.validation,
      },
    },
  },
  diseases: {
    list: {
      method: 'GET' as const,
      path: '/api/diseases' as const,
      responses: {
        200: z.array(z.object({
          id: z.string(),
          name: z.string(),
          avoidIngredients: z.array(z.string()),
        })),
      },
    }
  }
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
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
