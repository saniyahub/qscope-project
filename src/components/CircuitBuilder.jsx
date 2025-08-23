import  { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, RotateCcw, Zap, Activity } from 'lucide-react'
import { GateDescriptions } from '../utils/constants'

export default function CircuitBuilder({ circuit, setCircuit, onGateSelect, onSimulate, isSimulating }) {
  const [qubits, setQubits] = useState(3)
  const [selectedGate, setSelectedGate] = useState(null)
  const [draggedGate, setDraggedGate] = useState(null)
  const [hoveredSlot, setHoveredSlot] = useState(null)

  const gates = ['H', 'X', 'Y', 'Z', 'I']
  
  const gateColors = {
    H: 'from-blue-500 to-blue-600',
    X: 'from-red-500 to-red-600', 
    Y: 'from-green-500 to-green-600',
    Z: 'from-purple-500 to-purple-600',
    I: 'from-gray-500 to-gray-600'
  }

  useEffect(() => {
    if (circuit.length > 0) {
      onSimulate()
    }
  }, [circuit])

  const addGate = (qubit, position) => {
    if (!selectedGate) return
    
    const existingGateIndex = circuit.findIndex(g => g.qubit === qubit && g.position === position)
    
    if (existingGateIndex >= 0) {
      const newCircuit = [...circuit]
      newCircuit[existingGateIndex] = { gate: selectedGate, qubit, position, id: Date.now() }
      setCircuit(newCircuit)
    } else {
      const newGate = { gate: selectedGate, qubit, position, id: Date.now() }
      setCircuit([...circuit, newGate])
    }
    onGateSelect?.(selectedGate)
  }

  const removeGate = (gateId) => {
    setCircuit(circuit.filter(g => g.id !== gateId))
  }

  const clearCircuit = () => {
    setCircuit([])
  }

  const handleDragStart = (gate) => {
    setDraggedGate(gate)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (qubit, position) => {
    if (draggedGate) {
      addGateAtPosition(draggedGate, qubit, position)
      setDraggedGate(null)
      setHoveredSlot(null)
    }
  }

  const addGateAtPosition = (gate, qubit, position) => {
    const existingGateIndex = circuit.findIndex(g => g.qubit === qubit && g.position === position)
    
    if (existingGateIndex >= 0) {
      const newCircuit = [...circuit]
      newCircuit[existingGateIndex] = { gate, qubit, position, id: Date.now() }
      setCircuit(newCircuit)
    } else {
      const newGate = { gate, qubit, position, id: Date.now() }
      setCircuit([...circuit, newGate])
    }
    onGateSelect?.(gate)
  }

  const renderCircuitGrid = () => {
    const maxPosition = Math.max(...circuit.map(g => g.position), 7) + 1
    
    return (
      <motion.div 
        className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-2xl overflow-x-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid gap-6 min-w-max">
          {Array.from({ length: qubits }, (_, qubitIndex) => (
            <motion.div 
              key={qubitIndex} 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: qubitIndex * 0.1 }}
            >
              <div className="w-16 text-sm font-semibold text-slate-300 flex items-center">
                <motion.div 
                  className="w-2 h-2 bg-indigo-400 rounded-full mr-2"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    boxShadow: ['0 0 0px rgb(79, 70, 229)', '0 0 10px rgb(79, 70, 229)', '0 0 0px rgb(79, 70, 229)']
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                |q{qubitIndex}⟩
              </div>
              <div className="relative h-1 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 flex-1 rounded-full overflow-visible">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                />
                {Array.from({ length: maxPosition }, (_, position) => {
                  const gate = circuit.find(g => g.qubit === qubitIndex && g.position === position)
                  const isHovered = hoveredSlot?.qubit === qubitIndex && hoveredSlot?.position === position
                  
                  return (
                    <motion.div
                      key={position}
                      className="absolute w-12 h-12 -top-5.5 rounded-lg"
                      style={{ left: `${position * 60}px` }}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(qubitIndex, position)}
                      onDragEnter={() => setHoveredSlot({ qubit: qubitIndex, position })}
                      onDragLeave={() => setHoveredSlot(null)}
                      whileHover={{ scale: 1.1 }}
                      animate={{ scale: isHovered ? 1.1 : 1 }}
                    >
                      <AnimatePresence mode="wait">
                        {gate ? (
                          <motion.button
                            key={gate.id}
                            onClick={() => removeGate(gate.id)}
                            className={`w-full h-full bg-gradient-to-r ${gateColors[gate.gate]} border-2 border-white/20 text-white text-sm font-bold rounded-lg hover:shadow-lg`}
                            title={`${GateDescriptions[gate.gate].name} - Click to remove`}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ 
                              scale: 1, 
                              rotate: 0,
                              boxShadow: ['0 0 0px currentColor', '0 0 20px currentColor', '0 0 0px currentColor']
                            }}
                            exit={{ scale: 0, rotate: 180 }}
                            whileHover={{ 
                              scale: 1.1,
                              boxShadow: '0 0 30px currentColor'
                            }}
                            transition={{ 
                              boxShadow: { repeat: Infinity, duration: 2 }
                            }}
                          >
                            {gate.gate}
                          </motion.button>
                        ) : (
                          <motion.button
                            onClick={() => addGate(qubitIndex, position)}
                            className={`w-full h-full border-2 border-dashed rounded-lg transition-all duration-300 ${
                              isHovered 
                                ? 'border-indigo-400 bg-indigo-400/10' 
                                : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                            }`}
                            title="Drop gate here or click to add"
                            whileHover={{ 
                              borderColor: 'rgb(79, 70, 229)',
                              backgroundColor: 'rgba(79, 70, 229, 0.1)'
                            }}
                            animate={{
                              borderColor: isHovered ? 'rgb(79, 70, 229)' : 'rgb(71, 85, 105)'
                            }}
                          >
                            {selectedGate && (
                              <motion.span 
                                className="text-xs text-slate-500"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                {selectedGate}
                              </motion.span>
                            )}
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div 
        className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Activity className="text-indigo-400" size={24} />
            </motion.div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Circuit Builder
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-lg">
              <label className="text-sm font-medium text-slate-300">Qubits:</label>
              <input
                type="number"
                min="1"
                max="6"
                value={qubits}
                onChange={(e) => setQubits(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                className="w-16 bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <motion.button
              onClick={clearCircuit}
              className="text-red-400 hover:text-red-300 p-2 rounded-lg transition-colors hover:bg-red-400/10"
              title="Clear circuit"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              <RotateCcw size={20} />
            </motion.button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                boxShadow: ['0 0 0px rgb(168, 85, 247)', '0 0 20px rgb(168, 85, 247)', '0 0 0px rgb(168, 85, 247)']
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Zap className="text-purple-400" size={20} />
            </motion.div>
            <span className="text-lg font-semibold text-slate-300">Quantum Gates</span>
            <AnimatePresence>
              {selectedGate && (
                <motion.span 
                  className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  Selected: {selectedGate} ({GateDescriptions[selectedGate].name})
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-3 flex-wrap">
            {gates.map((gate, index) => (
              <motion.div 
                key={gate} 
                className="group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.button
                  draggable
                  onDragStart={() => handleDragStart(gate)}
                  onClick={() => {
                    setSelectedGate(selectedGate === gate ? null : gate)
                    onGateSelect?.(gate)
                  }}
                  className={`px-6 py-3 rounded-lg font-bold text-sm border-2 ${
                    selectedGate === gate
                      ? `bg-gradient-to-r ${gateColors[gate]} border-white/50 shadow-lg`
                      : `bg-gradient-to-r ${gateColors[gate]} border-transparent opacity-80 hover:opacity-100`
                  }`}
                  title={`${GateDescriptions[gate].name} - ${GateDescriptions[gate].description}`}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    scale: selectedGate === gate ? 1.05 : 1,
                    boxShadow: selectedGate === gate ? 
                      ['0 0 0px currentColor', '0 0 20px currentColor', '0 0 0px currentColor'] : 
                      'none'
                  }}
                  transition={{
                    boxShadow: { repeat: selectedGate === gate ? Infinity : 0, duration: 2 }
                  }}
                >
                  {gate}
                </motion.button>
                <motion.div 
                  className="text-xs text-slate-500 text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ y: 10 }}
                  animate={{ y: 0 }}
                >
                  {GateDescriptions[gate].name}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {renderCircuitGrid()}

      <motion.div 
        className="flex items-center justify-between text-sm text-slate-400 bg-slate-900/50 rounded-lg p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <span>Circuit: {circuit.length} gates</span>
          <span>Depth: {Math.max(...circuit.map(g => g.position), -1) + 1}</span>
          <span>Qubits: {qubits}</span>
        </div>
        <div className="text-xs">
          Drag & drop gates or click to build • Real-time simulation
        </div>
      </motion.div>
    </div>
  )
}
 