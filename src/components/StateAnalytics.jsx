import  { useMemo } from 'react' 
import { BarChart, Activity, Target, Zap } from 'lucide-react'

export  default function StateAnalytics({ quantumState, circuit }) { 
  const analytics = useMemo(() => {
    if (!quantumState) return null
    
    return {
      entanglement: quantumState.entanglement || 0,
      purity: quantumState.purity || 1,
      fidelity: quantumState.fidelity || 1,
      probabilities: quantumState.measurementProbabilities || []
    }
  }, [quantumState])

  const renderMetric = (icon, label, value, color = 'indigo') => (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-slate-300">{label}</span>
        </div>
        <span className="text-lg font-bold">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full bg-${color}-500 transition-all duration-500`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  )

   return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="text-green-400" size={24} />
        <h2 className="text-xl font-bold">State Analytics</h2>
      </div> 

             {!analytics ? (
        <div className="text-center py-8">
          <BarChart size={64} className="text-slate-600 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400 text-lg">Simulate circuit to view analytics</p>
          <p className="text-slate-500 text-sm mt-2">Track quantum state properties</p>
        </div> 
      ) : (
        <div className="space-y-4">
          {renderMetric(
            <Zap size={16} className="text-purple-400" />,
            'Entanglement',
            analytics.entanglement,
            'purple'
          )}
          
          {renderMetric(
            <Target size={16} className="text-green-400" />,
            'Purity',
            analytics.purity,
            'green'
          )}
          
          {renderMetric(
            <Activity size={16} className="text-blue-400" />,
            'Fidelity', 
            analytics.fidelity,
            'blue'
          )}

          {analytics.probabilities.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Measurement Probabilities</h3>
              <div className="space-y-2">
                {analytics.probabilities.slice(0, 8).map((prob, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 w-12">
                      |{index.toString(2).padStart(Math.log2(analytics.probabilities.length)).padStart(3, '0')}⟩
                    </span>
                    <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${(prob * 100).toFixed(1)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-300 w-12">
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
                   )}

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 mt-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Circuit Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Gates:</span>
                <span className="font-mono">{circuit?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Depth:</span>
                <span className="font-mono">{circuit?.length > 0 ? Math.max(...circuit.map(g => g.position)) + 1 : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Qubits:</span>
                <span className="font-mono">{quantumState?.qubits?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">States:</span>
                <span className="font-mono">{analytics?.probabilities?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div> 
  )
}
 