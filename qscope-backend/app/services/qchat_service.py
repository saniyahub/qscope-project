"""
QChat Service for Qscope Backend
Handles communication with OpenRouter API and circuit generation
"""

import os
import json
import requests
import logging
import time
import random
from typing import Dict, List, Any, Optional
from app.services.circuit_generator import CircuitGenerator
from app.utils.qchat_formatter import format_response
from app.utils.cache import cache
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import urllib3

# Disable SSL warnings if needed
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)

class CircuitBreaker:
    """
    Circuit breaker pattern implementation to prevent cascading failures
    """
    def __init__(self, failure_threshold=5, recovery_timeout=60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    def call(self, func, *args, **kwargs):
        """
        Execute function with circuit breaker protection
        """
        if self.state == "OPEN":
            if self.last_failure_time and time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF_OPEN"
            else:
                raise Exception("Circuit breaker is OPEN - service unavailable")
        
        try:
            result = func(*args, **kwargs)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise e
    
    def on_success(self):
        """Handle successful call"""
        self.failure_count = 0
        self.state = "CLOSED"
    
    def on_failure(self):
        """Handle failed call"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

class QChatService:
    """
    Service layer for QChat functionality with enhanced reliability
    """
    
    def __init__(self, app=None):
        """Initialize the QChat service"""
        # Default configuration values
        self.max_retries = 5
        self.timeout = 30
        self.circuit_breaker_threshold = 3
        self.circuit_breaker_timeout = 60
        
        if app and hasattr(app, 'config'):
            # Use Flask app configuration
            self.api_key = app.config.get('OPENROUTER_API_KEY')
            self.base_url = app.config.get('OPENROUTER_BASE_URL')
            self.model = app.config.get('OPENROUTER_MODEL')
            self.free_models = app.config.get('OPENROUTER_FREE_MODELS', [])
            
            # Reliability settings from config
            self.max_retries = app.config.get('QCHAT_MAX_RETRIES', 5)
            self.timeout = app.config.get('QCHAT_TIMEOUT', 30)
            self.circuit_breaker_threshold = app.config.get('QCHAT_CIRCUIT_BREAKER_THRESHOLD', 3)
            self.circuit_breaker_timeout = app.config.get('QCHAT_CIRCUIT_BREAKER_TIMEOUT', 60)
        else:
            # Fallback to environment variables
            self.api_key = os.environ.get('OPENROUTER_API_KEY')
            self.base_url = os.environ.get('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')
            self.model = os.environ.get('OPENROUTER_MODEL', 'openai/gpt-3.5-turbo')
            self.free_models = [
                'deepseek/deepseek-r1-0528:free',
                'z-ai/glm-4.5-air:free',
                'openai/gpt-oss-20b:free',
                'deepseek/deepseek-chat-v3-0324:free'
            ]
        
        self.circuit_generator = CircuitGenerator()
        
        # Initialize circuit breaker with configured values
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=self.circuit_breaker_threshold,
            recovery_timeout=self.circuit_breaker_timeout
        )
        
        # Cache for common responses (10 minutes TTL)
        self.response_cache = cache
        
        if not self.api_key:
            logger.warning("OPENROUTER_API_KEY not set in environment variables or Flask config")
    
    def get_available_models(self):
        """Get list of available models"""
        models = [self.model] if self.model else []
        if self.free_models:
            models.extend(self.free_models)
        return list(set(models))  # Remove duplicates
    
    def process_query(self, query: str, conversation_history: List[Dict[str, str]] = None, model: str = None) -> Dict[str, Any]:
        """
        Process a user query through the QChat service
        
        Args:
            query: User's query string
            conversation_history: Previous conversation messages
            model: Model to use for the query (optional)
            
        Returns:
            Processed response with potential circuit data
        """
        if conversation_history is None:
            conversation_history = []
            
        try:
            # Check if this is a circuit generation request
            is_circuit_request = self._is_circuit_generation_request(query)
            
            # Generate cache key for this query
            cache_key = self._generate_cache_key(query, conversation_history, model)
            
            # Try to get from cache first
            cached_response = self.response_cache.get(cache_key)
            if cached_response:
                logger.debug(f"Cache hit for query: {query[:50]}...")
                return cached_response
            
            if is_circuit_request and self.api_key:
                # For circuit requests, we'll use both LLM and our generator
                llm_response = self._query_llm_with_fallback(query, conversation_history, model)
                circuit_data = self.circuit_generator.generate_from_description(query)
                
                response = format_response(
                    content=llm_response,
                    circuit_data=circuit_data,
                    response_type='circuit'
                )
            elif self.api_key:
                # Regular LLM query
                llm_response = self._query_llm_with_fallback(query, conversation_history, model)
                
                response = format_response(
                    content=llm_response,
                    response_type='text'
                )
            else:
                # Fallback when no API key is available
                response = self._fallback_response(query, is_circuit_request)
            
            # Cache the response for common queries
            if self._should_cache_response(query):
                self.response_cache.set(cache_key, response, ttl=600)  # 10 minutes
            
            return response
                
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return {
                'type': 'error',
                'content': f"Sorry, I encountered an error processing your request: {str(e)}",
                'error': str(e)
            }
    
    def _generate_cache_key(self, query: str, conversation_history: List[Dict], model: str = None) -> str:
        """Generate cache key for query"""
        key_data = {
            'query': query,
            'history_length': len(conversation_history),
            'model': model or self.model
        }
        return f"qchat_response_{hash(json.dumps(key_data, sort_keys=True))}"
    
    def _should_cache_response(self, query: str) -> bool:
        """Determine if response should be cached"""
        # Cache common educational queries
        common_queries = [
            'what is superposition', 'explain superposition', 
            'what is entanglement', 'explain entanglement',
            'what is a qubit', 'explain qubit',
            'what is hadamard', 'explain hadamard',
            'bell state', 'bell circuit',
            'quantum fourier transform', 'qft'
        ]
        
        query_lower = query.lower()
        return any(common_query in query_lower for common_query in common_queries)
    
    def _is_circuit_generation_request(self, query: str) -> bool:
        """
        Determine if the query is requesting circuit generation
        
        Args:
            query: User's query string
            
        Returns:
            Boolean indicating if this is a circuit generation request
        """
        circuit_keywords = [
            'circuit', 'create', 'generate', 'make', 'build',
            'bell state', 'hadamard', 'superposition', 'entangle',
            'quantum gate', 'qubit', 'measure'
        ]
        
        query_lower = query.lower()
        return any(keyword in query_lower for keyword in circuit_keywords)
    
    def _query_llm_with_fallback(self, query: str, conversation_history: List[Dict[str, str]], model: str = None) -> str:
        """
        Query the OpenRouter LLM API with enhanced reliability and fallback mechanisms
        
        Args:
            query: User's query
            conversation_history: Previous conversation messages
            model: Model to use for the query (defaults to self.model)
            
        Returns:
            LLM response text
        """
        # Try primary model first
        try:
            return self.circuit_breaker.call(
                self._query_llm_with_retry, 
                query, 
                conversation_history, 
                model or self.model,
                timeout=self.timeout
            )
        except Exception as primary_error:
            logger.warning(f"Primary model failed: {str(primary_error)}")
            
            # Try free models as fallback
            for free_model in self.free_models:
                try:
                    logger.info(f"Trying fallback model: {free_model}")
                    return self.circuit_breaker.call(
                        self._query_llm_with_retry,
                        query,
                        conversation_history,
                        free_model,
                        timeout=self.timeout + 15  # Longer timeout for free models
                    )
                except Exception as fallback_error:
                    logger.warning(f"Fallback model {free_model} failed: {str(fallback_error)}")
                    continue
            
            # If all models fail, raise the original error
            raise primary_error
    
    def _query_llm_with_retry(self, query: str, conversation_history: List[Dict[str, str]], 
                             model: str, timeout: int = None) -> str:
        """
        Query the OpenRouter LLM API with enhanced retry mechanism
        
        Args:
            query: User's query
            conversation_history: Previous conversation messages
            model: Model to use for the query
            timeout: Request timeout in seconds (defaults to self.timeout)
            
        Returns:
            LLM response text
        """
        if timeout is None:
            timeout = self.timeout
            
        # Enhanced system prompt for better quantum concept explanations
        system_prompt = (
            "You are QChat, an AI assistant specialized in quantum computing education. "
            "Your role is to help users understand quantum computing concepts with clear, accurate, and detailed explanations. "
            "When explaining concepts, use analogies and examples to make abstract ideas more accessible. "
            "For circuit generation requests, provide both the circuit code and a detailed explanation of each gate's function "
            "and how the circuit demonstrates the requested quantum phenomenon. "
            "Always format quantum circuits using standard QASM. "
            "Structure your responses with clear headings and bullet points where appropriate. "
            "If a request is unclear, ask clarifying questions. "
            "Focus on educational value and conceptual understanding rather than just providing code."
        )
        
        messages = [
            {
                "role": "system",
                "content": system_prompt
            }
        ]
        
        # Add conversation history
        messages.extend(conversation_history)
        
        # Add current query
        messages.append({"role": "user", "content": query})
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": messages
        }
        
        # Enhanced retry mechanism with exponential backoff and jitter
        max_attempts = self.max_retries
        base_delay = 1  # seconds
        
        for attempt in range(max_attempts):
            try:
                logger.debug(f"Attempt {attempt + 1}/{max_attempts} to connect to OpenRouter with model: {model}")
                
                # Add jitter to prevent thundering herd
                if attempt > 0:
                    jitter = random.uniform(0, 1)
                    delay = min(base_delay * (2 ** attempt) + jitter, 30)  # Cap at 30 seconds
                    logger.info(f"Waiting {delay:.2f} seconds before retry...")
                    time.sleep(delay)
                
                # Create a session with retry strategy
                session = requests.Session()
                
                # Define retry strategy with more specific conditions
                retry_strategy = Retry(
                    total=3,
                    backoff_factor=1,
                    status_forcelist=[429, 500, 502, 503, 504, 520, 521, 522, 524],
                    allowed_methods=["HEAD", "GET", "OPTIONS", "POST"]
                )
                
                # Mount adapter with retry strategy
                adapter = HTTPAdapter(max_retries=retry_strategy)
                session.mount("http://", adapter)
                session.mount("https://", adapter)
                
                # Make the request with session
                response = session.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=timeout,
                    # Try with SSL verification first, then without if needed
                    verify=(attempt == 0)  # Only verify SSL on first attempt
                )
                
                response.raise_for_status()
                result = response.json()
                
                # Reset circuit breaker on success
                self.circuit_breaker.on_success()
                
                return result['choices'][0]['message']['content']
                
            except requests.exceptions.SSLError as e:
                logger.warning(f"SSL Error on attempt {attempt + 1}: {str(e)}")
                if attempt < max_attempts - 1:
                    continue
                else:
                    raise Exception(f"SSL connection error to OpenRouter API after {max_attempts} attempts: {str(e)}. "
                                  "This might be due to network restrictions or SSL certificate issues. "
                                  "Try using a different network or check your firewall settings.")
            except requests.exceptions.ConnectionError as e:
                logger.warning(f"Connection Error on attempt {attempt + 1}: {str(e)}")
                if attempt < max_attempts - 1:
                    continue
                else:
                    raise Exception(f"Connection error to OpenRouter API after {max_attempts} attempts: {str(e)}. "
                                  "Check your internet connection and try again.")
            except requests.exceptions.Timeout as e:
                logger.warning(f"Timeout Error on attempt {attempt + 1}: {str(e)}")
                if attempt < max_attempts - 1:
                    continue
                else:
                    raise Exception(f"Timeout error connecting to OpenRouter API after {max_attempts} attempts: {str(e)}. "
                                  "The server might be busy. Please try again later.")
            except requests.exceptions.RequestException as e:
                logger.error(f"LLM API request failed: {str(e)}")
                # For 429 (rate limit) errors, wait longer
                if hasattr(e, 'response') and e.response and e.response.status_code == 429:
                    if attempt < max_attempts - 1:
                        logger.info("Rate limited, waiting longer before retry...")
                        time.sleep(min(base_delay * (3 ** attempt), 60))  # Longer delays for rate limits
                        continue
                
                if attempt < max_attempts - 1:
                    continue
                else:
                    raise Exception(f"Failed to get response from LLM: {str(e)}")
            except (KeyError, IndexError) as e:
                logger.error(f"Unexpected response format from LLM: {str(e)}")
                raise Exception("Received unexpected response format from LLM")
        
        # If we get here, all attempts failed
        raise Exception("Failed to connect to OpenRouter API after multiple attempts. Please try again later.")
    
    def _fallback_response(self, query: str, is_circuit_request: bool) -> Dict[str, Any]:
        """
        Provide fallback responses when LLM is not available
        
        Args:
            query: User's query
            is_circuit_request: Whether this is a circuit generation request
            
        Returns:
            Formatted fallback response
        """
        if is_circuit_request:
            return {
                'type': 'error',
                'content': "I can help you generate quantum circuits, but I need an API key to access the language model. "
                          "Please set the OPENROUTER_API_KEY environment variable to enable this feature.",
                'suggestion': "You can still manually create circuits using the circuit builder interface."
            }
        else:
            return {
                'type': 'text',
                'content': "I'm QChat, your quantum computing assistant. I can help explain quantum concepts "
                          "and generate quantum circuits from natural language descriptions. "
                          "However, I need an API key to access advanced language model capabilities. "
                          "Please set the OPENROUTER_API_KEY environment variable to enable full functionality."
            }