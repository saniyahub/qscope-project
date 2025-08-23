class  Complex {
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

function applyGate(state, gate, qubit, numQubits) {
  const gates = {
    H: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]],
    X: [[0, 1], [1, 0]],
    Y: [[0, -1], [1, 0]],
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

export function simulate(circuit) {
  const numQubits = Math.max(...circuit.map(g => g.qubit), 0) + 1 || 2
  const stateSize = Math.pow(2, numQubits)
  
  let state = new Array(stateSize).fill(null).map(() => new Complex())
  state[0] = new Complex(1)
  
  const sortedCircuit = [...circuit].sort((a, b) => a.position - b.position)
  
  sortedCircuit.forEach(gate => {
    state = applyGate(state, gate.gate, gate.qubit, numQubits)
  })

  const qubits = []
  for (let i = 0; i < numQubits; i++) {
    const bloch = calculateBlochVector(state, i, numQubits)
    qubits.push({ id: i, bloch })
  }

  const measurementProbabilities = state.map(amp => amp.magnitude() ** 2)
  
  let entanglement = 0
  let purity = 0
  
  for (let i = 0; i < state.length; i++) {
    const prob = measurementProbabilities[i]
    if (prob > 0) {
      entanglement -= prob * Math.log2(prob)
    }
    purity += prob * prob
  }
  
  entanglement = Math.min(entanglement / numQubits, 1)

  return {
    qubits,
    entanglement,
    purity,
    fidelity: Math.sqrt(purity),
    measurementProbabilities
  }
}
 