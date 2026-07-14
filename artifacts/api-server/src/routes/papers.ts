import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, searchHistoryTable, bookmarksTable } from "@workspace/db";
import {
  SearchPapersQueryParams,
  GetRelatedPapersBody,
  GenerateCitationsBody,
  GetSearchHistoryQueryParams,
  AddBookmarkBody,
  RemoveBookmarkParams,
} from "@workspace/api-zod";
import { searchPapers, getRelatedPapers } from "../lib/search.js";

const router: IRouter = Router();

// GET /papers/search
router.get("/papers/search", async (req, res): Promise<void> => {
  const parsed = SearchPapersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { query, limit } = parsed.data;
  try {
    const papers = await searchPapers(query, limit ?? 10);

    // Save search history
    try {
      await db.insert(searchHistoryTable).values({ query, resultCount: papers.length });
    } catch { /* non-critical */ }

    res.json({ papers, total: papers.length, query });
  } catch (err) {
    req.log.error({ err }, "Search papers failed");
    res.status(500).json({ error: "Search failed" });
  }
});

// POST /papers/related
router.post("/papers/related", async (req, res): Promise<void> => {
  const parsed = GetRelatedPapersBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { paper, limit } = parsed.data;
  try {
    const papers = await getRelatedPapers(paper.id, paper.title, limit ?? 5);
    res.json({ papers, total: papers.length, query: paper.title });
  } catch (err) {
    req.log.error({ err }, "Get related papers failed");
    res.status(500).json({ error: "Failed to get related papers" });
  }
});

// POST /papers/citations
router.post("/papers/citations", async (req, res): Promise<void> => {
  const parsed = GenerateCitationsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { paper } = parsed.data;
  const authors = paper.authors ?? [];
  const year = paper.year ?? "n.d.";
  const title = paper.title;
  const journal = paper.journal ?? "";
  const doi = paper.doi ?? "";
  const url = paper.url ?? "";

  const authorApa = authors.length === 0
    ? "Unknown Author"
    : authors.length === 1
      ? formatAuthorApa(authors[0])
      : authors.slice(0, 6).map(formatAuthorApa).join(", ") + (authors.length > 6 ? ", ... " + formatAuthorApa(authors[authors.length - 1]) : "");

  const authorIeee = authors.length === 0
    ? "Unknown Author"
    : authors.slice(0, 6).map(formatAuthorIeee).join(", ");

  const authorMla = authors.length === 0
    ? "Unknown Author"
    : authors.length === 1
      ? formatAuthorMla(authors[0])
      : `${formatAuthorMla(authors[0])}, et al`;

  const doiStr = doi ? `https://doi.org/${doi}` : url;

  const apa = `${authorApa} (${year}). ${title}. *${journal}*${doiStr ? `. ${doiStr}` : "."}`;
  const ieee = `${authorIeee}, "${title}," *${journal}*, ${year}${doiStr ? `, doi: ${doi || url}` : ""}.`;
  const mla = `${authorMla}. "${title}." *${journal}*, ${year}${doiStr ? `, ${doiStr}` : ""}.`;
  const chicago = `${authorMla}. "${title}." *${journal}* (${year})${doiStr ? `. ${doiStr}` : ""}.`;

  const bibtexKey = `${(authors[0] ?? "unknown").split(" ").pop()?.toLowerCase() ?? "unknown"}${year}`;
  const bibtex = `@article{${bibtexKey},\n  author = {${authors.join(" and ")}},\n  title = {${title}},\n  journal = {${journal}},\n  year = {${year}}${doi ? `,\n  doi = {${doi}}` : ""}${url ? `,\n  url = {${url}}` : ""}\n}`;

  res.json({ apa, ieee, mla, chicago, bibtex });
});

function formatAuthorApa(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length < 2) return name;
  const last = parts[parts.length - 1];
  const initials = parts.slice(0, -1).map(p => p[0] + ".").join(" ");
  return `${last}, ${initials}`;
}

function formatAuthorIeee(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length < 2) return name;
  const last = parts[parts.length - 1];
  const initials = parts.slice(0, -1).map(p => p[0] + ".").join(" ");
  return `${initials} ${last}`;
}

function formatAuthorMla(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length < 2) return name;
  const last = parts[parts.length - 1];
  const rest = parts.slice(0, -1).join(" ");
  return `${last}, ${rest}`;
}

// GET /searches/history
router.get("/searches/history", async (req, res): Promise<void> => {
  const parsed = GetSearchHistoryQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;
  try {
    const history = await db
      .select()
      .from(searchHistoryTable)
      .orderBy(desc(searchHistoryTable.searchedAt))
      .limit(limit);
    res.json({ history: history.map(h => ({ ...h, searchedAt: h.searchedAt.toISOString() })) });
  } catch (err) {
    req.log.error({ err }, "Get search history failed");
    res.json({ history: [] });
  }
});

// GET /bookmarks
router.get("/bookmarks", async (_req, res): Promise<void> => {
  try {
    const bookmarks = await db.select().from(bookmarksTable).orderBy(desc(bookmarksTable.savedAt));
    res.json({ bookmarks: bookmarks.map(b => ({ ...b, savedAt: b.savedAt.toISOString() })) });
  } catch (err) {
    _req.log.error({ err }, "Get bookmarks failed");
    res.json({ bookmarks: [] });
  }
});

// POST /bookmarks
router.post("/bookmarks", async (req, res): Promise<void> => {
  const parsed = AddBookmarkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [bookmark] = await db
      .insert(bookmarksTable)
      .values(parsed.data)
      .onConflictDoNothing()
      .returning();
    if (!bookmark) {
      const existing = await db.select().from(bookmarksTable).where(eq(bookmarksTable.paperId, parsed.data.paperId));
      res.status(201).json({ ...existing[0], savedAt: existing[0].savedAt.toISOString() });
      return;
    }
    res.status(201).json({ ...bookmark, savedAt: bookmark.savedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Add bookmark failed");
    res.status(500).json({ error: "Failed to save bookmark" });
  }
});

// DELETE /bookmarks/:paperId
router.delete("/bookmarks/:paperId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.paperId) ? req.params.paperId[0] : req.params.paperId;
  const parsed = RemoveBookmarkParams.safeParse({ paperId: raw });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    await db.delete(bookmarksTable).where(eq(bookmarksTable.paperId, parsed.data.paperId));
    res.json({ status: "ok" });
  } catch (err) {
    req.log.error({ err }, "Remove bookmark failed");
    res.status(500).json({ error: "Failed to remove bookmark" });
  }
});

export default router;
