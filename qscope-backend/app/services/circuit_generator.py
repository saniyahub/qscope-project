"""
Circuit Generator Service for QChat
Converts natural language descriptions to quantum circuits
"""

import re
import logging
from typing import Dict, List, Any, Optional
from qiskit import QuantumCircuit

logger = logging.getLogger(__name__)

class CircuitGenerator:
    """
    Service for generating quantum circuits from natural language descriptions
    """
    
    def __init__(self):
        """Initialize the circuit generator"""
        # Define common quantum circuit patterns
        self.patterns = {
            'bell_state': r'(bell|bell state|epr)',
            'hadamard': r'(hadamard|h gate|h\-gate)',
            'pauli_x': r'(pauli\-x|x gate|x\-gate|bit flip)',
            'pauli_y': r'(pauli\-y|y gate|y\-gate)',
            'pauli_z': r'(pauli\-z|z gate|z\-gate|phase flip)',
            'cnot': r'(cnot|controlled not|cx)',
            'measure': r'(measure|measurement)',
            'qubits': r'(\d+)\s*(qubit|qubits)'
        }
    
    def generate_from_description(self, description: str) -> Dict[str, Any]:
        """
        Generate a quantum circuit from a natural language description
        
        Args:
            description: Natural language description of the desired circuit
            
        Returns:
            Dictionary containing circuit data in multiple formats
        """
        try:
            # Convert description to lowercase for matching
            desc_lower = description.lower()
            
            # Determine number of qubits needed
            num_qubits = self._extract_qubit_count(desc_lower)
            
            # Create basic circuit
            qc = QuantumCircuit(num_qubits)
            
            # Apply gates based on description
            self._apply_gates_from_description(qc, desc_lower)
            
            # Convert to different formats
            # Use qasm() method if available, otherwise use qasm2.dumps()
            try:
                qasm_str = qc.qasm()
            except AttributeError:
                # Fallback for newer Qiskit versions
                from qiskit import qasm2
                qasm_str = qasm2.dumps(qc)
            
            json_representation = self._circuit_to_json(qc)
            
            return {
                'qasm': qasm_str,
                'json': json_representation,
                'qiskit_circuit': qc,
                'metadata': {
                    'num_qubits': num_qubits,
                    'description': description
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating circuit: {str(e)}")
            return {
                'error': str(e),
                'description': description
            }
    
    def _extract_qubit_count(self, description: str) -> int:
        """
        Extract the number of qubits from description
        
        Args:
            description: Circuit description
            
        Returns:
            Number of qubits to use
        """
        # Look for explicit qubit count
        qubit_match = re.search(self.patterns['qubits'], description)
        if qubit_match:
            return int(qubit_match.group(1))
        
        # Check for specific circuit patterns
        if re.search(self.patterns['bell_state'], description):
            return 2  # Bell state requires 2 qubits
        
        if re.search(self.patterns['cnot'], description):
            return 2  # CNOT typically requires 2 qubits
        
        # Default to 1 qubit
        return 1
    
    def _apply_gates_from_description(self, qc: QuantumCircuit, description: str):
        """
        Apply quantum gates to circuit based on description
        
        Args:
            qc: QuantumCircuit to modify
            description: Circuit description
        """
        # Handle Bell state circuit
        if re.search(self.patterns['bell_state'], description):
            if qc.num_qubits >= 2:
                qc.h(0)  # Hadamard on first qubit
                qc.cx(0, 1)  # CNOT with first as control, second as target
                
                # Add measurements if requested
                if re.search(self.patterns['measure'], description):
                    qc.measure_all()
            return
        
        # Apply Hadamard gates
        if re.search(self.patterns['hadamard'], description):
            # Apply to all qubits or just first one
            for i in range(min(2, qc.num_qubits)):  # Apply to at most 2 qubits
                qc.h(i)
        
        # Apply Pauli-X gates
        if re.search(self.patterns['pauli_x'], description):
            for i in range(min(1, qc.num_qubits)):  # Apply to at most 1 qubit
                qc.x(i)
        
        # Apply Pauli-Y gates
        if re.search(self.patterns['pauli_y'], description):
            for i in range(min(1, qc.num_qubits)):  # Apply to at most 1 qubit
                qc.y(i)
        
        # Apply Pauli-Z gates
        if re.search(self.patterns['pauli_z'], description):
            for i in range(min(1, qc.num_qubits)):  # Apply to at most 1 qubit
                qc.z(i)
        
        # Apply CNOT gates
        if re.search(self.patterns['cnot'], description):
            if qc.num_qubits >= 2:
                qc.cx(0, 1)  # CNOT with first as control, second as target
        
        # Add measurements if requested
        if re.search(self.patterns['measure'], description):
            qc.measure_all()
    
    def _circuit_to_json(self, qc: QuantumCircuit) -> Dict[str, Any]:
        """
        Convert Qiskit circuit to JSON representation
        
        Args:
            qc: QuantumCircuit to convert
            
        Returns:
            JSON representation of the circuit
        """
        gates = []
        
        # Extract gate information
        for instruction in qc.data:
            gate = instruction[0]
            qubits = [qc.find_bit(qubit).index for qubit in instruction[1]]
            
            gate_info = {
                'gate': gate.name.upper(),
                'qubits': qubits
            }
            
            # Add additional parameters if needed
            if hasattr(gate, 'params') and gate.params:
                gate_info['params'] = gate.params
            
            gates.append(gate_info)
        
        return {
            'gates': gates,
            'num_qubits': qc.num_qubits,
            'num_clbits': qc.num_clbits
        }