// src/lib/config.ts
export type LlmMode = "puter" | "backend";

/** Switch here: "puter" to use Puter.js in the browser, "backend" to call FastAPI */
export const LLM_MODE: LlmMode = "puter";

export const API_BASE = "http://localhost:8000";
