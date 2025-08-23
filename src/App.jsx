import  React, { useState, useEffect } from 'react'
import { Globe, Activity, Zap, Book, Play } from 'lucide-react'
import LoginPage from './components/LoginPage'
import CircuitBuilder from './components/CircuitBuilder'
import BlochVisualizer from './components/BlochVisualizer'
import StateAnalytics from './components/StateAnalytics'
import Navigation from './components/Navigation'
import EntanglementView from './components/EntanglementView'
import ProbabilityView from './components/ProbabilityView'
import LearningPanel from './components/LearningPanel'
import AnimatedCircuit from './components/AnimatedCircuit'
import { ViewMode } from './utils/constants'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [circuit, setCircuit] = useState([])
  const [quantumState, setQuantumState] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [viewMode, setViewMode] = useState(ViewMode.BLOCH)
  const [selectedGate, setSelectedGate] = useState(null)
  const [learningMode, setLearningMode] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('qscope_current_user')
    if (savedUser) {
      setCurrentUser(savedUser)
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (email) => {
    setCurrentUser(email)
    setIsLoggedIn(true)
  }

  const handleSimulate = async () => {
    if (circuit.length === 0) return
    
    setIsSimulating(true)
    try {
      const { simulate } = await import('./utils/quantumSimulator')
      const result = simulate(circuit)
      setQuantumState(result)
    } catch (error) {
      console.error('Simulation error:', error)
    }
    setIsSimulating(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('qscope_current_user')
    setIsLoggedIn(false)
    setCurrentUser('')
    setCircuit([])
    setQuantumState(null)
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  const renderVisualization = () => {
    switch (viewMode) {
      case ViewMode.BLOCH:
        return <BlochVisualizer quantumState={quantumState} />
      case ViewMode.PROBABILITY:
        return <ProbabilityView quantumState={quantumState} />
      case ViewMode.ENTANGLEMENT:
        return <EntanglementView quantumState={quantumState} circuit={circuit} />
      default:
        return <BlochVisualizer quantumState={quantumState} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
      <Navigation 
        onLogout={handleLogout} 
        currentUser={currentUser}
      />
      
      <div className="container mx-auto px-4 py-6 space-y-8">
        <div className="w-full max-w-5xl mx-auto px-2">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <button
              onClick={() => setViewMode(ViewMode.BLOCH)}
              className={`flex-1 min-w-0 sm:flex-none sm:min-w-[120px] px-3 py-2 rounded border text-xs font-medium transition-all duration-300 hover:scale-105 ${
                viewMode === ViewMode.BLOCH
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400 shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600'
              }`}
            >
              <Globe className="w-3 h-3 mx-auto mb-1" />
              <span className="truncate">Bloch Sphere</span>
            </button>

            <button
              onClick={() => setViewMode(ViewMode.PROBABILITY)}
              className={`flex-1 min-w-0 sm:flex-none sm:min-w-[120px] px-3 py-2 rounded border text-xs font-medium transition-all duration-300 hover:scale-105 ${
                viewMode === ViewMode.PROBABILITY
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400 shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600'
              }`}
            >
              <Activity className="w-3 h-3 mx-auto mb-1" />
              <span className="truncate">Probability</span>
            </button>

            <button
              onClick={() => setViewMode(ViewMode.ENTANGLEMENT)}
              className={`flex-1 min-w-0 sm:flex-none sm:min-w-[120px] px-3 py-2 rounded border text-xs font-medium transition-all duration-300 hover:scale-105 ${
                viewMode === ViewMode.ENTANGLEMENT
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400 shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600'
              }`}
            >
              <Zap className="w-3 h-3 mx-auto mb-1" />
              <span className="truncate">Entanglement</span>
            </button>

            <button
              onClick={() => setLearningMode(!learningMode)}
              className={`flex-1 min-w-0 sm:flex-none sm:min-w-[120px] px-3 py-2 rounded border text-xs font-medium transition-all duration-300 hover:scale-105 ${
                learningMode
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600'
              }`}
            >
              <Book className="w-3 h-3 mx-auto mb-1" />
              <span className="truncate">Learn</span>
            </button>

            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="flex-1 min-w-0 sm:flex-none sm:min-w-[120px] px-3 py-2 rounded border bg-gradient-to-br from-green-600 to-emerald-600 border-green-400 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:border-slate-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/25 disabled:shadow-none text-xs font-medium"
            >
              <Play className="w-3 h-3 mx-auto mb-1" />
              <span className="truncate">{isSimulating ? 'Running...' : 'Simulate'}</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CircuitBuilder 
              circuit={circuit} 
              setCircuit={setCircuit}
              onGateSelect={setSelectedGate}
              onSimulate={handleSimulate}
              isSimulating={isSimulating}
            />
            {learningMode && (
              <LearningPanel selectedGate={selectedGate} circuit={circuit} />
            )}
          </div>
          
          <div className="space-y-4">
            {renderVisualization()}
            <AnimatedCircuit 
              circuit={circuit} 
              onExecute={handleSimulate}
              isExecuting={isSimulating}
            />
            <StateAnalytics quantumState={quantumState} circuit={circuit} />
          </div>
        </div> 
      </div>
    </div>
  )
}

export default App
 