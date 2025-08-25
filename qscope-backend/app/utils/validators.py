"""
Validation Functions for Qscope Backend
Provides input validation and data sanitization for quantum circuits and operations
"""

from typing import Dict, List, Any, Tuple, Optional
import logging
from flask import current_app

logger = logging.getLogger(__name__)

class CircuitValidator:
    """
    Validates quantum circuit data and ensures it meets system constraints
    """
    
    def __init__(self):
        """Initialize the circuit validator"""
        self.supported_gates = {'H', 'X', 'Y', 'Z', 'I'}
        self.max_qubits = 10  # Default, will be overridden by config
        self.max_gates = 100  # Default, will be overridden by config
    
    def validate_circuit(self, circuit_data: Dict) -> Dict:
        """
        Validate quantum circuit structure and constraints
        
        Args:
            circuit_data: Circuit specification to validate
            
        Returns:
            Validation result with errors, warnings, and statistics
        """
        result = {
            'valid': True,
            'errors': [],
            'warnings': [],
            'statistics': {}
        }
        
        try:
            # Update limits from config if available
            self._update_limits_from_config()
            
            # Basic structure validation
            if not self._validate_basic_structure(circuit_data, result):
                return result
            
            gates = circuit_data.get('gates', [])
            
            # Validate individual gates
            self._validate_gates(gates, result)
            
            # Validate circuit constraints
            self._validate_circuit_constraints(gates, result)
            
            # Calculate statistics
            result['statistics'] = self._calculate_statistics(gates)
            
            # Set overall validity
            result['valid'] = len(result['errors']) == 0
            
            return result
            
        except Exception as e:
            logger.error(f"Circuit validation error: {str(e)}")
            return {
                'valid': False,
                'errors': [f'Validation failed: {str(e)}'],
                'warnings': [],
                'statistics': {}
            }
    
    def validate_gate_data(self, gate_data: Dict) -> Tuple[bool, List[str]]:
        """
        Validate individual gate data
        
        Args:
            gate_data: Gate specification to validate
            
        Returns:
            Tuple of (is_valid, error_messages)
        """
        errors = []
        
        # Check required fields
        if 'gate' not in gate_data:
            errors.append("Gate type is required")
        
        if 'qubit' not in gate_data:
            errors.append("Qubit index is required")
        
        if 'position' not in gate_data:
            errors.append("Gate position is required")
        
        if errors:
            return False, errors
        
        # Validate gate type
        gate_type = gate_data.get('gate')
        if not isinstance(gate_type, str):
            errors.append("Gate type must be a string")
        elif gate_type not in self.supported_gates:
            errors.append(f"Unsupported gate type: {gate_type}")
        
        # Validate qubit index
        qubit = gate_data.get('qubit')
        if not isinstance(qubit, int):
            errors.append("Qubit index must be an integer")
        elif qubit < 0:
            errors.append("Qubit index must be non-negative")
        elif qubit >= self.max_qubits:
            errors.append(f"Qubit index {qubit} exceeds maximum {self.max_qubits-1}")
        
        # Validate position
        position = gate_data.get('position')
        if not isinstance(position, int):
            errors.append("Gate position must be an integer")
        elif position < 0:
            errors.append("Gate position must be non-negative")
        
        return len(errors) == 0, errors
    
    def validate_simulation_options(self, options: Dict) -> Tuple[bool, List[str]]:
        """
        Validate simulation options
        
        Args:
            options: Simulation options to validate
            
        Returns:
            Tuple of (is_valid, error_messages)
        """
        errors = []
        
        # Validate include_explanations
        if 'include_explanations' in options:
            if not isinstance(options['include_explanations'], bool):
                errors.append("include_explanations must be a boolean")
        
        # Validate detail_level
        if 'detail_level' in options:
            detail_level = options['detail_level']
            if not isinstance(detail_level, str):
                errors.append("detail_level must be a string")
            elif detail_level not in ['beginner', 'intermediate', 'advanced']:
                errors.append("detail_level must be 'beginner', 'intermediate', or 'advanced'")
        
        return len(errors) == 0, errors
    
    def sanitize_circuit_data(self, circuit_data: Dict) -> Dict:
        """
        Sanitize circuit data by removing invalid entries and fixing common issues
        
        Args:
            circuit_data: Circuit data to sanitize
            
        Returns:
            Sanitized circuit data
        """
        if not isinstance(circuit_data, dict):
            return {'gates': []}
        
        gates = circuit_data.get('gates', [])
        if not isinstance(gates, list):
            return {'gates': []}
        
        sanitized_gates = []
        
        for gate in gates:
            if not isinstance(gate, dict):
                continue
            
            # Sanitize gate data
            sanitized_gate = self._sanitize_gate_data(gate)
            if sanitized_gate:
                sanitized_gates.append(sanitized_gate)
        
        return {'gates': sanitized_gates}
    
    def _validate_basic_structure(self, circuit_data: Dict, result: Dict) -> bool:
        """Validate basic circuit structure"""
        if not isinstance(circuit_data, dict):
            result['errors'].append("Circuit data must be an object")
            return False
        
        if 'gates' not in circuit_data:
            result['errors'].append("Circuit must contain 'gates' field")
            return False
        
        gates = circuit_data['gates']
        if not isinstance(gates, list):
            result['errors'].append("Gates must be an array")
            return False
        
        return True
    
    def _validate_gates(self, gates: List[Dict], result: Dict):
        """Validate all gates in the circuit"""
        for i, gate in enumerate(gates):
            is_valid, gate_errors = self.validate_gate_data(gate)
            
            if not is_valid:
                for error in gate_errors:
                    result['errors'].append(f"Gate {i}: {error}")
    
    def _validate_circuit_constraints(self, gates: List[Dict], result: Dict):
        """Validate circuit-level constraints"""
        if len(gates) > self.max_gates:
            result['errors'].append(f"Circuit has {len(gates)} gates, maximum is {self.max_gates}")
        
        # Check qubit count
        if gates:
            max_qubit = max(gate.get('qubit', 0) for gate in gates)
            num_qubits = max_qubit + 1
            
            if num_qubits > self.max_qubits:
                result['errors'].append(f"Circuit uses {num_qubits} qubits, maximum is {self.max_qubits}")
        
        # Check for duplicate gates at same position and qubit
        positions = {}
        for i, gate in enumerate(gates):
            qubit = gate.get('qubit', 0)
            position = gate.get('position', 0)
            key = (qubit, position)
            
            if key in positions:
                result['warnings'].append(
                    f"Multiple gates on qubit {qubit} at position {position} "
                    f"(gates {positions[key]} and {i})"
                )
            else:
                positions[key] = i
    
    def _calculate_statistics(self, gates: List[Dict]) -> Dict:
        """Calculate circuit statistics"""
        if not gates:
            return {
                'total_gates': 0,
                'gate_counts': {},
                'circuit_depth': 0,
                'num_qubits': 0
            }
        
        # Gate counts
        gate_counts = {}
        for gate in gates:
            gate_type = gate.get('gate', 'unknown')
            gate_counts[gate_type] = gate_counts.get(gate_type, 0) + 1
        
        # Circuit depth
        circuit_depth = max(gate.get('position', 0) for gate in gates) + 1
        
        # Number of qubits
        num_qubits = max(gate.get('qubit', 0) for gate in gates) + 1
        
        return {
            'total_gates': len(gates),
            'gate_counts': gate_counts,
            'circuit_depth': circuit_depth,
            'num_qubits': num_qubits
        }
    
    def _sanitize_gate_data(self, gate: Dict) -> Optional[Dict]:
        """Sanitize individual gate data"""
        sanitized = {}
        
        # Sanitize gate type
        gate_type = gate.get('gate')
        if isinstance(gate_type, str) and gate_type in self.supported_gates:
            sanitized['gate'] = gate_type
        else:
            return None  # Invalid gate type
        
        # Sanitize qubit index
        qubit = gate.get('qubit')
        if isinstance(qubit, (int, float)):
            qubit_int = int(qubit)
            if 0 <= qubit_int < self.max_qubits:
                sanitized['qubit'] = qubit_int
            else:
                return None  # Invalid qubit index
        else:
            return None
        
        # Sanitize position
        position = gate.get('position')
        if isinstance(position, (int, float)):
            position_int = int(position)
            if position_int >= 0:
                sanitized['position'] = position_int
            else:
                sanitized['position'] = 0  # Fix negative position
        else:
            sanitized['position'] = 0  # Default position
        
        return sanitized
    
    def _update_limits_from_config(self):
        """Update validation limits from Flask config"""
        try:
            if current_app:
                self.max_qubits = current_app.config.get('MAX_QUBITS', 10)
                self.max_gates = current_app.config.get('MAX_GATES_PER_CIRCUIT', 100)
        except RuntimeError:
            # No application context, use defaults
            logger.debug("No Flask application context available, using default validation limits")

