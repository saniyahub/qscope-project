"""
QChat routes for Qscope Backend
Handles AI-powered chat interactions for quantum computing concepts
"""

from flask import Blueprint, request, jsonify, current_app
from typing import Dict, Any
import traceback
import logging
import requests

# Create blueprint
qchat_bp = Blueprint('qchat', __name__)

logger = logging.getLogger(__name__)

@qchat_bp.route('/query', methods=['POST'])
def query_qchat():
    """
    Main endpoint for processing QChat requests
    
    Expected JSON payload:
    {
        "query": "Create a Bell state circuit",
        "conversation_history": [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there! How can I help you with quantum computing?"}
        ],
        "model": "openai/gpt-3.5-turbo"  # Optional model parameter
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                'error': 'Missing query',
                'message': 'Request must include a query string'
            }), 400
        
        user_query = data['query']
        conversation_history = data.get('conversation_history', [])
        selected_model = data.get('model')  # Optional model parameter
        
        # Validate input
        if not isinstance(user_query, str) or len(user_query.strip()) == 0:
            return jsonify({
                'error': 'Invalid query',
                'message': 'Query must be a non-empty string'
            }), 400
        
        # Import and use QChat service
        from app.services.qchat_service import QChatService
        
        qchat_service = QChatService(current_app)
        result = qchat_service.process_query(user_query, conversation_history, selected_model)
        
        return jsonify({
            'success': True,
            'result': result,
            'message': 'Query processed successfully'
        })
        
    except Exception as e:
        logger.error(f"QChat query error: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Query processing failed',
            'message': str(e),
            'success': False
        }), 500

@qchat_bp.route('/models', methods=['GET'])
def get_models():
    """
    Get available models for QChat
    """
    try:
        # Import and use QChat service
        from app.services.qchat_service import QChatService
        
        qchat_service = QChatService(current_app)
        models = qchat_service.get_available_models()
        
        return jsonify({
            'success': True,
            'models': models,
            'message': 'Available models retrieved successfully'
        })
        
    except Exception as e:
        logger.error(f"QChat models error: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Failed to retrieve models',
            'message': str(e),
            'success': False
        }), 500

@qchat_bp.route('/test-connection', methods=['GET'])
def test_openrouter_connection():
    """
    Test endpoint to check OpenRouter connectivity
    """
    try:
        # Import QChat service to get configuration
        from app.services.qchat_service import QChatService
        qchat_service = QChatService(current_app)
        
        # Check if API key is configured
        if not qchat_service.api_key:
            return jsonify({
                'success': False,
                'message': 'OpenRouter API key not configured'
            }), 400
        
        # Test connection to OpenRouter
        headers = {
            "Authorization": f"Bearer {qchat_service.api_key}",
            "Content-Type": "application/json"
        }
        
        # Simple test request to check connectivity
        test_payload = {
            "model": "openai/gpt-3.5-turbo",
            "messages": [{"role": "user", "content": "Hello"}],
            "max_tokens": 10
        }
        
        response = requests.post(
            f"{qchat_service.base_url}/chat/completions",
            headers=headers,
            json=test_payload,
            timeout=10
        )
        
        if response.status_code == 200:
            return jsonify({
                'success': True,
                'message': 'Successfully connected to OpenRouter API',
                'api_key_configured': bool(qchat_service.api_key),
                'base_url': qchat_service.base_url
            })
        else:
            return jsonify({
                'success': False,
                'message': f'Failed to connect to OpenRouter API. Status code: {response.status_code}',
                'status_code': response.status_code,
                'response_text': response.text
            }), response.status_code
            
    except Exception as e:
        logger.error(f"OpenRouter connection test failed: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'message': f'Connection test failed: {str(e)}',
            'error': str(e)
        }), 500

@qchat_bp.route('/health', methods=['GET'])
def qchat_health():
    """
    Health check endpoint for QChat service
    """
    try:
        from app.services.qchat_service import QChatService
        qchat_service = QChatService(current_app)
        
        # Check if API key is configured
        if not qchat_service.api_key:
            return jsonify({
                'status': 'degraded',
                'service': 'qchat',
                'message': 'OpenRouter API key not configured',
                'api_key_configured': False
            }), 200
        
        # Test basic functionality with a simple cached response
        test_query = "What is a qubit?"
        result = qchat_service.process_query(test_query)
        
        return jsonify({
            'status': 'healthy',
            'service': 'qchat',
            'message': 'QChat service is operational',
            'api_key_configured': True,
            'test_query_result': result['result']['type'] if 'result' in result else result['type']
        }), 200
        
    except Exception as e:
        logger.error(f"QChat health check failed: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'status': 'unhealthy',
            'service': 'qchat',
            'message': f'Health check failed: {str(e)}',
            'error': str(e)
        }), 500