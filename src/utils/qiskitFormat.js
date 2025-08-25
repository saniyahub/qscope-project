// Qiskit JSON format utilities for import/export functionality

/**
 * Converts internal circuit format to Qiskit JSON format
 */
export function exportToQiskitJSON(circuit, numQubits = 3) {
  const sortedCircuit = [...circuit].sort((a, b) => a.position - b.position)
  
  const instructions = sortedCircuit.map(gate => ({
    name: gate.gate.toLowerCase() === 'i' ? 'id' : gate.gate.toLowerCase(),
    qubits: [gate.qubit],
    params: [],
    register: 'q'
  }))
  
  return {
    header: {
      backend_name: 'qscope_simulator',
      qobj_id: `qscope_circuit_${Date.now()}`,
      schema_version: '1.3.0'
    },
    config: {
      n_qubits: numQubits,
      shots: 1024
    },
    circuits: [{
      name: 'qscope_circuit',
      config: { n_qubits: numQubits },
      instructions: instructions
    }]
  }
}

/**
 * Converts Qiskit JSON format to internal circuit format
 */
export function importFromQiskitJSON(qiskitJSON) {
  try {
    let instructions = []
    let numQubits = 3
    
    if (qiskitJSON.circuits && qiskitJSON.circuits.length > 0) {
      const circuit = qiskitJSON.circuits[0]
      instructions = circuit.instructions || []
      numQubits = circuit.config?.n_qubits || 3
    } else if (qiskitJSON.instructions) {
      instructions = qiskitJSON.instructions
      numQubits = qiskitJSON.n_qubits || 3
    } else {
      throw new Error('Invalid Qiskit JSON format')
    }
    
    const circuit = instructions.map((instruction, index) => {
      let gateName = instruction.name.toUpperCase()
      
      switch (instruction.name.toLowerCase()) {
        case 'h': gateName = 'H'; break
        case 'x': case 'pauli_x': gateName = 'X'; break
        case 'y': case 'pauli_y': gateName = 'Y'; break
        case 'z': case 'pauli_z': gateName = 'Z'; break
        case 'id': case 'identity': gateName = 'I'; break
        default: gateName = 'I'
      }
      
      return {
        gate: gateName,
        qubit: instruction.qubits[0] || 0,
        position: index,
        id: Date.now() + index
      }
    })
    
    return { circuit, numQubits }
  } catch (error) {
    throw new Error(`Failed to import circuit: ${error.message}`)
  }
}

/**
 * Validates Qiskit JSON format
 */
export function validateQiskitJSON(json) {
  try {
    if (!json || typeof json !== 'object') return false
    
    const hasStandardFormat = json.circuits && Array.isArray(json.circuits)
    const hasSimpleFormat = json.instructions && Array.isArray(json.instructions)
    
    return hasStandardFormat || hasSimpleFormat
  } catch (error) {
    return false
  }
}