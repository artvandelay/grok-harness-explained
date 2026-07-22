/** Lightweight animated loop for the landing hero — not Mermaid. */
export function AgentLoopVisual() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[280px] animate-rise-delay-2"
      aria-hidden="true"
    >
      <div className="loop-ring absolute inset-6 rounded-full border border-[var(--color-leaf)]/40" />
      <div className="absolute inset-12 rounded-full border border-[var(--color-signal)]/30" />
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke="rgba(63,158,122,0.55)"
          strokeWidth="1.5"
          strokeDasharray="10 14"
          style={{ animation: 'flow-dash 2.4s linear infinite' }}
        />
        <text
          x="100"
          y="48"
          textAnchor="middle"
          fill="#e8c57a"
          fontFamily="IBM Plex Mono, monospace"
          fontSize="11"
        >
          prompt
        </text>
        <text
          x="168"
          y="104"
          textAnchor="middle"
          fill="#6fc4a0"
          fontFamily="IBM Plex Mono, monospace"
          fontSize="11"
        >
          sample
        </text>
        <text
          x="100"
          y="168"
          textAnchor="middle"
          fill="#e8c57a"
          fontFamily="IBM Plex Mono, monospace"
          fontSize="11"
        >
          tools
        </text>
        <text
          x="32"
          y="104"
          textAnchor="middle"
          fill="#6fc4a0"
          fontFamily="IBM Plex Mono, monospace"
          fontSize="11"
        >
          observe
        </text>
        <circle cx="100" cy="100" r="28" fill="rgba(21,38,45,0.9)" stroke="#2a414a" />
        <text
          x="100"
          y="104"
          textAnchor="middle"
          fill="#c5d4d8"
          fontFamily="Syne, sans-serif"
          fontSize="12"
          fontWeight="700"
        >
          loop
        </text>
      </svg>
    </div>
  )
}
