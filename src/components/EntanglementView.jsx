import { useMemo } from 'react'
import { Zap, Link } from 'lucide-react'

export default function EntanglementView({ quantumState, circuit }) {
  const entanglementData = useMemo(() => {
    if (!quantumState || !quantumState.qubits) return null
    
    const numQubits = quantumState.qubits.length
    
    // Use calculated entangled pairs if available, otherwise fall back to heuristic
    let connections = quantumState.entangledPairs || []
    
    // If no pairs detected but entanglement > 0.1, show generic connections
    if (connections.length === 0 && quantumState.entanglement > 0.1) {
      for (let i = 0; i < numQubits; i++) {
        for (let j = i + 1; j < numQubits; j++) {
          connections.push({
            from: i,
            to: j,
            strength: quantumState.entanglement,
            id: `${i}-${j}`
          })
        }
      }
    }
    
    return { connections, qubits: quantumState.qubits }
  }, [quantumState])

  if (!entanglementData) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="text-purple-400" size={24} />
          <h2 className="text-xl font-bold">Entanglement Network</h2>
        </div>
        <div className="text-center py-12">
          <Link size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Build and simulate a circuit to see entanglement</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="text-purple-400" size={24} />
          <h2 className="text-xl font-bold">Entanglement Network</h2>
        </div>
        <div className="text-sm text-slate-400">
          {entanglementData.connections.length} connections
        </div>
      </div>

      <div className="relative bg-slate-800/50 rounded-lg p-8 min-h-64">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {entanglementData.connections.map((conn) => {
            const fromAngle = (conn.from / entanglementData.qubits.length) * 2 * Math.PI
            const toAngle = (conn.to / entanglementData.qubits.length) * 2 * Math.PI
            const radius = 80
            const centerX = 120
            const centerY = 120
            
            const x1 = centerX + Math.cos(fromAngle) * radius
            const y1 = centerY + Math.sin(fromAngle) * radius
            const x2 = centerX + Math.cos(toAngle) * radius
            const y2 = centerY + Math.sin(toAngle) * radius
            
            return (
              <line
                key={conn.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={`rgba(147, 51, 234, ${conn.strength})`}
                strokeWidth={2 + conn.strength * 3}
                filter="url(#glow)"
                className="animate-pulse"
              />
            )
          })}
          
          {entanglementData.qubits.map((_, index) => {
            const angle = (index / entanglementData.qubits.length) * 2 * Math.PI
            const radius = 80
            const centerX = 120
            const centerY = 120
            
            const x = centerX + Math.cos(angle) * radius
            const y = centerY + Math.sin(angle) * radius
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="12"
                  fill="rgb(99, 102, 241)"
                  filter="url(#glow)"
                  className="animate-pulse"
                />
                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-white font-bold"
                >
                  {index}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Entangled Pairs</h3>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {entanglementData.connections.length > 0 ? (
            entanglementData.connections.map((conn) => (
              <div key={conn.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Qubit {conn.from} ↔ Qubit {conn.to}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {(conn.strength * 100).toFixed(1)}%
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No significant entanglement detected</p>
          )}
        </div>
      </div>
    </div>
  )
}
 