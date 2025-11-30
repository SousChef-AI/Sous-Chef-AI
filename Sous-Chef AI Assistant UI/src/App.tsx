import { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { RecipeSelectionScreen } from './components/RecipeSelectionScreen';
import { CookingModeScreen } from './components/CookingModeScreen';
import { TimerScreen } from './components/TimerScreen';
import { NutritionScreen } from './components/NutritionScreen';
import { NutritionToolsScreen } from './components/NutritionToolsScreen';
import { PantryScreen } from './components/PantryScreen';

export type Screen = 'home' | 'recipes' | 'cooking' | 'timers' | 'nutrition' | 'nutritionTools' | 'pantry';

export interface Recipe {
  id: string;
  name: string;
  time: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  ingredients: { name: string; amount: string; atRisk?: boolean }[];
  steps: { 
    number: number; 
    instruction: string; 
    timerDuration?: number;
    keyIngredients?: string[];
  }[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sodium: number;
    fiber: number;
  };
  atRiskIngredientsUsed: number;
  allergens?: string[];
}

export interface Timer {
  id: string;
  label: string;
  duration: number;
  remaining: number;
  isActive: boolean;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentScreen('cooking');
  };

  const handleFinishCooking = () => {
    setCurrentScreen('nutrition');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setSelectedRecipe(null);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onNavigate={setCurrentScreen}
            isListening={isListening}
            setIsListening={setIsListening}
          />
        );
      case 'recipes':
        return (
          <RecipeSelectionScreen 
            onSelectRecipe={handleSelectRecipe}
            onBack={() => setCurrentScreen('home')}
          />
        );
      case 'cooking':
        return selectedRecipe ? (
          <CookingModeScreen 
            recipe={selectedRecipe}
            onFinish={handleFinishCooking}
            onViewTimers={() => setCurrentScreen('timers')}
            onBack={handleBackToHome}
          />
        ) : null;
      case 'timers':
        return (
          <TimerScreen 
            onBack={() => setCurrentScreen('cooking')}
          />
        );
      case 'nutrition':
        return selectedRecipe ? (
          <NutritionScreen 
            recipe={selectedRecipe}
            onBack={handleBackToHome}
          />
        ) : null;
      case 'nutritionTools':
        return (
          <NutritionToolsScreen 
            onBack={() => setCurrentScreen('home')}
          />
        );
      case 'pantry':
        return (
          <PantryScreen 
            onBack={() => setCurrentScreen('home')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {renderScreen()}
    </div>
  );
}

export default App;
