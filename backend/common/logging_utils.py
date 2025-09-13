"""
Logging utilities for the accounting system
"""
import logging
import functools
import traceback
from typing import Any, Dict, Optional
from django.conf import settings


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for the given name.
    
    Args:
        name: Logger name (usually __name__ or module path)
        
    Returns:
        Logger instance configured for the application
    """
    return logging.getLogger(name)


def log_api_request(logger: logging.Logger, request, response=None, extra_data: Optional[Dict] = None):
    """
    Log API request details for monitoring and debugging.
    
    Args:
        logger: Logger instance
        request: Django request object
        response: Django response object (optional)
        extra_data: Additional data to log
    """
    try:
        log_data = {
            'method': request.method,
            'path': request.path,
            'user': str(request.user) if hasattr(request, 'user') and request.user.is_authenticated else 'Anonymous',
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'ip_address': get_client_ip(request),
        }
        
        if response:
            log_data['status_code'] = response.status_code
            
        if extra_data:
            log_data.update(extra_data)
            
        logger.info(f"API Request: {log_data}")
        
    except Exception as e:
        logger.error(f"Error logging API request: {str(e)}")


def log_business_event(logger: logging.Logger, event_type: str, user, details: Dict[str, Any]):
    """
    Log important business events for audit trail.
    
    Args:
        logger: Logger instance
        event_type: Type of business event (e.g., 'transaction_created', 'bill_generated')
        user: User performing the action
        details: Event details
    """
    try:
        log_data = {
            'event_type': event_type,
            'user_id': user.id if user else None,
            'user_email': user.email if user else None,
            'details': details,
        }
        
        logger.info(f"Business Event: {log_data}")
        
    except Exception as e:
        logger.error(f"Error logging business event: {str(e)}")


def log_error_with_context(logger: logging.Logger, error: Exception, context: Optional[Dict] = None):
    """
    Log error with full context and stack trace.
    
    Args:
        logger: Logger instance
        error: Exception that occurred
        context: Additional context information
    """
    try:
        error_data = {
            'error_type': type(error).__name__,
            'error_message': str(error),
            'stack_trace': traceback.format_exc(),
        }
        
        if context:
            error_data['context'] = context
            
        logger.error(f"Error occurred: {error_data}")
        
    except Exception as e:
        logger.critical(f"Failed to log error: {str(e)}")


def get_client_ip(request) -> str:
    """
    Get the client IP address from the request.
    
    Args:
        request: Django request object
        
    Returns:
        Client IP address
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip or 'unknown'


def log_function_call(logger: Optional[logging.Logger] = None):
    """
    Decorator to log function calls with parameters and execution time.
    
    Usage:
        @log_function_call()
        def my_function(param1, param2):
            pass
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            func_logger = logger or get_logger(func.__module__)
            
            try:
                import time
                start_time = time.time()
                
                # Log function entry
                func_logger.debug(f"Entering {func.__name__} with args={args}, kwargs={kwargs}")
                
                # Execute function
                result = func(*args, **kwargs)
                
                # Log successful execution
                execution_time = time.time() - start_time
                func_logger.debug(f"Completed {func.__name__} in {execution_time:.3f}s")
                
                return result
                
            except Exception as e:
                # Log function error
                execution_time = time.time() - start_time
                func_logger.error(f"Error in {func.__name__} after {execution_time:.3f}s: {str(e)}")
                raise
                
        return wrapper
    return decorator


class SecurityLogger:
    """Security-focused logging utilities"""
    
    def __init__(self, logger_name: str = 'django.security'):
        self.logger = get_logger(logger_name)
    
    def log_failed_login(self, username: str, ip_address: str, reason: str = ''):
        """Log failed login attempts"""
        self.logger.warning(f"Failed login attempt: username={username}, ip={ip_address}, reason={reason}")
    
    def log_successful_login(self, user, ip_address: str):
        """Log successful logins"""
        self.logger.info(f"Successful login: user={user.email}, ip={ip_address}")
    
    def log_permission_denied(self, user, action: str, resource: str, ip_address: str):
        """Log permission denied events"""
        self.logger.warning(f"Permission denied: user={user.email}, action={action}, resource={resource}, ip={ip_address}")
    
    def log_suspicious_activity(self, description: str, user=None, ip_address: str = '', extra_data: Dict = None):
        """Log suspicious activities"""
        log_data = {
            'description': description,
            'user': user.email if user else 'anonymous',
            'ip_address': ip_address,
        }
        if extra_data:
            log_data.update(extra_data)
            
        self.logger.warning(f"Suspicious activity: {log_data}")


class PerformanceLogger:
    """Performance monitoring utilities"""
    
    def __init__(self, logger_name: str = 'accounting_system.performance'):
        self.logger = get_logger(logger_name)
    
    def log_slow_query(self, query: str, execution_time: float, threshold: float = 1.0):
        """Log slow database queries"""
        if execution_time > threshold:
            self.logger.warning(f"Slow query ({execution_time:.3f}s): {query}")
    
    def log_api_performance(self, endpoint: str, method: str, execution_time: float, status_code: int):
        """Log API performance metrics"""
        self.logger.info(f"API Performance: {method} {endpoint} - {execution_time:.3f}s - {status_code}")


# Pre-configured logger instances for common use cases
api_logger = get_logger('apps.api')
security_logger = SecurityLogger()
performance_logger = PerformanceLogger()
business_logger = get_logger('accounting_system.business')
error_logger = get_logger('accounting_system.errors')
