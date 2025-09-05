import React, { useState, useEffect } from 'react'
import { Globe, Activity, Zap, Book, Play, Bot } from 'lucide-react'
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
import QChatSidePanel from './components/QChatSidePanel'
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
  const [showQChatPanel, setShowQChatPanel] = useState(false)
  const [qchatAutoQuery, setQchatAutoQuery] = useState(null)
  
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
  
    // Handle explain matrices request
    const handleExplainMatrices = (data) => {
      console.log('Explain matrices requested:', data);
      
      // Format the circuit for the QChat query
      const circuitDescription = data.circuit.map(gate => 
        `${gate.gate} gate on qubit ${gate.qubit}${gate.targetQubit !== undefined ? ` targeting qubit ${gate.targetQubit}` : ''}`
      ).join(', ');
      
      // Format the matrices data
      const matricesInfo = `Step ${data.index + 1}: ${data.step.operation || 'Operation'}
      
  Initial State Matrix:
  ${JSON.stringify(data.step.initial_state, null, 2)}
  
  Final State Matrix:
  ${JSON.stringify(data.step.final_state, null, 2)}
  
  Gate Matrix:
  ${JSON.stringify(data.step.gate_matrix, null, 2)}`;
      
      // Create the auto-query for QChat
      const autoQuery = `Explain this quantum circuit and matrices:
  
  Circuit: ${circuitDescription}
  
  Matrices Data:
  ${matricesInfo}
  
  What caused these matrix values? How does each gate transform the quantum state?`;
      
      setQchatAutoQuery(autoQuery);
      setShowQChatPanel(true);
    };
    
    // Reset QChat auto query when QChat is closed
    useEffect(() => {
      if (!showQChatPanel) {
        setQchatAutoQuery(null);
      }
    }, [showQChatPanel]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white flex">
        <div className={`flex-1 transition-all duration-300 ${showQChatPanel ? 'ml-[500px]' : ''}`}>
          {/* Vertical QChat Toggle Button - Moved to the left side with corrected text orientation */}
          <button
            onClick={() => setShowQChatPanel(!showQChatPanel)}
            className={`fixed left-0 top-1/2 transform -translate-y-1/2 z-50 flex items-center justify-center p-3 rounded-r-lg transition-all duration-300 ${showQChatPanel ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white'} border border-slate-700 border-l-0 shadow-lg hover:shadow-xl`}
            title="Toggle QChat"
          >
            <Bot size={24} className="transform rotate-90" />
            <span className="transform rotate-90 whitespace-nowrap text-sm font-medium ml-2">
              QChat
            </span>
          </button>
          
          <Navigation />
          
          <div className="container mx-auto px-4 py-6 space-y-8">
            <Toolbar onToggleQChat={() => setShowQChatPanel(!showQChatPanel)} />
            
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

            <div className="grid lg:grid-cols-3 gap-2">
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
                        circuit={circuit}
                        onExplainMatrices={handleExplainMatrices}
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
              
              <div className="lg:col-span-1 space-y-4">
                {renderVisualization()}
              </div>
            </div> 
          </div>
          
          {/* Keyboard Shortcuts Help */}
          <KeyboardShortcutsHelp />
          
          {/* Error Notifications */}
          <ErrorNotification />
        </div>
        
        {/* QChat Side Panel - Now slides from the left */}
        <QChatSidePanel 
          isOpen={showQChatPanel}
          onClose={() => setShowQChatPanel(false)}
          autoQuery={qchatAutoQuery}
        />
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