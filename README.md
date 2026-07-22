# Harness Engineering

A conceptual guide to the software around a coding model, grounded in
[Grok Build](https://github.com/xai-org/grok-build).

The nine parts cover the agent loop, tools, sandboxing, context, sampling,
extension protocols, terminal rendering, and run modes. Deep source links are
pinned to Grok Build commit
[`a5727c5`](https://github.com/xai-org/grok-build/tree/a5727c5960452e7527a154b25cb5bf00cda0545e).

- Guide: https://artvandelay.github.io/grok-harness-explained/
- Interactive source graph: https://artvandelay.github.io/grok-harness-graph/

## Local development

```sh
npm ci
npm run dev
```

Open the URL Vite prints (hash routes, e.g. `/#/learn/what-is-a-harness`).

Production build:

```sh
npm run build
npm run preview
```

The Vite base path is `/grok-harness-explained/`.

## Publishing

`.github/workflows/deploy-pages.yml` builds and deploys `dist/` on pushes to
`main`. After creating the repository:

1. Push this directory to `artvandelay/grok-harness-explained`.
2. In **Settings → Pages**, select **GitHub Actions** as the source.
3. Push to `main` or run the workflow manually.

## Source integrity

The guide's code links and excerpts were checked against the pinned Grok Build
revision above. [Understand Anything](https://github.com/Egonex-AI/Understand-Anything)
was used to explore the repository; claims in the guide were then verified
against the source.

## Repository metadata

Suggested GitHub description:

> A conceptual guide to coding-agent harness architecture, grounded in the Grok Build source.

Suggested topics:

`ai-agents` · `coding-agents` · `agent-harness` · `harness-engineering` ·
`llm-tools` · `mcp` · `acp` · `sandboxing` · `grok-build` · `github-pages`

## Editing content

Curated copy lives in typed modules under `src/content/` (one file per concept). Edit those modules to iterate on narrative without fighting layout first.

## Stack

Vite + React + TypeScript + Tailwind CSS v4 · `react-router-dom` HashRouter · Mermaid for architecture sketches.
