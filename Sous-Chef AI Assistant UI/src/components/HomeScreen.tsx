import { Mic, BookOpen, Clock, Apple, TrendingUp } from 'lucide-react';
import { Screen } from '../App';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export function HomeScreen({ onNavigate, isListening, setIsListening }: HomeScreenProps) {
  const handleVoiceActivation = () => {
    setIsListening(!isListening);
    setTimeout(() => setIsListening(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-12">
        {/* Logo and Title */}
        <div className="text-center space-y-6">
          <h1 className="text-emerald-800">Sous Chef</h1>
          
          {/* Voice Activation Button */}
          <div className="flex justify-center">
            <button
              onClick={handleVoiceActivation}
              className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                isListening 
                  ? 'bg-emerald-500 shadow-lg shadow-emerald-300 scale-110' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-md'
              }`}
              aria-label="Voice activation"
            >
              {/* Pulsing ring when listening */}
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  <div className="absolute inset-0 rounded-full bg-emerald-300 animate-pulse opacity-50" />
                </>
              )}
              <Mic className="w-16 h-16 text-white relative z-10" />
            </button>
          </div>

          {/* Voice Status Text */}
          <div className="min-h-[60px] flex items-center justify-center">
            {isListening ? (
              <p className="text-emerald-700 animate-pulse">
                Listening...
              </p>
            ) : (
              <p className="text-gray-600">
                Say: "Start a recipe" or "Help"
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('recipes')}
            className="bg-white hover:bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 transition-all hover:shadow-lg hover:border-emerald-400 flex items-center gap-4"
          >
            <BookOpen className="w-8 h-8 text-emerald-600" />
            <div className="text-left">
              <div className="text-emerald-900">Browse Recipes</div>
              <div className="text-sm text-gray-600">Find meals for your pantry</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('recipes')}
            className="bg-white hover:bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 transition-all hover:shadow-lg hover:border-emerald-400 flex items-center gap-4"
          >
            <Clock className="w-8 h-8 text-emerald-600" />
            <div className="text-left">
              <div className="text-emerald-900">Recent Recipes</div>
              <div className="text-sm text-gray-600">Your cooking history</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('pantry')}
            className="bg-white hover:bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 transition-all hover:shadow-lg hover:border-emerald-400 flex items-center gap-4"
          >
            <Apple className="w-8 h-8 text-emerald-600" />
            <div className="text-left">
              <div className="text-emerald-900">My Pantry</div>
              <div className="text-sm text-gray-600">Manage your ingredients</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('nutritionTools')}
            className="bg-white hover:bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 transition-all hover:shadow-lg hover:border-emerald-400 flex items-center gap-4"
          >
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            <div className="text-left">
              <div className="text-emerald-900">Nutrition Tools</div>
              <div className="text-sm text-gray-600">Track your health goals</div>
            </div>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="bg-white/70 backdrop-blur rounded-xl p-6 border border-emerald-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl text-emerald-700">12</div>
              <div className="text-sm text-gray-600">Items at risk</div>
            </div>
            <div>
              <div className="text-2xl text-emerald-700">8</div>
              <div className="text-sm text-gray-600">Meals this week</div>
            </div>
            <div>
              <div className="text-2xl text-emerald-700">3.2kg</div>
              <div className="text-sm text-gray-600">Waste saved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