class StateValidator:
    """
    Validates quantum state data
    """
    
    @staticmethod
    def validate_statevector(statevector: List) -> Tuple[bool, List[str]]:
        """
        Validate quantum state vector
        
        Args:
            statevector: State vector to validate
            
        Returns:
            Tuple of (is_valid, error_messages)
        """
        errors = []
        
        if not isinstance(statevector, list):
            errors.append("State vector must be a list")
            return False, errors
        
        if len(statevector) == 0:
            errors.append("State vector cannot be empty")
            return False, errors
        
        # Check if length is power of 2
        if len(statevector) & (len(statevector) - 1) != 0:
            errors.append("State vector length must be a power of 2")
        
        # Check normalization (approximately)
        try:
            total_prob = sum(abs(amp)**2 for amp in statevector if amp is not None)
            if abs(total_prob - 1.0) > 1e-6:
                errors.append(f"State vector not normalized: total probability = {total_prob}")
        except (TypeError, ValueError) as e:
            errors.append(f"Invalid amplitude values: {str(e)}")
        
        return len(errors) == 0, errors

class AnalyticsValidator:
    """
    Validates analytics request data
    """
    
    @staticmethod
    def validate_analysis_request(data: Dict) -> Tuple[bool, List[str]]:
        """
        Validate analytics analysis request
        
        Args:
            data: Analysis request data
            
        Returns:
            Tuple of (is_valid, error_messages)
        """
        errors = []
        
        # Validate analysis type
        analysis_type = data.get('analysis_type', 'comprehensive')
        valid_types = ['comprehensive', 'basic', 'entanglement_only']
        
        if analysis_type not in valid_types:
            errors.append(f"Invalid analysis_type: {analysis_type}. Must be one of {valid_types}")
        
        # Validate metrics
        if 'metrics' in data:
            metrics = data['metrics']
            if not isinstance(metrics, list):
                errors.append("Metrics must be a list")
            else:
                valid_metrics = ['entanglement', 'purity', 'fidelity', 'coherence', 'entropy']
                invalid_metrics = [m for m in metrics if m not in valid_metrics]
                if invalid_metrics:
                    errors.append(f"Invalid metrics: {invalid_metrics}")
        
        return len(errors) == 0, errors

def validate_json_structure(data: Any, required_fields: List[str]) -> Tuple[bool, List[str]]:
    """
    Validate JSON structure has required fields
    
    Args:
        data: Data to validate
        required_fields: List of required field names
        
    Returns:
        Tuple of (is_valid, error_messages)
    """
    errors = []
    
    if not isinstance(data, dict):
        errors.append("Data must be a JSON object")
        return False, errors
    
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")
    
    return len(errors) == 0, errors

def sanitize_string(value: Any, max_length: int = 1000) -> str:
    """
    Sanitize string input
    
    Args:
        value: Value to sanitize
        max_length: Maximum allowed length
        
    Returns:
        Sanitized string
    """
    if value is None:
        return ""
    
    # Convert to string
    str_value = str(value)
    
    # Truncate if too long
    if len(str_value) > max_length:
        str_value = str_value[:max_length]
    
    # Remove potentially dangerous characters
    str_value = str_value.replace('\x00', '')  # Remove null bytes
    
    return str_value