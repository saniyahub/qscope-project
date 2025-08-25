import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Zap } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

export default function AnimatedCircuit() {
  const { circuit, actions } = useAppContext()
  const [animationState, setAnimationState] = useState('idle')
  const [currentStep, setCurrentStep] = useState(0)
  const [signals, setSignals] = useState([])

  const qubits = 3
  const maxPosition = Math.max(...circuit.map(g => g.position), 9) + 1

  const executeAnimation = async () => {
    setAnimationState('running')
    setCurrentStep(0)
    
    const sortedGates = [...circuit].sort((a, b) => a.position - b.position)
    const positions = [...new Set(sortedGates.map(g => g.position))].sort((a, b) => a - b)
    
    for (let pos of positions) {
      setCurrentStep(pos)
      
      // Create signals for this position
      const newSignals = Array.from({ length: qubits }, (_, i) => ({
        id: `signal-${pos}-${i}`,
        qubit: i,
        position: pos
      }))
      setSignals(newSignals)
      
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 800))
    }
    
    setSignals([])
    setAnimationState('complete')
    actions.simulateCircuit()
    
    setTimeout(() => setAnimationState('idle'), 1000)
  }

  const resetAnimation = () => {
    setAnimationState('idle')
    setCurrentStep(0)
    setSignals([])
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="text-yellow-400" size={24} />
          <h2 className="text-xl font-bold">Animated Circuit</h2>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={executeAnimation}
            disabled={animationState === 'running' || circuit.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Play size={16} />
            Execute
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetAnimation}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
          </motion.button>
        </div>
      </div>

      <div className="relative bg-slate-800/50 rounded-lg p-8 overflow-x-auto">
        <div className="space-y-10 min-w-max">
          {Array.from({ length: qubits }, (_, qubitIndex) => (
            <div key={qubitIndex} className="relative">
              <div className="flex items-center gap-6">
                <motion.div 
                  className="w-24 text-base font-semibold text-slate-300 flex items-center"
                  animate={{ 
                    textShadow: animationState === 'running' ? '0 0 10px rgb(79, 70, 229)' : 'none'
                  }}
                >
                  <motion.div 
                    className="w-3 h-3 bg-indigo-400 rounded-full mr-3"
                    animate={{ 
                      scale: animationState === 'running' ? [1, 1.3, 1] : 1,
                      boxShadow: animationState === 'running' ? '0 0 20px rgb(79, 70, 229)' : 'none'
                    }}
                    transition={{ repeat: animationState === 'running' ? Infinity : 0, duration: 1 }}
                  />
                  |q{qubitIndex}⟩
                </motion.div>

                <div className="relative flex-1">
                  {/* Main wire that goes through gate centers */}
                  <div className="absolute left-0 right-0 top-1/2 h-0.5 transform -translate-y-1/2 z-10">
                    <motion.div 
                      className="w-full h-full bg-gradient-to-r from-indigo-500/40 to-purple-500/40 rounded-full"
                      animate={{
                        boxShadow: animationState === 'running' ? 
                          '0 0 20px rgb(79, 70, 229), 0 0 40px rgb(79, 70, 229)' : 
                          'none'
                      }}
                    />
                  </div>

                  {/* Animated signal */}
                  <AnimatePresence>
                    {signals.find(s => s.qubit === qubitIndex) && (
                      <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ 
                          x: `${maxPosition * 80}px`, 
                          opacity: [0, 1, 1, 0],
                          scale: [0.8, 1.2, 1, 0.8]
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full shadow-lg z-30"
                        style={{
                          boxShadow: '0 0 20px rgb(251, 191, 36), 0 0 40px rgb(251, 191, 36)'
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Gates positioned on the wire */}
                  <div className="relative h-16 flex items-center">
                    {Array.from({ length: maxPosition }, (_, position) => {
                      const gate = circuit.find(g => g.qubit === qubitIndex && g.position === position)
                      const isActive = animationState === 'running' && position === currentStep
                      
                      return (
                        <motion.div
                          key={position}
                          className="absolute w-14 h-14 flex items-center justify-center"
                          style={{ left: `${position * 80}px`, transform: 'translateX(-50%)' }}
                          animate={{
                            scale: isActive ? [1, 1.2, 1] : 1,
                            rotate: isActive ? [0, 360] : 0,
                            boxShadow: isActive ? 
                              '0 0 30px rgb(239, 68, 68), 0 0 60px rgb(239, 68, 68)' : 
                              'none'
                          }}
                          transition={{ duration: 0.8 }}
                        >
                          {gate && (
                            <motion.div
                              className="w-full h-full bg-gradient-to-r from-red-500 to-red-600 text-white text-base font-bold rounded-lg flex items-center justify-center border-2 border-white/20 relative z-20"
                              animate={{
                                backgroundColor: isActive ? 
                                  ['rgb(239, 68, 68)', 'rgb(251, 191, 36)', 'rgb(239, 68, 68)'] : 
                                  'rgb(239, 68, 68)'
                              }}
                              transition={{ duration: 0.8 }}
                            >
                              {gate.gate}
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex gap-4">
          <span className="text-slate-400">Status: {animationState}</span>
          <span className="text-slate-400">Step: {currentStep + 1}/{maxPosition}</span>
        </div>
        <div className="text-xs text-slate-500">
          Watch quantum signals flow through gates
        </div>
      </div>
    </div>
  )
}
 