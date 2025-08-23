export  const ViewMode = {
  BLOCH: 'bloch',
  PROBABILITY: 'probability',
  ENTANGLEMENT: 'entanglement'
}

export const GateDescriptions = {
  H: {
    name: 'Hadamard',
    description: 'Creates superposition - puts qubit into equal mixture of |0⟩ and |1⟩',
    effect: 'Rotates the qubit 90° around the Y-axis, then 180° around the X-axis'
  },
  X: {
    name: 'Pauli-X',
    description: 'Bit flip - converts |0⟩ to |1⟩ and |1⟩ to |0⟩',
    effect: 'Rotates the qubit 180° around the X-axis (NOT gate)'
  },
  Y: {
    name: 'Pauli-Y',
    description: 'Bit and phase flip - flips bit and adds phase factor',
    effect: 'Rotates the qubit 180° around the Y-axis'
  },
  Z: {
    name: 'Pauli-Z',
    description: 'Phase flip - adds -1 phase to |1⟩ state',
    effect: 'Rotates the qubit 180° around the Z-axis'
  },
  I: {
    name: 'Identity',
    description: 'Does nothing - leaves qubit unchanged',
    effect: 'No rotation (identity operation)'
  }
}
 