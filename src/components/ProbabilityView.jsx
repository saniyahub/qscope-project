import { useMemo } from 'react'
import { BarChart, Activity } from 'lucide-react'

export default function ProbabilityView({ quantumState }) {
  const probabilityData = useMemo(() => {
    if (!quantumState?.measurementProbabilities) return null
    
    return quantumState.measurementProbabilities
      .map((prob, index) => ({
        state: index.toString(2).padStart(Math.ceil(Math.log2(quantumState.measurementProbabilities.length)), '0'),
        probability: prob,
        index
      }))
      .filter(item => item.probability > 0.001)
      .sort((a, b) => b.probability - a.probability)
  }, [quantumState])

  if (!probabilityData) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-6">
          <BarChart className="text-indigo-400" size={24} />
          <h2 className="text-xl font-bold">Measurement Probabilities</h2>
        </div>
        <div className="text-center py-12">
          <Activity size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Simulate circuit to see probabilities</p>
        </div>
      </div>
    )
  }

  const maxProb = Math.max(...probabilityData.map(d => d.probability))

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart className="text-indigo-400" size={24} />
          <h2 className="text-xl font-bold">Measurement Probabilities</h2>
        </div>
        <div className="text-sm text-slate-400">
          {probabilityData.length} states
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {probabilityData.slice(0, 16).map((item, index) => (
          <div key={item.index} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-mono text-slate-300">
                |{item.state}⟩
              </span>
              <span className="text-sm font-semibold text-indigo-400">
                {(item.probability * 100).toFixed(2)}%
              </span>
            </div>
            <div className="relative bg-slate-800 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 relative overflow-hidden"
                style={{ width: `${(item.probability / maxProb) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {probabilityData.length > 16 && (
        <div className="mt-4 text-xs text-slate-500 text-center">
          Showing top 16 most probable states
        </div>
      )}

      <div className="mt-6 bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Distribution Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Total States:</span>
            <span className="ml-2 font-mono">{probabilityData.length}</span>
          </div>
          <div>
            <span className="text-slate-400">Max Probability:</span>
            <span className="ml-2 font-mono">{(maxProb * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
 