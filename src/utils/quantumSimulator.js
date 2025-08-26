class Complex {
  constructor(real = 0, imag = 0) {
    this.real = real
    this.imag = imag
  }

  multiply(other) {
    return new Complex(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    )
  }

  add(other) {
    return new Complex(this.real + other.real, this.imag + other.imag)
  }

  magnitude() {
    return Math.sqrt(this.real * this.real + this.imag * this.imag)
  }

  conjugate() {
    return new Complex(this.real, -this.imag)
  }
}

function applyCNOT(state, controlQubit, targetQubit, numQubits) {
  const newState = new Array(state.length).fill(null).map(() => new Complex())
  
  for (let i = 0; i < state.length; i++) {
    const controlBit = (i >> controlQubit) & 1
    const targetBit = (i >> targetQubit) & 1
    
    if (controlBit === 1) {
      // Flip target bit when control is 1
      const newIndex = i ^ (1 << targetQubit)
      newState[newIndex] = newState[newIndex].add(state[i])
    } else {
      // Keep state unchanged when control is 0
      newState[i] = newState[i].add(state[i])
    }
  }
  
  return newState
}

function applyGate(state, gate, qubit, numQubits, targetQubit = null) {
  if (gate === 'CNOT') {
    return applyCNOT(state, qubit, targetQubit, numQubits)
  }
  const gates = {
    H: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]],
    X: [[0, 1], [1, 0]],
    Y: [[new Complex(0, 0), new Complex(0, -1)], [new Complex(0, 1), new Complex(0, 0)]],
    Z: [[1, 0], [0, -1]],
    I: [[1, 0], [0, 1]]
  }

  const matrix = gates[gate]
  const newState = new Array(state.length).fill(null).map(() => new Complex())

  for (let i = 0; i < state.length; i++) {
    const bit = (i >> qubit) & 1
    const amplitude = state[i]

    if (bit === 0) {
      const newI0 = i
      const newI1 = i | (1 << qubit)
      
      newState[newI0] = newState[newI0].add(amplitude.multiply(new Complex(matrix[0][0])))
      newState[newI1] = newState[newI1].add(amplitude.multiply(new Complex(matrix[1][0])))
    } else {
      const newI0 = i & ~(1 << qubit)
      const newI1 = i
      
      newState[newI0] = newState[newI0].add(amplitude.multiply(new Complex(matrix[0][1])))
      newState[newI1] = newState[newI1].add(amplitude.multiply(new Complex(matrix[1][1])))
    }
  }

  return newState
}

function calculateBlochVector(state, qubit, numQubits) {
  let prob0 = 0, prob1 = 0
  let x = 0, y = 0, z = 0

  for (let i = 0; i < state.length; i++) {
    const bit = (i >> qubit) & 1
    const prob = state[i].magnitude() ** 2

    if (bit === 0) {
      prob0 += prob
    } else {
      prob1 += prob
    }
  }

  z = prob0 - prob1

  for (let i = 0; i < state.length; i++) {
    const bit = (i >> qubit) & 1
    const flippedI = i ^ (1 << qubit)
    
    if (bit === 0) {
      const coherence = state[i].multiply(state[flippedI].conjugate())
      x += 2 * coherence.real
      y += -2 * coherence.imag
    }
  }

  return { x, y, z }
}

function calculateEntanglement(state, numQubits) {
  if (numQubits < 2) return 0
  
  // For Bell states and similar, calculate entanglement using Schmidt decomposition
  // This is a simplified calculation for 2-qubit systems
  if (numQubits === 2) {
    // Calculate reduced density matrix for first qubit
    let rho00 = 0, rho11 = 0
    
    // |00⟩ and |01⟩ components
    rho00 += state[0].magnitude() ** 2 // |00⟩
    rho00 += state[1].magnitude() ** 2 // |01⟩
    
    // |10⟩ and |11⟩ components  
    rho11 += state[2].magnitude() ** 2 // |10⟩
    rho11 += state[3].magnitude() ** 2 // |11⟩
    
    // Calculate von Neumann entropy of reduced density matrix
    let entropy = 0
    if (rho00 > 1e-10) entropy -= rho00 * Math.log2(rho00)
    if (rho11 > 1e-10) entropy -= rho11 * Math.log2(rho11)
    
    return Math.min(entropy, 1.0) // Normalize to [0,1]
  }
  
  // For multi-qubit systems, use a simplified approach
  // Check if state is separable (product state) or entangled
  let maxProb = Math.max(...state.map(amp => amp.magnitude() ** 2))
  return maxProb < 0.8 ? 0.5 : 0 // Simple heuristic
}

