import { Layout } from "@/components/ui/Layout";
import { AnalysisForm } from "@/components/AnalysisForm";
import { RecipeCard } from "@/components/RecipeCard";
import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Analyze() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const modeParam = searchParams.get('mode') as 'patient' | 'weight_loss' | 'weight_gain' | null;

  const [results, setResults] = useState<any>(null);

  const handleAnalysisComplete = (data: any) => {
    setResults(data);
    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen pb-24">
        {/* Header Section */}
        <div className="bg-secondary text-white pt-12 pb-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
              <span>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">Analysis</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Find Your Perfect Meal
            </h1>
            <p className="text-white/70 max-w-2xl text-lg">
              Enter your health details and ingredients below. Our AI analyzes nutritional interactions to ensure every recommendation is safe and beneficial for you.
            </p>
          </div>
        </div>

        {/* Form Section - Overlapping Header */}
        <div className="container mx-auto px-4 -mt-16 relative z-20">
          <AnalysisForm 
            defaultMode={modeParam || 'patient'} 
            onAnalysisComplete={handleAnalysisComplete} 
          />
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              id="results-section"
              className="container mx-auto px-4 mt-24"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <h2 className="text-3xl font-display font-bold text-secondary mb-2">
                    Recommended Recipes
                  </h2>
                  <p className="text-slate-600">
                    Found {results.safeRecipes.length} safe matches based on your profile.
                  </p>
                </div>
                
                {results.restrictedIngredients.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 px-4 py-3 rounded-lg text-sm text-amber-800 max-w-md">
                    <span className="font-bold block mb-1">Safety Filter Active</span>
                    Excluded recipes containing: {results.restrictedIngredients.join(", ")}
                  </div>
                )}
              </div>

              {results.safeRecipes.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No exact matches found</h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Try adding more available ingredients or reducing strict avoidance filters to see more results.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.safeRecipes.map((recipe: any, i: number) => (
                    <RecipeCard key={recipe.id} recipe={recipe} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
