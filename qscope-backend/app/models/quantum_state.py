"""
Quantum State Models for Qscope Backend
Data models for quantum state representation and validation
"""

from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, field
import numpy as np
from enum import Enum

class GateType(Enum):
    """Enumeration of supported quantum gate types"""
    HADAMARD = "H"
    PAULI_X = "X"
    PAULI_Y = "Y"
    PAULI_Z = "Z"
    IDENTITY = "I"

@dataclass
class ComplexAmplitude:
    """Represents a complex number amplitude"""
    real: float
    imag: float
    
    @property
    def magnitude(self) -> float:
        """Calculate magnitude of complex amplitude"""
        return np.sqrt(self.real**2 + self.imag**2)
    
    @property
    def phase(self) -> float:
        """Calculate phase of complex amplitude"""
        return np.arctan2(self.imag, self.real)
    
    @property
    def probability(self) -> float:
        """Calculate probability (|amplitude|²)"""
        return self.magnitude**2
    
    def to_complex(self) -> complex:
        """Convert to Python complex number"""
        return complex(self.real, self.imag)
    
    @classmethod
    def from_complex(cls, c: Union[complex, float, int]) -> 'ComplexAmplitude':
        """Create from Python complex number"""
        if isinstance(c, (int, float)):
            return cls(real=float(c), imag=0.0)
        return cls(real=float(c.real), imag=float(c.imag))
    
    def to_dict(self) -> Dict[str, float]:
        """Convert to dictionary for JSON serialization"""
        return {
            'real': self.real,
            'imag': self.imag,
            'magnitude': self.magnitude,
            'phase': self.phase,
            'probability': self.probability
        }

@dataclass
class BlochVector:
    """Represents a point on the Bloch sphere"""
    x: float
    y: float
    z: float
    
    @property
    def magnitude(self) -> float:
        """Calculate magnitude of Bloch vector"""
        return np.sqrt(self.x**2 + self.y**2 + self.z**2)
    
    @property
    def theta(self) -> float:
        """Polar angle (theta) in spherical coordinates"""
        return np.arccos(self.z / max(self.magnitude, 1e-10))
    
    @property
    def phi(self) -> float:
        """Azimuthal angle (phi) in spherical coordinates"""
        return np.arctan2(self.y, self.x)
    
    def to_dict(self) -> Dict[str, float]:
        """Convert to dictionary for JSON serialization"""
        return {
            'x': self.x,
            'y': self.y,
            'z': self.z,
            'magnitude': self.magnitude,
            'theta': self.theta,
            'phi': self.phi
        }
    
    def normalize(self) -> 'BlochVector':
        """Return normalized Bloch vector"""
        mag = self.magnitude
        if mag < 1e-10:
            return BlochVector(0, 0, 1)  # Default to |0⟩ state
        return BlochVector(self.x/mag, self.y/mag, self.z/mag)

