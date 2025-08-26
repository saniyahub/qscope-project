import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Zap, Activity, Sparkles, BookOpen, CheckCircle, AlertTriangle, Info, Lightbulb } from 'lucide-react'
import { GateDescriptions } from '../utils/constants'
import { useAppContext } from '../context/AppContext'

export default function CircuitBuilder() {
  const {
    circuit,
    isSimulating,
    selectedGate,
    actions,
    settings
  } = useAppContext()
  
  const [qubits, setQubits] = useState(settings.defaultQubits || 3)
  const [localSelectedGate, setLocalSelectedGate] = useState(null)
  const [draggedGate, setDraggedGate] = useState(null)
  const [hoveredSlot, setHoveredSlot] = useState(null)

  const gates = ['H', 'X', 'Y', 'Z', 'I', 'CNOT']
  
  // Categorized gates with colors and descriptions
  const gateCategories = {
    'Superposition': {
      gates: ['H'],
      color: 'from-blue-500 to-blue-600',
      icon: '⚖️',
      description: 'Creates quantum superposition'
    },
    'Pauli Gates': {
      gates: ['X', 'Y', 'Z'],
      color: 'from-red-500 to-red-600',
      icon: '🔄',
      description: 'Fundamental quantum rotations'
    },
    'Two-Qubit Gates': {
      gates: ['CNOT'],
      color: 'from-purple-500 to-purple-600',
      icon: '🔗',
      description: 'Multi-qubit operations'
    },
    'Identity': {
      gates: ['I'],
      color: 'from-gray-500 to-gray-600',
      icon: '⏸️',
      description: 'No operation (identity)'
    }
  }
  
  // Preset quantum circuits for quick start
  const presetCircuits = {
    'Bell State': {
      name: 'Bell State (Entanglement)',
      description: 'Creates maximum entanglement between 2 qubits',
      icon: '🔗',
      requiredQubits: 2,
      circuit: [
        { gate: 'H', qubit: 0, position: 0, id: 'preset_h_0' },
        { gate: 'CNOT', qubit: 0, targetQubit: 1, position: 1, id: 'preset_cnot_0_1' }
      ]
    },
    'GHZ State': {
      name: 'GHZ State (3-Qubit)',
      description: 'Greenberger-Horne-Zeilinger maximally entangled state',
      icon: '🌐',
      requiredQubits: 3,
      circuit: [
        { gate: 'H', qubit: 0, position: 0, id: 'preset_h_0' },
        { gate: 'CNOT', qubit: 0, targetQubit: 1, position: 1, id: 'preset_cnot_0_1' },
        { gate: 'CNOT', qubit: 0, targetQubit: 2, position: 2, id: 'preset_cnot_0_2' }
      ]
    },
    'Superposition': {
      name: 'Superposition Demo',
      description: 'All qubits in equal superposition',
      icon: '⚖️',
      requiredQubits: 2,
      circuit: [
        { gate: 'H', qubit: 0, position: 0, id: 'preset_h_0' },
        { gate: 'H', qubit: 1, position: 0, id: 'preset_h_1' }
      ]
    },
    'Quantum Flip': {
      name: 'Quantum NOT Demo',
      description: 'Demonstrates X gate (quantum NOT)',
      icon: '🔄',
      requiredQubits: 1,
      circuit: [
        { gate: 'X', qubit: 0, position: 0, id: 'preset_x_0' }
      ]
    }
  }
  
  const gateColors = {
    H: 'from-blue-500 to-blue-600',
    X: 'from-red-500 to-red-600', 
    Y: 'from-red-500 to-red-600',
    Z: 'from-red-500 to-red-600',
    I: 'from-gray-500 to-gray-600',
    CNOT: 'from-purple-500 to-purple-600'
  }

  useEffect(() => {
    if (circuit.length > 0 && settings.autoSimulate) {
      // Debounce simulation to prevent excessive re-renders
      const timeoutId = setTimeout(() => {
        actions.simulateCircuit()
      }, 300)
      
      return () => clearTimeout(timeoutId)
    }
  }, [circuit, settings.autoSimulate])

  const addGate = (qubit, position) => {
    if (!localSelectedGate) return
    
    if (localSelectedGate === 'CNOT') {
      // For CNOT, we need to select target qubit
      // For now, default to next qubit (can be enhanced with UI selection)
      const targetQubit = (qubit + 1) % qubits
      const newGate = { 
        gate: localSelectedGate, 
        qubit, // control qubit
        targetQubit,
        position, 
        id: Date.now() 
      }
      actions.addGateToCircuit(newGate)
    } else {
      const newGate = { 
        gate: localSelectedGate, 
        qubit, 
        position, 
        id: Date.now() 
      }
      actions.addGateToCircuit(newGate)
    }
    
    actions.setSelectedGate(localSelectedGate)
  }

  const removeGate = (gateId) => {
    actions.removeGateFromCircuit(gateId)
  }

  const clearCircuit = () => {
    actions.clearCircuit()
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
    if (gate === 'CNOT') {
      const targetQubit = (qubit + 1) % qubits
      const newGate = { 
        gate, 
        qubit, // control qubit
        targetQubit,
        position, 
        id: Date.now() 
      }
      actions.addGateToCircuit(newGate)
    } else {
      const newGate = { gate, qubit, position, id: Date.now() }
      actions.addGateToCircuit(newGate)
    }
    actions.setSelectedGate(gate)
  }

  const loadPresetCircuit = (presetKey) => {
    const preset = presetCircuits[presetKey]
    if (!preset) return
    
    // Ensure we have enough qubits
    if (qubits < preset.requiredQubits) {
      setQubits(preset.requiredQubits)
    }
    
    // Clear current circuit and load preset
    actions.clearCircuit()
    
    // Add preset gates with small delay for visual effect
    setTimeout(() => {
      preset.circuit.forEach((gate, index) => {
        setTimeout(() => {
          const newGate = { 
            ...gate, 
            id: Date.now() + index // Ensure unique IDs
          }
          actions.addGateToCircuit(newGate)
        }, index * 100) // Stagger gate additions
      })
    }, 100)
  }

  // Circuit validation and hints
  const validateCircuit = () => {
    const validation = {
      status: 'valid', // 'valid', 'warning', 'error', 'empty'
      messages: [],
      hints: []
    }

    if (circuit.length === 0) {
      validation.status = 'empty'
      validation.hints = [
        'Start by selecting a gate and clicking on the circuit grid',
        'Try the Bell State preset for a quick entanglement demo',
        'H gate creates superposition, X gate flips qubits'
      ]
      return validation
    }

    // Check for common patterns and provide educational hints
    const hasHadamard = circuit.some(g => g.gate === 'H')
    const hasCNOT = circuit.some(g => g.gate === 'CNOT')
    const hasEntanglement = hasHadamard && hasCNOT
    const hasPauliGates = circuit.some(g => ['X', 'Y', 'Z'].includes(g.gate))
    
    if (hasEntanglement) {
      validation.messages.push('Great! This circuit creates entanglement between qubits')
    }
    
    if (hasCNOT && !hasHadamard) {
      validation.hints.push('Add H gate before CNOT to create superposition and entanglement')
    }
    
    if (hasHadamard && !hasCNOT && qubits > 1) {
      validation.hints.push('Try adding CNOT gate to create entanglement between qubits')
    }

    
    if (hasHadamard && !hasPauliGates) {
      validation.hints.push('Add X, Y, or Z gates to create interesting quantum states')
    }
    
    if (circuit.length === 1) {
      validation.hints.push('Single gate circuits are perfect for learning basics')
    }
    
    if (circuit.length > 5) {
      validation.messages.push('Complex circuit! Great for exploring quantum algorithms')
    }

    // Check for unusual patterns
    const identityGates = circuit.filter(g => g.gate === 'I')
    if (identityGates.length > 2) {
      validation.status = 'warning'
      validation.messages.push('Many identity gates detected - they don\'t change the state')
    }

    return validation
  }

  const circuitValidation = validateCircuit()

  const renderCircuitGrid = () => {
    const maxPosition = Math.max(...circuit.map(g => g.position), 9) + 1
    
    return (
      <motion.div 
        className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 shadow-2xl overflow-x-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid gap-10 min-w-max relative">
          {/* CNOT connection lines */}
          {circuit.filter(g => g.gate === 'CNOT').map(gate => {
            const controlY = gate.qubit * (64 + 40) // 64px row height + 40px gap
            const targetY = gate.targetQubit * (64 + 40)
            const x = gate.position * 80
            
            return (
              <div
                key={`cnot-line-${gate.id}`}
                className="absolute w-0.5 bg-purple-400 z-15"
                style={{
                  left: `${x + 140}px`, // Offset for qubit label width + half gate width
                  top: `${Math.min(controlY, targetY) + 32}px`, // Start from center of first qubit
                  height: `${Math.abs(targetY - controlY)}px`
                }}
              />
            )
          })}
          
          {Array.from({ length: qubits }, (_, qubitIndex) => (
            <motion.div 
              key={qubitIndex} 
              className="flex items-center gap-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: qubitIndex * 0.1 }}
            >
              <div className="w-24 text-base font-semibold text-slate-300 flex items-center">
                <motion.div 
                  className="w-3 h-3 bg-indigo-400 rounded-full mr-3"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    boxShadow: ['0 0 0px rgb(79, 70, 229)', '0 0 15px rgb(79, 70, 229)', '0 0 0px rgb(79, 70, 229)']
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                |q{qubitIndex}⟩
              </div>
              <div className="relative flex-1 overflow-visible">
                {/* Main wire line that goes through gates */}
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-indigo-500/40 to-purple-500/40 transform -translate-y-1/2 z-10" />
                <motion.div 
                  className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 transform -translate-y-1/2 z-10"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                />
                
                {/* Gate positions */}
                <div className="relative h-16 flex items-center">
                  {Array.from({ length: maxPosition }, (_, position) => {
                    const gate = circuit.find(g => g.qubit === qubitIndex && g.position === position)
                    const cnotGate = circuit.find(g => g.gate === 'CNOT' && g.position === position && (g.qubit === qubitIndex || g.targetQubit === qubitIndex))
                    const isHovered = hoveredSlot?.qubit === qubitIndex && hoveredSlot?.position === position
                    
                    return (
                      <motion.div
                        key={position}
                        className="absolute w-14 h-14 rounded-lg flex items-center justify-center"
                        style={{ left: `${position * 80}px`, transform: 'translateX(-50%)' }}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(qubitIndex, position)}
                        onDragEnter={() => setHoveredSlot({ qubit: qubitIndex, position })}
                        onDragLeave={() => setHoveredSlot(null)}
                        whileHover={{ scale: 1.1 }}
                        animate={{ scale: isHovered ? 1.1 : 1 }}
                      >
                        <AnimatePresence mode="wait">
                          {gate && gate.gate !== 'CNOT' ? (
                            // Regular single-qubit gates
                            <motion.button
                              key={gate.id}
                              onClick={() => removeGate(gate.id)}
                              className={`w-full h-full bg-gradient-to-r ${gateColors[gate.gate]} border-2 border-white/30 text-white text-xs font-bold rounded-lg hover:shadow-lg relative z-20`}
                              title={`${GateDescriptions[gate.gate].name} - Click to remove`}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ 
                                scale: 1, 
                                rotate: 0,
                                boxShadow: ['0 0 0px currentColor', '0 0 25px currentColor', '0 0 0px currentColor']
                              }}
                              exit={{ scale: 0, rotate: 180 }}
                              whileHover={{ 
                                scale: 1.15,
                                boxShadow: '0 0 35px currentColor'
                              }}
                              transition={{ 
                                boxShadow: { repeat: Infinity, duration: 2 }
                              }}
                            >
                              {gate.gate}
                            </motion.button>
                          ) : cnotGate ? (
                            // CNOT gate display on both control and target qubits
                            <motion.button
                              key={cnotGate.id}
                              onClick={() => removeGate(cnotGate.id)}
                              className="w-full h-full bg-gradient-to-r from-purple-500 to-purple-600 border-2 border-white/30 text-white text-xs font-bold rounded-lg hover:shadow-lg relative z-20"
                              title={`${GateDescriptions.CNOT.name} - Control: q${cnotGate.qubit}, Target: q${cnotGate.targetQubit} - Click to remove`}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ 
                                scale: 1, 
                                rotate: 0,
                                boxShadow: ['0 0 0px currentColor', '0 0 25px currentColor', '0 0 0px currentColor']
                              }}
                              exit={{ scale: 0, rotate: 180 }}
                              whileHover={{ 
                                scale: 1.15,
                                boxShadow: '0 0 35px currentColor'
                              }}
                              transition={{ 
                                boxShadow: { repeat: Infinity, duration: 2 }
                              }}
                            >
                              {cnotGate.qubit === qubitIndex ? (
                                // Control qubit (solid black dot)
                                <div className="w-4 h-4 bg-white rounded-full mx-auto" />
                              ) : (
                                // Target qubit (circle with plus)
                                <div className="flex items-center justify-center h-full">
                                  <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                                    <span className="text-xs">⊕</span>
                                  </div>
                                </div>
                              )}
                            </motion.button>
                          ) : (
                            // Empty slot
                            <motion.button
                              onClick={() => addGate(qubitIndex, position)}
                              className={`w-full h-full border-2 border-dashed rounded-lg transition-all duration-300 relative z-20 ${
                                isHovered 
                                  ? 'border-indigo-400 bg-indigo-400/15' 
                                  : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                              }`}
                              title="Drop gate here or click to add"
                              whileHover={{ 
                                borderColor: 'rgb(79, 70, 229)',
                                backgroundColor: 'rgba(79, 70, 229, 0.15)'
                              }}
                              animate={{
                                borderColor: isHovered ? 'rgb(79, 70, 229)' : 'rgb(71, 85, 105)'
                              }}
                            >
                              {localSelectedGate && (
                                <motion.span 
                                  className="text-sm text-slate-400 font-medium"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                >
                                  {localSelectedGate}
                                </motion.span>
                              )}
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>
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
              {localSelectedGate && (
                <motion.span 
                  className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  Selected: {localSelectedGate} ({GateDescriptions[localSelectedGate].name})
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="space-y-6">
            {Object.entries(gateCategories).map(([categoryName, category], categoryIndex) => (
              <motion.div 
                key={categoryName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.2 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg">{category.icon}</span>
                  <h3 className="text-sm font-semibold text-slate-300">{categoryName}</h3>
                  <span className="text-xs text-slate-500">{category.description}</span>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {category.gates.map((gate, gateIndex) => (
                    <motion.div 
                      key={gate} 
                      className="group"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: categoryIndex * 0.2 + gateIndex * 0.1 }}
                    >
                      <motion.button
                        draggable
                        onDragStart={() => handleDragStart(gate)}
                        onClick={() => {
                          setLocalSelectedGate(localSelectedGate === gate ? null : gate)
                          actions.setSelectedGate(gate)
                        }}
                        className={`px-6 py-3 rounded-lg font-bold text-sm border-2 transition-all duration-300 ${
                          localSelectedGate === gate
                            ? `bg-gradient-to-r ${gateColors[gate]} border-white/50 shadow-lg ring-2 ring-white/20`
                            : `bg-gradient-to-r ${gateColors[gate]} border-transparent opacity-80 hover:opacity-100 hover:shadow-lg`
                        }`}
                        title={`${GateDescriptions[gate].name} - ${GateDescriptions[gate].description}`}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                        }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                          scale: localSelectedGate === gate ? 1.05 : 1,
                          boxShadow: localSelectedGate === gate ? 
                            ['0 0 0px currentColor', '0 0 20px currentColor', '0 0 0px currentColor'] : 
                            'none'
                        }}
                        transition={{
                          boxShadow: { repeat: localSelectedGate === gate ? Infinity : 0, duration: 2 }
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
              </motion.div>
            ))}
          </div>
        </div>

        {/* Preset Circuits Section */}
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Sparkles className="text-yellow-400" size={20} />
            </motion.div>
            <span className="text-lg font-semibold text-slate-300">Quick Start Templates</span>
            <motion.div 
              className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <BookOpen size={12} className="inline mr-1" />
              Click to load famous quantum circuits
            </motion.div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(presetCircuits).map(([key, preset], index) => (
              <motion.button
                key={key}
                onClick={() => loadPresetCircuit(key)}
                className="bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600 hover:border-slate-500 rounded-lg p-3 text-left transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  borderColor: 'rgb(79, 70, 229)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{preset.icon}</span>
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">
                    {preset.name}
                  </span>
                </div>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-2">
                  {preset.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Qubits:</span>
                  <span className="text-xs font-mono text-indigo-400">{preset.requiredQubits}</span>
                  <span className="text-xs text-slate-500">Gates:</span>
                  <span className="text-xs font-mono text-purple-400">{preset.circuit.length}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {renderCircuitGrid()}

      <motion.div 
        className="bg-slate-900/50 rounded-lg p-4 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* Circuit Stats */}
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-4">
            <span>Circuit: {circuit.length} gates</span>
            <span>Depth: {Math.max(...circuit.map(g => g.position), -1) + 1}</span>
            <span>Qubits: {qubits}</span>
          </div>
          <div className="text-xs">
            Drag & drop gates or click to build • Real-time simulation
          </div>
        </div>

        {/* Circuit Validation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={circuitValidation.status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {/* Status Messages */}
            {circuitValidation.messages.length > 0 && (
              <div className="flex items-start gap-2">
                {circuitValidation.status === 'valid' && <CheckCircle className="text-green-400 mt-0.5" size={16} />}
                {circuitValidation.status === 'warning' && <AlertTriangle className="text-yellow-400 mt-0.5" size={16} />}
                {circuitValidation.status === 'error' && <AlertTriangle className="text-red-400 mt-0.5" size={16} />}
                <div className="space-y-1">
                  {circuitValidation.messages.map((message, index) => (
                    <p key={index} className={`text-xs ${
                      circuitValidation.status === 'valid' ? 'text-green-400' :
                      circuitValidation.status === 'warning' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Hints */}
            {circuitValidation.hints.length > 0 && (
              <div className="flex items-start gap-2">
                <Lightbulb className="text-blue-400 mt-0.5" size={16} />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-blue-400">Tips:</p>
                  {circuitValidation.hints.map((hint, index) => (
                    <p key={index} className="text-xs text-slate-400">
                      • {hint}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
 