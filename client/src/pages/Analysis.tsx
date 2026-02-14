import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useAnalyzeRecipe } from "@/hooks/use-recipes";
import { HarmonyGauge } from "@/components/HarmonyGauge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, AlertCircle, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import type { Recipe, AnalysisResponse } from "@shared/schema";

export default function Analysis() {
  const [, params] = useRoute("/analysis/:id");
  const [, setLocation] = useLocation();
  const recipeId = params ? parseInt(params.id) : 0;
  
  const [mutedIngredient, setMutedIngredient] = useState<string | "none">("none");
  const { mutate: analyze, data, isPending, error } = useAnalyzeRecipe();

  // Initial load
  useEffect(() => {
    if (recipeId) {
      analyze({ 
        recipeId, 
        mutedIngredient: mutedIngredient === "none" ? undefined : mutedIngredient 
      });
    }
  }, [recipeId, mutedIngredient, analyze]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="bg-destructive/10 p-4 rounded-full inline-block">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Analysis Failed</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={() => setLocation("/")} variant="outline">Back to Search</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <h1 className="text-lg font-bold font-display hidden sm:block">HealThyme Analysis</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isPending && (
              <span className="flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Calculating Synergy...
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Recipe & Controls */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardDescription>Recipe</CardDescription>
                <CardTitle className="text-3xl">{data?.recipe.name || "Loading..."}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Ingredients</label>
                    <div className="flex flex-wrap gap-2">
                      {data?.recipe.ingredients.map((ing) => (
                        <Badge 
                          key={ing} 
                          variant={mutedIngredient === ing ? "destructive" : "secondary"}
                          className={mutedIngredient === ing ? "opacity-50 line-through" : ""}
                        >
                          {ing}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Experimental Muting
                    </label>
                    <Select 
                      value={mutedIngredient} 
                      onValueChange={(val) => setMutedIngredient(val)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select ingredient to remove..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Full Recipe)</SelectItem>
                        {data?.recipe.ingredients.map((ing) => (
                          <SelectItem key={ing} value={ing}>Mute {ing}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      Remove an ingredient to see how it affects the overall harmony score.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bridge Suggestions Card */}
            {data?.bridgeSuggestions && data.bridgeSuggestions.length > 0 && (
              <Card className="border-accent/20 bg-accent/5 overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <TrendingUp className="w-24 h-24 text-accent" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent-foreground">
                    <TrendingUp className="w-5 h-5" />
                    Bridge Suggestions
                  </CardTitle>
                  <CardDescription>
                    Add these to boost harmony
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-3">
                    {data.bridgeSuggestions.map((suggestion) => (
                      <div 
                        key={suggestion.name} 
                        className="bg-white/80 backdrop-blur rounded-lg p-3 shadow-sm border border-accent/10 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-foreground">{suggestion.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {suggestion.compounds.length} shared compounds
                          </div>
                        </div>
                        <Badge variant="outline" className="text-accent border-accent/20">
                          +{Math.round(suggestion.sharedCount)} Match
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Analysis Results */}
          <div className="lg:col-span-8 space-y-6">
            {/* Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white to-gray-50">
                <HarmonyGauge 
                  score={data?.harmonyScore || 0} 
                  label={data?.harmonyLabel || "Analyzing..."} 
                />
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Molecular Breakdown</CardTitle>
                  <CardDescription>
                    Analysis based on shared volatile organic compounds (VOCs).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground">Total Analyzed Compounds</div>
                    <div className="text-3xl font-bold font-display text-primary mt-1">
                      {data?.ingredientAnalysis.reduce((acc, curr) => acc + curr.compoundCount, 0) || 0}
                    </div>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground">Highest Overlap</div>
                    <div className="text-3xl font-bold font-display text-accent mt-1">
                      {Math.max(...(data?.ingredientAnalysis.map(i => i.sharedCompounds.length) || [0]))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Table */}
            <Card>
              <CardHeader>
                <CardTitle>Ingredient Synergy Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ingredient</th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">Compounds</th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">Shared With Others</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Key Molecules</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.ingredientAnalysis.map((row, idx) => (
                        <motion.tr 
                          key={row.ingredient}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-b last:border-0 hover:bg-secondary/20 transition-colors"
                        >
                          <td className="py-4 px-4 font-medium">{row.ingredient}</td>
                          <td className="py-4 px-4 text-center">
                            <Badge variant="secondary" className="font-mono">
                              {row.compoundCount}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-full max-w-[100px] h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${Math.min(100, (row.sharedCompounds.length / 10) * 100)}%` }} 
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-6">{row.sharedCompounds.length}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs text-muted-foreground max-w-[200px] truncate">
                            {row.sharedCompounds.slice(0, 3).join(", ")}
                            {row.sharedCompounds.length > 3 && "..."}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
