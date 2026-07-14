import { Router, type IRouter } from "express";
import { ChatWithAssistantBody } from "@workspace/api-zod";
import { ai } from "../lib/gemini.js";

const router: IRouter = Router();

const SUGGESTED_QUESTIONS = [
  "What dataset was used in this study?",
  "What are the main limitations of these papers?",
  "Which paper would you recommend for implementation?",
  "What future research directions are suggested?",
  "Compare the methodologies of the papers.",
  "Explain the algorithm used in simple terms.",
  "What are the real-world applications of this research?",
  "Which paper has the best results?",
];

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = ChatWithAssistantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { message, history, papers } = parsed.data;

  try {
    let systemInstruction = `You are ResearchLens AI — an expert AI research assistant helping students and researchers understand academic papers. You are knowledgeable, patient, and explain concepts clearly. Use simple language accessible to students while maintaining accuracy.`;

    if (papers && papers.length > 0) {
      const paperContext = papers.map((p, i) =>
        `Paper ${i + 1}: "${p.title}" (${p.year ?? "n/a"}) by ${(p.authors ?? []).slice(0, 3).join(", ")}. Abstract: ${p.abstract?.slice(0, 400) ?? "Abstract not available."}`
      ).join("\n\n");
      systemInstruction += `\n\nThe user is currently viewing these research papers:\n\n${paperContext}\n\nUse this context to answer their questions accurately.`;
    }

    const chatHistory = (history ?? []).map(m => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...chatHistory,
        { role: "user", parts: [{ text: message }] },
      ],
      config: {
        systemInstruction,
        maxOutputTokens: 8192,
      },
    });

    const responseText = response.text ?? "I apologize, I couldn't generate a response. Please try again.";

    // Pick 3 relevant suggested questions
    const suggested = SUGGESTED_QUESTIONS.sort(() => Math.random() - 0.5).slice(0, 3);

    res.json({ response: responseText, suggestedQuestions: suggested });
  } catch (err) {
    req.log.error({ err }, "Chat failed");
    res.status(500).json({ error: "AI chat failed" });
  }
});

export default router;
