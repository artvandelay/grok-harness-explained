import { Link, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-line)]">
        <div className="mx-auto flex max-w-[760px] flex-wrap items-baseline justify-between gap-4 px-4 py-6 sm:px-6">
          <Link to="/" className="group no-underline">
            <span className="block font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-ink)] group-hover:text-[var(--color-signal-soft)]">
              Harness Engineering
            </span>
            <span className="mt-0.5 block font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-mist)]">
              Notes on coding-agent internals
            </span>
          </Link>
          <nav
            aria-label="Primary"
            className="flex items-center gap-5 font-[family-name:var(--font-mono)] text-xs text-[var(--color-mist)]"
          >
            <Link to="/" className="no-underline hover:text-[var(--color-signal-soft)]">
              Home
            </Link>
            <Link to="/references" className="no-underline hover:text-[var(--color-signal-soft)]">
              References
            </Link>
            <a
              href="https://github.com/xai-org/grok-build"
              target="_blank"
              rel="noreferrer"
              className="no-underline hover:text-[var(--color-signal-soft)]"
            >
              grok-build ↗
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-4 py-12 sm:px-6">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-[var(--color-line)]">
        <div className="mx-auto max-w-[760px] px-4 py-8 sm:px-6">
          <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-mist)]">
            <Link to="/references" className="text-[var(--color-fog)] hover:text-[var(--color-signal-soft)]">
              References
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
