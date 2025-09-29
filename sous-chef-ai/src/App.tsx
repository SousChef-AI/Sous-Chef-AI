import { useEffect, useMemo, useRef, useState } from "react";
import { listen, speak } from "./lib/voice";
import { LLM_MODE } from "./lib/config";
import { assistLLM } from "./lib/api";
import { puterElaborateStep, puterHelpFromText, puterGeneralHelp } from "./lib/puter";

type Meal = {
  id: string;
  title: string;
  image: string;
  category?: string;
  area?: string;
  instructions: string[];
  ingredients: { name: string; measure: string }[];
};

type Timer = { id: string; label: string; endAt: number }; // epoch ms

function parseMeal(m: any): Meal {
  // Instructions come as a long string with line breaks. Split by lines, trim empties.
  const instr = (m.strInstructions || "")
    .split(/\r?\n+/)
    .map((s: string) => s.trim())
    .filter(Boolean);

  // Collect ingredients/measure pairs (TheMealDB uses strIngredient1..20 / strMeasure1..20)
  const ingredients: { name: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = (m[`strIngredient${i}`] || "").trim();
    const measure = (m[`strMeasure${i}`] || "").trim();
    if (name) ingredients.push({ name, measure });
  }

  return {
    id: m.idMeal,
    title: m.strMeal,
    image: m.strMealThumb,
    category: m.strCategory || undefined,
    area: m.strArea || undefined,
    instructions: instr,
    ingredients,
  };
}

