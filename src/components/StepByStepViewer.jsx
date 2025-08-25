import { useState, useEffect } from 'react'
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Info, Zap, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function StepByStepViewer({ steps, currentStep, onStepChange }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000) // ms per step
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    let interval
    if (isPlaying && steps && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        onStepChange(currentStep + 1)
      }, playbackSpeed)
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }

    return () => clearInterval(interval)
  }, [isPlaying, currentStep, steps, playbackSpeed, onStepChange])

  if (!steps || steps.length === 0) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <Play className="text-blue-400" size={20} />
          <h3 className="text-lg font-semibold">Step-by-Step Analysis</h3>
        </div>
        <div className="text-center py-8">
          <Zap size={48} className="text-slate-600 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400">Simulate a circuit to see step-by-step analysis</p>
          <p className="text-slate-500 text-sm mt-2">Watch how quantum gates transform the state</p>
        </div>
      </div>
    )
  }

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1)
    }
  }

  const resetToStart = () => {
    onStepChange(0)
    setIsPlaying(false)
  }

  const formatProbability = (prob) => {
    return (prob * 100).toFixed(1) + '%'
  }

  const formatComplexNumber = (complex) => {
    if (typeof complex === 'object' && complex.real !== undefined) {
      const real = parseFloat(complex.real || 0).toFixed(3)
      const imag = parseFloat(complex.imag || 0).toFixed(3)
      if (Math.abs(complex.imag) < 0.001) return real
      if (Math.abs(complex.real) < 0.001) return `${imag}i`
      return `${real} ${complex.imag >= 0 ? '+' : ''}${imag}i`
    }
    return complex?.toString() || '0'
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Play className="text-blue-400" size={20} />
          <h3 className="text-lg font-semibold">Step-by-Step Analysis</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Speed:</span>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs"
          >
            <option value={2000}>Slow</option>
            <option value={1000}>Normal</option>
            <option value={500}>Fast</option>
          </select>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-slate-700 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Step {currentStep + 1}</span>
          <span>{steps.length} total steps</span>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex items-center justify-center gap-2 py-2">
        <button
          onClick={resetToStart}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 transition-colors"
          title="Reset to start"
        >
          <RotateCcw size={16} />
        </button>
        
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous step"
        >
          <SkipBack size={16} />
        </button>
        
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={currentStep >= steps.length - 1}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded border border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        
        <button
          onClick={nextStep}
          disabled={currentStep >= steps.length - 1}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next step"
        >
          <SkipForward size={16} />
        </button>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`p-2 rounded border transition-colors ${
            showDetails 
              ? 'bg-green-600 border-green-500 hover:bg-green-700'
              : 'bg-slate-800 border-slate-600 hover:bg-slate-700'
          }`}
          title="Toggle details"
        >
          <Info size={16} />
        </button>
      </div>

      {/* Current Step Information */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Step Header */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {currentStep + 1}
                </div>
                <span className="font-medium text-slate-200">
                  {currentStepData.operation === 'initialization' 
                    ? 'Initialize Quantum State'
                    : `Apply ${currentStepData.operation?.toUpperCase()} Gate`
                  }
                </span>
              </div>
              
              {currentStepData.qubit !== undefined && (
                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                  Qubit {currentStepData.qubit}
                </span>
              )}
            </div>
            
            <p className="text-sm text-slate-300">
              {currentStepData.explanation}
            </p>
          </div>

          {/* Detailed Information */}
          {showDetails && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* State Vector */}
              {currentStepData.state_after && currentStepData.state_after.amplitudes && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">State Vector</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {currentStepData.state_after.amplitudes.map((state, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono">
                          |{state.basis_state || index.toString(2).padStart(2, '0')}⟩
                        </span>
                        <span className="text-slate-300 font-mono">
                          {formatComplexNumber(state.amplitude)}
                        </span>
                        <span className="text-blue-300">
                          {formatProbability(state.amplitude?.probability || state.probability || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bloch Vectors */}
              {currentStepData.state_after && currentStepData.state_after.bloch_vectors && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Bloch Vectors</h4>
                  <div className="space-y-2">
                    {Object.entries(currentStepData.state_after.bloch_vectors).map(([qubit, vector]) => (
                      <div key={qubit} className="text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-400">Qubit {qubit}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-slate-300 font-mono">
                          <div>x: {vector.x?.toFixed(3) || '0.000'}</div>
                          <div>y: {vector.y?.toFixed(3) || '0.000'}</div>
                          <div>z: {vector.z?.toFixed(3) || '0.000'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gate Matrix */}
              {currentStepData.gate_matrix && currentStepData.gate_matrix.matrix && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Gate Matrix</h4>
                  <div className="text-xs text-slate-300 font-mono space-y-1">
                    {currentStepData.gate_matrix.matrix.map((row, i) => (
                      <div key={i} className="flex gap-4">
                        {row.map((element, j) => (
                          <span key={j} className="w-20">
                            {formatComplexNumber(element)}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                  {currentStepData.gate_matrix.description && (
                    <p className="text-xs text-slate-400 mt-2">
                      {currentStepData.gate_matrix.description}
                    </p>
                  )}
                </div>
              )}

              {/* State Metrics */}
              {currentStepData.metrics && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">State Changes</h4>
                  <div className="text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Fidelity:</span>
                      <span className="text-slate-300">
                        {currentStepData.metrics.fidelity?.toFixed(4) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Prob. Change:</span>
                      <span className="text-slate-300">
                        {currentStepData.metrics.total_probability_change?.toFixed(4) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}