# 🔬 ResearchLens — AI-Powered Research Assistant

> Discover, compare, understand, and explore academic research with the power of AI.

---

## 📖 Overview

**ResearchLens** is a full-stack AI-powered research assistant designed to help students, academics, and researchers navigate the ever-growing world of scientific literature. Instead of manually sifting through thousands of papers, ResearchLens uses Google Gemini AI combined with live paper databases to surface insights, compare studies, detect research gaps, and guide your next research steps.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Smart Paper Search** | Search across Semantic Scholar, OpenAlex, and arXiv simultaneously |
| 🤖 **AI Chat** | Chat with an AI assistant about any paper or research topic |
| ⚖️ **Paper Comparison** | Compare multiple papers side-by-side with AI-generated insights |
| 🗺️ **Research Roadmap** | Generate a step-by-step learning roadmap for any research topic |
| 🕳️ **Research Gap Detection** | Identify open problems and unexplored directions in a field |
| 📊 **Dataset Discovery** | Find relevant datasets for any research domain |
| 💻 **GitHub Code Search** | Locate open-source implementations of research papers |
| 📈 **Trending Topics** | Explore what's hot in AI, ML, and other research fields |
| 🔖 **Bookmarks** | Save and manage your favourite papers |
| 📜 **Search History** | Revisit your past searches instantly |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** — lightning-fast dev server and bundler
- **Wouter** — lightweight client-side routing
- **TanStack Query** — server state management and caching
- **CSS Variables** — deep navy/teal design system

### Backend
- **Node.js 24** + **Express 5**
- **Google Gemini AI** (`gemini-3.5-flash` with model fallback chain)
- **Drizzle ORM** + **PostgreSQL** — search history and bookmarks
- **esbuild** — fast production bundler

### External APIs (no keys required)
- [Semantic Scholar](https://api.semanticscholar.org/) — paper metadata and citations
- [OpenAlex](https://openalex.org/) — open scholarly graph
- [arXiv](https://arxiv.org/) — preprint server
- [GitHub Search API](https://docs.github.com/en/rest/search) — code repository search

### Architecture
- **pnpm monorepo** with workspaces
- **OpenAPI-first** — spec-driven API with codegen'd React hooks and Zod validators
- Retry logic with exponential backoff and model fallback chain for AI reliability

---

## 🚀 Getting Started

### Prerequisites
- Node.js 24+
- pnpm 9+
- PostgreSQL database
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/kadiyalaadilakshmi/AI_research_recommendation.git
cd AI_research_recommendation

# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env
# Add your GEMINI_API_KEY and DATABASE_URL to .env

# Push the database schema
pnpm --filter @workspace/db run push

# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend (in a separate terminal)
pnpm --filter @workspace/research-assistant run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret key for session management |

---

## 📁 Project Structure

```
AI_research_recommendation/
├── artifacts/
│   ├── research-assistant/     # React + Vite frontend
│   │   └── src/
│   │       ├── pages/          # 9 pages (home, results, paper-detail, compare, ...)
│   │       ├── components/     # Reusable UI components
│   │       └── lib/            # Paper store, utilities
│   └── api-server/             # Express 5 backend
│       └── src/
│           ├── routes/         # papers, chat, ai-analysis, datasets, github, trending
│           └── lib/            # Gemini client, search, DB
├── lib/
│   ├── api-spec/               # OpenAPI specification (openapi.yaml)
│   ├── api-client-react/       # Codegen'd React hooks
│   ├── api-zod/                # Codegen'd Zod validators
│   └── db/                     # Drizzle ORM schema
└── package.json
```

---

## 🧠 AI Capabilities

ResearchLens uses **Google Gemini** with a smart reliability layer:

- **Model fallback chain**: `gemini-3.5-flash` → `gemini-3.1-flash-lite` → `gemini-2.0-flash`
- **Retry with exponential backoff** on 429/503 errors
- **Structured JSON responses** with markdown fence stripping for robust parsing

### AI-Powered Endpoints

| Endpoint | Description |
|---|---|
| `POST /api/chat` | Conversational AI with paper context |
| `POST /api/papers/compare` | Side-by-side paper comparison table |
| `POST /api/papers/gaps` | Research gap analysis |
| `POST /api/papers/roadmap` | Step-by-step research roadmap |
| `GET /api/datasets/search` | AI-curated dataset recommendations |

---

## 📸 Screenshots

> Search → Results → Paper Detail → AI Chat → Compare → Roadmap

*(Add screenshots here)*

---

## 🗺️ Roadmap

- [ ] PDF upload and analysis
- [ ] Citation graph visualization
- [ ] Export to BibTeX / Zotero
- [ ] Email digest of weekly trending papers
- [ ] Collaborative paper collections

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, create a branch, make changes, open a PR
git checkout -b feature/your-feature-name
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👩‍💻 Author

**Kadiyala Adilakshmi** — [@kadiyalaadilakshmi](https://github.com/kadiyalaadilakshmi)

---

*Built with ❤️ using React, Express, and Google Gemini AI*
