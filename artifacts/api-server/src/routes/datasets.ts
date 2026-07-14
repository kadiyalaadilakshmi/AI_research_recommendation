import { Router, type IRouter } from "express";
import { SearchDatasetsQueryParams } from "@workspace/api-zod";
import { generateJson } from "../lib/gemini.js";

const router: IRouter = Router();

router.get("/datasets/search", async (req, res): Promise<void> => {
  const parsed = SearchDatasetsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { query, limit } = parsed.data;

  try {
    const prompt = `You are a research dataset expert. For the research topic "${query}", suggest ${limit ?? 10} relevant datasets that researchers commonly use.

Return JSON with this structure:
{
  "datasets": [
    {
      "id": "unique_id_string",
      "name": "Dataset Name",
      "description": "Brief description of the dataset",
      "size": "e.g. 50,000 images or 1M records or null",
      "format": ["CSV", "JSON", "Images"],
      "source": "Kaggle/HuggingFace/UCI/GitHub/Official",
      "downloadUrl": "direct URL if known or null",
      "kaggleUrl": "https://kaggle.com/datasets/... or null",
      "huggingfaceUrl": "https://huggingface.co/datasets/... or null",
      "githubUrl": "https://github.com/... or null",
      "paperCount": number of papers using this dataset or null,
      "tasks": ["classification", "detection", "segmentation"]
    }
  ]
}

Only include real, well-known datasets. Provide accurate URLs where possible.`;

    interface DatasetResponse {
      datasets: Array<{
        id: string;
        name: string;
        description: string;
        size: string | null;
        format: string[];
        source: string;
        downloadUrl: string | null;
        kaggleUrl: string | null;
        huggingfaceUrl: string | null;
        githubUrl: string | null;
        paperCount: number | null;
        tasks: string[];
      }>;
    }

    const result = await generateJson<DatasetResponse>(prompt);
    const datasets = (result.datasets ?? []).slice(0, limit ?? 10);
    res.json({ datasets, total: datasets.length });
  } catch (err) {
    req.log.error({ err }, "Dataset search failed");
    res.status(500).json({ error: "Dataset search failed" });
  }
});

export default router;
