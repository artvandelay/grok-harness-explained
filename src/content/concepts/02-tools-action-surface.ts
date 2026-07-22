import type { Concept } from '../types'
import { gh } from '../types'

export const toolsActionSurface: Concept = {
  id: 'tools-action-surface',
  slug: 'tools-action-surface',
  order: 2,
  title: 'Tools and the action surface',
  summary:
    'A tool is a named function with a JSON schema that the model may call. The action surface is the full set of those functions, and designing it is a deliberate capability/risk trade-off.',
  prose: [],
  sections: [
    {
      heading: 'Tools are structured calls',
      teach: [
        'Models do not touch your disk directly. The harness advertises a set of tools: each is a name, a human-readable description, and a JSON Schema for its arguments. These schemas get serialized into the model request so the model knows what it may call and with what shape. When the model wants to act, it emits a structured tool call, a name plus a JSON arguments object, rather than prose. The harness parses and validates those arguments according to the registered tool contract, runs the corresponding function, and returns a tool result that is appended to the context for the next model call.',
      ],
      grokBuild: {
        text: 'The tools registry builds model-facing definitions from a client name, rendered description, and JSON Schema derived from each built-in tool\'s Rust argument type. The shell parses a returned argument string as JSON and asks the live tool bridge to decode it into that tool\'s typed input; malformed or unknown calls become tool errors. Approved calls are dispatched through the finalized toolset, and their results are pushed into chat state for the next request. Dynamic MCP tools join the same toolset with schemas supplied at runtime, but use JSON passthrough arguments rather than a built-in Rust argument type.',
        links: [
          {
            label: 'Tool registry and finalized toolset',
            url: gh('crates/codegen/xai-grok-tools/src/registry/types.rs'),
          },
          {
            label: 'Built-in implementations (bash, read_file, grep, …)',
            url: gh('crates/codegen/xai-grok-tools/src/implementations/grok_build'),
          },
          {
            label: 'Shell parsing and permission pipeline',
            url: gh(
              'crates/codegen/xai-grok-shell/src/session/acp_session_impl/tool_calls.rs',
            ),
          },
        ],
        code: {
          label: 'A model-facing definition contains name, description, and parameters',
          code: `            kind: ToolType::Function,
            function: FunctionTool {
                name: name.into(),
                description: description.map(Into::into),
                parameters,
            },`,
          source: {
            label: 'definition.rs, lines 29–34',
            url: gh('crates/codegen/xai-grok-tools/src/types/definition.rs#L29-L34'),
          },
        },
      },
    },
    {
      heading: 'The action surface is a product decision',
      teach: [
        'The complete set of advertised tools is the action surface, and it is a deliberate product decision. Too small and the agent is helpless: it might read files but stop short of editing them, or edit code but skip running the tests that would catch a mistake. Too large, or too powerful without guardrails, and you get brittle behavior, prompt-injection risk, and unsafe execution. Good harnesses also make the surface context-dependent: read-only modes hide mutating tools, plan mode restricts the agent to non-destructive actions, and MCP servers add tools dynamically per session.',
      ],
      grokBuild: {
        text: 'Grok Build gives tools a detailed `ToolKind` such as Read, Edit, Execute, Search, or WebFetch, plus a default `is_read_only` classification that individual tools may override. This is not a three-way read/mutate/exec taxonomy. In this build, plan mode does not remove definitions from the advertised set; the shell instead rejects edit-class calls outside the plan file during tool preparation. MCP tools can be registered and removed at runtime, while the computer-hub core supplies the transport, registry, and local-versus-remote resolver abstractions used by tool routing.',
        links: [
          {
            label: 'Tool kinds — types/tool.rs',
            url: gh('crates/codegen/xai-grok-tools/src/types/tool.rs'),
          },
          {
            label: 'Plan-mode edit gate — tool_calls.rs',
            url: gh(
              'crates/codegen/xai-grok-shell/src/session/acp_session_impl/tool_calls.rs',
            ),
          },
          {
            label: 'Plan-mode definition pass-through — session_mode.rs',
            url: gh(
              'crates/codegen/xai-grok-shell/src/session/acp_session_impl/session_mode.rs',
            ),
          },
          { label: 'xai-computer-hub-core', url: gh('crates/common/xai-computer-hub-core/src/lib.rs') },
        ],
      },
    },
    {
      heading: 'Contract, implementation, and runtime stay separate',
      teach: [
        'Separate three things: the tool contract (name, schema, result type), the tool implementation (the code that actually reads a file or runs a command), and the dispatch/runtime (validation, execution, error handling, streaming of partial output). Keep the contract stable and the runtime shared, and new tools, including externally contributed ones, plug in without changing the loop.',
      ],
      grokBuild: {
        text: 'Grok Build separates model-facing `ToolDefinition` values and registry metadata from concrete implementations under `implementations/`. `xai-tool-runtime` defines the typed `Tool` contract, an object-safe JSON dispatch interface, and the progress/terminal stream invariant; concrete routing and argument decoding live downstream in the registry, local computer-hub registry, and shell. Built-in and dynamic tools share these contracts, but their adapters and validation paths are not identical.',
        links: [
          {
            label: 'Model-facing tool definition',
            url: gh('crates/codegen/xai-grok-tools/src/types/definition.rs'),
          },
          {
            label: 'Shared dispatch contract',
            url: gh('crates/common/xai-tool-runtime/src/dispatch.rs'),
          },
        ],
      },
    },
  ],
  mermaid: `flowchart TB
  Model[Model emits tool call: name + JSON args] --> Reg[Tool registry]
  Reg -->|parse and decode args| Disp[Dispatch / runtime]
  Disp --> Impl[Tool implementation]
  Impl --> Edit[read_file / search_replace]
  Impl --> Bash[bash]
  Impl --> Search[grep / web_search]
  Impl --> Ext[MCP / computer-hub tools]
  Impl -->|tool result| Ctx[Append to context]`,
  evidence: [
    {
      label: 'Tools crate root',
      url: gh('crates/codegen/xai-grok-tools/src/lib.rs'),
    },
    {
      label: 'Built-in tool implementations (bash, read_file, grep, ...)',
      url: gh('crates/codegen/xai-grok-tools/src/implementations/grok_build'),
    },
    {
      label: 'Tool registry',
      url: gh('crates/codegen/xai-grok-tools/src/registry/types.rs'),
    },
    {
      label: 'Tool kind taxonomy and namespaces',
      url: gh('crates/codegen/xai-grok-tools/src/types/tool.rs'),
    },
    {
      label: 'Shared tool runtime — dispatch',
      url: gh('crates/common/xai-tool-runtime/src/dispatch.rs'),
    },
    {
      label: 'Computer hub core (capability adapters)',
      url: gh('crates/common/xai-computer-hub-core/src/lib.rs'),
    },
  ],
}
