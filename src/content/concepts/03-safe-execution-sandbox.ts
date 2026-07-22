import type { Concept } from '../types'
import { gh } from '../types'

export const safeExecutionSandbox: Concept = {
  id: 'safe-execution-sandbox',
  slug: 'safe-execution-sandbox',
  order: 3,
  title: 'Safe execution and sandbox',
  summary:
    'Running model-authored commands safely needs two layers. A permission policy decides whether a call is allowed (auto-approve, ask, or deny), and a sandbox constrains what an allowed command can touch.',
  prose: [],
  sections: [
    {
      heading: 'Two layers: permission gate, then sandbox',
      teach: [
        'The most powerful tool, "run this shell command," is also the most dangerous, because the arguments are written by the model. Safe execution is therefore not one feature but a pipeline. First, permission gating: before a command runs, the harness classifies its risk and applies a policy that either auto-approves it, asks the user, or denies it outright. Second, sandboxing: an approved command runs under a profile that limits filesystem paths, network access, and other capabilities, so even an intended-but-wrong command has a blast radius.',
      ],
      grokBuild: {
        text: 'Grok Build splits this along the same two-layer line: workspace permission modules decide whether a command may run, and the sandbox crate constrains it if it does.',
        links: [
          { label: 'Permission — policy engine', url: gh('crates/codegen/xai-grok-workspace/src/permission/policy.rs') },
          { label: 'Sandbox profiles', url: gh('crates/codegen/xai-grok-sandbox/src/profiles.rs') },
        ],
      },
    },
    {
      heading: 'Risk classification must be precise',
      teach: [
        'Risk classification is worth doing well. `ls` and `cat` are read-only; `git commit` mutates the repo but is reversible; `rm -rf`, `curl | sh`, and writes outside the workspace are high-risk. Chained commands (`a && b; c`) must be split and each segment assessed, or a safe-looking prefix can smuggle a dangerous suffix past the check. The policy layer also honors user configuration: an "auto" mode for trusted repos, explicit allow/deny rules, and prompts for anything ambiguous.',
      ],
      grokBuild: {
        text: 'The permission manager decomposes supported shell sequences, checks every parsed segment against managed Bash rules, and applies narrow execution-risk floors for cases such as program-spawning flags or executable Git configuration. `policy.rs` gives deny precedence over ask and allow; the manager combines that policy result with Ask, Auto, or Always-Approve mode and invokes the prompter when approval is still required. Unparseable or ambiguous security-sensitive forms fail closed rather than receiving a numeric risk score.',
        links: [
          { label: 'Permission manager and active modes', url: gh('crates/codegen/xai-grok-workspace/src/permission/manager.rs') },
          { label: 'Permission policy precedence', url: gh('crates/codegen/xai-grok-workspace/src/permission/policy.rs') },
          { label: 'exec_risk.rs', url: gh('crates/codegen/xai-grok-workspace/src/permission/exec_risk.rs') },
          { label: 'bash_command_splitting.rs', url: gh('crates/codegen/xai-grok-workspace/src/permission/bash_command_splitting.rs') },
        ],
        code: {
          label: 'After deny rules return early, ask wins over allow',
          code: `                RuleAction::Ask => matched_ask = true,
                RuleAction::Allow => matched_allow = true,
            }
        }

        if matched_ask {
            return Some(Decision::Ask);
        }`,
          source: {
            label: 'policy.rs, lines 256–263',
            url: gh('crates/codegen/xai-grok-workspace/src/permission/policy.rs#L256-L263'),
          },
        },
      },
    },
    {
      heading: 'Sandbox profiles and controlled terminals',
      teach: [
        'Sandboxing enforces the boundary the policy assumes. A sandbox profile declares which paths are readable or writable and whether the network is reachable. A network policy can allow, deny, or filter egress on top of that. Interactive programs (REPLs, `vim`, watchers) need a real terminal, so a harness may provide a pseudo-terminal (PTY) facility that captures output, forwards input, and can kill runaway processes. Treat sandboxing and permissions as a first-class layer, not a wrapper added later. The same tool call means something completely different depending on whether it runs bare on the host or under a constrained profile with an approval gate in front of it.',
      ],
      grokBuild: {
        text: 'At startup, `xai-grok-sandbox` resolves a profile into process-wide filesystem capabilities; approved child commands inherit those restrictions. Profiles may request blocked child networking, but current enforcement installs a seccomp filter only on known Linux child-launch paths. `network_policy.rs` models future unrestricted, blocked, or exact-website policies and explicitly is not selected or enforced by the runtime today. Separately, `ptyctl` can spawn a configured process in a PTY, expose input/output streams, resize it, wait for it, or kill it; it is not the universal path for approved shell calls.',
        links: [
          { label: 'Sandbox runtime and child-network gate', url: gh('crates/codegen/xai-grok-sandbox/src/lib.rs') },
          { label: 'Future network-policy model', url: gh('crates/codegen/xai-grok-sandbox/src/network_policy.rs') },
          { label: 'ptyctl — pty.rs', url: gh('crates/codegen/ptyctl/src/pty.rs') },
          { label: 'ptyctl — session.rs', url: gh('crates/codegen/ptyctl/src/session.rs') },
        ],
        code: {
          label: 'Workspace profile capabilities',
          code: `            Self::Workspace => Ok(SandboxProfile {
                name: "workspace".to_string(),
                read_only: vec![],
                read_write: essential_writable_paths(workspace),
                deny: vec![],
                default_read: true,
                restrict_network: false,
            }),`,
          source: {
            label: 'profiles.rs, lines 323–330',
            url: gh('crates/codegen/xai-grok-sandbox/src/profiles.rs#L323-L330'),
          },
        },
      },
    },
  ],
  mermaid: `flowchart LR
  Call[bash tool call] --> Split[Split chained commands]
  Split --> Risk[Classify exec risk]
  Risk --> Policy{Permission policy}
  Policy -->|deny| Stop[Blocked]
  Policy -->|ask| User[User approval]
  Policy -->|allow / auto| Sandbox[Process filesystem sandbox]
  User -->|approved| Sandbox
  Sandbox --> Child[Child launch]
  Child -->|known Linux paths when configured| Net[Seccomp network block]
  PTY[Separate ptyctl session] --> Interactive[Controlled interactive process]`,
  evidence: [
    {
      label: 'Sandbox crate',
      url: gh('crates/codegen/xai-grok-sandbox/src/lib.rs'),
    },
    {
      label: 'Sandbox profiles',
      url: gh('crates/codegen/xai-grok-sandbox/src/profiles.rs'),
    },
    {
      label: 'Future network-policy model',
      url: gh('crates/codegen/xai-grok-sandbox/src/network_policy.rs'),
    },
    {
      label: 'Permission manager and active modes',
      url: gh('crates/codegen/xai-grok-workspace/src/permission/manager.rs'),
    },
    {
      label: 'Permission — exec risk classification',
      url: gh('crates/codegen/xai-grok-workspace/src/permission/exec_risk.rs'),
    },
    {
      label: 'Permission — command splitting',
      url: gh('crates/codegen/xai-grok-workspace/src/permission/bash_command_splitting.rs'),
    },
    {
      label: 'Permission — policy engine',
      url: gh('crates/codegen/xai-grok-workspace/src/permission/policy.rs'),
    },
    {
      label: 'PTY control crate',
      url: gh('crates/codegen/ptyctl/src/pty.rs'),
    },
    {
      label: 'PTY session control',
      url: gh('crates/codegen/ptyctl/src/session.rs'),
    },
    {
      label: 'User guide — sandbox',
      url: gh('crates/codegen/xai-grok-pager/docs/user-guide/18-sandbox.md'),
    },
    {
      label: 'User guide — permissions and safety',
      url: gh('crates/codegen/xai-grok-pager/docs/user-guide/22-permissions-and-safety.md'),
    },
  ],
}
