import { Layout } from "@/components/ui/Layout";
import { useRecipe } from "@/hooks/use-recipes";
import { useRoute } from "wouter";
import { Loader2, ArrowLeft, Clock, Users, Flame, ChefHat } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function RecipeDetail() {
  const [match, params] = useRoute("/recipe/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: recipe, isLoading, error } = useRecipe(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !recipe) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold text-slate-800">Recipe not found</h2>
          <Link href="/analyze" className="text-primary hover:underline mt-4 inline-block">
            Back to Analysis
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="bg-slate-50 min-h-screen pb-24">
        {/* Header Image Area */}
        <div className="h-[40vh] md:h-[50vh] relative bg-slate-900 overflow-hidden">
          {recipe.imageUrl ? (
            <img 
              src={recipe.imageUrl} 
              alt={recipe.name} 
              className="w-full h-full object-cover opacity-70"
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center opacity-50">
               <ChefHat className="w-24 h-24 text-white/20" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
            <div className="container mx-auto">
              <Link href="/analyze" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Results
              </Link>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-display font-bold text-white mb-4 shadow-sm"
              >
                {recipe.name}
              </motion.h1>
              
              <div className="flex flex-wrap gap-4 md:gap-8 text-white/90">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 p-2 rounded-full backdrop-blur-sm">
                    <Flame className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-semibold">{recipe.calories} kcal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-500/20 p-2 rounded-full backdrop-blur-sm">
                    <Users className="w-4 h-4 text-blue-100" />
                  </div>
                  <span className="font-semibold">2 Servings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-amber-500/20 p-2 rounded-full backdrop-blur-sm">
                    <Clock className="w-4 h-4 text-amber-100" />
                  </div>
                  <span className="font-semibold">30 mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Ingredients & Macros */}
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50"
              >
                <h3 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
                  Nutrition per Serving
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-sm text-slate-500 font-medium mb-1">Protein</div>
                    <div className="text-xl font-bold text-secondary">{recipe.protein}g</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-sm text-slate-500 font-medium mb-1">Carbs</div>
                    <div className="text-xl font-bold text-secondary">{recipe.carbs}g</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-sm text-slate-500 font-medium mb-1">Fat</div>
                    <div className="text-xl font-bold text-secondary">{recipe.fat}g</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50"
              >
                <h3 className="text-xl font-bold text-secondary mb-6">Ingredients</h3>
                <ul className="space-y-4">
                  {recipe.ingredients.map((ingredient, i) => (
                    <li key={i} className="flex items-start gap-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <span className="text-slate-600 leading-relaxed">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Right Column: Instructions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-white rounded-2xl p-8 md:p-12 shadow-xl shadow-slate-200/50"
            >
              <h3 className="text-2xl font-bold text-secondary mb-8">Instructions</h3>
              <div className="space-y-10">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-xl text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                      {i + 1}
                    </div>
                    <div className="pt-2">
                      <p className="text-lg text-slate-700 leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </article>
    </Layout>
  );
}
