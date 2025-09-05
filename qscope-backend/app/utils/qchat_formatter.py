"""
Response formatter for QChat
Structures responses for frontend consumption
"""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

def format_response(
    content: str, 
    circuit_data: Optional[Dict[str, Any]] = None,
    response_type: str = 'text'
) -> Dict[str, Any]:
    """
    Format QChat response for frontend consumption
    
    Args:
        content: Main response content
        circuit_data: Optional circuit data
        response_type: Type of response (text, circuit, error)
        
    Returns:
        Formatted response dictionary
    """
    try:
        response = {
            'type': response_type,
            'content': content,
            'timestamp': __import__('datetime').datetime.utcnow().isoformat()
        }
        
        # Add circuit data if provided
        if circuit_data and response_type == 'circuit':
            # Include both QASM and JSON representations
            response['circuit'] = {
                'qasm': circuit_data.get('qasm', ''),
                'json': circuit_data.get('json', {}),
                'metadata': circuit_data.get('metadata', {})
            }
            
            # Add a simplified representation for the frontend
            response['circuit']['simplified'] = _simplify_circuit_data(circuit_data)
        
        return response
        
    except Exception as e:
        logger.error(f"Error formatting response: {str(e)}")
        return {
            'type': 'error',
            'content': f"Error formatting response: {str(e)}",
            'error': str(e)
        }

def _simplify_circuit_data(circuit_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simplify circuit data for frontend display
    
    Args:
        circuit_data: Raw circuit data
        
    Returns:
        Simplified circuit representation
    """
    try:
        json_data = circuit_data.get('json', {})
        metadata = circuit_data.get('metadata', {})
        
        # Extract basic information
        gates = json_data.get('gates', [])
        num_qubits = json_data.get('num_qubits', metadata.get('num_qubits', 1))
        
        # Create simplified gate list
        simplified_gates = []
        for gate in gates:
            simplified_gate = {
                'name': gate.get('gate', 'UNKNOWN'),
                'qubits': gate.get('qubits', []),
                'params': gate.get('params', [])
            }
            simplified_gates.append(simplified_gate)
        
        return {
            'gates': simplified_gates,
            'num_qubits': num_qubits,
            'description': metadata.get('description', '')
        }
        
    except Exception as e:
        logger.error(f"Error simplifying circuit data: {str(e)}")
        return {
            'gates': [],
            'num_qubits': 1,
            'description': 'Error processing circuit',
            'error': str(e)
        }