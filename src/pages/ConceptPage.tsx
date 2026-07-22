import { useEffect } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { MermaidDiagram } from '../components/MermaidDiagram'
import { curriculum, getAdjacent, DASHBOARD_URL } from '../content'
import { gh } from '../content/types'

function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

type CurriculumItem = (typeof curriculum)[number]

type PartNavigationProps = {
  current: CurriculumItem
  prev?: CurriculumItem
  next?: CurriculumItem
  slug: string
  position: 'top' | 'bottom'
}

function PartNavigation({ current, prev, next, slug, position }: PartNavigationProps) {
  const isTop = position === 'top'

  return (
    <nav
      aria-label={isTop ? 'Part navigation' : 'Part navigation after article'}
      className={[
        'z-20 -mx-4 flex items-center justify-between gap-3 border-y border-[var(--color-line)] bg-[var(--color-paper)]/95 px-4 py-2.5 font-[family-name:var(--font-mono)] text-xs backdrop-blur-sm sm:-mx-6 sm:px-6',
        isTop
          ? 'sticky top-0 mb-8'
          : 'relative mt-14',
      ].join(' ')}
    >
      {prev ? (
        <Link
          to={`/learn/${prev.slug}`}
          title={`Previous: ${prev.title}`}
          className="shrink-0 text-[var(--color-mist)] no-underline hover:text-[var(--color-signal-soft)]"
        >
          ‹ Prev
        </Link>
      ) : (
        <Link
          to="/"
          className="shrink-0 text-[var(--color-mist)] no-underline hover:text-[var(--color-signal-soft)]"
        >
          ‹ Overview
        </Link>
      )}

      <details key={`${position}-${slug}`} className="relative">
        <summary className="cursor-pointer list-none text-[var(--color-mist)] hover:text-[var(--color-ink)] [&::-webkit-details-marker]:hidden">
          Part {String(current.order).padStart(2, '0')} / 09 ▾
        </summary>
        <ul
          className={[
            'absolute left-1/2 z-30 max-h-[70vh] w-[min(22rem,82vw)] -translate-x-1/2 overflow-auto border border-[var(--color-line)] bg-[var(--color-paper)] p-1.5 shadow-md',
            isTop ? 'top-full mt-2' : 'bottom-full mb-2',
          ].join(' ')}
        >
          {curriculum.map((c) => (
            <li key={c.slug}>
              <Link
                to={`/learn/${c.slug}`}
                aria-current={c.slug === slug ? 'page' : undefined}
                className={[
                  'block px-2 py-1.5 no-underline',
                  c.slug === slug
                    ? 'bg-[var(--color-panel)] text-[var(--color-ink)]'
                    : 'text-[var(--color-mist)] hover:bg-[var(--color-panel)] hover:text-[var(--color-ink)]',
                ].join(' ')}
              >
                <span className="mr-2 text-[var(--color-mist)]">
                  {String(c.order).padStart(2, '0')}
                </span>
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </details>

      {next ? (
        <Link
          to={`/learn/${next.slug}`}
          title={`Next: ${next.title}`}
          className="shrink-0 text-[var(--color-mist)] no-underline hover:text-[var(--color-signal-soft)]"
        >
          Next ›
        </Link>
      ) : (
        <Link
          to="/references"
          title="References"
          className="shrink-0 text-[var(--color-mist)] no-underline hover:text-[var(--color-signal-soft)]"
        >
          Next ›
        </Link>
      )}
    </nav>
  )
}

export function ConceptPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { current, prev, next } = getAdjacent(slug)

  // Jump to the top of the page whenever the part changes.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [slug])

  // Left/Right arrow keys move between parts, matching the on-page controls.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      // A diagram zoom modal (or similar overlay) is open — let it own the keyboard.
      if (document.body.dataset.modalOpen === 'true') return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      ) {
        return
      }
      if (e.key === 'ArrowLeft') {
        navigate(prev ? `/learn/${prev.slug}` : '/')
      } else if (e.key === 'ArrowRight') {
        navigate(next ? `/learn/${next.slug}` : '/references')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, prev, next])

  if (!current) {
    return <Navigate to="/" replace />
  }

  const furtherReading = current.furtherReading ?? []

  return (
    <article>
      <PartNavigation current={current} prev={prev} next={next} slug={slug} position="top" />

      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.14em] text-[var(--color-mist)]">
        Part {String(current.order).padStart(2, '0')} / 09 · Harness Engineering
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {current.title}
      </h1>
      <p className="prose-article mt-5 text-lg leading-relaxed text-[var(--color-fog)]">
        {current.summary}
      </p>

      {current.sections && current.sections.length > 0 ? (
        <nav
          aria-label="Contents"
          className="mt-10 border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-4"
        >
          <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--color-mist)]">
            Contents
          </p>
          <ol className="mt-2 space-y-1.5">
            {current.sections.map((section, i) => (
              <li key={section.heading}>
                <a
                  href={`#${slugify(section.heading)}`}
                  className="text-[0.9rem] text-[var(--color-fog)] no-underline hover:text-[var(--color-signal-soft)]"
                >
                  <span className="mr-2 font-[family-name:var(--font-mono)] text-xs text-[var(--color-mist)]">
                    {i + 1}.
                  </span>
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {current.sections ? (
        <div className="prose-article mt-10">
          {current.sections.map((section) => (
            <section key={section.heading} id={slugify(section.heading)} className="scroll-mt-8">
              <h2>{section.heading}</h2>
              {section.teach.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
              {section.grokBuild ? (
                <aside className="mt-6 border-l border-[var(--color-line)] pl-4">
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--color-mist)]">
                    In Grok Build
                  </p>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-[var(--color-fog)]">
                    {section.grokBuild.text}
                  </p>
                  {section.grokBuild.code ? (
                    <figure className="mt-4">
                      <figcaption className="mb-2 font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-mist)]">
                        {section.grokBuild.code.label}
                      </figcaption>
                      <pre className="overflow-x-auto border border-[var(--color-line)] bg-[var(--color-paper)] p-3 text-[0.78rem] leading-relaxed text-[var(--color-ink)]">
                        <code>{section.grokBuild.code.code}</code>
                      </pre>
                      <p className="mt-1.5 font-[family-name:var(--font-mono)] text-[11px]">
                        <a
                          href={section.grokBuild.code.source.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {section.grokBuild.code.source.label} ↗
                        </a>
                      </p>
                    </figure>
                  ) : null}
                  {section.grokBuild.links && section.grokBuild.links.length > 0 ? (
                    <p className="mt-2 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--color-mist)]">
                      {section.grokBuild.links.map((link, i) => (
                        <span key={link.url + link.label}>
                          {i > 0 ? ' · ' : null}
                          <a href={link.url} target="_blank" rel="noreferrer">
                            {link.label}
                          </a>
                        </span>
                      ))}
                    </p>
                  ) : null}
                </aside>
              ) : null}
            </section>
          ))}
        </div>
      ) : (
        <div className="prose-article mt-10">
          {current.prose.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      )}

      {current.mermaid ? (
        <MermaidDiagram chart={current.mermaid} title="Architecture sketch" />
      ) : null}

      {current.caseStudy ? (
        <section className="mt-12 border border-[var(--color-line)] bg-[var(--color-panel)] p-5 sm:p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)]">
            In Grok Build
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--color-fog)]">{current.caseStudy.lede}</p>

          <h3 className="mt-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-[var(--color-mist)]">
            Crates &amp; modules
          </h3>
          <ul className="mt-3 space-y-3">
            {current.caseStudy.crates.map((c) => (
              <li key={c.crate} className="border-l border-[var(--color-line)] pl-3">
                <a
                  href={gh(c.path)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-[family-name:var(--font-mono)] text-sm font-semibold"
                >
                  {c.crate}
                </a>
                <p className="mt-0.5 text-sm text-[var(--color-fog)]">{c.role}</p>
              </li>
            ))}
          </ul>

          <h3 className="mt-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-[var(--color-mist)]">
            How the flow works
          </h3>
          <ol className="mt-3 max-w-2xl list-decimal space-y-2 pl-5 text-[var(--color-fog)]">
            {current.caseStudy.flow.map((step) => (
              <li key={step.slice(0, 42)} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {furtherReading.length > 0 ? (
        <section className="mt-14 border-t border-[var(--color-line)] pt-10">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-ink)]">
            Further reading
          </h2>
          <ul className="mt-4 space-y-2">
            {furtherReading.map((item) => (
              <li key={item.url + item.label} className="text-[var(--color-fog)]">
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.label}
                </a>
                {item.note ? (
                  <span className="text-[var(--color-mist)]"> · {item.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <PartNavigation current={current} prev={prev} next={next} slug={slug} position="bottom" />

      <p className="mt-4 text-center font-[family-name:var(--font-mono)] text-xs text-[var(--color-mist)]">
        Tip: press{' '}
        <kbd className="rounded border border-[var(--color-line)] bg-[var(--color-panel)] px-1 py-0.5">
          ←
        </kbd>{' '}
        and{' '}
        <kbd className="rounded border border-[var(--color-line)] bg-[var(--color-panel)] px-1 py-0.5">
          →
        </kbd>{' '}
        to move between parts.
      </p>

      <p className="mt-8 text-sm text-[var(--color-mist)]">
        Want to see how these pieces connect across the whole codebase?{' '}
        <a href={DASHBOARD_URL} target="_blank" rel="noreferrer">
          Explore the interactive knowledge graph
        </a>{' '}
        of grok-build.
      </p>
    </article>
  )
}
