import { DASHBOARD_URL, GRAPH_NODE_COUNT } from '../content'

type Props = {
  variant?: 'section' | 'compact'
}

/**
 * "Go deeper" pointer to the hosted Understand Anything knowledge-graph
 * dashboard for grok-build. URL lives in DASHBOARD_URL (sources.ts).
 */
export function DashboardCallout({ variant = 'section' }: Props) {
  const heading = 'See the whole map'
  const body = (
    <>
      These notes name the layers. The graph shows the crates: {GRAPH_NODE_COUNT} nodes from
      grok-build, built with{' '}
      <a href="https://github.com/Egonex-AI/Understand-Anything" target="_blank" rel="noreferrer">
        Understand Anything
      </a>
      .
    </>
  )

  if (variant === 'compact') {
    return (
      <aside className="mt-12 max-w-2xl border-l border-[var(--color-line)] pl-4">
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--color-mist)]">
          Go deeper
        </p>
        <p className="mt-2 text-[var(--color-fog)]">{body}</p>
        <p className="mt-3">
          <a href={DASHBOARD_URL} target="_blank" rel="noreferrer">
            Open the knowledge graph →
          </a>
        </p>
      </aside>
    )
  }

  return (
    <section className="border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-6 sm:px-8 sm:py-8">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-ink)]">
        {heading}
      </h2>
      <p className="mt-3 max-w-2xl text-[var(--color-fog)]">{body}</p>
      <p className="mt-5">
        <a href={DASHBOARD_URL} target="_blank" rel="noreferrer">
          Open the knowledge graph →
        </a>
      </p>
    </section>
  )
}
