import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Undo2, Redo2, Download, Upload, FileText, AlertCircle } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { exportToQiskitJSON, importFromQiskitJSON, validateQiskitJSON } from '../utils/qiskitFormat'
import SimulationModeToggle from './SimulationModeToggle'

export default function Toolbar() {
  const { 
    circuit, 
    actions, 
    canUndo, 
    canRedo,
    settings 
  } = useAppContext()
  
  const fileInputRef = useRef(null)
  const [importError, setImportError] = useState('')
  const [showSuccess, setShowSuccess] = useState('')

  const handleExport = () => {
    try {
      const qiskitJSON = exportToQiskitJSON(circuit, settings.defaultQubits)
      const dataStr = JSON.stringify(qiskitJSON, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `qscope_circuit_${Date.now()}.json`
      link.click()
      
      setShowSuccess('Circuit exported successfully!')
      setTimeout(() => setShowSuccess(''), 3000)
    } catch (error) {
      setImportError(`Export failed: ${error.message}`)
      setTimeout(() => setImportError(''), 5000)
    }
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    setImportError('')
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result)
        
        if (!validateQiskitJSON(jsonData)) {
          throw new Error('Invalid Qiskit JSON format')
        }
        
        const { circuit: importedCircuit, numQubits } = importFromQiskitJSON(jsonData)
        
        actions.importCircuit({ circuit: importedCircuit })
        
        // Update default qubits if imported circuit has more
        if (numQubits > settings.defaultQubits) {
          actions.updateSettings({ defaultQubits: numQubits })
        }
        
        setShowSuccess(`Circuit imported successfully! (${importedCircuit.length} gates, ${numQubits} qubits)`)
        setTimeout(() => setShowSuccess(''), 5000)
        
      } catch (error) {
        setImportError(`Import failed: ${error.message}`)
        setTimeout(() => setImportError(''), 5000)
      }
    }
    
    reader.readAsText(file)
    // Reset file input
    event.target.value = ''
  }

  const toolbarButtons = [
    {
      icon: Undo2,
      label: 'Undo',
      action: actions.undo,
      disabled: !canUndo,
      shortcut: 'Ctrl+Z'
    },
    {
      icon: Redo2,
      label: 'Redo',
      action: actions.redo,
      disabled: !canRedo,
      shortcut: 'Ctrl+Y'
    },
    {
      icon: Upload,
      label: 'Import',
      action: handleImport,
      disabled: false,
      shortcut: 'Ctrl+O'
    },
    {
      icon: Download,
      label: 'Export',
      action: handleExport,
      disabled: circuit.length === 0,
      shortcut: 'Ctrl+S'
    }
  ]

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault()
            if (canUndo) actions.undo()
            break
          case 'y':
            event.preventDefault()
            if (canRedo) actions.redo()
            break
          case 'o':
            event.preventDefault()
            handleImport()
            break
          case 's':
            event.preventDefault()
            if (circuit.length > 0) handleExport()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, circuit.length])

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-indigo-400" size={20} />
          <h3 className="text-lg font-semibold text-slate-200">Circuit Tools</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {toolbarButtons.map((button, index) => (
            <motion.button
              key={index}
              onClick={button.action}
              disabled={button.disabled}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 hover:scale-105
                ${button.disabled 
                  ? 'text-slate-500 bg-slate-800/50 cursor-not-allowed opacity-50' 
                  : 'text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 hover:text-white border border-slate-600/50 hover:border-slate-500/50'
                }
              `}
              title={`${button.label} (${button.shortcut})`}
              whileHover={!button.disabled ? { scale: 1.05 } : {}}
              whileTap={!button.disabled ? { scale: 0.95 } : {}}
            >
              <button.icon size={16} />
              <span className="hidden sm:inline">{button.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Status messages */}
      {(importError || showSuccess) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-sm ${
            importError 
              ? 'bg-red-900/50 border border-red-700/50 text-red-300' 
              : 'bg-green-900/50 border border-green-700/50 text-green-300'
          }`}
        >
          <AlertCircle size={16} />
          <span>{importError || showSuccess}</span>
        </motion.div>
      )}

      {/* Simulation Mode Toggle */}
      <div className="mt-3">
        <SimulationModeToggle />
      </div>

      {/* Circuit info */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 bg-slate-800/30 rounded-lg p-2">
        <div className="flex gap-4">
          <span>Gates: {circuit.length}</span>
          <span>Qubits: {settings.defaultQubits}</span>
          <span>Depth: {circuit.length > 0 ? Math.max(...circuit.map(g => g.position), 0) + 1 : 0}</span>
        </div>
        <div className="flex gap-2">
          <span className={canUndo ? 'text-green-400' : 'text-slate-500'}>
            Can Undo: {canUndo ? 'Yes' : 'No'}
          </span>
          <span className={canRedo ? 'text-green-400' : 'text-slate-500'}>
            Can Redo: {canRedo ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </div>
  )
}