"""
Step Analyzer Service for Qscope Backend
Provides detailed step-by-step explanations of quantum operations
"""

import numpy as np
from typing import Dict, List, Any, Optional
from qiskit.quantum_info import Statevector
import logging

logger = logging.getLogger(__name__)

class StepAnalyzer:
    """
    Analyzes quantum operations step-by-step and provides educational explanations
    """
    
    def __init__(self):
        """Initialize the step analyzer"""
        self.gate_explanations = {
            'H': self._explain_hadamard,
            'X': self._explain_pauli_x,
            'Y': self._explain_pauli_y,
            'Z': self._explain_pauli_z,
            'I': self._explain_identity
        }
    
    def generate_detailed_explanation(self, gate: str, qubit: int, 
                                    before_state: Statevector, after_state: Statevector,
                                    difficulty_level: str = 'intermediate') -> Dict:
        """
        Generate comprehensive explanation for each quantum operation
        
        Args:
            gate: Gate type (H, X, Y, Z, I)
            qubit: Target qubit index
            before_state: Quantum state before gate application
            after_state: Quantum state after gate application
            difficulty_level: Explanation complexity (beginner, intermediate, advanced)
            
        Returns:
            Dictionary containing detailed explanations at multiple levels
        """
        try:
            explanation = {
                'gate_type': gate,
                'target_qubit': qubit,
                'difficulty_level': difficulty_level,
                'mathematical_operation': self._describe_mathematical_operation(gate, qubit),
                'physical_interpretation': self._describe_physical_effect(gate),
                'bloch_sphere_movement': self._describe_bloch_movement(gate),
                'amplitude_changes': self._describe_amplitude_changes(before_state, after_state),
                'probability_changes': self._describe_probability_changes(before_state, after_state),
                'phase_information': self._analyze_phase_changes(before_state, after_state),
                'entanglement_impact': self._analyze_entanglement_impact(before_state, after_state)
            }
            
            # Add gate-specific explanation
            if gate in self.gate_explanations:
                explanation['detailed_explanation'] = self.gate_explanations[gate](
                    qubit, before_state, after_state
                )
            
            return explanation
            
        except Exception as e:
            logger.error(f"Error generating explanation for gate {gate}: {str(e)}")
            return self._fallback_explanation(gate, qubit)
    
    def _describe_mathematical_operation(self, gate: str, qubit: int) -> Dict:
        """Describe the mathematical operation of the gate"""
        operations = {
            'H': {
                'matrix': '(1/√2)[[1, 1], [1, -1]]',
                'action': 'H|0⟩ = (|0⟩ + |1⟩)/√2, H|1⟩ = (|0⟩ - |1⟩)/√2'
            },
            'X': {
                'matrix': '[[0, 1], [1, 0]]',
                'action': 'X|0⟩ = |1⟩, X|1⟩ = |0⟩'
            },
            'Y': {
                'matrix': '[[0, -i], [i, 0]]',
                'action': 'Y|0⟩ = i|1⟩, Y|1⟩ = -i|0⟩'
            },
            'Z': {
                'matrix': '[[1, 0], [0, -1]]',
                'action': 'Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩'
            },
            'I': {
                'matrix': '[[1, 0], [0, 1]]',
                'action': 'I|0⟩ = |0⟩, I|1⟩ = |1⟩'
            }
        }
        
        op = operations.get(gate, operations['I'])
        return {
            'description': f"Apply {gate} gate to qubit {qubit}",
            'matrix_representation': op['matrix'],
            'action_on_basis': op['action']
        }
    
    def _describe_physical_effect(self, gate: str) -> Dict:
        """Describe the physical interpretation of the gate"""
        effects = {
            'H': 'Creates superposition - equal probability amplitudes for |0⟩ and |1⟩',
            'X': 'Bit flip operation - rotates 180° around X-axis on Bloch sphere',
            'Y': 'Bit and phase flip - rotates 180° around Y-axis with complex phase',
            'Z': 'Phase flip operation - rotates 180° around Z-axis',
            'I': 'Identity operation - no change to the quantum state'
        }
        
        return {
            'description': effects.get(gate, 'Unknown gate operation'),
            'bloch_sphere_action': self._get_bloch_sphere_action(gate)
        }
    
    def _describe_bloch_movement(self, gate: str) -> Dict:
        """Describe how the Bloch vector moves"""
        movements = {
            'H': {'axis': 'Y then X', 'angle': '90° then 180°', 'description': 'To equator'},
            'X': {'axis': 'X', 'angle': '180°', 'description': 'Flip across XZ-plane'},
            'Y': {'axis': 'Y', 'angle': '180°', 'description': 'Rotate around Y-axis'},
            'Z': {'axis': 'Z', 'angle': '180°', 'description': 'Flip across XY-plane'},
            'I': {'axis': 'none', 'angle': '0°', 'description': 'No movement'}
        }
        
        return movements.get(gate, {'axis': 'unknown', 'angle': '0°', 'description': 'Unknown'})
    
    def _describe_amplitude_changes(self, before_state: Statevector, after_state: Statevector) -> List[Dict]:
        """Describe changes in probability amplitudes"""
        changes = []
        
        for i, (before_amp, after_amp) in enumerate(zip(before_state.data, after_state.data)):
            basis_state = format(i, f'0{int(np.log2(len(before_state.data)))}b')
            
            changes.append({
                'basis_state': f'|{basis_state}⟩',
                'before_magnitude': float(np.abs(before_amp)),
                'after_magnitude': float(np.abs(after_amp)),
                'magnitude_change': float(np.abs(after_amp) - np.abs(before_amp)),
                'before_phase': float(np.angle(before_amp)),
                'after_phase': float(np.angle(after_amp)),
                'phase_change': float(np.angle(after_amp) - np.angle(before_amp))
            })
        
        return changes
    
    def _describe_probability_changes(self, before_state: Statevector, after_state: Statevector) -> Dict:
        """Describe changes in measurement probabilities"""
        before_probs = [np.abs(amp)**2 for amp in before_state.data]
        after_probs = [np.abs(amp)**2 for amp in after_state.data]
        
        changes = []
        for i, (before_prob, after_prob) in enumerate(zip(before_probs, after_probs)):
            basis_state = format(i, f'0{int(np.log2(len(before_state.data)))}b')
            changes.append({
                'basis_state': f'|{basis_state}⟩',
                'before_probability': float(before_prob),
                'after_probability': float(after_prob),
                'change': float(after_prob - before_prob)
            })
        
        return {'individual_changes': changes}
    
    def _analyze_phase_changes(self, before_state: Statevector, after_state: Statevector) -> Dict:
        """Analyze phase changes in the quantum state"""
        phase_changes = []
        
        for i, (before_amp, after_amp) in enumerate(zip(before_state.data, after_state.data)):
            if np.abs(before_amp) > 1e-10 and np.abs(after_amp) > 1e-10:
                phase_diff = np.angle(after_amp) - np.angle(before_amp)
                basis_state = format(i, f'0{int(np.log2(len(before_state.data)))}b')
                
                phase_changes.append({
                    'basis_state': f'|{basis_state}⟩',
                    'phase_change': float(phase_diff)
                })
        
        return {'phase_changes': phase_changes}
    
    def _analyze_entanglement_impact(self, before_state: Statevector, after_state: Statevector) -> Dict:
        """Analyze how the operation affects entanglement"""
        num_qubits = int(np.log2(len(before_state.data)))
        
        if num_qubits < 2:
            return {
                'description': 'Single qubit operation - no entanglement possible',
                'type': 'local_operation'
            }
        
        return {
            'description': 'Local single-qubit operation - entanglement structure preserved',
            'type': 'local_operation'
        }
    
    def _explain_hadamard(self, qubit: int, state_before: Statevector, state_after: Statevector) -> str:
        return f"""
        Hadamard Gate Applied to Qubit {qubit}:
        
        Mathematical Operation:
        H|ψ⟩ = (1/√2)(|0⟩ + |1⟩) when applied to |0⟩
        H|ψ⟩ = (1/√2)(|0⟩ - |1⟩) when applied to |1⟩
        
        Effect: Creates equal superposition between |0⟩ and |1⟩ states
        Bloch Sphere: Rotates 90° around Y-axis, then 180° around X-axis
        Physical Meaning: Puts qubit in maximum uncertainty state
        """
    
    def _explain_pauli_x(self, qubit: int, state_before: Statevector, state_after: Statevector) -> str:
        return f"""
        Pauli-X Gate Applied to Qubit {qubit}:
        
        Mathematical Operation:
        X|0⟩ = |1⟩
        X|1⟩ = |0⟩
        
        Effect: Bit flip operation (quantum NOT gate)
        Bloch Sphere: 180° rotation around X-axis
        Physical Meaning: Flips the computational basis state
        """
    
    def _explain_pauli_y(self, qubit: int, state_before: Statevector, state_after: Statevector) -> str:
        return f"""
        Pauli-Y Gate Applied to Qubit {qubit}:
        
        Mathematical Operation:
        Y|0⟩ = i|1⟩
        Y|1⟩ = -i|0⟩
        
        Effect: Bit flip with phase change
        Bloch Sphere: 180° rotation around Y-axis
        Physical Meaning: Combines bit flip with π/2 phase shift
        """
    
    def _explain_pauli_z(self, qubit: int, state_before: Statevector, state_after: Statevector) -> str:
        return f"""
        Pauli-Z Gate Applied to Qubit {qubit}:
        
        Mathematical Operation:
        Z|0⟩ = |0⟩
        Z|1⟩ = -|1⟩
        
        Effect: Phase flip operation
        Bloch Sphere: 180° rotation around Z-axis
        Physical Meaning: Adds π phase to |1⟩ component
        """
    
    def _explain_identity(self, qubit: int, state_before: Statevector, state_after: Statevector) -> str:
        return f"""
        Identity Gate Applied to Qubit {qubit}:
        
        Mathematical Operation:
        I|0⟩ = |0⟩
        I|1⟩ = |1⟩
        
        Effect: No operation - state remains unchanged
        Bloch Sphere: No rotation
        Physical Meaning: Placeholder operation for timing
        """
    
    def _get_bloch_sphere_action(self, gate: str) -> str:
        """Get Bloch sphere action description"""
        actions = {
            'H': 'Rotation to equator, creating equal superposition',
            'X': '180° rotation around X-axis (bit flip)',
            'Y': '180° rotation around Y-axis (bit + phase flip)',
            'Z': '180° rotation around Z-axis (phase flip)',
            'I': 'No rotation - vector unchanged'
        }
        return actions.get(gate, 'Unknown rotation')
    
    def _fallback_explanation(self, gate: str, qubit: int) -> Dict:
        """Fallback explanation for errors"""
        return {
            'gate_type': gate,
            'target_qubit': qubit,
            'error': 'Unable to generate detailed explanation',
            'basic_description': f'{gate} gate applied to qubit {qubit}'
        }