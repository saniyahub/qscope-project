"""
Qscope Quantum Visualizer Backend
Flask application factory and configuration
"""

from flask import Flask, jsonify
from flask_cors import CORS
import logging
import sys
from datetime import datetime

def create_app(config_object=None):
    """
    Flask application factory
    
    Args:
        config_object: Configuration class to use
    
    Returns:
        Flask application instance
    """
    app = Flask(__name__)
    
    # Load configuration
    if config_object:
        app.config.from_object(config_object)
    else:
        from config import DevelopmentConfig
        app.config.from_object(DevelopmentConfig)
    
    # Initialize CORS
    CORS(app, origins=app.config.get('CORS_ORIGINS', ['*']))
    
    # Configure logging
    configure_logging(app)
    
    # Register blueprints
    register_blueprints(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Add health check endpoint
    @app.route('/health')
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'service': 'qscope-backend'
        })
    
    app.logger.info("Qscope Backend application created successfully")
    return app

def register_blueprints(app):
    """Register all application blueprints"""
    try:
        from app.routes.quantum import quantum_bp
        from app.routes.education import education_bp
        from app.routes.analytics import analytics_bp
        
        app.register_blueprint(quantum_bp, url_prefix='/api/quantum')
        app.register_blueprint(education_bp, url_prefix='/api/education')
        app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
        
        app.logger.info("All blueprints registered successfully")
    except ImportError as e:
        app.logger.error(f"Failed to register blueprints: {e}")
        raise

def register_error_handlers(app):
    """Register error handlers for the application"""
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Not Found',
            'message': 'The requested resource was not found',
            'status_code': 404
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Internal server error: {error}")
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred',
            'status_code': 500
        }), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'error': 'Bad Request',
            'message': 'The request was invalid',
            'status_code': 400
        }), 400

def configure_logging(app):
    """Configure application logging"""
    if not app.debug and not app.testing:
        # Configure logging for production
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]',
            handlers=[
                logging.StreamHandler(sys.stdout)
            ]
        )
    else:
        # Configure logging for development
        logging.basicConfig(
            level=logging.DEBUG,
            format='%(asctime)s %(levelname)s: %(message)s',
            handlers=[
                logging.StreamHandler(sys.stdout)
            ]
        )
    
    app.logger.setLevel(logging.INFO)