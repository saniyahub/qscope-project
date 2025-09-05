"""
Batch Processor Utility for QScope Backend
Provides request batching and parallelization for related API operations
"""

import asyncio
import concurrent.futures
from typing import Dict, List, Any, Callable, Optional, Tuple
import logging
import time

logger = logging.getLogger(__name__)

class BatchProcessor:
    """
    Utility for batching and parallelizing related API operations
    """
    
    def __init__(self, max_workers: int = 4, max_batch_size: int = 10):
        """
        Initialize the batch processor
        
        Args:
            max_workers: Maximum number of concurrent workers
            max_batch_size: Maximum number of operations in a single batch
        """
        self.max_workers = max_workers
        self.max_batch_size = max_batch_size
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=max_workers)
    
    def process_batch_sync(self, operations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Process a batch of operations synchronously
        
        Args:
            operations: List of operations to process
                Each operation should be a dict with:
                - 'function': Callable function to execute
                - 'args': Tuple of positional arguments
                - 'kwargs': Dict of keyword arguments
                - 'id': Optional identifier for the operation
                
        Returns:
            List of results corresponding to each operation
        """
        results = []
        
        # Process in batches to avoid overwhelming the system
        for i in range(0, len(operations), self.max_batch_size):
            batch = operations[i:i + self.max_batch_size]
            batch_results = []
            
            # Submit all operations in the batch
            futures = []
            for op in batch:
                future = self.executor.submit(
                    op['function'],
                    *op.get('args', ()),
                    **op.get('kwargs', {})
                )
                futures.append((op.get('id'), future))
            
            # Collect results
            for op_id, future in futures:
                try:
                    result = future.result(timeout=30)  # 30 second timeout
                    batch_results.append({
                        'id': op_id,
                        'success': True,
                        'result': result
                    })
                except Exception as e:
                    logger.error(f"Batch operation failed: {str(e)}")
                    batch_results.append({
                        'id': op_id,
                        'success': False,
                        'error': str(e)
                    })
            
            results.extend(batch_results)
        
        return results
    
    async def process_batch_async(self, operations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Process a batch of operations asynchronously
        
        Args:
            operations: List of operations to process
                Each operation should be a dict with:
                - 'function': Callable function to execute
                - 'args': Tuple of positional arguments
                - 'kwargs': Dict of keyword arguments
                - 'id': Optional identifier for the operation
                
        Returns:
            List of results corresponding to each operation
        """
        loop = asyncio.get_event_loop()
        results = []
        
        # Process in batches to avoid overwhelming the system
        for i in range(0, len(operations), self.max_batch_size):
            batch = operations[i:i + self.max_batch_size]
            batch_results = []
            
            # Submit all operations in the batch
            futures = []
            for op in batch:
                future = loop.run_in_executor(
                    self.executor,
                    self._run_with_args,
                    op['function'],
                    op.get('args', ()),
                    op.get('kwargs', {})
                )
                futures.append((op.get('id'), future))
            
            # Collect results
            for op_id, future in futures:
                try:
                    result = await asyncio.wait_for(future, timeout=30)  # 30 second timeout
                    batch_results.append({
                        'id': op_id,
                        'success': True,
                        'result': result
                    })
                except Exception as e:
                    logger.error(f"Batch operation failed: {str(e)}")
                    batch_results.append({
                        'id': op_id,
                        'success': False,
                        'error': str(e)
                    })
            
            results.extend(batch_results)
        
        return results
    
    def _run_with_args(self, func: Callable, args: Tuple, kwargs: Dict) -> Any:
        """
        Helper method to run a function with arguments
        
        Args:
            func: Function to execute
            args: Positional arguments
            kwargs: Keyword arguments
            
        Returns:
            Result of function execution
        """
        return func(*args, **kwargs)
    
    def parallelize_operations(self, operations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Execute multiple independent operations in parallel
        
        Args:
            operations: List of operations to execute in parallel
                Each operation should be a dict with:
                - 'function': Callable function to execute
                - 'args': Tuple of positional arguments
                - 'kwargs': Dict of keyword arguments
                - 'name': Name/identifier for the operation
                
        Returns:
            Dict mapping operation names to their results
        """
        # Submit all operations
        futures = {}
        for op in operations:
            future = self.executor.submit(
                op['function'],
                *op.get('args', ()),
                **op.get('kwargs', {})
            )
            futures[op['name']] = future
        
        # Collect results
        results = {}
        for name, future in futures.items():
            try:
                results[name] = {
                    'success': True,
                    'result': future.result(timeout=30)
                }
            except Exception as e:
                logger.error(f"Parallel operation {name} failed: {str(e)}")
                results[name] = {
                    'success': False,
                    'error': str(e)
                }
        
        return results
    
    def close(self):
        """Clean up resources"""
        self.executor.shutdown(wait=True)

# Global batch processor instance
batch_processor = BatchProcessor()