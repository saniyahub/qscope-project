"""
Quantum Circuit Models for Qscope Backend
Data models for quantum circuit representation and validation
"""

from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, field
from enum import Enum
import json

class GateType(Enum):
    """Enumeration of supported quantum gate types"""
    HADAMARD = "H"
    PAULI_X = "X"
    PAULI_Y = "Y"
    PAULI_Z = "Z"
    IDENTITY = "I"
    
    @classmethod
    def from_string(cls, gate_str: str) -> 'GateType':
        """Create GateType from string"""
        gate_map = {
            'H': cls.HADAMARD,
            'X': cls.PAULI_X,
            'Y': cls.PAULI_Y,
            'Z': cls.PAULI_Z,
            'I': cls.IDENTITY,
            'h': cls.HADAMARD,  # Support lowercase
            'x': cls.PAULI_X,
            'y': cls.PAULI_Y,
            'z': cls.PAULI_Z,
            'i': cls.IDENTITY,
            'id': cls.IDENTITY  # Qiskit format
        }
        
        if gate_str not in gate_map:
            raise ValueError(f"Unsupported gate type: {gate_str}")
        
        return gate_map[gate_str]

@dataclass
class QuantumGate:
    """Represents a quantum gate in a circuit"""
    gate_type: GateType
    target_qubit: int
    position: int
    parameters: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Validate gate after initialization"""
        if self.target_qubit < 0:
            raise ValueError("Target qubit must be non-negative")
        if self.position < 0:
            raise ValueError("Gate position must be non-negative")
    
    @property
    def gate_name(self) -> str:
        """Get gate name as string"""
        return self.gate_type.value
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'gate': self.gate_type.value,
            'qubit': self.target_qubit,
            'position': self.position,
            'parameters': self.parameters,
            'metadata': self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'QuantumGate':
        """Create QuantumGate from dictionary"""
        gate_type = GateType.from_string(data['gate'])
        
        return cls(
            gate_type=gate_type,
            target_qubit=data['qubit'],
            position=data['position'],
            parameters=data.get('parameters', {}),
            metadata=data.get('metadata', {})
        )
    
    def copy(self) -> 'QuantumGate':
        """Create a copy of the gate"""
        return QuantumGate(
            gate_type=self.gate_type,
            target_qubit=self.target_qubit,
            position=self.position,
            parameters=self.parameters.copy(),
            metadata=self.metadata.copy()
        )

@dataclass
class QuantumCircuit:
    """Represents a quantum circuit"""
    gates: List[QuantumGate] = field(default_factory=list)
    num_qubits: Optional[int] = None
    name: str = ""
    description: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Calculate circuit properties after initialization"""
        if self.num_qubits is None:
            self.num_qubits = self.calculate_num_qubits()
    
    def calculate_num_qubits(self) -> int:
        """Calculate number of qubits used in circuit"""
        if not self.gates:
            return 2  # Default minimum
        return max(gate.target_qubit for gate in self.gates) + 1
    
    @property
    def depth(self) -> int:
        """Get circuit depth (maximum position + 1)"""
        if not self.gates:
            return 0
        return max(gate.position for gate in self.gates) + 1
    
    @property
    def gate_count(self) -> int:
        """Get total number of gates"""
        return len(self.gates)
    
    @property
    def gate_types_used(self) -> List[str]:
        """Get list of unique gate types used"""
        return list(set(gate.gate_name for gate in self.gates))
    
    def add_gate(self, gate: QuantumGate) -> None:
        """Add a gate to the circuit"""
        self.gates.append(gate)
        # Update num_qubits if necessary
        if gate.target_qubit >= self.num_qubits:
            self.num_qubits = gate.target_qubit + 1
    
    def remove_gate(self, gate_index: int) -> Optional[QuantumGate]:
        """Remove gate at index and return it"""
        if 0 <= gate_index < len(self.gates):
            removed_gate = self.gates.pop(gate_index)
            # Recalculate num_qubits
            self.num_qubits = self.calculate_num_qubits()
            return removed_gate
        return None
    
    def get_gates_at_position(self, position: int) -> List[QuantumGate]:
        """Get all gates at a specific position"""
        return [gate for gate in self.gates if gate.position == position]
    
    def get_gates_on_qubit(self, qubit: int) -> List[QuantumGate]:
        """Get all gates acting on a specific qubit"""
        return [gate for gate in self.gates if gate.target_qubit == qubit]
    
    def get_sorted_gates(self) -> List[QuantumGate]:
        """Get gates sorted by position"""
        return sorted(self.gates, key=lambda g: g.position)
    
    def get_gate_statistics(self) -> Dict[str, Any]:
        """Get circuit statistics"""
        gate_counts = {}
        for gate in self.gates:
            gate_name = gate.gate_name
            gate_counts[gate_name] = gate_counts.get(gate_name, 0) + 1
        
        return {
            'total_gates': self.gate_count,
            'gate_counts': gate_counts,
            'circuit_depth': self.depth,
            'num_qubits': self.num_qubits,
            'gate_types': self.gate_types_used,
            'density': self.gate_count / (self.num_qubits * self.depth) if self.depth > 0 else 0
        }
    
    def validate(self) -> Dict[str, Any]:
        """Validate circuit and return validation result"""
        errors = []
        warnings = []
        
        # Check for empty circuit
        if not self.gates:
            warnings.append("Circuit is empty")
        
        # Check for gates at negative positions
        negative_positions = [i for i, gate in enumerate(self.gates) if gate.position < 0]
        if negative_positions:
            errors.append(f"Gates at negative positions: {negative_positions}")
        
        # Check for gates on negative qubits
        negative_qubits = [i for i, gate in enumerate(self.gates) if gate.target_qubit < 0]
        if negative_qubits:
            errors.append(f"Gates on negative qubits: {negative_qubits}")
        
        # Check for overlapping gates on same qubit at same position
        position_qubit_map = {}
        for i, gate in enumerate(self.gates):
            key = (gate.position, gate.target_qubit)
            if key in position_qubit_map:
                warnings.append(
                    f"Overlapping gates at position {gate.position}, qubit {gate.target_qubit}: "
                    f"gates {position_qubit_map[key]} and {i}"
                )
            else:
                position_qubit_map[key] = i
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'statistics': self.get_gate_statistics()
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'gates': [gate.to_dict() for gate in self.gates],
            'num_qubits': self.num_qubits,
            'name': self.name,
            'description': self.description,
            'metadata': self.metadata,
            'statistics': self.get_gate_statistics()
        }
    
    def to_json(self, indent: int = 2) -> str:
        """Convert to JSON string"""
        return json.dumps(self.to_dict(), indent=indent)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'QuantumCircuit':
        """Create QuantumCircuit from dictionary"""
        gates = [QuantumGate.from_dict(gate_data) for gate_data in data.get('gates', [])]
        
        return cls(
            gates=gates,
            num_qubits=data.get('num_qubits'),
            name=data.get('name', ''),
            description=data.get('description', ''),
            metadata=data.get('metadata', {})
        )
    
    @classmethod
    def from_json(cls, json_str: str) -> 'QuantumCircuit':
        """Create QuantumCircuit from JSON string"""
        data = json.loads(json_str)
        return cls.from_dict(data)
    
    @classmethod
    def empty_circuit(cls, num_qubits: int = 2, name: str = "Empty Circuit") -> 'QuantumCircuit':
        """Create an empty circuit with specified number of qubits"""
        return cls(
            gates=[],
            num_qubits=num_qubits,
            name=name,
            description="Empty quantum circuit"
        )
    
    def copy(self) -> 'QuantumCircuit':
        """Create a deep copy of the circuit"""
        return QuantumCircuit(
            gates=[gate.copy() for gate in self.gates],
            num_qubits=self.num_qubits,
            name=self.name,
            description=self.description,
            metadata=self.metadata.copy()
        )
    
    def clear(self) -> None:
        """Remove all gates from the circuit"""
        self.gates.clear()
        self.num_qubits = 2  # Reset to default

