#!/usr/bin/env python3
"""
Qscope Quantum Visualizer Backend
Main entry point for the Flask application
"""

import os
from app import create_app
from config import config

def main():
    """Main function to run the Flask application"""
    # Get configuration from environment
    config_name = os.environ.get('FLASK_CONFIG', 'default')
    
    # Create Flask app with specified configuration
    app = create_app(config[config_name])
    
    # Get host and port from environment or use defaults
    host = os.environ.get('HOST', '127.0.0.1')
    port = int(os.environ.get('PORT', 5000))
    
    print(f"🚀 Starting Qscope Backend on {host}:{port}")
    print(f"📊 Configuration: {config_name}")
    print(f"🔧 Debug mode: {app.config['DEBUG']}")
    print(f"🌐 CORS origins: {app.config['CORS_ORIGINS']}")
    
    # Run the application
    app.run(
        host=host,
        port=port,
        debug=app.config['DEBUG'],
        threaded=True
    )

if __name__ == '__main__':
    main()