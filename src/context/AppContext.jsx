import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { ViewMode, SimulationMode } from '../utils/constants'
import backendClient from '../services/backendClient'

// Initial state
const initialState = {
  circuit: [],
  quantumState: null,
  isSimulating: false,
  viewMode: ViewMode.BLOCH,
  selectedGate: null,
  learningMode: true,
  settings: {
    autoSimulate: true,
    defaultQubits: 3,
    animationSpeed: 'normal',
    simulationMode: SimulationMode.CLIENT_SIDE
  },
  history: {
    past: [],
    present: null,
    future: []
  },
  // Add error state to initial state
  error: null,
  lastError: null
}

// Action types
const ActionTypes = {
  SET_CIRCUIT: 'SET_CIRCUIT',
  ADD_GATE_TO_CIRCUIT: 'ADD_GATE_TO_CIRCUIT',
  REMOVE_GATE_FROM_CIRCUIT: 'REMOVE_GATE_FROM_CIRCUIT',
  CLEAR_CIRCUIT: 'CLEAR_CIRCUIT',
  SET_QUANTUM_STATE: 'SET_QUANTUM_STATE',
  SET_IS_SIMULATING: 'SET_IS_SIMULATING',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_SELECTED_GATE: 'SET_SELECTED_GATE',
  TOGGLE_LEARNING_MODE: 'TOGGLE_LEARNING_MODE',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_STATE: 'RESET_STATE',
  UNDO: 'UNDO',
  REDO: 'REDO',
  IMPORT_CIRCUIT: 'IMPORT_CIRCUIT',
  EXPORT_CIRCUIT: 'EXPORT_CIRCUIT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Reducer function
function appReducer(state, action) {
  // Helper function to add to history for undoable actions
  const addToHistory = (newState, actionType) => {
    if (['ADD_GATE_TO_CIRCUIT', 'REMOVE_GATE_FROM_CIRCUIT', 'CLEAR_CIRCUIT', 'IMPORT_CIRCUIT'].includes(actionType)) {
      return {
        ...newState,
        history: {
          past: [...state.history.past, state.circuit],
          present: newState.circuit,
          future: []
        }
      }
    }
    return newState
  }

  switch (action.type) {
    case ActionTypes.SET_CIRCUIT:
      return addToHistory({ ...state, circuit: action.payload }, action.type)
    
    case ActionTypes.ADD_GATE_TO_CIRCUIT:
      const existingGateIndex = state.circuit.findIndex(
        g => g.qubit === action.payload.qubit && g.position === action.payload.position
      )
      
      let newCircuit
      if (existingGateIndex >= 0) {
        newCircuit = [...state.circuit]
        newCircuit[existingGateIndex] = action.payload
      } else {
        newCircuit = [...state.circuit, action.payload]
      }
      
      return addToHistory({ 
        ...state, 
        circuit: newCircuit,
        quantumState: null // Reset quantum state when adding gates
      }, action.type)
    
    case ActionTypes.REMOVE_GATE_FROM_CIRCUIT:
      return addToHistory({
        ...state,
        circuit: state.circuit.filter(g => g.id !== action.payload),
        quantumState: null // Reset quantum state when removing gates
      }, action.type)
    
    case ActionTypes.CLEAR_CIRCUIT:
      return addToHistory({ ...state, circuit: [], quantumState: null }, action.type)
    
    case ActionTypes.UNDO:
      if (state.history.past.length === 0) return state
      const previous = state.history.past[state.history.past.length - 1]
      const newPast = state.history.past.slice(0, state.history.past.length - 1)
      return {
        ...state,
        circuit: previous,
        quantumState: null, // Reset quantum state when undoing
        history: {
          past: newPast,
          present: previous,
          future: [state.circuit, ...state.history.future]
        }
      }
    
    case ActionTypes.REDO:
      if (state.history.future.length === 0) return state
      const next = state.history.future[0]
      const newFuture = state.history.future.slice(1)
      return {
        ...state,
        circuit: next,
        quantumState: null, // Reset quantum state when redoing
        history: {
          past: [...state.history.past, state.circuit],
          present: next,
          future: newFuture
        }
      }
    
    case ActionTypes.IMPORT_CIRCUIT:
      return addToHistory({
        ...state,
        circuit: action.payload.circuit,
        quantumState: null
      }, action.type)
    
    case ActionTypes.SET_QUANTUM_STATE:
      return { ...state, quantumState: action.payload }
    
    case ActionTypes.SET_IS_SIMULATING:
      return { ...state, isSimulating: action.payload }
    
    case ActionTypes.SET_VIEW_MODE:
      return { ...state, viewMode: action.payload }
    
    case ActionTypes.SET_SELECTED_GATE:
      return { ...state, selectedGate: action.payload }
    
    case ActionTypes.TOGGLE_LEARNING_MODE:
      return { ...state, learningMode: !state.learningMode }
    
    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      }
    
    case ActionTypes.RESET_STATE:
      return { ...initialState }
    
    case ActionTypes.SET_ERROR:
      return { 
        ...state, 
        error: action.payload,
        lastError: action.payload
      }
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null }
    
    default:
      return state
  }
}

// Create context
const AppContext = createContext()

