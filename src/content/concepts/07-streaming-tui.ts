import type { Concept } from '../types'
import { gh } from '../types'

export const streamingTui: Concept = {
  id: 'streaming-tui',
  slug: 'streaming-tui',
  order: 7,
  title: 'Streaming TUI and rendering',
  summary:
    'The pager is an ACP client of the agent, not the owner of its loop. It consumes typed notifications, incrementally renders text and tool activity, and multiplexes that traffic with terminal input and drawing.',
  prose: [],
  sections: [
    {
      heading: 'The UI subscribes to events, not the loop',
      teach: [
        'A long-running agent that shows nothing until it finishes feels broken, so presentation consumes incremental protocol updates. As message chunks, tool-call updates, and session notifications arrive, the UI applies them to view state while the same event loop also services keyboard, mouse, task, and render events. The rule is separation: the pager sends ACP requests and renders ACP notifications, while the shell owns the agent and session loops.',
      ],
      grokBuild: {
        text: 'The pager does not subscribe directly to a shell session event bus. It holds the client side of an ACP connection and receives `AcpClientMessage` values. Its biased `tokio::select!` loop handles ACP traffic alongside terminal input and rendering; ready ACP messages are drained in bounded batches, stopping when input arrives. `acp_handler` routes each session notification by `session_id` and updates that session\u2019s scrollback, including inactive views.',
        links: [
          { label: 'xai-grok-pager', url: gh('crates/codegen/xai-grok-pager/src/lib.rs') },
          {
            label: 'Pager event loop',
            url: gh('crates/codegen/xai-grok-pager/src/app/event_loop.rs'),
          },
          {
            label: 'ACP notification handling',
            url: gh('crates/codegen/xai-grok-pager/src/app/acp_handler/mod.rs'),
          },
        ],
        code: {
          label: 'ACP messages enter the pager loop',
          code: `            msg = acp_rx.recv(), if input_rx.is_empty() => {
                let Some(msg) = msg else { break };
                let mut state_changed = acp_handler::handle(msg, &mut app);
                if !app.pending_effects.is_empty() {
                    let effs = std::mem::take(&mut app.pending_effects);
                    if process_effects(effs, &mut tasks, &mut app, &progress_tx) {
                        break;
                    }`,
          source: {
            label: 'event_loop.rs, lines 2032–2039',
            url: gh('crates/codegen/xai-grok-pager/src/app/event_loop.rs#L2032-L2039'),
          },
        },
      },
    },
    {
      heading: 'Terminal rendering is its own problem',
      teach: [
        'Model output is markdown, but a terminal has no browser: the harness needs a renderer that turns markdown (headings, lists, code blocks, tables) and even Mermaid diagrams into styled terminal cells, wraps them to the current width, and does so fast enough to update on every streamed chunk. A fullscreen TUI also maintains scrollback (history you can scroll through), a prompt input area, modals, and slash commands, all redrawn on a render loop, typically via an immediate-mode terminal library.',
      ],
      grokBuild: {
        text: 'Each assistant/thinking block owns `MarkdownContent`, which wraps `xai-grok-markdown::StreamingMarkdownRenderer`. Incoming chunks call `push_and_render`, increment a generation, and invalidate width/theme-keyed wrap caches. Mermaid fences are detected from markdown; when enabled, the pager\u2019s worker invokes `xai-grok-mermaid` out of process for bounded SVG/PNG rendering. `xai-grok-pager-render` supplies shared terminal, drawing, theme, and wrapping support rather than owning the session stream.',
        links: [
          { label: 'xai-grok-markdown', url: gh('crates/codegen/xai-grok-markdown/src/lib.rs') },
          { label: 'xai-grok-mermaid', url: gh('crates/codegen/xai-grok-mermaid/src/lib.rs') },
          { label: 'xai-grok-pager-render', url: gh('crates/codegen/xai-grok-pager-render') },
          {
            label: 'Streaming markdown block',
            url: gh('crates/codegen/xai-grok-pager/src/scrollback/blocks/markdown_content.rs'),
          },
          {
            label: 'Mermaid render worker',
            url: gh('crates/codegen/xai-grok-pager/src/app/mermaid_worker.rs'),
          },
        ],
      },
    },
    {
      heading: 'Swappable front-ends, testable rendering',
      teach: [
        'Because the runtime speaks ACP, different clients can implement different presentation: the pager renders a fullscreen terminal, the top-level headless command emits stdout, and an editor can speak ACP over stdio. These are separate client paths, not one shared in-memory subscriber object. The terminal client is testable by launching the real pager under a pseudo-terminal and asserting against an emulated screen.',
      ],
      grokBuild: {
        text: 'The pager crate owns terminal-facing state such as scrollback, prompt input, slash commands, and modals. `xai-grok-pager-pty-harness` spawns the real pager binary under `portable_pty`, injects input and resize events, feeds emitted bytes into an `alacritty_terminal` screen model, and exposes visible-screen, scrollback, style, raw-output, and frame-timing assertions. Content-backed tests use a mock inference server while still exercising the real pager process.',
        links: [
          { label: 'Scrollback', url: gh('crates/codegen/xai-grok-pager/src/scrollback') },
          { label: 'Slash commands', url: gh('crates/codegen/xai-grok-pager/src/slash') },
          { label: 'PTY test harness', url: gh('crates/codegen/xai-grok-pager-pty-harness') },
        ],
      },
    },
  ],
  mermaid: `flowchart LR
  Agent[Shell agent/session] -->|ACP notifications| Pager[Pager TUI]
  Pager -->|ACP requests| Agent
  Pager --> Scroll[Scrollback]
  Pager --> Prompt[Prompt + slash commands]
  Pager --> MD[Streaming markdown render]
  Pager --> MM[Optional Mermaid worker]
  MD --> Scroll
  MM --> Scroll
  Pager -->|draw requests| Terminal[Terminal output]`,
  evidence: [
    {
      label: 'Pager crate root',
      url: gh('crates/codegen/xai-grok-pager/src/lib.rs'),
    },
    {
      label: 'Scrollback',
      url: gh('crates/codegen/xai-grok-pager/src/scrollback'),
    },
    {
      label: 'Slash commands',
      url: gh('crates/codegen/xai-grok-pager/src/slash'),
    },
    {
      label: 'Pager render crate',
      url: gh('crates/codegen/xai-grok-pager-render'),
    },
    {
      label: 'Pager ACP event loop',
      url: gh('crates/codegen/xai-grok-pager/src/app/event_loop.rs'),
    },
    {
      label: 'Markdown crate',
      url: gh('crates/codegen/xai-grok-markdown/src/lib.rs'),
    },
    {
      label: 'Mermaid crate',
      url: gh('crates/codegen/xai-grok-mermaid/src/lib.rs'),
    },
    {
      label: 'PTY test harness crate',
      url: gh('crates/codegen/xai-grok-pager-pty-harness'),
    },
    {
      label: 'User guide — getting started',
      url: gh('crates/codegen/xai-grok-pager/docs/user-guide/01-getting-started.md'),
    },
  ],
}
