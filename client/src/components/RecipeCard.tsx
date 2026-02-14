import { motion } from "framer-motion";
import { Clock, Flame, Utensils, AlertCircle } from "lucide-react";
import { Link } from "wouter";

interface RecipeProps {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  matchPercentage: number;
  imageUrl?: string | null;
  category: string;
}

export function RecipeCard({ recipe, index }: { recipe: RecipeProps; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
            <Utensils className="w-12 h-12" />
          </div>
        )}
        
        {/* Match Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg border border-white/50">
          <span className="text-sm font-bold text-primary">
            {Math.round(recipe.matchPercentage)}% Match
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="font-display font-bold text-xl text-secondary line-clamp-2 group-hover:text-primary transition-colors">
            {recipe.name}
          </h3>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="text-center p-2 rounded-lg bg-orange-50 border border-orange-100">
            <span className="block text-xs text-orange-600 font-medium">Protein</span>
            <span className="block font-bold text-slate-700">{recipe.protein}g</span>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-100">
            <span className="block text-xs text-blue-600 font-medium">Carbs</span>
            <span className="block font-bold text-slate-700">{recipe.carbs}g</span>
          </div>
          <div className="text-center p-2 rounded-lg bg-yellow-50 border border-yellow-100">
            <span className="block text-xs text-yellow-600 font-medium">Fat</span>
            <span className="block font-bold text-slate-700">{recipe.fat}g</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-slate-700">{recipe.calories}</span> kcal
          </div>
          
          <Link href={`/recipe/${recipe.id}`} className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            View Recipe
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
