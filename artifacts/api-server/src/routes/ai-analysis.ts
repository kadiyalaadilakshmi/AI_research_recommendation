import { Router, type IRouter } from "express";
import {
  ComparePapersBody,
  DetectResearchGapsBody,
  GenerateRoadmapBody,
  ExplainPaperBody,
} from "@workspace/api-zod";
import { generateJson, generateText } from "../lib/gemini.js";

const router: IRouter = Router();

// POST /papers/compare
router.post("/papers/compare", async (req, res): Promise<void> => {
  const parsed = ComparePapersBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { papers } = parsed.data;
  if (papers.length < 2) {
    res.status(400).json({ error: "At least 2 papers required for comparison" });
    return;
  }

  const papersContext = papers.map((p, i) =>
    `Paper ${i + 1}: "${p.title}" (${p.year ?? "n/a"}) by ${(p.authors ?? []).slice(0, 3).join(", ")}. Abstract: ${p.abstract?.slice(0, 300) ?? "N/A"}`
  ).join("\n\n");

  try {
    const prompt = `You are an expert research analyst. Analyze these ${papers.length} research papers and provide a structured comparison.

${papersContext}

Return a JSON object with exactly this structure:
{
  "rows": [
    {
      "paperId": "paper id string",
      "title": "paper title",
      "year": number or null,
      "authors": "Author1, Author2",
      "journal": "journal/conference name or null",
      "dataset": "main dataset used",
      "algorithm": "main algorithm/method",
      "model": "model architecture if applicable",
      "accuracy": "accuracy percentage if mentioned",
      "citationCount": number or null,
      "advantages": "key advantages in 1-2 sentences",
      "limitations": "key limitations in 1-2 sentences",
      "novelContribution": "novel contribution in 1 sentence"
    }
  ],
  "aiRecommendation": "2-3 paragraph AI analysis comparing the papers",
  "bestForBeginners": "title of paper best for beginners",
  "bestForImplementation": "title of paper best for implementation",
  "bestForFutureResearch": "title of paper best for future research",
  "mostCited": "title of most cited paper",
  "newest": "title of newest paper"
}

Be specific and extract real information from the abstracts. Use null for unknown values.`;

    interface CompareResponse {
      rows: Array<{
        paperId: string;
        title: string;
        year: number | null;
        authors: string | null;
        journal: string | null;
        dataset: string | null;
        algorithm: string | null;
        model: string | null;
        accuracy: string | null;
        citationCount: number | null;
        advantages: string | null;
        limitations: string | null;
        novelContribution: string | null;
      }>;
      aiRecommendation: string;
      bestForBeginners: string | null;
      bestForImplementation: string | null;
      bestForFutureResearch: string | null;
      mostCited: string | null;
      newest: string | null;
    }

    const result = await generateJson<CompareResponse>(prompt);

    // Ensure rows have the paper IDs
    if (result.rows && result.rows.length < papers.length) {
      while (result.rows.length < papers.length) {
        const p = papers[result.rows.length];
        result.rows.push({
          paperId: p.id,
          title: p.title,
          year: p.year ?? null,
          authors: (p.authors ?? []).slice(0, 3).join(", "),
          journal: p.journal ?? null,
          dataset: null,
          algorithm: null,
          model: null,
          accuracy: null,
          citationCount: p.citationCount ?? null,
          advantages: null,
          limitations: null,
          novelContribution: null,
        });
      }
    }

    // Assign paper IDs from original papers array
    result.rows = result.rows.map((row, i) => ({
      ...row,
      paperId: papers[i]?.id ?? row.paperId,
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Compare papers failed");
    res.status(500).json({ error: "AI comparison failed" });
  }
});

// POST /papers/gaps
router.post("/papers/gaps", async (req, res): Promise<void> => {
  const parsed = DetectResearchGapsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { papers, topic } = parsed.data;

  const papersContext = papers.map((p, i) =>
    `Paper ${i + 1}: "${p.title}" (${p.year ?? "n/a"}). Abstract: ${p.abstract?.slice(0, 300) ?? "N/A"}`
  ).join("\n\n");

  try {
    const prompt = `Analyze these research papers on the topic "${topic}" and identify research gaps.

${papersContext}

Return JSON with exactly this structure:
{
  "commonTechniques": ["technique1", "technique2", ...],
  "frequentDatasets": ["dataset1", "dataset2", ...],
  "commonLimitations": ["limitation1", "limitation2", ...],
  "researchGaps": ["gap1", "gap2", "gap3", "gap4", "gap5"],
  "futureWork": ["future work idea1", "future work idea2", "future work idea3"],
  "novelIdeas": ["novel research idea1", "novel research idea2", "novel research idea3"]
}

Each array should have 3-6 items. Be specific and actionable.`;

    interface GapResponse {
      commonTechniques: string[];
      frequentDatasets: string[];
      commonLimitations: string[];
      researchGaps: string[];
      futureWork: string[];
      novelIdeas: string[];
    }

    const result = await generateJson<GapResponse>(prompt);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Detect gaps failed");
    res.status(500).json({ error: "AI gap detection failed" });
  }
});

// POST /papers/roadmap
router.post("/papers/roadmap", async (req, res): Promise<void> => {
  const parsed = GenerateRoadmapBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { topic } = parsed.data;

  try {
    const prompt = `Create a comprehensive learning roadmap for someone who wants to research and master the topic: "${topic}".

Return JSON with exactly this structure:
{
  "topic": "${topic}",
  "estimatedTime": "e.g. 6-12 months",
  "steps": [
    {
      "order": 1,
      "level": "foundation",
      "title": "Prerequisites & Foundations",
      "description": "Brief description of this stage",
      "items": ["item1", "item2", "item3", "item4"]
    },
    {
      "order": 2,
      "level": "beginner",
      "title": "Core Concepts",
      "description": "Brief description",
      "items": ["specific paper/concept1", "specific paper/concept2", ...]
    },
    {
      "order": 3,
      "level": "intermediate",
      "title": "Key Papers & Methods",
      "description": "Brief description",
      "items": ["specific paper/method1", ...]
    },
    {
      "order": 4,
      "level": "advanced",
      "title": "Advanced Research",
      "description": "Brief description",
      "items": ["cutting-edge paper1", ...]
    },
    {
      "order": 5,
      "level": "tools",
      "title": "Tools & Datasets",
      "description": "Essential tools and datasets",
      "items": ["tool/dataset1", ...]
    },
    {
      "order": 6,
      "level": "projects",
      "title": "Project Ideas",
      "description": "Hands-on projects to build",
      "items": ["project idea1", ...]
    },
    {
      "order": 7,
      "level": "research",
      "title": "Research Opportunities",
      "description": "Open research questions and future directions",
      "items": ["research direction1", ...]
    }
  ]
}

Be specific. Name real papers, tools, algorithms, and datasets relevant to "${topic}".`;

    interface RoadmapResponse {
      topic: string;
      estimatedTime: string | null;
      steps: Array<{
        order: number;
        level: string;
        title: string;
        description: string;
        items: string[];
      }>;
    }

    const result = await generateJson<RoadmapResponse>(prompt);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Generate roadmap failed");
    res.status(500).json({ error: "AI roadmap generation failed" });
  }
});

// POST /papers/explain
router.post("/papers/explain", async (req, res): Promise<void> => {
  const parsed = ExplainPaperBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { paper } = parsed.data;

  try {
    const prompt = `Explain this research paper in simple language suitable for students:

Title: "${paper.title}"
Authors: ${(paper.authors ?? []).join(", ")}
Year: ${paper.year ?? "Unknown"}
Journal: ${paper.journal ?? "Unknown"}
Abstract: ${paper.abstract ?? "Not available"}

Return JSON with exactly this structure:
{
  "summary": "2-3 sentence simple summary a student can understand",
  "objective": "What was the main goal of this research?",
  "problem": "What problem did this paper try to solve?",
  "methodology": "How did the researchers approach the problem? (explain in simple terms)",
  "algorithms": ["algorithm1", "algorithm2"],
  "dataset": "What dataset was used? (or null if not mentioned)",
  "architecture": "What model/system architecture was used? (or null)",
  "metrics": ["metric1", "metric2"],
  "results": "What were the main results and findings?",
  "advantages": ["advantage1", "advantage2", "advantage3"],
  "limitations": ["limitation1", "limitation2"],
  "futureScope": "What future work is suggested or possible?",
  "realWorldApplications": ["application1", "application2", "application3"]
}

Use simple, clear language. Avoid jargon. Explain technical terms when necessary.`;

    interface ExplainResponse {
      summary: string;
      objective: string;
      problem: string;
      methodology: string;
      algorithms: string[];
      dataset: string | null;
      architecture: string | null;
      metrics: string[];
      results: string;
      advantages: string[];
      limitations: string[];
      futureScope: string;
      realWorldApplications: string[];
    }

    const result = await generateJson<ExplainResponse>(prompt);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Explain paper failed");
    res.status(500).json({ error: "AI explanation failed" });
  }
});

export default router;
