export default function Controls({ onHome }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-sm">
      <button onClick={onHome} className="px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800/80 border border-blue-400/20 text-blue-100">
        Back Home
      </button>
      <span className="text-blue-300/60">•</span>
      <span className="text-blue-200/80">Tap/Click/Space to flap · R to restart</span>
    </div>
  )
}
