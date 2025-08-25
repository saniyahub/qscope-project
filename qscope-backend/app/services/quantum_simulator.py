"""
Advanced Quantum Simulator Service for Qscope Backend
Provides enhanced quantum simulation with step-by-step analysis using Qiskit
"""

from qiskit import QuantumCircuit, transpile
from qiskit.quantum_info import Statevector, partial_trace, entropy
from qiskit_aer import AerSimulator
import numpy as np
from typing import Dict, List, Tuple, Any, Optional
import logging
from app.utils.math_helpers import complex_to_dict, format_complex_number

logger = logging.getLogger(__name__)

class AdvancedQuantumSimulator:
    """
    Advanced quantum simulator with step-by-step analysis capabilities
    """
    
    def __init__(self):
        """Initialize the advanced quantum simulator"""
        self.simulator = AerSimulator()
        self.current_circuit = None
        self.step_history = []
        
        # Gate definitions for matrix representations
        self.gate_matrices = {
            'H': np.array([[1, 1], [1, -1]]) / np.sqrt(2),
            'X': np.array([[0, 1], [1, 0]]),
            'Y': np.array([[0, -1j], [1j, 0]]),
            'Z': np.array([[1, 0], [0, -1]]),
            'I': np.array([[1, 0], [0, 1]])
        }
    
    def simulate_basic(self, circuit_data: Dict) -> Dict:
        """
        Basic quantum circuit simulation for compatibility
        
        Args:
            circuit_data: Circuit specification with gates array
            
        Returns:
            Basic simulation result compatible with frontend
        """
        try:
            # Build quantum circuit
            qc = self._build_circuit(circuit_data)
            
            # Get final state
            statevector = Statevector.from_instruction(qc)
            
            # Calculate basic metrics
            num_qubits = qc.num_qubits
            bloch_vectors = self._calculate_all_bloch_vectors(statevector, num_qubits)
            probabilities = self._calculate_measurement_probabilities(statevector)
            
            # Calculate quantum metrics
            entanglement = self._calculate_entanglement(statevector, num_qubits)
            purity = self._calculate_purity(statevector)
            fidelity = np.sqrt(purity)
            
            return {
                'qubits': [{'id': i, 'bloch': bloch_vectors[i]} for i in range(num_qubits)],
                'entanglement': entanglement,
                'purity': purity,
                'fidelity': fidelity,
                'measurementProbabilities': probabilities
            }
            
        except Exception as e:
            logger.error(f"Basic simulation error: {str(e)}")
            # Return safe fallback
            return {
                'qubits': [{'id': 0, 'bloch': {'x': 0, 'y': 0, 'z': 1}}],
                'entanglement': 0,
                'purity': 1,
                'fidelity': 1,
                'measurementProbabilities': [1, 0]
            }
    
    def simulate_with_steps(self, circuit_data: Dict, options: Optional[Dict] = None) -> Dict:
        """
        Enhanced simulation with step-by-step analysis
        
        Args:
            circuit_data: Circuit specification with gates array
            options: Simulation options and preferences
            
        Returns:
            Comprehensive simulation result with step-by-step analysis
        """
        import time
        from flask import current_app
        
        start_time = time.time()
        timeout = 30  # Default timeout in seconds
        
        try:
            # Get timeout from config if available
            if current_app:
                timeout = current_app.config.get('SIMULATION_TIMEOUT', 30)
        except RuntimeError:
            pass  # No app context
            
        try:
            if options is None:
                options = {}
                
            steps = []
            qc = self._build_circuit(circuit_data)
            
            # Check timeout before proceeding
            if time.time() - start_time > timeout:
                raise TimeoutError(f"Simulation timeout after {timeout} seconds")
            
            if qc.num_qubits == 0:
                return self._empty_circuit_result()
            
            # Validate circuit size to prevent memory issues
            if qc.num_qubits > 10:
                logger.warning(f"Large circuit detected: {qc.num_qubits} qubits")
                return self._error_fallback_result("Circuit too large for simulation (>10 qubits)")
            
            # Initialize state with error handling
            try:
                initial_state = Statevector.from_label('0' * qc.num_qubits)
                current_state = initial_state
            except Exception as state_error:
                logger.error(f"State initialization error: {str(state_error)}")
                return self._error_fallback_result(f"Failed to initialize quantum state: {str(state_error)}")
            
            # Add initialization step
            steps.append({
                'step': 0,
                'operation': 'initialization',
                'state_vector': self._format_statevector(current_state),
                'bloch_vectors': self._calculate_all_bloch_vectors(current_state, qc.num_qubits),
                'explanation': f"Initialize {qc.num_qubits}-qubit system in |{'0' * qc.num_qubits}⟩ state",
                'probability_amplitudes': self._calculate_probability_amplitudes(current_state),
                'measurement_probabilities': self._calculate_measurement_probabilities(current_state)
            })
            
            # Apply gates step by step
            gates = circuit_data.get('gates', [])
            sorted_gates = sorted(gates, key=lambda g: g.get('position', 0))
            
            for i, gate_data in enumerate(sorted_gates):
                try:
                    # Create single-gate circuit
                    gate_circuit = QuantumCircuit(qc.num_qubits)
                    self._add_single_gate(gate_circuit, gate_data)
                    
                    # Store previous state for comparison
                    previous_state = current_state
                    
                    # Evolve state
                    current_state = current_state.evolve(gate_circuit)
                    
                    # Create step information
                    step_info = {
                        'step': i + 1,
                        'operation': gate_data.get('gate', 'unknown'),
                        'qubit': gate_data.get('qubit', 0),
                        'position': gate_data.get('position', 0),
                        'state_vector': self._format_statevector(current_state),
                        'bloch_vectors': self._calculate_all_bloch_vectors(current_state, qc.num_qubits),
                        'gate_matrix': self._get_gate_matrix_for_system(gate_data.get('gate', 'I'), gate_data.get('qubit', 0), qc.num_qubits),
                        'explanation': self._generate_step_explanation(gate_data, previous_state, current_state),
                        'probability_amplitudes': self._calculate_probability_amplitudes(current_state),
                        'measurement_probabilities': self._calculate_measurement_probabilities(current_state),
                        'state_changes': self._analyze_state_changes(previous_state, current_state)
                    }
                    
                    steps.append(step_info)
                    
                except Exception as gate_error:
                    logger.error(f"Error processing gate {i}: {str(gate_error)}")
                    continue
            
            return {
                'steps': steps,
                'final_metrics': self._calculate_advanced_metrics(current_state, qc.num_qubits),
                'entanglement_analysis': self._analyze_entanglement(current_state, qc.num_qubits),
                'coherence_measures': self._calculate_coherence_measures(current_state),
                'circuit_statistics': self._calculate_circuit_statistics(circuit_data)
            }
            
        except Exception as e:
            logger.error(f"Step simulation error: {str(e)}")
            return self._error_fallback_result(str(e))
    
    def _build_circuit(self, circuit_data: Dict) -> QuantumCircuit:
        """Build QuantumCircuit from circuit data"""
        gates = circuit_data.get('gates', [])
        
        if not gates:
            return QuantumCircuit(2)  # Default 2-qubit circuit
        
        # Determine number of qubits
        max_qubit = max((gate.get('qubit', 0) for gate in gates), default=0)
        num_qubits = max_qubit + 1
        
        # Create circuit
        qc = QuantumCircuit(num_qubits)
        
        # Sort gates by position
        sorted_gates = sorted(gates, key=lambda g: g.get('position', 0))
        
        # Add gates to circuit
        for gate_data in sorted_gates:
            self._add_single_gate(qc, gate_data)
        
        return qc
    
    def _add_single_gate(self, qc: QuantumCircuit, gate_data: Dict):
        """Add a single gate to the quantum circuit"""
        gate_type = gate_data.get('gate', 'I')
        qubit = gate_data.get('qubit', 0)
        
        if gate_type == 'H':
            qc.h(qubit)
        elif gate_type == 'X':
            qc.x(qubit)
        elif gate_type == 'Y':
            qc.y(qubit)
        elif gate_type == 'Z':
            qc.z(qubit)
        elif gate_type == 'I':
            # Identity gate - explicitly add identity operation for completeness
            qc.id(qubit)
        else:
            logger.warning(f"Unknown gate type: {gate_type}")
            # Default to no operation (identity)
    
    def _format_statevector(self, statevector: Statevector) -> List[Dict]:
        """Format statevector for JSON serialization"""
        amplitudes = []
        for i, amplitude in enumerate(statevector.data):
            amplitudes.append({
                'index': i,
                'amplitude': complex_to_dict(amplitude),
                'probability': float(np.abs(amplitude) ** 2),
                'basis_state': format(i, f'0{int(np.log2(len(statevector.data)))}b')
            })
        return amplitudes
    
    def _calculate_all_bloch_vectors(self, statevector: Statevector, num_qubits: int) -> Dict:
        """Calculate Bloch vectors for all qubits"""
        bloch_vectors = {}
        
        for qubit in range(num_qubits):
            # Get reduced density matrix for this qubit
            other_qubits = [q for q in range(num_qubits) if q != qubit]
            
            if other_qubits:
                rho_qubit = partial_trace(statevector, other_qubits)
            else:
                rho_qubit = statevector
            
            # Calculate Bloch vector components
            try:
                if hasattr(rho_qubit, 'expectation_value'):
                    # For DensityMatrix - use proper Pauli operators converted to Operator
                    from qiskit.quantum_info.operators import Pauli, Operator
                    x = float(np.real(rho_qubit.expectation_value(Operator(Pauli('X')))))
                    y = float(np.real(rho_qubit.expectation_value(Operator(Pauli('Y')))))
                    z = float(np.real(rho_qubit.expectation_value(Operator(Pauli('Z')))))
                else:
                    # For Statevector (single qubit case)
                    from qiskit.quantum_info.operators import Pauli, Operator
                    x = float(np.real(statevector.expectation_value(Operator(Pauli('X')))))
                    y = float(np.real(statevector.expectation_value(Operator(Pauli('Y')))))
                    z = float(np.real(statevector.expectation_value(Operator(Pauli('Z')))))
            except Exception as e:
                logger.warning(f"Error calculating Bloch vector for qubit {qubit}: {e}")
                # Default to |0⟩ state
                x, y, z = 0.0, 0.0, 1.0
            
            bloch_vectors[qubit] = {'x': x, 'y': y, 'z': z}
        
        return bloch_vectors
    
    def _calculate_probability_amplitudes(self, statevector: Statevector) -> List[Dict]:
        """Calculate probability amplitudes with phase information"""
        amplitudes = []
        for i, amp in enumerate(statevector.data):
            magnitude = float(np.abs(amp))
            phase = float(np.angle(amp))
            probability = magnitude ** 2
            
            amplitudes.append({
                'index': i,
                'magnitude': magnitude,
                'phase': phase,
                'probability': probability,
                'real': float(np.real(amp)),
                'imaginary': float(np.imag(amp)),
                'basis_state': format(i, f'0{int(np.log2(len(statevector.data)))}b')
            })
        
        return amplitudes
    
    def _calculate_measurement_probabilities(self, statevector: Statevector) -> List[float]:
        """Calculate measurement probabilities for computational basis"""
        return [float(np.abs(amp) ** 2) for amp in statevector.data]
    
    def _get_gate_matrix_for_system(self, gate_type: str, target_qubit: int, num_qubits: int) -> Optional[List[List[Dict]]]:
        """Get full system gate matrix for multi-qubit system using tensor products"""
        try:
            # Get the basic 2x2 gate matrix
            if gate_type not in self.gate_matrices:
                gate_type = 'I'  # Default to identity
            
            basic_gate = self.gate_matrices[gate_type]
            identity = self.gate_matrices['I']
            
            # Build full system matrix using tensor products
            if num_qubits == 1:
                # Single qubit case
                full_matrix = basic_gate
            else:
                # Multi-qubit case: tensor product with identities
                # Start with the first qubit
                if target_qubit == 0:
                    full_matrix = basic_gate
                else:
                    full_matrix = identity
                
                # Add remaining qubits
                for qubit in range(1, num_qubits):
                    if qubit == target_qubit:
                        full_matrix = np.kron(full_matrix, basic_gate)
                    else:
                        full_matrix = np.kron(full_matrix, identity)
            
            # Convert to JSON-serializable format
            result = self._matrix_to_dict(full_matrix)
            
            # Log for debugging
            logger.info(f"Generated {full_matrix.shape[0]}x{full_matrix.shape[1]} matrix for {gate_type} gate on qubit {target_qubit}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating gate matrix for {gate_type} on qubit {target_qubit}: {str(e)}")
            # Return a fallback basic gate matrix instead of None
            try:
                basic_gate = self.gate_matrices.get(gate_type, self.gate_matrices['I'])
                return self._matrix_to_dict(basic_gate)
            except:
                return None
    
    def _matrix_to_dict(self, matrix: np.ndarray) -> Optional[List[List[Dict]]]:
        """Convert numpy matrix to JSON-serializable dictionary format"""
        try:
            return [
                [complex_to_dict(matrix[i, j]) for j in range(matrix.shape[1])]
                for i in range(matrix.shape[0])
            ]
        except Exception as e:
            logger.error(f"Error converting matrix to dict: {str(e)}")
            return None
    
    def _get_gate_matrix_dict(self, gate_type: str) -> Dict:
        """Get gate matrix as dictionary for JSON serialization"""
        if gate_type not in self.gate_matrices:
            gate_type = 'I'  # Default to identity
        
        matrix = self.gate_matrices[gate_type]
        
        return {
            'gate': gate_type,
            'matrix': [
                [complex_to_dict(matrix[i, j]) for j in range(matrix.shape[1])]
                for i in range(matrix.shape[0])
            ],
            'description': self._get_gate_description(gate_type)
        }
    
    def _get_gate_description(self, gate_type: str) -> str:
        """Get description of quantum gate"""
        descriptions = {
            'H': 'Hadamard gate: Creates superposition, rotates Bloch vector',
            'X': 'Pauli-X gate: Bit flip, 180° rotation around X-axis',
            'Y': 'Pauli-Y gate: Bit and phase flip, 180° rotation around Y-axis',
            'Z': 'Pauli-Z gate: Phase flip, 180° rotation around Z-axis',
            'I': 'Identity gate: No operation, leaves qubit unchanged'
        }
        return descriptions.get(gate_type, 'Unknown gate')
    
    def _generate_step_explanation(self, gate_data: Dict, before_state: Statevector, after_state: Statevector) -> str:
        """Generate detailed explanation for quantum operation"""
        gate_type = gate_data.get('gate', 'I')
        qubit = gate_data.get('qubit', 0)
        
        explanations = {
            'H': f"Applied Hadamard gate to qubit {qubit}. Creates superposition: "
                 f"transforms |0⟩ → (|0⟩ + |1⟩)/√2 and |1⟩ → (|0⟩ - |1⟩)/√2",
            'X': f"Applied Pauli-X gate to qubit {qubit}. Bit flip operation: "
                 f"transforms |0⟩ → |1⟩ and |1⟩ → |0⟩",
            'Y': f"Applied Pauli-Y gate to qubit {qubit}. Bit and phase flip: "
                 f"transforms |0⟩ → i|1⟩ and |1⟩ → -i|0⟩",
            'Z': f"Applied Pauli-Z gate to qubit {qubit}. Phase flip operation: "
                 f"transforms |0⟩ → |0⟩ and |1⟩ → -|1⟩",
            'I': f"Applied Identity gate to qubit {qubit}. No change to the qubit state"
        }
        
        return explanations.get(gate_type, f"Applied {gate_type} gate to qubit {qubit}")
    
    def _analyze_state_changes(self, before_state: Statevector, after_state: Statevector) -> Dict:
        """Analyze how the quantum state changed"""
        # Calculate fidelity between states
        fidelity = float(np.abs(np.conj(before_state.data).dot(after_state.data)) ** 2)
        
        # Calculate amplitude changes
        amplitude_changes = []
        for i, (before_amp, after_amp) in enumerate(zip(before_state.data, after_state.data)):
            change = {
                'basis_state': format(i, f'0{int(np.log2(len(before_state.data)))}b'),
                'before_probability': float(np.abs(before_amp) ** 2),
                'after_probability': float(np.abs(after_amp) ** 2),
                'probability_change': float(np.abs(after_amp) ** 2 - np.abs(before_amp) ** 2),
                'phase_change': float(np.angle(after_amp) - np.angle(before_amp))
            }
            amplitude_changes.append(change)
        
        return {
            'fidelity': fidelity,
            'amplitude_changes': amplitude_changes,
            'total_probability_change': sum(abs(change['probability_change']) for change in amplitude_changes)
        }
    
    def _calculate_advanced_metrics(self, statevector: Statevector, num_qubits: int) -> Dict:
        """Calculate advanced quantum information metrics"""
        # Basic metrics
        purity = self._calculate_purity(statevector)
        entanglement = self._calculate_entanglement(statevector, num_qubits)
        
        # Calculate von Neumann entropy
        probabilities = [float(np.abs(amp) ** 2) for amp in statevector.data]
        von_neumann_entropy = -sum(p * np.log2(p + 1e-16) for p in probabilities if p > 1e-16)
        
        return {
            'purity': purity,
            'entanglement': entanglement,
            'fidelity': np.sqrt(purity),
            'von_neumann_entropy': float(von_neumann_entropy),
            'linear_entropy': float(1 - purity),
            'participation_ratio': float(1 / sum(p ** 2 for p in probabilities))
        }
    
    def _calculate_entanglement(self, statevector: Statevector, num_qubits: int) -> float:
        """Calculate entanglement measure"""
        if num_qubits < 2:
            return 0.0
        
        try:
            # For 2-qubit case, use von Neumann entropy of reduced state
            if num_qubits == 2:
                rho_A = partial_trace(statevector, [1])
                return float(entropy(rho_A, base=2))
            else:
                # For multi-qubit, use average bipartite entanglement
                total_entanglement = 0
                count = 0
                
                for i in range(num_qubits):
                    others = [j for j in range(num_qubits) if j != i]
                    rho_i = partial_trace(statevector, others)
                    total_entanglement += entropy(rho_i, base=2)
                    count += 1
                
                return float(total_entanglement / count) if count > 0 else 0.0
                
        except Exception as e:
            logger.error(f"Entanglement calculation error: {str(e)}")
            return 0.0
    
    def _calculate_purity(self, statevector: Statevector) -> float:
        """Calculate purity of quantum state"""
        probabilities = [np.abs(amp) ** 2 for amp in statevector.data]
        return float(sum(p ** 2 for p in probabilities))
    
    def _analyze_entanglement(self, statevector: Statevector, num_qubits: int) -> Dict:
        """Detailed entanglement analysis"""
        if num_qubits < 2:
            return {'type': 'none', 'measure': 0.0, 'description': 'Single qubit - no entanglement'}
        
        entanglement_measure = self._calculate_entanglement(statevector, num_qubits)
        
        # Classify entanglement
        if entanglement_measure < 0.1:
            entanglement_type = 'separable'
            description = 'State is approximately separable (product state)'
        elif entanglement_measure < 0.5:
            entanglement_type = 'weakly_entangled'
            description = 'State shows weak entanglement'
        elif entanglement_measure < 0.9:
            entanglement_type = 'moderately_entangled'
            description = 'State is moderately entangled'
        else:
            entanglement_type = 'strongly_entangled'
            description = 'State is strongly entangled'
        
        return {
            'type': entanglement_type,
            'measure': entanglement_measure,
            'description': description,
            'max_entanglement': float(np.log2(min(2, num_qubits)))
        }
    
    def _calculate_coherence_measures(self, statevector: Statevector) -> Dict:
        """Calculate quantum coherence measures"""
        # L1-norm coherence
        probabilities = [np.abs(amp) ** 2 for amp in statevector.data]
        diagonal_sum = sum(probabilities)
        off_diagonal_sum = sum(np.abs(amp) for amp in statevector.data) - np.sqrt(diagonal_sum)
        
        l1_coherence = off_diagonal_sum
        
        return {
            'l1_norm_coherence': float(l1_coherence),
            'relative_entropy_coherence': float(-sum(p * np.log2(p + 1e-16) for p in probabilities if p > 1e-16)),
            'coherence_basis': 'computational'
        }
    
    def _calculate_circuit_statistics(self, circuit_data: Dict) -> Dict:
        """Calculate circuit complexity and statistics"""
        gates = circuit_data.get('gates', [])
        
        # Gate counts
        gate_counts = {}
        for gate in gates:
            gate_type = gate.get('gate', 'unknown')
            gate_counts[gate_type] = gate_counts.get(gate_type, 0) + 1
        
        # Circuit depth (maximum position)
        circuit_depth = max((gate.get('position', 0) for gate in gates), default=0) + 1
        
        # Number of qubits
        num_qubits = max((gate.get('qubit', 0) for gate in gates), default=0) + 1
        
        return {
            'total_gates': len(gates),
            'gate_counts': gate_counts,
            'circuit_depth': circuit_depth,
            'num_qubits': num_qubits,
            'density': len(gates) / (num_qubits * circuit_depth) if circuit_depth > 0 else 0
        }
    
    def _empty_circuit_result(self) -> Dict:
        """Return result for empty circuit"""
        return {
            'steps': [{
                'step': 0,
                'operation': 'empty_circuit',
                'explanation': 'Empty circuit - no gates to simulate',
                'state_vector': [],
                'bloch_vectors': {},
                'probability_amplitudes': [],
                'measurement_probabilities': []
            }],
            'final_metrics': {
                'purity': 1.0,
                'entanglement': 0.0,
                'fidelity': 1.0
            },
            'entanglement_analysis': {'type': 'none', 'measure': 0.0},
            'coherence_measures': {'l1_norm_coherence': 0.0},
            'circuit_statistics': {'total_gates': 0, 'circuit_depth': 0, 'num_qubits': 0}
        }
    
    def _error_fallback_result(self, error_message: str) -> Dict:
        """Return safe fallback result for errors"""
        return {
            'steps': [{
                'step': 0,
                'operation': 'error',
                'explanation': f'Simulation error: {error_message}',
                'state_vector': [{'index': 0, 'amplitude': {'real': 1, 'imag': 0}, 'probability': 1.0, 'basis_state': '0'}],
                'bloch_vectors': {0: {'x': 0, 'y': 0, 'z': 1}},
                'probability_amplitudes': [{'index': 0, 'magnitude': 1.0, 'phase': 0.0, 'probability': 1.0}],
                'measurement_probabilities': [1.0]
            }],
            'final_metrics': {
                'purity': 1.0,
                'entanglement': 0.0,
                'fidelity': 1.0,
                'error': error_message
            },
            'entanglement_analysis': {'type': 'error', 'measure': 0.0},
            'coherence_measures': {'l1_norm_coherence': 0.0},
            'circuit_statistics': {'total_gates': 0, 'circuit_depth': 0, 'num_qubits': 1}
        }