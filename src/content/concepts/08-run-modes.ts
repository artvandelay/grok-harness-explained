import type { Concept } from '../types'
import { gh } from '../types'

export const runModes: Concept = {
  id: 'run-modes',
  slug: 'run-modes',
  order: 8,
  title: 'Run modes: interactive, headless, stdio, and leader',
  summary:
    'One CLI exposes several launch paths. The default starts the pager, prompt flags run a single ACP lifecycle and exit, stdio exposes an ACP agent, and optional leader mode lets pager clients share a persistent local agent process.',
  prose: [],
  sections: [
    {
      heading: 'Several entry paths, shared machinery',
      teach: [
        'A mature harness reuses its agent and session machinery in multiple environments while giving each environment an appropriate composition root. Interactive mode attaches a terminal client. One-shot headless mode runs unattended for scripts and CI and emits machine-consumable output. Stdio mode exposes the agent through ACP so another client can drive it. Reuse matters, but modes can still have different startup, authentication, permissions, and lifecycle policy.',
      ],
      grokBuild: {
        text: 'The `grok` composition root has two layers of mode selection. Top-level prompt flags (`-p`, `--prompt-json`, or `--prompt-file`) call `xai_grok_pager::headless::run_single_turn`; otherwise the default path starts the pager. The internal `grok agent` subcommand separately dispatches stdio, headless, serve, and leader modes to shell entry points. `ClientMode` describes clients of the leader protocol, not every top-level CLI mode.',
        links: [
          { label: 'Composition root — main.rs', url: gh('crates/codegen/xai-grok-pager-bin/src/main.rs') },
          { label: 'agent/app.rs — mode entry points', url: gh('crates/codegen/xai-grok-shell/src/agent/app.rs') },
        ],
        code: {
          label: 'Internal agent mode dispatch',
          code: `    match agent_args.mode {
        Some(AgentCmd::Stdio) => run_stdio_agent(&agent_config, None, agent_memory_config).await,
        Some(AgentCmd::Headless(a)) => {
            let mut agent_config = agent_config.clone();
            apply_headless_args_to_config(&a, &mut agent_config);
            run_headless(
                &agent_config,
                agent_args.reauthenticate,`,
          source: {
            label: 'main.rs, lines 1324–1331',
            url: gh('crates/codegen/xai-grok-pager-bin/src/main.rs#L1324-L1331'),
          },
        },
      },
    },
    {
      heading: 'Mode coverage is a maturity signal',
      teach: [
        'Mode coverage is worth checking because shared internals do not guarantee identical policy. A non-interactive run cannot open every prompt or browser flow that a TUI can, and structured output has different constraints from terminal rendering. The healthy pattern is shared session, tool, and sampling code with deliberate mode-specific boundaries that are tested separately.',
      ],
      grokBuild: {
        text: 'Top-level one-shot execution is implemented by `pager/headless.rs`, not the shell function also named `run_headless`. `run_single_turn` spawns the agent in-process, performs ACP initialize/auth/session/prompt, and emits plain, JSON, or stream-json output. It also applies headless-specific permission, OAuth, model, max-turn, and background-wait behavior. The pager\u2019s interactive path instead selects a direct in-process ACP connection or a leader connection.',
        links: [
          { label: 'headless.rs', url: gh('crates/codegen/xai-grok-pager/src/headless.rs') },
          { label: 'Pager ACP module', url: gh('crates/codegen/xai-grok-pager/src/acp') },
          {
            label: 'Interactive connection selection',
            url: gh('crates/codegen/xai-grok-pager/src/app/mod.rs#L630-L643'),
          },
        ],
      },
    },
    {
      heading: 'Leader/client process model',
      teach: [
        'There is also a process-model wrinkle: a harness can keep the agent in a long-lived local leader while terminal clients connect over IPC. This separates the lifetime of the agent process from one pager process and allows more than one client to subscribe to routed session traffic. Connecting to the process and attaching to a particular live session are separate operations.',
      ],
      grokBuild: {
        text: '`run_stdio_agent` exposes the ACP agent over stdin/stdout for an external protocol client. Leader mode is a separate local IPC architecture: the interactive pager calls `connect_or_spawn`, registers as `ClientMode::Stdio`, and the leader routes ACP JSON lines using session-driver and subscriber maps. `ClientMode::Headless` marks relay-driven internal headless clients and starts relay demand; it does not describe the top-level one-shot `-p` path. Finding a leader does not automatically attach a client to an existing session\u2014session creation or load still happens through ACP.',
        links: [
          { label: 'Leader/client transport', url: gh('crates/codegen/xai-grok-shell/src/leader/mod.rs') },
          {
            label: 'Leader routing server',
            url: gh('crates/codegen/xai-grok-shell/src/leader/server.rs'),
          },
        ],
      },
    },
  ],
  mermaid: `flowchart TB
  Bin[grok composition root] --> Prompt{Top-level prompt flags?}
  Prompt -->|yes| OneShot[run_single_turn: ACP lifecycle, output, exit]
  Prompt -->|no| Pager[Interactive pager]
  Pager --> Choice{Leader enabled?}
  Choice -->|no| Direct[Direct in-process ACP agent]
  Choice -->|yes| IPC[Local IPC client]
  IPC --> Leader[Persistent leader + stdio agent]
  AgentCmd[grok agent subcommand] --> Internal{Internal mode}
  Internal --> Stdio[run_stdio_agent]
  Internal --> RelayHeadless[run_headless relay mode]
  Internal --> Leader`,
  evidence: [
    {
      label: 'Composition root — main.rs (mode selection)',
      url: gh('crates/codegen/xai-grok-pager-bin/src/main.rs'),
    },
    {
      label: 'Shell app entry points (run_headless / run_leader / run_stdio_agent)',
      url: gh('crates/codegen/xai-grok-shell/src/agent/app.rs'),
    },
    {
      label: 'Leader/client transport',
      url: gh('crates/codegen/xai-grok-shell/src/leader/mod.rs'),
    },
    {
      label: 'Leader routing server',
      url: gh('crates/codegen/xai-grok-shell/src/leader/server.rs'),
    },
    {
      label: 'Headless entry in pager',
      url: gh('crates/codegen/xai-grok-pager/src/headless.rs'),
    },
    {
      label: 'Pager ACP module',
      url: gh('crates/codegen/xai-grok-pager/src/acp'),
    },
    {
      label: 'User guide — headless mode',
      url: gh('crates/codegen/xai-grok-pager/docs/user-guide/14-headless-mode.md'),
    },
    {
      label: 'README — modes overview',
      url: gh('README.md'),
    },
  ],
}
