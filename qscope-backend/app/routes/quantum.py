"""
Quantum routes for Qscope Backend
Handles quantum circuit simulation and analysis
"""

from flask import Blueprint, request, jsonify, current_app
from typing import Dict, Any
import traceback
import logging

# Create blueprint
quantum_bp = Blueprint('quantum', __name__)

logger = logging.getLogger(__name__)

@quantum_bp.route('/simulate', methods=['POST'])
def simulate_circuit():
    """
    Simulate quantum circuit with basic analysis
    
    Expected JSON payload:
    {
        "circuit": {
            "gates": [...]
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'circuit' not in data:
            return jsonify({
                'error': 'Missing circuit data',
                'message': 'Request must include circuit specification'
            }), 400
        
        circuit_data = data['circuit']
        
        # Import and use quantum simulator
        from app.services.quantum_simulator import AdvancedQuantumSimulator
        
        simulator = AdvancedQuantumSimulator()
        result = simulator.simulate_basic(circuit_data)
        
        return jsonify({
            'success': True,
            'result': result,
            'message': 'Circuit simulation completed successfully'
        })
        
    except Exception as e:
        logger.error(f"Quantum simulation error: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Simulation failed',
            'message': str(e),
            'success': False
        }), 500

@quantum_bp.route('/simulate-steps', methods=['POST'])
def simulate_circuit_steps():
    """
    Simulate quantum circuit with detailed step-by-step analysis
    
    Expected JSON payload:
    {
        "circuit": {
            "gates": [...]
        },
        "options": {
            "include_explanations": true,
            "detail_level": "intermediate"
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'circuit' not in data:
            return jsonify({
                'error': 'Missing circuit data',
                'message': 'Request must include circuit specification'
            }), 400
        
        circuit_data = data['circuit']
        options = data.get('options', {})
        
        # Import and use quantum simulator
        from app.services.quantum_simulator import AdvancedQuantumSimulator
        
        simulator = AdvancedQuantumSimulator()
        result = simulator.simulate_with_steps(circuit_data, options)
        
        return jsonify({
            'success': True,
            'result': result,
            'message': 'Step-by-step simulation completed successfully'
        })
        
    except Exception as e:
        logger.error(f"Step-by-step simulation error: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Step-by-step simulation failed',
            'message': str(e),
            'success': False
        }), 500

@quantum_bp.route('/simulate-steps-async', methods=['POST'])
def simulate_circuit_steps_async():
    """
    Submit quantum circuit for asynchronous step-by-step analysis
    
    Expected JSON payload:
    {
        "circuit": {
            "gates": [...]
        },
        "options": {
            "include_explanations": true,
            "detail_level": "intermediate"
        }
    }
    
    Returns:
    {
        "success": true,
        "job_id": "uuid-string",
        "message": "Simulation job submitted successfully"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'circuit' not in data:
            return jsonify({
                'error': 'Missing circuit data',
                'message': 'Request must include circuit specification'
            }), 400
        
        circuit_data = data['circuit']
        options = data.get('options', {})
        
        # Import and use quantum simulator
        from app.services.quantum_simulator import AdvancedQuantumSimulator
        from app.utils.job_queue import job_queue
        
        # Start job queue if not already running
        if not job_queue.running:
            job_queue.start()
        
        simulator = AdvancedQuantumSimulator()
        job_id = simulator.simulate_with_steps_async(circuit_data, options)
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'message': 'Simulation job submitted successfully'
        })
        
    except Exception as e:
        logger.error(f"Async simulation submission error: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Failed to submit simulation job',
            'message': str(e),
            'success': False
        }), 500

@quantum_bp.route('/simulation-result/<job_id>', methods=['GET'])
def get_simulation_result(job_id):
    """
    Get the result of an asynchronous simulation job
    
    Args:
        job_id: UUID of the simulation job
        
    Returns:
        Simulation result or job status
    """
    try:
        # Import and use quantum simulator
        from app.services.quantum_simulator import AdvancedQuantumSimulator
        from app.utils.job_queue import job_queue
        
        simulator = AdvancedQuantumSimulator()
        result = simulator.get_simulation_result(job_id)
        
        if result is None:
            return jsonify({
                'error': 'Job not found',
                'message': f'No simulation job found with ID: {job_id}',
                'success': False
            }), 404
        
        if 'status' in result and result['status'] == 'processing':
            return jsonify({
                'success': True,
                'status': 'processing',
                'job_id': job_id,
                'message': 'Simulation is still processing'
            })
        
        return jsonify({
            'success': True,
            'result': result,
            'message': 'Simulation result retrieved successfully'
        })
        
    except Exception as e:
        logger.error(f"Get simulation result error: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Failed to retrieve simulation result',
            'message': str(e),
            'success': False
        }), 500

@quantum_bp.route('/validate-circuit', methods=['POST'])
def validate_circuit():
    """
    Validate circuit structure and constraints
    
    Expected JSON payload:
    {
        "circuit": {
            "gates": [...]
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'circuit' not in data:
            return jsonify({
                'error': 'Missing circuit data',
                'message': 'Request must include circuit specification'
            }), 400
        
        circuit_data = data['circuit']
        
        # Basic validation
        gates = circuit_data.get('gates', [])
        
        if not isinstance(gates, list):
            return jsonify({
                'valid': False,
                'errors': ['Gates must be an array']
            })
        
        errors = []
        warnings = []
        
        # Validate each gate
        valid_gates = {'H', 'X', 'Y', 'Z', 'I', 'CNOT'}
        max_qubits = 10  # Reasonable limit
        
        qubit_positions = set()
        max_qubit = -1
        
        for i, gate in enumerate(gates):
            if not isinstance(gate, dict):
                errors.append(f"Gate {i} must be an object")
                continue
                
            gate_type = gate.get('gate')
            qubit = gate.get('qubit')
            position = gate.get('position', i)
            
            if gate_type not in valid_gates:
                errors.append(f"Gate {i}: Invalid gate type '{gate_type}'. Valid types: {', '.join(valid_gates)}")
                
            if qubit is None:
                errors.append(f"Gate {i}: Missing qubit specification")
            elif not isinstance(qubit, int) or qubit < 0:
                errors.append(f"Gate {i}: Qubit must be a non-negative integer")
            else:
                max_qubit = max(max_qubit, qubit)
                qubit_positions.add(qubit)
                
            if position is not None and (not isinstance(position, int) or position < 0):
                errors.append(f"Gate {i}: Position must be a non-negative integer")
        
        if max_qubit >= max_qubits:
            errors.append(f"Circuit uses {max_qubit + 1} qubits, maximum allowed is {max_qubits}")
            
        # Check for CNOT gates without target qubit
        for i, gate in enumerate(gates):
            if gate.get('gate') == 'CNOT' and 'targetQubit' not in gate:
                warnings.append(f"Gate {i}: CNOT gate should specify targetQubit")
        
        is_valid = len(errors) == 0
        
        response = {
            'valid': is_valid,
            'qubits': max_qubit + 1 if max_qubit >= 0 else 0,
            'gates': len(gates)
        }
        
        if errors:
            response['errors'] = errors
        if warnings:
            response['warnings'] = warnings
            
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Circuit validation error: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'valid': False,
            'errors': [f"Validation error: {str(e)}"]
        }), 500

@quantum_bp.route('/gates', methods=['GET'])
def get_supported_gates():
    """
    Get information about supported quantum gates
    """
    try:
        gates_info = {
            'H': {
                'name': 'Hadamard',
                'description': 'Creates superposition states',
                'matrix': [[1/np.sqrt(2), 1/np.sqrt(2)], [1/np.sqrt(2), -1/np.sqrt(2)]],
                'parameters': []
            },
            'X': {
                'name': 'Pauli-X',
                'description': 'Bit flip gate (quantum NOT)',
                'matrix': [[0, 1], [1, 0]],
                'parameters': []
            },
            'Y': {
                'name': 'Pauli-Y',
                'description': 'Bit and phase flip gate',
                'matrix': [[0, -1j], [1j, 0]],
                'parameters': []
            },
            'Z': {
                'name': 'Pauli-Z',
                'description': 'Phase flip gate',
                'matrix': [[1, 0], [0, -1]],
                'parameters': []
            },
            'I': {
                'name': 'Identity',
                'description': 'No operation gate',
                'matrix': [[1, 0], [0, 1]],
                'parameters': []
            },
            'CNOT': {
                'name': 'Controlled-NOT',
                'description': 'Two-qubit entangling gate',
                'matrix': [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]],
                'parameters': ['control', 'target']
            }
        }
        
        # Import numpy for matrix calculations
        import numpy as np
        
        return jsonify({
            'success': True,
            'gates': gates_info,
            'message': 'Supported gates information retrieved successfully'
        })
        
    except Exception as e:
        logger.error(f"Get gates error: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Failed to retrieve gates information',
            'message': str(e),
            'success': False
        }), 500