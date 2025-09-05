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
    
    # OpenRouter API settings
    OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY')
    OPENROUTER_BASE_URL = os.environ.get('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')
    OPENROUTER_MODEL = os.environ.get('OPENROUTER_MODEL', 'openai/gpt-3.5-turbo')
    
    # Available free models from OpenRouter
    OPENROUTER_FREE_MODELS = [
        'deepseek/deepseek-r1-0528:free',
        'z-ai/glm-4.5-air:free',
        'openai/gpt-oss-20b:free',
        'deepseek/deepseek-chat-v3-0324:free'
    ]
    
    # QChat reliability settings
    QCHAT_MAX_RETRIES = int(os.environ.get('QCHAT_MAX_RETRIES', '5'))
    QCHAT_TIMEOUT = int(os.environ.get('QCHAT_TIMEOUT', '30'))  # seconds
    QCHAT_CIRCUIT_BREAKER_THRESHOLD = int(os.environ.get('QCHAT_CIRCUIT_BREAKER_THRESHOLD', '3'))
    QCHAT_CIRCUIT_BREAKER_TIMEOUT = int(os.environ.get('QCHAT_CIRCUIT_BREAKER_TIMEOUT', '60'))  # seconds

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
    QCHAT_TIMEOUT = 20  # Shorter timeout in production

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