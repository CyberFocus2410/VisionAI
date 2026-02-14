import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Loader2, Plus, X } from "lucide-react";
import { api } from "@shared/routes";
import { useDiseases, useAnalyzeRecipes } from "@/hooks/use-recipes";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Schema for the form
const formSchema = z.object({
  mode: z.enum(["patient", "weight_loss", "weight_gain"]),
  diseases: z.array(z.string()).default([]),
  allergies: z.string().optional(), // We'll parse comma-separated string
  avoidItems: z.string().optional(),
  availableIngredients: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AnalysisFormProps {
  defaultMode?: "patient" | "weight_loss" | "weight_gain";
  onAnalysisComplete: (data: any) => void;
}

export function AnalysisForm({
  defaultMode = "patient",
  onAnalysisComplete,
}: AnalysisFormProps) {
  const { data: diseases, isLoading: isLoadingDiseases } = useDiseases();
  const analyzeMutation = useAnalyzeRecipes();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: defaultMode,
      diseases: [],
      allergies: "",
      avoidItems: "",
      availableIngredients: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // Transform comma-separated strings to arrays
    const payload = {
      mode: data.mode,
      diseases: data.diseases,
      allergies: data.allergies
        ? data.allergies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      avoidItems: data.avoidItems
        ? data.avoidItems
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      availableIngredients: data.availableIngredients
        ? data.availableIngredients
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    analyzeMutation.mutate(payload, {
      onSuccess: (result) => {
        onAnalysisComplete(result);
      },
    });
  };

  const selectedMode = form.watch("mode");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            id: "patient",
            label: "Patient Care",
            desc: "Manage specific conditions",
          },
          {
            id: "weight_loss",
            label: "Weight Loss",
            desc: "Calorie deficit planning",
          },
          {
            id: "weight_gain",
            label: "Weight Gain",
            desc: "Muscle & mass building",
          },
        ].map((mode) => (
          <div
            key={mode.id}
            onClick={() => form.setValue("mode", mode.id as any)}
            className={cn(
              "cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden",
              selectedMode === mode.id
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-slate-100 bg-white hover:border-slate-200",
            )}
          >
            {selectedMode === mode.id && (
              <div className="absolute top-2 right-2 text-primary">
                <Check className="w-5 h-5" />
              </div>
            )}
            <h3
              className={cn(
                "font-display font-bold text-lg",
                selectedMode === mode.id ? "text-primary" : "text-slate-700",
              )}
            >
              {mode.label}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{mode.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
        {/* Diseases Section */}
        <div>
          <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
            Medical Conditions
            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              Optional
            </span>
          </h3>

          {isLoadingDiseases ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading conditions...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {diseases?.map((disease) => (
                <label
                  key={disease.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                    form.watch("diseases")?.includes(disease.id)
                      ? "border-primary bg-primary/5 text-primary-900"
                      : "border-slate-100 hover:border-slate-200 text-slate-600",
                  )}
                >
                  <input
                    type="checkbox"
                    value={disease.id}
                    {...form.register("diseases")}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">{disease.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Text Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Allergies & Intolerances
              </label>
              <textarea
                {...form.register("allergies")}
                placeholder="e.g. Peanuts, Shellfish, Gluten..."
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none h-32"
              />
              <p className="text-xs text-slate-400 mt-2">
                Comma separated list of ingredients to strictly avoid.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Disliked Items
              </label>
              <input
                {...form.register("avoidItems")}
                placeholder="e.g. Mushrooms, Cilantro..."
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              />
            </div>
          </div>

          <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
            <label className="block text-sm font-semibold text-emerald-900 mb-2">
              What's in your kitchen?
            </label>
            <p className="text-sm text-emerald-700 mb-4">
              We'll prioritize recipes that use ingredients you already have.
            </p>
            <textarea
              {...form.register("availableIngredients")}
              placeholder="e.g. Chicken breast, Rice, Spinach, Olive oil, Tomatoes..."
              className="w-full p-4 rounded-xl border border-emerald-200 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none h-48"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={analyzeMutation.isPending}
          className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:transform-none transition-all flex items-center gap-3 w-full md:w-auto justify-center"
        >
          {analyzeMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Find Safe Recipes
              <span className="ml-2">→</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
