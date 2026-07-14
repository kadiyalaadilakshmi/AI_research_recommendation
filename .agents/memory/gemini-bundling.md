---
name: Gemini SDK bundling
description: @google/genai must be bundled by esbuild, not externalized, or Node crashes at runtime.
---

## Rule
Never add `@google/genai` or `@google/*` to the `external` array in `artifacts/api-server/build.mjs`.

**Why:** The API server uses esbuild to bundle into a single `dist/index.mjs`. If `@google/genai` (or any `@google/*` glob) is in the external list, Node can't resolve the package from the dist directory at runtime, throwing `ERR_MODULE_NOT_FOUND`. The package bundles cleanly with esbuild.

**How to apply:** If the external list ever contains `"@google/*"` or `"@google/genai"`, remove it. The package size increases (~1.5 MB extra) but that's acceptable.
