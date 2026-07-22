import type { Concept } from '../types'
import { gh } from '../types'

export const extensibility: Concept = {
  id: 'extensibility',
  slug: 'extensibility',
  order: 6,
  title: 'Extensibility: MCP, ACP, subagents, and hooks',
  summary:
    'Four distinct extension mechanisms, often confused: MCP adds tools from external servers, ACP lets protocol clients drive the agent, subagents delegate work to child sessions with explicit context choices, and hooks run user code on lifecycle events.',
  prose: [],
  sections: [
    {
      heading: 'Four mechanisms, four different problems',
      teach: [
        'A harness that only ships built-in tools ages badly, so mature harnesses expose stable extension points. Keep them conceptually separate: they solve different problems and sit on different sides of the agent. MCP faces outward to capabilities; ACP faces toward protocol clients such as editors and the pager; subagents delegate work to child sessions; hooks run user code on lifecycle events. One adds callable tools, while the other carries requests and notifications between an agent and a client.',
      ],
      grokBuild: {
        text: 'Grok Build keeps these mechanisms in distinct code: `xai-grok-mcp` manages MCP clients, `xai-acp-lib` provides typed ACP channels and gateways, the shell owns subagent coordination while `xai-grok-subagent-resolution` owns context/config resolution, and `xai-grok-hooks` owns matching and dispatch.',
        links: [
          { label: 'xai-grok-mcp', url: gh('crates/codegen/xai-grok-mcp/src/lib.rs') },
          { label: 'xai-acp-lib', url: gh('crates/codegen/xai-acp-lib/src/lib.rs') },
          { label: 'Subagent coordinator', url: gh('crates/codegen/xai-grok-shell/src/agent/subagent/mod.rs') },
          { label: 'xai-grok-hooks', url: gh('crates/codegen/xai-grok-hooks/src/dispatcher.rs') },
        ],
      },
    },
    {
      heading: 'MCP: tools and resources from outside',
      teach: [
        'MCP (Model Context Protocol) faces outward to capabilities. An MCP server is a separate process or remote service that can advertise protocol capabilities. Grok Build acts as an MCP client, discovers tools, and registers them in the session action surface so the model can call them. Its current model-facing integration does not expose MCP resources. Supported server transports include stdio, HTTP, and SSE; remote HTTP/SSE setup can perform OAuth discovery when no Authorization header is configured.',
      ],
      grokBuild: {
        text: 'Session MCP initialization starts configured servers in the background, pages through `tools/list`, converts valid tools into registrations, and installs them in the session registry. Resource-change notifications are observed, but resources are intentionally not materialized for the model. For HTTP/SSE servers without an Authorization header, startup performs bounded OAuth discovery; interactive sessions can complete browser OAuth, while non-interactive sessions require usable stored credentials or explicit authorization.',
        links: [
          { label: 'MCP — servers.rs', url: gh('crates/codegen/xai-grok-mcp/src/servers.rs') },
          {
            label: 'Session MCP registration',
            url: gh('crates/codegen/xai-grok-shell/src/session/acp_session_impl/mcp.rs'),
          },
        ],
        code: {
          label: 'Paginated MCP tool discovery',
          code: `        loop {
            let list_tools_result = mcp_service
                .list_tools(Some(
                    PaginatedRequestParams::default().with_cursor(cursor.clone()),
                ))
                .await?;

            all_tools.extend(list_tools_result.tools);`,
          source: {
            label: 'servers.rs, lines 3800–3807',
            url: gh('crates/codegen/xai-grok-mcp/src/servers.rs#L3800-L3807'),
          },
        },
      },
    },
    {
      heading: 'ACP: editors drive the same runtime',
      teach: [
        'ACP (Agent Client Protocol) faces the other way, toward editors. Here the harness is the server and an IDE is the client: the editor sends prompts and receives streamed events over a JSON-RPC-style channel, so the same agent runtime can live inside a code editor instead of a terminal. ACP answers "how does an editor drive this agent?"',
      ],
      grokBuild: {
        text: '`run_stdio_agent` exposes Grok Build as the ACP agent over stdin/stdout: the client sends initialize/auth/session/prompt requests, and the agent sends session notifications plus reverse requests such as permissions, file access, and terminal operations. `xai-acp-lib::gateway` is not the wire protocol itself; it is a bidirectional in-process queue that forwards typed agent-side or client-side messages to an underlying ACP connection.',
        links: [
          { label: 'ACP gateway', url: gh('crates/codegen/xai-acp-lib/src/gateway.rs') },
          {
            label: 'Stdio ACP entry point',
            url: gh('crates/codegen/xai-grok-shell/src/agent/app.rs#L300-L417'),
          },
        ],
        code: {
          label: 'Client requests forwarded to the agent',
          code: `impl<C: acp::Agent + 'static> AcpGatewayReceiver<acp::ClientSide, C> {
    pub async fn run(mut self) {
        let conn = Rc::new(self.conn);
        let spawn = self.spawn_fn.clone();
        let on_meta = self.on_meta.clone();
        while let Some(msg) = self.rx.recv().await {
            let conn = conn.clone();
            match msg {`,
          source: {
            label: 'gateway.rs, lines 171–178',
            url: gh('crates/codegen/xai-acp-lib/src/gateway.rs#L171-L178'),
          },
        },
      },
    },
    {
      heading: 'Subagents and hooks',
      teach: [
        'Subagents delegate a scoped task to a child session. A child can start fresh, receive normalized parent history when context is explicitly forked, or resume a completed peer; it may also use a narrower tool set. The parent receives a structured completion result, while lifecycle and progress notifications can be surfaced separately. Hooks are the fourth mechanism: configured handlers attached to lifecycle events. Their matcher semantics depend on the event payload, and dispatch policy depends on the event: for example, pre-tool hooks run in order and an explicit deny stops the chain.',
      ],
      grokBuild: {
        text: 'The task tool asks the shell coordinator to create a tracked child session. Its initial context is `New` by default, `Forked` when requested, or `Resumed` from a completed subagent; fork normalization lives in `xai-grok-subagent-resolution`. On completion the coordinator extracts the child\u2019s last assistant text into `SubagentResult`, stores completion metadata, and returns that result to the waiting tool call, while separate session notifications report lifecycle/progress. Hook dispatch first selects specs for the event, then applies the event payload\u2019s match value; pre-tool hooks run sequentially and fail open unless a hook explicitly denies.',
        links: [
          {
            label: 'Subagent context normalization',
            url: gh('crates/codegen/xai-grok-subagent-resolution/src/context.rs'),
          },
          { label: 'Hooks — matcher.rs', url: gh('crates/codegen/xai-grok-hooks/src/matcher.rs') },
        ],
        code: {
          label: 'Subagent context sources',
          code: `/// How the child session's initial context was bootstrapped.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) enum InitialContextSource {
    /// Fresh session — no inherited history.
    New,
    /// Parent history as \`<background_context>\` (harness-only chat-prefix fork).
    Forked,`,
          source: {
            label: 'subagent/mod.rs, lines 45–51',
            url: gh('crates/codegen/xai-grok-shell/src/agent/subagent/mod.rs#L45-L51'),
          },
        },
      },
    },
  ],
  mermaid: `flowchart TB
  Core[Core agent loop] --> Tools[Built-in tools]
  MCP[MCP client] -->|discovered tools| Core
  Ext[External MCP servers] --> MCP
  Client[Pager / editor / protocol client] <-->|ACP requests + notifications| Core
  Core -->|spawn scoped task| Sub[Subagent child session]
  Sub -->|structured result| Core
  Core -->|lifecycle events| Hooks[Hooks: match + dispatch]`,
  evidence: [
    {
      label: 'MCP client crate',
      url: gh('crates/codegen/xai-grok-mcp/src/lib.rs'),
    },
    {
      label: 'MCP — server connections',
      url: gh('crates/codegen/xai-grok-mcp/src/servers.rs'),
    },
    {
      label: 'ACP library crate',
      url: gh('crates/codegen/xai-acp-lib/src/lib.rs'),
    },
    {
      label: 'ACP gateway',
      url: gh('crates/codegen/xai-acp-lib/src/gateway.rs'),
    },
    {
      label: 'Subagent coordinator (shell)',
      url: gh('crates/codegen/xai-grok-shell/src/agent/subagent/mod.rs'),
    },
    {
      label: 'Subagent resolution crate',
      url: gh('crates/codegen/xai-grok-subagent-resolution/src/context.rs'),
    },
    {
      label: 'Hooks — dispatcher',
      url: gh('crates/codegen/xai-grok-hooks/src/dispatcher.rs'),
    },
    {
      label: 'User guide — MCP servers',
      url: gh('crates/codegen/xai-grok-pager/docs/user-guide/07-mcp-servers.md'),
    },
    {
      label: 'User guide — subagents',
      url: gh('crates/codegen/xai-grok-pager/docs/user-guide/16-subagents.md'),
    },
    {
      label: 'User guide — hooks',
      url: gh('crates/codegen/xai-grok-pager/docs/user-guide/10-hooks.md'),
    },
  ],
  furtherReading: [
    {
      label: 'Zhang & Khattab — programmatic sub-agent calling and decomposition',
      url: 'https://alexzhang13.github.io/blog/2026/harness/',
      note: 'Why delegating to sub-calls with isolated context aids generalization',
    },
  ],
}
