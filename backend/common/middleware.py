"""
Logging middleware for the accounting system
"""
import time
import uuid
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from common.logging_utils import get_logger, get_client_ip


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all HTTP requests and responses for monitoring and debugging.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = get_logger('apps.requests')
        super().__init__(get_response)
    
    def process_request(self, request):
        """Process incoming request"""
        # Generate unique request ID for tracing
        request.request_id = str(uuid.uuid4())[:8]
        request.start_time = time.time()
        
        # Skip logging for certain paths to reduce noise
        skip_paths = [
            '/admin/jsi18n/',
            '/static/',
            '/media/',
            '/favicon.ico',
        ]
        
        if any(request.path.startswith(path) for path in skip_paths):
            request.skip_logging = True
            return None
        
        request.skip_logging = False
        
        # Log request details
        if not request.skip_logging:
            request_data = {
                'request_id': request.request_id,
                'method': request.method,
                'path': request.path,
                'query_params': dict(request.GET),
                'user': str(request.user) if hasattr(request, 'user') and request.user.is_authenticated else 'Anonymous',
                'ip_address': get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', '')[:200],  # Truncate long user agents
                'content_type': request.META.get('CONTENT_TYPE', ''),
            }
            
            # Don't log sensitive data in request body
            if request.method in ['POST', 'PUT', 'PATCH'] and 'application/json' in request.content_type:
                try:
                    import json
                    body = json.loads(request.body.decode('utf-8'))
                    # Remove sensitive fields
                    sensitive_fields = ['password', 'token', 'secret', 'key']
                    cleaned_body = {k: '***' if any(field in k.lower() for field in sensitive_fields) else v 
                                  for k, v in body.items()}
                    request_data['body'] = cleaned_body
                except (json.JSONDecodeError, UnicodeDecodeError):
                    request_data['body'] = '<non-json data>'
            
            self.logger.info(f"Request started: {request_data}")
        
        return None
    
    def process_response(self, request, response):
        """Process outgoing response"""
        if getattr(request, 'skip_logging', True):
            return response
        
        # Calculate request duration
        duration = time.time() - getattr(request, 'start_time', time.time())
        
        response_data = {
            'request_id': getattr(request, 'request_id', 'unknown'),
            'status_code': response.status_code,
            'duration_ms': round(duration * 1000, 2),
            'response_size': len(response.content) if hasattr(response, 'content') else 0,
        }
        
        # Log level based on status code
        if response.status_code >= 500:
            log_level = 'error'
        elif response.status_code >= 400:
            log_level = 'warning'
        else:
            log_level = 'info'
        
        getattr(self.logger, log_level)(f"Request completed: {response_data}")
        
        # Log slow requests
        if duration > getattr(settings, 'SLOW_REQUEST_THRESHOLD', 2.0):
            self.logger.warning(f"Slow request detected: {response_data}")
        
        return response
    
    def process_exception(self, request, exception):
        """Process unhandled exceptions"""
        if getattr(request, 'skip_logging', True):
            return None
        
        duration = time.time() - getattr(request, 'start_time', time.time())
        
        exception_data = {
            'request_id': getattr(request, 'request_id', 'unknown'),
            'exception_type': type(exception).__name__,
            'exception_message': str(exception),
            'duration_ms': round(duration * 1000, 2),
        }
        
        self.logger.error(f"Request failed with exception: {exception_data}", exc_info=True)
        
        return None


class ErrorLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to capture and log 404 and other HTTP errors.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = get_logger('apps.errors')
        super().__init__(get_response)
    
    def process_response(self, request, response):
        """Log HTTP errors"""
        # Log 404 errors
        if response.status_code == 404:
            error_data = {
                'status_code': response.status_code,
                'path': request.path,
                'method': request.method,
                'user': str(request.user) if hasattr(request, 'user') and request.user.is_authenticated else 'Anonymous',
                'ip_address': get_client_ip(request),
                'referer': request.META.get('HTTP_REFERER', ''),
            }
            self.logger.info(f"404 Not Found: {error_data}")
        
        # Log other client errors (4xx)
        elif 400 <= response.status_code < 500:
            error_data = {
                'status_code': response.status_code,
                'path': request.path,
                'method': request.method,
                'user': str(request.user) if hasattr(request, 'user') and request.user.is_authenticated else 'Anonymous',
                'ip_address': get_client_ip(request),
            }
            self.logger.warning(f"Client error: {error_data}")
        
        return response


class SecurityLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log security-related events.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = get_logger('django.security')
        super().__init__(get_response)
    
    def process_request(self, request):
        """Check for suspicious requests"""
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Log suspicious patterns
        suspicious_patterns = [
            'sqlmap',
            'nmap',
            'nikto',
            'burp',
            'wget',
            'curl',
            '../',
            '<script>',
            'union select',
            'drop table',
        ]
        
        # Check URL and user agent for suspicious patterns
        request_text = f"{request.path} {user_agent}".lower()
        if any(pattern in request_text for pattern in suspicious_patterns):
            self.logger.warning(f"Suspicious request detected: path={request.path}, ip={ip_address}, ua={user_agent[:100]}")
        
        # Log admin access attempts
        if request.path.startswith('/admin/') and not request.user.is_authenticated:
            self.logger.info(f"Unauthenticated admin access attempt: ip={ip_address}, path={request.path}")
        
        return None
