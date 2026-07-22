import type { Concept } from '../types'
import { gh } from '../types'

export const contextMemoryWorkspace: Concept = {
  id: 'context-memory-workspace',
  slug: 'context-memory-workspace',
  order: 4,
  title: 'Context, memory, and workspace',
  summary:
    'Context assembly is what the harness puts in the finite context window each turn: system prompt, project rules, retrieved memory, and workspace facts. When history outgrows the window, the harness compacts it.',
  prose: [],
  sections: [
    {
      heading: 'Context is constructed each turn',
      teach: [
        'The model only knows what is in its context window for this call; it has no memory between API requests except what the harness re-sends. So "context" is an active construction, not just the chat log. Each turn the harness assembles a system prompt (identity, capabilities, tool-use rules), project rules (repo-specific instructions), relevant workspace facts (files, diffs, VCS state), retrieved memory (longer-lived notes), and the running conversation. Getting this mix right is the difference between an agent that understands your repo and one that hallucinates it, or drowns in irrelevant tokens.',
      ],
      grokBuild: {
        text: 'The shell builds and persists a conversation prefix during session setup (with explicit rebuild paths for cases such as a zero-turn model switch or compaction) rather than reconstructing every source on every model call. `prompt_build.rs` installs the resolved system prompt and builds the first user-message prefix from the working directory, OS and shell, VCS root/status, discovered AGENTS-style user and workspace rules, skills, and MCP servers. Subsequent sampling requests carry that prefix with the conversation items; workspace tools provide live filesystem and VCS operations when the model needs fresher facts.',
        links: [
          { label: 'System prompt and context-prefix construction', url: gh('crates/codegen/xai-grok-shell/src/session/acp_session_impl/prompt_build.rs') },
          { label: 'AGENTS-style rule discovery', url: gh('crates/codegen/xai-grok-agent/src/prompt/agents_md.rs') },
          { label: 'xai-grok-workspace', url: gh('crates/codegen/xai-grok-workspace/src/lib.rs') },
        ],
        code: {
          label: 'The session prefix gathers project context',
          code: `            vcs_status,
            today_local: Some(today_local),
            terminals_folder,
            workspace_rules,
            user_rules,
            skills,
            skill_listing_budget_chars,
            mcp_servers,`,
          source: {
            label: 'prompt_build.rs, lines 568–575',
            url: gh(
              'crates/codegen/xai-grok-shell/src/session/acp_session_impl/prompt_build.rs#L568-L575',
            ),
          },
        },
      },
    },
    {
      heading: 'Compaction fights context rot',
      teach: [
        'The context window is finite, but sessions are not. As the loop appends tool results and messages, history eventually exceeds the budget. The harness handles this with compaction: summarizing or dropping older, lower-value items while preserving the thread of the task. Naive appending has a second cost beyond hitting the limit. As histories grow long and cluttered with interleaved tool output, each model call drifts further from the clean, focused prompts the model was trained on, a kind of context rot. Compaction and selective retrieval are the practical countermeasures.',
      ],
      grokBuild: {
        text: 'The session checks estimated token use against a configurable percentage of the active model\'s context window before sampling; context-length errors can also enter the compaction path. Grok Build uses the shared compaction crate\'s whole-session full-replace flow to sample a summary, assemble replacement history, and commit it before the loop continues. Compaction can be suppressed in specific failure states, so it is not simply “history exceeded the hard limit.”',
        links: [
          { label: 'Full-replace compaction core', url: gh('crates/common/xai-grok-compaction/src/code_compaction/mod.rs') },
          { label: 'session/compaction.rs', url: gh('crates/codegen/xai-grok-shell/src/session/compaction.rs') },
        ],
      },
    },
    {
      heading: 'Retrieval memory and structural navigation',
      teach: [
        'Retrieval memory is distinct from the model\u2019s weights and from the raw history. It is a harness-owned store, typically text chunked into passages, embedded into vectors, and indexed so the harness can pull back the few passages relevant to the current step instead of re-sending everything. This is how an agent "remembers" project conventions or prior decisions across sessions without bloating every prompt. The workspace also supplies a structural view of the codebase (a symbol/dependency graph) so the agent can navigate a large repo by structure rather than by dumping files into the prompt. Keep three ideas separate: model weights (fixed), context window (per-call, finite), and harness memory (persistent, retrieved on demand).',
      ],
      grokBuild: {
        text: 'The memory crate semantically chunks Markdown and stores chunk metadata plus an FTS5 index in SQLite. Embeddings and sqlite-vec KNN are optional: hybrid search falls back to FTS-only, then applies source weighting, temporal/access adjustments, and optional MMR re-ranking before truncation. Selected results can be formatted as a bounded memory reminder at session start or after compaction. Separately, `xai-codebase-graph` backs code-navigation and incremental index refreshes; it is a navigation service, not an automatic dump into every prompt.',
        links: [
          { label: 'Memory chunking and SQLite index', url: gh('crates/codegen/xai-grok-memory/src/index.rs') },
          { label: 'Hybrid search and optional MMR', url: gh('crates/codegen/xai-grok-memory/src/search.rs') },
          { label: 'Memory reminder injection', url: gh('crates/codegen/xai-grok-shell/src/session/helpers/memory_context.rs') },
          { label: 'Code-navigation integration', url: gh('crates/codegen/xai-grok-shell/src/agent/mvp_agent/code_nav.rs') },
        ],
        code: {
          label: 'Hybrid search degrades to FTS-only',
          code: `/// Run a hybrid search across the memory index.
///
/// Combines FTS5 keyword search with optional vector KNN similarity.
/// Falls back to FTS-only when vector search is unavailable.
///
/// Structured so that \`&MemoryIndex\` is never held across \`.await\` points,
/// allowing the caller's future to be \`Send\` even though \`MemoryIndex\` is \`!Sync\`.
#[tracing::instrument(name = "memory.hybrid_search", skip_all, fields(`,
          source: {
            label: 'search.rs, lines 136–143',
            url: gh('crates/codegen/xai-grok-memory/src/search.rs#L136-L143'),
          },
        },
      },
    },
  ],
  mermaid: `flowchart TB
  Sys[System prompt + project rules] --> Req[Next model request]
  Hist[Session history] --> Compact[Compaction at configured threshold]
  Compact --> Req
  Mem[Memory: chunk -> FTS + optional vectors] -->|retrieve top-k| Req
  WS[Workspace: FS + VCS] --> Req
  Graph[Codebase graph] --> Req`,
  evidence: [
    {
      label: 'Full-replace compaction core',
      url: gh('crates/common/xai-grok-compaction/src/code_compaction/mod.rs'),
    },
    {
      label: 'Session compaction hook',
      url: gh('crates/codegen/xai-grok-shell/src/session/compaction.rs'),
    },
    {
      label: 'Memory — chunk and SQLite index',
      url: gh('crates/codegen/xai-grok-memory/src/index.rs'),
    },
    {
      label: 'Memory — retrieval (search + MMR)',
      url: gh('crates/codegen/xai-grok-memory/src/search.rs'),
    },
    {
      label: 'Memory reminder injection',
      url: gh('crates/codegen/xai-grok-shell/src/session/helpers/memory_context.rs'),
    },
    {
      label: 'Codebase graph crate',
      url: gh('crates/codegen/xai-codebase-graph/src/lib.rs'),
    },
    {
      label: 'Workspace crate',
      url: gh('crates/codegen/xai-grok-workspace/src/lib.rs'),
    },
    {
      label: 'System prompt and context-prefix construction',
      url: gh('crates/codegen/xai-grok-shell/src/session/acp_session_impl/prompt_build.rs'),
    },
    {
      label: 'AGENTS-style rule discovery',
      url: gh('crates/codegen/xai-grok-agent/src/prompt/agents_md.rs'),
    },
    {
      label: 'User guide — memory',
      url: gh('crates/codegen/xai-grok-pager/docs/user-guide/13-memory.md'),
    },
    {
      label: 'User guide — project rules',
      url: gh('crates/codegen/xai-grok-pager/docs/user-guide/12-project-rules.md'),
    },
  ],
  furtherReading: [
    {
      label: 'Zhang & Khattab — on context rot and context offloading',
      url: 'https://alexzhang13.github.io/blog/2026/harness/',
      note: 'Why appended histories drift out of distribution, and how offloading context helps',
    },
  ],
}
