import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe, Eye, RotateCcw, AlertTriangle } from 'lucide-react'
import BlochSphere3D from './BlochSphere3D'

export default function BlochVisualizer({ quantumState }) {
  const [webglSupported, setWebglSupported] = useState(true)
  const [retryKey, setRetryKey] = useState(0)

  // Check WebGL support on mount
  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        setWebglSupported(!!gl)
        return !!gl
      } catch (e) {
        setWebglSupported(false)
        return false
      }
    }

    checkWebGL()
  }, [])

  const handleRetry = () => {
    setRetryKey(prev => prev + 1)
    
    // Re-check WebGL support
    setTimeout(() => {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      setWebglSupported(!!gl)
    }, 100)
  }

  const blochVectors = useMemo(() => {
    if (!quantumState || !quantumState.qubits) return []
    
    return quantumState.qubits.map(qubit => ({
      x: qubit.bloch.x,
      y: qubit.bloch.y,
      z: qubit.bloch.z,
      id: qubit.id
    }))
  }, [quantumState])

  const renderQubitInfo = (vector, index) => (
    <motion.div
      key={vector.id}
      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">X:</span>
          <div className="bg-slate-700 rounded px-2 py-1 font-mono">
            {vector.x.toFixed(3)}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Y:</span>
          <div className="bg-slate-700 rounded px-2 py-1 font-mono">
            {vector.y.toFixed(3)}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Z:</span>
          <div className="bg-slate-700 rounded px-2 py-1 font-mono">
            {vector.z.toFixed(3)}
          </div>
        </div>
        
        <div className="pt-2 border-t border-slate-600">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Magnitude:</span>
            <div className="bg-indigo-900/50 text-indigo-300 rounded px-2 py-1 font-mono text-xs">
              {Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2).toFixed(3)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <motion.div
      className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <Globe className="text-indigo-400" size={24} />
          </motion.div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Interactive Bloch Sphere
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {webglSupported ? <Eye size={14} /> : <AlertTriangle size={14} />}
            </motion.div>
            <span>{webglSupported ? '3D View' : 'WebGL Issue'}</span>
          </div>
          <motion.button
            onClick={handleRetry}
            className="p-2 bg-slate-800/50 rounded-lg border border-slate-600/50 hover:border-indigo-500/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Retry 3D rendering"
          >
            <RotateCcw size={16} className="text-slate-400" />
          </motion.button>
        </div>
      </div>

      {!webglSupported && (
        <motion.div
          className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertTriangle size={16} />
            <span className="font-semibold">WebGL Not Available</span>
          </div>
          <p className="text-sm text-yellow-300">
            3D visualization requires WebGL support. Please enable WebGL in your browser.
          </p>
        </motion.div>
      )}

      {blochVectors.length === 0 ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <Globe size={64} className="text-slate-600 mx-auto mb-4" />
          </motion.div>
          <p className="text-slate-400 text-lg mb-2">Build and simulate a circuit</p>
          <p className="text-slate-500 text-sm">Visualize qubit states in interactive 3D</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Individual panels for each qubit */}
          {blochVectors.map((vector, index) => (
            <div key={vector.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <h3 className="text-sm font-semibold text-indigo-300 mb-3">Qubit {vector.id}</h3>
              <div className="mb-4">
                {/* Individual 3D Visualization for each qubit */}
                <div key={`${retryKey}-${vector.id}`} className="h-64">
                  <BlochSphere3D vectors={[vector]} />
                </div>
              </div>
              {renderQubitInfo(vector, index)}
            </div>
          ))}
          
          <motion.div
            className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-lg p-4 border border-indigo-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-slate-300">
              <strong className="text-indigo-300">Tip:</strong> Drag to rotate, scroll to zoom, right-click to pan. Each sphere shows a qubit's quantum state in 3D space.
            </p>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}