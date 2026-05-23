// Phase 0 scaffold — full app wired in Phase 2
export default function App() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="text-5xl mb-4">⚡</div>
        <h1 className="font-heading text-3xl text-spark-400 tracking-wider mb-2">
          STARK ACADEMY
        </h1>
        <p className="text-dim text-sm font-body">
          Master the Anthropic ecosystem. Build like Iron Man.
        </p>
        <div className="mt-6 card px-6 py-3 inline-block">
          <span className="text-ghost text-xs font-heading tracking-wide">
            Phase 0 — Scaffold ✓
          </span>
        </div>
      </div>
    </div>
  )
}
