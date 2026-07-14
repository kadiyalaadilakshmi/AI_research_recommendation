import { Router, type IRouter } from "express";
import { SearchGithubReposQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/github/search", async (req, res): Promise<void> => {
  const parsed = SearchGithubReposQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { query, limit } = parsed.data;

  try {
    const searchQuery = encodeURIComponent(`${query} machine learning deep learning`);
    const url = `https://api.github.com/search/repositories?q=${searchQuery}&sort=stars&order=desc&per_page=${limit ?? 5}`;
    const res2 = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "ResearchLens/1.0",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res2.ok) {
      req.log.warn({ status: res2.status }, "GitHub API returned non-ok status");
      res.json({ repos: [], total: 0 });
      return;
    }

    const data = await res2.json() as { items?: unknown[]; total_count?: number };
    const items = (data.items ?? []) as Array<Record<string, unknown>>;

    const repos = items.map(item => ({
      id: String(item.id),
      name: (item.name as string) ?? "",
      fullName: (item.full_name as string) ?? "",
      description: (item.description as string | null) ?? null,
      stars: typeof item.stargazers_count === "number" ? item.stargazers_count : 0,
      language: (item.language as string | null) ?? null,
      framework: detectFramework(item),
      lastUpdated: (item.updated_at as string) ?? new Date().toISOString(),
      url: (item.html_url as string) ?? "",
      topics: Array.isArray(item.topics) ? (item.topics as string[]) : [],
    }));

    res.json({ repos, total: typeof data.total_count === "number" ? data.total_count : repos.length });
  } catch (err) {
    req.log.error({ err }, "GitHub search failed");
    res.json({ repos: [], total: 0 });
  }
});

function detectFramework(repo: Record<string, unknown>): string | null {
  const topics = Array.isArray(repo.topics) ? (repo.topics as string[]) : [];
  const lang = ((repo.language as string) ?? "").toLowerCase();
  const desc = ((repo.description as string) ?? "").toLowerCase();
  const name = ((repo.name as string) ?? "").toLowerCase();

  const combined = [...topics, lang, desc, name].join(" ");

  if (combined.includes("pytorch")) return "PyTorch";
  if (combined.includes("tensorflow") || combined.includes("keras")) return "TensorFlow/Keras";
  if (combined.includes("jax")) return "JAX";
  if (combined.includes("sklearn") || combined.includes("scikit")) return "Scikit-learn";
  if (combined.includes("huggingface") || combined.includes("transformers")) return "HuggingFace";
  if (lang === "python") return "Python";
  if (lang === "julia") return "Julia";
  if (lang === "r") return "R";
  return null;
}

export default router;
