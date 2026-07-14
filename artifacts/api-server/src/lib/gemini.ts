import { GoogleGenAI } from "@google/genai";

const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY ?? "placeholder";

if (!baseUrl) {
  throw new Error("AI_INTEGRATIONS_GEMINI_BASE_URL is not set");
}

export const ai = new GoogleGenAI({
  apiKey,
  httpOptions: { baseUrl },
});

export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: systemInstruction ?? "You are an expert AI research assistant helping students and researchers understand academic papers.",
      maxOutputTokens: 8192,
    },
  });
  return response.text ?? "";
}

export async function generateJson<T>(prompt: string, systemInstruction?: string): Promise<T> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: systemInstruction ?? "You are an expert AI research assistant. Always respond with valid JSON only, no markdown, no explanation.",
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    },
  });
  const text = response.text ?? "{}";
  try {
    return JSON.parse(text) as T;
  } catch {
    return JSON.parse("{}") as T;
  }
}
