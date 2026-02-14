import { useState } from "react";
import { useLocation } from "wouter";
import { useSearchRecipes } from "@/hooks/use-recipes";
import { Search, ChevronRight, Beaker, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [, setLocation] = useLocation();
  const { data: recipes, isLoading } = useSearchRecipes(debouncedQuery);

  // Debounce search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    // Simple debounce timeout
    const timeoutId = setTimeout(() => setDebouncedQuery(val), 300);
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg mb-8">
            <Beaker className="w-8 h-8 text-primary mr-2" />
            <span className="text-2xl font-bold font-display text-foreground tracking-tight">HealThyme</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display leading-tight tracking-tight">
            Molecular Harmony <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Engine
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover the chemical compatibility of ingredients. Analyze recipes for flavor synergy based on shared volatile compounds.
          </p>
        </motion.div>

        <motion.div 
          className="w-full max-w-xl relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50" />
            <div className="relative bg-white rounded-2xl shadow-xl flex items-center p-2 border border-border/50">
              <Search className="w-6 h-6 text-muted-foreground ml-4" />
              <Input
                value={query}
                onChange={handleSearch}
                placeholder="Search for a recipe (e.g., 'Tomato Soup')..."
                className="border-none shadow-none text-lg h-14 bg-transparent focus-visible:ring-0 px-4"
              />
            </div>
          </div>

          <AnimatePresence>
            {(recipes && recipes.length > 0) || (isLoading && query) ? (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                className="absolute w-full mt-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden text-left z-20"
              >
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">Analyzing compound database...</div>
                ) : (
                  <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
                    {recipes?.map((recipe) => (
                      <div
                        key={recipe.id}
                        onClick={() => setLocation(`/analysis/${recipe.id}`)}
                        className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer group flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{recipe.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {recipe.ingredients.slice(0, 3).map((ing, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-secondary rounded-md text-secondary-foreground flex items-center gap-1">
                                <Leaf className="w-3 h-3 opacity-50" />
                                {ing}
                              </span>
                            ))}
                            {recipe.ingredients.length > 3 && (
                              <span className="text-xs px-2 py-1 text-muted-foreground">+{recipe.ingredients.length - 3} more</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
          
          {query && recipes?.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-white/50 backdrop-blur rounded-xl border text-center text-muted-foreground"
            >
              No recipes found matching "{query}". Try "Salad" or "Soup".
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
