import { Search, ArrowLeft, Clock, ChefHat, AlertCircle } from 'lucide-react';
import { Recipe } from '../App';
import { useState } from 'react';

interface RecipeSelectionScreenProps {
  onSelectRecipe: (recipe: Recipe) => void;
  onBack: () => void;
}

const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Spinach Tofu Stir-Fry',
    time: 18,
    difficulty: 'Easy',
    atRiskIngredientsUsed: 2,
    ingredients: [
      { name: 'Tofu', amount: '400g', atRisk: true },
      { name: 'Spinach', amount: '200g', atRisk: true },
      { name: 'Soy sauce', amount: '3 tbsp' },
      { name: 'Garlic', amount: '3 cloves' },
      { name: 'Ginger', amount: '1 tbsp' },
      { name: 'Sesame oil', amount: '2 tsp' },
    ],
    steps: [
      { number: 1, instruction: 'Press and cube the tofu into 2cm pieces.' },
      { number: 2, instruction: 'Mince the garlic and grate the ginger.' },
      { number: 3, instruction: 'Heat sesame oil in a large pan over medium-high heat.' },
      { number: 4, instruction: 'Add tofu cubes and cook until golden, about 5 minutes.', timerDuration: 300 },
      { number: 5, instruction: 'Add garlic and ginger, stir for 30 seconds.', timerDuration: 30 },
      { number: 6, instruction: 'Add spinach and soy sauce, cook until wilted.', timerDuration: 120 },
      { number: 7, instruction: 'Serve hot over rice or noodles.' },
    ],
    nutrition: {
      calories: 285,
      protein: 24,
      carbs: 12,
      fat: 16,
      sodium: 680,
      fiber: 4,
    },
    allergens: ['Soy'],
  },
  {
    id: '2',
    name: 'Chickpea Curry',
    time: 30,
    difficulty: 'Moderate',
    atRiskIngredientsUsed: 1,
    ingredients: [
      { name: 'Chickpeas', amount: '2 cans' },
      { name: 'Onions', amount: '2 large', atRisk: true },
      { name: 'Tomatoes', amount: '3 medium' },
      { name: 'Coconut milk', amount: '1 can' },
      { name: 'Curry powder', amount: '2 tbsp' },
      { name: 'Garlic', amount: '4 cloves' },
    ],
    steps: [
      { number: 1, instruction: 'Dice onions and tomatoes. Mince garlic.' },
      { number: 2, instruction: 'Heat oil in a large pot over medium heat.' },
      { number: 3, instruction: 'Sauté onions until golden, about 8 minutes.', timerDuration: 480 },
      { number: 4, instruction: 'Add garlic and curry powder, cook for 1 minute.', timerDuration: 60 },
      { number: 5, instruction: 'Add tomatoes and cook until softened, 5 minutes.', timerDuration: 300 },
      { number: 6, instruction: 'Add chickpeas and coconut milk. Simmer for 15 minutes.', timerDuration: 900 },
      { number: 7, instruction: 'Season with salt and serve with rice or naan.' },
    ],
    nutrition: {
      calories: 380,
      protein: 14,
      carbs: 42,
      fat: 18,
      sodium: 420,
      fiber: 12,
    },
    allergens: [],
  },
  {
    id: '3',
    name: 'Vegetable Pasta Primavera',
    time: 25,
    difficulty: 'Easy',
    atRiskIngredientsUsed: 3,
    ingredients: [
      { name: 'Pasta', amount: '400g' },
      { name: 'Bell peppers', amount: '2', atRisk: true },
      { name: 'Zucchini', amount: '1', atRisk: true },
      { name: 'Cherry tomatoes', amount: '200g', atRisk: true },
      { name: 'Olive oil', amount: '3 tbsp' },
      { name: 'Parmesan', amount: '50g' },
    ],
    steps: [
      { number: 1, instruction: 'Bring a large pot of salted water to boil.' },
      { number: 2, instruction: 'Chop vegetables into bite-sized pieces.' },
      { number: 3, instruction: 'Cook pasta according to package directions.', timerDuration: 600 },
      { number: 4, instruction: 'Meanwhile, heat olive oil in a pan over medium-high.' },
      { number: 5, instruction: 'Sauté vegetables until tender, about 7 minutes.', timerDuration: 420 },
      { number: 6, instruction: 'Drain pasta, reserving 1 cup pasta water.' },
      { number: 7, instruction: 'Toss pasta with vegetables, add pasta water as needed. Top with Parmesan.' },
    ],
    nutrition: {
      calories: 420,
      protein: 15,
      carbs: 68,
      fat: 11,
      sodium: 340,
      fiber: 6,
    },
    allergens: ['Dairy', 'Gluten'],
  },
];

export function RecipeSelectionScreen({ onSelectRecipe, onBack }: RecipeSelectionScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = mockRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 hover:bg-emerald-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-emerald-700" />
          </button>
          <h1 className="text-emerald-800">Browse Recipes</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
          />
        </div>

        {/* Voice Hint */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800">
            <span className="font-semibold">Voice tip:</span> Say "Start this recipe" when viewing a recipe card
          </p>
        </div>

        {/* Recipe List */}
        <div className="space-y-4">
          {filteredRecipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe)}
              className="w-full bg-white hover:bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-400 rounded-xl p-6 transition-all hover:shadow-lg text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-emerald-900">{recipe.name}</h3>
                    {recipe.atRiskIngredientsUsed > 0 && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                        Saves {recipe.atRiskIngredientsUsed} at-risk items
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{recipe.time} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4" />
                      <span className="text-sm">{recipe.difficulty}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recipe.ingredients.slice(0, 4).map((ing, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded-md text-xs ${
                          ing.atRisk
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ing.name}
                      </span>
                    ))}
                    {recipe.ingredients.length > 4 && (
                      <span className="px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                        +{recipe.ingredients.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500">Calories</div>
                  <div className="text-emerald-700">{recipe.nutrition.calories}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Voice Command Hint */}
        <div className="text-center text-gray-500 pt-4">
          <p className="text-sm">
            Say: "Show me quick recipes" or "What can I cook tonight?"
          </p>
        </div>
      </div>
    </div>
  );
}