@dataclass
class CircuitTemplate:
    """Template for common quantum circuits"""
    name: str
    description: str
    circuit: QuantumCircuit
    category: str = "general"
    difficulty: str = "beginner"
    educational_notes: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'name': self.name,
            'description': self.description,
            'circuit': self.circuit.to_dict(),
            'category': self.category,
            'difficulty': self.difficulty,
            'educational_notes': self.educational_notes
        }
    
    @classmethod
    def bell_state_template(cls) -> 'CircuitTemplate':
        """Create Bell state preparation template"""
        circuit = QuantumCircuit.empty_circuit(2, "Bell State")
        circuit.add_gate(QuantumGate(GateType.HADAMARD, 0, 0))
        # Note: CNOT gate would be added here in a full implementation
        
        return cls(
            name="Bell State Preparation",
            description="Creates a maximally entangled Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2",
            circuit=circuit,
            category="entanglement",
            difficulty="beginner",
            educational_notes=[
                "Bell states are maximally entangled two-qubit states",
                "Measurement of one qubit instantly determines the other",
                "Foundation for quantum teleportation and quantum cryptography"
            ]
        )
    
    @classmethod
    def superposition_template(cls) -> 'CircuitTemplate':
        """Create superposition demonstration template"""
        circuit = QuantumCircuit.empty_circuit(1, "Superposition")
        circuit.add_gate(QuantumGate(GateType.HADAMARD, 0, 0))
        
        return cls(
            name="Superposition Demo",
            description="Demonstrates quantum superposition using Hadamard gate",
            circuit=circuit,
            category="basics",
            difficulty="beginner",
            educational_notes=[
                "Superposition allows qubits to exist in multiple states simultaneously",
                "Hadamard gate creates equal superposition of |0⟩ and |1⟩",
                "Measurement collapses superposition to definite state"
            ]
        )