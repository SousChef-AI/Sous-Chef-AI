// src/lib/puter.ts
declare global {
  interface Window {
    puter?: any;
  }
}

type PuterChatOptions = {
  model?: string; // model selector; Puter may ignore/alias
};

export async function puterElaborateStep(
  recipe: any,
  stepIndex: number,
  constraints?: any,
  opts?: PuterChatOptions
): Promise<{ text: string }> {
  if (!window.puter?.ai?.chat) {
    throw new Error("Puter.js is not available on window.puter.ai.chat");
  }

  const step = recipe.instructions?.[stepIndex] ?? "";
  const title = recipe.title ?? "Untitled recipe";
  const servings = recipe.servings ?? 1;

  const system = `You are a precise, safety-conscious cooking assistant.
- Elaborate concisely on the requested step only.
- If timing is implied, suggest a range and when to set a timer.
- Clarify temperature, texture cues, and doneness checks when relevant.
- Suggest safe substitutions only if asked via constraints.
- Do NOT invent ingredient quantities.`;

  const user = `Recipe: ${title}
Servings: ${servings}
Constraints: ${JSON.stringify(constraints ?? {})}
Ingredients: ${JSON.stringify(recipe.ingredients ?? [])}

Current step #${stepIndex + 1}:
${step}

Please elaborate this step in 3–6 sentences, practical and safe.`;

  const model = opts?.model ?? "gpt-4o";
  // Puter’s API usually expects a single prompt string; some variants allow messages.
  const resp = await window.puter.ai.chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { model }
  );

  // Normalize response into text
  const text = typeof resp === "string" ? resp : (resp?.text ?? String(resp));
  return { text };
}
