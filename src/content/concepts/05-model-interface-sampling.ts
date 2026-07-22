import type { Concept } from '../types'
import { gh } from '../types'

export const modelInterfaceSampling: Concept = {
  id: 'model-interface-sampling',
  slug: 'model-interface-sampling',
  order: 5,
  title: 'Model interface and sampling',
  summary:
    'The sampling layer is the seam to the model. It takes messages, tool schemas, and sampling parameters, streams back token deltas and tool-call events, and handles providers, retries, and loop detection so the agent loop stays clean.',
  prose: [],
  sections: [
    {
      heading: 'The sampling seam isolates the loop from HTTP',
      teach: [
        'Somewhere the harness must make an HTTP call to a model API, but that call should be isolated behind a sampling interface rather than scattered through the loop. The interface takes a request (the assembled messages, the advertised tool schemas, and sampling parameters like temperature, top-p, max tokens, and stop sequences) and returns a stream. Everything upstream deals in "sample this conversation," not HTTP status codes and JSON shapes.',
      ],
      grokBuild: {
        text: 'The shell hands a transport-neutral `ConversationRequest`—conversation items, client and hosted tool specs, tool choice, model, temperature, top-p, output limit, and reasoning/structured-output options—to `xai-grok-sampler`. `client.rs` applies client defaults, authentication, headers, and converts that request for one of three configured backends: Chat Completions, Responses, or Anthropic Messages. Shared wire and conversation types live in `xai-grok-sampling-types`; `xai-grok-models` supplies model configuration, while backend dispatch happens in the sampler.',
        links: [
          { label: 'sampler/client.rs', url: gh('crates/codegen/xai-grok-sampler/src/client.rs') },
          { label: 'Transport-neutral conversation request', url: gh('crates/codegen/xai-grok-sampling-types/src/conversation.rs') },
          { label: 'Wire types and backend enum', url: gh('crates/codegen/xai-grok-sampling-types/src/types.rs') },
          { label: 'xai-grok-models', url: gh('crates/codegen/xai-grok-models/src/lib.rs') },
        ],
      },
    },
    {
      heading: 'Streaming demultiplexes text and tool calls',
      teach: [
        'Streaming is not just a UX nicety; it changes the data model. A response arrives as a sequence of events, and the harness has to demultiplex two interleaved kinds: incremental text deltas (assistant tokens to render as they arrive) and tool-call fragments (a tool name accumulating its JSON arguments across chunks). The harness must reassemble fragments into complete calls and validate their arguments before dispatch; those responsibilities may sit at different layers. Provider-specific stream dialects should still be normalized so the rest of the agent sees one shape.',
      ],
      grokBuild: {
        text: 'Backend-specific transforms normalize Chat Completions, Responses, and Messages streams into one `SamplingEvent` dialect and a final `ConversationResponse`. The Chat Completions transform appends tool-call argument fragments by positional index; the Responses transform maps output indices for streamed tool deltas and builds final items from the terminal response. These transforms emit text/reasoning and tool-call delta events, but they do not validate argument JSON against a tool schema. The shell performs JSON recovery and tool-specific parsing immediately before dispatch.',
        links: [
          { label: 'stream/mod.rs', url: gh('crates/codegen/xai-grok-sampler/src/stream/mod.rs') },
          { label: 'chat_completions.rs', url: gh('crates/codegen/xai-grok-sampler/src/stream/chat_completions.rs') },
          { label: 'responses.rs', url: gh('crates/codegen/xai-grok-sampler/src/stream/responses.rs') },
          { label: 'Shell tool parsing and validation', url: gh('crates/codegen/xai-grok-shell/src/session/acp_session_impl/tool_calls.rs') },
        ],
        code: {
          label: 'Backend dispatch selects the matching stream transform',
          code: `    match client.api_backend() {
        ApiBackend::ChatCompletions => {
            let (raw, metadata) = match client.conversation_stream(request).await {
                Ok(pair) => pair,
                Err(e) => return AttemptOutcome::InitFailed { error: e },
            };
            let (teed, captured) = tee_errors(raw);
            let l2 = stream_chat_completions(teed, metadata, request_id.clone(), idle_timeout);`,
          source: {
            label: 'request_task.rs, lines 483–490',
            url: gh('crates/codegen/xai-grok-sampler/src/actor/request_task.rs#L483-L490'),
          },
        },
      },
    },
    {
      heading: 'Retries, doom loops, and sampling policy',
      teach: [
        'Robustness lives here too. Networks fail, rate limits hit, and models sometimes get stuck repeating the same action, a "doom loop." A serious sampling layer implements retries with backoff, surfaces token/latency metrics, and detects degenerate repetition so the harness can break out instead of burning budget. Provider selection and model configuration are resolved here and kept out of the loop. The sampling parameters are policy, not incidental knobs: temperature and stop behavior shape how deterministic and how bounded each turn is; max-token limits interact directly with the context and compaction story from the previous concept.',
      ],
      grokBuild: {
        text: '`retry.rs` classifies failures rather than retrying everything: retryable transport/5xx failures use capped exponential backoff, 429s have a smaller cap, image failures can strip images, while idle timeouts, serialization failures, context overflow, and most client errors are fatal. Doom-loop handling is not local text-repetition detection: the Responses SSE decoder collects server-reported loop signals, and confident signals can abort and resample on a separate budget before the final attempt is accepted as-is. Stream transforms return token usage, reported cost, and latency statistics including time to first token, stream-end latency, and inter-token measures.',
        links: [
          { label: 'doom_loop.rs', url: gh('crates/codegen/xai-grok-sampler/src/doom_loop.rs') },
          { label: 'retry.rs', url: gh('crates/codegen/xai-grok-sampler/src/retry.rs') },
          { label: 'Request retry and doom-loop orchestration', url: gh('crates/codegen/xai-grok-sampler/src/actor/request_task.rs') },
          { label: 'Inference latency metrics', url: gh('crates/codegen/xai-grok-sampler/src/metrics.rs') },
        ],
      },
    },
  ],
  mermaid: `flowchart LR
  Loop[Agent loop] -->|messages + tools + params| Sampler[Sampler]
  Sampler --> Auth[Auth]
  Sampler --> HTTP[HTTP client]
  HTTP --> Provider[Model provider API]
  Provider -->|stream events| Sampler
  Sampler -->|text deltas| Loop
  Sampler -->|reassembled tool calls| Loop
  Loop -->|parse + validate tool input| Dispatch[Tool dispatch]
  Sampler -.->|retry / doom-loop guard| Sampler`,
  evidence: [
    {
      label: 'Sampler crate',
      url: gh('crates/codegen/xai-grok-sampler/src/lib.rs'),
    },
    {
      label: 'Sampler client (entry)',
      url: gh('crates/codegen/xai-grok-sampler/src/client.rs'),
    },
    {
      label: 'Stream parsing — chat completions dialect',
      url: gh('crates/codegen/xai-grok-sampler/src/stream/chat_completions.rs'),
    },
    {
      label: 'Stream parsing — responses dialect',
      url: gh('crates/codegen/xai-grok-sampler/src/stream/responses.rs'),
    },
    {
      label: 'Doom-loop detection',
      url: gh('crates/codegen/xai-grok-sampler/src/doom_loop.rs'),
    },
    {
      label: 'Retry logic',
      url: gh('crates/codegen/xai-grok-sampler/src/retry.rs'),
    },
    {
      label: 'Sampling types (shared request/response shapes)',
      url: gh('crates/codegen/xai-grok-sampling-types/src/types.rs'),
    },
    {
      label: 'Transport-neutral conversation types',
      url: gh('crates/codegen/xai-grok-sampling-types/src/conversation.rs'),
    },
    {
      label: 'Request orchestration and backend dispatch',
      url: gh('crates/codegen/xai-grok-sampler/src/actor/request_task.rs'),
    },
    {
      label: 'Inference latency metrics',
      url: gh('crates/codegen/xai-grok-sampler/src/metrics.rs'),
    },
    {
      label: 'Models crate',
      url: gh('crates/codegen/xai-grok-models/src/lib.rs'),
    },
    {
      label: 'User guide — custom models',
      url: gh('crates/codegen/xai-grok-pager/docs/user-guide/11-custom-models.md'),
    },
  ],
}
