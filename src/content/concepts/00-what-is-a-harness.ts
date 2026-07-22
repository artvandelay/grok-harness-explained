import type { Concept } from '../types'
import { gh } from '../types'

export const whatIsAHarness: Concept = {
  id: 'what-is-a-harness',
  slug: 'what-is-a-harness',
  order: 0,
  title: 'What is an agent harness?',
  summary:
    'A harness is the program between the environment and the model. It turns a next-token predictor into an agent by deciding what the model sees, how tool calls get dispatched, and when the loop stops.',
  prose: [],
  sections: [
    {
      heading: 'A model alone cannot act',
      teach: [
        'A language model is a function from a token sequence to a probability distribution over the next token. On its own it can\u2019t read a file, run a command, or remember what it did two steps ago; it only maps input tokens to output tokens. A coding agent needs a program that encodes the current state of the world into a prompt, samples the model, interprets what comes back, acts on it, and repeats. That program is the harness.',
      ],
      grokBuild: {
        text: 'The repository makes the boundary concrete. The sampler crate owns the inference HTTP client and converts streamed responses into sampling events; the shell drives that sampler while the rest of the multi-crate workspace implements session state, tools, host operations, safety controls, and interfaces. The model request is therefore one bounded subsystem inside Grok Build, not the whole agent.',
        links: [
          {
            label: 'Inference HTTP client — sampler/client.rs',
            url: gh('crates/codegen/xai-grok-sampler/src/client.rs'),
          },
          { label: 'Workspace manifest', url: gh('Cargo.toml') },
        ],
      },
    },
    {
      heading: 'The harness is the program in between',
      teach: [
        'The harness is the software that sits between the external environment and the neural network. Given the environment state (the repository, the shell, prior messages, tool outputs), it decides (1) how to serialize that state into one or more model inputs, (2) how to parse the model output into text versus structured tool calls, (3) how to dispatch those calls and fold the results back into context, and (4) when to stop. The model supplies fluency and reasoning; the harness supplies structure, memory, safety, and control flow. Code plays both roles here: it\u2019s the model\u2019s output, and it\u2019s also part of what the harness reasons over, acts on, and checks its work against.',
      ],
      grokBuild: {
        text: 'In Grok Build, request assembly lives in the chat-state actor, which copies conversation items and resolved tool definitions into a `ConversationRequest`. The sampler sends that request and emits streamed text and tool-call events. The shell turn driver records the response, prepares each call through argument parsing and permission checks, dispatches it, and either loops or returns a completed turn. `session/turn_completion.rs` is not the stop policy; it only builds the durable completion notification after a turn has ended.',
        links: [
          {
            label: 'Request assembly — chat-state/request_builder.rs',
            url: gh('crates/codegen/xai-chat-state/src/actor/request_builder.rs'),
          },
          {
            label: 'Tool preparation and dispatch — tool_calls.rs',
            url: gh(
              'crates/codegen/xai-grok-shell/src/session/acp_session_impl/tool_calls.rs',
            ),
          },
          {
            label: 'Turn loop and completion decision — turn.rs',
            url: gh('crates/codegen/xai-grok-shell/src/session/acp_session_impl/turn.rs'),
          },
        ],
        code: {
          label: 'The request carries history, tools, and model settings',
          code: `        ConversationRequest {
            items,
            tools: tool_definitions,
            hosted_tools: vec![],
            tool_choice: None,
            model: Some(self.state.sampling_config.model.clone()),
            temperature: self.state.sampling_config.temperature,
            max_output_tokens: self.state.sampling_config.max_completion_tokens,`,
          source: {
            label: 'request_builder.rs, lines 128–135',
            url: gh('crates/codegen/xai-chat-state/src/actor/request_builder.rs#L128-L135'),
          },
        },
      },
    },
    {
      heading: 'Harness quality dominates agent quality',
      teach: [
        'Two products can call the same underlying model and behave completely differently. It comes down to how each builds prompts, shapes the tool set, manages the context window, and gates dangerous actions. Here\u2019s the deeper reason that matters: a good harness keeps each individual model call close to what the model saw during training, "locally in-distribution," so a long, unfamiliar task reduces to a sequence of familiar sub-steps. Most of the leverage in building an agent is in the harness, not the model.',
      ],
      grokBuild: {
        text: 'Grok Build implements much of the behavior users perceive as agent quality outside the main model call: session updates and chat history are persisted for restore, prompts can queue during a running turn, and tool calls pass through plan-mode and permission gates. Compaction is also orchestrated by the harness, but it is not model-free: the compaction path asks a model to summarize history, validates the result, and replaces the active conversation with a compacted form.',
        links: [
          {
            label: 'Session persistence and restore',
            url: gh('crates/codegen/xai-grok-shell/src/session/persistence.rs'),
          },
          {
            label: 'History compaction orchestration',
            url: gh('crates/codegen/xai-grok-shell/src/session/compaction.rs'),
          },
        ],
      },
    },
    {
      heading: 'How this course studies it',
      teach: [
        'Each concept that follows is one harness layer: the agent loop and sessions, the action surface, sandboxed execution, context and memory, the model interface, extensibility protocols, the streaming UI, and run modes. Each gets the mechanism explained in plain English, then the actual crates in Grok Build that implement it, so every abstraction has a real address in real code. The goal is that you can read any agent codebase and recognize the layers, not that you can rebuild this one.',
      ],
      grokBuild: {
        text: 'A useful map for the course starts with five areas: xai-grok-pager-bin parses the CLI and selects TUI, headless, stdio, or leader entry paths; xai-grok-shell contains the session actor and turn loop; xai-grok-tools defines and implements the action surface; the sandbox and workspace crates support execution controls and host operations; and xai-grok-pager implements the TUI.',
        links: [
          {
            label: 'Composition root — pager-bin/src/main.rs',
            url: gh('crates/codegen/xai-grok-pager-bin/src/main.rs'),
          },
          {
            label: 'Agent runtime — xai-grok-shell',
            url: gh('crates/codegen/xai-grok-shell/src/lib.rs'),
          },
          {
            label: 'README — repository layout',
            url: gh('README.md'),
          },
        ],
      },
    },
  ],
  mermaid: `flowchart LR
  Env[Environment: repo, shell, history] --> H[Harness]
  H -->|assembled prompt| Model[LLM]
  Model -->|text + tool calls| H
  H -->|dispatch| Tools[Tools]
  H -->|policy checks| Sandbox[Sandbox / permissions]
  Tools --> Env
  Sandbox --> Env
  H -->|stop / continue| H`,
  evidence: [
    {
      label: 'README — product framing (TUI, headless, ACP)',
      url: gh('README.md'),
    },
    {
      label: 'Composition root — xai-grok-pager-bin/src/main.rs',
      url: gh('crates/codegen/xai-grok-pager-bin/src/main.rs'),
    },
    {
      label: 'Agent runtime crate — xai-grok-shell',
      url: gh('crates/codegen/xai-grok-shell/src/lib.rs'),
    },
  ],
  furtherReading: [
    {
      label: 'Zhang & Khattab — Language model harnesses are compositional generalizers',
      url: 'https://alexzhang13.github.io/blog/2026/harness/',
      note: 'Source of the harness-vs-model framing and the "locally in-distribution" idea',
    },
    {
      label: 'Ning et al. — Code as Agent Harness (arXiv:2605.18747)',
      url: 'https://arxiv.org/abs/2605.18747',
      note: 'Survey on code as operational substrate; three-layer taxonomy of harness engineering',
    },
  ],
}
