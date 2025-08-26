import React from 'react'
import { Info, Zap, Target, Activity } from 'lucide-react'

export default function EntanglementExplanation({ quantumState, circuit }) {
  if (!quantumState || quantumState.entanglement < 0.1) return null
  
  const hasBellState = circuit?.some(g => g.gate === 'H') && circuit?.some(g => g.gate === 'CNOT')
  
  return (
    <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-xl p-4 border border-purple-500/30">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="text-purple-400" size={16} />
        <h3 className="text-sm font-semibold text-purple-300">Quantum Entanglement Explained</h3>
      </div>
      
      <div className="space-y-3 text-xs text-slate-300">
        {hasBellState && (
          <div className="bg-slate-800/50 rounded-lg p-3">
            <h4 className="text-purple-400 font-medium mb-2">🔗 Bell State Created!</h4>
            <p className="leading-relaxed">
              Your H + CNOT circuit created a <strong>Bell state</strong> - the gold standard of quantum entanglement! 
              The qubits are now perfectly correlated: measuring one instantly determines the other's state.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-2">
            <Target className="text-green-400 mt-0.5" size={12} />
            <div>
              <h4 className="font-medium text-green-400">State Analytics</h4>
              <p className="text-slate-400">Shows entanglement strength (0-100%). Bell states achieve ~100%.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Zap className="text-purple-400 mt-0.5" size={12} />
            <div>
              <h4 className="font-medium text-purple-400">Entanglement Network</h4>
              <p className="text-slate-400">Visualizes which qubits are entangled with connecting lines.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Activity className="text-blue-400 mt-0.5" size={12} />
            <div>
              <h4 className="font-medium text-blue-400">Bloch Sphere</h4>
              <p className="text-slate-400">Entangled qubits appear "mixed" (center of sphere).</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-3">
          <h4 className="text-indigo-400 font-medium mb-2">🎯 Measurement Outcomes</h4>
          <p className="leading-relaxed">
            Bell state measurements show <strong>correlated results</strong>: if you measure |0⟩ on qubit 0, 
            you'll definitely get |0⟩ on qubit 1. If |1⟩ on qubit 0, then |1⟩ on qubit 1.
          </p>
        </div>
      </div>
    </div>
  )
}