function detectEntangledPairs(state, numQubits) {
  const pairs = []
  
  if (numQubits < 2) return pairs
  
  // For 2-qubit Bell states
  if (numQubits === 2) {
    const prob00 = state[0].magnitude() ** 2  // |00⟩
    const prob01 = state[1].magnitude() ** 2  // |01⟩  
    const prob10 = state[2].magnitude() ** 2  // |10⟩
    const prob11 = state[3].magnitude() ** 2  // |11⟩
    
    // Bell states have specific patterns:
    // |Φ+⟩ = (|00⟩ + |11⟩)/√2 → prob00 ≈ prob11 ≈ 0.5, prob01 ≈ prob10 ≈ 0
    // |Φ-⟩ = (|00⟩ - |11⟩)/√2 → similar
    // |Ψ+⟩ = (|01⟩ + |10⟩)/√2 → prob01 ≈ prob10 ≈ 0.5, prob00 ≈ prob11 ≈ 0  
    // |Ψ-⟩ = (|01⟩ - |10⟩)/√2 → similar
    
    const bellState1 = Math.abs(prob00 - prob11) < 0.1 && prob01 < 0.1 && prob10 < 0.1 // |Φ±⟩
    const bellState2 = Math.abs(prob01 - prob10) < 0.1 && prob00 < 0.1 && prob11 < 0.1 // |Ψ±⟩
    
    if (bellState1 || bellState2) {
      const strength = Math.max(prob00 + prob11, prob01 + prob10)
      pairs.push({
        from: 0,
        to: 1, 
        strength: strength,
        id: '0-1'
      })
    }
  }
  
  return pairs
}

export function simulate(circuit) {
  try {
    const numQubits = Math.max(...circuit.map(g => g.qubit), ...circuit.map(g => g.targetQubit || 0), 0) + 1 || 2
    const stateSize = Math.pow(2, numQubits)
    
    let state = new Array(stateSize).fill(null).map(() => new Complex())
    state[0] = new Complex(1)
    
    const sortedCircuit = [...circuit].sort((a, b) => a.position - b.position)
    
    sortedCircuit.forEach(gate => {
      if (gate.gate === 'CNOT') {
        state = applyGate(state, gate.gate, gate.qubit, numQubits, gate.targetQubit)
      } else {
        state = applyGate(state, gate.gate, gate.qubit, numQubits)
      }
    })

    const qubits = []
    for (let i = 0; i < numQubits; i++) {
      const bloch = calculateBlochVector(state, i, numQubits)
      qubits.push({ id: i, bloch })
    }

    const measurementProbabilities = state.map(amp => amp.magnitude() ** 2)
    
    // Calculate proper entanglement
    const entanglement = calculateEntanglement(state, numQubits)
    
    // Calculate entangled pairs for visualization
    const entangledPairs = detectEntangledPairs(state, numQubits)
    
    let purity = 0
    for (let i = 0; i < state.length; i++) {
      const prob = measurementProbabilities[i]
      purity += prob * prob
    }

    return {
      qubits,
      entanglement,
      entangledPairs, // Add this for EntanglementView
      purity,
      fidelity: Math.sqrt(purity),
      measurementProbabilities
    }
  } catch (error) {
    console.error('Quantum simulation error:', error)
    // Return a safe fallback state
    return {
      qubits: [{ id: 0, bloch: { x: 0, y: 0, z: 1 } }],
      entanglement: 0,
      entangledPairs: [],
      purity: 1,
      fidelity: 1,
      measurementProbabilities: [1, 0]
    }
  }
}
 