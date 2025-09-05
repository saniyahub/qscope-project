"""
Job Queue Utility for QScope Backend
Provides asynchronous job processing for heavy computations
"""

import threading
import queue
import time
import uuid
from typing import Dict, Any, Callable, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import json
import logging

logger = logging.getLogger(__name__)

class JobStatus(Enum):
    """Job status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class Job:
    """Job data structure"""
    id: str
    task: Callable
    args: tuple
    kwargs: dict
    status: JobStatus = JobStatus.PENDING
    result: Any = None
    error: Optional[str] = None
    created_at: float = 0
    started_at: Optional[float] = None
    completed_at: Optional[float] = None
    priority: int = 0  # Higher number means higher priority

class JobQueue:
    """
    Simple asynchronous job queue for processing heavy computations
    """
    
    def __init__(self, max_workers: int = 4):
        """
        Initialize the job queue
        
        Args:
            max_workers: Maximum number of concurrent worker threads
        """
        self.max_workers = max_workers
        self.jobs: Dict[str, Job] = {}
        self.job_queue = queue.PriorityQueue()  # Priority queue (lower number = higher priority)
        self.workers = []
        self.running = False
        self.lock = threading.Lock()
        
    def start(self):
        """Start the job queue workers"""
        if self.running:
            return
            
        self.running = True
        
        # Start worker threads
        for i in range(self.max_workers):
            worker = threading.Thread(target=self._worker, name=f"JobWorker-{i}")
            worker.daemon = True
            worker.start()
            self.workers.append(worker)
            
        logger.info(f"Job queue started with {self.max_workers} workers")
    
    def stop(self):
        """Stop the job queue workers"""
        self.running = False
        
        # Wait for workers to finish
        for worker in self.workers:
            worker.join(timeout=5)
            
        self.workers.clear()
        logger.info("Job queue stopped")
    
    def submit_job(self, task: Callable, *args, priority: int = 0, **kwargs) -> str:
        """
        Submit a job to the queue
        
        Args:
            task: Function to execute
            *args: Positional arguments for the task
            priority: Job priority (higher number = higher priority)
            **kwargs: Keyword arguments for the task
            
        Returns:
            Job ID
        """
        job_id = str(uuid.uuid4())
        job = Job(
            id=job_id,
            task=task,
            args=args,
            kwargs=kwargs,
            created_at=time.time(),
            priority=-priority  # Negative for priority queue (lower number = higher priority)
        )
        
        with self.lock:
            self.jobs[job_id] = job
            self.job_queue.put((job.priority, job_id))
            
        logger.info(f"Job {job_id} submitted with priority {priority}")
        return job_id
    
    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the status of a job
        
        Args:
            job_id: Job ID
            
        Returns:
            Job status information or None if job not found
        """
        with self.lock:
            if job_id not in self.jobs:
                return None
                
            job = self.jobs[job_id]
            return {
                'id': job.id,
                'status': job.status.value,
                'result': job.result,
                'error': job.error,
                'created_at': job.created_at,
                'started_at': job.started_at,
                'completed_at': job.completed_at,
                'priority': job.priority
            }
    
    def cancel_job(self, job_id: str) -> bool:
        """
        Cancel a job if it hasn't started processing yet
        
        Args:
            job_id: Job ID
            
        Returns:
            True if job was cancelled, False otherwise
        """
        with self.lock:
            if job_id not in self.jobs:
                return False
                
            job = self.jobs[job_id]
            if job.status == JobStatus.PENDING:
                job.status = JobStatus.CANCELLED
                job.completed_at = time.time()
                return True
                
        return False
    
    def _worker(self):
        """Worker thread function"""
        while self.running:
            try:
                # Get job from queue (blocking with timeout)
                priority, job_id = self.job_queue.get(timeout=1)
                
                with self.lock:
                    if job_id not in self.jobs:
                        self.job_queue.task_done()
                        continue
                        
                    job = self.jobs[job_id]
                    
                    # Check if job was cancelled
                    if job.status == JobStatus.CANCELLED:
                        self.job_queue.task_done()
                        continue
                        
                    # Mark job as processing
                    job.status = JobStatus.PROCESSING
                    job.started_at = time.time()
                
                logger.info(f"Processing job {job_id}")
                
                try:
                    # Execute the job
                    result = job.task(*job.args, **job.kwargs)
                    
                    # Update job status
                    with self.lock:
                        job.result = result
                        job.status = JobStatus.COMPLETED
                        job.completed_at = time.time()
                        
                    logger.info(f"Job {job_id} completed successfully")
                    
                except Exception as e:
                    # Handle job execution error
                    error_msg = str(e)
                    logger.error(f"Job {job_id} failed: {error_msg}")
                    
                    with self.lock:
                        job.error = error_msg
                        job.status = JobStatus.FAILED
                        job.completed_at = time.time()
                        
            except queue.Empty:
                # No jobs available, continue waiting
                continue
            except Exception as e:
                logger.error(f"Worker error: {str(e)}")
            finally:
                # Mark task as done
                if 'job_id' in locals():
                    self.job_queue.task_done()
    
    def get_queue_stats(self) -> Dict[str, Any]:
        """Get queue statistics"""
        with self.lock:
            pending_count = sum(1 for job in self.jobs.values() if job.status == JobStatus.PENDING)
            processing_count = sum(1 for job in self.jobs.values() if job.status == JobStatus.PROCESSING)
            completed_count = sum(1 for job in self.jobs.values() if job.status == JobStatus.COMPLETED)
            failed_count = sum(1 for job in self.jobs.values() if job.status == JobStatus.FAILED)
            cancelled_count = sum(1 for job in self.jobs.values() if job.status == JobStatus.CANCELLED)
            
            return {
                'total_jobs': len(self.jobs),
                'pending': pending_count,
                'processing': processing_count,
                'completed': completed_count,
                'failed': failed_count,
                'cancelled': cancelled_count,
                'queue_size': self.job_queue.qsize(),
                'workers': self.max_workers
            }

# Global job queue instance
job_queue = JobQueue()