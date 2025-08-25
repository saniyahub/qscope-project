import { BookOpen, Info, Lightbulb } from 'lucide-react'
import { GateDescriptions } from '../utils/constants'
import { useAppContext } from '../context/AppContext'

export default function LearningPanel() {
  const { selectedGate, circuit } = useAppContext()
  const getCircuitExplanation = () => {
    if (circuit.length === 0) return "Start by selecting a gate and adding it to your circuit."
    
    const sortedGates = [...circuit].sort((a, b) => a.position - b.position)
    const steps = []
    
    sortedGates.forEach((gate, index) => {
      const desc = GateDescriptions[gate.gate]
      steps.push(
        `Step ${index + 1}: Apply ${desc.name} gate to qubit ${gate.qubit}. ${desc.description}`
      )
    })
    
    return steps
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="text-purple-400" size={24} />
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Learning Mode
        </h2>
      </div>

      {selectedGate && (
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Info className="text-purple-400" size={16} />
            <h3 className="font-semibold text-purple-300">
              {GateDescriptions[selectedGate].name} Gate ({selectedGate})
            </h3>
          </div>
          <p className="text-sm text-slate-300 mb-2">
            {GateDescriptions[selectedGate].description}
          </p>
          <p className="text-xs text-slate-400">
            <strong>Effect:</strong> {GateDescriptions[selectedGate].effect}
          </p>
        </div>
      )}

      <div className="bg-slate-800/50 rounded-lg p-4 border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="text-indigo-400" size={16} />
          <h3 className="font-semibold text-indigo-300">Circuit Explanation</h3>
        </div>
        
        {typeof getCircuitExplanation() === 'string' ? (
          <p className="text-sm text-slate-300">{getCircuitExplanation()}</p>
        ) : (
          <div className="space-y-2">
            {getCircuitExplanation().map((step, index) => (
              <div key={index} className="text-sm text-slate-300 flex">
                <span className="text-indigo-400 mr-2">•</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-slate-500">
        💡 Tip: Try adding an H gate followed by an X gate to see superposition and bit flip effects!
      </div>
    </div>
  )
}
 