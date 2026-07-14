/**
 * Multi-source academic paper search
 * Sources: Semantic Scholar, OpenAlex, arXiv
 */

export interface RawPaper {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  journal: string | null;
  abstract: string | null;
  doi: string | null;
  citationCount: number | null;
  pdfUrl: string | null;
  url: string | null;
  source: string;
  hasDataset: boolean;
  githubUrl: string | null;
  difficultyLevel: string | null;
  qualityScore: number | null;
  isOpenAccess: boolean;
  fields: string[];
}

async function searchSemanticScholar(query: string, limit: number): Promise<RawPaper[]> {
  try {
    const fields = "paperId,title,authors,year,venue,abstract,externalIds,citationCount,openAccessPdf,fieldsOfStudy,isOpenAccess";
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=${fields}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "ResearchLens/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { data?: unknown[] };
    const papers = data.data ?? [];
    return (papers as Array<Record<string, unknown>>).map((p) => ({
      id: `ss_${p.paperId ?? Math.random()}`,
      title: (p.title as string) ?? "Unknown Title",
      authors: Array.isArray(p.authors)
        ? (p.authors as Array<Record<string, string>>).map((a) => a.name ?? "").filter(Boolean)
        : [],
      year: typeof p.year === "number" ? p.year : null,
      journal: (p.venue as string | null) ?? null,
      abstract: (p.abstract as string | null) ?? null,
      doi: (p.externalIds as Record<string, string> | null)?.DOI ?? null,
      citationCount: typeof p.citationCount === "number" ? p.citationCount : null,
      pdfUrl: (p.openAccessPdf as Record<string, string> | null)?.url ?? null,
      url: `https://www.semanticscholar.org/paper/${p.paperId}`,
      source: "Semantic Scholar",
      hasDataset: false,
      githubUrl: null,
      difficultyLevel: null,
      qualityScore: null,
      isOpenAccess: Boolean(p.isOpenAccess),
      fields: Array.isArray(p.fieldsOfStudy) ? (p.fieldsOfStudy as string[]) : [],
    }));
  } catch {
    return [];
  }
}

