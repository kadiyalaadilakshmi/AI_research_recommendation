# ResearchLens — AI-Powered Research Assistant

An intelligent research assistant that helps students and researchers discover, understand, compare, and download academic papers, find datasets, find GitHub implementation code, generate learning roadmaps, identify research gaps, and chat with AI about papers.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/research-assistant run dev` — run the frontend (Vite)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `GEMINI_API_KEY` — Google Gemini API key

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, wouter (routing), TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (tables: `search_history`, `bookmarks`)
- AI: Google Gemini 2.5 Flash via `@google/genai` SDK (key: `GEMINI_API_KEY`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Build: esbuild (bundles @google/genai into the output — NOT in external list)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/api-client-react/src/generated/` — generated React Query hooks and Zod schemas (do not edit manually)
- `lib/db/src/schema/` — Drizzle ORM table definitions
- `artifacts/api-server/src/routes/` — all Express route handlers
- `artifacts/api-server/src/lib/gemini.ts` — Gemini client wrapper
- `artifacts/api-server/src/lib/search.ts` — multi-source paper search (Semantic Scholar, OpenAlex, arXiv)
- `artifacts/research-assistant/src/` — React frontend
- `artifacts/research-assistant/src/pages/` — all page components (home, results, compare, roadmap, trending, datasets, saved, chat, paper-detail)
- `artifacts/research-assistant/src/lib/paper-store.tsx` — global state for selected papers and current paper

## Architecture decisions

- **OpenAPI-first**: All backend routes and frontend hooks are generated from `lib/api-spec/openapi.yaml`. Always edit the spec first, then run codegen before changing routes or hooks.
- **@google/genai bundled by esbuild**: The `@google/*` glob was removed from `artifacts/api-server/build.mjs` external list — Gemini SDK must be bundled, not externalized, or Node can't find it at runtime.
- **Multi-source search**: Papers are fetched from Semantic Scholar, OpenAlex, and arXiv in parallel, deduplicated by title similarity, and merged. No API keys required for basic usage.
- **Paper navigation via context**: Since full Paper objects can't be serialized in URLs, `PaperStoreContext` holds `currentPaper`. Set it before navigating to `/paper/:id`.
- **Session-based bookmarks**: Bookmarks and search history are stored in PostgreSQL via Drizzle ORM, not localStorage.

## Product

- **Intelligent Search**: Multi-source search across Semantic Scholar, OpenAlex, and arXiv with AI-powered quality scoring and difficulty estimation
- **Paper Detail + AI Explanation**: Every paper gets a full AI breakdown — objective, methodology, results, advantages, limitations, real-world applications
- **Paper Comparison**: Select up to 5 papers; AI generates a structured comparison table plus research gap analysis
- **Research Roadmap**: Enter any topic; AI generates a step-by-step learning roadmap from foundations to cutting-edge research
- **Trending Topics**: Live trending research topics with clickable search links
- **Dataset Discovery**: AI-suggested datasets with links to Kaggle, HuggingFace, GitHub, and direct downloads
- **GitHub Code Search**: Find implementation repos for any research topic
- **AI Chat**: Full conversational AI with paper context, markdown rendering, and suggested follow-up questions
- **Bookmarks & History**: Save papers, track search history, all persisted in PostgreSQL

## User preferences

_Populate as you build._

## Gotchas

- `@google/genai` must NOT be in the `external` array in `artifacts/api-server/build.mjs` — remove the `@google/*` glob if it reappears, or the server will crash at startup with ERR_MODULE_NOT_FOUND.
- After any change to `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks and Zod schemas.
- The Vite dev server has no API proxy — the frontend calls `/api/...` and relies on the monorepo routing layer to forward to the API server at port 8080.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
