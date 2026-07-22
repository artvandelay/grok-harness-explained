import type { Source } from './types'

/**
 * Hosted Understand Anything dashboard for the grok-build knowledge graph.
 * Live at artvandelay/grok-harness-graph (GitHub Pages).
 */
export const DASHBOARD_URL = 'https://artvandelay.github.io/grok-harness-graph/'

/** Node count of the grok-build knowledge graph, for display copy. */
export const GRAPH_NODE_COUNT = '24k'

export const sources: Source[] = [
  {
    name: 'Grok Build (xai-org/grok-build)',
    url: 'https://github.com/xai-org/grok-build',
    role: 'The source used to ground each harness concept and code excerpt in this guide.',
  },
  {
    name: 'Alex L. Zhang & Omar Khattab — "Language model harnesses are compositional generalizers"',
    url: 'https://alexzhang13.github.io/blog/2026/harness/',
    role: 'Good framing of the harness as the program between the model and the environment. A lot of the vocabulary here comes from this post.',
  },
  {
    name: 'Understand Anything (Egonex-AI/Understand-Anything)',
    url: 'https://github.com/Egonex-AI/Understand-Anything',
    role: 'Knowledge-graph tool used to map grok-build before writing the guide.',
  },
  {
    name: 'Xuying Ning et al. — "Code as Agent Harness" (arXiv:2605.18747)',
    url: 'https://arxiv.org/abs/2605.18747',
    role: 'Survey on code as the substrate for agent harnesses: interfaces, mechanisms, multi-agent scaling.',
  },
]
