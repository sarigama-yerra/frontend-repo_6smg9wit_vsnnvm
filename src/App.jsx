import { useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Game from './components/Game'
import Controls from './components/Controls'

function App() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.12),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.08),transparent_40%)]" />

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-4xl mx-auto">
          <Header />

          <div className="bg-slate-800/50 backdrop-blur-md border border-blue-400/20 rounded-2xl p-4 md:p-6 shadow-xl">
            <div className="flex flex-col items-center">
              <Game />
              <Controls onHome={() => navigate('/test')} />
            </div>
          </div>

          <div className="text-center mt-4 text-blue-300/60 text-sm">
            Built with canvas and a sprinkle of physics.
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