async function searchOpenAlex(query: string, limit: number): Promise<RawPaper[]> {
  try {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=${limit}&select=id,title,authorships,publication_year,primary_location,abstract_inverted_index,doi,cited_by_count,open_access,best_oa_location,topics&mailto=research@lens.app`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json() as { results?: unknown[] };
    const works = data.results ?? [];

    return (works as Array<Record<string, unknown>>).map((w) => {
      // Reconstruct abstract from inverted index
      let abstract: string | null = null;
      const inv = w.abstract_inverted_index as Record<string, number[]> | null;
      if (inv) {
        const words: { word: string; pos: number }[] = [];
        for (const [word, positions] of Object.entries(inv)) {
          for (const pos of positions) words.push({ word, pos });
        }
        words.sort((a, b) => a.pos - b.pos);
        abstract = words.map((x) => x.word).join(" ");
      }

      const primaryLocation = w.primary_location as Record<string, unknown> | null;
      const source = primaryLocation?.source as Record<string, string> | null;
      const openAccess = w.open_access as Record<string, unknown> | null;
      const bestOa = w.best_oa_location as Record<string, string> | null;
      const authorships = Array.isArray(w.authorships) ? (w.authorships as Array<Record<string, unknown>>) : [];
      const topics = Array.isArray(w.topics) ? (w.topics as Array<Record<string, string>>) : [];

      return {
        id: `oa_${(w.id as string)?.replace("https://openalex.org/", "") ?? Math.random()}`,
        title: (w.title as string) ?? "Unknown Title",
        authors: authorships.map((a) => (a.author as Record<string, string>)?.display_name ?? "").filter(Boolean),
        year: typeof w.publication_year === "number" ? w.publication_year : null,
        journal: source?.display_name ?? null,
        abstract,
        doi: (w.doi as string | null)?.replace("https://doi.org/", "") ?? null,
        citationCount: typeof w.cited_by_count === "number" ? w.cited_by_count : null,
        pdfUrl: bestOa?.pdf_url ?? null,
        url: bestOa?.landing_page_url ?? (w.id as string) ?? null,
        source: "OpenAlex",
        hasDataset: false,
        githubUrl: null,
        difficultyLevel: null,
        qualityScore: null,
        isOpenAccess: Boolean(openAccess?.is_oa),
        fields: topics.slice(0, 3).map((t) => t.display_name ?? ""),
      };
    });
  } catch {
    return [];
  }
}

async function searchArxiv(query: string, limit: number): Promise<RawPaper[]> {
  try {
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${limit}&sortBy=relevance`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const xml = await res.text();

    // Simple XML parsing for arXiv Atom feed
    const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];
    return entries.map((entry, i) => {
      const getId = (tag: string) => entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`))?.[1]?.trim() ?? null;
      const getAll = (tag: string) => [...entry.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "g"))].map(m => m[1].trim());

      const id = entry.match(/arxiv\.org\/abs\/([\w.]+)/)?.[1] ?? `arxiv_${i}`;
      const pdfUrl = entry.match(/href="(https?:\/\/arxiv\.org\/pdf\/[^"]+)"/)?.[1] ?? null;
      const authorNames = getAll("name").filter(Boolean);
      const categories = getAll("category").filter(Boolean).map(c => {
        const m = c.match(/term="([^"]+)"/);
        return m ? m[1] : c;
      });

      const yearStr = getId("published")?.slice(0, 4);
      const year = yearStr ? parseInt(yearStr) : null;

      return {
        id: `arxiv_${id}`,
        title: (getId("title") ?? "Unknown Title").replace(/\n\s+/g, " "),
        authors: authorNames,
        year,
        journal: "arXiv",
        abstract: (getId("summary") ?? null)?.replace(/\n\s+/g, " ") ?? null,
        doi: null,
        citationCount: null,
        pdfUrl,
        url: `https://arxiv.org/abs/${id}`,
        source: "arXiv",
        hasDataset: false,
        githubUrl: null,
        difficultyLevel: null,
        qualityScore: null,
        isOpenAccess: true,
        fields: categories.slice(0, 3),
      };
    });
  } catch {
    return [];
  }
}

function estimateDifficulty(paper: RawPaper): string {
  const text = `${paper.title} ${paper.abstract ?? ""}`.toLowerCase();
  const advancedTerms = ["transformer", "neural", "deep learning", "reinforcement", "generative", "diffusion", "attention mechanism", "bert", "gpt", "llm", "topology", "differential", "variational"];
  const beginnerTerms = ["survey", "review", "introduction", "overview", "tutorial", "beginner", "fundamentals", "basics"];
  const advancedCount = advancedTerms.filter(t => text.includes(t)).length;
  const beginnerCount = beginnerTerms.filter(t => text.includes(t)).length;
  if (beginnerCount >= 2) return "beginner";
  if (advancedCount >= 3) return "advanced";
  if (advancedCount >= 1) return "intermediate";
  return "intermediate";
}

function computeQualityScore(paper: RawPaper): number {
  let score = 50;
  if (paper.citationCount !== null) {
    if (paper.citationCount > 1000) score += 25;
    else if (paper.citationCount > 100) score += 15;
    else if (paper.citationCount > 10) score += 5;
  }
  const currentYear = new Date().getFullYear();
  if (paper.year !== null) {
    const age = currentYear - paper.year;
    if (age <= 2) score += 15;
    else if (age <= 5) score += 10;
    else if (age > 10) score -= 5;
  }
  if (paper.abstract && paper.abstract.length > 200) score += 5;
  if (paper.isOpenAccess) score += 5;
  return Math.min(100, Math.max(0, score));
}

