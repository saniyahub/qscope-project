"""
Analytics routes for Qscope Backend
Handles quantum state analytics, metrics, and performance monitoring
"""

from flask import Blueprint, request, jsonify, current_app
from typing import Dict, Any
import traceback

# Create blueprint
analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/real-time-analysis', methods=['POST'])
def real_time_analysis():
    """
    Provide comprehensive real-time quantum state analysis
    
    Expected JSON payload:
    {
        "circuit": {
            "gates": [...]
        },
        "analysis_type": "comprehensive|basic|entanglement_only",
        "metrics": ["entanglement", "purity", "fidelity", "coherence"]
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
        analysis_type = data.get('analysis_type', 'comprehensive')
        requested_metrics = data.get('metrics', ['entanglement', 'purity', 'fidelity'])
        
        # Import analytics service
        from app.services.quantum_simulator import AdvancedQuantumSimulator
        from app.services.quantum_analytics import QuantumAnalytics
        from app.services.education_engine import EducationEngine
        
        # Simulate circuit
        simulator = AdvancedQuantumSimulator()
        simulation_result = simulator.simulate_with_steps(circuit_data)
        
        # Perform analytics
        analytics = QuantumAnalytics()
        analysis_result = analytics.calculate_comprehensive_metrics(
            simulation_result, analysis_type, requested_metrics
        )
        
        # Add educational insights
        education_engine = EducationEngine()
        circuit_state = {'gates': circuit_data.get('gates', [])}
        insights = education_engine.get_contextual_explanation(circuit_state, 'intermediate')
        
        # Get optimization suggestions
        optimization_data = {'circuit': circuit_data, 'optimization_goals': ['reduce_depth', 'minimize_gates']}
        recommendations = analytics.get_optimization_suggestions(optimization_data)
        
        return jsonify({
            'success': True,
            'analysis': analysis_result,
            'insights': insights,
            'recommendations': recommendations,
            'simulation': {
                'steps_count': len(simulation_result.get('steps', [])),
                'final_metrics': simulation_result.get('final_metrics', {}),
                'circuit_statistics': simulation_result.get('circuit_statistics', {})
            },
            'message': 'Real-time analysis completed successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Real-time analysis error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Analysis failed',
            'message': str(e),
            'success': False
        }), 500

@analytics_bp.route('/entanglement-analysis', methods=['POST'])
def entanglement_analysis():
    """
    Detailed entanglement analysis for quantum states
    
    Expected JSON payload:
    {
        "state_vector": [...],
        "num_qubits": 2,
        "analysis_options": {
            "include_bipartite": true,
            "include_multipartite": false
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Missing request data',
                'message': 'Request body is required'
            }), 400
        
        # Import analytics service
        from app.services.quantum_analytics import QuantumAnalytics
        
        analytics = QuantumAnalytics()
        entanglement_result = analytics.analyze_entanglement(data)
        
        return jsonify({
            'success': True,
            'entanglement_analysis': entanglement_result,
            'message': 'Entanglement analysis completed successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Entanglement analysis error: {str(e)}")
        
        return jsonify({
            'error': 'Entanglement analysis failed',
            'message': str(e),
            'success': False
        }), 500

@analytics_bp.route('/coherence-metrics', methods=['POST'])
def coherence_metrics():
    """
    Calculate quantum coherence metrics
    
    Expected JSON payload:
    {
        "state_vector": [...],
        "basis": "computational|pauli",
        "coherence_measures": ["l1_norm", "relative_entropy", "robustness"]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'state_vector' not in data:
            return jsonify({
                'error': 'Missing state vector',
                'message': 'Request must include state_vector'
            }), 400
        
        # Import analytics service
        from app.services.quantum_analytics import QuantumAnalytics
        
        analytics = QuantumAnalytics()
        coherence_result = analytics.calculate_coherence_metrics(data)
        
        return jsonify({
            'success': True,
            'coherence_metrics': coherence_result,
            'message': 'Coherence metrics calculated successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Coherence metrics error: {str(e)}")
        
        return jsonify({
            'error': 'Coherence calculation failed',
            'message': str(e),
            'success': False
        }), 500

@analytics_bp.route('/performance-metrics', methods=['GET'])
def get_performance_metrics():
    """
    Get system performance metrics and statistics
    """
    try:
        # Import performance monitor
        from app.utils.performance_monitor import PerformanceMonitor
        
        monitor = PerformanceMonitor()
        metrics = monitor.get_current_metrics()
        
        return jsonify({
            'success': True,
            'performance_metrics': metrics,
            'message': 'Performance metrics retrieved successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Performance metrics error: {str(e)}")
        
        return jsonify({
            'error': 'Failed to retrieve performance metrics',
            'message': str(e),
            'success': False
        }), 500

@analytics_bp.route('/circuit-complexity', methods=['POST'])
def analyze_circuit_complexity():
    """
    Analyze quantum circuit complexity and optimization suggestions
    
    Expected JSON payload:
    {
        "circuit": {
            "gates": [...]
        },
        "complexity_metrics": ["depth", "gate_count", "entanglement_cost"]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'circuit' not in data:
            return jsonify({
                'error': 'Missing circuit data',
                'message': 'Request must include circuit specification'
            }), 400
        
        # Import analytics service
        from app.services.quantum_analytics import QuantumAnalytics
        
        analytics = QuantumAnalytics()
        complexity_result = analytics.analyze_circuit_complexity(data['circuit'])
        
        return jsonify({
            'success': True,
            'complexity_analysis': complexity_result,
            'message': 'Circuit complexity analysis completed successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Circuit complexity error: {str(e)}")
        
        return jsonify({
            'error': 'Complexity analysis failed',
            'message': str(e),
            'success': False
        }), 500

@analytics_bp.route('/optimization-suggestions', methods=['POST'])
def get_optimization_suggestions():
    """
    Get optimization suggestions for quantum circuits
    
    Expected JSON payload:
    {
        "circuit": {
            "gates": [...]
        },
        "optimization_goals": ["reduce_depth", "minimize_gates", "preserve_fidelity"]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'circuit' not in data:
            return jsonify({
                'error': 'Missing circuit data',
                'message': 'Request must include circuit specification'
            }), 400
        
        # Import analytics service
        from app.services.quantum_analytics import QuantumAnalytics
        
        analytics = QuantumAnalytics()
        suggestions = analytics.get_optimization_suggestions(data)
        
        return jsonify({
            'success': True,
            'optimization_suggestions': suggestions,
            'message': 'Optimization suggestions generated successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Optimization suggestions error: {str(e)}")
        
        return jsonify({
            'error': 'Failed to generate optimization suggestions',
            'message': str(e),
            'success': False
        }), 500

@analytics_bp.route('/export-data', methods=['POST'])
def export_analysis_data():
    """
    Export analysis data in various formats
    
    Expected JSON payload:
    {
        "data": {...},
        "format": "json|csv|matlab",
        "include_metadata": true
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'data' not in data:
            return jsonify({
                'error': 'Missing data to export',
                'message': 'Request must include data to export'
            }), 400
        
        export_format = data.get('format', 'json')
        include_metadata = data.get('include_metadata', True)
        
        # Import analytics service
        from app.services.quantum_analytics import QuantumAnalytics
        
        analytics = QuantumAnalytics()
        exported_data = analytics.export_data(
            data['data'], export_format, include_metadata
        )
        
        return jsonify({
            'success': True,
            'exported_data': exported_data,
            'format': export_format,
            'message': 'Data exported successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Data export error: {str(e)}")
        
        return jsonify({
            'error': 'Data export failed',
            'message': str(e),
            'success': False
        }), 500

@analytics_bp.route('/health', methods=['GET'])
def analytics_health():
    """Health check for analytics service"""
    try:
        # Test basic analytics functionality
        from app.services.quantum_analytics import QuantumAnalytics
        
        analytics = QuantumAnalytics()
        test_result = analytics.run_health_check()
        
        return jsonify({
            'status': 'healthy',
            'service': 'quantum-analytics',
            'test_passed': True,
            'message': 'Analytics service is operational'
        })
        
    except Exception as e:
        current_app.logger.error(f"Analytics health check failed: {str(e)}")
        
        return jsonify({
            'status': 'unhealthy',
            'service': 'quantum-analytics',
            'test_passed': False,
            'error': str(e)
        }), 500