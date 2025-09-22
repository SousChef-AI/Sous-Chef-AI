import { useEffect, useMemo, useRef, useState } from "react";
import { listen, speak } from "./lib/voice";
import { LLM_MODE } from "./lib/config";
import { assistLLM, computeNutrition, searchRecipes, getRecipe } from "./lib/api";
import { puterElaborateStep } from "./lib/puter";
import { puterHelpFromText } from "./lib/puter";

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

  function handleUserText(text: string) {
    // 👉 Replace this with your own calls
    console.log("User text:", text);
    // Example placeholder:
    speak(`You entered: ${text}`);
  }

  async function submitUserText() {
    const text = userText.trim();
    if (!text) return;

    if (!meal) return;
    try {
      setAssistLoading(true);                   // NEW
      const res =
        LLM_MODE === "puter"
          ? await puterHelpFromText(text, meal, stepIdx, {})
          : await assistLLM({ recipe: meal, step_index: stepIdx, constraints: {} });

      const reply = res?.text ?? String(res);   // NEW
      setAssistText(reply);                     // NEW
      speak(reply);                             // speak it as well
    } catch (err: any) {
      const msg = "Sorry, the assistant is unavailable right now.";
      setAssistText(msg);                       // NEW
      speak(msg);
      console.error(err);
    } finally {
      setAssistLoading(false);                  // NEW
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
            <div className="hidden md:flex items-center gap-2">
              <input
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitUserText()}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 placeholder-white/70 text-white w-72"
                placeholder="Type text and press Enter"
              />
              <button
                onClick={submitUserText}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20"
                title="Send text"
              >
                ➤ Send
              </button>
            </div>
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
            <div className="md:hidden max-w-5xl mx-auto pt-3">
              <div className="flex items-center gap-2">
                <input
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitUserText()}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 placeholder-white/70 text-white"
                  placeholder="Type text and press Enter"
                />
                <button
                  onClick={submitUserText}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20"
                  title="Send text"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Assistant response panel */}
        <section className="bg-white rounded-2xl shadow p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Assistant Response</h2>
            <div className="flex gap-2">
              <button
                onClick={() => assistText && navigator.clipboard.writeText(assistText)}
                className="px-3 py-1.5 rounded-lg border disabled:opacity-40"
                disabled={!assistText}
                title="Copy text"
              >
                📋 Copy
              </button>
              <button
                onClick={() => assistText && speak(assistText)}
                className="px-3 py-1.5 rounded-lg border disabled:opacity-40"
                disabled={!assistText}
                title="Speak again"
              >
                🔊 Speak
              </button>
              <button
                onClick={() => setAssistText("")}
                className="px-3 py-1.5 rounded-lg border"
                title="Clear"
              >
                ✖ Clear
              </button>
            </div>
          </div>

          <div
            className="min-h-20 max-h-60 overflow-auto rounded-xl border bg-slate-50 p-3 text-slate-800 leading-7 whitespace-pre-wrap"
            aria-busy={assistLoading}
          >
            {assistLoading
              ? "Thinking…"
              : (assistText || "No response yet. Type a question or instruction above.")}
          </div>
        </section>

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
                Try voice: “next”, “previous”, “repeat”, or “set pasta timer to 9
                minutes”.
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


