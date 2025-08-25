import React from 'react'
import { motion } from 'framer-motion'
import { Server, Monitor, Wifi, WifiOff } from 'lucide-react'
import { SimulationMode } from '../utils/constants'
import { useAppContext } from '../context/AppContext'
import backendClient from '../services/backendClient'

export default function SimulationModeToggle() {
  const { settings, actions } = useAppContext()
  const [backendStatus, setBackendStatus] = React.useState('unknown')
  
  const currentMode = settings.simulationMode || SimulationMode.CLIENT_SIDE

  // Check backend availability
  React.useEffect(() => {
    const checkBackend = async () => {
      try {
        const isAvailable = await backendClient.isBackendAvailable()
        setBackendStatus(isAvailable ? 'online' : 'offline')
      } catch (error) {
        setBackendStatus('offline')
      }
    }
    
    checkBackend()
    const interval = setInterval(checkBackend, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const toggleMode = () => {
    const newMode = currentMode === SimulationMode.CLIENT_SIDE 
      ? SimulationMode.BACKEND 
      : SimulationMode.CLIENT_SIDE
    
    actions.updateSettings({ simulationMode: newMode })
  }

  const getStatusColor = () => {
    if (currentMode === SimulationMode.CLIENT_SIDE) return 'text-blue-400'
    return backendStatus === 'online' ? 'text-green-400' : 'text-red-400'
  }

  const getStatusIcon = () => {
    if (currentMode === SimulationMode.CLIENT_SIDE) {
      return <Monitor size={16} />
    }
    return backendStatus === 'online' ? <Wifi size={16} /> : <WifiOff size={16} />
  }

  return (
    <motion.div 
      className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-600/50"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2">
        <motion.div
          className={getStatusColor()}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {getStatusIcon()}
        </motion.div>
        <span className="text-sm font-medium text-slate-300">
          Simulation:
        </span>
      </div>
      
      <motion.button
        onClick={toggleMode}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-300 ${
          currentMode === SimulationMode.CLIENT_SIDE
            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
            : 'bg-green-600/20 text-green-300 border border-green-500/30'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={`Currently using ${currentMode} simulation. Click to switch.`}
      >
        <div className="flex items-center gap-2">
          {currentMode === SimulationMode.CLIENT_SIDE ? (
            <>
              <Monitor size={12} />
              <span>Client-Side</span>
            </>
          ) : (
            <>
              <Server size={12} />
              <span>Backend</span>
            </>
          )}
        </div>
      </motion.button>
      
      {/* Status indicator */}
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${
          currentMode === SimulationMode.CLIENT_SIDE 
            ? 'bg-blue-400'
            : backendStatus === 'online' 
              ? 'bg-green-400' 
              : 'bg-red-400'
        }`} />
        <span className="text-xs text-slate-500">
          {currentMode === SimulationMode.CLIENT_SIDE 
            ? 'Local' 
            : backendStatus === 'online' 
              ? 'Connected' 
              : 'Disconnected'
          }
        </span>
      </div>
      
      {/* Warning for backend mode when offline */}
      {currentMode === SimulationMode.BACKEND && backendStatus === 'offline' && (
        <motion.div
          className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Backend offline - using fallback
        </motion.div>
      )}
    </motion.div>
  )
}