// Context provider component
export function AppProvider({ children }) {
  console.log('AppProvider initializing...')
  
  const [state, dispatch] = useReducer(appReducer, initialState)
  
  console.log('AppProvider state:', state)

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('qscope_app_state')
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        // Only restore non-transient state
        if (parsedState.circuit) {
          dispatch({ type: ActionTypes.SET_CIRCUIT, payload: parsedState.circuit })
        }
        if (parsedState.viewMode) {
          dispatch({ type: ActionTypes.SET_VIEW_MODE, payload: parsedState.viewMode })
        }
        if (parsedState.learningMode !== undefined) {
          if (!parsedState.learningMode) {
            dispatch({ type: ActionTypes.TOGGLE_LEARNING_MODE })
          }
        }
        if (parsedState.settings) {
          dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: parsedState.settings })
        }
      }
    } catch (error) {
      console.warn('Failed to load saved state:', error)
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const stateToSave = {
        circuit: state.circuit,
        viewMode: state.viewMode,
        learningMode: state.learningMode,
        settings: state.settings
      }
      localStorage.setItem('qscope_app_state', JSON.stringify(stateToSave))
    } catch (error) {
      console.warn('Failed to save state:', error)
    }
  }, [state.circuit, state.viewMode, state.learningMode, state.settings])

  // Action creators
  const actions = {
    setCircuit: (circuit) => dispatch({ type: ActionTypes.SET_CIRCUIT, payload: circuit }),
    
    addGateToCircuit: (gate) => dispatch({ type: ActionTypes.ADD_GATE_TO_CIRCUIT, payload: gate }),
    
    removeGateFromCircuit: (gateId) => dispatch({ type: ActionTypes.REMOVE_GATE_FROM_CIRCUIT, payload: gateId }),
    
    clearCircuit: () => dispatch({ type: ActionTypes.CLEAR_CIRCUIT }),
    
    setQuantumState: (state) => dispatch({ type: ActionTypes.SET_QUANTUM_STATE, payload: state }),
    
    setIsSimulating: (isSimulating) => dispatch({ type: ActionTypes.SET_IS_SIMULATING, payload: isSimulating }),
    
    setViewMode: (viewMode) => dispatch({ type: ActionTypes.SET_VIEW_MODE, payload: viewMode }),
    
    setSelectedGate: (gate) => dispatch({ type: ActionTypes.SET_SELECTED_GATE, payload: gate }),
    
    toggleLearningMode: () => dispatch({ type: ActionTypes.TOGGLE_LEARNING_MODE }),
    
    updateSettings: (settings) => dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settings }),
    
    resetState: () => dispatch({ type: ActionTypes.RESET_STATE }),
    
    // Undo/Redo actions
    undo: () => dispatch({ type: ActionTypes.UNDO }),
    
    redo: () => dispatch({ type: ActionTypes.REDO }),
    
    // Import/Export actions
    importCircuit: (circuitData) => dispatch({ type: ActionTypes.IMPORT_CIRCUIT, payload: circuitData }),
    
    // Compound actions
    simulateCircuit: async () => {
      if (state.circuit.length === 0) {
        dispatch({ type: ActionTypes.SET_QUANTUM_STATE, payload: null })
        return
      }
      
      dispatch({ type: ActionTypes.SET_IS_SIMULATING, payload: true })
      dispatch({ type: ActionTypes.CLEAR_ERROR })
      
      try {
        let result
        
        if (state.settings.simulationMode === SimulationMode.BACKEND) {
          // Use backend simulation
          console.log('Using backend simulation...')
          const circuitData = {
            gates: state.circuit.map(gate => ({
              gate: gate.gate,
              qubit: gate.qubit,
              position: gate.position
            }))
          }
          
          try {
            const backendResult = await backendClient.simulateCircuit(circuitData)
            result = backendResult.result
            console.log('Backend simulation successful:', result)
          } catch (backendError) {
            console.warn('Backend simulation failed, falling back to client-side:', backendError.message)
            // Fallback to client-side simulation
            const { simulate } = await import('../utils/quantumSimulator')
            result = simulate(state.circuit)
          }
        } else {
          // Use client-side simulation
          console.log('Using client-side simulation...')
          const { simulate } = await import('../utils/quantumSimulator')
          result = simulate(state.circuit)
        }
        
        dispatch({ type: ActionTypes.SET_QUANTUM_STATE, payload: result })
      } catch (error) {
        console.error('Simulation error:', error)
        
        // Create user-friendly error message
        const userError = {
          type: 'SIMULATION_ERROR',
          title: 'Simulation Failed',
          message: 'Unable to simulate the quantum circuit',
          suggestions: [
            'Try simplifying the circuit',
            'Check if all gates are properly placed',
            'Clear the circuit and start fresh',
            state.settings.simulationMode === SimulationMode.BACKEND ? 'Check if backend is running or switch to client-side mode' : 'Try switching to backend mode for advanced features'
          ],
          technicalDetails: error.message,
          timestamp: new Date().toISOString()
        }
        
        dispatch({ type: ActionTypes.SET_ERROR, payload: userError })
        dispatch({ type: ActionTypes.SET_QUANTUM_STATE, payload: null })
      }
      dispatch({ type: ActionTypes.SET_IS_SIMULATING, payload: false })
    },

    // Error handling actions
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR })
  }

  const value = {
    state,
    actions,
    // Convenience getters
    circuit: state.circuit,
    quantumState: state.quantumState,
    isSimulating: state.isSimulating,
    viewMode: state.viewMode,
    selectedGate: state.selectedGate,
    learningMode: state.learningMode,
    settings: state.settings,
    // Undo/Redo state
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
    // Error state
    error: state.error,
    lastError: state.lastError
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use the app context
export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

export { ActionTypes }