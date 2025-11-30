import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, X, Plus } from 'lucide-react';
import { Timer } from '../App';

interface TimerScreenProps {
  onBack: () => void;
}

export function TimerScreen({ onBack }: TimerScreenProps) {
  const [timers, setTimers] = useState<Timer[]>([
    {
      id: '1',
      label: 'Boil pasta',
      duration: 600,
      remaining: 213,
      isActive: true,
    },
    {
      id: '2',
      label: 'Simmer sauce',
      duration: 900,
      remaining: 738,
      isActive: true,
    },
    {
      id: '3',
      label: 'Preheat oven',
      duration: 480,
      remaining: 0,
      isActive: false,
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers =>
        prevTimers.map(timer => {
          if (timer.isActive && timer.remaining > 0) {
            return { ...timer, remaining: timer.remaining - 1 };
          }
          if (timer.isActive && timer.remaining === 0) {
            return { ...timer, isActive: false };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleTimer = (id: string) => {
    setTimers(prevTimers =>
      prevTimers.map(timer =>
        timer.id === id && timer.remaining > 0
          ? { ...timer, isActive: !timer.isActive }
          : timer
      )
    );
  };

  const removeTimer = (id: string) => {
    setTimers(prevTimers => prevTimers.filter(timer => timer.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (timer: Timer) => {
    return ((timer.duration - timer.remaining) / timer.duration) * 100;
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3 hover:bg-emerald-100 rounded-lg transition-colors"
              aria-label="Go back to cooking"
            >
              <ArrowLeft className="w-6 h-6 text-emerald-700" />
            </button>
            <h1 className="text-emerald-800">Active Timers</h1>
          </div>
          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-2 transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add Timer</span>
          </button>
        </div>

        {/* Timer Cards */}
        <div className="space-y-4">
          {timers.map(timer => (
            <div
              key={timer.id}
              className={`bg-white rounded-xl p-6 border-2 transition-all ${
                timer.remaining === 0
                  ? 'border-amber-400 bg-amber-50 animate-pulse'
                  : timer.isActive
                  ? 'border-emerald-300'
                  : 'border-gray-200'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{timer.label}</h3>
                    <div className="text-sm text-gray-500">
                      Step {timers.indexOf(timer) + 1} of 7
                    </div>
                  </div>
                  <button
                    onClick={() => removeTimer(timer.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Remove timer"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Timer Display */}
                <div className="flex items-center gap-6">
                  {/* Circular Progress */}
                  <div className="relative w-32 h-32">
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
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - getProgress(timer) / 100)}`}
                        className={`transition-all ${
                          timer.remaining === 0
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`text-2xl ${
                        timer.remaining === 0 ? 'text-amber-700' : 'text-gray-900'
                      }`}>
                        {formatTime(timer.remaining)}
                      </div>
                    </div>
                  </div>

                  {/* Info and Controls */}
                  <div className="flex-1 space-y-3">
                    {timer.remaining === 0 ? (
                      <div className="text-amber-700">
                        ⏰ Timer complete!
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        {Math.ceil(timer.remaining / 60)} minutes remaining
                      </div>
                    )}

                    <div className="flex gap-3">
                      {timer.remaining > 0 && (
                        <button
                          onClick={() => toggleTimer(timer.id)}
                          className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                            timer.isActive
                              ? 'bg-amber-500 hover:bg-amber-600 text-white'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          }`}
                        >
                          {timer.isActive ? (
                            <>
                              <Pause className="w-5 h-5" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5" />
                              <span>Resume</span>
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => removeTimer(timer.id)}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      timer.remaining === 0 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${getProgress(timer)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}

          {timers.length === 0 && (
            <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-300 text-center">
              <div className="text-gray-400 mb-2">No active timers</div>
              <p className="text-sm text-gray-500">
                Timers will appear here as you progress through recipe steps
              </p>
            </div>
          )}
        </div>

        {/* Voice Commands */}
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
          <div className="text-sm text-emerald-800 mb-2">Voice commands:</div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white text-emerald-700 rounded-md text-xs border border-emerald-200">
              "Pause timer"
            </span>
            <span className="px-3 py-1 bg-white text-emerald-700 rounded-md text-xs border border-emerald-200">
              "Resume timer"
            </span>
            <span className="px-3 py-1 bg-white text-emerald-700 rounded-md text-xs border border-emerald-200">
              "How much time is left?"
            </span>
            <span className="px-3 py-1 bg-white text-emerald-700 rounded-md text-xs border border-emerald-200">
              "Set a timer for 5 minutes"
            </span>
            <span className="px-3 py-1 bg-white text-emerald-700 rounded-md text-xs border border-emerald-200">
              "Go back to recipe"
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