export async function searchPapers(query: string, limit: number = 10): Promise<RawPaper[]> {
  const perSource = Math.ceil(limit / 2);

  const [ssResults, oaResults, arxivResults] = await Promise.allSettled([
    searchSemanticScholar(query, perSource),
    searchOpenAlex(query, perSource),
    searchArxiv(query, Math.min(perSource, 5)),
  ]);

  const all: RawPaper[] = [
    ...(ssResults.status === "fulfilled" ? ssResults.value : []),
    ...(oaResults.status === "fulfilled" ? oaResults.value : []),
    ...(arxivResults.status === "fulfilled" ? arxivResults.value : []),
  ];

  // Deduplicate by title similarity
  const seen = new Set<string>();
  const deduped = all.filter(p => {
    const key = p.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Enrich with computed fields
  return deduped.slice(0, limit).map(p => ({
    ...p,
    difficultyLevel: estimateDifficulty(p),
    qualityScore: computeQualityScore(p),
  }));
}

export async function getRelatedPapers(paperId: string, title: string, limit: number = 5): Promise<RawPaper[]> {
  // Use Semantic Scholar recommendations
  const ssId = paperId.startsWith("ss_") ? paperId.replace("ss_", "") : null;

  if (ssId) {
    try {
      const fields = "paperId,title,authors,year,venue,abstract,citationCount,openAccessPdf,isOpenAccess,fieldsOfStudy";
      const url = `https://api.semanticscholar.org/recommendations/v1/papers/forpaper/${ssId}?limit=${limit}&fields=${fields}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const data = await res.json() as { recommendedPapers?: unknown[] };
        const papers = (data.recommendedPapers ?? []) as Array<Record<string, unknown>>;
        return papers.map(p => ({
          id: `ss_${p.paperId}`,
          title: (p.title as string) ?? "Unknown Title",
          authors: Array.isArray(p.authors) ? (p.authors as Array<Record<string, string>>).map(a => a.name ?? "") : [],
          year: typeof p.year === "number" ? p.year : null,
          journal: (p.venue as string | null) ?? null,
          abstract: (p.abstract as string | null) ?? null,
          doi: null,
          citationCount: typeof p.citationCount === "number" ? p.citationCount : null,
          pdfUrl: (p.openAccessPdf as Record<string, string> | null)?.url ?? null,
          url: `https://www.semanticscholar.org/paper/${p.paperId}`,
          source: "Semantic Scholar",
          hasDataset: false,
          githubUrl: null,
          difficultyLevel: null,
          qualityScore: null,
          isOpenAccess: Boolean(p.isOpenAccess),
          fields: Array.isArray(p.fieldsOfStudy) ? (p.fieldsOfStudy as string[]) : [],
        })).map(p => ({ ...p, difficultyLevel: estimateDifficulty(p), qualityScore: computeQualityScore(p) }));
      }
    } catch { /* fall through */ }
  }

  // Fallback: search by title
  return searchPapers(title, limit);
}

export async function getTrendingPapers(field?: string): Promise<RawPaper[]> {
  const query = field ? `${field} machine learning` : "artificial intelligence deep learning 2024";
  try {
    const fields = "paperId,title,authors,year,venue,abstract,citationCount,openAccessPdf,fieldsOfStudy,isOpenAccess";
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=10&fields=${fields}&sort=citationCount`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const data = await res.json() as { data?: unknown[] };
      const papers = (data.data ?? []) as Array<Record<string, unknown>>;
      return papers.map(p => ({
        id: `ss_${p.paperId}`,
        title: (p.title as string) ?? "Unknown Title",
        authors: Array.isArray(p.authors) ? (p.authors as Array<Record<string, string>>).map(a => a.name ?? "") : [],
        year: typeof p.year === "number" ? p.year : null,
        journal: (p.venue as string | null) ?? null,
        abstract: (p.abstract as string | null) ?? null,
        doi: null,
        citationCount: typeof p.citationCount === "number" ? p.citationCount : null,
        pdfUrl: (p.openAccessPdf as Record<string, string> | null)?.url ?? null,
        url: `https://www.semanticscholar.org/paper/${p.paperId}`,
        source: "Semantic Scholar",
        hasDataset: false,
        githubUrl: null,
        difficultyLevel: null,
        qualityScore: null,
        isOpenAccess: Boolean(p.isOpenAccess),
        fields: Array.isArray(p.fieldsOfStudy) ? (p.fieldsOfStudy as string[]) : [],
      })).map(p => ({ ...p, difficultyLevel: estimateDifficulty(p), qualityScore: computeQualityScore(p) }));
    }
  } catch { /* fall through */ }
  return [];
}
