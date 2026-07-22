import { Link } from 'react-router-dom'
import { DashboardCallout } from '../components/DashboardCallout'
import { curriculum } from '../content'

export function LandingPage() {
  return (
    <div>
      <article>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.15] tracking-tight text-[var(--color-ink)] sm:text-[2.75rem]">
          How a coding-agent harness actually works
        </h1>
        <p className="prose-article mt-5 text-lg leading-relaxed text-[var(--color-fog)]">
          A model predicts text. A harness turns it into an agent that reads files, runs commands,
          and edits code. This guide explains the main parts of that harness, grounded in the
          source of xAI's open-source{' '}
          <a href="https://github.com/xai-org/grok-build" target="_blank" rel="noreferrer">
            Grok Build
          </a>
          .
        </p>
        <p className="prose-article mt-4 leading-relaxed text-[var(--color-fog)]">
          Nine short parts, read in order. Each explains one idea, then shows the code that
          implements it. The focus is the architecture. No Rust required.
        </p>
        <p className="mt-5 font-[family-name:var(--font-mono)] text-xs text-[var(--color-mist)]">
          Nine parts · Read in order · Source:{' '}
          <a href="https://github.com/xai-org/grok-build" target="_blank" rel="noreferrer">
            Grok Build
          </a>
        </p>
      </article>

      <section id="path" className="mt-14 border-t border-[var(--color-line)] pt-10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
          Contents
        </h2>
        <ol className="mt-6 space-y-6">
          {curriculum.map((c) => (
            <li key={c.slug} className="flex gap-4">
              <span className="mt-1 font-[family-name:var(--font-mono)] text-sm text-[var(--color-mist)]">
                {String(c.order).padStart(2, '0')}
              </span>
              <div>
                <Link
                  to={`/learn/${c.slug}`}
                  className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-ink)] no-underline hover:text-[var(--color-signal-soft)]"
                >
                  {c.title}
                </Link>
                <p className="mt-1 text-[0.95rem] leading-relaxed text-[var(--color-mist)]">
                  {c.summary}
                </p>
              </div>
            </li>
          ))}
          <li className="flex gap-4">
            <span className="mt-1 font-[family-name:var(--font-mono)] text-sm text-[var(--color-mist)]">
              —
            </span>
            <div>
              <Link
                to="/references"
                className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-ink)] no-underline hover:text-[var(--color-signal-soft)]"
              >
                References
              </Link>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-[var(--color-mist)]">
                Source repo, papers, and tools used to put this together.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="mt-14 border-t border-[var(--color-line)] pt-10">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-ink)]">
          Coming next: one task, end to end
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-[var(--color-fog)]">
          A future walkthrough will follow one agent task through context assembly, model calls,
          tools, the sandbox, and the event stream, with a timeline through the code.
        </p>
      </section>

      <section className="mt-14 border-t border-[var(--color-line)] pt-10">
        <DashboardCallout />
      </section>
    </div>
  )
}
