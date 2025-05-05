class CorsHeaderMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Add CORS headers
        netlify_origin = 'https://splendorous-melba-fc5384.netlify.app'
        local_origins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://localhost:3000',
            'https://127.0.0.1:3000'
        ]
        
        # Get the Origin header from the request
        origin = request.META.get('HTTP_ORIGIN', '')
        
        # Always include Access-Control-Allow-Origin for preflight requests
        if request.method == 'OPTIONS':
            response['Access-Control-Allow-Origin'] = origin or '*'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
            response['Access-Control-Allow-Headers'] = '*'  # Allow all headers
            response['Access-Control-Max-Age'] = '86400'  # 24 hours
            return response
        
        # Set the proper CORS headers based on the origin for regular requests
        if origin == netlify_origin or origin in local_origins:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
            response['Access-Control-Allow-Headers'] = '*'  # Allow all headers
            
            # Only set Allow-Credentials if we're setting a specific origin (not wildcard)
            response['Access-Control-Allow-Credentials'] = 'true'
        # If origin is not in our list but is present, still allow it for testing
        elif origin:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
            response['Access-Control-Allow-Headers'] = '*'
            
        return response 