// src/lib/api.ts
import { API_BASE } from "./config";

export async function searchRecipes(q: string) {
  const r = await fetch(`${API_BASE}/recipes/search?q=${encodeURIComponent(q)}&source=themealdb`);
  return r.json(); // { results: Recipe[] }
}

export async function getRecipe(id: string) {
  const r = await fetch(`${API_BASE}/recipes/${id}?source=themealdb`);
  return r.json(); // { recipe: Recipe }
}

export async function assistLLM(payload: {
  recipe: any;
  step_index: number;
  constraints?: any;
}) {
  const r = await fetch(`${API_BASE}/llm/assist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const msg = await r.text();
    throw new Error(msg || `Backend LLM error (${r.status})`);
  }
  return r.json(); // { text: string }
}

export async function computeNutrition(payload: { recipe: any; servings: number }) {
  const r = await fetch(`${API_BASE}/nutrition/compute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return r.json(); // { total, per_serving, servings }
}
