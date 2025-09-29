// src/lib/puter.ts
declare global {
  interface Window {
    puter?: any;
  }
}

type PuterChatOptions = {
  model?: string;
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
  const resp = await window.puter.ai.chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { model }
  );

  const text = typeof resp === "string" ? resp : (resp?.text ?? String(resp));
  return { text };
}

export async function puterHelpFromText(
  prompt: string,
  recipe: any,
  stepIndex: number,
  constraints?: any,
  opts?: PuterChatOptions
): Promise<{ text: string }> {
  if (!window.puter?.ai?.chat) {
    throw new Error("Puter.js is not available on window.puter.ai.chat");
  }

  const userPrompt = prompt; 
  const step = recipe.instructions?.[stepIndex] ?? "";
  const title = recipe.title ?? "Untitled recipe";
  const servings = recipe.servings ?? 1;

  const system = `You are an expert sous chef providing comprehensive cooking assistance. Your responses should be:
- CONTEXTUAL: Use the full recipe context provided (ingredients, all steps) to give informed answers
- STEP-FOCUSED: When relevant, prioritize guidance for the current step the user is on
- ACTIONABLE: Give specific techniques, not just descriptions
- SENSORY: Include what to look for, smell for, hear, and feel
- TIMING: Provide precise time ranges and when to check progress
- TROUBLESHOOTING: Mention common mistakes and how to avoid them
- SAFETY-FIRST: Always prioritize food safety and kitchen safety
- CONCISE: Keep responses focused and practical
- CONVERSATIONAL: Format for voice reading with natural language

User question: "${userPrompt}"`;

  const allSteps = recipe.instructions?.map((step: string, index: number) => 
    `Step ${index + 1}: ${step}`
  ).join('\n') || 'No instructions available';

  const ingredientsList = recipe.ingredients?.map((ing: any) => 
    `${ing.measure ? ing.measure + ' ' : ''}${ing.name || ing}`
  ).join(', ') || 'No ingredients specified';

  const user = `RECIPE CONTEXT:
Recipe: "${title}" (${servings} servings)
Category: ${recipe.category || 'Not specified'}
Cuisine: ${recipe.area || 'Not specified'}

COMPLETE INGREDIENT LIST:
${ingredientsList}

ALL RECIPE STEPS:
${allSteps}

CURRENT POSITION:
Currently on Step ${stepIndex + 1} of ${recipe.instructions?.length || 0}: "${step}"

${constraints && Object.keys(constraints).length > 0 ? `SPECIAL REQUIREMENTS: ${JSON.stringify(constraints)}` : ''}

Please answer the user's question using this complete recipe context. If the question relates to the current step, focus on that, but feel free to reference other steps, ingredients, or overall recipe knowledge as needed.`;

  const model = opts?.model ?? "gpt-4o";
  const resp = await window.puter.ai.chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { model }
  );

  const text = typeof resp === "string" ? resp : (resp?.text ?? String(resp));
  return { text };
}

export async function puterGeneralHelp(
  prompt: string,
  opts?: PuterChatOptions
): Promise<{ text: string }> {
  if (!window.puter?.ai?.chat) {
    throw new Error("Puter.js is not available on window.puter.ai.chat");
  }

  const system = `You are an expert sous chef providing general cooking assistance. Your responses should be:
- HELPFUL: Provide practical cooking advice and tips
- EDUCATIONAL: Explain cooking techniques and food science when relevant
- SAFETY-FIRST: Always prioritize food safety and kitchen safety
- ENCOURAGING: Be supportive and encouraging for home cooks
- CONCISE: Keep responses focused and practical
- CONVERSATIONAL: Format for voice reading with natural language

The user doesn't currently have a recipe selected, so provide general cooking guidance based on their question.`;

  const user = `User question: "${prompt}"

Please provide helpful cooking advice or information based on this question. Since no specific recipe is active, give general guidance that would be useful for home cooking.`;

  const model = opts?.model ?? "gpt-4o";
  const resp = await window.puter.ai.chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { model }
  );

  const text = typeof resp === "string" ? resp : (resp?.text ?? String(resp));
  return { text };
}