@dataclass
class QuantumState:
    """Represents a quantum state with amplitudes and metadata"""
    amplitudes: List[ComplexAmplitude]
    num_qubits: int
    timestamp: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Validate quantum state after initialization"""
        expected_size = 2**self.num_qubits
        if len(self.amplitudes) != expected_size:
            raise ValueError(f"Expected {expected_size} amplitudes for {self.num_qubits} qubits, got {len(self.amplitudes)}")
    
    @property
    def probabilities(self) -> List[float]:
        """Get measurement probabilities"""
        return [amp.probability for amp in self.amplitudes]
    
    @property
    def is_normalized(self) -> bool:
        """Check if state is normalized"""
        total_prob = sum(self.probabilities)
        return abs(total_prob - 1.0) < 1e-10
    
    @property
    def purity(self) -> float:
        """Calculate purity of the quantum state"""
        return sum(prob**2 for prob in self.probabilities)
    
    @property
    def von_neumann_entropy(self) -> float:
        """Calculate von Neumann entropy"""
        entropy = 0
        for prob in self.probabilities:
            if prob > 1e-16:
                entropy -= prob * np.log2(prob)
        return entropy
    
    def get_bloch_vector(self, qubit_index: int) -> BlochVector:
        """Get Bloch vector for specific qubit"""
        if qubit_index >= self.num_qubits:
            raise ValueError(f"Qubit index {qubit_index} out of range")
        
        if self.num_qubits == 1:
            # Single qubit case
            alpha = self.amplitudes[0]
            beta = self.amplitudes[1]
            
            x = 2 * (alpha.real * beta.real + alpha.imag * beta.imag)
            y = 2 * (alpha.imag * beta.real - alpha.real * beta.imag)
            z = alpha.probability - beta.probability
            
            return BlochVector(x, y, z)
        else:
            # Multi-qubit case - calculate reduced state
            # This is a simplified implementation
            probs_0 = sum(prob for i, prob in enumerate(self.probabilities) 
                         if not (i >> qubit_index) & 1)
            probs_1 = sum(prob for i, prob in enumerate(self.probabilities) 
                         if (i >> qubit_index) & 1)
            
            z = probs_0 - probs_1
            
            # Calculate x and y components (simplified)
            x = y = 0  # Would need proper reduced density matrix calculation
            
            return BlochVector(x, y, z)
    
    def get_all_bloch_vectors(self) -> Dict[int, BlochVector]:
        """Get Bloch vectors for all qubits"""
        return {i: self.get_bloch_vector(i) for i in range(self.num_qubits)}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'amplitudes': [amp.to_dict() for amp in self.amplitudes],
            'num_qubits': self.num_qubits,
            'probabilities': self.probabilities,
            'bloch_vectors': {str(i): vec.to_dict() for i, vec in self.get_all_bloch_vectors().items()},
            'metrics': {
                'purity': self.purity,
                'von_neumann_entropy': self.von_neumann_entropy,
                'is_normalized': self.is_normalized
            },
            'timestamp': self.timestamp,
            'metadata': self.metadata
        }
    
    @classmethod
    def from_statevector(cls, statevector: List[Union[complex, float]], 
                        metadata: Optional[Dict] = None) -> 'QuantumState':
        """Create QuantumState from state vector"""
        if not statevector:
            raise ValueError("State vector cannot be empty")
        
        num_qubits = int(np.log2(len(statevector)))
        if 2**num_qubits != len(statevector):
            raise ValueError(f"State vector length {len(statevector)} is not a power of 2")
        
        amplitudes = [ComplexAmplitude.from_complex(amp) for amp in statevector]
        
        return cls(
            amplitudes=amplitudes,
            num_qubits=num_qubits,
            metadata=metadata or {}
        )
    
    @classmethod
    def ground_state(cls, num_qubits: int) -> 'QuantumState':
        """Create ground state |00...0⟩"""
        size = 2**num_qubits
        amplitudes = [ComplexAmplitude(0, 0) for _ in range(size)]
        amplitudes[0] = ComplexAmplitude(1, 0)  # |00...0⟩ has amplitude 1
        
        return cls(amplitudes=amplitudes, num_qubits=num_qubits)

@dataclass
class QuantumMetrics:
    """Container for quantum information metrics"""
    purity: float
    von_neumann_entropy: float
    linear_entropy: float
    participation_ratio: float
    entanglement_measure: float = 0.0
    fidelity: float = 1.0
    trace_distance: float = 0.0
    
    def to_dict(self) -> Dict[str, float]:
        """Convert to dictionary for JSON serialization"""
        return {
            'purity': self.purity,
            'von_neumann_entropy': self.von_neumann_entropy,
            'linear_entropy': self.linear_entropy,
            'participation_ratio': self.participation_ratio,
            'entanglement_measure': self.entanglement_measure,
            'fidelity': self.fidelity,
            'trace_distance': self.trace_distance
        }
    
    @classmethod
    def from_quantum_state(cls, state: QuantumState, reference_state: Optional[QuantumState] = None) -> 'QuantumMetrics':
        """Calculate metrics from quantum state"""
        purity = state.purity
        von_neumann_entropy = state.von_neumann_entropy
        linear_entropy = 1 - purity
        
        # Participation ratio
        probabilities = state.probabilities
        participation_ratio = 1 / sum(p**2 for p in probabilities) if probabilities else 1
        
        # Calculate relative metrics if reference state provided
        fidelity = 1.0
        trace_distance = 0.0
        
        if reference_state:
            # Simplified fidelity calculation
            overlap = sum(
                (a1.real * a2.real + a1.imag * a2.imag) 
                for a1, a2 in zip(state.amplitudes, reference_state.amplitudes)
            )
            fidelity = abs(overlap)**2
            trace_distance = np.sqrt(1 - fidelity)
        
        # Entanglement measure (simplified for multi-qubit)
        entanglement_measure = 0.0
        if state.num_qubits > 1:
            # Use von Neumann entropy as entanglement measure for simplicity
            entanglement_measure = min(von_neumann_entropy, state.num_qubits)
        
        return cls(
            purity=purity,
            von_neumann_entropy=von_neumann_entropy,
            linear_entropy=linear_entropy,
            participation_ratio=participation_ratio,
            entanglement_measure=entanglement_measure,
            fidelity=fidelity,
            trace_distance=trace_distance
        )

@dataclass
class SimulationStep:
    """Represents a single step in quantum circuit simulation"""
    step_number: int
    operation: str
    target_qubit: Optional[int]
    gate_type: Optional[GateType]
    state_before: QuantumState
    state_after: QuantumState
    explanation: str
    metrics: QuantumMetrics
    gate_matrix: Optional[List[List[Dict[str, float]]]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'step_number': self.step_number,
            'operation': self.operation,
            'target_qubit': self.target_qubit,
            'gate_type': self.gate_type.value if self.gate_type else None,
            'state_before': self.state_before.to_dict(),
            'state_after': self.state_after.to_dict(),
            'explanation': self.explanation,
            'metrics': self.metrics.to_dict(),
            'gate_matrix': self.gate_matrix
        }