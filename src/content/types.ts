export type EvidenceLink = {
  label: string
  url: string
  note?: string
}

export type CodeExcerpt = {
  label: string
  code: string
  source: EvidenceLink
}

/** One crate/module that implements a concept inside grok-build. */
export type CaseStudyCrate = {
  /** Crate or module name, e.g. `xai-grok-sampler`. */
  crate: string
  /** Repo-relative path used to build a GitHub link (must exist in the tree). */
  path: string
  /** What this crate/module is responsible for, in one precise sentence. */
  role: string
}

/**
 * The "In Grok Build" case-study block: how a concept is actually
 * implemented in the xai-org/grok-build source tree.
 */
export type CaseStudy = {
  /** One orienting paragraph tying the concept to real crates. */
  lede: string
  /** The crates/modules that implement the concept. */
  crates: CaseStudyCrate[]
  /** Ordered, precise data-flow steps as they occur in the code. */
  flow: string[]
}

/**
 * One teaching beat: a small idea taught in plain English, immediately
 * grounded in grok-build. Pages built from sections interleave explanation
 * and source evidence instead of separating them into two blocks.
 */
export type ConceptSection = {
  heading: string
  /** Teaching prose paragraphs (plain English, mechanism-first). */
  teach: string[]
  /** How this exact idea shows up in grok-build, with the receipts. */
  grokBuild?: {
    text: string
    links?: EvidenceLink[]
    /** A short excerpt when the code teaches the mechanism better than prose alone. */
    code?: CodeExcerpt
  }
}

export type Concept = {
  id: string
  slug: string
  order: number
  title: string
  summary: string
  /** Plain-English body paragraphs for students (legacy pages). */
  prose: string[]
  /** Interleaved teach-then-ground sections. When present, replaces prose + caseStudy rendering. */
  sections?: ConceptSection[]
  /** Optional Mermaid diagram source */
  mermaid?: string
  /** Concept grounded in the real grok-build source tree (legacy pages). */
  caseStudy?: CaseStudy
  /** Raw anchor links into the grok-build repo. */
  evidence: EvidenceLink[]
  /** Optional external references (blog posts, specs). */
  furtherReading?: EvidenceLink[]
}

export type Source = {
  name: string
  url: string
  role: string
}

export const GROK_BUILD_GITHUB = 'https://github.com/xai-org/grok-build'
export const GROK_BUILD_REVISION = 'a5727c5960452e7527a154b25cb5bf00cda0545e'
export const GROK_BUILD_BLOB = `${GROK_BUILD_GITHUB}/blob/${GROK_BUILD_REVISION}`

export function gh(path: string): string {
  return `${GROK_BUILD_BLOB}/${path.replace(/^\//, '')}`
}
