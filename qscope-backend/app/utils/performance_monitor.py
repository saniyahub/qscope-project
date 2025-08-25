"""
Performance Monitor Utility for Qscope Backend
Simple performance monitoring and metrics collection
"""

import psutil
import time
from typing import Dict, Any
from datetime import datetime

class PerformanceMonitor:
    """
    Basic performance monitoring utility
    """
    
    def __init__(self):
        """Initialize performance monitor"""
        self.start_time = time.time()
    
    def get_current_metrics(self) -> Dict[str, Any]:
        """
        Get current system performance metrics
        
        Returns:
            Dictionary containing performance metrics
        """
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=0.1)
            cpu_count = psutil.cpu_count()
            
            # Memory metrics
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_available = memory.available
            memory_total = memory.total
            
            # Disk metrics (simplified)
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            
            # Uptime
            uptime = time.time() - self.start_time
            
            return {
                'timestamp': datetime.utcnow().isoformat(),
                'cpu': {
                    'percent': cpu_percent,
                    'count': cpu_count
                },
                'memory': {
                    'percent': memory_percent,
                    'available': memory_available,
                    'total': memory_total,
                    'used': memory_total - memory_available
                },
                'disk': {
                    'percent': disk_percent,
                    'total': disk.total,
                    'free': disk.free,
                    'used': disk.used
                },
                'uptime_seconds': uptime,
                'status': 'healthy' if cpu_percent < 80 and memory_percent < 80 else 'warning'
            }
            
        except Exception as e:
            return {
                'timestamp': datetime.utcnow().isoformat(),
                'error': str(e),
                'status': 'error'
            }
    
    def get_system_info(self) -> Dict[str, Any]:
        """Get basic system information"""
        try:
            return {
                'platform': psutil.platform,
                'architecture': psutil.cpu_count(),
                'python_version': psutil.version_info,
                'boot_time': datetime.fromtimestamp(psutil.boot_time()).isoformat()
            }
        except Exception as e:
            return {
                'error': str(e)
            }