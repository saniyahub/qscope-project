"""
Mathematical Helper Functions for Qscope Backend
Provides utility functions for quantum computations and complex number operations
"""

import numpy as np
from typing import Dict, List, Any, Union
import cmath

def complex_to_dict(complex_num: Union[complex, np.complex128, float, int]) -> Dict[str, float]:
    """
    Convert complex number to dictionary for JSON serialization
    
    Args:
        complex_num: Complex number to convert
        
    Returns:
        Dictionary with 'real' and 'imag' keys
    """
    if isinstance(complex_num, (int, float)):
        return {'real': float(complex_num), 'imag': 0.0}
    
    return {
        'real': float(np.real(complex_num)),
        'imag': float(np.imag(complex_num))
    }

def format_complex_number(complex_num: Union[complex, np.complex128], precision: int = 6) -> str:
    """
    Format complex number as human-readable string
    
    Args:
        complex_num: Complex number to format
        precision: Number of decimal places
        
    Returns:
        Formatted string representation
    """
    real = np.real(complex_num)
    imag = np.imag(complex_num)
    
    # Handle special cases
    if abs(imag) < 1e-10:
        return f"{real:.{precision}f}"
    elif abs(real) < 1e-10:
        if abs(imag - 1) < 1e-10:
            return "i"
        elif abs(imag + 1) < 1e-10:
            return "-i"
        else:
            return f"{imag:.{precision}f}i"
    else:
        if imag >= 0:
            if abs(imag - 1) < 1e-10:
                return f"{real:.{precision}f} + i"
            else:
                return f"{real:.{precision}f} + {imag:.{precision}f}i"
        else:
            if abs(imag + 1) < 1e-10:
                return f"{real:.{precision}f} - i"
            else:
                return f"{real:.{precision}f} - {abs(imag):.{precision}f}i"

def normalize_statevector(statevector: List[complex]) -> List[complex]:
    """
    Normalize a quantum state vector
    
    Args:
        statevector: List of complex amplitudes
        
    Returns:
        Normalized state vector
    """
    norm = np.sqrt(sum(abs(amp)**2 for amp in statevector))
    if norm == 0:
        return statevector
    return [amp / norm for amp in statevector]

def calculate_fidelity(state1: List[complex], state2: List[complex]) -> float:
    """
    Calculate fidelity between two quantum states
    
    Args:
        state1: First quantum state
        state2: Second quantum state
        
    Returns:
        Fidelity value between 0 and 1
    """
    if len(state1) != len(state2):
        raise ValueError("States must have the same dimension")
    
    # Calculate inner product
    inner_product = sum(np.conj(amp1) * amp2 for amp1, amp2 in zip(state1, state2))
    
    # Fidelity is |⟨ψ₁|ψ₂⟩|²
    return float(abs(inner_product) ** 2)

def calculate_trace_distance(state1: List[complex], state2: List[complex]) -> float:
    """
    Calculate trace distance between two quantum states
    
    Args:
        state1: First quantum state
        state2: Second quantum state
        
    Returns:
        Trace distance value between 0 and 1
    """
    if len(state1) != len(state2):
        raise ValueError("States must have the same dimension")
    
    # For pure states, trace distance = sqrt(1 - fidelity)
    fidelity = calculate_fidelity(state1, state2)
    return float(np.sqrt(1 - fidelity))

def tensor_product(matrix1: np.ndarray, matrix2: np.ndarray) -> np.ndarray:
    """
    Calculate tensor product of two matrices
    
    Args:
        matrix1: First matrix
        matrix2: Second matrix
        
    Returns:
        Tensor product matrix
    """
    return np.kron(matrix1, matrix2)

def get_pauli_matrices() -> Dict[str, np.ndarray]:
    """
    Get Pauli matrices
    
    Returns:
        Dictionary of Pauli matrices
    """
    return {
        'I': np.array([[1, 0], [0, 1]], dtype=complex),
        'X': np.array([[0, 1], [1, 0]], dtype=complex),
        'Y': np.array([[0, -1j], [1j, 0]], dtype=complex),
        'Z': np.array([[1, 0], [0, -1]], dtype=complex)
    }

def get_gate_definitions() -> Dict[str, Dict]:
    """
    Get comprehensive gate definitions with properties
    
    Returns:
        Dictionary of gate definitions
    """
    pauli_matrices = get_pauli_matrices()
    
    return {
        'I': {
            'name': 'Identity',
            'matrix': pauli_matrices['I'].tolist(),
            'description': 'Identity gate - no operation',
            'category': 'pauli',
            'hermitian': True,
            'unitary': True
        },
        'X': {
            'name': 'Pauli-X',
            'matrix': pauli_matrices['X'].tolist(),
            'description': 'Bit flip gate - quantum NOT',
            'category': 'pauli',
            'hermitian': True,
            'unitary': True
        },
        'Y': {
            'name': 'Pauli-Y',
            'matrix': pauli_matrices['Y'].tolist(),
            'description': 'Bit and phase flip gate',
            'category': 'pauli',
            'hermitian': True,
            'unitary': True
        },
        'Z': {
            'name': 'Pauli-Z',
            'matrix': pauli_matrices['Z'].tolist(),
            'description': 'Phase flip gate',
            'category': 'pauli',
            'hermitian': True,
            'unitary': True
        },
        'H': {
            'name': 'Hadamard',
            'matrix': (np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)).tolist(),
            'description': 'Hadamard gate - creates superposition',
            'category': 'clifford',
            'hermitian': True,
            'unitary': True
        }
    }

