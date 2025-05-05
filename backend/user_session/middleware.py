import logging
from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings

# Set up logging
logger = logging.getLogger(__name__)

class CORSMiddleware(MiddlewareMixin):
    def process_request(self, request):
        """Process the request before it reaches the view."""
        # Log request details for debugging
        logger.debug(f"Request: {request.method} {request.path}")
        logger.debug(f"Request Origin: {request.headers.get('Origin', 'None')}")
        
        # Handle preflight OPTIONS requests
        if request.method == 'OPTIONS':
            response = HttpResponse()
            self._add_cors_headers(response, request)
            return response
        return None

    def process_response(self, request, response):
        """Process the response after the view is called."""
        self._add_cors_headers(response, request)
        
        # Log response for debugging
        logger.debug(f"Response status: {response.status_code}")
        logger.debug(f"Response headers: {dict(response.headers)}")
        
        return response

    def _add_cors_headers(self, response, request):
        """Add CORS headers to the response."""
        # Get origin from request
        origin = request.headers.get('Origin', '')
        
        # Get allowed origins from Django settings if available
        allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:8000',
            'https://splendorous-melba-fc5384.netlify.app',
            'https://devserver-main--splendorous-melba-fc5384.netlify.app',
        ])
        
        # Also support the CORS_ALLOW_ALL_ORIGINS setting
        allow_all = getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False)
        
        # Check for netlify.app origins and add them if needed
        if 'netlify.app' in origin and origin not in allowed_origins:
            allowed_origins.append(origin)
            logger.info(f"Auto-adding Netlify origin to allowed list: {origin}")
        
        # Set CORS headers based on settings and request
        if origin in allowed_origins:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
        elif allow_all or not origin:
            # If CORS_ALLOW_ALL_ORIGINS is True, use wildcard (not for credentials)
            response['Access-Control-Allow-Origin'] = '*'
        
        # Get allowed methods and headers from settings
        allowed_methods = getattr(settings, 'CORS_ALLOW_METHODS', [
            'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'
        ])
        allowed_headers = getattr(settings, 'CORS_ALLOW_HEADERS', [
            'Content-Type', 'Authorization', 'X-Requested-With', 'Accept'
        ])
        
        # Set the headers
        response['Access-Control-Allow-Methods'] = ', '.join(allowed_methods)
        
        # Handle headers differently based on the CORS spec
        if isinstance(allowed_headers, list):
            response['Access-Control-Allow-Headers'] = ', '.join(allowed_headers)
        else:
            # If it's a wildcard or non-list, pass it through
            response['Access-Control-Allow-Headers'] = allowed_headers
            
        response['Access-Control-Max-Age'] = '86400'  # 24 hours 