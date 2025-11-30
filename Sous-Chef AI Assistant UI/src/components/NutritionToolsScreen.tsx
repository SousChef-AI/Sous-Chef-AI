import { ArrowLeft, TrendingUp, Target, Calendar, Settings, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface NutritionToolsScreenProps {
  onBack: () => void;
}

interface NutritionGoal {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

interface MealHistory {
  id: string;
  name: string;
  date: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const weeklyData = [
  { day: 'Mon', calories: 1850, protein: 95, carbs: 220, fat: 62 },
  { day: 'Tue', calories: 2100, protein: 110, carbs: 245, fat: 72 },
  { day: 'Wed', calories: 1920, protein: 88, carbs: 235, fat: 65 },
  { day: 'Thu', calories: 2050, protein: 105, carbs: 228, fat: 70 },
  { day: 'Fri', calories: 1780, protein: 82, carbs: 210, fat: 58 },
  { day: 'Sat', calories: 2200, protein: 115, carbs: 260, fat: 75 },
  { day: 'Sun', calories: 2000, protein: 98, carbs: 240, fat: 68 },
];

const todayMeals: MealHistory[] = [
  {
    id: '1',
    name: 'Spinach Tofu Stir-Fry',
    date: '2025-11-29',
    time: '12:30 PM',
    calories: 285,
    protein: 24,
    carbs: 12,
    fat: 16,
  },
  {
    id: '2',
    name: 'Chickpea Curry',
    date: '2025-11-29',
    time: '7:00 PM',
    calories: 380,
    protein: 14,
    carbs: 42,
    fat: 18,
  },
  {
    id: '3',
    name: 'Greek Yogurt Bowl',
    date: '2025-11-29',
    time: '8:00 AM',
    calories: 220,
    protein: 18,
    carbs: 28,
    fat: 6,
  },
];

export function NutritionToolsScreen({ onBack }: NutritionToolsScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'history'>('overview');
  const [showGoalEditor, setShowGoalEditor] = useState(false);

  // Calculate today's totals
  const todayTotals = todayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const nutritionGoals: NutritionGoal[] = [
    {
      name: 'Calories',
      current: todayTotals.calories,
      target: 2000,
      unit: 'kcal',
      color: 'bg-emerald-500',
    },
    {
      name: 'Protein',
      current: todayTotals.protein,
      target: 100,
      unit: 'g',
      color: 'bg-blue-500',
    },
    {
      name: 'Carbs',
      current: todayTotals.carbs,
      target: 250,
      unit: 'g',
      color: 'bg-amber-500',
    },
    {
      name: 'Fat',
      current: todayTotals.fat,
      target: 65,
      unit: 'g',
      color: 'bg-purple-500',
    },
  ];

  const weeklyAverage = {
    calories: Math.round(weeklyData.reduce((acc, day) => acc + day.calories, 0) / 7),
    protein: Math.round(weeklyData.reduce((acc, day) => acc + day.protein, 0) / 7),
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3 hover:bg-emerald-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-emerald-700" />
            </button>
            <div>
              <h1 className="text-emerald-800">Nutrition Tools</h1>
              <p className="text-sm text-gray-600">Track your health goals</p>
            </div>
          </div>
          <button
            onClick={() => setShowGoalEditor(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Edit Goals</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-lg p-2 border-2 border-emerald-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-emerald-500 text-white'
                : 'bg-transparent text-gray-700 hover:bg-emerald-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'goals'
                ? 'bg-emerald-500 text-white'
                : 'bg-transparent text-gray-700 hover:bg-emerald-50'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-white'
                : 'bg-transparent text-gray-700 hover:bg-emerald-50'
            }`}
          >
            History
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Today's Summary */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6" />
                <div>
                  <h2 className="text-white">Today's Nutrition</h2>
                  <p className="text-emerald-50 text-sm">Saturday, November 29, 2025</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                  <div className="text-emerald-100 text-sm mb-1">Calories</div>
                  <div className="text-2xl">{todayTotals.calories}</div>
                  <div className="text-xs text-emerald-100">of 2000</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                  <div className="text-emerald-100 text-sm mb-1">Protein</div>
                  <div className="text-2xl">{todayTotals.protein}g</div>
                  <div className="text-xs text-emerald-100">of 100g</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                  <div className="text-emerald-100 text-sm mb-1">Carbs</div>
                  <div className="text-2xl">{todayTotals.carbs}g</div>
                  <div className="text-xs text-emerald-100">of 250g</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                  <div className="text-emerald-100 text-sm mb-1">Fat</div>
                  <div className="text-2xl">{todayTotals.fat}g</div>
                  <div className="text-xs text-emerald-100">of 65g</div>
                </div>
              </div>
            </div>

            {/* Daily Progress Rings */}
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
              <h2 className="text-emerald-900 mb-6">Daily Progress</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {nutritionGoals.map((goal) => {
                  const percentage = Math.min((goal.current / goal.target) * 100, 100);
                  const isOver = goal.current > goal.target;
                  
                  return (
                    <div key={goal.name} className="flex flex-col items-center">
                      {/* Circular Progress */}
                      <div className="relative w-32 h-32 mb-3">
                        <svg className="w-32 h-32 -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                            className={`transition-all ${
                              isOver ? 'text-amber-500' : goal.color.replace('bg-', 'text-')
                            }`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-2xl text-gray-900">{goal.current}</div>
                          <div className="text-xs text-gray-500">{goal.unit}</div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-gray-900 mb-1">{goal.name}</div>
                        <div className={`text-sm ${isOver ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {Math.round(percentage)}% of goal
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Trend Chart */}
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-emerald-900">Weekly Trends</h2>
                  <p className="text-sm text-gray-600">Your nutrition over the past 7 days</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Weekly Average</div>
                  <div className="text-emerald-700">{weeklyAverage.calories} kcal/day</div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={2} name="Calories" />
                  <Line type="monotone" dataKey="protein" stroke="#3b82f6" strokeWidth={2} name="Protein (g)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Macro Distribution */}
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
              <h2 className="text-emerald-900 mb-6">Weekly Macro Distribution</h2>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="protein" fill="#3b82f6" name="Protein (g)" />
                  <Bar dataKey="carbs" fill="#f59e0b" name="Carbs (g)" />
                  <Bar dataKey="fat" fill="#8b5cf6" name="Fat (g)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-emerald-600" />
                <h2 className="text-emerald-900">Your Nutrition Goals</h2>
              </div>

              <div className="space-y-4">
                {nutritionGoals.map((goal) => (
                  <div key={goal.name} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-gray-900 mb-1">{goal.name}</div>
                        <div className="text-sm text-gray-600">
                          Current: {goal.current}{goal.unit} / Target: {goal.target}{goal.unit}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowGoalEditor(true)}
                        className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors text-sm"
                      >
                        Edit
                      </button>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${goal.color} transition-all`}
                        style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dietary Preferences */}
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
              <h2 className="text-emerald-900 mb-6">Dietary Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="text-gray-900 mb-1">Diet Type</div>
                    <div className="text-sm text-gray-600">Plant-based (Vegan)</div>
                  </div>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm">Change</button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="text-gray-900 mb-1">Allergens</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm border border-red-300">
                        Nuts
                      </span>
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm border border-red-300">
                        Shellfish
                      </span>
                    </div>
                  </div>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm">Manage</button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="text-gray-900 mb-1">Sodium Limit</div>
                    <div className="text-sm text-gray-600">2,300mg per day (recommended)</div>
                  </div>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm">Adjust</button>
                </div>
              </div>
            </div>

            {/* Weekly Goals */}
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
              <h2 className="text-emerald-900 mb-6">Weekly Objectives</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900">Hit protein goal 5/7 days</div>
                    <div className="text-sm text-gray-600 mt-1">You're on track! 4 days completed.</div>
                  </div>
                  <div className="text-green-700">80%</div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    !
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900">Stay under sodium limit</div>
                    <div className="text-sm text-gray-600 mt-1">3 days over limit this week</div>
                  </div>
                  <div className="text-amber-700">57%</div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    →
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900">Increase fiber intake</div>
                    <div className="text-sm text-gray-600 mt-1">Average 22g/day, target 30g/day</div>
                  </div>
                  <div className="text-blue-700">73%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-emerald-900">Today's Meals</h2>
                <div className="text-sm text-gray-600">
                  Total: {todayTotals.calories} kcal
                </div>
              </div>

              <div className="space-y-3">
                {todayMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-1">{meal.name}</h3>
                        <div className="text-sm text-gray-600">{meal.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-700">{meal.calories}</div>
                        <div className="text-xs text-gray-500">calories</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Protein</div>
                        <div className="text-gray-900">{meal.protein}g</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Carbs</div>
                        <div className="text-gray-900">{meal.carbs}g</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Fat</div>
                        <div className="text-gray-900">{meal.fat}g</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Week at a Glance */}
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
              <h2 className="text-emerald-900 mb-6">Week at a Glance</h2>
              
              <div className="space-y-3">
                {weeklyData.map((day) => {
                  const isToday = day.day === 'Sat';
                  
                  return (
                    <div
                      key={day.day}
                      className={`rounded-lg p-4 border-2 ${
                        isToday
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`text-gray-900 ${isToday ? 'font-semibold' : ''}`}>
                            {day.day}
                          </div>
                          {isToday && (
                            <span className="px-2 py-1 bg-emerald-500 text-white rounded text-xs">
                              Today
                            </span>
                          )}
                        </div>
                        <div className={isToday ? 'text-emerald-700' : 'text-gray-700'}>
                          {day.calories} kcal
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${isToday ? 'bg-emerald-500' : 'bg-gray-400'} transition-all`}
                          style={{ width: `${(day.calories / 2500) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Data Source Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-blue-900 mb-1">Data Transparency</div>
                <p className="text-sm text-blue-800">
                  All nutritional data is calculated using USDA FoodData Central and FDA databases. 
                  Values are estimates and may vary based on specific brands and preparation methods.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Goal Editor Modal */}
        {showGoalEditor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h2 className="text-emerald-900 mb-6">Edit Daily Goals</h2>
              
              <div className="space-y-4 mb-6">
                {nutritionGoals.map((goal) => (
                  <div key={goal.name}>
                    <label className="block text-sm text-gray-700 mb-2">
                      {goal.name} ({goal.unit})
                    </label>
                    <input
                      type="number"
                      defaultValue={goal.target}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowGoalEditor(false)}
                  className="flex-1 py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowGoalEditor(false)}
                  className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Voice Commands */}
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
          <div className="text-sm text-emerald-800 mb-2">Voice commands:</div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white text-emerald-700 rounded-md text-xs border border-emerald-200">
              "How many calories have I eaten today?"
            </span>
            <span className="px-3 py-1 bg-white text-emerald-700 rounded-md text-xs border border-emerald-200">
              "Show my protein intake"
            </span>
            <span className="px-3 py-1 bg-white text-emerald-700 rounded-md text-xs border border-emerald-200">
              "What's my weekly average?"
            </span>
            <span className="px-3 py-1 bg-white text-emerald-700 rounded-md text-xs border border-emerald-200">
              "Set my calorie goal to 2200"
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
