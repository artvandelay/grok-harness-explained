import type { Concept } from '../types'
import { gh } from '../types'

export const agentLoopSessions: Concept = {
  id: 'agent-loop-sessions',
  slug: 'agent-loop-sessions',
  order: 1,
  title: 'The agent loop and sessions',
  summary:
    'The agent loop is a precise cycle: assemble context, call the model, parse tool calls, dispatch, append results, repeat until stop. A session is the durable state that cycle runs against.',
  prose: [],
  sections: [
    {
      heading: 'The loop has six nameable steps',
      teach: [
        'The core of a coding agent is a control loop with six nameable steps. (1) Context assembly: the harness builds a message list (system prompt, conversation history, tool schemas, and any injected project context). (2) Model call: it samples the model over that context. (3) Output parsing: the streamed response is split into ordinary text (shown to the user) and structured tool calls (name plus JSON arguments). (4) Dispatch: each tool call is validated and executed. (5) Context append: tool results are appended to the message list. (6) Continue or stop: tool calls normally cause another model iteration, while a response without tool calls becomes eligible to end the turn; budgets, pending input, and product-specific gates can alter either path.',
      ],
      grokBuild: {
        text: 'Grok Build\'s outer loop is in `session/acp_session_impl/turn.rs`. It asks the chat-state actor to build each request, submits it through the sampler, records returned conversation items, and hands tool calls to `tool_calls.rs`. A response without tool calls enters turn-end gates for TODO state and pending interjections before completion; tool-bearing responses execute and loop again, subject to limits such as `max_turns` and context compaction.',
        links: [
          {
            label: 'Outer turn loop — turn.rs',
            url: gh('crates/codegen/xai-grok-shell/src/session/acp_session_impl/turn.rs'),
          },
          {
            label: 'Tool-call execution — tool_calls.rs',
            url: gh(
              'crates/codegen/xai-grok-shell/src/session/acp_session_impl/tool_calls.rs',
            ),
          },
        ],
        code: {
          label: 'No tool calls enter the turn-end gates',
          code: `            if tool_calls.is_empty() {
                if !schema_ok
                    && !turn_refused
                    && let Some(gate_cfg) = self.todo_gate_policy()
                {
                    let collected = self.collect_todo_gate_input(req_id).await;
                    let input = collected.as_input();
                    if let TodoGateDecision::Nudge { reminder, reason } = evaluate_todo_gate(&input)`,
          source: {
            label: 'turn.rs, lines 2296–2303',
            url: gh(
              'crates/codegen/xai-grok-shell/src/session/acp_session_impl/turn.rs#L2296-L2303',
            ),
          },
        },
      },
    },
    {
      heading: 'Everything you care about is a property of the loop',
      teach: [
        'Latency is roughly the number of iterations times the per-call round trip, plus tool time. Cost is the sum of tokens across iterations, and because each iteration re-sends the growing history, cost grows faster than linearly with loop length unless the harness manages context. Runaway behavior ("just one more tool call") is a loop without a budget or stop condition. Reliability failures are usually mis-parsed tool calls, unvalidated arguments, or context that has drifted far from anything the model saw in training.',
      ],
      grokBuild: {
        text: 'Two defenses are explicit in the source. Compaction estimates context use, invokes a summarization path, validates the compacted history, and substitutes it before resampling. Doom-loop recovery does not inspect repeated tool calls itself: the sampler consumes server-reported doom-loop signals, applies a confidence policy, and discards and resamples a flagged attempt while a separate recovery budget remains.',
        links: [
          {
            label: 'session/compaction.rs',
            url: gh('crates/codegen/xai-grok-shell/src/session/compaction.rs'),
          },
          {
            label: 'Sampler doom-loop recovery loop',
            url: gh('crates/codegen/xai-grok-sampler/src/actor/request_task.rs'),
          },
        ],
        code: {
          label: 'A flagged attempt is discarded and resampled',
          code: `                    doom_retry_count += 1;
                    tracing::warn!(
                        target: crate::sampling_log::TARGET,
                        reason = %error,
                        attempt = doom_retry_count,
                        max_retries = doom_max_retries,
                        outcome = "resampled",
                        "doom-loop recovery: discarding the poisoned attempt and resampling"`,
          source: {
            label: 'request_task.rs, lines 247–254',
            url: gh('crates/codegen/xai-grok-sampler/src/actor/request_task.rs#L247-L254'),
          },
        },
      },
    },
    {
      heading: 'Sessions: the state the loop mutates',
      teach: [
        'A session is the durable unit the loop runs against: the ordered message history, configuration and model choice, pending user prompts, tool/permission state, and lifecycle status (running, waiting on the user, interrupted, done). Separating "the loop" (behavior) from "the session" (state) is what lets a harness persist a conversation, fork it, resume it after a crash, or drive the same session from a TUI, a pipe, or an editor.',
      ],
      grokBuild: {
        text: 'The shell session actor owns scheduling state such as the running task and pending inputs, while conversation and token state are accessed through `xai-chat-state`. The persistence actor appends session updates and chat messages through a storage adapter and reloads them during session restore. Forking and client-specific entry points build on that persisted state, so the same conversation can be resumed or driven through different interfaces.',
        links: [
          {
            label: 'acp_session.rs — session actor state',
            url: gh('crates/codegen/xai-grok-shell/src/session/acp_session.rs'),
          },
          {
            label: 'session/persistence.rs — persistence and restore',
            url: gh('crates/codegen/xai-grok-shell/src/session/persistence.rs'),
          },
          {
            label: 'User guide — sessions',
            url: gh('crates/codegen/xai-grok-pager/docs/user-guide/17-sessions.md'),
          },
        ],
      },
    },
    {
      heading: 'Prompts arrive while the loop is running',
      teach: [
        'Prompts arrive asynchronously: a user may type a follow-up while a turn is still running. Harnesses queue prompts instead of blocking the UI, then decide whether an incoming prompt interrupts the current turn or waits for the next one.',
      ],
      grokBuild: {
        text: 'The live queue behavior is in `session/acp_session_impl/prompt_queue.rs`; `session/prompt_queue.rs` only re-exports shared wire types. Normal prompts append to the authoritative FIFO. A “send now” prompt is inserted immediately behind the running item (and behind earlier send-now items) and can cancel the current turn; completion removes the front item before the next queued prompt is promoted.',
        links: [
          {
            label: 'Prompt queue behavior — acp_session_impl/prompt_queue.rs',
            url: gh(
              'crates/codegen/xai-grok-shell/src/session/acp_session_impl/prompt_queue.rs',
            ),
          },
        ],
        code: {
          label: 'Normal prompts append; send-now prompts are inserted',
          code: `            state.pending_inputs.insert(insert_at, item);
        } else {
            state.pending_inputs.push_back(item);
        }
        // qtrace: server appended a prompt to the authoritative FIFO. The index
        // it lands at vs whether a turn is already running tells us if it will`,
          source: {
            label: 'prompt_queue.rs, lines 245–250',
            url: gh(
              'crates/codegen/xai-grok-shell/src/session/acp_session_impl/prompt_queue.rs#L245-L250',
            ),
          },
        },
      },
    },
  ],
  mermaid: `sequenceDiagram
  participant U as User
  participant S as Session (state)
  participant L as Loop
  participant M as Model
  participant T as Tools
  U->>S: enqueue prompt
  loop until no tool calls / budget hit
    L->>M: assembled context + tool schemas
    M-->>L: stream: text + tool calls
    L->>T: dispatch parsed tool calls
    T-->>L: tool results
    L->>S: append results to history
  end
  S-->>U: streamed reply / turn complete`,
  evidence: [
    {
      label: 'Shell crate — agent runtime entry',
      url: gh('crates/codegen/xai-grok-shell/src/lib.rs'),
    },
    {
      label: 'Session module',
      url: gh('crates/codegen/xai-grok-shell/src/session/mod.rs'),
    },
    {
      label: 'Conversation assembly for sampling',
      url: gh('crates/codegen/xai-chat-state/src/actor/request_builder.rs'),
    },
  ],
}
