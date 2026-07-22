import { Link } from 'react-router-dom'
import { sources } from '../content'

export function ReferencesPage() {
  return (
    <article>
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--color-mist)]">
        References
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.15] tracking-tight text-[var(--color-ink)] sm:text-[2.75rem]">
        Where this came from
      </h1>
      <p className="prose-article mt-5 text-lg leading-relaxed text-[var(--color-fog)]">
        The source used throughout is{' '}
        <a href="https://github.com/xai-org/grok-build" target="_blank" rel="noreferrer">
          Grok Build
        </a>
        . Mapped with{' '}
        <a
          href="https://github.com/Egonex-AI/Understand-Anything"
          target="_blank"
          rel="noreferrer"
        >
          Understand Anything
        </a>
        .
      </p>

      <ol className="mt-12 space-y-8 border-t border-[var(--color-line)] pt-10">
        {sources.map((source, i) => (
          <li key={source.url} className="flex gap-4">
            <span className="mt-1 font-[family-name:var(--font-mono)] text-sm text-[var(--color-mist)]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="max-w-2xl">
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="font-[family-name:var(--font-display)] text-lg font-semibold"
              >
                {source.name}
              </a>
              <p className="mt-1 text-[var(--color-fog)]">{source.role}</p>
            </div>
          </li>
        ))}
      </ol>

      <nav aria-label="Part navigation" className="mt-14 grid grid-cols-1 gap-3 border-t border-[var(--color-line)] pt-8 sm:grid-cols-2">
        <Link
          to="/learn/run-modes"
          className="group block border border-[var(--color-line)] p-4 no-underline hover:border-[var(--color-mist)]"
        >
          <span className="block font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--color-mist)]">
            ‹ Previous
          </span>
          <span className="mt-1 block font-[family-name:var(--font-display)] font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-signal-soft)]">
            Run modes
          </span>
        </Link>
        <Link
          to="/"
          className="group block border border-[var(--color-line)] p-4 no-underline hover:border-[var(--color-mist)] sm:text-right"
        >
          <span className="block font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--color-mist)]">
            Home ›
          </span>
          <span className="mt-1 block font-[family-name:var(--font-display)] font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-signal-soft)]">
            All parts
          </span>
        </Link>
      </nav>
    </article>
  )
}
