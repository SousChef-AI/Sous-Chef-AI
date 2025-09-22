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

  const system = `You are an expert sous chef providing real-time cooking guidance. Your responses should be:
- ACTIONABLE: Give specific techniques, not just descriptions
- SENSORY: Include what to look for, smell for, hear, and feel
- TIMING: Provide precise time ranges and when to check progress
- TROUBLESHOOTING: Mention common mistakes and how to avoid them
- SAFETY-FIRST: Always prioritize food safety and kitchen safety
- CONCISE: Keep responses focused and practical (3-5 sentences max)

Format responses for voice reading - use natural, conversational language.`;

  const user = `Recipe: "${title}" (${servings} servings)
${constraints && Object.keys(constraints).length > 0 ? `Special requirements: ${JSON.stringify(constraints)}` : ''}

CURRENT STEP ${stepIndex + 1}: "${step}"

Available ingredients: ${recipe.ingredients?.map((ing: any) => `${ing.quantity || ''} ${ing.name || ing}`).join(', ') || 'Not specified'}

Provide detailed guidance for this step including:
1. Specific technique tips
2. What to watch/listen/smell for
3. Timing and temperature if relevant
4. How to know when it's done correctly
5. One common mistake to avoid`;

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
