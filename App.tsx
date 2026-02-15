import React, { useState } from 'react';
import { UserProfile, AppStep, AnalysisResult, Recipe, GoalCategory } from './types';
import { LandingPage } from './components/LandingPage';
import { InputForm } from './components/InputForm';
import { ProcessingView } from './components/ProcessingView';
import { RecipeSelection } from './components/RecipeSelection';
import { RecipeDetail } from './components/RecipeDetail';
import { analyzeProfileAndGetRecipes } from './services/geminiService';
import { HeartPulse, Mic, MicOff } from 'lucide-react';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.LANDING);
  const [selectedGoal, setSelectedGoal] = useState<GoalCategory>('disease');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const handleGoalSelect = (goal: GoalCategory) => {
    setSelectedGoal(goal);
    setCurrentStep(AppStep.INPUT);
  };

  const handleInputSubmit = async (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentStep(AppStep.PROCESSING);
    setError(null);
    try {
      const result = await analyzeProfileAndGetRecipes(profile);
      setAnalysisResult(result);
      setCurrentStep(AppStep.SELECTION);
    } catch (err) {
      console.error(err);
      setError("Failed to generate recommendations. Please try again.");
      setCurrentStep(AppStep.INPUT);
    }
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentStep(AppStep.DETAIL);
  };

  const handleBackToSelection = () => {
    setSelectedRecipe(null);
    setCurrentStep(AppStep.SELECTION);
  };

  const handleBackToInput = () => {
    setCurrentStep(AppStep.INPUT);
  }

  const handleReset = () => {
    setAnalysisResult(null);
    setSelectedRecipe(null);
    setUserProfile(null);
    setCurrentStep(AppStep.LANDING);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg shadow-emerald-200/50 group-hover:shadow-emerald-300/60 transition-all">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none group-hover:text-emerald-700 transition-colors">NutriSafe</h1>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest group-hover:text-emerald-500/70">Medical Prototype</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Voice Toggle */}
             <button 
               onClick={() => setVoiceEnabled(!voiceEnabled)}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                 voiceEnabled 
                 ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                 : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
               }`}
               title="Toggle Voice Assisted Recipe Dictator"
             >
               {voiceEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
               <span className="hidden sm:inline">Voice Assistant</span>
               <span className={`w-2 h-2 rounded-full ${voiceEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'}`}></span>
             </button>

            <nav className="hidden sm:flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-400">Step:</span>
              <div className="flex items-center gap-2">
                {[AppStep.LANDING, AppStep.INPUT, AppStep.SELECTION].map((step, idx) => {
                  const stepLabels = { [AppStep.LANDING]: 'Start', [AppStep.INPUT]: 'Profile', [AppStep.PROCESSING]: 'Analysis', [AppStep.SELECTION]: 'Results', [AppStep.DETAIL]: 'Recipe' };
                  const isActive = step === currentStep || (currentStep === AppStep.PROCESSING && step === AppStep.INPUT) || (currentStep === AppStep.DETAIL && step === AppStep.SELECTION);
                  return (
                    <div key={step} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${isActive ? 'bg-slate-900 text-white' : 'text-slate-400 bg-slate-100'}`}>
                      {(stepLabels as any)[step]}
                    </div>
                  )
                })}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-200 flex items-center gap-3 shadow-sm animate-fade-in">
             <div className="bg-red-100 p-1.5 rounded-full"><HeartPulse className="h-4 w-4" /></div>
             <div>
               <span className="font-bold block text-sm">Analysis Failed</span>
               <span className="text-sm opacity-90">{error}</span>
             </div>
          </div>
        )}

        {currentStep === AppStep.LANDING && (
          <LandingPage onSelectGoal={handleGoalSelect} />
        )}

        {currentStep === AppStep.INPUT && (
          <InputForm 
            initialGoal={selectedGoal} 
            onSubmit={handleInputSubmit} 
            onBack={() => setCurrentStep(AppStep.LANDING)}
          />
        )}

        {currentStep === AppStep.PROCESSING && (
          <ProcessingView />
        )}

        {currentStep === AppStep.SELECTION && analysisResult && (
          <RecipeSelection 
            data={analysisResult} 
            onSelectRecipe={handleSelectRecipe}
            onBack={handleBackToInput}
          />
        )}

        {currentStep === AppStep.DETAIL && selectedRecipe && (
          <RecipeDetail 
            recipe={selectedRecipe} 
            onBack={handleBackToSelection} 
            dailyGoals={userProfile?.dailyGoals}
            voiceEnabled={voiceEnabled}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} NutriSafe Prototype</p>
          <p className="text-slate-300 text-xs mt-2">
            Not a medical device. Consult a physician for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;