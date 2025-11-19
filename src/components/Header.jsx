import { Bird } from 'lucide-react'

export default function Header() {
  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-400/30">
        <Bird className="w-7 h-7 text-blue-300" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Flappy Bird</h1>
        <p className="text-xs text-blue-200/70">A tiny remake built right here</p>
      </div>
    </div>
  )
}
