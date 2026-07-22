import { useEffect, useId, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'strict',
  fontFamily: 'IBM Plex Mono, monospace',
  themeVariables: {
    primaryColor: '#f4f1ea',
    primaryTextColor: '#1b1a18',
    primaryBorderColor: '#8aa0a8',
    lineColor: '#6c675e',
    secondaryColor: '#ffffff',
    tertiaryColor: '#fcfbf9',
    background: '#fcfbf9',
    mainBkg: '#f4f1ea',
    nodeBorder: '#b7b0a3',
    clusterBkg: '#ffffff',
    titleColor: '#1b1a18',
    edgeLabelBackground: '#fcfbf9',
  },
})

type Props = {
  chart: string
  title?: string
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export function MermaidDiagram({ chart, title }: Props) {
  const reactId = useId().replace(/:/g, '')
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const renderId = `mmd-${reactId}-${Math.random().toString(36).slice(2, 8)}`

    mermaid
      .render(renderId, chart)
      .then(({ svg: rendered }) => {
        if (!cancelled) {
          setSvg(rendered)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram')
          setSvg('')
        }
      })

    return () => {
      cancelled = true
    }
  }, [chart, reactId])

  return (
    <figure className="my-8">
      <figcaption className="mb-3 flex items-center justify-between gap-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--color-mist)]">
        <span>{title ?? 'Diagram'}</span>
        {!error && svg ? <span aria-hidden="true">click to zoom ⤢</span> : null}
      </figcaption>
      {error ? (
        <pre className="whitespace-pre-wrap border border-[var(--color-line)] bg-[var(--color-panel)] p-4 font-[family-name:var(--font-mono)] text-sm text-red-700">
          Diagram error: {error}
        </pre>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Enlarge diagram${title ? `: ${title}` : ''}`}
          className="block w-full cursor-zoom-in overflow-x-auto border border-[var(--color-line)] bg-[var(--color-panel)] p-4 transition-colors hover:border-[var(--color-mist)]"
        >
          <div
            className="mermaid-wrap flex justify-center"
            dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
          />
        </button>
      )}
      {open && svg ? (
        <DiagramModal svg={svg} title={title} onClose={() => setOpen(false)} />
      ) : null}
    </figure>
  )
}

type ModalProps = {
  svg: string
  title?: string
  onClose: () => void
}

function DiagramModal({ svg, title, onClose }: ModalProps) {
  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const [panning, setPanning] = useState(false)
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.dataset.modalOpen = 'true'
    closeRef.current?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      delete document.body.dataset.modalOpen
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const zoomBy = (f: number) => setScale((s) => clamp(s * f, 0.4, 8))
  const reset = () => {
    setScale(1)
    setTx(0)
    setTy(0)
  }

  function onWheel(e: React.WheelEvent) {
    zoomBy(e.deltaY < 0 ? 1.12 : 0.89)
  }

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true
    setPanning(true)
    last.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return
    const dx = e.clientX - last.current.x
    const dy = e.clientY - last.current.y
    last.current = { x: e.clientX, y: e.clientY }
    setTx((v) => v + dx)
    setTy((v) => v + dy)
  }
  function endPan() {
    dragging.current = false
    setPanning(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} (enlarged)` : 'Diagram (enlarged)'}
      className="fixed inset-0 z-50 flex flex-col bg-[rgba(20,20,18,0.72)] backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-white/80 sm:px-6">
        <span className="uppercase tracking-[0.16em]">{title ?? 'Diagram'}</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => zoomBy(0.83)}
            aria-label="Zoom out"
            className="h-7 w-7 border border-white/25 text-white/90 hover:bg-white/10"
          >
            −
          </button>
          <button
            type="button"
            onClick={reset}
            className="h-7 min-w-[3.5rem] border border-white/25 px-2 text-white/90 hover:bg-white/10"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1.2)}
            aria-label="Zoom in"
            className="h-7 w-7 border border-white/25 text-white/90 hover:bg-white/10"
          >
            +
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-2 h-7 w-7 border border-white/25 text-white/90 hover:bg-white/10"
          >
            ✕
          </button>
        </div>
      </div>

      <div
        className="flex flex-1 items-center justify-center overflow-hidden"
        style={{ cursor: panning ? 'grabbing' : 'grab', touchAction: 'none' }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPan}
        onPointerLeave={endPan}
      >
        <div
          className="modal-mermaid-wrap select-none bg-[var(--color-paper)] p-6 shadow-2xl"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: panning ? 'none' : 'transform 0.08s ease-out',
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      <p className="px-4 py-3 text-center font-[family-name:var(--font-mono)] text-[11px] text-white/55 sm:px-6">
        Scroll to zoom · drag to pan · Esc to close
      </p>
    </div>
  )
}
