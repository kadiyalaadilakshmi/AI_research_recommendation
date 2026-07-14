---
name: Paper navigation pattern
description: How the frontend passes the full Paper object when navigating to /paper/:id
---

## Rule
Paper detail navigation uses `PaperStoreContext.currentPaper` (set before navigating), not URL serialization.

**Why:** The `Paper` type has many optional fields including a long abstract. Encoding it in a URL query param is fragile and hits URL length limits. The wouter router is used with a `:id` param only for bookmarkability; the actual Paper data comes from context.

**How to apply:** In any component that links to `/paper/:id`, call `setPaperStore({ currentPaper: paper })` first, then `navigate(\`/paper/\${paper.id}\`)`. In `paper-detail.tsx`, read from `usePaperStore().currentPaper`.
