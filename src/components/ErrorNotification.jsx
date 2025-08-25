import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, RefreshCw, Lightbulb } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

export default function ErrorNotification() {
  const { error, actions } = useAppContext()

  // Auto-clear error after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        actions.clearError()
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [error, actions])

  const handleRetry = () => {
    actions.clearError()
    if (error?.type === 'SIMULATION_ERROR') {
      // Retry simulation
      setTimeout(() => {
        actions.simulateCircuit()
      }, 100)
    }
  }

  const handleClearCircuit = () => {
    actions.clearError()
    actions.clearCircuit()
  }

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 right-4 max-w-md bg-red-900/90 backdrop-blur-sm border border-red-700 rounded-lg p-4 shadow-2xl z-50"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-400 mt-0.5" size={20} />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-100 mb-1">
                {error.title || 'Error'}
              </h3>
              <p className="text-sm text-red-200 mb-3">
                {error.message}
              </p>
              
              {/* Suggestions */}
              {error.suggestions && error.suggestions.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={14} className="text-yellow-400" />
                    <span className="text-xs font-medium text-yellow-300">Suggestions:</span>
                  </div>
                  <ul className="text-xs text-red-200 space-y-1">
                    {error.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-red-400">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {error.type === 'SIMULATION_ERROR' && (
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-1 px-3 py-1 bg-red-800 hover:bg-red-700 text-red-100 text-xs rounded transition-colors"
                  >
                    <RefreshCw size={12} />
                    Retry
                  </button>
                )}
                <button
                  onClick={handleClearCircuit}
                  className="px-3 py-1 bg-red-800 hover:bg-red-700 text-red-100 text-xs rounded transition-colors"
                >
                  Clear Circuit
                </button>
              </div>

              {/* Technical details (collapsible) */}
              {error.technicalDetails && (
                <details className="mt-3">
                  <summary className="text-xs text-red-300 cursor-pointer hover:text-red-200">
                    Technical Details
                  </summary>
                  <code className="text-xs text-red-200 bg-red-950/50 p-2 rounded mt-1 block overflow-auto">
                    {error.technicalDetails}
                  </code>
                </details>
              )}
            </div>
            
            {/* Close button */}
            <button
              onClick={actions.clearError}
              className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}