def bloch_vector_from_statevector(statevector: List[complex], qubit_index: int = 0) -> Dict[str, float]:
    """
    Calculate Bloch vector components from state vector
    
    Args:
        statevector: Quantum state vector
        qubit_index: Index of qubit to calculate Bloch vector for
        
    Returns:
        Dictionary with x, y, z components
    """
    n_qubits = int(np.log2(len(statevector)))
    
    if qubit_index >= n_qubits:
        raise ValueError(f"Qubit index {qubit_index} out of range for {n_qubits}-qubit system")
    
    # For single qubit, calculate directly
    if n_qubits == 1:
        alpha = statevector[0]  # amplitude of |0⟩
        beta = statevector[1]   # amplitude of |1⟩
        
        x = 2 * np.real(np.conj(alpha) * beta)
        y = 2 * np.imag(np.conj(alpha) * beta)
        z = abs(alpha)**2 - abs(beta)**2
        
        return {'x': float(x), 'y': float(y), 'z': float(z)}
    
    # For multi-qubit, calculate partial expectation values
    pauli = get_pauli_matrices()
    
    # Calculate expectation values ⟨Pauli⟩
    x = calculate_expectation_value(statevector, pauli['X'], qubit_index, n_qubits)
    y = calculate_expectation_value(statevector, pauli['Y'], qubit_index, n_qubits)
    z = calculate_expectation_value(statevector, pauli['Z'], qubit_index, n_qubits)
    
    return {'x': float(np.real(x)), 'y': float(np.real(y)), 'z': float(np.real(z))}

def calculate_expectation_value(statevector: List[complex], operator: np.ndarray, 
                              qubit_index: int, n_qubits: int) -> complex:
    """
    Calculate expectation value of operator on specific qubit
    
    Args:
        statevector: Quantum state vector
        operator: 2x2 operator matrix
        qubit_index: Index of target qubit
        n_qubits: Total number of qubits
        
    Returns:
        Expectation value
    """
    # Build full operator (tensor with identities)
    I = get_pauli_matrices()['I']
    full_operator = np.array([[1]], dtype=complex)
    
    for i in range(n_qubits):
        if i == qubit_index:
            full_operator = tensor_product(full_operator, operator)
        else:
            full_operator = tensor_product(full_operator, I)
    
    # Remove the initial [[1]]
    if full_operator.shape[0] == 1:
        full_operator = operator
    
    # Calculate ⟨ψ|O|ψ⟩
    psi = np.array(statevector)
    result = np.conj(psi).T @ full_operator @ psi
    
    # Extract scalar value from result (expectation values are always scalars)
    if np.isscalar(result):
        return complex(float(np.real(result)), float(np.imag(result)))
    elif hasattr(result, 'item'):
        scalar_result = result.item()
        return complex(float(np.real(scalar_result)), float(np.imag(scalar_result)))
    else:
        # Handle case where result might be a 1x1 array
        scalar_result = result.flatten()[0]
        return complex(float(np.real(scalar_result)), float(np.imag(scalar_result)))

def rotation_matrix(axis: str, angle: float) -> np.ndarray:
    """
    Generate rotation matrix around specified axis
    
    Args:
        axis: Rotation axis ('x', 'y', or 'z')
        angle: Rotation angle in radians
        
    Returns:
        2x2 rotation matrix
    """
    pauli = get_pauli_matrices()
    
    if axis.lower() == 'x':
        return np.cos(angle/2) * pauli['I'] - 1j * np.sin(angle/2) * pauli['X']
    elif axis.lower() == 'y':
        return np.cos(angle/2) * pauli['I'] - 1j * np.sin(angle/2) * pauli['Y']
    elif axis.lower() == 'z':
        return np.cos(angle/2) * pauli['I'] - 1j * np.sin(angle/2) * pauli['Z']
    else:
        raise ValueError(f"Unknown axis: {axis}")

def matrix_to_dict(matrix: np.ndarray) -> List[List[Dict[str, float]]]:
    """
    Convert matrix to JSON-serializable format
    
    Args:
        matrix: NumPy matrix
        
    Returns:
        List of lists with complex numbers as dictionaries
    """
    return [
        [complex_to_dict(element) for element in row]
        for row in matrix
    ]

def is_unitary(matrix: np.ndarray, tolerance: float = 1e-10) -> bool:
    """
    Check if matrix is unitary
    
    Args:
        matrix: Matrix to check
        tolerance: Numerical tolerance
        
    Returns:
        True if matrix is unitary
    """
    n = matrix.shape[0]
    identity = np.eye(n, dtype=complex)
    
    # Check if U† U = I
    product = np.conj(matrix).T @ matrix
    return np.allclose(product, identity, atol=tolerance)

def is_hermitian(matrix: np.ndarray, tolerance: float = 1e-10) -> bool:
    """
    Check if matrix is Hermitian
    
    Args:
        matrix: Matrix to check
        tolerance: Numerical tolerance
        
    Returns:
        True if matrix is Hermitian
    """
    return np.allclose(matrix, np.conj(matrix).T, atol=tolerance)

def calculate_von_neumann_entropy(probabilities: List[float]) -> float:
    """
    Calculate von Neumann entropy from probabilities
    
    Args:
        probabilities: List of probabilities
        
    Returns:
        Entropy value
    """
    entropy = 0
    for p in probabilities:
        if p > 1e-16:  # Avoid log(0)
            entropy -= p * np.log2(p)
    
    return float(entropy)

def safe_division(numerator: float, denominator: float, default: float = 0.0) -> float:
    """
    Safe division that handles division by zero
    
    Args:
        numerator: Numerator value
        denominator: Denominator value
        default: Default value if denominator is zero
        
    Returns:
        Division result or default value
    """
    if abs(denominator) < 1e-16:
        return default
    return numerator / denominator