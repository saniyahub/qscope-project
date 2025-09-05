"""
Simple caching utility for QScope backend
Provides in-memory caching with TTL (Time To Live) support
"""

import time
import hashlib
import json
from typing import Any, Dict, Optional
from threading import Lock

class SimpleCache:
    """
    Simple in-memory cache with TTL support
    """
    
    def __init__(self, default_ttl: int = 300):
        """
        Initialize the cache
        
        Args:
            default_ttl: Default time-to-live in seconds (default: 5 minutes)
        """
        self._cache: Dict[str, Dict] = {}
        self._lock = Lock()
        self.default_ttl = default_ttl
    
    def _generate_key(self, func_name: str, *args, **kwargs) -> str:
        """
        Generate a cache key from function name and arguments
        
        Args:
            func_name: Name of the function
            *args: Positional arguments
            **kwargs: Keyword arguments
            
        Returns:
            Hash string to use as cache key
        """
        # Create a consistent representation of args and kwargs
        key_data = {
            'function': func_name,
            'args': args,
            'kwargs': kwargs
        }
        
        # Serialize to JSON and create hash
        key_string = json.dumps(key_data, sort_keys=True, default=str)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache if it exists and hasn't expired
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found or expired
        """
        with self._lock:
            if key in self._cache:
                item = self._cache[key]
                # Check if item has expired
                if time.time() < item['expires_at']:
                    return item['value']
                else:
                    # Remove expired item
                    del self._cache[key]
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Set value in cache with TTL
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time-to-live in seconds (uses default if None)
        """
        if ttl is None:
            ttl = self.default_ttl
            
        expires_at = time.time() + ttl
        
        with self._lock:
            self._cache[key] = {
                'value': value,
                'expires_at': expires_at
            }
    
    def cached(self, ttl: Optional[int] = None):
        """
        Decorator for caching function results
        
        Args:
            ttl: Time-to-live in seconds (uses default if None)
        """
        def decorator(func):
            def wrapper(*args, **kwargs):
                # Generate cache key
                key = self._generate_key(func.__name__, *args, **kwargs)
                
                # Try to get from cache
                cached_value = self.get(key)
                if cached_value is not None:
                    return cached_value
                
                # Execute function and cache result
                result = func(*args, **kwargs)
                self.set(key, result, ttl)
                return result
            
            return wrapper
        return decorator
    
    def clear(self) -> None:
        """Clear all cached items"""
        with self._lock:
            self._cache.clear()
    
    def cleanup(self) -> int:
        """
        Remove expired items from cache
        
        Returns:
            Number of items removed
        """
        removed_count = 0
        current_time = time.time()
        
        with self._lock:
            expired_keys = [
                key for key, item in self._cache.items()
                if current_time >= item['expires_at']
            ]
            
            for key in expired_keys:
                del self._cache[key]
                removed_count += 1
                
        return removed_count
    
    def size(self) -> int:
        """Get current number of cached items"""
        with self._lock:
            return len(self._cache)

# Global cache instance
cache = SimpleCache()