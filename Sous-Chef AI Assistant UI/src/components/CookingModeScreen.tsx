import { useState, useEffect } from 'react';
import { ArrowLeft, SkipForward, RotateCcw, Play, Pause, Timer, Image as ImageIcon, Volume2 } from 'lucide-react';
import { Recipe } from '../App';

interface CookingModeScreenProps {
  recipe: Recipe;
  onFinish: () => void;
  onViewTimers: () => void;
  onBack: () => void;
}

export function CookingModeScreen({ recipe, onFinish, onViewTimers, onBack }: CookingModeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showIngredients, setShowIngredients] = useState(false);

  const step = recipe.steps[currentStep];
  const progress = ((currentStep + 1) / recipe.steps.length) * 100;

  useEffect(() => {
    if (step.timerDuration) {
      setTimeRemaining(step.timerDuration);
    } else {
      setTimeRemaining(null);
      setTimerActive(false);
    }
  }, [currentStep, step.timerDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const handleNext = () => {
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimerActive(false);
    } else {
      onFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setTimerActive(false);
    }
  };

  const toggleTimer = () => {
    if (timeRemaining !== null && timeRemaining > 0) {
      setTimerActive(!timerActive);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="p-3 hover:bg-emerald-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-emerald-700" />
          </button>
          <div className="flex-1">
            <h2 className="text-emerald-900">{recipe.name}</h2>
            <div className="text-sm text-gray-600">Cooking Mode</div>
          </div>
          <div className="bg-emerald-100 px-4 py-2 rounded-lg">
            <div className="text-sm text-emerald-700">Listening for commands</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl p-4 border-2 border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {recipe.steps.length}
            </span>
            <span className="text-sm text-emerald-700">{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Step Card - Large */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border-4 border-emerald-300 p-8 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-emerald-700 mb-2">Step {step.number}</div>
                    <p className="text-gray-900 leading-relaxed">
                      {step.instruction}
                    </p>
                  </div>
                  <Volume2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                </div>

                {/* Timer Section */}
                {timeRemaining !== null && (
                  <div className="bg-emerald-50 rounded-lg p-6 border-2 border-emerald-200">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-sm text-emerald-700 mb-1">Step Timer</div>
                        <div className="text-4xl text-emerald-900">
                          {formatTime(timeRemaining)}
                        </div>
                      </div>
                      <button
                        onClick={toggleTimer}
                        className={`p-4 rounded-full transition-all ${
                          timerActive 
                            ? 'bg-amber-500 hover:bg-amber-600' 
                            : 'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                        aria-label={timerActive ? 'Pause timer' : 'Start timer'}
                      >
                        {timerActive ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>
                    {timeRemaining === 0 && (
                      <div className="mt-2 text-sm text-amber-700 animate-pulse">
                        ⏰ Timer complete! Ready for the next step?
                      </div>
                    )}
                  </div>
                )}

                {/* Key Ingredients for this step */}
                {step.keyIngredients && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-700 mb-2">Key ingredients for this step:</div>
                    <div className="flex flex-wrap gap-2">
                      {step.keyIngredients.map((ing, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Buttons - Large and Clear */}
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="py-4 px-6 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                className="py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {currentStep === recipe.steps.length - 1 ? (
                  <>
                    <span>Finish</span>
                  </>
                ) : (
                  <>
                    <span>Next Step</span>
                    <SkipForward className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  // Simulate reading instruction aloud
                  alert(`Reading: "${step.instruction}"`);
                }}
                className="py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                <span>Repeat</span>
              </button>
            </div>

            {/* Voice Commands */}
            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <div className="text-sm text-gray-600 mb-2">Try saying:</div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-sm border border-emerald-200">
                  "Next"
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-sm border border-emerald-200">
                  "Repeat"
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-sm border border-emerald-200">
                  "Start timer"
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-sm border border-emerald-200">
                  "How much time is left?"
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-sm border border-emerald-200">
                  "Show ingredients"
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Ingredients Panel */}
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-emerald-900">Ingredients</h3>
                <button
                  onClick={() => setShowIngredients(!showIngredients)}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  {showIngredients ? 'Hide' : 'Show'}
                </button>
              </div>
              {showIngredients && (
                <div className="space-y-2">
                  {recipe.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                        ing.atRisk ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-sm text-gray-700">{ing.name}</span>
                      <span className="text-sm text-gray-600">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-200 space-y-3">
              <h3 className="text-emerald-900 mb-4">Quick Actions</h3>
              
              <button
                onClick={onViewTimers}
                className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors flex items-center gap-3"
              >
                <Timer className="w-5 h-5" />
                <span>View All Timers</span>
              </button>

              <button
                onClick={() => alert('Showing technique video...')}
                className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors flex items-center gap-3"
              >
                <ImageIcon className="w-5 h-5" />
                <span>Show Image/Video</span>
              </button>
            </div>

            {/* Safety Tips */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="text-sm text-amber-800">
                <div className="font-semibold mb-1">⚠️ Safety Tip</div>
                <p className="text-xs">
                  Keep pot handles turned inward. Use oven mitts when handling hot items.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
