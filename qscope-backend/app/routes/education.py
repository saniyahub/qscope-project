"""
Education routes for Qscope Backend
Handles educational content, tutorials, and learning pathways
"""

from flask import Blueprint, request, jsonify, current_app
from typing import Dict, Any
import traceback

# Create blueprint
education_bp = Blueprint('education', __name__)

@education_bp.route('/explain-concept', methods=['POST'])
def explain_concept():
    """
    Get detailed explanations for quantum concepts based on circuit state
    
    Expected JSON payload:
    {
        "circuit_state": {
            "gates": [...],
            "current_step": 0
        },
        "user_level": "beginner|intermediate|advanced"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Missing request data',
                'message': 'Request body is required'
            }), 400
        
        circuit_state = data.get('circuit_state', {})
        user_level = data.get('user_level', 'beginner')
        
        # Import education engine
        from app.services.education_engine import EducationEngine
        
        education_engine = EducationEngine()
        explanation = education_engine.get_contextual_explanation(circuit_state, user_level)
        
        return jsonify({
            'success': True,
            'explanation': explanation,
            'user_level': user_level,
            'message': 'Concept explanation generated successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Concept explanation error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Failed to generate explanation',
            'message': str(e),
            'success': False
        }), 500

@education_bp.route('/guided-tutorial/<level>', methods=['GET'])
def get_guided_tutorial(level):
    """
    Get progressive tutorial content for different learning levels
    
    Args:
        level: beginner, intermediate, or advanced
    """
    try:
        if level not in ['beginner', 'intermediate', 'advanced']:
            return jsonify({
                'error': 'Invalid level',
                'message': 'Level must be beginner, intermediate, or advanced'
            }), 400
        
        # Import education engine
        from app.services.education_engine import EducationEngine
        
        education_engine = EducationEngine()
        tutorial = education_engine.get_guided_tutorial(level)
        
        return jsonify({
            'success': True,
            'tutorial': tutorial,
            'level': level,
            'message': f'Tutorial for {level} level retrieved successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Tutorial retrieval error: {str(e)}")
        
        return jsonify({
            'error': 'Failed to retrieve tutorial',
            'message': str(e),
            'success': False
        }), 500

@education_bp.route('/learning-path', methods=['POST'])
def generate_learning_path():
    """
    Generate personalized learning path based on current knowledge
    
    Expected JSON payload:
    {
        "current_circuit": {
            "gates": [...]
        },
        "completed_concepts": ["superposition", "entanglement"],
        "preferred_difficulty": "intermediate"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Missing request data',
                'message': 'Request body is required'
            }), 400
        
        current_circuit = data.get('current_circuit', {})
        completed_concepts = data.get('completed_concepts', [])
        preferred_difficulty = data.get('preferred_difficulty', 'beginner')
        
        # Import education engine
        from app.services.education_engine import EducationEngine
        
        education_engine = EducationEngine()
        learning_path = education_engine.generate_learning_path(
            current_circuit, completed_concepts, preferred_difficulty
        )
        
        return jsonify({
            'success': True,
            'learning_path': learning_path,
            'message': 'Learning path generated successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Learning path generation error: {str(e)}")
        
        return jsonify({
            'error': 'Failed to generate learning path',
            'message': str(e),
            'success': False
        }), 500

@education_bp.route('/interactive-questions', methods=['POST'])
def get_interactive_questions():
    """
    Get interactive questions based on current circuit or concept
    
    Expected JSON payload:
    {
        "concept": "superposition",
        "difficulty": "beginner",
        "question_type": "multiple_choice|true_false|fill_blank"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Missing request data',
                'message': 'Request body is required'
            }), 400
        
        concept = data.get('concept', 'general')
        difficulty = data.get('difficulty', 'beginner')
        question_type = data.get('question_type', 'multiple_choice')
        
        # Import education engine
        from app.services.education_engine import EducationEngine
        
        education_engine = EducationEngine()
        questions = education_engine.generate_interactive_questions(
            concept, difficulty, question_type
        )
        
        return jsonify({
            'success': True,
            'questions': questions,
            'concept': concept,
            'difficulty': difficulty,
            'message': 'Interactive questions generated successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Question generation error: {str(e)}")
        
        return jsonify({
            'error': 'Failed to generate questions',
            'message': str(e),
            'success': False
        }), 500

@education_bp.route('/quantum-algorithms', methods=['GET'])
def get_quantum_algorithms():
    """
    Get list of available quantum algorithms with educational content
    """
    try:
        # Import education engine
        from app.services.education_engine import EducationEngine
        
        education_engine = EducationEngine()
        algorithms = education_engine.get_quantum_algorithms_library()
        
        return jsonify({
            'success': True,
            'algorithms': algorithms,
            'message': 'Quantum algorithms library retrieved successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Algorithm retrieval error: {str(e)}")
        
        return jsonify({
            'error': 'Failed to retrieve algorithms',
            'message': str(e),
            'success': False
        }), 500

@education_bp.route('/quantum-algorithms/<algorithm_name>', methods=['GET'])
def get_algorithm_tutorial(algorithm_name):
    """
    Get detailed tutorial for a specific quantum algorithm
    
    Args:
        algorithm_name: Name of the quantum algorithm (e.g., 'deutsch_jozsa')
    """
    try:
        # Import education engine
        from app.services.education_engine import EducationEngine
        
        education_engine = EducationEngine()
        tutorial = education_engine.get_algorithm_tutorial(algorithm_name)
        
        if not tutorial:
            return jsonify({
                'error': 'Algorithm not found',
                'message': f'Algorithm {algorithm_name} is not available'
            }), 404
        
        return jsonify({
            'success': True,
            'tutorial': tutorial,
            'algorithm': algorithm_name,
            'message': f'Tutorial for {algorithm_name} retrieved successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Algorithm tutorial error: {str(e)}")
        
        return jsonify({
            'error': 'Failed to retrieve algorithm tutorial',
            'message': str(e),
            'success': False
        }), 500

@education_bp.route('/health', methods=['GET'])
def education_health():
    """Health check for education service"""
    try:
        # Test basic education functionality
        from app.services.education_engine import EducationEngine
        
        education_engine = EducationEngine()
        test_explanation = education_engine.get_basic_explanation()
        
        return jsonify({
            'status': 'healthy',
            'service': 'education-engine',
            'test_passed': True,
            'message': 'Education service is operational'
        })
        
    except Exception as e:
        current_app.logger.error(f"Education health check failed: {str(e)}")
        
        return jsonify({
            'status': 'unhealthy',
            'service': 'education-engine',
            'test_passed': False,
            'error': str(e)
        }), 500