export default function App() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Meal[] | null>(null);

  const [meal, setMeal] = useState<Meal | null>(null);
  const [stepIdx, setStepIdx] = useState(0);

  const [listening, setListening] = useState(false);
  const stopListenRef = useRef<null | (() => void)>(null);

  const [timers, setTimers] = useState<Timer[]>([]);
  const [, forceTick] = useState(0); // for rerendering countdowns
  const tickRef = useRef<number | null>(null);

  const [userText, setUserText] = useState("");

  const [assistText, setAssistText] = useState<string>("");        // latest response text
  const [assistLoading, setAssistLoading] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  
  // keep a 1s ticker for timers
  useEffect(() => {
    tickRef.current = window.setInterval(() => forceTick((n) => n + 1), 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  // When step changes, speak it
  useEffect(() => {
    if (!meal) return;
    const step = meal.instructions[stepIdx] ?? "";
    if (step) speak(step);
  }, [meal, stepIdx]);

  const hasPrev = stepIdx > 0;
  const hasNext = useMemo(() => {
    if (!meal) return false;
    return stepIdx < meal.instructions.length - 1;
  }, [meal, stepIdx]);

  async function searchMeals() {
    if (!q.trim()) return;
    setLoading(true);
    setMeal(null);
    setResults(null);
    setStepIdx(0);
    try {
      // TheMealDB free search
      const r = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q.trim())}`
      );
      const j = await r.json();
      const meals = (j.meals || []).map(parseMeal);
      setResults(meals.length ? meals : []);
      if (!meals.length) speak("No results found.");
    } catch (e) {
      console.error(e);
      speak("Search failed.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function onElaborateStep() {
    if (!meal) return;
    try {
      const res =
        LLM_MODE === "puter"
          ? await puterElaborateStep(meal, stepIdx, {})
          : await assistLLM({ recipe: meal, step_index: stepIdx, constraints: {} });

      speak(res.text);
      // also consider showing res.text under the step UI
    } catch (err: any) {
      speak("Sorry, the assistant is unavailable right now.");
      console.error(err);
    }
  }

  async function submitUserText() {
    const text = userText.trim();
    if (!text) return;

    try {
      setAssistLoading(true);
      let res;
      
      if (meal) {
        // User has an active recipe - provide context-aware assistance
        res = LLM_MODE === "puter"
          ? await puterHelpFromText(text, meal, stepIdx, {})
          : await assistLLM({ recipe: meal, step_index: stepIdx, constraints: {} });
      } else {
        // No active recipe - provide general cooking assistance
        res = LLM_MODE === "puter"
          ? await puterGeneralHelp(text)
          : { text: "Please select a recipe first to get cooking assistance." };
      }

      const reply = res?.text ?? String(res);
      setAssistText(reply);
      speak(reply);
    } catch (err: any) {
      const msg = "Sorry, the assistant is unavailable right now.";
      setAssistText(msg);
      speak(msg);
      console.error(err);
    } finally {
      setAssistLoading(false);
    }
    setUserText("");
  }

  function chooseMeal(m: Meal) {
    setMeal(m);
    setStepIdx(0);
    setResults(null);
    queueMicrotask(() => {
      if (m.instructions.length === 0) speak("This recipe has no instructions.");
    });
  }

  function nextStep() {
    if (!meal) return;
    if (hasNext) setStepIdx((i) => i + 1);
    else speak("This was the last step.");
  }
  function prevStep() {
    if (!meal) return;
    if (hasPrev) setStepIdx((i) => Math.max(0, i - 1));
    else speak("You are at the first step.");
  }
  function repeatStep() {
    if (!meal) return;
    const step = meal.instructions[stepIdx] ?? "";
    if (step) speak(step);
  }

  // Timers
  function addTimer(label: string, seconds: number) {
    const id = crypto.randomUUID();
    const endAt = Date.now() + seconds * 1000;
    setTimers((ts) => [...ts, { id, label, endAt }]);
  }
  function removeTimer(id: string) {
    setTimers((ts) => ts.filter((t) => t.id !== id));
  }

  // check for finished timers
  useEffect(() => {
    if (!timers.length) return;
    const now = Date.now();
    const done = timers.filter((t) => t.endAt <= now);
    if (done.length) {
      done.forEach((t) => speak(`${t.label} timer is done.`));
      setTimers((ts) => ts.filter((t) => t.endAt > now));
    }
  }, [timers]);

  // Simple intent parser for voice
  function handleVoiceCommand(text: string) {
    const cmd = text.toLowerCase().trim();

    if (/^(next|next step|go next|continue)\b/.test(cmd)) {
      nextStep();
      return;
    }
    if (/^(previous|back|go back|prev(ious)? step)\b/.test(cmd)) {
      prevStep();
      return;
    }
    if (/^(repeat|say again|one more time)\b/.test(cmd)) {
      repeatStep();
      return;
    }

    // "set (pasta) timer to 8 minutes", "set timer 30 seconds"
    const timerRe =
      /set (?:an? )?(?<label>\w+(?: \w+)*)? ?timer (?:to )?(?<num>\d+(?:\.\d+)?) (?<unit>seconds?|mins?|minutes?)/;
    const m = cmd.match(timerRe);
    if (m?.groups) {
      const n = parseFloat(m.groups.num);
      const unit = m.groups.unit.startsWith("sec") ? "seconds" : "minutes";
      const secs = unit === "minutes" ? Math.round(n * 60) : Math.round(n);
      const label = (m.groups.label || "").trim() || "kitchen";
      addTimer(label, secs);
      speak(`Starting ${label} timer for ${n} ${unit}.`);
      return;
    }

    // "how many calories" (placeholder until we wire nutrition)
    if (/calorie|macros?/.test(cmd)) {
      speak("Nutrition is not connected yet. We will add it soon.");
      return;
    }

    // Fallback
    speak("Sorry, I didn't catch that. Say next, previous, repeat, or set timer to N minutes.");
  }

  function startListening() {
    setListening(true);
    try {
      stopListenRef.current = listen({
        lang: "en-US",
        onResult: handleVoiceCommand,
        onEnd: () => setListening(false),
        onError: () => setListening(false),
      });
    } catch (e: any) {
      setListening(false);
      alert(e?.message || "Speech recognition not supported in this browser.");
    }
  }
  function stopListening() {
    stopListenRef.current?.();
    setListening(false);
  }

  return (
    <div className="min-h-full bg-indigo-50 text-slate-800">
      <header className="sticky top-0 bg-indigo-600 text-white shadow p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">Sous Chef AI</h1>
          <div className="flex gap-2">
            {!listening ? (
              <button
                onClick={startListening}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20"
                title="Start listening"
              >
                🎙️ Listen
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20"
                title="Stop listening"
              >
                ⏹️ Stop
              </button>
            )}
            <button
              onClick={() => repeatStep()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20"
              title="Repeat step"
            >
              🔊 Repeat
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Search */}
        {!meal && (
          <section className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">Find a recipe</h2>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300"
                placeholder="Search (e.g., pasta, chicken, curry)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchMeals()}
              />
              <button
                onClick={searchMeals}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            {results && (
              <div className="grid md:grid-cols-3 gap-4 pt-2">
                {results.length === 0 && (
                  <div className="text-sm text-slate-600">No results.</div>
                )}
                {results.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => chooseMeal(m)}
                    className="text-left rounded-xl border hover:shadow overflow-hidden bg-white"
                  >
                    {m.image && (
                      <img src={m.image} alt="" className="w-full h-40 object-cover" />
                    )}
                    <div className="p-3">
                      <div className="font-medium">{m.title}</div>
                      <div className="text-xs text-slate-500">
                        {[m.category, m.area].filter(Boolean).join(" • ")}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Active recipe */}
        {meal && (
          <>
            <section className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="md:flex">
                {meal.image && (
                  <img
                    src={meal.image}
                    alt={meal.title}
                    className="w-full md:w-80 h-64 md:h-auto object-cover"
                  />
                )}
                <div className="p-6 flex-1 space-y-3">
                  <h2 className="text-2xl font-semibold">{meal.title}</h2>
                  <div className="text-sm text-slate-600">
                    {[meal.category, meal.area].filter(Boolean).join(" • ")}
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h3 className="font-medium mb-2">Ingredients</h3>
                    <ul className="grid sm:grid-cols-2 gap-x-6 text-sm text-slate-700">
                      {meal.ingredients.map((ing, i) => (
                        <li key={i}>
                          <span className="text-slate-900">{ing.name}</span>
                          {ing.measure ? ` — ${ing.measure}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Step navigator */}
            <section className="bg-white rounded-2xl shadow p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Step {stepIdx + 1}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={prevStep}
                    disabled={!hasPrev}
                    className="px-3 py-2 rounded-xl border disabled:opacity-40"
                  >
                    ◀ Previous
                  </button>
                  <button
                    onClick={repeatStep}
                    className="px-3 py-2 rounded-xl border"
                  >
                    🔊 Repeat
                  </button>
                  <button
                    onClick={onElaborateStep}
                    className="px-3 py-2 rounded-xl border"
                  >
                    ✨ Elaborate step
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!hasNext}
                    className="px-3 py-2 rounded-xl border disabled:opacity-40"
                  >
                    Next ▶
                  </button>
                </div>
              </div>

              <p className="text-slate-800 leading-7">
                {meal.instructions[stepIdx] || "No instruction text."}
              </p>

              <div className="text-xs text-slate-500">
                Try voice: "next", "previous", "repeat", or "set pasta timer to 9
                minutes".
              </div>
            </section>

            {/* Timers */}
            <section className="bg-white rounded-2xl shadow p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Timers</h3>
                <button
                  onClick={() => addTimer("example", 10)}
                  className="px-3 py-2 rounded-xl border"
                  title="Start a 10-second example timer"
                >
                  + 10s demo
                </button>
              </div>

              {timers.length === 0 ? (
                <div className="text-sm text-slate-600">No active timers.</div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {timers.map((t) => (
                    <TimerBadge
                      key={t.id}
                      timer={t}
                      onClear={() => removeTimer(t.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Floating Chat Widget */}
      <ChatWidget 
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        userText={userText}
        setUserText={setUserText}
        assistText={assistText}
        assistLoading={assistLoading}
        onSubmit={submitUserText}
        onClear={() => setAssistText("")}
      />

    </div>
  );
}

function TimerBadge({
  timer,
  onClear,
}: {
  timer: Timer;
  onClear: () => void;
}) {
  const now = Date.now();
  const remain = Math.max(0, Math.round((timer.endAt - now) / 1000));
  const mins = Math.floor(remain / 60);
  const secs = remain % 60;

  return (
    <div className="px-3 py-2 rounded-xl border bg-slate-50">
      <div className="text-sm font-medium">{timer.label}</div>
      <div className="text-sm tabular-nums">
        {mins}:{secs.toString().padStart(2, "0")}
      </div>
      <div className="mt-1">
        <button onClick={onClear} className="text-xs text-rose-600 hover:underline">
          clear
        </button>
      </div>
    </div>
  );
}

function ChatWidget({
  isOpen,
  onToggle,
  userText,
  setUserText,
  assistText,
  assistLoading,
  onSubmit,
  onClear,
}: {
  isOpen: boolean;
  onToggle: () => void;
  userText: string;
  setUserText: (text: string) => void;
  assistText: string;
  assistLoading: boolean;
  onSubmit: () => void;
  onClear: () => void;
}) {
  return (
    <>
      {/* Chat Panel - positioned independently */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 bg-white rounded-xl shadow-2xl w-96 sm:w-80 max-w-[calc(100vw-2rem)] flex flex-col transform transition-all duration-200 chat-slide-up">
          {/* Header - Minimized */}
          <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-medium text-sm">Sous Chef AI</h3>
            </div>
            <button
              onClick={onToggle}
              className="text-white/80 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors text-sm"
              title="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages - Dynamic height based on content */}
          <div className={`overflow-y-auto px-3 py-2 bg-gray-50/30 ${
            assistText 
              ? assistText.length > 200 
                ? 'min-h-32 max-h-80' 
                : assistText.length > 100 
                  ? 'min-h-24 max-h-60' 
                  : 'min-h-20 max-h-40'
              : 'min-h-16 max-h-32'
          }`}>
            {assistText ? (
              <div className="space-y-2">
                {/* AI Response */}
                <div className="flex gap-2 items-start">
                  <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-1">
                    AI
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-sm px-3 py-2 shadow-sm flex-1 leading-relaxed text-slate-800 text-sm whitespace-pre-wrap">
                    {assistLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce bounce-delay-1"></div>
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce bounce-delay-2"></div>
                        </div>
                        <span className="text-slate-500 text-xs">Thinking...</span>
                      </div>
                    ) : (
                      assistText
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                {assistText && !assistLoading && (
                  <div className="flex gap-1 ml-8">
                    <button
                      onClick={() => navigator.clipboard.writeText(assistText)}
                      className="px-2 py-0.5 text-xs bg-white/80 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                      title="Copy text"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => speak(assistText)}
                      className="px-2 py-0.5 text-xs bg-white/80 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                      title="Speak response"
                    >
                      🔊
                    </button>
                    <button
                      onClick={onClear}
                      className="px-2 py-0.5 text-xs bg-white/80 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                      title="Clear chat"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-4">
                <div className="text-xl mb-1">💬</div>
                <p className="text-xs">Ask me about your recipe</p>
              </div>
            )}
          </div>

          {/* Input Area - Minimized */}
          <div className="px-3 py-2 border-t border-slate-200 bg-white rounded-b-xl">
            <div className="flex gap-2">
              <input
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSubmit()}
                className="flex-1 px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400"
                placeholder="Ask about the recipe..."
                disabled={assistLoading}
              />
              <button
                onClick={onSubmit}
                disabled={!userText.trim() || assistLoading}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                title="Send message"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button - Always in same position */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={onToggle}
          className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center group"
          title={isOpen ? "Close chat" : "Open AI chat"}
        >
          {isOpen ? (
            <span className="text-base">✕</span>
          ) : (
            <div className="relative">
              <span className="text-base">💬</span>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </button>
      </div>
    </>
  );
}