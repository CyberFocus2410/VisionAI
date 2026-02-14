# NutriRecipe Analyzer

## Overview
A recipe recommendation application that analyzes user health conditions, dietary preferences, and available ingredients to suggest safe and suitable recipes. Built with a full-stack JavaScript architecture.

## Recent Changes
- 2026-02-14: Initial project import and environment setup completed

## Project Architecture

### Stack
- **Frontend**: React 18 + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express 5 (TypeScript via tsx)
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express (backend)
- **State Management**: TanStack React Query v5

### Structure
```
client/src/          - React frontend
  pages/             - Page components
  components/        - UI components
  hooks/             - Custom hooks
  lib/               - Utilities (queryClient, etc.)
server/              - Express backend
  index.ts           - Server entry point
  routes.ts          - API routes
  storage.ts         - Storage interface
  db.ts              - Database connection
  vite.ts            - Vite dev server integration
shared/              - Shared types and schemas
  schema.ts          - Drizzle schema + Zod validation
```

### Key Data Model
- **recipes** table: Stores recipes with ingredients, nutritional info (calories, protein, carbs, fat), category (patient/weight_loss/weight_gain), diet type (veg/nonveg/egg), oil level, nutrient tags, and preparation steps.

### Running
- `npm run dev` starts the Express + Vite dev server on port 5000
- `npm run db:push` pushes schema changes to the database

## User Preferences
- None recorded yet
