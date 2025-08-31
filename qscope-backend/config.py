import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'qscope-quantum-secret-key-2024'
    FLASK_ENV = os.environ.get('FLASK_ENV') or 'development'
    DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    # CORS settings
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:5173').split(',')
    
    # Quantum simulation settings
    MAX_QUBITS = int(os.environ.get('MAX_QUBITS', '10'))
    MAX_GATES_PER_CIRCUIT = int(os.environ.get('MAX_GATES_PER_CIRCUIT', '100'))
    SIMULATION_TIMEOUT = int(os.environ.get('SIMULATION_TIMEOUT', '60'))  # seconds
    
    # Educational content settings
    DEFAULT_DIFFICULTY_LEVEL = os.environ.get('DEFAULT_DIFFICULTY_LEVEL', 'beginner')
    ENABLE_DETAILED_EXPLANATIONS = os.environ.get('ENABLE_DETAILED_EXPLANATIONS', 'True').lower() == 'true'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    FLASK_ENV = 'development'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    FLASK_ENV = 'production'
    
    # More restrictive settings for production
    MAX_QUBITS = 8
    MAX_GATES_PER_CIRCUIT = 50
    SIMULATION_TIMEOUT = 15

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    MAX_QUBITS = 5
    MAX_GATES_PER_CIRCUIT = 20

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}