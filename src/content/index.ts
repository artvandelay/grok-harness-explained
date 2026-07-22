import type { Concept } from './types'
import { whatIsAHarness } from './concepts/00-what-is-a-harness'
import { agentLoopSessions } from './concepts/01-agent-loop-sessions'
import { toolsActionSurface } from './concepts/02-tools-action-surface'
import { safeExecutionSandbox } from './concepts/03-safe-execution-sandbox'
import { contextMemoryWorkspace } from './concepts/04-context-memory-workspace'
import { modelInterfaceSampling } from './concepts/05-model-interface-sampling'
import { extensibility } from './concepts/06-extensibility'
import { streamingTui } from './concepts/07-streaming-tui'
import { runModes } from './concepts/08-run-modes'

export const curriculum: Concept[] = [
  whatIsAHarness,
  agentLoopSessions,
  toolsActionSurface,
  safeExecutionSandbox,
  contextMemoryWorkspace,
  modelInterfaceSampling,
  extensibility,
  streamingTui,
  runModes,
].sort((a, b) => a.order - b.order)

export function getConceptBySlug(slug: string): Concept | undefined {
  return curriculum.find((c) => c.slug === slug)
}

export function getAdjacent(slug: string): {
  prev?: Concept
  next?: Concept
  current?: Concept
} {
  const idx = curriculum.findIndex((c) => c.slug === slug)
  if (idx < 0) return {}
  return {
    current: curriculum[idx],
    prev: idx > 0 ? curriculum[idx - 1] : undefined,
    next: idx < curriculum.length - 1 ? curriculum[idx + 1] : undefined,
  }
}

export {
  sources,
  DASHBOARD_URL,
  GRAPH_NODE_COUNT,
} from './sources'
export type { Concept, EvidenceLink, Source, CaseStudy, CaseStudyCrate } from './types'
export { GROK_BUILD_GITHUB } from './types'
