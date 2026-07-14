import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

export const ai = new GoogleGenAI({ apiKey });

// Models tried in order — first that succeeds wins
const MODEL_CHAIN = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-2.0-flash"];

/** Retry a Gemini call up to `maxAttempts` times on 503 / 429 (rate-limit). */
async function withRetry<T>(fn: (model: string) => Promise<T>): Promise<T> {
  const errors: unknown[] = [];
  for (const model of MODEL_CHAIN) {
    let lastErr: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await fn(model);
      } catch (err: unknown) {
        const status = (err as { status?: number }).status;
        if (status === 503 || status === 429) {
          lastErr = err;
          // Exponential back-off: 1s, 2s, 4s
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
        } else {
          // Non-retryable (404, 400, etc.) — try next model immediately
          lastErr = err;
          break;
        }
      }
    }
    errors.push(lastErr);
  }
  // All models exhausted
  throw errors[0];
}

export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  return withRetry(async (model) => {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction ?? "You are an expert AI research assistant helping students and researchers understand academic papers.",
        maxOutputTokens: 8192,
      },
    });
    return response.text ?? "";
  });
}

export async function generateJson<T>(prompt: string, systemInstruction?: string): Promise<T> {
  return withRetry(async (model) => {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction ?? "You are an expert AI research assistant. Always respond with valid JSON only, no markdown, no explanation.",
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
      },
    });
    const raw = response.text ?? "{}";
    // Strip markdown code fences if model wrapped JSON in ```json ... ```
    const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    try {
      return JSON.parse(text) as T;
    } catch {
      // Try extracting JSON object from the text
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { return JSON.parse(match[0]) as T; } catch { /* fall through */ }
      }
      return {} as T;
    }
  });
}
