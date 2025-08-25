"""
Quantum simulation routes for Qscope Backend
Handles quantum circuit simulation and state analysis
"""

from flask import Blueprint, request, jsonify, current_app
from typing import Dict, Any
import traceback

# Create blueprint
quantum_bp = Blueprint('quantum', __name__)

@quantum_bp.route('/simulate', methods=['POST'])
def simulate_circuit():
    """
    Basic quantum circuit simulation endpoint
    
    Expected JSON payload:
    {
        "circuit": {
            "gates": [
                {"gate": "H", "qubit": 0, "position": 0},
                {"gate": "X", "qubit": 1, "position": 1}
            ]
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
        
        # Validate circuit data
        if not isinstance(circuit_data, dict) or 'gates' not in circuit_data:
            return jsonify({
                'error': 'Invalid circuit format',
                'message': 'Circuit must be an object with gates array'
            }), 400
        
        # Import and use quantum simulator
        from app.services.quantum_simulator import AdvancedQuantumSimulator
        
        simulator = AdvancedQuantumSimulator()
        result = simulator.simulate_basic(circuit_data)
        
        return jsonify({
            'success': True,
            'result': result,
            'message': 'Circuit simulated successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Simulation error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Simulation failed',
            'message': str(e),
            'success': False
        }), 500

@quantum_bp.route('/simulate-steps', methods=['POST'])
def simulate_circuit_with_steps():
    """
    Advanced quantum circuit simulation with step-by-step analysis
    
    Expected JSON payload:
    {
        "circuit": {
            "gates": [
                {"gate": "H", "qubit": 0, "position": 0},
                {"gate": "X", "qubit": 1, "position": 1}
            ]
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
        
        # Validate circuit data
        if not isinstance(circuit_data, dict) or 'gates' not in circuit_data:
            return jsonify({
                'error': 'Invalid circuit format',
                'message': 'Circuit must be an object with gates array'
            }), 400
        
        # Import and use quantum simulator
        from app.services.quantum_simulator import AdvancedQuantumSimulator
        
        simulator = AdvancedQuantumSimulator()
        result = simulator.simulate_with_steps(circuit_data, options)
        
        return jsonify({
            'success': True,
            'result': result,
            'message': 'Circuit simulated with steps successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Step simulation error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Step simulation failed',
            'message': str(e),
            'success': False
        }), 500

@quantum_bp.route('/validate-circuit', methods=['POST'])
def validate_circuit():
    """
    Validate quantum circuit structure and constraints
    
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
                'valid': False
            }), 400
        
        # Import validator
        from app.utils.validators import CircuitValidator
        
        validator = CircuitValidator()
        validation_result = validator.validate_circuit(data['circuit'])
        
        return jsonify({
            'valid': validation_result['valid'],
            'errors': validation_result.get('errors', []),
            'warnings': validation_result.get('warnings', []),
            'statistics': validation_result.get('statistics', {})
        })
        
    except Exception as e:
        current_app.logger.error(f"Validation error: {str(e)}")
        
        return jsonify({
            'error': 'Validation failed',
            'message': str(e),
            'valid': False
        }), 500

@quantum_bp.route('/gates', methods=['GET'])
def get_supported_gates():
    """
    Get list of supported quantum gates and their properties
    """
    try:
        # Import gate definitions
        from app.utils.math_helpers import get_gate_definitions
        
        gates = get_gate_definitions()
        
        return jsonify({
            'success': True,
            'gates': gates,
            'message': 'Supported gates retrieved successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Gate retrieval error: {str(e)}")
        
        return jsonify({
            'error': 'Failed to retrieve gates',
            'message': str(e),
            'success': False
        }), 500

@quantum_bp.route('/health', methods=['GET'])
def quantum_health():
    """Health check for quantum simulation service"""
    try:
        # Test basic quantum simulation functionality
        from app.services.quantum_simulator import AdvancedQuantumSimulator
        
        simulator = AdvancedQuantumSimulator()
        test_circuit = {
            'gates': [{'gate': 'H', 'qubit': 0, 'position': 0}]
        }
        
        # Quick test simulation
        result = simulator.simulate_basic(test_circuit)
        
        return jsonify({
            'status': 'healthy',
            'service': 'quantum-simulation',
            'test_passed': True,
            'message': 'Quantum simulation service is operational'
        })
        
    except Exception as e:
        current_app.logger.error(f"Quantum health check failed: {str(e)}")
        
        return jsonify({
            'status': 'unhealthy',
            'service': 'quantum-simulation',
            'test_passed': False,
            'error': str(e)
        }), 500