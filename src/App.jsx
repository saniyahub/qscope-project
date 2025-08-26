import React, { useState, useEffect } from 'react'
import { Globe, Activity, Zap, Book, Play } from 'lucide-react'
import CircuitBuilder from './components/CircuitBuilder'
import BlochVisualizer from './components/BlochVisualizer'
import StateAnalytics from './components/StateAnalytics'
import Navigation from './components/Navigation'
import EntanglementView from './components/EntanglementView'
import ProbabilityView from './components/ProbabilityView'
import LearningPanel from './components/LearningPanel'
import EducationalPanel from './components/EducationalPanel'
import AnimatedCircuit from './components/AnimatedCircuit'
import EntanglementExplanation from './components/EntanglementExplanation'
import Toolbar from './components/Toolbar'
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp'
import ErrorNotification from './components/ErrorNotification'
import { ViewMode } from './utils/constants'
import { useAppContext } from './context/AppContext'
import backendClient from './services/backendClient'

function App() {
  console.log('App component rendering...') // Debug log
  
  // State for educational content
  const [educationalContent, setEducationalContent] = useState(null)
  const [backendAvailable, setBackendAvailable] = useState(false)
  
  try {
    const context = useAppContext()
    
    if (!context) {
      console.error('AppContext is null or undefined')
      return (
        <div className="min-h-screen bg-red-950 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">⚠️ Context Error</h1>
            <p className="text-xl mb-4">App Context failed to load. Please refresh the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    
    const {
      circuit,
      quantumState,
      isSimulating,
      viewMode,
      selectedGate,
      learningMode,
      actions
    } = context

    // Check backend availability
    useEffect(() => {
      const checkBackend = async () => {
        console.log('Checking backend availability...');
        const available = await backendClient.isBackendAvailable()
        console.log('Backend availability result:', available);
        setBackendAvailable(available)
      }
      checkBackend()
    }, [])
    
    // Fetch educational content when circuit changes and backend is available
    useEffect(() => {
      const fetchEducationalContent = async () => {
        console.log('Educational content fetch triggered:', { circuit: circuit?.length, backendAvailable, learningMode });
        
        if (!circuit || circuit.length === 0 || !backendAvailable || !learningMode) {
          setEducationalContent(null)
          return
        }
        
        try {
          console.log('Fetching educational content...');
          const education = await backendClient.getEducationalContent({ gates: circuit }, 'intermediate')
          console.log('Educational content response:', education);
          
          if (education.success && education.explanation) {
            // Extract the actual content from the explanation field
            setEducationalContent(education.explanation)
            console.log('Educational content set:', education.explanation);
          } else if (education.current_concepts) {
            // Fallback if content is at root level
            setEducationalContent(education)
            console.log('Educational content set (fallback):', education);
          }
        } catch (error) {
          console.warn('Educational content fetch failed:', error.message)
          setEducationalContent(null)
        }
      }
      
      // Debounce the fetch
      const timeoutId = setTimeout(fetchEducationalContent, 500)
      return () => clearTimeout(timeoutId)
    }, [circuit, backendAvailable, learningMode])

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
        <Navigation />
        
        <div className="container mx-auto px-4 py-6 space-y-8">
          <Toolbar />
          
          <div className="w-full max-w-5xl mx-auto px-2">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              <button
                onClick={() => actions.setViewMode(ViewMode.BLOCH)}
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
                onClick={() => actions.setViewMode(ViewMode.PROBABILITY)}
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
                onClick={() => actions.setViewMode(ViewMode.ENTANGLEMENT)}
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
                onClick={actions.toggleLearningMode}
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
                onClick={actions.simulateCircuit}
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
              <CircuitBuilder />
              {learningMode && (
                <LearningPanel />
              )}
              <AnimatedCircuit />
              <EntanglementExplanation quantumState={quantumState} circuit={circuit} />
              <StateAnalytics />
              {learningMode && (
                <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <Book className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold">Educational Content</h3>
                  </div>
                  {educationalContent ? (
                    <EducationalPanel 
                      content={educationalContent} 
                      difficulty="intermediate" 
                    />
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-slate-600 mx-auto mb-4">
                        {backendAvailable ? (
                          <p className="text-slate-400">Add gates to your circuit to see educational insights</p>
                        ) : (
                          <p className="text-yellow-400">Backend unavailable - start backend server to see educational content</p>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm">Backend status: {backendAvailable ? 'Connected ✅' : 'Disconnected ❌'}</p>
                      <p className="text-slate-500 text-xs">Circuit gates: {circuit?.length || 0}</p>
                      <p className="text-slate-500 text-xs">Learning mode: {learningMode ? 'ON' : 'OFF'}</p>
                      <p className="text-slate-500 text-xs mt-2">Backend URL: {import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {renderVisualization()}
            </div>
          </div> 
        </div>
        
        {/* Keyboard Shortcuts Help */}
        <KeyboardShortcutsHelp />
        
        {/* Error Notifications */}
        <ErrorNotification />
      </div>
    )
  } catch (error) {
    console.error('Error in App component:', error)
    return (
      <div className="min-h-screen bg-red-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">⚠️ Error Loading Qscope</h1>
          <p className="text-xl mb-4">Something went wrong. Please check the console for details.</p>
          <p className="text-gray-300">Error: {error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }
}

export default App
 