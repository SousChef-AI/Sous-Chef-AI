import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Recipe } from '../App';

interface NutritionScreenProps {
  recipe: Recipe;
  onBack: () => void;
}

export function NutritionScreen({ recipe, onBack }: NutritionScreenProps) {
  const { nutrition } = recipe;

  const macroData = [
    { name: 'Protein', value: nutrition.protein, unit: 'g', color: 'bg-blue-500', target: 25 },
    { name: 'Carbs', value: nutrition.carbs, unit: 'g', color: 'bg-amber-500', target: 50 },
    { name: 'Fat', value: nutrition.fat, unit: 'g', color: 'bg-purple-500', target: 20 },
    { name: 'Fiber', value: nutrition.fiber, unit: 'g', color: 'bg-green-500', target: 8 },
  ];

  const sodiumHigh = nutrition.sodium > 600;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 hover:bg-emerald-100 rounded-lg transition-colors"
            aria-label="Go back home"
          >
            <ArrowLeft className="w-6 h-6 text-emerald-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-emerald-800">Session Complete</h1>
            <p className="text-gray-600">Great work on your meal!</p>
          </div>
        </div>

        {/* Completion Summary */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-white mb-2">{recipe.name}</h2>
              <p className="text-emerald-50">
                You've successfully completed this recipe!
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-emerald-100" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <div className="text-emerald-100 text-sm mb-1">Cook Time</div>
              <div className="text-2xl">{recipe.time} min</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <div className="text-emerald-100 text-sm mb-1">Items Saved</div>
              <div className="text-2xl">{recipe.atRiskIngredientsUsed}</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <div className="text-emerald-100 text-sm mb-1">Difficulty</div>
              <div className="text-2xl">{recipe.difficulty}</div>
            </div>
          </div>
        </div>

        {/* Nutrition Overview */}
        <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h2 className="text-emerald-900">Nutrition Overview</h2>
          </div>

          {/* Calories */}
          <div className="mb-6 p-6 bg-emerald-50 rounded-lg border-2 border-emerald-200">
            <div className="text-center">
              <div className="text-sm text-emerald-700 mb-1">Total Calories</div>
              <div className="text-5xl text-emerald-900 mb-2">{nutrition.calories}</div>
              <div className="text-sm text-gray-600">per serving</div>
            </div>
          </div>

          {/* Macros */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {macroData.map((macro) => (
              <div key={macro.name} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">{macro.name}</span>
                  <span className="text-gray-900">
                    {macro.value}{macro.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${macro.color} transition-all`}
                    style={{ width: `${Math.min((macro.value / macro.target) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Target: {macro.target}{macro.unit}
                </div>
              </div>
            ))}
          </div>

          {/* Sodium Warning */}
          {sodiumHigh && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-amber-900 mb-1">Moderate Sodium Content</div>
                <p className="text-sm text-amber-800">
                  This dish contains {nutrition.sodium}mg of sodium. Daily recommended limit is 2,300mg.
                </p>
              </div>
            </div>
          )}

          {/* Allergen Info */}
          {recipe.allergens && recipe.allergens.length > 0 && (
            <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="text-red-900 mb-2">⚠️ Contains Allergens</div>
              <div className="flex flex-wrap gap-2">
                {recipe.allergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm border border-red-300"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Data Source */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Nutritional data is estimated based on USDA and FDA sources. Actual values may vary based on specific ingredients and preparation methods.
            </p>
          </div>
        </div>

        {/* Sustainability Impact */}
        <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
          <h2 className="text-emerald-900 mb-4">Sustainability Impact</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <div className="text-green-900 mb-1">Ingredients Saved from Waste</div>
                <p className="text-sm text-green-700">
                  You used {recipe.atRiskIngredientsUsed} items that were about to expire
                </p>
              </div>
              <div className="text-3xl text-green-700">{recipe.atRiskIngredientsUsed}</div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-emerald-900 mb-2">Weekly Progress</div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">Waste Reduction Goal</div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
                <div className="text-emerald-700">65%</div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
              🎉 Nice work! You've saved <span className="text-emerald-700">2.1kg</span> of food from waste this week.
            </div>
          </div>
        </div>

        {/* Leftover Logging */}
        <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
          <h2 className="text-emerald-900 mb-4">Log Leftovers</h2>
          
          <p className="text-gray-600 mb-4">
            Do you have any leftovers to save for later?
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => {
                alert('Logging leftovers... (This would update pantry inventory)');
              }}
              className="flex-1 py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              Yes, Save Leftovers
            </button>
            <button
              onClick={onBack}
              className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              No Thanks
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={onBack}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
          >
            Return to Home
          </button>
          <p className="text-sm text-gray-500 mt-3">
            Have a great meal! 👨‍🍳
          </p>
        </div>
      </div>
    </div>
  );
}
