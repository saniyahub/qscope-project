import { useMemo, useState, useEffect } from 'react' 
import { BarChart, Activity, Target, Zap, Brain, TrendingUp, AlertCircle } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import backendClient from '../services/backendClient'
import ResizablePanel from './ResizablePanel'

export default function StateAnalytics() { 
  const { quantumState, circuit } = useAppContext() 
  const [detailedAnalysis, setDetailedAnalysis] = useState(null)
  const [educationalContent, setEducationalContent] = useState(null)
  const [backendAvailable, setBackendAvailable] = useState(false)
  const [loading, setLoading] = useState(false)
  const [panelSize, setPanelSize] = useState({
    width: parseInt(localStorage.getItem('stateAnalyticsWidth')) || 500,
    height: parseInt(localStorage.getItem('stateAnalyticsHeight')) || 600
  })
  
  // Check backend availability
  useEffect(() => {
    const checkBackend = async () => {
      const available = await backendClient.isBackendAvailable()
      setBackendAvailable(available)
    }
    checkBackend()
  }, [])
  
  // Enhanced analytics with backend integration
  useEffect(() => {
    const analyzeCircuit = async () => {
      if (!circuit || circuit.length === 0 || !backendAvailable) {
        setDetailedAnalysis(null);
        setEducationalContent(null);
        return;
      }
      
      setLoading(true);
      try {
        const [analysis, education] = await Promise.all([
          backendClient.getRealTimeAnalysis({ gates: circuit }),
          backendClient.getEducationalContent({ gates: circuit }, 'intermediate')
        ]);
        
        if (analysis.success) {
          setDetailedAnalysis(analysis);
        }
        
        if (education.success || education.current_concepts) {
          setEducationalContent(education);
        }
      } catch (error) {
        console.warn('Backend analysis failed, using local analytics:', error.message);
        setDetailedAnalysis(null);
        setEducationalContent(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce the analysis
    const timeoutId = setTimeout(analyzeCircuit, 500);
    return () => clearTimeout(timeoutId);
  }, [circuit, backendAvailable]); 
  
  const handleResize = (event, { size }) => {
    setPanelSize(size);
    localStorage.setItem('stateAnalyticsWidth', size.width);
    localStorage.setItem('stateAnalyticsHeight', size.height);
  };
  
  const analytics = useMemo(() => {
    if (!quantumState) return null;
    
    // Use backend analysis if available, otherwise fallback to local
    const backendMetrics = detailedAnalysis?.analysis?.metrics;
    
    if (backendMetrics?.basic_metrics) {
      return {
        entanglement: backendMetrics.entanglement_metrics?.total_entanglement || quantumState.entanglement || 0,
        purity: backendMetrics.basic_metrics.purity || quantumState.purity || 1,
        fidelity: backendMetrics.basic_metrics.ground_state_fidelity || quantumState.fidelity || 1,
        probabilities: quantumState.measurementProbabilities || [],
        advanced: {
          von_neumann_entropy: backendMetrics.basic_metrics.von_neumann_entropy || 0,
          linear_entropy: backendMetrics.basic_metrics.linear_entropy || 0,
          coherence: backendMetrics.coherence_metrics?.l1_norm_coherence || 0
        }
      };
    }
    
    return {
      entanglement: quantumState.entanglement || 0,
      purity: quantumState.purity || 1,
      fidelity: quantumState.fidelity || 1,
      probabilities: quantumState.measurementProbabilities || [],
      advanced: {
        von_neumann_entropy: detailedAnalysis?.analysis?.metrics?.basic_metrics?.von_neumann_entropy || 0,
        linear_entropy: detailedAnalysis?.analysis?.metrics?.basic_metrics?.linear_entropy || 0,
        coherence: detailedAnalysis?.analysis?.metrics?.coherence_metrics?.l1_norm_coherence || 0
      }
    };
  }, [quantumState, detailedAnalysis])

  const renderMetric = (icon, label, value, color = 'indigo') => {
    const colorClasses = {
      indigo: 'bg-indigo-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      teal: 'bg-teal-500'
    }
    
    return (
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-xs font-medium text-slate-300 truncate">{label}</span>
        </div>
        <div className="text-lg font-bold mb-2">{(value * 100).toFixed(1)}%</div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${colorClasses[color] || colorClasses.indigo} transition-all duration-500`}
            style={{ width: `${value * 100}%` }}
          />
        </div>
      </div>
    )
  }

   return (
    <ResizablePanel
      width={panelSize.width}
      height={panelSize.height}
      minWidth={350}
      minHeight={400}
      maxWidth={800}
      maxHeight={1000}
      onResizeStop={handleResize}
    >
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-2xl h-full">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="text-green-400" size={24} />
          <h2 className="text-xl font-bold">State Analytics</h2>
        </div> 

        {!analytics ? (
          <div className="text-center py-8">
            <BarChart size={48} className="text-slate-600 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-400 text-base">Simulate circuit to view analytics</p>
            <p className="text-slate-500 text-sm mt-2">Track quantum state properties</p>
          </div> 
        ) : (
          <div className="space-y-6">
            {/* Enhanced metrics row with backend data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderMetric(
                <Zap size={14} className="text-purple-400" />,
                'Entanglement',
                analytics.entanglement,
                'purple'
              )}
              
              {renderMetric(
                <Target size={14} className="text-green-400" />,
                'Purity',
                analytics.purity,
                'green'
              )}
              
              {renderMetric(
                <Activity size={14} className="text-blue-400" />,
                'Fidelity', 
                analytics.fidelity,
                'blue'
              )}
            </div>

            {/* Advanced metrics if available from backend */}
            {analytics.advanced && backendAvailable && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderMetric(
                  <Brain size={14} className="text-indigo-400" />,
                  'Von Neumann Entropy',
                  Math.min(analytics.advanced.von_neumann_entropy / 2, 1), // Normalize to 0-1
                  'indigo'
                )}
                
                {renderMetric(
                  <TrendingUp size={14} className="text-orange-400" />,
                  'Linear Entropy',
                  analytics.advanced.linear_entropy,
                  'orange'
                )}
                
                {renderMetric(
                  <Target size={14} className="text-teal-400" />,
                  'Coherence',
                  Math.min(analytics.advanced.coherence, 1), // Normalize to 0-1
                  'teal'
                )}
              </div>
            )}

            {/* Circuit Stats and Probabilities in horizontal layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Circuit Stats */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Circuit Statistics</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gates:</span>
                    <span className="font-mono text-slate-200">{circuit?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Depth:</span>
                    <span className="font-mono text-slate-200">{circuit?.length > 0 ? Math.max(...circuit.map(g => g.position)) + 1 : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Qubits:</span>
                    <span className="font-mono text-slate-200">{quantumState?.qubits?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">States:</span>
                    <span className="font-mono text-slate-200">{analytics?.probabilities?.length || 0}</span>
                  </div>
                </div>
                
                {/* Educational info for entanglement */}
                {analytics.entanglement > 0.1 && (
                  <div className="mt-3 p-2 bg-purple-900/30 border border-purple-500/30 rounded text-xs">
                    <div className="flex items-center gap-1 mb-1">
                      <Zap size={10} className="text-purple-400" />
                      <span className="text-purple-300 font-medium">Entanglement Detected!</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {analytics.entanglement > 0.8 ? 
                        "Maximum entanglement achieved - qubits are perfectly correlated!" :
                        "Partial entanglement - qubits share quantum correlations."
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Measurement Probabilities */}
              {analytics.probabilities.length > 0 && (
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Measurement Probabilities</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {analytics.probabilities.slice(0, 6).map((prob, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400 w-10 flex-shrink-0">
                          |{index.toString(2).padStart(Math.log2(analytics.probabilities.length) || 1, '0').padStart(2, '0')}⟩
                        </span>
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${(prob * 100).toFixed(1)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-300 w-10 text-right flex-shrink-0">
                          {(prob * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ResizablePanel>
  )
}