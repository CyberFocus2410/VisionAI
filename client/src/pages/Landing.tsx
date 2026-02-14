import { Layout } from "@/components/ui/Layout";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Activity, Scale, HeartPulse, ChefHat } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleModeSelect = (mode: string) => {
    setLocation(`/analyze?mode=${mode}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-emerald-50 to-transparent opacity-60" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40 -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
                <ShieldCheck className="w-4 h-4" />
                Medically-Aware Nutrition
              </span>
              <h1 className="text-5xl lg:text-7xl font-display font-bold text-secondary mb-6 tracking-tight leading-[1.1]">
                Eating right shouldn't be <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">a guessing game.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                NutriSafe analyzes your health conditions, allergies, and available ingredients to recommend recipes that are perfectly safe and optimized for you.
              </p>
            </motion.div>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            <ModeCard
              icon={<HeartPulse className="w-8 h-8 text-rose-500" />}
              title="Patient Care"
              description="Managing specific medical conditions? Get diet plans that strictly adhere to your health requirements."
              delay={0.1}
              onClick={() => handleModeSelect('patient')}
            />
            <ModeCard
              icon={<Scale className="w-8 h-8 text-blue-500" />}
              title="Weight Loss"
              description="Achieve your goals with calorie-controlled, nutrient-dense meals that keep you feeling full."
              delay={0.2}
              onClick={() => handleModeSelect('weight_loss')}
            />
            <ModeCard
              icon={<Activity className="w-8 h-8 text-emerald-500" />}
              title="Weight Gain"
              description="Build mass safely with high-protein, energy-rich recipes designed for muscle growth."
              delay={0.3}
              onClick={() => handleModeSelect('weight_gain')}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-display font-bold text-secondary">
                Smart recommendations based on <span className="text-primary">science</span>, not trends.
              </h2>
              
              <div className="space-y-6">
                <FeatureRow 
                  title="Disease Interaction Checking" 
                  desc="We cross-reference every ingredient against your medical conditions to prevent adverse reactions."
                />
                <FeatureRow 
                  title="Pantry-First Matching" 
                  desc="Enter what's in your fridge, and we'll find safe recipes you can cook right now."
                />
                <FeatureRow 
                  title="Complete Nutritional Breakdown" 
                  desc="Track macros, calories, and essential nutrients for every meal."
                />
              </div>
            </div>
            
            <div className="relative">
              {/* Abstract visual representation of the app */}
              <div className="aspect-square rounded-3xl bg-slate-50 border border-slate-100 p-8 relative overflow-hidden">
                {/* Decorative background circles */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
                
                {/* Floating cards */}
                <div className="absolute top-12 left-12 right-12 bg-white rounded-xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100 z-10 transform -rotate-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-secondary">Mediterranean Salad</h4>
                      <p className="text-sm text-green-600 font-medium">100% Safe Match</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full w-full mb-2">
                    <div className="h-full bg-primary rounded-full w-3/4" />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Protein: 24g</span>
                    <span>320 kcal</span>
                  </div>
                </div>

                <div className="absolute bottom-12 right-8 bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-4 border border-slate-100 z-20 max-w-[200px]">
                  <div className="flex items-center gap-2 mb-2 text-rose-500 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    Safety Check
                  </div>
                  <p className="text-xs text-slate-600">Filtered out 3 recipes due to Sodium restrictions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function ModeCard({ icon, title, description, delay, onClick }: { icon: any, title: string, description: string, delay: number, onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      onClick={onClick}
      className="bg-white p-8 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 transition-all cursor-pointer group h-full flex flex-col"
    >
      <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-display font-bold text-secondary mb-3 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-slate-500 leading-relaxed mb-6 flex-1">
        {description}
      </p>
      <div className="flex items-center text-primary font-bold text-sm">
        Start Now <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}

function FeatureRow({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1">
        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        </div>
      </div>
      <div>
        <h4 className="font-bold text-lg text-secondary mb-1">{title}</h4>
        <p className="text-slate-600">{desc}</p>
      </div>
    </div>
  );
}
